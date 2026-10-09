import {
  CommonActions,
  type NavigationAction,
  type NavigationState,
} from '@react-navigation/native';
import { create } from 'zustand';
import { navigationRef } from '@navigation/navigationRef';

/**
 * Cross-tab navigation history.
 *
 * React Navigation keeps one stack per tab, so the stock `goBack()` can only pop
 * the stack you happen to be in. That breaks the flow this app actually has: hop
 * from a nested Orders screen to another tab, open something there, press back —
 * and you land wherever that tab's own stack says, not on the screen you left.
 *
 * So history is recorded here instead: every navigation produces a
 * {@link HistoryLocation}, and back walks that list. A location records the tab
 * *and* the navigator key that owns the tab, which is what lets the jump target a
 * tab that is not currently focused.
 */

export interface HistoryLocation {
  /** Bottom-tab route name, or '' when the screen sits outside any tab bar. */
  tab: string;
  /** Key of the tab navigator, so a jump can target it even when unfocused. */
  tabsKey?: string;
  /** Key of the navigator that directly owns `screen` (the tab's own stack). */
  stackKey?: string;

  screen: string;
  /** Route key of the screen itself; unique per screen instance. */
  screenKey?: string;
  params?: object;
}

type RouteNode = {
  key?: string;
  name?: string;
  /** Navigator kind: 'tab' | 'stack' | 'drawer'. */
  type?: string;
  params?: object;
  index?: number;
  routes?: RouteNode[];
  state?: RouteNode;
};

/**
 * Walks the active branch of the navigation tree and reports where "here" is.
 *
 * The path holds one entry per navigator we descended through, so the last entry
 * is the tab and the one before it is the tab navigator's route — which is the
 * key a cross-tab jump has to target. Screens outside a tab bar produce a
 * one-entry path, and get an empty `tab`.
 */
export function deriveLocation(root: RouteNode | undefined): HistoryLocation | null {
  if (!root?.routes?.length) return null;

  // One entry per navigator we are inside: its key, its type, and the route that
  // led into it. The chain starts at the root navigator, which may itself be a
  // tab bar (that is the case whenever a tab navigator is mounted directly, e.g.
  // in tests), so its own `routeName` is undefined.
  const chain: { navKey?: string; navType?: string; routeName?: string }[] = [
    { navKey: root.key, navType: root.type },
  ];
  let node: RouteNode | undefined = root;
  let screen: RouteNode | undefined;

  while (node?.routes?.length) {
    const active: RouteNode | undefined = node.routes[node.index ?? 0];
    if (!active) break;

    if (active.state?.routes?.length) {
      // Descend into the navigator this route opens and remember how we got there.
      node = active.state;
      chain.push({
        navKey: node.key,
        navType: node.type,
        routeName: active.name,
      });
    } else {
      screen = active;
      break;
    }
  }

  if (!screen?.name) return null;

  // The deepest tab navigator owns the tab routes; the tab we are on is the
  // route *inside* it, which is the next entry along the chain.
  // Index 0 is the root navigator, so it only counts when the root itself is a
  // tab bar — the shape produced when a tab navigator is mounted on its own.
  let tabIndex = -1;
  for (let index = 0; index < chain.length; index += 1) {
    if (chain[index].navType === 'tab') tabIndex = index;
  }

  // When the tab bar is the last navigator in the chain, the tab has no stack of
  // its own (a single-screen tab such as Orders or More) and the screen we
  // landed on *is* the tab route.
  const tabIsTheScreen = tabIndex >= 0 && tabIndex === chain.length - 1;

  return {
    tab:
      tabIndex >= 0
        ? tabIsTheScreen
          ? (screen.name ?? '')
          : (chain[tabIndex + 1]?.routeName ?? '')
        : '',
    tabsKey: tabIndex >= 0 ? chain[tabIndex].navKey : undefined,
    stackKey: chain[chain.length - 1].navKey,
    screen: screen.name,
    screenKey: screen.key,
    params: screen.params,
  };
}

/** Route keys are unique per screen instance, so they beat names here. */
export function isSameLocation(
  a?: HistoryLocation | null,
  b?: HistoryLocation | null,
): boolean {
  if (!a || !b) return false;
  if (a.screenKey !== undefined && b.screenKey !== undefined) {
    return a.screenKey === b.screenKey;
  }
  return a.screen === b.screen && a.tab === b.tab;
}

function sameRoute(a: HistoryLocation, b: HistoryLocation): boolean {
  if (a.screenKey && b.screenKey) return a.screenKey === b.screenKey;
  return a.screen === b.screen && a.tab === b.tab;
}

interface NavigationHistoryState {
  past: HistoryLocation[];
  present: HistoryLocation | null;
  /** Records a navigation, or unwinds the history when the user popped. */
  remember: (next: HistoryLocation | null) => void;
  /** Steps back one entry and returns it, or null when nothing precedes here. */
  pop: () => HistoryLocation | null;
  reset: () => void;
}

/** Bounded so a long session cannot grow this without limit. */
const HISTORY_LIMIT = 40;

export const useNavigationHistory = create<NavigationHistoryState>((set, get) => ({
  past: [],
  present: null,

  remember: next => {
    const { past, present } = get();
    if (!next) {
      set({ past: [], present: null });
      return;
    }
    if (isSameLocation(present, next)) return;

    // Landing on an entry we already hold means the user popped (a navbar back,
    // an iOS swipe or the system back): drop everything after it instead of
    // pushing a duplicate.
    const index = past.findIndex(entry => sameRoute(entry, next));
    if (index >= 0) {
      set({ past: past.slice(0, index), present: next });
      return;
    }

    if (!present) {
      set({ present: next });
      return;
    }
    const nextPast = [...past, present];
    set({
      past: nextPast.length > HISTORY_LIMIT ? nextPast.slice(-HISTORY_LIMIT) : nextPast,
      present: next,
    });
  },

  pop: () => {
    const { past } = get();
    if (!past.length) return null;
    const entry = past[past.length - 1];
    set({ past: past.slice(0, -1), present: entry });
    return entry;
  },

  reset: () => set({ past: [], present: null }),
}));

/**
 * Sends the user back to a recorded location, tab hop included. Returns false
 * when there is nothing to do (no container, or no entry), so callers can fall
 * back to the navigator's own `goBack()`.
 */
/**
 * Finds the screen a tab shows at its base.
 *
 * A tab entry recorded while the tab was first focused can name the *tab* rather
 * than a screen inside it: React Navigation builds a tab's stack lazily, so at
 * record time the tab may have had no child state at all. Sending a NAVIGATE for
 * that tab name into the tab's own stack matches nothing and is silently
 * dropped, so the real base screen is resolved from the live tree at jump time.
 */
function findTabBaseScreen(
  node: RouteNode | undefined,
  tabName: string,
): string | undefined {
  if (!node?.routes?.length) return undefined;

  const match = node.routes.find(route => route.name === tabName);
  if (match) {
    // The first entry of a tab's own stack is its base screen.
    return match.state?.routes?.[0]?.name;
  }

  // Not on this level: look one branch deeper at each time.
  for (const route of node.routes) {
    const nested = findTabBaseScreen(route.state, tabName);
    if (nested) return nested;
  }
  return undefined;
}

export function goToLocation(
  location: HistoryLocation,
  fallbackNavigation?: {
    dispatch: (action: NavigationAction) => void;
    navigate: (name: never, params?: never) => void;
    getState: () => unknown;
  },
): boolean {
  const ref = navigationRef;
  // Prefer the container ref (it reaches navigators that are not focused), but a
  // screen's own navigation object is an equally good handle and keeps this
  // working wherever the container is mounted without that ref.
  const refReady = ref?.isReady() === true;
  const dispatch: ((action: NavigationAction) => void) | null = refReady
    ? action => ref?.dispatch(action)
    : fallbackNavigation
      ? action => fallbackNavigation.dispatch(action)
      : null;
  if (!dispatch) return false;

  if (location.tab && location.tabsKey) {
    // Address the tab by name and let the action bubble: the first navigator
    // that owns a route with that name is the tab bar, which then routes
    // `screen` into that tab's own stack. This is the same hop
    // `useBusinessNavigation` performs for cross-tab navigation, and it works
    // whether or not the destination tab is the focused one. Passing an explicit
    // `target` instead was tried and silently swallowed the nested `screen`.
    const resolvedScreen =
      location.screen === location.tab
        ? ((ref?.getRootState
            ? findTabBaseScreen(ref.getRootState() as RouteNode, location.tab)
            : undefined) ?? location.screen)
        : location.screen;

    // `navigate(name, params)` — passing a single `{ name, params }` object is
    // the deprecated signature and logs a warning on every cross-tab back.
    dispatch(
      CommonActions.navigate(location.tab, {
        screen: resolvedScreen,
        params: location.params,
      }) as NavigationAction,
    );
    return true;
  }

  const navigate = refReady
    ? (name: string, params?: object) =>
        (ref?.navigate as unknown as (n: string, p?: object) => void)(name, params)
    : fallbackNavigation
      ? (name: string, params?: object) =>
          (fallbackNavigation.navigate as unknown as (n: string, p?: object) => void)(
            name,
            params,
          )
      : null;
  if (!navigate) return false;
  navigate(location.screen, location.params);
  return true;
}

/** The live navigation handle a back press can consult, when the caller has one. */
interface LiveNavigation {
  canGoBack?: () => boolean;
}

/**
 * Decides whether this back press needs the history at all.
 *
 * The native `goBack()` is already right for a plain stack and for a pop inside
 * one tab's own stack — it keeps the platform animation and never duplicates a
 * screen. So the rule is: **if the navigator itself can pop, it pops.** History
 * is only consulted at a true root, where per-tab stacks have nothing to pop and
 * the native back would do nothing. That is the one case per-tab stacks get
 * wrong — the origin was a *different* tab.
 *
 * Why the live navigator gets the first word: the recorded history can go stale
 * when a route remounts under a new key (a screen reopened after a pop, a stack
 * rebuilt), and a stale foreign-tab entry on top would otherwise hijack an
 * in-stack pop — sending you to another tab instead of the screen underneath.
 * `canGoBack()` reads the real state, so it is immune to that. Returns the entry
 * to jump to, or null to let the caller use the navigator's own back.
 */
export function takeHistoryEntryForBack(
  navigation?: LiveNavigation,
): HistoryLocation | null {
  // The navigator can pop: let it. No recorded location can outvote the real one.
  if (navigation?.canGoBack) {
    try {
      if (navigation.canGoBack()) return null;
    } catch {
      // A navigator that is being torn down cannot answer; fall through to the
      // recorded history rather than dropping the press.
    }
  }

  const { past } = useNavigationHistory.getState();
  if (!past.length) return null;

  const entry = past[past.length - 1];
  // Outside a tab bar: an ordinary stack pop, the navigator handles it.
  if (!entry.tab) return null;
  // Same tab stack: still an ordinary pop.
  const current = useNavigationHistory.getState().present;
  if (current?.stackKey && current.stackKey === entry.stackKey) return null;

  useNavigationHistory.getState().pop();
  return entry;
}

/**
 * Resets a tab's own stack back to its first screen. This is what a re-tap on the
 * already-focused tab does: the tab keeps whatever nested screen it was on when
 * you left and came back (that behaviour is deliberate), but asking for the tab
 * again means "take me to its base".
 */
export function resetTabStackToRoot(
  dispatch: (action: NavigationAction) => void,
  // Typed loosely on purpose: the tab bar hands over the route object, whose
  // `state` is a readonly navigator state from React Navigation's own types.
  tabRoute: { key?: string; state?: unknown } | undefined,
): boolean {
  const nested = tabRoute?.state as NavigationState | undefined;
  if (!nested?.routes?.length || nested.routes.length < 2) return false;

  // Keep only the tab's first screen, which pops every nested screen it had
  // accumulated while leaving the tab itself mounted (and therefore focused)
  // exactly as it was.
  dispatch({
    type: 'RESET',
    payload: { routes: [nested.routes[0]] },
    state: { ...nested, index: 0, routes: [nested.routes[0]] } as NavigationState,
    target: tabRoute?.key,
  } as unknown as NavigationAction);
  return true;
}

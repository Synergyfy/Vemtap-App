import { resolveNotificationUrl } from '@navigation/notificationRoutes';
import { navigationRef } from '@navigation/navigationRef';
import { useAuthStore } from '@store/authStore';
import { logger } from '@utils/logger';

/**
 * A tap that arrived before it could be acted on.
 *
 * On a cold launch from a notification the payload is read during boot, while
 * the app is still mounting: `getLastNotificationResponseAsync` resolves part
 * way through `initPushNotifications`, and the navigation container only exists
 * once the boot gate clears and fonts have settled. Whether the tap lands
 * before or after that is a race, so a tap that arrives early is parked here
 * and replayed rather than dropped — otherwise the same notification deep-links
 * or silently does nothing depending on device speed.
 *
 * The `url` is stored rather than the resolved target because the destination
 * depends on the active mode, and that can change between the tap and the
 * replay. Resolving at the last moment is what keeps a business tap from
 * landing on the consumer stack.
 */
let pendingUrl: string | null = null;

/** Detaches the state listener once there is nothing left to replay. */
let unsubscribe: (() => void) | null = null;

/**
 * Whether the root stack can actually render `name`.
 *
 * `RootNavigator` registers `AppStack` only while authenticated, so a signed-out
 * session has no route to navigate to and the attempt would throw rather than
 * no-op.
 */
function hasRootRoute(name: string): boolean {
  const state = navigationRef?.getRootState?.();
  // The business setup flow is registered for every session but is only in
  // the history once opened, so its presence is checked by name.
  if (name === 'BusinessSetup') {
    return Array.isArray(state?.routeNames) && state.routeNames.includes(name);
  }
  const routes = state?.routes;
  return Array.isArray(routes) && routes.some(route => route.name === name);
}

type Outcome = 'navigated' | 'waiting' | 'dropped';

function tryNavigate(url: string): Outcome {
  const target = resolveNotificationUrl(url);
  if (!target) return 'dropped';

  const route = routeFromTarget(target);
  if (!route) return 'dropped';

  if (navigationRef?.isReady?.() && hasRootRoute(route.name)) {
    // `navigate` is generic over the param list, so a union of two differently
    // shaped destinations never matches a single signature. The route and its
    // params are built together just above and only ever `AppStack` or
    // `BusinessTabs`, both real routes of the root stack.
    (navigationRef.navigate as (name: string, params?: object) => void)(
      route.name,
      route.params,
    );
    return 'navigated';
  }

  // A signed-out session has nowhere to land a notification addressed to a
  // session that no longer exists. Parked until the next sign-in it would open
  // the new account's screen from the old account's notification, so it is
  // dropped instead.
  if (useAuthStore.getState().status !== 'authenticated') return 'dropped';

  // Signed in but the container has not settled yet — keep waiting.
  return 'waiting';
}

function release() {
  unsubscribe?.();
  unsubscribe = null;
  pendingUrl = null;
}

/**
 * Replay the parked tap, if there is one and it can land now.
 *
 * Bound to navigation state rather than a one-shot "ready" callback: the
 * container going live is not observable directly in react-navigation 7, and
 * state changes are exactly the moments a route it needs may have appeared.
 */
function onNavigationStateChange() {
  const url = pendingUrl;
  if (!url) {
    release();
    return;
  }

  const outcome = tryNavigate(url);
  if (outcome === 'waiting') return;

  release();
  if (outcome === 'dropped') {
    logger.info('push', 'Parked notification tap had no destination to open');
  }
}

function park(url: string) {
  pendingUrl = url;
  if (unsubscribe) return;
  // `navigationRef` is undefined under test mocks and before any navigator has
  // mounted, so both the subscription and its teardown are optional.
  const off = navigationRef?.addListener?.('state', onNavigationStateChange);
  unsubscribe = typeof off === 'function' ? off : null;
}

/**
 * Turns a tapped push into navigation.
 *
 * Lives in a service rather than a screen because the tap arrives outside
 * React — the app may be backgrounded, killed, or deep in any navigator when the
 * payload lands — so it cannot go through a hook and reaches for `navigationRef`
 * instead. It resolves the payload's `url` through the same
 * `resolveNotificationUrl` the notification centre uses, so a push and the
 * in-app row it mirrors can never disagree about where a tap goes.
 *
 * The destination differs by shell: a customer order and a business order are
 * one `/orders/<id>` but two detail screens, and the active mode picks which.
 * That decision is made at tap time from the store, not baked in, because the
 * same user can be looking at either side when the notification arrives.
 *
 * An unresolvable URL is a no-op, not a guess — the same allowlist the centre
 * uses, for the same reason: an admin-broadcast path written for the web panel
 * has no in-app destination, and navigating to it blindly dead-ends the tap.
 */
function routeFromTarget(target: NonNullable<ReturnType<typeof resolveNotificationUrl>>) {
  const mode = useAuthStore.getState().activeMode;

  // Plan and verification links only exist on the business side.
  if (target.kind === 'plan' || target.kind === 'verification') {
    if (mode !== 'business') return null;
    return {
      name: 'BusinessSetup' as const,
      params: {
        screen:
          target.kind === 'plan'
            ? ('BusinessPlanTrialOverview' as const)
            : ('BusinessVerificationStatusCenter' as const),
      },
    };
  }

  if (mode === 'business') {
    if (target.kind === 'order') {
      return {
        name: 'BusinessTabs' as const,
        params: {
          screen: 'BusinessOrders',
          params: { screen: 'BusinessOrderDetail', params: { orderId: target.id } },
        },
      };
    }
    return {
      name: 'BusinessTabs' as const,
      params: {
        screen: 'BusinessMessages',
        params: { screen: 'BusinessConversation', params: { threadId: target.id } },
      },
    };
  }

  // Consumer: the personal hub is a stack nested inside the Account tab, which
  // sits under AppStack — a sibling tab cannot be reached by bubbling, so the
  // whole chain has to be addressed from the root.
  if (target.kind === 'order') {
    return {
      name: 'AppStack' as const,
      params: {
        screen: 'Tabs',
        params: {
          screen: 'Account',
          params: {
            screen: 'PersonalHub',
            params: {
              screen: 'PersonalOrderDetail',
              params: { orderId: target.id },
            },
          },
        },
      },
    };
  }
  return {
    name: 'AppStack' as const,
    params: {
      screen: 'Tabs',
      params: {
        screen: 'Account',
        params: {
          screen: 'PersonalHub',
          params: {
            screen: 'PersonalConversation',
            params: { threadId: target.id },
          },
        },
      },
    },
  };
}

/**
 * Navigate for a tapped push payload.
 *
 * `url` is the field the backend puts on every Expo message (`data.url`), built
 * from the notification's `actionUrl` or synthesised from `threadId`.
 *
 * Returns true when the tap was acted on immediately, false when it was parked
 * for replay or had no destination. A false return is not a failure: on a cold
 * launch the navigation container frequently is not up yet, and the parked tap
 * is replayed from `onNavigationStateChange`.
 */
export function openNotificationUrl(url: string | undefined): boolean {
  if (!url) return false;

  const outcome = tryNavigate(url);

  if (outcome === 'navigated') {
    // A fresh tap supersedes anything still parked — holding a stale one would
    // yank the user away from where they just navigated to.
    release();
    return true;
  }

  if (outcome === 'dropped') {
    release();
    logger.info('push', `No in-app destination for tapped notification: ${url}`);
    return false;
  }

  park(url);
  logger.info('push', 'Parked a notification tap until navigation is ready');
  return false;
}

/** Exposed for tests: whether a tap is waiting for a navigable moment. */
export function hasPendingNotificationTap(): boolean {
  return pendingUrl !== null;
}

/** Exposed for tests: drop anything parked, without navigating. */
export function clearPendingNotificationTap(): void {
  release();
}

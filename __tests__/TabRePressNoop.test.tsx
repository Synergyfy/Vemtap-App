import {
  businessTabBarRePress,
  tabRePressListenersFor,
} from '@navigation/navigationHistory';

/**
 * Re-tapping the focused bottom tab: unwind it to the base screen of its stack,
 * *unless* it already rests there — in which case the press does nothing,
 * because rebuilding the tab would unmount and remount a screen the user is
 * already looking at.
 *
 * The base-screen decision reads the stack under a tab out of the serialized
 * root tree, which a navigator's own live state does not carry, so it goes
 * through the container ref. Here that ref stands in with a state each test sets.
 */

let mockRootState: unknown;

jest.mock('@navigation/navigationRef', () => ({
  get navigationRef() {
    return {
      isReady: () => true,
      getRootState: () => mockRootState,
    };
  },
}));

type Route = {
  name: string;
  key: string;
  params?: object;
  state?: { index: number; routes: { name: string; key: string }[] };
};

/** A root tree holding the given tab routes. */
function rootStateWith(routes: Route[]) {
  return { index: 0, routes, type: 'stack' };
}

/** The tab route as the tab state holds it: named, with no nested stack. */
function tabStateRoute(key: string) {
  return { name: key, key };
}

/** The tab navigator's own state, which is what both re-press paths dispatch against. */
function tabState(...keys: string[]) {
  return { index: 0, routes: keys.map(tabStateRoute) };
}

/** The Account tab resting on its base screen. */
const restingAccount: Route = {
  name: 'Account',
  key: 'tab-acc',
  state: { index: 0, routes: [{ name: 'AccountHome', key: 'AccountHome-1' }] },
};

beforeEach(() => {
  mockRootState = undefined;
});

describe('businessTabBarRePress', () => {
  it('does nothing when the tab already rests on its base screen', () => {
    mockRootState = rootStateWith([restingAccount]);

    const dispatch = jest.fn();
    const handled = businessTabBarRePress(
      dispatch,
      tabState('tab-acc'),
      { key: 'tab-acc' },
      'AccountHome',
    );

    expect(handled).toBe(false);
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('unwinds a tab showing a nested screen', () => {
    mockRootState = rootStateWith([
      {
        name: 'Account',
        key: 'tab-acc',
        state: {
          index: 1,
          routes: [
            { name: 'AccountHome', key: 'AccountHome-1' },
            { name: 'PersonalHub', key: 'PersonalHub-1' },
          ],
        },
      },
    ]);

    const dispatch = jest.fn();
    const handled = businessTabBarRePress(
      dispatch,
      tabState('tab-acc'),
      { key: 'tab-acc' },
      'AccountHome',
    );

    expect(handled).toBe(true);

    const { type, payload } = dispatch.mock.calls[0][0] as {
      type: string;
      payload: { routes: { key: string; state: { routes: { name: string }[] } }[] };
    };
    expect(type).toBe('RESET');
    expect(payload.routes[0].state.routes).toEqual([{ name: 'AccountHome' }]);
  });

  it('rebuilds onto the base screen after a cross-tab hop left params behind', () => {
    // The hop builds the stack straight onto the nested screen, so the tab's
    // base never sits underneath it and params carry the destination.
    mockRootState = rootStateWith([
      {
        name: 'Account',
        key: 'tab-acc',
        params: { screen: 'PersonalMyDeals' },
        state: {
          index: 0,
          routes: [{ name: 'PersonalMyDeals', key: 'PersonalMyDeals-1' }],
        },
      },
    ]);

    const dispatch = jest.fn();
    const handled = businessTabBarRePress(
      dispatch,
      tabState('tab-acc'),
      { key: 'tab-acc' },
      'AccountHome',
    );

    expect(handled).toBe(true);

    const { payload } = dispatch.mock.calls[0][0] as {
      payload: { routes: { params?: object; state: { routes: { name: string }[] } }[] };
    };
    expect(payload.routes[0].params).toBeUndefined();
    expect(payload.routes[0].state.routes).toEqual([{ name: 'AccountHome' }]);
  });

  it('leaves the other tabs in the same state', () => {
    mockRootState = rootStateWith([restingAccount]);

    const dispatch = jest.fn();
    const state = tabState('tab-overview', 'tab-acc');

    businessTabBarRePress(dispatch, state, { key: 'tab-acc' }, 'PersonalMore');

    const { payload } = dispatch.mock.calls[0][0] as {
      payload: { routes: { key: string }[] };
    };
    // The untouched sibling tab keeps its original route object.
    expect(payload.routes[0]).toBe(state.routes[0]);
  });

  it('returns false without a base screen to unwind to', () => {
    mockRootState = rootStateWith([restingAccount]);

    expect(
      businessTabBarRePress(
        jest.fn(),
        tabState('tab-acc'),
        { key: 'tab-acc' },
        undefined,
      ),
    ).toBe(false);
  });

  it('still unwinds when the container ref cannot be consulted', () => {
    // No tree to read the tab's stack from: the safe answer is to unwind, since
    // a needless rebuild is a lesser failure than being stuck on a nested screen.
    mockRootState = undefined;

    const dispatch = jest.fn();
    expect(
      businessTabBarRePress(
        dispatch,
        tabState('tab-acc'),
        { key: 'tab-acc' },
        'AccountHome',
      ),
    ).toBe(true);
    expect(dispatch).toHaveBeenCalledTimes(1);
  });
});

describe('tabRePressListenersFor', () => {
  it('ignores a press aimed at a different tab', () => {
    const dispatch = jest.fn();
    listenersFor(dispatch, true).tabPress({ target: 'some-other-tab' });

    expect(dispatch).not.toHaveBeenCalled();
  });

  it('ignores a press while the tab is not focused', () => {
    const dispatch = jest.fn();
    listenersFor(dispatch, false).tabPress({ target: 'tab-acc' });

    expect(dispatch).not.toHaveBeenCalled();
  });

  it('does nothing when the focused tab already shows its base screen', () => {
    mockRootState = rootStateWith([restingAccount]);

    const dispatch = jest.fn();
    listenersFor(dispatch, true).tabPress({ target: 'tab-acc' });

    expect(dispatch).not.toHaveBeenCalled();
  });

  it('unwinds when the focused tab shows a nested screen', () => {
    mockRootState = rootStateWith([
      {
        name: 'Account',
        key: 'tab-acc',
        state: {
          index: 1,
          routes: [
            { name: 'AccountHome', key: 'AccountHome-1' },
            { name: 'PersonalHub', key: 'PersonalHub-1' },
          ],
        },
      },
    ]);

    const dispatch = jest.fn();
    listenersFor(dispatch, true).tabPress({ target: 'tab-acc' });

    expect(dispatch).toHaveBeenCalledTimes(1);
  });

  /** The listener pair for one tab, with a fresh dispatch to observe. */
  function listenersFor(dispatch: jest.Mock, focused: boolean) {
    return tabRePressListenersFor('AccountHome')({
      navigation: {
        dispatch,
        isFocused: () => focused,
        getState: () => tabState('tab-acc'),
      },
      route: { key: 'tab-acc' },
    });
  }
});

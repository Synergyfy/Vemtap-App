import {
  deriveLocation,
  isSameLocation,
  takeHistoryEntryForBack,
  useNavigationHistory,
} from '@navigation/navigationHistory';

/**
 * Two behaviours the tab bar and every navbar now depend on:
 *
 *  1. Re-tapping the focused tab unwinds it to its base screen, while leaving
 *     the tab mounted (so coming back to it later still shows where you were).
 *  2. Back returns to the screen you navigated from, even across tabs — which
 *     needs a history that React Navigation's per-tab stacks cannot provide.
 */

type Node = {
  key?: string;
  name?: string;
  type?: string;
  index?: number;
  params?: object;
  routes?: Node[];
  state?: Node;
};

/**
 * Customer tree: Root → AppStack('Tabs') → tab('Orders') → stack with two
 * screens, exactly the shape `useNavigation().getState()` hands back.
 */
const customerTree: Node = {
  key: 'root',
  type: 'stack',
  index: 0,
  routes: [
    {
      key: 'app',
      name: 'AppStack',
      state: {
        key: 'tabs',
        type: 'tab',
        index: 1,
        routes: [
          { key: 'home', name: 'Home' },
          {
            key: 'orders',
            name: 'Orders',
            state: {
              key: 'ordersStack',
              type: 'stack',
              index: 1,
              routes: [
                { key: 'ordersHome', name: 'OrdersHome' },
                { key: 'orderDetail', name: 'OrderDetail', params: { id: 'x' } },
              ],
            },
          },
        ],
      },
    },
  ],
};

/** Business tree, one level deeper: Root → BusinessTabs → tab → stack. */
const businessTree: Node = {
  key: 'root',
  type: 'stack',
  index: 0,
  routes: [
    {
      key: 'businessTabs',
      name: 'BusinessTabs',
      state: {
        key: 'bizTabs',
        type: 'tab',
        index: 0,
        routes: [
          {
            key: 'bizOverview',
            name: 'BusinessOverview',
            state: {
              key: 'overviewStack',
              type: 'stack',
              index: 0,
              routes: [{ key: 'overviewHome', name: 'BusinessOverviewHome' }],
            },
          },
        ],
      },
    },
  ],
};

beforeEach(() => {
  useNavigationHistory.getState().reset();
});

describe('deriveLocation', () => {
  it('reports the tab, the nested screen and the keys needed to jump back', () => {
    const location = deriveLocation(customerTree);

    expect(location).toMatchObject({
      tab: 'Orders',
      screen: 'OrderDetail',
      tabsKey: 'tabs',
      stackKey: 'ordersStack',
      screenKey: 'orderDetail',
    });
    expect(location?.params).toEqual({ id: 'x' });
  });

  it('works the same one navigator deeper for the business tree', () => {
    expect(deriveLocation(businessTree)).toMatchObject({
      tab: 'BusinessOverview',
      screen: 'BusinessOverviewHome',
      tabsKey: 'bizTabs',
      stackKey: 'overviewStack',
    });
  });

  it('still finds the tab when the tab navigator is the root', () => {
    // This is the shape of a tab navigator mounted on its own (tests mount the
    // shell directly), where there is no root stack above it.
    const rootIsTabBar: Node = {
      key: 'bizTabs',
      type: 'tab',
      index: 0,
      routes: [
        {
          key: 'bizOverview',
          name: 'BusinessOverview',
          state: {
            key: 'overviewStack',
            type: 'stack',
            index: 0,
            routes: [{ key: 'overviewHome', name: 'BusinessOverviewHome' }],
          },
        },
      ],
    };

    expect(deriveLocation(rootIsTabBar)).toMatchObject({
      tab: 'BusinessOverview',
      tabsKey: 'bizTabs',
      screen: 'BusinessOverviewHome',
    });
  });

  it('reports the tab route itself for a tab with no stack of its own', () => {
    // Orders and More are single-screen tabs: the tab route is the screen.
    const singleScreenTab: Node = {
      key: 'bizTabs',
      type: 'tab',
      index: 1,
      routes: [
        { key: 'overview', name: 'BusinessOverview' },
        { key: 'more', name: 'BusinessMore' },
      ],
    };

    expect(deriveLocation(singleScreenTab)).toMatchObject({
      tab: 'BusinessMore',
      tabsKey: 'bizTabs',
      screen: 'BusinessMore',
    });
  });

  it('marks a screen outside any tab bar', () => {
    const rootOnly: Node = {
      key: 'root',
      type: 'stack',
      index: 0,
      routes: [{ key: 'setup', name: 'BusinessSetup' }],
    };

    expect(deriveLocation(rootOnly)).toMatchObject({
      tab: '',
      screen: 'BusinessSetup',
    });
  });

  it('returns null for an empty tree', () => {
    expect(deriveLocation(undefined)).toBeNull();
    expect(deriveLocation({ key: 'root', routes: [] })).toBeNull();
  });
});

describe('history recording', () => {
  it('stacks locations as the user moves forward', () => {
    const store = useNavigationHistory.getState();
    store.remember(deriveLocation(customerTree)!);
    expect(useNavigationHistory.getState().past).toHaveLength(0);

    // A tab switch is a navigation too: its origin has to stay on the list.
    useNavigationHistory.getState().remember(deriveLocation(businessTree)!);
    const { past, present } = useNavigationHistory.getState();
    expect(past).toHaveLength(1);
    expect(past[0].screen).toBe('OrderDetail');
    expect(present?.screen).toBe('BusinessOverviewHome');
  });

  it('ignores a re-render of the same screen', () => {
    const store = useNavigationHistory.getState();
    store.remember(deriveLocation(customerTree)!);
    store.remember(deriveLocation(customerTree)!);
    store.remember(deriveLocation(customerTree)!);

    expect(useNavigationHistory.getState().past).toHaveLength(0);
  });

  it('unwinds instead of stacking when the user pops themselves', () => {
    const store = useNavigationHistory.getState();
    store.remember(deriveLocation(customerTree)!);
    useNavigationHistory.getState().remember(deriveLocation(businessTree)!);

    // Back on the Orders detail screen (a swipe-back, say): the Business entry
    // must be dropped, not duplicated.
    useNavigationHistory.getState().remember(deriveLocation(customerTree)!);

    const { past, present } = useNavigationHistory.getState();
    expect(past).toHaveLength(0);
    expect(present?.screen).toBe('OrderDetail');
  });

  it('pop hands back the previous location once', () => {
    const store = useNavigationHistory.getState();
    store.remember(deriveLocation(customerTree)!);
    useNavigationHistory.getState().remember(deriveLocation(businessTree)!);

    const entry = useNavigationHistory.getState().pop();
    expect(entry?.screen).toBe('OrderDetail');
    expect(entry?.tab).toBe('Orders');
    expect(useNavigationHistory.getState().past).toHaveLength(0);

    // Nothing left to go back to: the caller falls back to the navigator.
    expect(useNavigationHistory.getState().pop()).toBeNull();
  });
});

describe('isSameLocation', () => {
  it('prefers route keys, which are unique per screen instance', () => {
    expect(
      isSameLocation(
        { tab: 'Orders', screen: 'OrdersHome', screenKey: 'a' },
        { tab: 'Orders', screen: 'OrdersHome', screenKey: 'a' },
      ),
    ).toBe(true);
    expect(
      isSameLocation(
        { tab: 'Orders', screen: 'OrdersHome', screenKey: 'a' },
        { tab: 'Orders', screen: 'OrdersHome', screenKey: 'b' },
      ),
    ).toBe(false);
  });

  it('falls back to names when keys are absent', () => {
    expect(
      isSameLocation({ tab: 'Orders', screen: 'X' }, { tab: 'Orders', screen: 'X' }),
    ).toBe(true);
    expect(isSameLocation(null, { tab: 'Orders', screen: 'X' })).toBe(false);
  });
});

describe('takeHistoryEntryForBack', () => {
  const orders = { tab: 'Orders', screen: 'OrderDetail', stackKey: 'ordersStack' };
  const more = { tab: 'BusinessMore', screen: 'BusinessMoreHome', stackKey: 'moreStack' };

  /** Records a hop so the history mirrors a real round trip. */
  const seed = (from: typeof orders | typeof more, to: typeof orders | typeof more) => {
    const store = useNavigationHistory.getState();
    store.remember(from);
    store.remember(to);
  };

  it('lets the navigator pop, so a stale foreign tab cannot hijack back', () => {
    seed(more, orders);
    // The newest entry is the other tab: the old "is it my stack?" check would
    // jump there, but a navigator that can pop must win.
    expect(useNavigationHistory.getState().past).toEqual([more]);

    const entry = takeHistoryEntryForBack({ canGoBack: () => true });
    expect(entry).toBeNull();
    // Nothing was consumed, so the pop stays the navigator's business.
    expect(useNavigationHistory.getState().past).toEqual([more]);
  });

  it('takes the other tab when the navigator is at a root and cannot pop', () => {
    seed(more, orders);

    const entry = takeHistoryEntryForBack({ canGoBack: () => false });
    expect(entry).toEqual(more);
    expect(useNavigationHistory.getState().past).toEqual([]);
  });

  it('still pops in-stack when there is no recorded foreign tab at all', () => {
    const store = useNavigationHistory.getState();
    // Two screens of the same tab's stack: the newest entry is the screen
    // below this one, so the caller falls back to the navigator's own pop.
    store.remember({ tab: 'Orders', screen: 'OrdersHome', stackKey: 'ordersStack' });
    store.remember({ tab: 'Orders', screen: 'OrderDetail', stackKey: 'ordersStack' });

    expect(takeHistoryEntryForBack()).toBeNull();
  });

  it('never throws when the navigator cannot answer', () => {
    seed(more, orders);
    const exploding = {
      canGoBack: () => {
        throw new Error('unmounted');
      },
    };

    // One call: it must survive the throw and still answer from history.
    let entry: ReturnType<typeof takeHistoryEntryForBack> = null;
    expect(() => {
      entry = takeHistoryEntryForBack(exploding);
    }).not.toThrow();
    expect(entry).toEqual(more);
  });
});

import { CommonActions } from '@react-navigation/native';
import {
  takeHistoryEntryForBack,
  useNavigationHistory,
} from '@navigation/navigationHistory';
import { enterShell } from '@navigation/shellSwitch';
import { navigationRef } from '@navigation/navigationRef';

jest.mock('@navigation/navigationRef', () => ({
  navigationRef: { isReady: jest.fn(() => true), dispatch: jest.fn() },
}));

const customerHome = {
  shell: 'AppStack',
  tab: 'Home',
  tabsKey: 'tabs-c',
  stackKey: 'home-stack',
  screen: 'HomeMain',
  screenKey: 'home-1',
};
const businessOverview = {
  shell: 'BusinessTabs',
  tab: 'BusinessOverview',
  tabsKey: 'tabs-b',
  stackKey: 'overview-stack',
  screen: 'BusinessOverviewHome',
  screenKey: 'overview-1',
};

beforeEach(() => {
  useNavigationHistory.getState().reset();
  (navigationRef!.dispatch as jest.Mock).mockClear();
});

describe('back never crosses between the customer and business dashboards', () => {
  it('stops at the business shell root instead of returning to the customer app', () => {
    useNavigationHistory.setState({ past: [customerHome], present: businessOverview });
    expect(takeHistoryEntryForBack({ canGoBack: () => false })).toBeNull();
    // The customer entry is left alone, not consumed.
    expect(useNavigationHistory.getState().past).toEqual([customerHome]);
  });

  it('still steps back across tabs inside one shell', () => {
    const businessOrders = {
      ...businessOverview,
      tab: 'BusinessOrders',
      stackKey: 'orders-stack',
      screen: 'BusinessOrdersHome',
      screenKey: 'orders-1',
    };
    useNavigationHistory.setState({ past: [businessOverview], present: businessOrders });
    expect(takeHistoryEntryForBack({ canGoBack: () => false })).toEqual(businessOverview);
  });

  it('switching shells replaces the root and clears the old history', () => {
    useNavigationHistory.setState({ past: [customerHome], present: customerHome });
    expect(enterShell('BusinessTabs', { screen: 'BusinessOverview' })).toBe(true);
    expect(navigationRef!.dispatch).toHaveBeenCalledWith(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'BusinessTabs', params: { screen: 'BusinessOverview' } }],
      }),
    );
    expect(useNavigationHistory.getState().past).toEqual([]);
  });
});

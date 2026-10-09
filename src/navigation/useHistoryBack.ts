import { useCallback, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  deriveLocation,
  goToLocation,
  takeHistoryEntryForBack,
  useNavigationHistory,
} from '@navigation/navigationHistory';

/**
 * Records every navigation into the cross-tab history. Mounted once, beside the
 * root navigator, so the customer and business tab trees feed the same list —
 * that shared list is what lets a back button cross tab boundaries.
 *
 * It observes state instead of wrapping `navigate`, so navigations the app
 * performs directly (`navigationRef` from services, deep links, role switches)
 * are recorded too rather than being silently skipped.
 */
export function NavigationHistoryTracker(): null {
  const remember = useNavigationHistory(state => state.remember);
  const navigation = useNavigation();

  useEffect(() => {
    const record = () => {
      remember(deriveLocation(navigation.getState()));
    };
    record();
    return navigation.addListener('state', record);
  }, [navigation, remember]);

  return null;
}

/**
 * The back button every navbar should use.
 *
 * It steps the cross-tab history first — so back returns to the screen you
 * actually navigated from, even when that was in another tab — and falls back to
 * the navigator's own `goBack()` when nothing is recorded (first screen of the
 * app, or a test that mounts a navigator without the tracker).
 */
export function useHistoryBack(): () => void {
  const navigation = useNavigation();

  return useCallback(() => {
    const entry = takeHistoryEntryForBack(navigation);
    if (entry && goToLocation(entry, navigation)) return;
    navigation.goBack();
  }, [navigation]);
}

/**
 * Non-hook variant for `useBusinessNavigation`. Returns false when the navigator
 * should handle the back itself, so the caller falls back to `goBack()`.
 */
export function historyBack(navigation?: {
  dispatch: (action: never) => void;
  navigate: (name: never, params?: never) => void;
  getState: () => unknown;
  canGoBack?: () => boolean;
}): boolean {
  const entry = takeHistoryEntryForBack(navigation);
  return entry ? goToLocation(entry, navigation as never) : false;
}

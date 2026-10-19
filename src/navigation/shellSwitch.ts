import { CommonActions } from '@react-navigation/native';
import { navigationRef } from '@navigation/navigationRef';
import { useNavigationHistory } from '@navigation/navigationHistory';

/** The two app shells: the customer app and the business dashboard. */
export type AppShell = 'AppStack' | 'BusinessTabs';

/**
 * Moves into the other shell so it *replaces* the one you were in.
 *
 * Both shells are siblings on the root stack, so a plain `navigate` pushed the
 * new one on top: a swipe back or the back button then dropped you into the
 * shell you had just left. Resetting the root to the target shell leaves
 * nothing behind it, and clearing the cross-tab history stops the back button
 * from walking into the old shell's screens. Only the explicit switch buttons
 * cross over.
 *
 * `nested` is the shell's own entry, e.g. `{ screen: 'BusinessOverview' }`.
 * Returns false when the container is not ready yet.
 */
export function enterShell(shell: AppShell, nested?: object): boolean {
  if (!navigationRef?.isReady()) return false;
  useNavigationHistory.getState().reset();
  navigationRef.dispatch(
    CommonActions.reset({ index: 0, routes: [{ name: shell, params: nested }] }),
  );
  return true;
}

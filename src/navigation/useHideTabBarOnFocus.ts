import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useTabBarStore } from '@store/tabBarStore';

/**
 * Hides the consumer bottom tab bar while the calling screen is focused.
 *
 * `useFocusEffect` rather than a plain effect so the bar comes back on blur:
 * a chat opened by pushing another page on top of it should restore the bar for
 * that page, and popping back to the chat should hide it again.
 */
export function useHideTabBarOnFocus() {
  const setTabBarHidden = useTabBarStore(state => state.setTabBarHidden);

  useFocusEffect(
    useCallback(() => {
      setTabBarHidden(true);
      return () => setTabBarHidden(false);
    }, [setTabBarHidden]),
  );
}

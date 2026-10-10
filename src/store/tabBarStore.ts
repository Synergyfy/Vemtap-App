import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

/**
 * Whether the consumer bottom tab bar is hidden.
 *
 * The consumer tabs are the outermost navigator, so a screen that wants a
 * barless full-height canvas (the conversation view) cannot simply own its own
 * chrome — the bar still paints underneath it. Screens signal that intent here
 * and `TabNavigator` reads the flag, which keeps the decision in one place
 * instead of scattering `tabBarStyle` overrides across nested navigators.
 *
 * Deliberately not persisted: this is a focus-time decision, not a preference,
 * and a stale `true` on next launch would hide the bar across every tab.
 */
interface TabBarState {
  isTabBarHidden: boolean;
  setTabBarHidden: (hidden: boolean) => void;
}

export const useTabBarStore = create<TabBarState>()(
  devtools(
    set => ({
      isTabBarHidden: false,
      setTabBarHidden: isTabBarHidden => set({ isTabBarHidden }),
    }),
    { name: 'TabBarStore' },
  ),
);

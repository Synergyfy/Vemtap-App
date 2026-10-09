import React from 'react';
import { Pressable, View } from 'react-native';
import { cssInterop } from 'nativewind';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, type IconName } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { tabBarTopShadow } from '@theme/shadows';
import { typeMetrics } from '@theme/typography';
import { cn } from '@utils/cn';
import { businessTabBarRePress } from '@navigation/navigationHistory';

cssInterop(Pressable, { className: 'style' });
cssInterop(View, { className: 'style' });

/** Visible footer height above the home-indicator inset. */
export const BUSINESS_TAB_BAR_HEIGHT = 64;

export interface BusinessTabBadge {
  count: number;
  tone: 'brand' | 'error';
}

export interface BusinessTabMeta {
  icon: IconName;
  label: string;
  badge?: BusinessTabBadge;
  /** The screen this tab's stack starts on, so a re-tap can unwind to it. */
  baseScreen: string;
}

/**
 * Single source of truth for the business bottom navigation shown by every
 * business spec (Overview · Orders · Messages · Business · More). Screens and
 * navigators must use this instead of drawing their own footer.
 */
export const businessTabMeta: Record<string, BusinessTabMeta> = {
  BusinessOverview: {
    icon: 'dashboard',
    label: strings.businessShell.tabs.overview,
    baseScreen: 'BusinessOverviewHome',
  },
  BusinessOrders: {
    icon: 'receipt',
    label: strings.businessShell.tabs.orders,
    baseScreen: 'BusinessOrdersHome',
    // Badges are live (`BusinessTabBarWithLiveBadges`); never bake fake counts.
  },
  BusinessMessages: {
    icon: 'message',
    label: strings.businessShell.tabs.messages,
    baseScreen: 'BusinessMessagesHome',
  },
  BusinessHub: {
    icon: 'storefront',
    label: strings.businessShell.tabs.business,
    baseScreen: 'BusinessHubHome',
  },
  BusinessMore: {
    icon: 'gridView',
    label: strings.businessShell.tabs.more,
    baseScreen: 'BusinessMoreHome',
  },
};

export interface BusinessTabBarProps extends BottomTabBarProps {
  /** Overrides the default per-tab badges (e.g. live unread counts). */
  badges?: Partial<Record<string, BusinessTabBadge>>;
}

/** Business bottom navigation: 22px glyph + 11px caption, soft top shadow. */
export function BusinessTabBar({ state, navigation, badges }: BusinessTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        {
          height: BUSINESS_TAB_BAR_HEIGHT + insets.bottom,
          paddingBottom: insets.bottom,
          backgroundColor: colors.surface,
        },
        tabBarTopShadow,
      ]}
    >
      <View className="h-16 flex-row items-center px-1">
        {state.routes.map((route, index) => {
          const meta = businessTabMeta[route.name];
          if (!meta) return null;
          const focused = state.index === index;
          const badge = badges?.[route.name] ?? meta.badge;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (event.defaultPrevented) return;

            if (focused) {
              // Asking for the tab you are already on means "take me to its
              // base screen": the tab keeps whatever nested screen it had while
              // you were away, but a second tap unwinds it. The nested screen
              // may itself have arrived through a cross-tab hop, in which case
              // the stack was built straight onto it and only a rebuild gets
              // back to the base screen.
              if (
                businessTabBarRePress(navigation.dispatch, state, route, meta.baseScreen)
              ) {
                return;
              }
            }
            navigation.navigate(route.name, route.params);
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={meta.label}
              onPress={onPress}
              className="h-full flex-1 items-center justify-center"
            >
              <View>
                <Icon
                  name={meta.icon}
                  size={22}
                  color={focused ? colors.primary : colors.textSecondary}
                />
                {badge ? (
                  <View
                    className={cn(
                      'absolute -right-2.5 -top-1 h-4 min-w-4 items-center justify-center rounded-full px-1',
                      badge.tone === 'brand' ? 'bg-primary' : 'bg-error',
                    )}
                  >
                    <VemtapText
                      variant="micro"
                      className={cn(
                        'font-sans-bold',
                        badge.tone === 'brand'
                          ? 'text-primary-foreground'
                          : 'text-surface',
                      )}
                    >
                      {String(badge.count)}
                    </VemtapText>
                  </View>
                ) : null}
              </View>
              <VemtapText
                variant="micro"
                style={typeMetrics('micro')}
                className={cn(
                  'mt-0.5',
                  focused ? 'font-sans-semibold text-primary' : 'text-text-secondary',
                )}
                numberOfLines={1}
              >
                {meta.label}
              </VemtapText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

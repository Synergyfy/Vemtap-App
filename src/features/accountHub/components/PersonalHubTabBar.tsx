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

cssInterop(Pressable, { className: 'style' });
cssInterop(View, { className: 'style' });

/** Visible footer height above the home-indicator inset (spec: h-16). */
export const PERSONAL_HUB_TAB_BAR_HEIGHT = 64;

export interface PersonalHubTabBadge {
  count: number;
}

export interface PersonalHubTabMeta {
  icon: IconName;
  label: string;
  badge?: PersonalHubTabBadge;
}

/**
 * Bottom navigation extracted from
 * `stitch_vemtap_mobile_app_design/customer_dashboard_personal_overview/code.html`
 * (`<nav class="fixed bottom-0 … pb-safe bg-surface/90 backdrop-blur-xl">`):
 * Home · My Deals · Messages · Orders · More, 24px glyph + caption label, badges on
 * My Deals (3) and Messages (1), active item in primary + semibold.
 *
 * This shell is a root-level sibling of the consumer `Tabs`, so exactly one
 * bottom bar is ever on screen — same rule as `BusinessTabBar`.
 */
export const personalHubTabMeta: Record<string, PersonalHubTabMeta> = {
  PersonalHome: {
    icon: 'dashboard',
    label: strings.personalHubShell.tabs.home,
  },
  PersonalMyDeals: {
    icon: 'confirmation',
    label: strings.personalHubShell.tabs.myDeals,
    badge: { count: strings.personalHubShell.myDealsBadge },
  },
  PersonalMessages: {
    icon: 'message',
    label: strings.personalHubShell.tabs.messages,
    badge: { count: strings.personalHubShell.messagesBadge },
  },
  PersonalOrders: {
    icon: 'receiptLong',
    label: strings.personalHubShell.tabs.orders,
  },
  PersonalMore: {
    icon: 'more',
    label: strings.personalHubShell.tabs.more,
  },
};

export interface PersonalHubTabBarProps extends BottomTabBarProps {
  /** Overrides the default per-tab badges (e.g. live counts). */
  badges?: Partial<Record<string, PersonalHubTabBadge>>;
}

export function PersonalHubTabBar({ state, navigation, badges }: PersonalHubTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        {
          height: PERSONAL_HUB_TAB_BAR_HEIGHT + insets.bottom,
          paddingBottom: insets.bottom,
          backgroundColor: colors.surface,
        },
        tabBarTopShadow,
      ]}
    >
      <View className="h-16 flex-row items-center justify-around px-2">
        {state.routes.map((route, index) => {
          const meta = personalHubTabMeta[route.name];
          if (!meta) return null;
          const focused = state.index === index;
          const badge = badges?.[route.name] ?? meta.badge;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={meta.label}
              onPress={onPress}
              className="h-12 min-w-[56px] items-center justify-center gap-0.5"
            >
              <View>
                <Icon
                  name={meta.icon}
                  size={24}
                  color={focused ? colors.primary : colors.textSecondary}
                />
                {badge && badge.count > 0 ? (
                  <View className="absolute -right-2 -top-1 h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1">
                    <VemtapText
                      variant="micro"
                      className="font-sans-bold leading-none text-primary-foreground"
                    >
                      {String(badge.count)}
                    </VemtapText>
                  </View>
                ) : null}
              </View>
              <VemtapText
                variant="caption"
                style={typeMetrics('caption')}
                className={cn(
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

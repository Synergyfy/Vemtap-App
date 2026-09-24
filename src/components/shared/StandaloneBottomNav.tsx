import React from 'react';
import { Pressable, View } from 'react-native';
import { Icon, type IconName } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { tabBarTopShadow } from '@theme/shadows';

export type StandaloneNavKey = 'home' | 'deals' | 'messages' | 'orders' | 'more';

const items: Array<{
  key: StandaloneNavKey;
  icon: IconName;
}> = [
  { key: 'home', icon: 'home' },
  { key: 'deals', icon: 'localOffer' },
  { key: 'messages', icon: 'comment' },
  { key: 'orders', icon: 'shoppingBag' },
  { key: 'more', icon: 'more' },
];

const itemLabels: Record<StandaloneNavKey, string> = {
  home: strings.home.tabHome,
  deals: strings.ordersHub.myDeals,
  messages: strings.ordersHub.messagesTab,
  orders: strings.ordersHub.ordersTab,
  more: strings.ordersHub.moreTab,
};

export interface StandaloneBottomNavProps {
  active: StandaloneNavKey;
  onSelect?: (key: StandaloneNavKey) => void;
  bottomInset?: number;
  messagesBadge?: number;
}

export function StandaloneBottomNav({
  active,
  onSelect,
  bottomInset = 0,
  messagesBadge = 0,
}: StandaloneBottomNavProps) {
  return (
    <View
      className="flex-row bg-surface px-2 pt-1"
      style={[tabBarTopShadow, { paddingBottom: Math.max(bottomInset, 8) }]}
    >
      {items.map(item => {
        const selected = item.key === active;
        const showBadge = item.key === 'messages' && messagesBadge > 0;
        const label = itemLabels[item.key];
        return (
          <Pressable
            key={item.key}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={label}
            onPress={() => onSelect?.(item.key)}
            className="min-h-[52px] flex-1 items-center justify-center gap-0.5 active:opacity-70"
          >
            <View>
              <Icon
                name={item.icon}
                size={22}
                color={selected ? colors.primary : colors.textSecondary}
              />
              {showBadge ? (
                <View className="absolute -right-2 -top-1.5 min-w-[16px] items-center justify-center rounded-full bg-primary px-1">
                  <VemtapText
                    variant="micro"
                    tone="inverse"
                    className="font-sans-bold leading-4"
                  >
                    {messagesBadge}
                  </VemtapText>
                </View>
              ) : null}
            </View>
            <VemtapText
              variant="caption"
              tone={selected ? 'brand' : 'secondary'}
              className={selected ? 'font-sans-semibold' : undefined}
            >
              {label}
            </VemtapText>
          </Pressable>
        );
      })}
    </View>
  );
}

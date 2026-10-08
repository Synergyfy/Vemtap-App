import React from 'react';
import { View } from 'react-native';
import { cssInterop } from 'nativewind';
import { Icon, type IconName } from '@components/ui/Icon';
import { colors } from '@theme/colors';

cssInterop(View, { className: 'style' });

const icons: Record<string, IconName> = {
  Home: 'home',
  Deals: 'localOffer',
  Business: 'storefront',
  Saved: 'bookmark',
  Account: 'accountCircle',
  Nearby: 'nearMe',
  Claims: 'loyalty',
};

export function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  return (
    <View accessibilityElementsHidden importantForAccessibility="no">
      <Icon
        name={icons[label] ?? 'home'}
        size={22}
        color={focused ? colors.primary : colors.textSecondary}
      />
    </View>
  );
}

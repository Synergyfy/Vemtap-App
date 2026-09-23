import React from 'react';
import { Pressable, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { navbarBottomShadow } from '@theme/shadows';
import { colors } from '@theme/colors';
import { strings } from '@constants/strings';

cssInterop(View, { className: 'style' });
cssInterop(Pressable, { className: 'style' });

/** Location header from vemtap_deals_discovery_grid_view_featured_deal_location_header */
export function DealsHeader() {
  return (
    <View style={navbarBottomShadow} className="bg-surface-canvas px-6 py-2">
      <View className="flex-row items-center justify-between">
        <View className="min-w-0 flex-1 flex-col">
          <VemtapText variant="caption" tone="secondary" className="font-sans-medium">
            {strings.deals.caption}
          </VemtapText>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${strings.deals.location}, ${strings.deals.radius}`}
            className="mt-0.5 flex-row items-center gap-1"
          >
            <Icon name="locationOn" size={18} color={colors.primary} />
            <VemtapText className="font-sans-bold text-label-md text-text">
              {strings.deals.location}
            </VemtapText>
            <Icon name="expandMore" size={18} color={colors.textSecondary} />
            <View className="ml-1 rounded-full bg-surface-container px-1.5 py-0.5">
              <VemtapText className="font-sans-medium text-caption text-text-secondary">
                {strings.deals.radius}
              </VemtapText>
            </View>
          </Pressable>
        </View>
        <View className="flex-row items-center gap-2">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={strings.deals.notifications}
            className="h-11 w-11 items-center justify-center rounded-full"
          >
            <Icon name="notifications" size={24} color={colors.outline} />
            <View className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-error" />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={strings.deals.avatar}
            className="h-9 w-9 items-center justify-center rounded-full bg-primary shadow-xs"
          >
            <Icon name="person" size={20} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

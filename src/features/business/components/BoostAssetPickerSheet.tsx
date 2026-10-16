import React from 'react';
import { ScrollView, View } from 'react-native';
import { VemtapText } from '@components/ui/Text';
import { BottomSheet } from '@components/shared/BottomSheet';
import { LoadingState } from '@components/shared/LoadingState';
import { strings } from '@constants/strings';
import { BusinessScopeCard } from '@features/business/components/BusinessOpsPrimitives';
import type { CampaignContentItem } from '@features/business/utils/campaignMappers';

const copy = strings.boostEngine.live;

export interface BoostAssetPickerSheetProps {
  visible: boolean;
  onClose: () => void;
  /** Eligible deals, products, services and the profile, as content cards. */
  items: readonly CampaignContentItem[];
  selectedId?: string;
  onPick: (id: string) => void;
  isLoading?: boolean;
}

/**
 * "Change" on the Boost Engine and the goal step: pick the single listing a
 * boost features. Built on the shared `BottomSheet` (delayed-fade scrim,
 * Android back) with the same scope cards the campaign content step uses.
 */
export function BoostAssetPickerSheet({
  visible,
  onClose,
  items,
  selectedId,
  onPick,
  isLoading = false,
}: BoostAssetPickerSheetProps) {
  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={copy.pickerTitle}
      titleVariant="headingXl"
      titleClassName="text-heading-xl"
    >
      {isLoading ? <LoadingState /> : null}
      {!isLoading && items.length === 0 ? (
        <VemtapText variant="bodyMd" tone="secondary">
          {copy.pickerEmpty}
        </VemtapText>
      ) : null}
      <ScrollView className="flex-shrink" showsVerticalScrollIndicator={false}>
        <View className="gap-2 pb-2">
          {items.map(item => (
            <BusinessScopeCard
              key={item.id}
              title={item.title}
              tag={item.eyebrow}
              body={[item.price, item.performance].filter(Boolean).join(' • ')}
              selected={item.id === selectedId}
              onPress={() => {
                onPick(item.id);
                onClose();
              }}
            />
          ))}
        </View>
      </ScrollView>
    </BottomSheet>
  );
}

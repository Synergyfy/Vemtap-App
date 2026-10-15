import React from 'react';
import { Pressable, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';
import {
  BusinessProductImage,
  BusinessStatusPill,
} from '@features/business/components/BusinessPrimitives';
import { businessOpsImageById } from '@features/business/data/businessOpsImages';

cssInterop(Pressable, { className: 'style' });

export interface ServicesManagementRow {
  id: string;
  name: string;
  eyebrow: string;
  tag: string;
  price: string;
  priceSuffix?: string;
  duration: string;
  status: string;
  note: string;
  image?: { uri: string; alt: string };
}

/** The status label `catalogueItemToServiceRow` gives an unpublished service. */
export const DRAFT_SERVICE_STATUS = 'Draft';

export interface CatalogueServiceCardProps {
  service: ServicesManagementRow;
  /** Opens the owner's item options; the menu icon is hidden without it. */
  onPressMenu?: () => void;
}

/**
 * One bookable service: image with type tag, category eyebrow, name, price and
 * duration, live/draft status and a note. Shared by the Services & Categories
 * manager and the Central Catalogue's Services tab.
 */
export function CatalogueServiceCard({
  service,
  onPressMenu,
}: CatalogueServiceCardProps) {
  const image = service.image ?? businessOpsImageById[service.id];
  const isDraft = service.status === DRAFT_SERVICE_STATUS;

  return (
    <View className="gap-3 overflow-hidden rounded-card bg-surface p-3 shadow-sm">
      <View className="flex-row items-start gap-3">
        <View className="relative h-20 w-20 shrink-0 overflow-hidden rounded-card bg-surface-container">
          {image ? (
            <BusinessProductImage
              source={image}
              alt={image.alt}
              className="h-full w-full"
            />
          ) : null}
          <View className="absolute left-1 top-1 rounded bg-surface px-1.5 py-0.5">
            <VemtapText variant="micro" className="font-sans-semibold text-primary">
              {service.tag}
            </VemtapText>
          </View>
        </View>
        <View className="min-w-0 flex-1">
          <View className="flex-row items-start justify-between gap-2">
            <VemtapText
              variant="micro"
              tone="tertiary"
              className="min-w-0 flex-1 font-sans-medium uppercase tracking-wider"
              numberOfLines={1}
            >
              {service.eyebrow}
            </VemtapText>
            {onPressMenu ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={service.name}
                hitSlop={8}
                onPress={onPressMenu}
              >
                <Icon name="more" size={19} color={colors.textSecondary} />
              </Pressable>
            ) : null}
          </View>
          <VemtapText
            variant="labelMd"
            className="mt-1 font-sans-semibold"
            numberOfLines={2}
          >
            {service.name}
          </VemtapText>
          <View className="mt-1 flex-row items-baseline gap-1.5">
            <VemtapText variant="labelSm" className="font-sans-semibold text-primary">
              {service.price}
            </VemtapText>
            {service.priceSuffix ? (
              <VemtapText variant="caption" tone="secondary">
                {service.priceSuffix}
              </VemtapText>
            ) : null}
            {service.duration ? (
              <>
                <Icon name="schedule" size={14} color={colors.textSecondary} />
                <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                  {service.duration}
                </VemtapText>
              </>
            ) : null}
          </View>
        </View>
      </View>
      <View className="flex-row flex-wrap items-center gap-2">
        <BusinessStatusPill
          label={service.status}
          tone={isDraft ? 'neutral' : 'success'}
        />
      </View>
      {service.note ? (
        <View className="flex-row items-center gap-1.5 rounded-field bg-surface-subtle px-2.5 py-2">
          <Icon name="info" size={15} color={colors.textSecondary} />
          <VemtapText
            variant="caption"
            tone="secondary"
            className="min-w-0 flex-1"
            numberOfLines={2}
          >
            {service.note}
          </VemtapText>
        </View>
      ) : null}
    </View>
  );
}

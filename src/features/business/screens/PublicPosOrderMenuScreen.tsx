import React from 'react';
import { Pressable, View } from 'react-native';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { Input } from '@components/ui/Input';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { EmptyState } from '@components/shared/EmptyState';
import { ErrorState } from '@components/shared/ErrorState';
import { LoadingState } from '@components/shared/LoadingState';
import {
  BusinessActionDock,
  BusinessScreenLayout,
  BusinessStatusPill,
} from '@features/business/components/BusinessPrimitives';
import {
  BusinessChipScroller,
  BusinessCountChip,
} from '@features/business/components/BusinessOpsPrimitives';

const copy = strings.publicPosMenu;

export interface PublicMenuItemView {
  id: string;
  name: string;
  detail: string;
  price: string;
  inCart: number;
  soldOut: boolean;
}

export interface PublicPosOrderMenuView {
  venue: string;
  branch: string;
  tableLabel: string | null;
  acceptingOrders: boolean;
  prepLabel: string;
  categories: { id: string; label: string }[];
  items: PublicMenuItemView[];
  cart: { count: number; total: string };
}

export interface PublicPosOrderMenuScreenProps {
  view?: PublicPosOrderMenuView;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  search: string;
  category: string;
  onBack?: () => void;
  onSearchChange?: (text: string) => void;
  onSelectCategory?: (categoryId: string) => void;
  onAddItem?: (itemId: string) => void;
  onReviewOrder?: () => void;
}

/** Guest-facing menu for table ordering: categories, items and the running tray. */
export function PublicPosOrderMenuScreen({
  view,
  isLoading,
  isError,
  onRetry,
  search,
  category,
  onBack,
  onSearchChange,
  onSelectCategory,
  onAddItem,
  onReviewOrder,
}: PublicPosOrderMenuScreenProps) {
  return (
    <BusinessScreenLayout
      header={{ title: view?.venue || copy.headerTitle, subtitle: view?.branch, onBack }}
      contentContainerClassName="pb-8"
      footer={
        view && view.cart.count > 0 ? (
          <BusinessActionDock>
            <Button
              label={copy.reviewCta(view.cart.count, view.cart.total)}
              labelVariant="labelMd"
              disabled={!view.acceptingOrders}
              onPress={onReviewOrder}
              rightIcon={<Icon name="arrowForward" size={17} color={colors.surface} />}
            />
          </BusinessActionDock>
        ) : undefined
      }
    >
      {!view ? (
        isError ? (
          <ErrorState
            title={copy.error.title}
            description={copy.error.body}
            onRetry={onRetry}
          />
        ) : (
          <LoadingState label={isLoading ? copy.loading : undefined} />
        )
      ) : (
        <>
          <View className="flex-row flex-wrap items-center gap-2">
            {view.tableLabel ? (
              <BusinessStatusPill
                label={view.tableLabel}
                tone="brand"
                icon="tableRestaurant"
              />
            ) : null}
            <BusinessStatusPill label={view.prepLabel} tone="neutral" icon="schedule" />
          </View>
          {!view.acceptingOrders ? (
            <View className="mt-3 rounded-field bg-warning-container p-2.5">
              <VemtapText variant="caption">{copy.pausedNote}</VemtapText>
            </View>
          ) : null}

          <Input
            containerClassName="mt-3"
            placeholder={copy.searchPlaceholder}
            accessibilityLabel={copy.searchPlaceholder}
            value={search}
            onChangeText={onSearchChange}
            leadingIcon={<Icon name="search" size={18} color={colors.textTertiary} />}
          />

          <BusinessChipScroller className="mt-3">
            <BusinessCountChip
              label={copy.allLabel}
              selected={category === 'all'}
              onPress={() => onSelectCategory?.('all')}
            />
            {view.categories.map(item => (
              <BusinessCountChip
                key={item.id}
                label={item.label}
                selected={category === item.id}
                onPress={() => onSelectCategory?.(item.id)}
              />
            ))}
          </BusinessChipScroller>

          <View className="mt-3 gap-2">
            {view.items.map(item => (
              <View
                key={item.id}
                className="flex-row items-center gap-3 rounded-card bg-surface p-3 shadow-sm"
              >
                <View className="min-w-0 flex-1">
                  <VemtapText
                    variant="labelMd"
                    className="font-sans-semibold"
                    numberOfLines={2}
                  >
                    {item.name}
                  </VemtapText>
                  {item.detail ? (
                    <VemtapText variant="caption" tone="secondary" numberOfLines={2}>
                      {item.detail}
                    </VemtapText>
                  ) : null}
                  <VemtapText
                    variant="labelMd"
                    className="mt-1 font-sans-bold"
                    numberOfLines={1}
                  >
                    {item.price}
                  </VemtapText>
                </View>
                {item.soldOut ? (
                  <BusinessStatusPill label={copy.soldOut} tone="neutral" />
                ) : (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`${copy.addCta} ${item.name}`}
                    onPress={() => onAddItem?.(item.id)}
                    className="min-h-10 flex-row items-center gap-1 rounded-field bg-primary px-3 active:scale-95"
                  >
                    <Icon name="plus" size={16} color={colors.surface} />
                    <VemtapText
                      variant="labelSm"
                      className="font-sans-semibold text-surface"
                    >
                      {item.inCart ? String(item.inCart) : copy.addCta}
                    </VemtapText>
                  </Pressable>
                )}
              </View>
            ))}
          </View>

          {view.items.length === 0 ? (
            <EmptyState
              icon="menuBook"
              variant="contained"
              title={copy.empty.title}
              description={copy.empty.body}
            />
          ) : null}
        </>
      )}
    </BusinessScreenLayout>
  );
}

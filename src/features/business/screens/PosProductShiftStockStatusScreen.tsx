import React, { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { Input } from '@components/ui/Input';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { ErrorState } from '@components/shared/ErrorState';
import { LoadingState } from '@components/shared/LoadingState';
import {
  BusinessActionDock,
  BusinessInlineAction,
  BusinessScreenLayout,
  BusinessStatusPill,
} from '@features/business/components/BusinessPrimitives';
import { BusinessPanel } from '@features/business/components/BusinessOpsPrimitives';
import type { InventoryState } from '@features/business/screens/PosProductsInventoryScreen';

const copy = strings.posProductShiftStockStatus;

const STEPS = [-5, -1, 1, 5];

const stateTone = {
  ok: 'success',
  low: 'warning',
  out: 'tertiary',
  untracked: 'neutral',
} as const;

export interface StockStatusView {
  name: string;
  meta: string;
  price: string;
  stock: number | null;
  state: InventoryState;
  stateLabel: string;
  history: { id: string; title: string; detail: string; when: string }[];
}

export interface PosProductShiftStockStatusScreenProps {
  view?: StockStatusView;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  isSaving?: boolean;
  onBack?: () => void;
  onSaveCount?: (count: number) => void;
  onMarkSoldOut?: () => void;
  onAddToSale?: () => void;
  onOpenGovernance?: () => void;
}

/** One item's stock for the shift: set the count, 86 it, and see the movement log. */
export function PosProductShiftStockStatusScreen({
  view,
  isLoading,
  isError,
  onRetry,
  isSaving,
  onBack,
  onSaveCount,
  onMarkSoldOut,
  onAddToSale,
  onOpenGovernance,
}: PosProductShiftStockStatusScreenProps) {
  const [count, setCount] = useState(String(view?.stock ?? 0));
  useEffect(() => setCount(String(view?.stock ?? 0)), [view?.stock]);
  const parsed = Math.max(0, Math.floor(Number(count) || 0));
  const dirty = view?.stock != null && parsed !== view.stock;

  return (
    <BusinessScreenLayout
      header={{ title: copy.headerTitle, onBack }}
      contentContainerClassName="pb-8"
      footer={
        view ? (
          <BusinessActionDock>
            <Button
              label={copy.saveCta}
              labelVariant="labelMd"
              disabled={!dirty}
              loading={isSaving}
              onPress={() => onSaveCount?.(parsed)}
            />
            <Button
              label={`${copy.addToSaleCta} • ${view.price}`}
              labelVariant="labelSm"
              variant="secondary"
              disabled={view.state === 'out'}
              onPress={onAddToSale}
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
          <View className="gap-1">
            <VemtapText variant="headingLg" className="text-heading-lg" numberOfLines={2}>
              {view.name}
            </VemtapText>
            <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
              {view.meta}
            </VemtapText>
            <View className="mt-1 flex-row items-center gap-2">
              <VemtapText variant="labelMd" className="font-sans-bold" numberOfLines={1}>
                {view.price}
              </VemtapText>
              <BusinessStatusPill label={view.stateLabel} tone={stateTone[view.state]} />
            </View>
          </View>

          {view.stock == null ? (
            <BusinessPanel className="mt-3" title={copy.countTitle} icon="inventory">
              <VemtapText variant="caption" tone="secondary">
                {copy.untrackedBody}
              </VemtapText>
            </BusinessPanel>
          ) : (
            <BusinessPanel className="mt-3" title={copy.countTitle} icon="inventory">
              <View className="flex-row flex-wrap gap-2">
                {STEPS.map(step => (
                  <Pressable
                    key={step}
                    accessibilityRole="button"
                    accessibilityLabel={`${copy.countTitle} ${step > 0 ? '+' : ''}${step}`}
                    onPress={() => setCount(String(Math.max(0, parsed + step)))}
                    className="min-h-10 min-w-[20%] flex-1 items-center justify-center rounded-field bg-surface-container active:scale-95"
                  >
                    <VemtapText variant="labelMd" className="font-sans-semibold">
                      {`${step > 0 ? '+' : ''}${step}`}
                    </VemtapText>
                  </Pressable>
                ))}
              </View>
              <Input
                label={copy.countLabel}
                keyboardType="number-pad"
                value={count}
                onChangeText={setCount}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={copy.soldOutCta}
                onPress={onMarkSoldOut}
                disabled={view.stock === 0}
                className="min-h-11 flex-row items-center justify-center gap-2 rounded-field bg-error-container active:scale-[0.98]"
              >
                <Icon name="block" size={16} color={colors.error} />
                <VemtapText
                  variant="labelSm"
                  className="font-sans-semibold text-error"
                  numberOfLines={1}
                >
                  {copy.soldOutCta}
                </VemtapText>
              </Pressable>
            </BusinessPanel>
          )}

          <BusinessPanel className="mt-3" title={copy.auditTitle} icon="history">
            {view.history.length ? (
              <View className="gap-2">
                {view.history.map(entry => (
                  <View
                    key={entry.id}
                    className="gap-0.5 rounded-field bg-surface-subtle p-2.5"
                  >
                    <View className="flex-row items-center justify-between gap-2">
                      <VemtapText
                        variant="labelSm"
                        className="min-w-0 flex-1 font-sans-semibold"
                        numberOfLines={1}
                      >
                        {entry.title}
                      </VemtapText>
                      <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
                        {entry.when}
                      </VemtapText>
                    </View>
                    <VemtapText variant="caption" tone="secondary" numberOfLines={2}>
                      {entry.detail}
                    </VemtapText>
                  </View>
                ))}
              </View>
            ) : (
              <VemtapText variant="caption" tone="secondary">
                {copy.noHistory}
              </VemtapText>
            )}
          </BusinessPanel>

          <View className="mt-3 gap-2 rounded-card bg-surface-tint p-3">
            <VemtapText
              variant="labelMd"
              className="font-sans-semibold"
              numberOfLines={1}
            >
              {copy.governanceTitle}
            </VemtapText>
            <VemtapText variant="caption" tone="secondary" numberOfLines={3}>
              {copy.governanceBody}
            </VemtapText>
            <BusinessInlineAction
              label={copy.governanceCta}
              icon="arrowForward"
              onPress={onOpenGovernance}
            />
          </View>
        </>
      )}
    </BusinessScreenLayout>
  );
}

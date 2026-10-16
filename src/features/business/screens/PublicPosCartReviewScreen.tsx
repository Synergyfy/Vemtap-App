import React from 'react';
import { Pressable, View } from 'react-native';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { Input } from '@components/ui/Input';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { EmptyState } from '@components/shared/EmptyState';
import {
  BusinessActionDock,
  BusinessScreenLayout,
  BusinessStatusPill,
} from '@features/business/components/BusinessPrimitives';
import { BusinessPanel } from '@features/business/components/BusinessOpsPrimitives';
import {
  BusinessGrandTotalRow,
  BusinessTotalsRow,
} from '@features/business/components/BusinessPosPrimitives';
import type { TotalsRow } from '@features/business/utils/posMappers';

const copy = strings.publicPosCartReview;

export interface PublicPosCartReviewScreenProps {
  tableLabel: string | null;
  lines: { id: string; name: string; qty: number; price: string }[];
  totals: TotalsRow[];
  total: string;
  name: string;
  phone: string;
  notes: string;
  error: string | null;
  isSubmitting?: boolean;
  onBack?: () => void;
  onAddFood?: () => void;
  onChangeQty?: (lineId: string, qty: number) => void;
  onEditName?: (value: string) => void;
  onEditPhone?: (value: string) => void;
  onEditNotes?: (value: string) => void;
  onSubmitOrder?: () => void;
}

/** Guest checkout: the tray, guest details and the estimated bill, then send to the kitchen. */
export function PublicPosCartReviewScreen({
  tableLabel,
  lines,
  totals,
  total,
  name,
  phone,
  notes,
  error,
  isSubmitting,
  onBack,
  onAddFood,
  onChangeQty,
  onEditName,
  onEditPhone,
  onEditNotes,
  onSubmitOrder,
}: PublicPosCartReviewScreenProps) {
  const [firstName = ''] = name.trim().split(/\s+/);
  const ready =
    lines.length > 0 && firstName.length > 0 && phone.replace(/\D/g, '').length >= 10;
  return (
    <BusinessScreenLayout
      header={{ title: copy.headerTitle, onBack }}
      contentContainerClassName="pb-8"
      footer={
        lines.length ? (
          <BusinessActionDock>
            <Button
              label={copy.submitCta(total)}
              labelVariant="labelMd"
              disabled={!ready}
              loading={isSubmitting}
              onPress={onSubmitOrder}
            />
            <VemtapText variant="micro" tone="tertiary" className="text-center">
              {copy.submitHint}
            </VemtapText>
          </BusinessActionDock>
        ) : undefined
      }
    >
      {lines.length === 0 ? (
        <EmptyState
          icon="list"
          title={copy.empty.title}
          description={copy.empty.body}
          actionLabel={copy.addFoodCta}
          onAction={onAddFood}
        />
      ) : (
        <>
          {tableLabel ? (
            <BusinessStatusPill
              label={tableLabel}
              tone="brand"
              icon="tableRestaurant"
              className="self-start"
            />
          ) : null}

          <BusinessPanel
            className="mt-3"
            title={copy.dishesTitle(lines.length)}
            icon="restaurant"
          >
            <View className="gap-2">
              {lines.map(line => (
                <View key={line.id} className="flex-row items-center gap-2">
                  <VemtapText
                    variant="labelSm"
                    className="min-w-0 flex-1 font-sans-semibold"
                    numberOfLines={2}
                  >
                    {line.name}
                  </VemtapText>
                  <View className="flex-row items-center gap-1.5">
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`${line.name} decrease`}
                      onPress={() => onChangeQty?.(line.id, line.qty - 1)}
                      className="h-8 w-8 items-center justify-center rounded-lg bg-surface-container"
                    >
                      <Icon name="remove" size={15} color={colors.text} />
                    </Pressable>
                    <VemtapText
                      variant="labelSm"
                      className="w-5 text-center font-sans-semibold"
                    >
                      {String(line.qty)}
                    </VemtapText>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`${line.name} increase`}
                      onPress={() => onChangeQty?.(line.id, line.qty + 1)}
                      className="h-8 w-8 items-center justify-center rounded-lg bg-surface-container"
                    >
                      <Icon name="plus" size={15} color={colors.text} />
                    </Pressable>
                  </View>
                  <VemtapText
                    variant="labelSm"
                    className="w-20 text-right font-sans-semibold"
                    numberOfLines={1}
                  >
                    {line.price}
                  </VemtapText>
                </View>
              ))}
            </View>
            <Button
              label={copy.addFoodCta}
              labelVariant="labelSm"
              variant="secondary"
              size="sm"
              onPress={onAddFood}
            />
          </BusinessPanel>

          <BusinessPanel className="mt-3" title={copy.guestTitle} icon="person">
            <Input
              label={copy.nameLabel}
              value={name}
              onChangeText={onEditName}
              autoCapitalize="words"
            />
            <Input
              label={copy.phoneLabel}
              value={phone}
              onChangeText={onEditPhone}
              keyboardType="phone-pad"
            />
            <Input
              label={copy.instructionsTitle}
              value={notes}
              onChangeText={onEditNotes}
              multiline
            />
          </BusinessPanel>

          <BusinessPanel className="mt-3" title={copy.billTitle} icon="receipt">
            <View className="gap-1.5">
              {totals.map(row => (
                <BusinessTotalsRow
                  key={row.id}
                  label={row.label}
                  value={row.value}
                  tone={row.tone}
                />
              ))}
            </View>
            <BusinessGrandTotalRow label={copy.totalLabel} value={total} />
            <VemtapText variant="micro" tone="tertiary">
              {copy.payBody}
            </VemtapText>
          </BusinessPanel>

          {error ? (
            <VemtapText variant="caption" tone="error" className="mt-3">
              {error}
            </VemtapText>
          ) : null}
        </>
      )}
    </BusinessScreenLayout>
  );
}

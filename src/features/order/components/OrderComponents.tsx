import React from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type ImageSourcePropType,
} from 'react-native';
import { cssInterop } from 'nativewind';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { PRODUCT_FALLBACK_IMAGE } from '@features/home/utils/productMapper';

cssInterop(Pressable, { className: 'style' });
cssInterop(TextInput, { className: 'style' });
cssInterop(View, { className: 'style' });

export interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
}

export function QuantityStepper({ value, onChange }: QuantityStepperProps) {
  return (
    <View className="flex-row items-center gap-3 rounded-full bg-surface-container-low px-2 py-1">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={strings.productOrder.decreaseQuantity}
        disabled={value <= 1}
        onPress={() => onChange(Math.max(1, value - 1))}
        className="h-8 w-8 items-center justify-center rounded-full bg-surface shadow-sm disabled:opacity-40"
      >
        <Icon name="remove" size={18} color={colors.textSecondary} />
      </Pressable>
      <VemtapText variant="headingSm" className="w-5 text-center text-text">
        {value}
      </VemtapText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={strings.productOrder.increaseQuantity}
        onPress={() => onChange(value + 1)}
        className="h-8 w-8 items-center justify-center rounded-full bg-surface shadow-sm"
      >
        <Icon name="plus" size={18} color={colors.primary} />
      </Pressable>
    </View>
  );
}

export interface OrderLineItemProps {
  image?: ImageSourcePropType;
  title: string;
  description: string;
  price: string;
  quantity: number;
  badge?: string;
}

export function OrderLineItem({
  image,
  title,
  description,
  price,
  quantity,
  badge,
}: OrderLineItemProps) {
  const source = image ?? { uri: PRODUCT_FALLBACK_IMAGE };
  return (
    <View className="flex-row gap-3">
      <Image source={source} style={styles.lineImage} resizeMode="cover" />
      <View className="min-w-0 flex-1">
        <View className="flex-row items-start justify-between gap-2">
          <VemtapText
            variant="labelMd"
            numberOfLines={2}
            className="min-w-0 flex-1 font-sans-semibold text-text"
          >
            {title}
          </VemtapText>
          <VemtapText variant="labelMd" className="shrink-0 font-sans-semibold text-text">
            {price}
          </VemtapText>
        </View>
        <VemtapText variant="caption" tone="secondary" className="mt-0.5">
          {description}
        </VemtapText>
        <View className="mt-1.5 flex-row flex-wrap items-center gap-2">
          <VemtapText variant="labelSm" tone="tertiary">
            {strings.productOrder.quantityLabel} {quantity}
          </VemtapText>
          {badge ? (
            <>
              <View className="h-1 w-1 rounded-full bg-outline-variant" />
              <VemtapText variant="caption" tone="success">
                {badge}
              </VemtapText>
            </>
          ) : null}
        </View>
      </View>
    </View>
  );
}

export interface PriceRow {
  label: string;
  value: string;
  tone?: 'default' | 'success';
}

export interface PriceBreakdownProps {
  rows: PriceRow[];
  totalLabel: string;
  totalCaption?: string;
  total: string;
}

export function PriceBreakdown({
  rows,
  totalLabel,
  totalCaption,
  total,
}: PriceBreakdownProps) {
  return (
    <View className="gap-2 rounded-card bg-surface p-4 shadow-sm">
      {rows.map(row => (
        <View key={row.label} className="flex-row items-center justify-between gap-3">
          <VemtapText
            variant="bodyMd"
            numberOfLines={2}
            className={`min-w-0 flex-1 ${row.tone === 'success' ? 'text-success' : 'text-text-secondary'}`}
          >
            {row.label}
          </VemtapText>
          <VemtapText
            variant="bodyMd"
            numberOfLines={1}
            className={`shrink-0 ${row.tone === 'success' ? 'text-success' : 'text-text'}`}
          >
            {row.value}
          </VemtapText>
        </View>
      ))}
      <View className="my-1 h-px bg-surface-container" />
      <View className="flex-row items-end justify-between gap-3">
        <View className="min-w-0 flex-1">
          <VemtapText variant="labelMd" className="font-sans-semibold text-text">
            {totalLabel}
          </VemtapText>
          {totalCaption ? (
            <VemtapText variant="caption" tone="secondary" className="mt-0.5">
              {totalCaption}
            </VemtapText>
          ) : null}
        </View>
        <VemtapText
          accessibilityRole="header"
          variant="headingMd"
          className="shrink-0 text-heading-md text-primary"
        >
          {total}
        </VemtapText>
      </View>
    </View>
  );
}

export interface NumberedInstruction {
  title: string;
  body: string;
  emphasized?: boolean;
}

export function NumberedInstructions({ items }: { items: NumberedInstruction[] }) {
  return (
    <View className="gap-4">
      {items.map((item, index) => (
        <View key={item.title} className="flex-row items-start gap-3">
          <View
            className={`h-6 w-6 shrink-0 items-center justify-center rounded-full ${
              item.emphasized ? 'bg-success-container' : 'bg-surface-container-high'
            }`}
          >
            <VemtapText
              variant="labelSm"
              className={`font-sans-bold ${item.emphasized ? 'text-success' : 'text-primary'}`}
            >
              {index + 1}
            </VemtapText>
          </View>
          <View className="min-w-0 flex-1">
            <VemtapText variant="labelMd" className="font-sans-semibold text-text">
              {item.title}
            </VemtapText>
            <VemtapText
              variant="caption"
              tone="secondary"
              className="mt-0.5 leading-relaxed"
            >
              {item.body}
            </VemtapText>
          </View>
        </View>
      ))}
    </View>
  );
}

export function OrderNotesField({
  value,
  onChangeText,
}: {
  value: string;
  onChangeText: (value: string) => void;
}) {
  return (
    <View className="flex-row items-start gap-2 rounded-lg bg-surface-subtle px-4 py-3">
      <Icon name="edit" size={20} color={colors.textTertiary} />
      <TextInput
        accessibilityLabel={strings.productOrder.notesLabel}
        value={value}
        onChangeText={onChangeText}
        placeholder={strings.productOrder.notesPlaceholder}
        placeholderTextColor={colors.textTertiary}
        multiline
        className="min-h-[48px] flex-1 p-0 text-body-md text-text"
      />
    </View>
  );
}

export function OrderPaymentCallout({ total }: { total: string }) {
  return (
    <View className="rounded-card bg-surface-container-high p-4 shadow-sm">
      <View className="flex-row items-start gap-3">
        <Icon name="wallet" size={24} color={colors.primary} />
        <View className="min-w-0 flex-1">
          <VemtapText variant="labelMd" className="font-sans-bold text-text">
            {strings.productOrder.payDirectlyTitle}
          </VemtapText>
          <VemtapText variant="bodyMd" tone="secondary" className="mt-1 leading-relaxed">
            {strings.productOrder.payDirectlyBody(total)}
          </VemtapText>
          <View className="mt-2 flex-row flex-wrap gap-2">
            {[
              strings.productOrder.posReady,
              strings.productOrder.cashAccepted,
              strings.productOrder.bankTransfer,
            ].map(label => (
              <View key={label} className="rounded bg-surface px-2 py-1">
                <VemtapText variant="caption" tone="secondary">
                  {label}
                </VemtapText>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  lineImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: colors.surfaceContainer,
  },
});

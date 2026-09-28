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
import { Icon, type IconName } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { orderImages } from '@features/order/orderData';

cssInterop(Pressable, { className: 'style' });
cssInterop(TextInput, { className: 'style' });
cssInterop(View, { className: 'style' });

export interface SelectionRowProps {
  title: string;
  description?: string;
  selected: boolean;
  multiple?: boolean;
  value?: string;
  onPress: () => void;
}

export function SelectionRow({
  title,
  description,
  selected,
  multiple = false,
  value,
  onPress,
}: SelectionRowProps) {
  return (
    <Pressable
      accessibilityRole={multiple ? 'checkbox' : 'radio'}
      accessibilityState={{ checked: selected, selected }}
      onPress={onPress}
      className={`flex-row items-center gap-3 rounded-card p-3.5 shadow-sm ${
        selected ? 'bg-surface-tint' : 'bg-surface'
      }`}
    >
      <View
        className={`h-5 w-5 shrink-0 items-center justify-center ${
          multiple ? 'rounded-md' : 'rounded-full'
        } ${selected ? 'bg-primary' : 'bg-surface-container-high'}`}
      >
        {selected ? (
          multiple ? (
            <Icon name="check" size={15} color={colors.surface} />
          ) : (
            <View className="h-2 w-2 rounded-full bg-surface" />
          )
        ) : null}
      </View>
      <View className="min-w-0 flex-1">
        <VemtapText variant="labelMd" className="font-sans-semibold text-text">
          {title}
        </VemtapText>
        {description ? (
          <VemtapText variant="caption" tone="secondary" className="mt-0.5">
            {description}
          </VemtapText>
        ) : null}
      </View>
      {value ? (
        <VemtapText
          variant="labelMd"
          className="shrink-0 font-sans-semibold text-primary"
        >
          {value}
        </VemtapText>
      ) : null}
    </Pressable>
  );
}

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
  const source = image ?? { uri: orderImages.steak };
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

export interface MerchantAction {
  icon: IconName;
  label: string;
  onPress: () => void;
  success?: boolean;
}

export function MerchantActions({ actions }: { actions: MerchantAction[] }) {
  return (
    <View className="flex-row gap-2">
      {actions.map(action => (
        <Pressable
          key={action.label}
          accessibilityRole="button"
          accessibilityLabel={action.label}
          onPress={action.onPress}
          className="min-h-[72px] flex-1 items-center justify-center gap-1 rounded-lg bg-surface-subtle px-2 py-3 active:bg-surface-container"
        >
          <Icon
            name={action.icon}
            size={21}
            color={action.success ? colors.badgeDiscountText : colors.primary}
          />
          <VemtapText
            variant="labelSm"
            className="text-center font-sans-semibold text-text"
          >
            {action.label}
          </VemtapText>
        </Pressable>
      ))}
    </View>
  );
}

export function ContactField() {
  return (
    <View className="flex-row items-center gap-2 rounded-lg bg-surface-subtle px-4 py-3">
      <Icon name="phone" size={20} color={colors.textTertiary} />
      <VemtapText variant="bodyMd" className="min-w-0 flex-1 text-text">
        {strings.productOrder.phone}
      </VemtapText>
      <View className="flex-row items-center gap-1">
        <Icon name="lock" size={14} color={colors.primary} />
        <VemtapText variant="labelSm" tone="brand">
          {strings.productOrder.verified}
        </VemtapText>
      </View>
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

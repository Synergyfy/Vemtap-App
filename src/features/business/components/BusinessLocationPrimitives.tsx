import React, { type ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { Icon, type IconName } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';
import { BusinessStatusPill, type BusinessPillTone } from './BusinessPrimitives';
import { BusinessCurrencyField } from './BusinessOpsPrimitives';

cssInterop(View, { className: 'style' });
cssInterop(Pressable, { className: 'style' });

export interface BusinessBranchPricingCardProps {
  name: string;
  address: string;
  /** Tag rendered next to the branch name (`Headquarters`, `Renovation`, …). */
  tag?: string;
  tagTone?: BusinessPillTone;
  /** Availability pill on the right of the header row. */
  status?: string;
  statusTone?: BusinessPillTone;
  enabled: boolean;
  onToggle?: (value: boolean) => void;
  disabled?: boolean;
  /** Leading index or status marker (`#1`, a pulsing live dot). */
  marker?: 'index' | 'live' | 'muted';
  markerLabel?: string;
  /** Price block. Omit for unavailable branches. */
  priceLabel?: string;
  priceBadge?: string;
  priceBadgeTone?: BusinessPillTone;
  dealPrice?: string;
  onChangeDealPrice?: (value: string) => void;
  originalPrice?: string;
  originalTag?: string;
  discountLabel?: string;
  vouchers?: string;
  /** Slot under the price grid (override deal, telemetry chips, allocations). */
  children?: ReactNode;
  /** Slot shown instead of the price grid when the branch cannot trade. */
  unavailable?: ReactNode;
  className?: string;
}

/**
 * One branch row for every location-assignment surface (deal assignment,
 * product location pricing, branch availability). Availability lives in the
 * header switch; pricing, telemetry and downtime notices are slots, so the
 * three designs share a shell without forking the card.
 */
export function BusinessBranchPricingCard({
  name,
  address,
  tag,
  tagTone = 'neutral',
  status,
  statusTone = 'success',
  enabled,
  onToggle,
  disabled = false,
  marker = 'live',
  markerLabel,
  priceLabel,
  priceBadge,
  priceBadgeTone = 'success',
  dealPrice,
  onChangeDealPrice,
  originalPrice,
  originalTag,
  discountLabel,
  vouchers,
  children,
  unavailable,
  className,
}: BusinessBranchPricingCardProps) {
  const surface = enabled && !disabled ? 'bg-surface' : 'bg-surface-container-low';
  return (
    <View className={`gap-3 rounded-card p-3 shadow-sm ${surface} ${className}`}>
      <View className="flex-row items-center gap-3">
        {marker === 'index' ? (
          <View className="h-6 min-w-6 items-center justify-center rounded-md bg-surface-container px-1.5">
            <VemtapText
              variant="micro"
              className="font-sans-semibold text-text-secondary"
            >
              {markerLabel}
            </VemtapText>
          </View>
        ) : (
          <View
            className={`h-2.5 w-2.5 shrink-0 rounded-full ${
              marker === 'muted'
                ? 'bg-surface-container-highest'
                : 'bg-badge-discount-text'
            }`}
          />
        )}
        <View className="min-w-0 flex-1">
          <View className="flex-row flex-wrap items-center gap-1.5">
            <VemtapText
              variant="labelMd"
              className={`min-w-0 font-sans-semibold ${!enabled ? 'text-text-secondary' : ''}`}
              numberOfLines={1}
            >
              {name}
            </VemtapText>
            {tag ? <BusinessStatusPill label={tag} tone={tagTone} /> : null}
          </View>
          <View className="mt-0.5 flex-row items-center gap-1.5">
            <Icon name="locationOn" size={13} color={colors.textTertiary} />
            <VemtapText
              variant="caption"
              tone={enabled ? 'secondary' : 'tertiary'}
              className="min-w-0 flex-1"
              numberOfLines={1}
            >
              {address}
            </VemtapText>
          </View>
        </View>
        {status ? <BusinessStatusPill label={status} tone={statusTone} /> : null}
        {onToggle ? (
          <Pressable
            accessibilityRole="switch"
            accessibilityState={{ checked: enabled, disabled }}
            accessibilityLabel={name}
            disabled={disabled}
            onPress={() => onToggle(!enabled)}
            className={`h-7 w-12 shrink-0 flex-row items-center rounded-full px-1 ${
              enabled && !disabled ? 'bg-primary' : 'bg-surface-container-highest'
            } ${disabled ? 'opacity-60' : ''}`}
          >
            <View
              className={`h-5 w-5 items-center justify-center rounded-full bg-surface shadow-sm ${
                enabled && !disabled ? 'ml-auto' : ''
              }`}
            >
              <Icon
                name={enabled && !disabled ? 'check' : 'close'}
                size={13}
                color={enabled && !disabled ? colors.primary : colors.outline}
              />
            </View>
          </Pressable>
        ) : null}
      </View>

      {unavailable ?? null}

      {dealPrice !== undefined ? (
        <View className="gap-2 rounded-field bg-surface-container-low p-3">
          <View className="flex-row items-center justify-between gap-2">
            <VemtapText
              variant="caption"
              tone="secondary"
              numberOfLines={1}
              className="min-w-0 flex-1"
            >
              {priceLabel}
            </VemtapText>
            {priceBadge ? (
              <BusinessStatusPill label={priceBadge} tone={priceBadgeTone} />
            ) : null}
          </View>
          <View className="flex-row gap-2">
            <BusinessCurrencyField
              value={dealPrice}
              onChangeText={onChangeDealPrice ?? (() => undefined)}
              accessibilityLabel={priceLabel}
              className="flex-1"
            />
            {originalPrice ? (
              <View className="flex-1 gap-1.5">
                <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                  {originalTag}
                </VemtapText>
                <View className="min-h-[44px] flex-row items-center justify-between gap-2 rounded-field bg-surface-container-highest px-3">
                  <VemtapText
                    variant="bodyMd"
                    tone="secondary"
                    className="line-through"
                    numberOfLines={1}
                  >
                    {originalPrice}
                  </VemtapText>
                </View>
              </View>
            ) : null}
          </View>
          {discountLabel || vouchers ? (
            <View className="flex-row items-center justify-between gap-2">
              {discountLabel ? (
                <View className="flex-row items-center gap-1.5">
                  <Icon name="localOffer" size={14} color={colors.badgeDiscountText} />
                  <VemtapText
                    variant="caption"
                    className="font-sans-semibold text-badge-discount-text"
                    numberOfLines={1}
                  >
                    {discountLabel}
                  </VemtapText>
                </View>
              ) : null}
              {vouchers ? (
                <View className="flex-row items-center gap-1.5">
                  <Icon name="confirmation" size={14} color={colors.textTertiary} />
                  <VemtapText variant="caption" className="font-sans-semibold">
                    {vouchers}
                  </VemtapText>
                  <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                    / day
                  </VemtapText>
                </View>
              ) : null}
            </View>
          ) : null}
        </View>
      ) : null}

      {children}
    </View>
  );
}

export interface BusinessCheckLineProps {
  label: string;
  checked: boolean;
  onPress?: () => void;
  tone?: 'default' | 'brand';
  icon?: IconName;
  className?: string;
}

/** Per-branch "use a different price" checkbox line. */
export function BusinessCheckLine({
  label,
  checked,
  onPress,
  tone = 'default',
  icon,
  className,
}: BusinessCheckLineProps) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={label}
      onPress={onPress}
      className={`flex-row items-center gap-2.5 rounded-field p-3 active:scale-[0.99] ${
        tone === 'brand' ? 'bg-surface-tint' : 'bg-surface-subtle'
      } ${className}`}
    >
      <View
        className={`h-5 w-5 shrink-0 items-center justify-center rounded-md ${
          checked ? 'bg-primary' : 'bg-surface-container'
        }`}
      >
        {checked ? <Icon name="check" size={13} color={colors.surface} /> : null}
      </View>
      <View className="min-w-0 flex-1">
        <VemtapText
          variant="labelSm"
          className={
            tone === 'brand' ? 'font-sans-semibold text-primary' : 'text-text-secondary'
          }
          numberOfLines={2}
        >
          {label}
        </VemtapText>
      </View>
      {icon ? <Icon name={icon} size={16} color={colors.textTertiary} /> : null}
    </Pressable>
  );
}

export interface BusinessKeyValueTileProps {
  label: string;
  value: string;
  icon?: IconName;
  className?: string;
}

/** Two-line metadata tile (stock, prep time, fulfillment). */
export function BusinessKeyValueTile({
  label,
  value,
  icon,
  className,
}: BusinessKeyValueTileProps) {
  return (
    <View
      className={`min-w-0 flex-1 flex-row items-center gap-2 rounded-field bg-surface-subtle p-2.5 ${className}`}
    >
      {icon ? <Icon name={icon} size={17} color={colors.textTertiary} /> : null}
      <View className="min-w-0 flex-1">
        <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
          {label}
        </VemtapText>
        <VemtapText variant="labelSm" className="font-sans-medium" numberOfLines={1}>
          {value}
        </VemtapText>
      </View>
    </View>
  );
}

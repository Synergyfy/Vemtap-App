import React, { useState, type ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  TextInput,
  View,
  type KeyboardTypeOptions,
} from 'react-native';
import { cssInterop } from 'nativewind';
import { Icon, type IconName } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';
import { cn } from '@utils/cn';
import {
  BusinessStatusPill,
  type BusinessPillTone,
  SetupCard,
} from './BusinessPrimitives';

cssInterop(View, { className: 'style' });
cssInterop(Pressable, { className: 'style' });
cssInterop(TextInput, { className: 'style' });
cssInterop(ScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});

/* -------------------------------------------------------------------------- */
/* Panel                                                                      */
/* -------------------------------------------------------------------------- */

export interface BusinessPanelProps {
  title?: string;
  /** Uppercase micro label above the title (section eyebrows). */
  eyebrow?: string;
  subtitle?: string;
  icon?: IconName;
  badge?: string;
  badgeTone?: BusinessPillTone;
  trailing?: ReactNode;
  children?: ReactNode;
  tone?: 'canvas' | 'low' | 'subtle' | 'tint';
  className?: string;
}

const panelTone: Record<NonNullable<BusinessPanelProps['tone']>, string> = {
  canvas: 'bg-surface',
  low: 'bg-surface-container-low',
  subtle: 'bg-surface-subtle',
  tint: 'bg-surface-tint',
};

/**
 * Canonical content card for the business management surfaces. Extends
 * `SetupCard` (which stays the untyped surface) with the heading block that
 * every panel in the ops screens repeats: eyebrow, title, subtitle, badge and a
 * trailing slot.
 */
export function BusinessPanel({
  title,
  eyebrow,
  subtitle,
  icon,
  badge,
  badgeTone = 'brand',
  trailing,
  children,
  tone = 'canvas',
  className,
}: BusinessPanelProps) {
  const hasHeading = Boolean(title || eyebrow || subtitle || badge || icon);
  return (
    <SetupCard className={cn('gap-3', panelTone[tone], className)}>
      {hasHeading ? (
        <View className="flex-row items-start justify-between gap-3">
          <View className="min-w-0 flex-1 flex-row items-start gap-2">
            {icon ? (
              <View className="mt-0.5 shrink-0">
                <Icon name={icon} size={19} color={colors.primary} />
              </View>
            ) : null}
            <View className="min-w-0 flex-1">
              {eyebrow ? (
                <VemtapText
                  variant="micro"
                  tone="tertiary"
                  className="font-sans-semibold uppercase tracking-wider"
                >
                  {eyebrow}
                </VemtapText>
              ) : null}
              {title ? (
                <VemtapText
                  variant="labelMd"
                  className={cn('font-sans-semibold', eyebrow ? 'mt-0.5' : null)}
                  numberOfLines={2}
                >
                  {title}
                </VemtapText>
              ) : null}
              {subtitle ? (
                <VemtapText variant="caption" tone="secondary" className="mt-0.5">
                  {subtitle}
                </VemtapText>
              ) : null}
            </View>
          </View>
          {badge ? (
            <View className="shrink-0">
              <BusinessStatusPill label={badge} tone={badgeTone} />
            </View>
          ) : null}
          {trailing ? <View className="shrink-0">{trailing}</View> : null}
        </View>
      ) : null}
      {children}
    </SetupCard>
  );
}

/* -------------------------------------------------------------------------- */
/* Menu row                                                                   */
/* -------------------------------------------------------------------------- */

export type BusinessMenuAccent =
  'brand' | 'discount' | 'tertiary' | 'secondary' | 'neutral';

export const businessMenuAccentTile: Record<BusinessMenuAccent, string> = {
  brand: 'bg-surface-tint',
  discount: 'bg-badge-discount-bg',
  tertiary: 'bg-tertiary-fixed',
  secondary: 'bg-secondary-fixed',
  neutral: 'bg-surface-container-high',
};

export const businessMenuAccentIcon: Record<BusinessMenuAccent, string> = {
  brand: colors.primary,
  discount: colors.badgeDiscountText,
  tertiary: colors.tertiary,
  secondary: colors.secondary,
  neutral: colors.text,
};

export interface BusinessMenuMeta {
  label: string;
  tone?: BusinessPillTone;
}

export interface BusinessMenuRowProps {
  title: string;
  subtitle?: string;
  icon: IconName;
  accent?: BusinessMenuAccent;
  meta?: BusinessMenuMeta[];
  onPress?: () => void;
  showChevron?: boolean;
  className?: string;
}

/**
 * Icon tile + title + subtitle + meta pills + chevron. Single owner of the
 * business management menu list so the hub rows and any future navigation
 * surface cannot drift apart.
 */
export function BusinessMenuRow({
  title,
  subtitle,
  icon,
  accent = 'brand',
  meta = [],
  onPress,
  showChevron = true,
  className,
}: BusinessMenuRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      className={cn(
        'flex-row items-center gap-3 rounded-card-lg bg-surface p-3 shadow-sm active:scale-[0.99]',
        className,
      )}
    >
      <View
        className={cn(
          'h-11 w-11 shrink-0 items-center justify-center rounded-xl',
          businessMenuAccentTile[accent],
        )}
      >
        <Icon name={icon} size={22} color={businessMenuAccentIcon[accent]} />
      </View>
      <View className="min-w-0 flex-1">
        <View className="flex-row items-center gap-2">
          <VemtapText
            variant="labelMd"
            className="min-w-0 flex-1 font-sans-semibold"
            numberOfLines={1}
          >
            {title}
          </VemtapText>
          {showChevron ? (
            <View className="shrink-0">
              <Icon name="forward" size={18} color={colors.textTertiary} />
            </View>
          ) : null}
        </View>
        {subtitle ? (
          <VemtapText
            variant="caption"
            tone="secondary"
            className="mt-0.5"
            numberOfLines={2}
          >
            {subtitle}
          </VemtapText>
        ) : null}
        {meta.length ? (
          <View className="mt-1.5 flex-row flex-wrap items-center gap-1.5">
            {meta.map(pill => (
              <BusinessStatusPill
                key={pill.label}
                label={pill.label}
                tone={pill.tone ?? 'neutral'}
              />
            ))}
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

/* -------------------------------------------------------------------------- */
/* Stat tile                                                                  */
/* -------------------------------------------------------------------------- */

export interface BusinessStatTileProps {
  label: string;
  value: string;
  icon?: IconName;
  /** Optional live dot rendered before the value. */
  live?: boolean;
  accent?: 'brand' | 'tertiary' | 'success';
  onPress?: () => void;
  className?: string;
}

export const businessStatTileAccent: Record<
  NonNullable<BusinessStatTileProps['accent']>,
  string
> = {
  brand: 'bg-surface-tint',
  tertiary: 'bg-tertiary-fixed',
  success: 'bg-badge-discount-bg',
};

export const businessStatTileIcon: Record<
  NonNullable<BusinessStatTileProps['accent']>,
  string
> = {
  brand: colors.primary,
  tertiary: colors.tertiaryContainer,
  success: colors.badgeDiscountText,
};

/** Icon + caption label + semibold value. Used by hub stat mosaics. */
export function BusinessStatTile({
  label,
  value,
  icon,
  live = false,
  accent = 'brand',
  onPress,
  className,
}: BusinessStatTileProps) {
  const Wrapper = onPress ? Pressable : View;
  return (
    <Wrapper
      {...(onPress
        ? { accessibilityRole: 'button' as const, accessibilityLabel: label }
        : {})}
      onPress={onPress}
      className={cn(
        'min-w-0 flex-1 gap-1.5 rounded-card bg-surface p-3 shadow-sm',
        className,
      )}
    >
      {icon ? (
        <View
          className={cn(
            'h-9 w-9 shrink-0 items-center justify-center rounded-lg',
            businessStatTileAccent[accent],
          )}
        >
          <Icon name={icon} size={19} color={businessStatTileIcon[accent]} />
        </View>
      ) : null}
      <View className="min-w-0">
        <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
          {label}
        </VemtapText>
        <View className="mt-0.5 flex-row items-center gap-1.5">
          {live ? (
            <View className="h-2 w-2 shrink-0 rounded-full bg-badge-discount-text" />
          ) : null}
          <VemtapText
            variant="labelMd"
            className="min-w-0 flex-1 font-sans-semibold"
            numberOfLines={1}
          >
            {value}
          </VemtapText>
        </View>
      </View>
    </Wrapper>
  );
}

/* -------------------------------------------------------------------------- */
/* Branch / location scope picker                                             */
/* -------------------------------------------------------------------------- */

export interface BusinessScopeOption {
  label: string;
  value: string;
  meta?: string;
}

export interface BusinessScopePickerProps {
  label: string;
  value: string;
  options: BusinessScopeOption[];
  onChange: (value: string) => void;
  icon?: IconName;
  accessibilityLabel?: string;
  className?: string;
}

/**
 * Pill trigger + anchored flyout used to scope a business surface to a branch.
 * One owner for the pattern so the catalogue, deals, CRM, loyalty and staff
 * surfaces all resolve scope the same way.
 */
export function BusinessScopePicker({
  label,
  value,
  options,
  onChange,
  icon = 'store',
  accessibilityLabel,
  className,
}: BusinessScopePickerProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find(option => option.value === value) ?? options[0];

  return (
    <View className={cn('relative z-20 shrink-0', className)}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={accessibilityLabel ?? label}
        onPress={() => setOpen(current => !current)}
        className="max-w-[190px] flex-row items-center gap-1.5 rounded-full bg-surface-container-high px-3 py-1.5 shadow-sm active:scale-95"
      >
        <Icon name={icon} size={16} color={colors.primary} />
        <VemtapText
          variant="labelSm"
          className="min-w-0 flex-1 font-sans-semibold"
          numberOfLines={1}
        >
          {selected?.label ?? value}
        </VemtapText>
        <Icon
          name="expandMore"
          size={16}
          color={colors.textSecondary}
          style={open ? rotateStyles.open : undefined}
        />
      </Pressable>
      {open ? (
        <View className="absolute left-0 top-full z-30 mt-1.5 w-64 gap-1 rounded-xl bg-surface p-1.5 shadow-xl">
          {options.map(option => {
            const isSelected = option.value === value;
            return (
              <Pressable
                key={option.value}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={option.label}
                onPress={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={cn(
                  'flex-row items-center justify-between gap-2 rounded-lg px-3 py-2 active:bg-surface-subtle',
                  isSelected && 'bg-surface-tint',
                )}
              >
                <VemtapText
                  variant="labelSm"
                  className={cn(
                    'min-w-0 flex-1',
                    isSelected && 'font-sans-semibold text-primary',
                  )}
                  numberOfLines={1}
                >
                  {option.label}
                </VemtapText>
                {option.meta ? (
                  <VemtapText variant="caption" tone="tertiary" className="shrink-0">
                    {option.meta}
                  </VemtapText>
                ) : null}
                {isSelected ? (
                  <View className="shrink-0">
                    <Icon name="check" size={16} color={colors.primary} />
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const rotateStyles = { open: { transform: [{ rotate: '180deg' }] } };

/* -------------------------------------------------------------------------- */
/* Segmented tabs                                                             */
/* -------------------------------------------------------------------------- */

export interface BusinessSegmentTab {
  key: string;
  label: string;
  count?: number | string;
  icon?: IconName;
}

export interface BusinessSegmentTabsProps {
  tabs: BusinessSegmentTab[];
  value: string;
  onChange: (key: string) => void;
  /** `rounded` matches the pill track, `segmented` the inset-pill track. */
  shape?: 'segmented' | 'rounded';
  accessibilityLabel: string;
  className?: string;
}

/** Single-select segmented control with optional count badges. */
export function BusinessSegmentTabs({
  tabs,
  value,
  onChange,
  shape = 'segmented',
  accessibilityLabel,
  className,
}: BusinessSegmentTabsProps) {
  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
      className={cn(
        'flex-row gap-1 p-1',
        shape === 'segmented'
          ? 'rounded-xl bg-surface-container-low'
          : 'rounded-full bg-surface-container-high',
        className,
      )}
    >
      {tabs.map(tab => {
        const active = tab.key === value;
        return (
          <Pressable
            key={tab.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={tab.label}
            onPress={() => onChange(tab.key)}
            className={cn(
              'min-h-9 flex-1 flex-row items-center justify-center gap-1.5',
              shape === 'segmented' ? 'rounded-lg' : 'rounded-full',
              active ? 'bg-surface shadow-sm' : 'active:bg-surface-container',
            )}
          >
            {tab.icon ? (
              <Icon
                name={tab.icon}
                size={15}
                color={active ? colors.primary : colors.textSecondary}
              />
            ) : null}
            <VemtapText
              variant="labelSm"
              className={cn(
                active ? 'font-sans-semibold text-primary' : 'text-text-secondary',
              )}
              numberOfLines={1}
            >
              {tab.label}
            </VemtapText>
            {typeof tab.count === 'string' || typeof tab.count === 'number' ? (
              <View
                className={cn(
                  'min-w-5 items-center rounded-full px-1.5 py-0.5',
                  active ? 'bg-surface-tint' : 'bg-surface-container',
                )}
              >
                <VemtapText
                  variant="micro"
                  className={cn(
                    'font-sans-semibold',
                    active ? 'text-primary' : 'text-text-secondary',
                  )}
                >
                  {String(tab.count)}
                </VemtapText>
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* Scope radio card                                                           */
/* -------------------------------------------------------------------------- */

export interface BusinessScopeCardProps {
  title: string;
  body?: string;
  tag?: string;
  selected: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
  /** `radio` is single-select (default); `checkbox` allows multi-select. */
  type?: 'radio' | 'checkbox';
  /** Rich leading adornment such as a media thumbnail or avatar. */
  leading?: ReactNode;
  /** Leading glyph well, used when no custom `leading` node is supplied. */
  icon?: IconName;
  /** Extra content rendered under the title/body, e.g. price and meta rows. */
  children?: ReactNode;
  className?: string;
}

/** Availability scope card: single-select by default, multi-select via `type`. */
export function BusinessScopeCard({
  title,
  body,
  tag,
  selected,
  onPress,
  accessibilityLabel,
  type = 'radio',
  leading,
  icon,
  children,
  className,
}: BusinessScopeCardProps) {
  return (
    <Pressable
      accessibilityRole={type}
      accessibilityState={type === 'checkbox' ? { checked: selected } : { selected }}
      accessibilityLabel={accessibilityLabel ?? title}
      onPress={onPress}
      className={cn(
        'flex-row items-start gap-3 rounded-card p-3 shadow-sm',
        selected ? 'bg-surface-tint' : 'bg-surface',
        className,
      )}
    >
      {leading ??
        (icon ? (
          <View className="mt-0.5 h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-container">
            <Icon name={icon} size={16} color={colors.textSecondary} />
          </View>
        ) : null)}
      <View
        className={cn(
          'mt-0.5 h-5 w-5 shrink-0 items-center justify-center',
          type === 'checkbox' ? 'rounded-[5px]' : 'rounded-full',
          selected ? 'bg-primary' : 'bg-surface-container-highest',
        )}
      >
        {selected ? (
          type === 'checkbox' ? (
            <Icon name="check" size={13} color={colors.surface} />
          ) : (
            <View className="h-2 w-2 rounded-full bg-surface" />
          )
        ) : null}
      </View>
      <View className="min-w-0 flex-1">
        <View className="flex-row flex-wrap items-center gap-2">
          <VemtapText
            variant="labelMd"
            className={cn('min-w-0 font-sans-semibold', selected && 'text-primary')}
          >
            {title}
          </VemtapText>
          {tag ? (
            <View className="rounded-full bg-surface-container px-2 py-0.5">
              <VemtapText
                variant="micro"
                className="font-sans-semibold text-text-secondary"
              >
                {tag}
              </VemtapText>
            </View>
          ) : null}
        </View>
        {body ? (
          <VemtapText variant="caption" tone="secondary" className="mt-0.5 leading-snug">
            {body}
          </VemtapText>
        ) : null}
        {children}
      </View>
    </Pressable>
  );
}

/* -------------------------------------------------------------------------- */
/* Currency field                                                             */
/* -------------------------------------------------------------------------- */

export interface BusinessCurrencyFieldProps {
  label?: string;
  value: string;
  onChangeText: (value: string) => void;
  accessibilityLabel?: string;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  readOnly?: boolean;
  trailing?: ReactNode;
  className?: string;
}

/** Naira-prefixed numeric field used across every pricing matrix. */
export function BusinessCurrencyField({
  label,
  value,
  onChangeText,
  accessibilityLabel,
  placeholder,
  keyboardType = 'numeric',
  readOnly = false,
  trailing,
  className,
}: BusinessCurrencyFieldProps) {
  return (
    <View className={cn('min-w-0 gap-1.5', className)}>
      {label ? (
        <VemtapText variant="caption" tone="secondary">
          {label}
        </VemtapText>
      ) : null}
      <View className="min-h-[44px] flex-row items-center gap-1 rounded-field bg-surface-subtle px-3">
        <VemtapText
          variant="labelMd"
          tone="secondary"
          className="shrink-0 font-sans-semibold"
        >
          ₦
        </VemtapText>
        <TextInput
          accessibilityLabel={accessibilityLabel ?? label}
          value={value}
          onChangeText={onChangeText}
          editable={!readOnly}
          keyboardType={keyboardType}
          placeholder={placeholder}
          placeholderTextColor={colors.textTertiary}
          underlineColorAndroid="transparent"
          className="min-w-[40px] flex-1 text-body-md text-text"
        />
        {trailing ? <View className="ml-1 shrink-0">{trailing}</View> : null}
      </View>
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* Progress meter                                                             */
/* -------------------------------------------------------------------------- */

export interface BusinessProgressMeterProps {
  label: string;
  value: string;
  percent: number;
  filledLabel?: string;
  remainingLabel?: string;
  /** Overrides the primary fill colour for urgency states. */
  tone?: 'primary' | 'tertiary';
  className?: string;
}

/** Labelled progress bar with the design's split filled/remaining legend. */
export function BusinessProgressMeter({
  label,
  value,
  percent,
  filledLabel,
  remainingLabel,
  tone = 'primary',
  className,
}: BusinessProgressMeterProps) {
  const safePercent = Math.max(0, Math.min(100, percent));
  return (
    <View className={cn('gap-1.5 rounded-field bg-surface-container-low p-3', className)}>
      <View className="flex-row items-center justify-between gap-2">
        <VemtapText variant="labelSm" tone="secondary">
          {label}
        </VemtapText>
        <VemtapText variant="labelSm" className="font-sans-semibold text-primary">
          {value}
        </VemtapText>
      </View>
      <View className="h-2 w-full flex-row overflow-hidden rounded-full bg-surface-container">
        <View
          className={cn(
            'h-2 rounded-full',
            tone === 'primary' ? 'bg-primary' : 'bg-tertiary',
          )}
          style={{ width: `${safePercent}%` }}
        />
        <View
          className="bg-secondary-fixed-dim h-2 rounded-full"
          style={{ width: `${100 - safePercent}%` }}
        />
      </View>
      {filledLabel || remainingLabel ? (
        <View className="flex-row items-center justify-between gap-2">
          <VemtapText
            variant="caption"
            tone="secondary"
            numberOfLines={1}
            className="min-w-0 flex-1"
          >
            {filledLabel}
          </VemtapText>
          <VemtapText
            variant="caption"
            tone="secondary"
            numberOfLines={1}
            className="min-w-0 flex-1 text-right"
          >
            {remainingLabel}
          </VemtapText>
        </View>
      ) : null}
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* Key/value dossier row                                                      */
/* -------------------------------------------------------------------------- */

export interface BusinessKeyValueRowProps {
  icon: IconName;
  label: string;
  value: string;
  detail?: string;
  tone?: 'default' | 'muted';
  className?: string;
}

/** Dossier row: icon disc, uppercase micro label, medium value, optional detail. */
export function BusinessKeyValueRow({
  icon,
  label,
  value,
  detail,
  tone = 'default',
  className,
}: BusinessKeyValueRowProps) {
  return (
    <View className={cn('flex-row items-start gap-3', className)}>
      <View className="h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-container">
        <Icon name={icon} size={18} color={colors.onSurfaceVariant} />
      </View>
      <View className="min-w-0 flex-1">
        <VemtapText variant="micro" tone="tertiary" className="uppercase tracking-wider">
          {label}
        </VemtapText>
        <VemtapText
          variant="bodyMd"
          className={cn('mt-0.5', tone === 'muted' && 'text-text-secondary')}
          numberOfLines={2}
        >
          {value}
        </VemtapText>
        {detail ? (
          <VemtapText variant="caption" tone="secondary" className="mt-0.5">
            {detail}
          </VemtapText>
        ) : null}
      </View>
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* Metric tile                                                                */
/* -------------------------------------------------------------------------- */

export interface BusinessMetricTileProps {
  label: string;
  figure: string;
  subline?: string;
  icon?: IconName;
  /** `figure` token; prices and balances use `headingLg`. */
  figureClassName?: string;
  sublineTone?: 'default' | 'brand' | 'success' | 'tertiary';
  className?: string;
}

export const businessMetricSublineClass: Record<
  NonNullable<BusinessMetricTileProps['sublineTone']>,
  string
> = {
  default: 'text-text-secondary',
  brand: 'text-primary font-sans-semibold',
  success: 'text-badge-discount-text font-sans-semibold',
  tertiary: 'text-tertiary',
};

/** Label + figure + subline card used for customer and loyalty metrics. */
export function BusinessMetricTile({
  label,
  figure,
  subline,
  icon,
  figureClassName,
  sublineTone = 'default',
  className,
}: BusinessMetricTileProps) {
  return (
    <View
      className={cn(
        'min-w-0 flex-1 gap-2 rounded-card bg-surface p-3 shadow-sm',
        className,
      )}
    >
      <View className="flex-row items-center justify-between gap-2">
        <VemtapText
          variant="labelSm"
          tone="secondary"
          numberOfLines={1}
          className="min-w-0 flex-1"
        >
          {label}
        </VemtapText>
        {icon ? <Icon name={icon} size={18} color={colors.primary} /> : null}
      </View>
      <VemtapText
        variant="headingLg"
        className={cn('font-sans-bold leading-tight', figureClassName)}
        numberOfLines={1}
      >
        {figure}
      </VemtapText>
      {subline ? (
        <VemtapText
          variant="caption"
          className={businessMetricSublineClass[sublineTone]}
          numberOfLines={2}
        >
          {subline}
        </VemtapText>
      ) : null}
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* Link row                                                                   */
/* -------------------------------------------------------------------------- */

export interface BusinessLinkRowProps {
  label: string;
  onPress?: () => void;
  icon?: IconName;
  className?: string;
}

/** "Label + forward arrow" text link used as a section footer action. */
export function BusinessLinkRow({
  label,
  onPress,
  icon = 'arrowForward',
  className,
}: BusinessLinkRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      className={cn(
        'min-h-11 flex-row items-center justify-between gap-2 active:opacity-70',
        className,
      )}
    >
      <VemtapText
        variant="labelMd"
        className="min-w-0 flex-1 font-sans-semibold text-primary"
        numberOfLines={2}
      >
        {label}
      </VemtapText>
      <View className="shrink-0">
        <Icon name={icon} size={16} color={colors.primary} />
      </View>
    </Pressable>
  );
}

/* -------------------------------------------------------------------------- */
/* Bottom-sheet action row                                                    */
/* -------------------------------------------------------------------------- */

export interface BusinessSheetActionRowProps {
  icon: IconName;
  title: string;
  subtitle?: string;
  tone?: 'default' | 'brand' | 'destructive';
  onPress?: () => void;
  className?: string;
}

export const businessSheetToneIcon: Record<
  NonNullable<BusinessSheetActionRowProps['tone']>,
  string
> = {
  default: colors.onSurfaceVariant,
  brand: colors.primary,
  destructive: colors.error,
};

export const businessSheetToneTile: Record<
  NonNullable<BusinessSheetActionRowProps['tone']>,
  string
> = {
  default: 'bg-surface-container-low',
  brand: 'bg-tertiary-fixed',
  destructive: 'bg-error-container',
};

/** Icon + title + subtitle row for the shared `BottomSheet` action menus. */
export function BusinessSheetActionRow({
  icon,
  title,
  subtitle,
  tone = 'default',
  onPress,
  className,
}: BusinessSheetActionRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      className={cn(
        'flex-row items-center gap-3 rounded-card p-3 text-left active:bg-surface-container-low',
        tone === 'destructive' && 'active:bg-error-container',
        className,
      )}
    >
      <View
        className={cn(
          'h-10 w-10 shrink-0 items-center justify-center rounded-xl',
          businessSheetToneTile[tone],
        )}
      >
        <Icon name={icon} size={20} color={businessSheetToneIcon[tone]} />
      </View>
      <View className="min-w-0 flex-1">
        <VemtapText
          variant="labelMd"
          className={cn('font-sans-semibold', tone === 'destructive' && 'text-error')}
          numberOfLines={1}
        >
          {title}
        </VemtapText>
        {subtitle ? (
          <VemtapText
            variant="caption"
            tone="secondary"
            className="mt-0.5"
            numberOfLines={2}
          >
            {subtitle}
          </VemtapText>
        ) : null}
      </View>
    </Pressable>
  );
}

/* -------------------------------------------------------------------------- */
/* Search trigger                                                            */
/* -------------------------------------------------------------------------- */

export interface BusinessSearchTriggerProps {
  placeholder: string;
  onPress?: () => void;
  /** Optional trailing filter affordance. */
  onFilterPress?: () => void;
  filterLabel?: string;
  /** `bordered` matches the CRM field, plain matches the catalogue/deal fields. */
  surface?: 'bordered' | 'plain';
  className?: string;
}

/** Read-only search field that hands off to the real search surface. */
export function BusinessSearchTrigger({
  placeholder,
  onPress,
  onFilterPress,
  filterLabel,
  surface = 'plain',
  className,
}: BusinessSearchTriggerProps) {
  return (
    <View className={cn('flex-row items-center gap-2', className)}>
      <Pressable
        accessibilityRole="search"
        accessibilityLabel={placeholder}
        onPress={onPress}
        className={cn(
          'min-h-11 flex-1 flex-row items-center gap-2 rounded-field px-3',
          surface === 'bordered'
            ? 'border border-border bg-surface shadow-sm'
            : 'bg-surface-container-low shadow-sm',
        )}
      >
        <Icon name="search" size={18} color={colors.textTertiary} />
        <VemtapText
          variant="bodyMd"
          tone="tertiary"
          className="min-w-0 flex-1"
          numberOfLines={1}
        >
          {placeholder}
        </VemtapText>
      </Pressable>
      {onFilterPress ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={filterLabel ?? placeholder}
          onPress={onFilterPress}
          className="min-h-11 shrink-0 flex-row items-center gap-1.5 rounded-field bg-surface-container-low px-3 shadow-sm active:scale-95"
        >
          <Icon name="tune" size={17} color={colors.primary} />
          {filterLabel ? (
            <VemtapText
              variant="labelSm"
              className="font-sans-semibold"
              numberOfLines={1}
            >
              {filterLabel}
            </VemtapText>
          ) : null}
        </Pressable>
      ) : null}
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* Amenity / feature toggle chip                                              */
/* -------------------------------------------------------------------------- */

export interface BusinessToggleChipProps {
  label: string;
  icon: IconName;
  selected: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
}

/** Storefront amenity chip: selected chips carry the brand tint + check. */
export function BusinessToggleChip({
  label,
  icon,
  selected,
  onPress,
  accessibilityLabel,
}: BusinessToggleChipProps) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={accessibilityLabel ?? label}
      onPress={onPress}
      className={cn(
        'min-h-10 flex-row items-center gap-1.5 rounded-full px-3.5 py-2 active:scale-95',
        selected ? 'bg-surface-tint shadow-sm' : 'bg-surface-container',
      )}
    >
      <Icon
        name={icon}
        size={16}
        color={selected ? colors.primary : colors.textSecondary}
      />
      <VemtapText
        variant="labelSm"
        className={selected ? 'font-sans-semibold text-primary' : 'text-text-secondary'}
        numberOfLines={1}
      >
        {label}
      </VemtapText>
      <Icon
        name={selected ? 'checkCircle' : 'addCircle'}
        size={15}
        color={selected ? colors.primary : colors.textTertiary}
      />
    </Pressable>
  );
}

/* -------------------------------------------------------------------------- */
/* Icon well                                                                  */
/* -------------------------------------------------------------------------- */

export type BusinessIconWellTone =
  'brand' | 'neutral' | 'success' | 'tertiary' | 'secondary' | 'inverse';

const businessIconWellTile: Record<BusinessIconWellTone, string> = {
  brand: 'bg-surface-tint',
  neutral: 'bg-surface-container-high',
  success: 'bg-badge-discount-bg',
  tertiary: 'bg-tertiary-fixed',
  secondary: 'bg-secondary-fixed',
  inverse: 'bg-inverse-surface',
};

const businessIconWellIcon: Record<BusinessIconWellTone, string> = {
  brand: colors.primary,
  neutral: colors.text,
  success: colors.badgeDiscountText,
  tertiary: colors.tertiary,
  secondary: colors.secondary,
  inverse: colors.inverseOnSurface,
};

export interface BusinessIconWellProps {
  icon: IconName;
  tone?: BusinessIconWellTone;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const businessIconWellSize: Record<
  NonNullable<BusinessIconWellProps['size']>,
  { box: string; glyph: number }
> = {
  sm: { box: 'h-8 w-8', glyph: 15 },
  md: { box: 'h-9 w-9', glyph: 18 },
  lg: { box: 'h-10 w-10', glyph: 20 },
};

/**
 * The rounded glyph square that leads list rows, panels and settings items.
 * One owner so the well never drifts in size, radius or tint across screens.
 */
export function BusinessIconWell({
  icon,
  tone = 'brand',
  size = 'md',
  className,
}: BusinessIconWellProps) {
  return (
    <View
      className={cn(
        businessIconWellSize[size].box,
        'shrink-0 items-center justify-center rounded-lg',
        businessIconWellTile[tone],
        className,
      )}
    >
      <Icon
        name={icon}
        size={businessIconWellSize[size].glyph}
        color={businessIconWellIcon[tone]}
      />
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* Count chip                                                                 */
/* -------------------------------------------------------------------------- */

export interface BusinessCountChipProps {
  label: string;
  icon?: IconName;
  /** Trailing count bubble, e.g. notification totals. */
  count?: string;
  selected: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
}

/** Category/filter chip with a leading glyph and a trailing count bubble. */
export function BusinessCountChip({
  label,
  icon,
  count,
  selected,
  onPress,
  accessibilityLabel,
}: BusinessCountChipProps) {
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected }}
      accessibilityLabel={accessibilityLabel ?? label}
      onPress={onPress}
      className={cn(
        'min-h-9 flex-row items-center gap-1.5 rounded-full px-3.5 py-1.5 active:scale-95',
        selected ? 'bg-surface-tint shadow-sm' : 'bg-surface-container',
      )}
    >
      {icon ? (
        <Icon
          name={icon}
          size={15}
          color={selected ? colors.primary : colors.textSecondary}
        />
      ) : null}
      <VemtapText
        variant="labelSm"
        className={selected ? 'font-sans-semibold text-primary' : 'text-text-secondary'}
        numberOfLines={1}
      >
        {label}
      </VemtapText>
      {count ? (
        <View
          className={cn(
            'min-w-[22px] items-center rounded-full px-1.5 py-0.5',
            selected ? 'bg-primary' : 'bg-surface-container-highest',
          )}
        >
          <VemtapText
            variant="micro"
            className={cn(
              'font-sans-bold',
              selected ? 'text-primary-foreground' : 'text-text-secondary',
            )}
            numberOfLines={1}
          >
            {count}
          </VemtapText>
        </View>
      ) : null}
    </Pressable>
  );
}

/* -------------------------------------------------------------------------- */
/* Item condition tiles                                                       */
/* -------------------------------------------------------------------------- */

export interface BusinessConditionTile {
  id: string;
  icon: IconName;
  label: string;
  sub: string;
}

export interface BusinessConditionTileRowProps {
  options: readonly BusinessConditionTile[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
}

/**
 * Three-up item-condition selector. Shared by the product-builder steps so
 * "Fresh / New · Packaged · Surplus" is defined and rendered in exactly one
 * place.
 */
export function BusinessConditionTileRow({
  options,
  value,
  onChange,
  className,
}: BusinessConditionTileRowProps) {
  return (
    <View className={cn('flex-row gap-2', className)}>
      {options.map(option => {
        const selected = value === option.id;
        return (
          <Pressable
            key={option.id}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={option.label}
            onPress={() => onChange(option.id)}
            className={cn(
              'min-w-0 flex-1 items-center rounded-card p-3 active:scale-[0.99]',
              selected
                ? 'border-2 border-primary bg-surface-tint'
                : 'border border-border bg-surface-subtle',
            )}
          >
            <View className="mb-1.5 h-8 w-8 items-center justify-center rounded-full bg-surface">
              <Icon
                name={option.icon}
                size={17}
                color={selected ? colors.primary : colors.textSecondary}
              />
            </View>
            <VemtapText
              variant="labelSm"
              className={cn(
                'text-center',
                selected ? 'font-sans-bold text-primary' : 'font-sans-semibold',
              )}
              numberOfLines={2}
            >
              {option.label}
            </VemtapText>
            <VemtapText
              variant="micro"
              tone="tertiary"
              className="mt-0.5 text-center"
              numberOfLines={1}
            >
              {option.sub}
            </VemtapText>
          </Pressable>
        );
      })}
    </View>
  );
}

export interface BusinessHighlightChipRowProps {
  options: readonly string[];
  selected?: readonly string[];
  /** `toggle` flips the selected set, `append` reports the tapped value. */
  mode?: 'toggle' | 'append';
  prefix?: string;
  onPress?: (value: string) => void;
  className?: string;
}

/** Quick attribute chips under the description field. */
export function BusinessHighlightChipRow({
  options,
  selected = [],
  mode = 'toggle',
  prefix = '',
  onPress,
  className,
}: BusinessHighlightChipRowProps) {
  if (mode === 'append') {
    return (
      <View className={cn('flex-row flex-wrap gap-1.5', className)}>
        {options.map(option => (
          <Pressable
            key={option}
            accessibilityRole="button"
            accessibilityLabel={option}
            onPress={() => onPress?.(option)}
            className="min-h-8 flex-row items-center gap-1 rounded-full bg-surface-container-low px-2.5 py-1 active:bg-surface-container-high"
          >
            <Icon name="plus" size={13} color={colors.textSecondary} />
            <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
              {option}
            </VemtapText>
          </Pressable>
        ))}
      </View>
    );
  }

  return (
    <View className={cn('flex-row flex-wrap gap-2', className)}>
      {options.map(option => (
        <BusinessSelectionChipRow
          key={option}
          label={`${prefix}${option}`}
          selected={selected.includes(option)}
          onPress={() => onPress?.(option)}
        />
      ))}
    </View>
  );
}

function BusinessSelectionChipRow({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={label}
      onPress={onPress}
      className={cn(
        'min-h-9 flex-row items-center gap-1.5 rounded-full px-3 py-1 active:scale-95',
        selected ? 'bg-surface-tint shadow-sm' : 'bg-surface-container',
      )}
    >
      <Icon
        name={selected ? 'check' : 'plus'}
        size={13}
        color={selected ? colors.primary : colors.textSecondary}
      />
      <VemtapText
        variant="labelSm"
        className={selected ? 'font-sans-semibold text-primary' : 'text-text-secondary'}
        numberOfLines={1}
      >
        {label}
      </VemtapText>
    </Pressable>
  );
}

/* -------------------------------------------------------------------------- */
/* Info strip                                                                 */
/* -------------------------------------------------------------------------- */

export interface BusinessInfoStripProps {
  icon: IconName;
  title?: string;
  body: string;
  tone?: 'subtle' | 'tint' | 'tertiary';
  className?: string;
}

const infoStripTone: Record<NonNullable<BusinessInfoStripProps['tone']>, string> = {
  subtle: 'bg-surface-subtle',
  tint: 'bg-surface-tint',
  tertiary: 'bg-tertiary-fixed',
};

/** Explanatory strip (branch downtime, routing, safeguards). */
export function BusinessInfoStrip({
  icon,
  title,
  body,
  tone = 'subtle',
  className,
}: BusinessInfoStripProps) {
  return (
    <View
      className={cn(
        'flex-row items-start gap-2.5 rounded-field p-3',
        infoStripTone[tone],
        className,
      )}
    >
      <View className="mt-0.5 shrink-0">
        <Icon
          name={icon}
          size={18}
          color={tone === 'tertiary' ? colors.tertiaryContainer : colors.textTertiary}
        />
      </View>
      <View className="min-w-0 flex-1">
        {title ? (
          <VemtapText variant="labelSm" className="font-sans-semibold">
            {title}
          </VemtapText>
        ) : null}
        <VemtapText
          variant="caption"
          tone="secondary"
          className={cn('leading-snug', title ? 'mt-0.5' : null)}
        >
          {body}
        </VemtapText>
      </View>
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* Toast pill                                                                 */
/* -------------------------------------------------------------------------- */

export interface BusinessToastPillProps {
  message?: string;
  icon?: IconName;
  className?: string;
}

/**
 * Transient inverse-surface pill for copy/save confirmations inside a business
 * screen. `ToastHost` owns app-level banners; this is the local, screen-scoped
 * affordance the designs call for.
 */
export function BusinessToastPill({
  message,
  icon = 'checkCircle',
  className,
}: BusinessToastPillProps) {
  if (!message) return null;
  return (
    <View
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      className={cn(
        'absolute bottom-24 left-0 right-0 z-50 mx-6 flex-row items-center justify-center gap-1.5 self-center rounded-full bg-inverse-surface px-4 py-2.5 shadow-xl',
        className,
      )}
    >
      <Icon name={icon} size={16} color={colors.badgeDiscountText} />
      <VemtapText
        variant="labelSm"
        className="min-w-0 flex-1 text-inverse-on-surface"
        numberOfLines={2}
      >
        {message}
      </VemtapText>
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* Horizontal pill row                                                        */
/* -------------------------------------------------------------------------- */

/** Edge-to-edge horizontally scrolling pill row without a visible scrollbar. */
export function BusinessChipScroller({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className={cn('-mx-6', className)}
      contentContainerClassName="flex-row items-center gap-2 px-6 pb-1"
    >
      {children}
    </ScrollView>
  );
}

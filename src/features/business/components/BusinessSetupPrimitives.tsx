import React, { type ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  Switch,
  View,
  type ImageSourcePropType,
  type KeyboardTypeOptions,
} from 'react-native';
import { cssInterop } from 'nativewind';
import { Button } from '@components/ui/Button';
import { Icon, type IconName } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';
import { cn } from '@utils/cn';
import {
  BusinessNumberInput,
  BusinessPillTone,
  BusinessProductImage,
  BusinessSelectionChip,
  BusinessStatusPill,
  BusinessSectionHeading,
  BusinessSelectField,
  BusinessSwitchRow,
  SetupCard,
} from './BusinessPrimitives';

cssInterop(View, { className: 'style' });
cssInterop(Pressable, { className: 'style' });
cssInterop(Switch, { className: 'style' });
cssInterop(ScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});

export type PillTone = BusinessPillTone;

const pillToneClass: Record<PillTone, string> = {
  brand: 'bg-surface-tint-blue',
  primary: 'bg-primary',
  brandContainer: 'bg-surface-container',
  brandHigh: 'bg-surface-container-high',
  success: 'bg-badge-discount-bg',
  warning: 'bg-warning-container',
  tertiary: 'bg-tertiary-fixed',
  neutral: 'bg-surface-container',
  inverse: 'bg-inverse-surface',
};

const pillTextClass: Record<PillTone, string> = {
  brand: 'text-primary',
  primary: 'text-primary-foreground',
  brandContainer: 'text-primary',
  brandHigh: 'text-primary',
  success: 'text-badge-discount-text',
  warning: 'text-warning',
  tertiary: 'text-tertiary',
  neutral: 'text-text-secondary',
  inverse: 'text-inverse-on-surface',
};

export interface StatusPillProps {
  label: string;
  tone?: PillTone;
  icon?: IconName;
  className?: string;
}

export function StatusPill({ label, tone = 'brand', icon, className }: StatusPillProps) {
  return (
    <BusinessStatusPill label={label} tone={tone} icon={icon} className={className} />
  );
}

export interface SetupStepBarProps {
  step: string;
  percent: string;
  progress: number;
  stepStyle?: 'pill' | 'plain';
  stepMarker?: 'none' | 'check' | 'number';
  stepNumber?: number;
  dot?: boolean;
  pillTone?: PillTone;
  bordered?: boolean;
  /** Custom right-hand affordance; replaces the `percent` text when provided. */
  trailing?: ReactNode;
  className?: string;
}

/** Setup progress rail shared by every step of the business onboarding flow. */
export function SetupStepBar({
  step,
  percent,
  progress,
  stepStyle = 'pill',
  stepMarker = 'none',
  stepNumber,
  dot = false,
  pillTone = 'brand',
  bordered = false,
  trailing,
  className,
}: SetupStepBarProps) {
  const isCheck = stepMarker === 'check';
  const isNumber = stepMarker === 'number';

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(progress) }}
      className={cn(
        'gap-2',
        bordered
          ? 'rounded-card bg-surface-container-low p-4 shadow-sm'
          : 'rounded-card px-3 py-1',
        className,
      )}
    >
      <View className="flex-row flex-wrap items-center justify-between gap-2">
        <View
          className={cn(
            'flex-row items-center gap-1.5',
            stepStyle === 'pill' && stepMarker === 'none'
              ? cn('rounded-full px-2.5 py-1', pillToneClass[pillTone])
              : null,
          )}
        >
          {dot ? <View className="h-2 w-2 rounded-full bg-primary" /> : null}
          {isCheck ? (
            <View className="h-5 w-5 items-center justify-center rounded-full bg-badge-discount-bg">
              <Icon name="check" size={14} color={colors.badgeDiscountText} />
            </View>
          ) : null}
          {isNumber ? (
            <View className="h-5 w-5 items-center justify-center rounded-full bg-primary">
              <VemtapText
                variant="caption"
                className="font-sans-semibold text-primary-foreground"
              >
                {String(stepNumber ?? 1)}
              </VemtapText>
            </View>
          ) : null}
          <VemtapText
            variant="labelSm"
            className={cn(
              stepStyle === 'pill' && stepMarker === 'none'
                ? `font-sans-semibold ${pillTextClass[pillTone]}`
                : 'font-sans-medium text-text-secondary',
            )}
          >
            {step}
          </VemtapText>
        </View>
        {trailing ?? (
          <VemtapText variant="labelSm" className="font-sans-semibold text-primary">
            {percent}
          </VemtapText>
        )}
      </View>
      <View className="h-1.5 w-full overflow-hidden rounded-full bg-surface-container-highest">
        <View
          className="h-full rounded-full bg-primary"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </View>
    </View>
  );
}

export interface SetupSectionCardProps {
  children: React.ReactNode;
  tone?: 'lowest' | 'low' | 'container' | 'subtle';
  className?: string;
}

const sectionCardToneClass: Record<NonNullable<SetupSectionCardProps['tone']>, string> = {
  lowest: 'bg-surface-container-lowest',
  low: 'bg-surface-container-low',
  container: 'bg-surface-container',
  subtle: 'bg-surface-subtle',
};

export function SetupSectionCard({
  children,
  tone = 'lowest',
  className,
}: SetupSectionCardProps) {
  return (
    <SetupCard className={cn(sectionCardToneClass[tone], className)}>
      {children}
    </SetupCard>
  );
}

export interface SetupSectionHeadingProps {
  title: string;
  badge?: string;
  badgeTone?: PillTone;
  icon?: IconName;
  dot?: boolean;
  className?: string;
}

export function SetupSectionHeading({
  title,
  badge,
  badgeTone = 'brand',
  icon,
  dot = false,
  className,
}: SetupSectionHeadingProps) {
  return (
    <BusinessSectionHeading
      title={title}
      icon={icon}
      dot={dot}
      className={className}
      trailing={badge ? <StatusPill label={badge} tone={badgeTone} /> : undefined}
    />
  );
}

const calloutToneClass: Record<CalloutTone, string> = {
  tint: 'bg-surface-tint-blue shadow-sm',
  subtle: 'bg-surface-subtle shadow-none',
  container: 'bg-surface-container-low shadow-sm',
  tertiary: 'bg-tertiary-fixed shadow-sm',
  plain: 'bg-surface shadow-sm',
};

const calloutIconSurfaceClass: Record<CalloutIconSurface, string | null> = {
  circle: 'h-10 w-10 rounded-full bg-surface-container',
  circleMd: 'h-8 w-8 rounded-full bg-surface-container',
  circleSm: 'h-6 w-6 rounded-full bg-surface-container',
  circlePrimary: 'h-10 w-10 rounded-full bg-primary',
  circleSuccess: 'h-8 w-8 rounded-full bg-badge-discount-bg',
  circleTertiary: 'h-10 w-10 rounded-full bg-tertiary/10',
  plain: null,
};

const calloutIconColor: Record<CalloutIconTone, string> = {
  brand: colors.primary,
  success: colors.badgeDiscountText,
  tertiary: colors.tertiary,
  inverse: colors.surface,
};

const calloutTitleClass: Record<CalloutTone, string> = {
  tint: 'text-text',
  subtle: 'text-text',
  container: 'text-text',
  tertiary: 'text-text',
  plain: 'text-text',
};

const calloutBodyClass: Record<CalloutTone, string> = {
  tint: 'text-text-secondary',
  subtle: 'text-text-secondary',
  container: 'text-text-secondary',
  tertiary: 'text-text-secondary',
  plain: 'text-text-secondary',
};

export type CalloutTone = 'tint' | 'subtle' | 'container' | 'tertiary' | 'plain';
export type CalloutIconSurface =
  | 'circle'
  | 'circleMd'
  | 'circleSm'
  | 'circlePrimary'
  | 'circleSuccess'
  | 'circleTertiary'
  | 'plain';
export type CalloutIconTone = 'brand' | 'success' | 'tertiary' | 'inverse';

export interface SetupCalloutProps {
  icon: IconName;
  title?: string;
  body?: React.ReactNode;
  tone?: CalloutTone;
  iconSurface?: CalloutIconSurface;
  iconTone?: CalloutIconTone;
  iconSize?: number;
  titleClassName?: string;
  bodyClassName?: string;
  bodyVariant?: 'caption' | 'labelSm' | 'bodyMd';
  trailing?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export function SetupCallout({
  icon,
  title,
  body,
  tone = 'tint',
  iconSurface = 'circle',
  iconTone = 'brand',
  iconSize = 20,
  titleClassName,
  bodyClassName,
  bodyVariant = 'caption',
  trailing,
  children,
  className,
}: SetupCalloutProps) {
  const iconSurfaceClass = calloutIconSurfaceClass[iconSurface];
  return (
    <View className={cn('rounded-card p-3.5', calloutToneClass[tone], className)}>
      <View className="flex-row flex-wrap items-start gap-3">
        {iconSurfaceClass ? (
          <View className={cn('shrink-0 items-center justify-center', iconSurfaceClass)}>
            <Icon name={icon} size={iconSize} color={calloutIconColor[iconTone]} />
          </View>
        ) : (
          <View className="mt-0.5 shrink-0">
            <Icon name={icon} size={iconSize} color={calloutIconColor[iconTone]} />
          </View>
        )}
        <View className="min-w-0 flex-1">
          {title ? (
            <VemtapText
              variant="labelSm"
              className={cn(
                'font-sans-semibold',
                calloutTitleClass[tone],
                titleClassName,
              )}
            >
              {title}
            </VemtapText>
          ) : null}
          <VemtapText
            variant={bodyVariant}
            className={cn(
              'leading-snug',
              title ? 'mt-0.5' : null,
              calloutBodyClass[tone],
              bodyClassName,
            )}
          >
            {body}
          </VemtapText>
        </View>
        {trailing ? <View className="shrink-0">{trailing}</View> : null}
      </View>
      {children ? <View className="mt-3 gap-2">{children}</View> : null}
    </View>
  );
}

export interface SelectableChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  showCheck?: boolean;
  accessibilityLabel?: string;
}

/** Pill selector used for subcategory specialties and branch lead role titles. */
export function SelectableChip({
  label,
  selected = false,
  onPress,
  showCheck = false,
  accessibilityLabel,
}: SelectableChipProps) {
  return (
    <BusinessSelectionChip
      label={accessibilityLabel ?? label}
      selected={selected}
      showCheck={showCheck}
      onPress={onPress ?? (() => undefined)}
      className="shadow-sm"
    />
  );
}

export interface SwitchToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  accessibilityLabel: string;
  showCheck?: boolean;
}

/** Token-driven switch shared by every preference row in the setup flow. */
export function SwitchToggle({
  value,
  onValueChange,
  accessibilityLabel,
  showCheck = false,
}: SwitchToggleProps) {
  return (
    <Switch
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: colors.surfaceContainerHighest, true: colors.primary }}
      thumbColor={colors.surface}
      {...(showCheck ? { ios_backgroundColor: colors.surfaceContainerHighest } : {})}
    />
  );
}

export interface ToggleRowProps {
  title: string;
  body?: string;
  badge?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  className?: string;
}

export function ToggleRow({
  title,
  body,
  badge,
  value,
  onValueChange,
  className,
}: ToggleRowProps) {
  return (
    <View className={className}>
      <BusinessSwitchRow
        title={title}
        subtitle={body}
        badge={badge}
        value={value}
        onValueChange={onValueChange}
      />
    </View>
  );
}

export interface FieldInputProps {
  label?: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  accessibilityLabel?: string;
  leadingIcon?: IconName;
  trailingIcon?: IconName;
  trailingIconColor?: string;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  maxLength?: number;
  multiline?: boolean;
  tone?: 'subtle' | 'lowest';
  onTrailingIconPress?: () => void;
  className?: string;
}

/** Setup input matching the design fields: 52px, radius 14, soft surface fill. */
export function FieldInput({
  label,
  value,
  onChangeText,
  placeholder,
  accessibilityLabel,
  leadingIcon,
  trailingIcon,
  trailingIconColor: trailingIconColorProp,
  keyboardType,
  autoCapitalize = 'sentences',
  maxLength,
  multiline = false,
  tone = 'subtle',
  onTrailingIconPress,
  className,
}: FieldInputProps) {
  const trailingIconColor = trailingIconColorProp ?? colors.textTertiary;
  const trailingNode = !trailingIcon ? undefined : (
    <Icon name={trailingIcon} size={20} color={trailingIconColor} />
  );
  const trailingContent = !trailingNode ? undefined : onTrailingIconPress ? (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      hitSlop={6}
      onPress={onTrailingIconPress}
    >
      {trailingNode}
    </Pressable>
  ) : (
    trailingNode
  );
  return (
    <BusinessNumberInput
      label={label ?? ''}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      accessibilityLabel={accessibilityLabel ?? label}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
      maxLength={maxLength}
      multiline={multiline}
      minHeight={multiline ? 96 : undefined}
      leadingIcon={
        leadingIcon ? (
          <Icon name={leadingIcon} size={20} color={colors.textTertiary} />
        ) : undefined
      }
      trailingIcon={trailingContent}
      className={cn(
        tone === 'subtle' ? 'bg-surface-subtle' : 'bg-surface-container-lowest shadow-sm',
        className,
      )}
    />
  );
}

export interface FieldSelectProps {
  label?: string;
  value: string;
  onPress: () => void;
  accessibilityLabel: string;
  tone?: 'subtle' | 'lowest';
  leadingIcon?: IconName;
  className?: string;
}

/** Read-only field that opens an option sheet (mirrors the design select control). */
export function FieldSelect({
  label,
  value,
  onPress,
  accessibilityLabel,
  tone = 'subtle',
  leadingIcon,
  className,
}: FieldSelectProps) {
  return (
    <BusinessSelectField
      label={label}
      value={value}
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      leadingIcon={leadingIcon}
      className={cn(
        tone === 'subtle' ? 'bg-surface-subtle' : 'bg-surface-container-lowest shadow-sm',
        className,
      )}
    />
  );
}

export interface PhonePrefixProps {
  flag: string;
  dialCode: string;
  onPress?: () => void;
  accessibilityLabel?: string;
}

export function PhonePrefix({
  flag,
  dialCode,
  onPress,
  accessibilityLabel,
}: PhonePrefixProps) {
  return (
    <View
      className="min-h-[52px] shrink-0 flex-row items-center gap-1.5 rounded-field bg-surface-subtle px-3"
      accessibilityLabel={accessibilityLabel}
    >
      <VemtapText variant="labelMd">{flag}</VemtapText>
      <VemtapText variant="labelMd" className="font-sans-semibold text-text">
        {dialCode}
      </VemtapText>
      {onPress ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}
          hitSlop={6}
          onPress={onPress}
        >
          <Icon name="expandMore" size={18} color={colors.textTertiary} />
        </Pressable>
      ) : null}
    </View>
  );
}

export interface InfoHintProps {
  text: string;
  icon?: IconName;
  className?: string;
}

export function InfoHint({ text, icon = 'info', className }: InfoHintProps) {
  return (
    <View className={cn('flex-row items-start gap-1.5', className)}>
      <Icon name={icon} size={15} color={colors.textTertiary} />
      <VemtapText variant="caption" tone="secondary" className="min-w-0 flex-1">
        {text}
      </VemtapText>
    </View>
  );
}

export interface TextActionButtonProps {
  label: string;
  onPress?: () => void;
  icon?: IconName;
  tone?: 'secondary' | 'brand' | 'success';
  className?: string;
}

export function TextActionButton({
  label,
  onPress,
  icon,
  tone = 'secondary',
  className,
}: TextActionButtonProps) {
  const toneClass =
    tone === 'brand'
      ? 'text-primary'
      : tone === 'success'
        ? 'text-badge-discount-text'
        : 'text-text-secondary';
  const iconColor =
    tone === 'brand'
      ? colors.primary
      : tone === 'success'
        ? colors.badgeDiscountText
        : colors.textSecondary;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      className={cn(
        'min-h-[44px] flex-row items-center justify-center gap-1.5 rounded-field px-4 active:bg-surface-container-low',
        className,
      )}
    >
      {icon ? <Icon name={icon} size={18} color={iconColor} /> : null}
      <VemtapText variant="button" className={toneClass}>
        {label}
      </VemtapText>
    </Pressable>
  );
}

export interface PrimaryActionButtonProps {
  label: string;
  onPress?: () => void;
  loading?: boolean;
  icon?: IconName;
  className?: string;
}

export function PrimaryActionButton({
  label,
  onPress,
  loading = false,
  icon = 'arrowForward',
  className,
}: PrimaryActionButtonProps) {
  return (
    <Button
      label={label}
      labelVariant="labelMd"
      loading={loading}
      onPress={onPress}
      className={className}
      rightIcon={<Icon name={icon} size={20} color={colors.surface} />}
    />
  );
}

export interface MetaLineProps {
  icon: IconName;
  value: string;
  trailing?: string;
  iconColor?: string;
  className?: string;
}

/** Single-line icon + copy row used in branch cards and catalog footers. */
export function MetaLine({ icon, value, trailing, iconColor, className }: MetaLineProps) {
  return (
    <View className={cn('flex-row items-center gap-2', className)}>
      <Icon name={icon} size={17} color={iconColor ?? colors.primary} />
      <VemtapText
        variant="caption"
        className="min-w-0 flex-1 text-text"
        numberOfLines={1}
      >
        {value}
      </VemtapText>
      {trailing ? (
        <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
          {trailing}
        </VemtapText>
      ) : null}
    </View>
  );
}

export interface SectionMetaRowProps {
  label: string;
  value: string;
  emphasized?: boolean;
  className?: string;
}

/** Territory resolution tile (label above value) from the location screen. */
export function SectionMetaRow({
  label,
  value,
  emphasized = false,
  className,
}: SectionMetaRowProps) {
  return (
    <View className={cn('rounded-field bg-surface-subtle p-2.5', className)}>
      <VemtapText variant="caption" tone="tertiary">
        {label}
      </VemtapText>
      <VemtapText
        variant="labelMd"
        numberOfLines={1}
        className={cn('mt-0.5', emphasized ? 'text-primary' : 'text-text')}
      >
        {value}
      </VemtapText>
    </View>
  );
}

export interface InlineImageCardProps {
  uri: string;
  /** Bundled asset source; wins over `uri` so local artwork never needs a network round trip. */
  source?: ImageSourcePropType;
  alt?: string;
  height: number;
  rounded?: 'card' | 'field' | 'lg';
  children?: React.ReactNode;
  className?: string;
}

export function InlineImageCard({
  uri,
  source,
  alt = 'Business setup image',
  height,
  rounded = 'card',
  children,
  className,
}: InlineImageCardProps) {
  return (
    <View
      className={cn(
        'w-full overflow-hidden bg-surface-container shadow-sm',
        rounded === 'card'
          ? 'rounded-card'
          : rounded === 'lg'
            ? 'rounded-card-lg'
            : 'rounded-field',
        className,
      )}
      style={{ height }}
    >
      <BusinessProductImage
        source={source ?? { uri }}
        alt={alt}
        className="h-full w-full"
      />
      {children}
    </View>
  );
}

export interface ThumbnailProps {
  uri?: string;
  /** Bundled asset source; wins over `uri`. */
  source?: ImageSourcePropType;
  label?: string;
  onPress?: () => void;
  className?: string;
}

export function Thumbnail({ uri, source, label, onPress, className }: ThumbnailProps) {
  return (
    <Pressable
      accessibilityRole="image"
      accessibilityLabel={label}
      onPress={onPress}
      className={cn(
        'h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-surface-container',
        className,
      )}
    >
      <BusinessProductImage
        source={source ?? { uri }}
        alt={label ?? uri ?? 'Business image'}
        className="h-full w-full"
      />
    </Pressable>
  );
}

export interface HorizontallyScrollableRowProps {
  children: React.ReactNode;
}

/** Horizontal pill row without a visible scrollbar (role pills, stage labels). */
export function HorizontallyScrollableRow({ children }: HorizontallyScrollableRowProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="-mx-1"
      contentContainerClassName="flex-row items-center gap-2 px-1 pb-1"
    >
      {children}
    </ScrollView>
  );
}

export interface PreviewShellProps {
  label: string;
  badge?: string;
  badgeTone?: PillTone;
  icon?: IconName;
  hint?: string;
  tone?: 'lowest' | 'container';
  children: React.ReactNode;
  className?: string;
}

/** Wrapper for the live consumer / feed previews on the profile steps. */
export function PreviewShell({
  label,
  badge,
  badgeTone = 'success',
  icon,
  hint,
  tone = 'lowest',
  children,
  className,
}: PreviewShellProps) {
  return (
    <View
      className={cn(
        'gap-3 rounded-card p-4 shadow-sm',
        tone === 'lowest' ? 'bg-surface-container-lowest' : 'bg-surface-container',
        className,
      )}
    >
      <View className="flex-row flex-wrap items-center justify-between gap-2">
        <View className="min-w-0 flex-row items-center gap-1.5">
          {icon ? <Icon name={icon} size={18} color={colors.primary} /> : null}
          <VemtapText
            variant="labelSm"
            tone="tertiary"
            className="font-sans-semibold uppercase tracking-wider"
          >
            {label}
          </VemtapText>
        </View>
        {hint ? (
          <VemtapText variant="caption" tone="tertiary" className="shrink-0">
            {hint}
          </VemtapText>
        ) : null}
        {badge ? <StatusPill label={badge} tone={badgeTone} /> : null}
      </View>
      {children}
    </View>
  );
}

export interface SectionDividerRowProps {
  children: React.ReactNode;
  className?: string;
}

export function SectionDividerRow({ children, className }: SectionDividerRowProps) {
  return (
    <View className={cn('gap-1', className)}>
      {children}
      <View className="h-px w-full bg-border" />
    </View>
  );
}

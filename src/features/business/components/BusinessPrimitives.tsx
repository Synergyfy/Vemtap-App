import React, { useState, type ReactNode } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  View,
  type ImageSourcePropType,
  type KeyboardTypeOptions,
} from 'react-native';
import { cssInterop } from 'nativewind';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card } from '@components/ui/Card';
import { Icon, type IconName } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { RangeSlider } from '@components/ui/RangeSlider';
import { colors } from '@theme/colors';
import { navbarBottomShadow } from '@theme/shadows';
import type { TextVariant } from '@theme/typography';
import { cn } from '@utils/cn';

cssInterop(View, { className: 'style' });
cssInterop(Pressable, { className: 'style' });
cssInterop(ScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});
cssInterop(SafeAreaView, { className: 'style' });
cssInterop(Image, { className: 'style' });
cssInterop(TextInput, { className: 'style' });
cssInterop(Switch, { className: 'style' });

export interface BusinessHeaderAction {
  label?: string;
  icon: IconName;
  onPress?: () => void;
}

export interface BusinessHeaderProps {
  title: string;
  onBack?: () => void;
  eyebrow?: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  actions?: BusinessHeaderAction[];
  accessory?: ReactNode;
  leading?: ReactNode;
  titleAccessory?: ReactNode;
  stepBadge?: string;
  showAvatar?: boolean;
  /** Business logo shown in the avatar slot; falls back to the person icon. */
  avatarUri?: string;
  centerTitle?: boolean;
  /** Navbar title token; defaults to `headingSm`, drop to `labelMd` on crowded bars. */
  titleVariant?: TextVariant;
}

export function BusinessHeader({
  title,
  onBack,
  eyebrow,
  subtitle,
  actionLabel,
  onAction,
  actions = [],
  accessory,
  leading,
  titleAccessory,
  stepBadge,
  showAvatar = true,
  avatarUri,
  centerTitle = true,
  titleVariant = 'headingSm',
}: BusinessHeaderProps) {
  return (
    <View
      className="h-16 w-full max-w-screen flex-row items-center gap-1 self-center bg-surface px-6"
      style={navbarBottomShadow}
    >
      {leading}
      {onBack ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={8}
          className="-ml-2 h-11 w-11 shrink-0 items-center justify-center rounded-full active:bg-surface-container-low"
          onPress={onBack}
        >
          <Icon name="backIos" size={24} color={colors.surfaceDark} />
        </Pressable>
      ) : null}
      <View
        className={cn(
          'min-w-0 flex-1',
          centerTitle ? 'items-center text-center' : 'items-start',
        )}
      >
        {eyebrow ? (
          <VemtapText
            variant="caption"
            tone="secondary"
            className={cn('uppercase tracking-wider', centerTitle && 'text-center')}
            numberOfLines={1}
          >
            {eyebrow}
          </VemtapText>
        ) : null}
        {accessory}
        <View
          className={cn(
            'max-w-full flex-row items-center gap-1.5',
            centerTitle ? 'justify-center' : 'justify-start',
          )}
        >
          <VemtapText
            accessibilityRole="header"
            variant={titleVariant}
            className={cn(
              'max-w-full shrink',
              titleVariant === 'headingSm' && 'text-heading-sm',
              centerTitle ? 'text-center' : 'text-left',
            )}
            numberOfLines={1}
          >
            {title}
          </VemtapText>
          {titleAccessory}
        </View>
        {subtitle ? (
          <VemtapText
            variant="caption"
            tone="secondary"
            className={cn('max-w-full', centerTitle && 'text-center')}
            numberOfLines={1}
          >
            {subtitle}
          </VemtapText>
        ) : null}
      </View>
      <View className="shrink-0 flex-row items-center gap-1">
        {actionLabel ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={actionLabel}
            hitSlop={8}
            className="min-h-11 justify-center px-2"
            onPress={onAction}
          >
            <VemtapText variant="button" className="text-primary">
              {actionLabel}
            </VemtapText>
          </Pressable>
        ) : null}
        {actions.map((action, index) => (
          <Pressable
            key={action.label ?? `${action.icon}-${index}`}
            accessibilityRole="button"
            accessibilityLabel={action.label}
            hitSlop={8}
            className="h-11 w-11 items-center justify-center rounded-full active:bg-surface-container-high"
            onPress={action.onPress}
          >
            <Icon name={action.icon} size={22} color={colors.surfaceDark} />
          </Pressable>
        ))}
        {stepBadge ? (
          <View className="rounded-full bg-surface-tint px-3 py-1">
            <VemtapText className="font-sans-semibold text-label-sm text-primary">
              {stepBadge}
            </VemtapText>
          </View>
        ) : null}
        {showAvatar ? (
          <View className="h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary shadow-sm">
            {avatarUri ? (
              <Image
                source={{ uri: avatarUri }}
                accessibilityLabel="Business logo"
                className="h-full w-full"
                resizeMode="cover"
              />
            ) : (
              <Icon name="person" size={18} color={colors.surface} />
            )}
          </View>
        ) : null}
      </View>
    </View>
  );
}

/**
 * Leading "V" tile for the shared business-mode app bar (Orders / Bookings).
 */
export function BusinessModeMark({ label }: { label: string }) {
  return (
    <View className="h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-container">
      <VemtapText variant="headingSm" className="font-sans-bold text-surface">
        {label}
      </VemtapText>
    </View>
  );
}

export interface BusinessScreenLayoutProps {
  header: BusinessHeaderProps;
  children: ReactNode;
  footer?: ReactNode;
  contentContainerClassName?: string;
  keyboardShouldPersistTaps?: 'always' | 'never' | 'handled';
}

export function BusinessScreenLayout({
  header,
  children,
  footer,
  contentContainerClassName,
  keyboardShouldPersistTaps = 'handled',
}: BusinessScreenLayoutProps) {
  const insets = useSafeAreaInsets();
  return (
    <View className="flex-1 bg-background">
      <SafeAreaView edges={['top']} className="w-full bg-surface">
        <BusinessHeader {...header} />
      </SafeAreaView>
      <ScrollView
        className="w-full max-w-screen flex-1 self-center"
        contentContainerClassName={cn('w-full px-6 pb-8 pt-4', contentContainerClassName)}
        contentContainerStyle={
          footer ? undefined : { paddingBottom: Math.max(insets.bottom, 16) }
        }
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
      {footer}
    </View>
  );
}

export interface BusinessProgressProps {
  label: string;
  percent: number;
  completionLabel?: string;
  segments?: number;
  compact?: boolean;
}

export function BusinessProgress({
  label,
  percent,
  completionLabel,
  segments,
  compact = false,
}: BusinessProgressProps) {
  const safePercent = Math.max(0, Math.min(100, percent));
  return (
    <View className="gap-2">
      <View className="flex-row items-center justify-between gap-3">
        <VemtapText
          variant="labelSm"
          className="min-w-0 flex-1 font-sans-semibold text-primary"
        >
          {label}
        </VemtapText>
        {completionLabel ? (
          <VemtapText
            variant={compact ? 'caption' : 'labelSm'}
            tone="secondary"
            className="shrink-0 font-sans-semibold"
          >
            {completionLabel}
          </VemtapText>
        ) : null}
      </View>
      {segments ? (
        <View className="h-2 flex-row gap-1 overflow-hidden rounded-full bg-surface-container-high p-0.5">
          {Array.from({ length: segments }, (_, index) => (
            <View
              key={index}
              className={cn(
                'h-full flex-1 rounded-full',
                index < Math.round((safePercent / 100) * segments)
                  ? 'bg-primary'
                  : 'bg-surface-container',
              )}
            />
          ))}
        </View>
      ) : (
        <View
          className={cn(
            'overflow-hidden rounded-full bg-surface-container-high',
            compact ? 'h-1.5' : 'h-2',
          )}
        >
          <View
            className="h-full rounded-full bg-primary"
            style={{ width: `${safePercent}%` }}
          />
        </View>
      )}
    </View>
  );
}

export function BusinessHeaderDots({ activeCount }: { activeCount: number }) {
  return (
    <View className="flex-row items-center gap-1">
      <View className="h-1.5 w-6 rounded-full bg-primary" />
      <View
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          activeCount > 1 ? 'bg-primary' : 'bg-border',
        )}
      />
      <View
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          activeCount > 2 ? 'bg-primary' : 'bg-border',
        )}
      />
    </View>
  );
}

export function SetupCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card
      elevated
      className={cn('gap-4 rounded-card border-0 bg-surface p-4 shadow-sm', className)}
    >
      {children}
    </Card>
  );
}

export interface BusinessSectionHeadingProps {
  title: string;
  icon?: IconName;
  subtitle?: string;
  trailing?: ReactNode;
  dot?: boolean;
  className?: string;
  /** Section title token; defaults to `headingSm`, drop to `labelMd` on dense cards. */
  titleVariant?: TextVariant;
}

export function BusinessSectionHeading({
  title,
  icon,
  subtitle,
  trailing,
  dot = false,
  className,
  titleVariant = 'headingSm',
}: BusinessSectionHeadingProps) {
  return (
    <View
      className={cn(
        'min-w-0 shrink flex-row items-start justify-between gap-3',
        className,
      )}
    >
      <View className="min-w-0 flex-1 flex-row items-start gap-2">
        {dot ? <View className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" /> : null}
        {icon ? (
          <View className="shrink-0">
            <Icon name={icon} size={20} color={colors.primary} />
          </View>
        ) : null}
        <View className="min-w-0 flex-1">
          <VemtapText
            variant={titleVariant}
            className={cn(
              titleVariant === 'headingSm' && 'text-heading-sm',
              titleVariant === 'labelMd' && 'font-sans-semibold',
            )}
          >
            {title}
          </VemtapText>
          {subtitle ? (
            <VemtapText variant="caption" tone="secondary" className="mt-0.5">
              {subtitle}
            </VemtapText>
          ) : null}
        </View>
      </View>
      {trailing ? <View className="shrink-0">{trailing}</View> : null}
    </View>
  );
}

export function BusinessCollapsibleCard({
  title,
  subtitle,
  badge,
  trailingMeta,
  expanded,
  onToggle,
  icon,
  selected,
  toggleGlyph = 'chevron',
  titleVariant = 'headingSm',
  children,
}: {
  title: string;
  /** Optional teaser line under the title; hidden while expanded. */
  subtitle?: string;
  /** Size token for the header title; defaults to the section-heading step. */
  titleVariant?: TextVariant;
  badge?: string;
  trailingMeta?: string;
  expanded: boolean;
  onToggle: () => void;
  /** Leading icon tile used by single-select strategy rows. */
  icon?: IconName;
  /**
   * When provided the trailing affordance becomes a radio control instead of a
   * chevron, turning the card into a single-select disclosure.
   */
  selected?: boolean;
  /** Trailing affordance: `chevron` (default) or the FAQ-style plus/close swap. */
  toggleGlyph?: 'chevron' | 'plus';
  children: ReactNode;
}) {
  return (
    <View className="overflow-hidden rounded-card border border-border bg-surface shadow-sm">
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded, selected }}
        accessibilityLabel={title}
        className="flex-row items-center justify-between gap-3 p-3 active:bg-surface-subtle"
        onPress={onToggle}
      >
        <View className="min-w-0 flex-1 flex-row items-start gap-2.5">
          {icon ? (
            <View
              className={cn(
                'h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                selected === true ? 'bg-primary-fixed' : 'bg-surface-container',
              )}
            >
              <Icon
                name={icon}
                size={22}
                color={selected === true ? colors.primary : colors.textSecondary}
              />
            </View>
          ) : null}
          <View className="min-w-0 flex-1">
            <View className="flex-row flex-wrap items-center gap-2">
              <VemtapText
                variant={titleVariant}
                className={cn(
                  'font-sans-semibold',
                  titleVariant === 'headingSm' && 'text-heading-sm',
                )}
              >
                {title}
              </VemtapText>
              {badge ? (
                <View className="rounded-full bg-surface-tint px-2 py-0.5">
                  <VemtapText
                    variant="caption"
                    className="font-sans-semibold text-primary"
                  >
                    {badge}
                  </VemtapText>
                </View>
              ) : null}
              {trailingMeta ? (
                <VemtapText variant="caption" tone="tertiary">
                  {trailingMeta}
                </VemtapText>
              ) : null}
            </View>
            {subtitle ? (
              <VemtapText variant="caption" tone="secondary" className="mt-0.5">
                {subtitle}
              </VemtapText>
            ) : null}
          </View>
        </View>
        {selected === undefined ? (
          toggleGlyph === 'plus' ? (
            <View className="shrink-0">
              <Icon name={expanded ? 'close' : 'plus'} size={20} color={colors.primary} />
            </View>
          ) : (
            <View className="h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-tint shadow-sm">
              <Icon
                name="expandMore"
                size={20}
                color={colors.primary}
                style={expanded ? collapsibleStyles.expanded : undefined}
              />
            </View>
          )
        ) : (
          <View
            className={cn(
              'h-6 w-6 shrink-0 items-center justify-center rounded-full',
              selected ? 'bg-primary' : 'bg-surface-container-highest',
            )}
          >
            {selected ? <Icon name="check" size={16} color={colors.surface} /> : null}
          </View>
        )}
      </Pressable>
      {expanded ? (
        <View className="gap-3 border-t border-border p-3">{children}</View>
      ) : null}
    </View>
  );
}

export function BusinessFieldLabel({
  label,
  trailing,
  required = false,
}: {
  label: string;
  trailing?: ReactNode;
  required?: boolean;
}) {
  return (
    <View className="flex-row items-center justify-between gap-2">
      <VemtapText variant="labelMd" className="min-w-0 flex-1 font-sans-semibold">
        {label}
        {required ? <VemtapText className="text-error"> *</VemtapText> : null}
      </VemtapText>
      {trailing ? <View className="shrink-0">{trailing}</View> : null}
    </View>
  );
}

export interface BusinessTextAreaProps {
  label?: string;
  value: string;
  onChangeText: (value: string) => void;
  accessibilityLabel?: string;
  placeholder?: string;
  minHeight?: number;
  counter?: string;
}

export function BusinessTextArea({
  label,
  value,
  onChangeText,
  accessibilityLabel,
  placeholder,
  minHeight = 104,
  counter,
}: BusinessTextAreaProps) {
  const [focused, setFocused] = useState(false);
  return (
    <View className="gap-1.5">
      {label || counter ? (
        <View className="flex-row items-center justify-between gap-2">
          {label ? (
            <VemtapText variant="labelMd" className="font-sans-semibold">
              {label}
            </VemtapText>
          ) : (
            <View />
          )}
          {counter ? (
            <VemtapText variant="caption" tone="tertiary">
              {counter}
            </VemtapText>
          ) : null}
        </View>
      ) : null}
      <TextInput
        accessibilityLabel={accessibilityLabel ?? label}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        multiline
        textAlignVertical="top"
        className={cn(
          'rounded-field border bg-surface-subtle px-3 py-3 text-body-md text-text',
          focused ? 'border-primary bg-surface' : 'border-transparent',
        )}
        style={{ minHeight }}
      />
    </View>
  );
}

export interface BusinessSelectFieldProps {
  label?: string;
  value: string;
  /**
   * Shown in place of the value when `value` is empty, so a select the user has
   * not answered yet does not render as a blank field.
   */
  placeholder?: string;
  onPress: () => void;
  leadingIcon?: IconName;
  accessibilityLabel?: string;
  className?: string;
}

export function BusinessSelectField({
  label,
  value,
  placeholder,
  onPress,
  leadingIcon,
  accessibilityLabel,
  className,
}: BusinessSelectFieldProps) {
  const empty = value.trim().length === 0;
  return (
    <View className="gap-1.5">
      {label ? (
        <VemtapText variant="labelMd" className="font-sans-semibold">
          {label}
        </VemtapText>
      ) : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}
        className={cn(
          'min-h-[52px] flex-row items-center gap-2 rounded-field bg-surface-subtle px-3 active:bg-surface',
          className,
        )}
        onPress={onPress}
      >
        {leadingIcon ? (
          <Icon name={leadingIcon} size={20} color={colors.textSecondary} />
        ) : null}
        <VemtapText
          className="min-w-0 flex-1"
          numberOfLines={1}
          tone={empty && placeholder ? 'tertiary' : undefined}
        >
          {empty && placeholder ? placeholder : value}
        </VemtapText>
        <Icon name="expandMore" size={20} color={colors.textSecondary} />
      </Pressable>
    </View>
  );
}

export interface BusinessCheckRowProps {
  title: string;
  subtitle?: string;
  selected: boolean;
  onPress: () => void;
  type?: 'checkbox' | 'radio';
  icon?: IconName;
  badge?: string;
  disabled?: boolean;
  trailing?: ReactNode;
  className?: string;
}

export function BusinessCheckRow({
  title,
  subtitle,
  selected,
  onPress,
  type = 'checkbox',
  icon,
  badge,
  disabled = false,
  trailing,
  className,
}: BusinessCheckRowProps) {
  return (
    <Pressable
      accessibilityRole={type}
      accessibilityState={{ selected, disabled }}
      accessibilityLabel={title}
      disabled={disabled}
      className={cn(
        'flex-row items-start gap-3 rounded-xl p-3',
        selected ? 'bg-surface-tint' : 'bg-surface-subtle',
        disabled && 'opacity-60',
        className,
      )}
      onPress={onPress}
    >
      <View
        className={cn(
          'mt-0.5 h-5 w-5 shrink-0 items-center justify-center',
          type === 'checkbox' ? 'rounded-md' : 'rounded-full',
          selected ? 'bg-primary' : 'bg-surface-container-high',
        )}
      >
        {selected ? (
          type === 'checkbox' ? (
            <Icon name="check" size={15} color={colors.surface} />
          ) : (
            <View className="h-2 w-2 rounded-full bg-surface" />
          )
        ) : null}
      </View>
      {icon ? (
        <View className="mt-0.5 h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-tint">
          <Icon name={icon} size={18} color={colors.primary} />
        </View>
      ) : null}
      <View className="min-w-0 flex-1">
        <View className="flex-row flex-wrap items-center justify-between gap-2">
          <VemtapText
            variant="labelMd"
            className={cn(
              'min-w-0',
              selected ? 'font-sans-semibold' : 'text-text-secondary',
            )}
          >
            {title}
          </VemtapText>
          {badge ? (
            <View className="rounded-full bg-surface-container-high px-2 py-0.5">
              <VemtapText
                variant="caption"
                className={selected ? 'text-primary' : 'text-text-secondary'}
              >
                {badge}
              </VemtapText>
            </View>
          ) : null}
        </View>
        {subtitle ? (
          <VemtapText variant="caption" tone="secondary" className="mt-0.5">
            {subtitle}
          </VemtapText>
        ) : null}
      </View>
      {trailing ? <View className="shrink-0">{trailing}</View> : null}
    </Pressable>
  );
}

export type BusinessActionTileTone =
  'primary' | 'neutral' | 'brand' | 'error' | 'errorContainer';

const actionTileSurface: Record<BusinessActionTileTone, string> = {
  primary: 'bg-primary shadow-lg',
  neutral: 'bg-surface-container-high',
  brand: 'bg-surface-tint-blue',
  error: 'bg-surface-container-low',
  errorContainer: 'bg-error-container',
};

const actionTileLabel: Record<BusinessActionTileTone, string | undefined> = {
  primary: 'text-primary-foreground',
  neutral: undefined,
  brand: 'text-primary',
  error: 'text-error',
  errorContainer: 'text-error',
};

const actionTileIcon: Record<BusinessActionTileTone, string> = {
  primary: colors.surface,
  neutral: colors.text,
  brand: colors.primary,
  error: colors.error,
  errorContainer: colors.error,
};

export type BusinessActionTileSize = 'sm' | 'md' | 'lg' | 'stacked';

const actionTileBox: Record<BusinessActionTileSize, string> = {
  sm: 'min-h-11 rounded-lg px-2.5',
  md: 'min-h-11 rounded-lg px-3',
  lg: 'min-h-12 rounded-card px-3',
  // Vertical CTA card: icon above the label, with an optional hint beneath it.
  stacked: 'min-h-[76px] flex-col items-start gap-1.5 rounded-card px-3 py-2.5',
};

const actionTileIconSize: Record<BusinessActionTileSize, number> = {
  sm: 17,
  md: 18,
  lg: 18,
  stacked: 20,
};

const actionTileText: Record<BusinessActionTileSize, TextVariant> = {
  sm: 'labelSm',
  md: 'labelMd',
  lg: 'labelMd',
  stacked: 'labelMd',
};

export interface BusinessActionTileProps {
  label: string;
  icon: IconName;
  onPress?: () => void;
  accessibilityLabel?: string;
  tone?: BusinessActionTileTone;
  size?: BusinessActionTileSize;
  /** Second line under the label. Only the `stacked` size renders it. */
  hint?: string;
  className?: string;
  labelClassName?: string;
}

/**
 * Icon + label action tile for two-column action grids. Single owner of the
 * tile pattern so order triage, customer contact and the state modifiers can
 * never drift apart. The label is `min-w-0 flex-1` and capped at two lines, so
 * a long CTA ("Confirm Payment & Complete") wraps inside the tile instead of
 * pushing the cell past the grid gutter.
 */
export function BusinessActionTile({
  label,
  icon,
  onPress,
  hint,
  accessibilityLabel,
  tone = 'neutral',
  size = 'md',
  className,
  labelClassName,
}: BusinessActionTileProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      onPress={onPress}
      className={cn(
        'flex-row items-center justify-center gap-1.5 active:scale-[0.98]',
        actionTileBox[size],
        actionTileSurface[tone],
        className,
      )}
    >
      <Icon name={icon} size={actionTileIconSize[size]} color={actionTileIcon[tone]} />
      <VemtapText
        variant={actionTileText[size]}
        className={cn(
          'min-w-0 flex-1 font-sans-semibold',
          size === 'stacked' ? 'text-left' : 'text-center',
          actionTileLabel[tone],
          labelClassName,
        )}
        numberOfLines={2}
      >
        {label}
      </VemtapText>
      {size === 'stacked' && hint ? (
        <VemtapText variant="caption" tone="secondary" numberOfLines={2}>
          {hint}
        </VemtapText>
      ) : null}
    </Pressable>
  );
}

export function BusinessSwitchRow({
  title,
  subtitle,
  value,
  onValueChange,
  icon,
  disabled = false,
  badge,
  activeTone = 'primary',
  accessibilityLabel,
}: {
  title: string;
  subtitle?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  icon?: IconName;
  disabled?: boolean;
  badge?: string;
  activeTone?: 'primary' | 'success';
  /** Overrides the announced label when the title is not the visible copy. */
  accessibilityLabel?: string;
}) {
  return (
    <View className="flex-row items-center gap-3">
      {icon ? (
        <View className="h-10 w-10 shrink-0 items-center justify-center rounded-full bg-badge-discount-bg">
          <Icon name={icon} size={21} color={colors.badgeDiscountText} />
        </View>
      ) : null}
      <View className="min-w-0 flex-1">
        <View className="flex-row flex-wrap items-center gap-1.5">
          <VemtapText variant="labelMd" className="font-sans-semibold">
            {title}
          </VemtapText>
          {badge ? (
            <View className="rounded-full bg-success-container px-2 py-0.5">
              <VemtapText variant="caption" className="font-sans-semibold text-success">
                {badge}
              </VemtapText>
            </View>
          ) : null}
        </View>
        {subtitle ? (
          <VemtapText variant="caption" tone="secondary" className="mt-0.5">
            {subtitle}
          </VemtapText>
        ) : null}
      </View>
      <Switch
        accessibilityRole="switch"
        accessibilityLabel={accessibilityLabel ?? title}
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{
          false: colors.surfaceContainerHighest,
          true: activeTone === 'success' ? colors.badgeDiscountText : colors.primary,
        }}
        thumbColor={colors.surface}
        ios_backgroundColor={colors.surfaceContainerHighest}
      />
    </View>
  );
}

export function BusinessStepper({
  label,
  value,
  onDecrease,
  onIncrease,
  decreaseLabel = 'Decrease',
  increaseLabel = 'Increase',
  minimumReached = false,
  maximumReached = false,
}: {
  label: string;
  value: string | number;
  onDecrease: () => void;
  onIncrease: () => void;
  decreaseLabel?: string;
  increaseLabel?: string;
  minimumReached?: boolean;
  maximumReached?: boolean;
}) {
  return (
    <View className="flex-row items-center justify-between gap-3">
      <VemtapText variant="labelMd" className="min-w-0 flex-1 font-sans-semibold">
        {label}
      </VemtapText>
      <View className="flex-row items-center rounded-lg bg-surface p-1 shadow-sm">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={decreaseLabel}
          disabled={minimumReached}
          className="h-9 w-9 items-center justify-center rounded-md disabled:opacity-40"
          onPress={onDecrease}
        >
          <Icon name="remove" size={18} color={colors.text} />
        </Pressable>
        <VemtapText variant="button" className="min-w-12 text-center text-text">
          {value}
        </VemtapText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={increaseLabel}
          disabled={maximumReached}
          className="h-9 w-9 items-center justify-center rounded-md disabled:opacity-40"
          onPress={onIncrease}
        >
          <Icon name="plus" size={18} color={colors.text} />
        </Pressable>
      </View>
    </View>
  );
}

export type BusinessPillTone =
  | 'brand'
  | 'primary'
  | 'brandContainer'
  | 'brandHigh'
  | 'success'
  | 'tertiary'
  | 'neutral'
  | 'inverse'
  | 'warning';

const businessPillToneClasses: Record<BusinessPillTone, string> = {
  brand: 'bg-surface-tint text-primary',
  primary: 'bg-primary text-primary-foreground',
  brandContainer: 'bg-surface-container text-primary',
  brandHigh: 'bg-surface-container-high text-primary',
  success: 'bg-badge-discount-bg text-badge-discount-text',
  tertiary: 'bg-tertiary-fixed text-tertiary',
  neutral: 'bg-surface-container-high text-text-secondary',
  inverse: 'bg-inverse-surface text-inverse',
  warning: 'bg-warning-container text-warning',
};

const businessPillIconColors: Record<BusinessPillTone, string> = {
  brand: colors.primary,
  primary: colors.surface,
  brandContainer: colors.primary,
  brandHigh: colors.primary,
  success: colors.badgeDiscountText,
  tertiary: colors.tertiary,
  neutral: colors.textSecondary,
  inverse: colors.inverseOnSurface,
  warning: colors.warning,
};

export function BusinessStatusPill({
  label,
  tone = 'brand',
  icon,
  className,
}: {
  label: string;
  tone?: BusinessPillTone;
  icon?: IconName;
  className?: string;
}) {
  return (
    <View
      className={cn(
        'flex-row items-center gap-1 self-start rounded-full px-2 py-0.5',
        businessPillToneClasses[tone],
        className,
      )}
    >
      {icon ? <Icon name={icon} size={13} color={businessPillIconColors[tone]} /> : null}
      <VemtapText variant="caption" className="font-sans-semibold">
        {label}
      </VemtapText>
    </View>
  );
}

export function BusinessInlineAction({
  label,
  onPress,
  icon,
}: {
  label: string;
  onPress?: () => void;
  icon?: IconName;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      className="min-h-9 flex-row items-center gap-1 rounded-lg px-2 active:bg-surface-tint"
      onPress={onPress}
    >
      {icon ? <Icon name={icon} size={15} color={colors.primary} /> : null}
      <VemtapText variant="labelSm" className="font-sans-semibold text-primary">
        {label}
      </VemtapText>
    </Pressable>
  );
}

export function BusinessActionDock({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <View
      className="w-full border-t border-border/40 bg-surface px-6 pt-3 shadow-xl"
      style={{ paddingBottom: Math.max(insets.bottom, 16) }}
    >
      <View className="mx-auto w-full max-w-screen gap-2">{children}</View>
    </View>
  );
}

export interface BusinessRangeProps {
  value: number;
  minimum: number;
  maximum: number;
  onChange: (value: number) => void;
  accessibilityLabel: string;
  /** Granularity of the emitted value; snaps to the nearest multiple of `step` from `minimum`. */
  step?: number;
}

/**
 * Business wrapper over the shared `RangeSlider` owner so business percentage and
 * branch-radius rails share one implementation with the consumer location sheet
 * (AGENTS rule 17) — and gain drag-to-scrub, which this local version lacked.
 */
export function BusinessRange({
  value,
  minimum,
  maximum,
  onChange,
  accessibilityLabel,
  step = 1,
}: BusinessRangeProps) {
  return (
    <RangeSlider
      value={value}
      min={minimum}
      max={maximum}
      step={step}
      accessibilityLabel={accessibilityLabel}
      onChange={onChange}
    />
  );
}

export function BusinessSelectionChip({
  label,
  selected,
  onPress,
  tone = 'brand',
  showCheck = false,
  leading,
  labelNumberOfLines = 1,
  className,
  plain = false,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  tone?: 'brand' | 'neutral';
  showCheck?: boolean;
  /** Optional leading adornment such as a live status dot. */
  leading?: ReactNode;
  labelNumberOfLines?: number;
  className?: string;
  /** Renders the unselected state without a fill (bookings timeframe filters). */
  plain?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      className={cn(
        'min-h-9 flex-row items-center justify-center gap-1.5 rounded-full px-3 py-1 text-center active:scale-95',
        selected
          ? tone === 'brand'
            ? 'bg-surface-tint text-primary shadow-sm'
            : 'bg-primary text-primary-foreground'
          : plain
            ? 'text-text-secondary'
            : 'bg-surface-container text-text-secondary',
        className,
      )}
      onPress={onPress}
    >
      {selected && showCheck ? (
        <View className="shrink-0">
          <Icon name="check" size={16} color={colors.primary} />
        </View>
      ) : null}
      {leading}
      <VemtapText
        variant="labelSm"
        numberOfLines={labelNumberOfLines}
        className={cn(
          'min-w-0 text-center',
          selected && tone === 'brand'
            ? 'font-sans-semibold text-primary'
            : 'text-text-secondary',
          selected && tone === 'neutral' ? 'text-primary-foreground' : null,
        )}
      >
        {label}
      </VemtapText>
    </Pressable>
  );
}

export function BusinessProductImage({
  source,
  alt,
  className,
  resizeMode = 'cover',
}: {
  source: ImageSourcePropType;
  alt: string;
  className?: string;
  resizeMode?: 'cover' | 'contain';
}) {
  return (
    <Image
      source={source}
      accessibilityLabel={alt}
      resizeMode={resizeMode}
      className={className}
    />
  );
}

export interface BusinessNumberInputProps {
  label?: string;
  value: string;
  onChangeText: (value: string) => void;
  accessibilityLabel?: string;
  keyboardType?: KeyboardTypeOptions;
  placeholder?: string;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  maxLength?: number;
  multiline?: boolean;
  minHeight?: number;
  leadingText?: string;
  leadingIcon?: ReactNode;
  trailingText?: string;
  trailingIcon?: ReactNode;
  /** Masks the input for password fields. */
  secureTextEntry?: boolean;
  /** Inline token variant (no label block, fixed 64x36 field) for step configurators. */
  compact?: boolean;
  className?: string;
}

export function BusinessNumberInput({
  label,
  value,
  onChangeText,
  accessibilityLabel,
  keyboardType = 'numeric',
  placeholder,
  autoCapitalize = 'sentences',
  maxLength,
  multiline = false,
  minHeight,
  leadingText,
  leadingIcon,
  trailingText,
  trailingIcon,
  secureTextEntry = false,
  compact = false,
  className,
}: BusinessNumberInputProps) {
  return (
    <View className={cn('gap-1.5', compact && 'shrink-0')}>
      {label ? (
        <VemtapText variant="caption" tone="secondary">
          {label}
        </VemtapText>
      ) : null}
      <View
        className={cn(
          'flex-row',
          compact
            ? 'h-9 w-16 items-center rounded-lg bg-surface px-2 shadow-sm'
            : cn(
                'min-h-[52px] items-center rounded-field bg-surface-subtle px-3',
                multiline && 'items-start py-3',
              ),
          className,
        )}
        style={minHeight ? { minHeight } : undefined}
      >
        {leadingText ? (
          <VemtapText variant="headingSm" tone="secondary" className="mr-2 shrink-0">
            {leadingText}
          </VemtapText>
        ) : null}
        {leadingIcon ? <View className="mr-1 shrink-0">{leadingIcon}</View> : null}
        <TextInput
          accessibilityLabel={accessibilityLabel ?? label}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          placeholder={placeholder}
          autoCapitalize={autoCapitalize}
          maxLength={maxLength}
          multiline={multiline}
          secureTextEntry={secureTextEntry}
          textAlignVertical={multiline ? 'top' : 'center'}
          className={cn(
            'bg-transparent',
            compact
              ? 'w-full text-right text-heading-sm text-primary'
              : 'min-w-[40px] flex-1 text-body-md text-text',
          )}
          placeholderTextColor={colors.textTertiary}
          underlineColorAndroid="transparent"
        />
        {trailingIcon ? <View className="ml-2 shrink-0">{trailingIcon}</View> : null}
        {trailingText ? (
          <VemtapText
            variant={compact ? 'headingSm' : 'caption'}
            tone={compact ? 'brand' : 'tertiary'}
            className="shrink-0"
          >
            {trailingText}
          </VemtapText>
        ) : null}
      </View>
    </View>
  );
}

const collapsibleStyles = StyleSheet.create({
  expanded: { transform: [{ rotate: '180deg' }] },
});

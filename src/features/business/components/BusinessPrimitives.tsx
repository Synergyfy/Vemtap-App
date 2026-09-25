import React, { useState, type ReactNode } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  View,
  type GestureResponderEvent,
  type ImageSourcePropType,
  type KeyboardTypeOptions,
} from 'react-native';
import { cssInterop } from 'nativewind';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card } from '@components/ui/Card';
import { Icon, type IconName } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';
import { navbarBottomShadow } from '@theme/shadows';
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
  label: string;
  icon: IconName;
  onPress?: () => void;
}

export interface BusinessHeaderProps {
  title: string;
  onBack: () => void;
  eyebrow?: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  actions?: BusinessHeaderAction[];
  accessory?: ReactNode;
  stepBadge?: string;
  showAvatar?: boolean;
  centerTitle?: boolean;
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
  stepBadge,
  showAvatar = true,
  centerTitle = true,
}: BusinessHeaderProps) {
  return (
    <View
      className="h-16 w-full max-w-screen flex-row items-center gap-1 self-center bg-surface px-6"
      style={navbarBottomShadow}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back"
        hitSlop={8}
        className="-ml-2 h-11 w-11 shrink-0 items-center justify-center rounded-full active:bg-surface-container-low"
        onPress={onBack}
      >
        <Icon name="backIos" size={24} color={colors.surfaceDark} />
      </Pressable>
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
        <VemtapText
          accessibilityRole="header"
          variant="headingSm"
          className={cn(
            'max-w-full text-heading-sm',
            centerTitle ? 'text-center' : 'text-left',
          )}
          numberOfLines={1}
        >
          {title}
        </VemtapText>
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
        {actions.map(action => (
          <Pressable
            key={action.label}
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
          <View className="h-8 w-8 items-center justify-center rounded-full bg-primary shadow-sm">
            <Icon name="person" size={18} color={colors.surface} />
          </View>
        ) : null}
      </View>
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
}

export function BusinessSectionHeading({
  title,
  icon,
  subtitle,
  trailing,
  dot = false,
  className,
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
          <VemtapText variant="headingSm" className="text-heading-sm">
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
  children,
}: {
  title: string;
  subtitle: string;
  badge?: string;
  trailingMeta?: string;
  expanded: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <View className="overflow-hidden rounded-card border border-border bg-surface shadow-sm">
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={title}
        className="flex-row items-center justify-between gap-3 p-3 active:bg-surface-subtle"
        onPress={onToggle}
      >
        <View className="min-w-0 flex-1">
          <View className="flex-row flex-wrap items-center gap-2">
            <VemtapText variant="headingSm" className="text-heading-sm">
              {title}
            </VemtapText>
            {badge ? (
              <View className="rounded-full bg-surface-tint px-2 py-0.5">
                <VemtapText variant="caption" className="font-sans-semibold text-primary">
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
          <VemtapText variant="caption" tone="secondary" className="mt-0.5">
            {subtitle}
          </VemtapText>
        </View>
        <View className="h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-tint shadow-sm">
          <Icon
            name="expandMore"
            size={20}
            color={colors.primary}
            style={expanded ? collapsibleStyles.expanded : undefined}
          />
        </View>
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
  onPress: () => void;
  leadingIcon?: IconName;
  accessibilityLabel?: string;
  className?: string;
}

export function BusinessSelectField({
  label,
  value,
  onPress,
  leadingIcon,
  accessibilityLabel,
  className,
}: BusinessSelectFieldProps) {
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
        <VemtapText className="min-w-0 flex-1" numberOfLines={1}>
          {value}
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

export function BusinessSwitchRow({
  title,
  subtitle,
  value,
  onValueChange,
  icon,
  disabled = false,
  badge,
  activeTone = 'primary',
}: {
  title: string;
  subtitle?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  icon?: IconName;
  disabled?: boolean;
  badge?: string;
  activeTone?: 'primary' | 'success';
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
        accessibilityLabel={title}
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

export function BusinessStatusPill({
  label,
  tone = 'brand',
  icon,
  className,
}: {
  label: string;
  tone?: 'brand' | 'success' | 'tertiary' | 'neutral' | 'inverse' | 'warning';
  icon?: IconName;
  className?: string;
}) {
  const toneClasses = {
    brand: 'bg-surface-tint text-primary',
    success: 'bg-badge-discount-bg text-badge-discount-text',
    tertiary: 'bg-tertiary-fixed text-tertiary',
    neutral: 'bg-surface-container-high text-text-secondary',
    inverse: 'bg-inverse-surface text-inverse',
    warning: 'bg-warning-container text-warning',
  };
  const iconColor =
    tone === 'success'
      ? colors.badgeDiscountText
      : tone === 'tertiary'
        ? colors.tertiary
        : tone === 'neutral'
          ? colors.textSecondary
          : tone === 'inverse'
            ? colors.inverseOnSurface
            : tone === 'warning'
              ? colors.warning
              : colors.primary;
  return (
    <View
      className={cn(
        'flex-row items-center gap-1 self-start rounded-full px-2 py-0.5',
        toneClasses[tone],
        className,
      )}
    >
      {icon ? <Icon name={icon} size={13} color={iconColor} /> : null}
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
}

export function BusinessRange({
  value,
  minimum,
  maximum,
  onChange,
  accessibilityLabel,
}: BusinessRangeProps) {
  const [trackWidth, setTrackWidth] = useState(0);
  const percentage = ((value - minimum) / (maximum - minimum)) * 100;
  const handlePress = (event: GestureResponderEvent) => {
    if (trackWidth <= 0) return;
    const ratio = Math.max(0, Math.min(1, event.nativeEvent.locationX / trackWidth));
    onChange(Math.round(minimum + ratio * (maximum - minimum)));
  };
  return (
    <Pressable
      accessibilityRole="adjustable"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: minimum, max: maximum, now: value }}
      onLayout={event => setTrackWidth(event.nativeEvent.layout.width)}
      onPress={handlePress}
      className="py-2"
    >
      <View className="h-2 justify-center rounded-full bg-surface-container-high">
        <View
          className="absolute left-0 h-2 rounded-full bg-primary"
          style={{ width: `${percentage}%` }}
        />
        <View
          className="absolute h-5 w-5 rounded-full border-2 border-surface bg-primary shadow-sm"
          style={[{ left: `${percentage}%` }, rangeStyles.thumb]}
        />
      </View>
    </Pressable>
  );
}

export function BusinessSelectionChip({
  label,
  selected,
  onPress,
  tone = 'brand',
  showCheck = false,
  labelNumberOfLines = 1,
  className,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  tone?: 'brand' | 'neutral';
  showCheck?: boolean;
  labelNumberOfLines?: number;
  className?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      className={cn(
        'min-h-9 flex-row items-center justify-center gap-1 rounded-full px-3 py-1 text-center active:scale-95',
        selected
          ? tone === 'brand'
            ? 'bg-surface-tint text-primary shadow-sm'
            : 'bg-primary text-primary-foreground'
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
  label: string;
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
  className,
}: BusinessNumberInputProps) {
  return (
    <View className="gap-1.5">
      {label ? (
        <VemtapText variant="caption" tone="secondary">
          {label}
        </VemtapText>
      ) : null}
      <View
        className={cn(
          'min-h-[52px] flex-row rounded-field bg-surface-subtle px-3',
          multiline ? 'items-start py-3' : 'items-center',
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
          textAlignVertical={multiline ? 'top' : 'center'}
          className="min-w-[40px] flex-1 bg-transparent text-body-md text-text"
          placeholderTextColor={colors.textTertiary}
          underlineColorAndroid="transparent"
        />
        {trailingIcon ? <View className="ml-2 shrink-0">{trailingIcon}</View> : null}
        {trailingText ? (
          <VemtapText variant="caption" tone="tertiary" className="shrink-0">
            {trailingText}
          </VemtapText>
        ) : null}
      </View>
    </View>
  );
}

const rangeStyles = StyleSheet.create({
  thumb: { marginLeft: -10 },
});

const collapsibleStyles = StyleSheet.create({
  expanded: { transform: [{ rotate: '180deg' }] },
});

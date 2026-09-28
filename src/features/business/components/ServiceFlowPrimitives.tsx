import React, { type ReactNode } from 'react';
import { Pressable, TextInput, View, type TextInputProps } from 'react-native';
import { cssInterop } from 'nativewind';
import { cn } from '@utils/cn';
import { Button } from '@components/ui/Button';
import { Icon, type IconName } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';
import {
  BusinessActionDock,
  BusinessFieldLabel,
  BusinessInlineAction,
  BusinessProductImage,
  BusinessScreenLayout,
  BusinessSectionHeading,
  BusinessTextArea,
  SetupCard,
} from './BusinessPrimitives';
import { FieldInput, SwitchToggle, TextActionButton } from './BusinessSetupPrimitives';

cssInterop(Pressable, { className: 'style' });
cssInterop(TextInput, { className: 'style' });
cssInterop(View, { className: 'style' });

export interface ServiceFlowPageProps {
  title: string;
  onBack: () => void;
  onSaveDraft?: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  contentContainerClassName?: string;
}

export function ServiceFlowPage({
  title,
  onBack,
  onSaveDraft,
  children,
  footer,
  contentContainerClassName,
}: ServiceFlowPageProps) {
  return (
    <BusinessScreenLayout
      header={{ title, onBack, actionLabel: 'Draft', onAction: onSaveDraft }}
      footer={footer}
      contentContainerClassName={cn(
        'w-full max-w-[640px] self-center',
        contentContainerClassName ?? 'px-4 py-4',
      )}
    >
      {children}
    </BusinessScreenLayout>
  );
}

export interface ServiceFlowFooterProps {
  primaryLabel: string;
  onPrimary: () => void;
  /** Pass `null` for a CTA without a trailing glyph. */
  primaryRightIcon?: IconName | null;
  secondaryLabel?: string;
  onSecondary?: () => void;
  backLabel?: string;
  onBack?: () => void;
  footnote?: ReactNode;
}

export function ServiceFlowFooter({
  primaryLabel,
  onPrimary,
  primaryRightIcon = 'arrowForward',
  secondaryLabel,
  onSecondary,
  backLabel,
  onBack,
  footnote,
}: ServiceFlowFooterProps) {
  return (
    <BusinessActionDock>
      <View className="mx-auto w-full max-w-[640px] gap-3 pb-3">
        <Button
          label={primaryLabel}
          labelVariant="labelMd"
          labelNumberOfLines={2}
          rightIcon={
            primaryRightIcon ? (
              <Icon name={primaryRightIcon} size={20} color={colors.surface} />
            ) : undefined
          }
          onPress={onPrimary}
        />
        {backLabel ? (
          <Button
            label={backLabel}
            labelVariant="labelMd"
            variant="ghost"
            className="w-full border-0"
            labelClassName="font-sans-medium text-text-secondary"
            onPress={onBack}
          />
        ) : null}
        {secondaryLabel ? (
          <Pressable
            accessibilityRole="button"
            onPress={onSecondary}
            className="min-h-11 w-full items-center justify-center rounded-field px-3 active:bg-surface-muted"
          >
            <VemtapText variant="button" tone="secondary" className="text-center">
              {secondaryLabel}
            </VemtapText>
          </Pressable>
        ) : null}
        {footnote}
      </View>
    </BusinessActionDock>
  );
}

export interface ServiceProgressProps {
  stepLabel: string;
  detailLabel?: string;
  statusLabel: string;
  progress: number;
  title?: string;
  description?: string;
  statusTone?: 'primary' | 'success';
  showDot?: boolean;
  leadingIcon?: IconName;
  className?: string;
  stepLabelClassName?: string;
}

export function ServiceProgress({
  stepLabel,
  detailLabel,
  statusLabel,
  progress,
  title,
  description,
  statusTone = 'primary',
  showDot = false,
  leadingIcon,
  className,
  stepLabelClassName,
}: ServiceProgressProps) {
  const statusClass =
    statusTone === 'success'
      ? 'bg-success-container text-success'
      : 'bg-surface-tint text-primary';
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(progress) }}
      className={cn('gap-2', className)}
    >
      <View className="flex-row flex-wrap items-center justify-between gap-2">
        <View className="min-w-0 flex-1 flex-row items-center gap-2">
          {leadingIcon ? (
            <Icon name={leadingIcon} size={20} color={colors.primary} />
          ) : showDot ? (
            <View className="h-2 w-2 shrink-0 rounded-full bg-primary" />
          ) : null}
          <VemtapText
            variant="labelSm"
            tone="secondary"
            className={cn('font-sans-semibold', stepLabelClassName)}
          >
            {stepLabel}
          </VemtapText>
          {detailLabel ? (
            <VemtapText variant="bodyMd" tone="secondary" className="shrink-0">
              {detailLabel}
            </VemtapText>
          ) : null}
        </View>
        <View className={cn('rounded-full px-2 py-1', statusClass)}>
          <VemtapText variant="caption" className="font-sans-semibold">
            {statusLabel}
          </VemtapText>
        </View>
      </View>
      <View className="h-1.5 w-full overflow-hidden rounded-full bg-surface-container">
        <View
          className="h-full rounded-full bg-primary"
          style={{ width: `${Math.max(0, Math.min(progress, 100))}%` }}
        />
      </View>
      {title ? (
        <VemtapText
          accessibilityRole="header"
          variant="headingSm"
          className="text-heading-sm"
        >
          {title}
        </VemtapText>
      ) : null}
      {description ? (
        <VemtapText variant="caption" tone="secondary">
          {description}
        </VemtapText>
      ) : null}
    </View>
  );
}

export function ServiceSection({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <SetupCard
      className={cn('gap-4 rounded-card-lg border-0 bg-surface p-4 shadow-sm', className)}
    >
      {children}
    </SetupCard>
  );
}

export interface ServiceSectionHeaderProps {
  title: string;
  icon?: IconName;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  boxedIcon?: boolean;
}

export function ServiceSectionHeader({
  title,
  icon,
  subtitle,
  actionLabel,
  onAction,
  boxedIcon = false,
}: ServiceSectionHeaderProps) {
  const action = actionLabel ? (
    <BusinessInlineAction label={actionLabel} onPress={onAction} />
  ) : undefined;
  if (!boxedIcon) {
    return (
      <BusinessSectionHeading
        title={title}
        icon={icon}
        subtitle={subtitle}
        trailing={action}
      />
    );
  }
  return (
    <View className="flex-row items-start justify-between gap-3">
      <View className="min-w-0 flex-1 flex-row items-center gap-2">
        {icon ? (
          <View className="h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-tint">
            <Icon name={icon} size={20} color={colors.primary} />
          </View>
        ) : null}
        <View className="min-w-0 flex-1">
          <VemtapText variant="headingSm" className="text-heading-sm text-text">
            {title}
          </VemtapText>
          {subtitle ? (
            <VemtapText variant="caption" tone="secondary">
              {subtitle}
            </VemtapText>
          ) : null}
        </View>
      </View>
      {action ? <View className="shrink-0">{action}</View> : null}
    </View>
  );
}

export interface ServiceSettingRowProps {
  icon: IconName;
  label: string;
  value: string;
  supportingText?: string;
  actionLabel?: string;
  onAction?: () => void;
  verified?: boolean;
  iconContainerClassName?: string;
}

export function ServiceSettingRow({
  icon,
  label,
  value,
  supportingText,
  actionLabel,
  onAction,
  verified = false,
  iconContainerClassName = 'bg-surface-container',
}: ServiceSettingRowProps) {
  return (
    <View className="flex-row items-center justify-between gap-2">
      <View className="min-w-0 flex-1 flex-row items-center gap-2">
        <View
          className={cn(
            'h-9 w-9 shrink-0 items-center justify-center rounded-lg',
            iconContainerClassName,
          )}
        >
          <Icon name={icon} size={19} color={colors.primary} />
        </View>
        <View className="min-w-0 flex-1">
          <VemtapText variant="caption" tone="secondary">
            {label}
          </VemtapText>
          <View className="flex-row items-center gap-1">
            <VemtapText
              variant="labelMd"
              className="min-w-0 flex-shrink font-sans-semibold text-text"
              numberOfLines={1}
            >
              {value}
            </VemtapText>
            {verified ? <Icon name="verified" size={16} color={colors.primary} /> : null}
          </View>
          {supportingText ? (
            <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
              {supportingText}
            </VemtapText>
          ) : null}
        </View>
      </View>
      {actionLabel ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${actionLabel} ${label}`}
          onPress={onAction}
          className="min-h-11 shrink-0 justify-center rounded-field px-2 active:bg-surface-tint"
        >
          <VemtapText variant="labelSm" tone="brand" className="font-sans-semibold">
            {actionLabel}
          </VemtapText>
        </Pressable>
      ) : null}
    </View>
  );
}

export interface ServiceTextFieldProps extends Omit<
  TextInputProps,
  'className' | 'style' | 'accessibilityLabel'
> {
  label: string;
  required?: boolean;
  count?: string;
  hint?: string;
  multiline?: boolean;
  inputClassName?: string;
}

export function ServiceTextField({
  label,
  required = false,
  count,
  hint,
  multiline = false,
  inputClassName,
  value,
  onChangeText,
  placeholder,
  maxLength,
  autoCapitalize,
  keyboardType,
}: ServiceTextFieldProps) {
  const handleChangeText = onChangeText ?? (() => undefined);
  const fieldValue = value ?? '';
  return (
    <View className="gap-2">
      <BusinessFieldLabel
        label={label}
        required={required}
        trailing={
          count ? (
            <VemtapText variant="caption" tone="tertiary">
              {count}
            </VemtapText>
          ) : undefined
        }
      />
      {multiline ? (
        <BusinessTextArea
          value={fieldValue}
          onChangeText={handleChangeText}
          accessibilityLabel={label}
          placeholder={placeholder}
          minHeight={112}
        />
      ) : (
        <FieldInput
          value={fieldValue}
          onChangeText={handleChangeText}
          accessibilityLabel={label}
          placeholder={placeholder}
          maxLength={maxLength}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          className={inputClassName}
        />
      )}
      {hint ? (
        <VemtapText variant="caption" tone="secondary">
          {hint}
        </VemtapText>
      ) : null}
    </View>
  );
}

export interface ServiceChipProps {
  label: string;
  selected?: boolean;
  onPress: () => void;
  className?: string;
  accessibilityLabel?: string;
  leadingIcon?: IconName;
}

export function ServiceChip({
  label,
  selected = false,
  onPress,
  className,
  accessibilityLabel,
  leadingIcon,
}: ServiceChipProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ selected }}
      onPress={onPress}
      className={cn(
        'min-h-9 items-center justify-center rounded-full px-3 py-2 active:scale-[0.98]',
        selected ? 'bg-surface-tint shadow-sm' : 'bg-surface-container-low',
        className,
      )}
    >
      <View className="flex-row items-center justify-center gap-1">
        {leadingIcon ? (
          <Icon
            name={leadingIcon}
            size={16}
            color={selected ? colors.primary : colors.textSecondary}
          />
        ) : null}
        <VemtapText
          variant="labelMd"
          className={cn(
            'text-center',
            selected ? 'font-sans-semibold text-primary' : 'text-text-secondary',
          )}
        >
          {label}
        </VemtapText>
      </View>
    </Pressable>
  );
}

export interface ServiceChoiceCardProps {
  title: string;
  description: string;
  selected: boolean;
  onPress: () => void;
  icon?: IconName;
  selectionPosition?: 'left' | 'right';
  selectionStyle?: 'check' | 'dot';
  selectedTone?: 'tint' | 'surface';
  className?: string;
}

export function ServiceChoiceCard({
  title,
  description,
  selected,
  onPress,
  icon,
  selectionPosition = 'right',
  selectionStyle = 'check',
  selectedTone = 'tint',
  className,
}: ServiceChoiceCardProps) {
  const selection = (
    <View
      className={cn(
        'h-5 w-5 shrink-0 items-center justify-center rounded-full',
        selected ? 'bg-primary' : 'bg-surface-container-highest',
      )}
    >
      {selected ? (
        selectionStyle === 'dot' ? (
          <View className="h-2 w-2 rounded-full bg-surface" />
        ) : (
          <Icon name="check" size={14} color={colors.surface} />
        )
      ) : null}
    </View>
  );
  const content = (
    <View
      className={cn(
        'min-w-0 flex-1',
        selectionPosition === 'left' ? 'flex-row gap-3' : 'flex-row items-center gap-3',
      )}
    >
      {icon ? (
        <View
          className={cn(
            'h-10 w-10 shrink-0 items-center justify-center rounded-full',
            selected ? 'bg-primary' : 'bg-surface-container-highest',
          )}
        >
          <Icon
            name={icon}
            size={20}
            color={selected ? colors.surface : colors.secondary}
          />
        </View>
      ) : null}
      <View className="min-w-0 flex-1">
        <VemtapText
          variant="labelMd"
          className={cn(selected ? 'font-sans-semibold text-text' : 'text-text')}
        >
          {title}
        </VemtapText>
        <VemtapText variant="caption" tone="secondary">
          {description}
        </VemtapText>
      </View>
    </View>
  );
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={title}
      onPress={onPress}
      className={cn(
        'flex-row items-center gap-3 rounded-card-lg p-3',
        selected
          ? selectedTone === 'surface'
            ? 'bg-surface shadow-sm'
            : 'bg-surface-tint shadow-sm'
          : selectedTone === 'surface'
            ? 'bg-surface'
            : 'bg-surface-container-low',
        className,
      )}
    >
      {selectionPosition === 'left' ? selection : null}
      {content}
      {selectionPosition === 'right' ? selection : null}
    </Pressable>
  );
}

export function ServiceToggle({
  value,
  onValueChange,
  accessibilityLabel,
}: {
  value: boolean;
  onValueChange: (value: boolean) => void;
  accessibilityLabel: string;
}) {
  return (
    <SwitchToggle
      value={value}
      onValueChange={onValueChange}
      accessibilityLabel={accessibilityLabel}
    />
  );
}

export function ServiceInfoRow({
  icon,
  title,
  description,
  tone = 'primary',
  iconContainerClassName,
}: {
  icon: IconName;
  title: string;
  description: string;
  tone?: 'primary' | 'success' | 'tertiary';
  iconContainerClassName?: string;
}) {
  const iconColor =
    tone === 'success'
      ? colors.badgeDiscountText
      : tone === 'tertiary'
        ? colors.tertiaryContainer
        : colors.primary;
  return (
    <View className="flex-row items-start gap-3">
      <View
        className={cn(
          'h-8 w-8 shrink-0 items-center justify-center rounded-full',
          iconContainerClassName ??
            (tone === 'success'
              ? 'bg-success-container'
              : tone === 'tertiary'
                ? 'bg-surface-tint'
                : 'bg-primary'),
        )}
      >
        <Icon
          name={icon}
          size={18}
          color={tone === 'primary' ? colors.surface : iconColor}
        />
      </View>
      <View className="min-w-0 flex-1">
        <VemtapText variant="labelMd" className="font-sans-semibold text-text">
          {title}
        </VemtapText>
        <VemtapText variant="caption" tone="secondary">
          {description}
        </VemtapText>
      </View>
    </View>
  );
}

export interface ServicePriceFieldProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  optionalLabel?: string;
  badge?: string;
  trailingLabel?: string;
  trailingIcon?: IconName;
  emphasized?: boolean;
  lineThrough?: boolean;
}

export function ServicePriceField({
  label,
  value,
  onChangeText,
  optionalLabel,
  badge,
  trailingLabel,
  trailingIcon,
  emphasized = false,
  lineThrough = false,
}: ServicePriceFieldProps) {
  return (
    <View className="gap-1.5">
      <View className="flex-row flex-wrap items-center justify-between gap-2">
        <VemtapText variant="labelSm" className="font-sans-medium text-text">
          {label}{' '}
          {optionalLabel ? (
            <VemtapText variant="caption" tone="tertiary">
              {optionalLabel}
            </VemtapText>
          ) : null}
        </VemtapText>
        {badge ? (
          <View className="rounded-full bg-success-container px-2 py-0.5">
            <VemtapText variant="caption" tone="success" className="font-sans-semibold">
              {badge}
            </VemtapText>
          </View>
        ) : null}
      </View>
      <View className="h-[52px] flex-row items-center rounded-field bg-surface-container-low px-4">
        <VemtapText
          variant={emphasized ? 'headingLg' : 'bodyLg'}
          className="mr-2 font-sans-bold text-text-secondary"
        >
          ₦
        </VemtapText>
        <TextInput
          accessibilityLabel={label}
          allowFontScaling
          keyboardType="number-pad"
          maxFontSizeMultiplier={1.8}
          onChangeText={onChangeText}
          underlineColorAndroid="transparent"
          value={value}
          className={cn(
            'min-w-0 flex-1 bg-transparent p-0 text-text',
            emphasized
              ? 'font-sans-bold text-heading-lg'
              : 'text-body-lg text-text-secondary',
            lineThrough ? 'line-through' : null,
          )}
        />
        {trailingLabel ? (
          <View className="rounded-lg bg-success-container px-2 py-1">
            <VemtapText variant="caption" tone="success" className="font-sans-medium">
              {trailingLabel}
            </VemtapText>
          </View>
        ) : null}
        {trailingIcon ? (
          <Icon name={trailingIcon} size={20} color={colors.textTertiary} />
        ) : null}
      </View>
    </View>
  );
}

export function ServiceLinkButton({
  label,
  onPress,
  icon,
  className,
}: {
  label: string;
  onPress?: () => void;
  icon?: IconName;
  className?: string;
}) {
  return (
    <TextActionButton
      label={label}
      onPress={onPress}
      icon={icon}
      tone="brand"
      className={cn(
        'w-full bg-surface-container-low active:bg-surface-container-high',
        className,
      )}
    />
  );
}

export function ServiceMediaThumbnail({
  uri,
  alt,
  number,
}: {
  uri: string;
  alt: string;
  number?: number;
}) {
  return (
    <View className="relative aspect-square flex-1 overflow-hidden rounded-lg bg-surface-container shadow-sm">
      <BusinessProductImage
        source={{ uri }}
        alt={alt}
        className="h-full w-full"
        resizeMode="cover"
      />
      {number ? (
        <View className="absolute bottom-1 right-1 h-4 w-4 items-center justify-center rounded-full bg-inverse-surface/80">
          <VemtapText className="font-sans-semibold text-micro text-inverse-on-surface">
            {number}
          </VemtapText>
        </View>
      ) : null}
    </View>
  );
}

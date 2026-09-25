import React from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { Button } from '@components/ui/Button';
import { Icon, type IconName } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';
import { navbarBottomShadow } from '@theme/shadows';

cssInterop(View, { className: 'style' });
cssInterop(Pressable, { className: 'style' });
cssInterop(ScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});
cssInterop(TextInput, { className: 'style' });

export function AccountHeader({
  title,
  onBack,
  onAction,
  actionIcon = 'more',
}: {
  title: string;
  onBack?: () => void;
  onAction?: () => void;
  actionIcon?: IconName;
}) {
  return (
    <View
      className="flex-row items-center justify-between bg-surface px-4 pb-3 pt-2"
      style={navbarBottomShadow}
    >
      <View className="min-w-0 flex-1 flex-row items-center gap-1">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={onBack}
          className="h-11 w-11 items-center justify-center rounded-full"
        >
          <Icon name="back" size={24} color={colors.surfaceDark} />
        </Pressable>
        <VemtapText
          accessibilityRole="header"
          variant="headingSm"
          className="text-heading-sm"
          numberOfLines={1}
        >
          {title}
        </VemtapText>
      </View>
      <View className="shrink-0 flex-row items-center gap-1">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="More options"
          onPress={onAction}
          className="h-11 w-11 items-center justify-center rounded-full"
        >
          <Icon name={actionIcon} size={22} color={colors.textSecondary} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open account"
          className="h-8 w-8 items-center justify-center rounded-full bg-primary"
        >
          <Icon name="person" size={17} color={colors.surface} />
        </Pressable>
      </View>
    </View>
  );
}

export function AccountSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View className="gap-2">
      <VemtapText
        variant="labelSm"
        tone="tertiary"
        className="px-1 font-sans-semibold uppercase tracking-wider"
      >
        {title}
      </VemtapText>
      <View className="overflow-hidden rounded-card bg-surface shadow-sm">
        {children}
      </View>
    </View>
  );
}

export function AccountMenuRow({
  icon,
  title,
  subtitle,
  onPress,
  badge,
}: {
  icon: IconName;
  title: string;
  subtitle: string;
  onPress?: () => void;
  badge?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="min-h-16 flex-row items-center gap-3 border-b border-border px-4 py-3"
    >
      <View className="h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-container-low">
        <Icon name={icon} size={21} color={colors.secondary} />
      </View>
      <View className="min-w-0 flex-1">
        <VemtapText variant="labelMd" className="font-sans-medium">
          {title}
        </VemtapText>
        <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
          {subtitle}
        </VemtapText>
      </View>
      {badge ? (
        <View className="shrink-0 rounded-full bg-surface-container-low px-2 py-1">
          <VemtapText variant="micro" tone="secondary">
            {badge}
          </VemtapText>
        </View>
      ) : null}
      <Icon name="forward" size={20} color={colors.textTertiary} />
    </Pressable>
  );
}

export function StatCard({
  icon,
  value,
  label,
  tone = 'primary',
  onPress,
}: {
  icon: IconName;
  value: string;
  label: string;
  tone?: 'primary' | 'tertiary' | 'success';
  onPress?: () => void;
}) {
  const bg =
    tone === 'success'
      ? 'bg-badge-discount-bg'
      : tone === 'tertiary'
        ? 'bg-tertiary-fixed'
        : 'bg-surface-tint-blue';
  const tint =
    tone === 'success'
      ? colors.badgeDiscountText
      : tone === 'tertiary'
        ? colors.tertiary
        : colors.primary;
  const body = (
    <>
      <View className={`h-9 w-9 items-center justify-center rounded-xl ${bg}`}>
        <Icon name={icon} size={20} color={tint} />
      </View>
      <View className="mt-3">
        <VemtapText
          variant="headingMd"
          className={tone === 'success' ? 'text-badge-discount-text' : 'text-text'}
          numberOfLines={1}
        >
          {value}
        </VemtapText>
        <VemtapText variant="caption" tone="secondary" numberOfLines={2}>
          {label}
        </VemtapText>
      </View>
      {onPress ? (
        <VemtapText
          variant="labelSm"
          tone="brand"
          className="mt-3 font-sans-semibold"
          numberOfLines={1}
        >
          Open →
        </VemtapText>
      ) : null}
    </>
  );
  return onPress ? (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="min-w-0 flex-1 rounded-card bg-surface p-4 shadow-sm"
    >
      {body}
    </Pressable>
  ) : (
    <View className="min-w-0 flex-1 rounded-card bg-surface p-4 shadow-sm">{body}</View>
  );
}

export function FormSection({ children }: { children: React.ReactNode }) {
  return <View className="gap-4 rounded-card bg-surface p-4 shadow-sm">{children}</View>;
}

export function ProfileField({
  label,
  value,
  onChangeText,
  icon,
  placeholder,
}: {
  label: string;
  value: string;
  onChangeText?: (value: string) => void;
  icon?: IconName;
  placeholder?: string;
}) {
  return (
    <View className="gap-1.5">
      <VemtapText variant="labelSm" tone="secondary">
        {label}
      </VemtapText>
      <View className="min-h-[52px] flex-row items-center gap-2 rounded-field bg-surface-container-low px-3">
        <Icon name={icon ?? 'person'} size={19} color={colors.textTertiary} />
        <TextInput
          accessibilityLabel={label}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textTertiary}
          className="min-w-0 flex-1 text-body-md text-text"
        />
      </View>
    </View>
  );
}

export function TransactionRow({
  title,
  subtitle,
  amount,
  positive,
  icon = 'wallet',
}: {
  title: string;
  subtitle: string;
  amount: string;
  positive?: boolean;
  icon?: IconName;
}) {
  return (
    <View className="flex-row items-center gap-3 border-b border-border px-4 py-3">
      <View className="h-9 w-9 items-center justify-center rounded-full bg-surface-container-low">
        <Icon
          name={icon}
          size={18}
          color={positive ? colors.badgeDiscountText : colors.secondary}
        />
      </View>
      <View className="min-w-0 flex-1">
        <VemtapText variant="labelMd" numberOfLines={1}>
          {title}
        </VemtapText>
        <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
          {subtitle}
        </VemtapText>
      </View>
      <VemtapText variant="labelMd" tone={positive ? 'success' : 'default'}>
        {amount}
      </VemtapText>
    </View>
  );
}

export function ActivityTimelineRow({
  title,
  subtitle,
  amount,
  icon = 'storefront',
  positive,
}: {
  title: string;
  subtitle: string;
  amount: string;
  icon?: IconName;
  positive?: boolean;
}) {
  return (
    <View className="flex-row gap-3">
      <View className="items-center">
        <View className="h-10 w-10 items-center justify-center rounded-full bg-surface-tint-blue">
          <Icon name={icon} size={20} color={colors.primary} />
        </View>
        <View className="h-full w-px bg-border" />
      </View>
      <View className="min-w-0 flex-1 flex-row justify-between gap-3 pb-5">
        <View className="min-w-0 flex-1">
          <VemtapText variant="labelMd" className="font-sans-semibold">
            {title}
          </VemtapText>
          <VemtapText variant="caption" tone="secondary">
            {subtitle}
          </VemtapText>
        </View>
        <VemtapText variant="labelSm" tone={positive ? 'success' : 'brand'}>
          {amount}
        </VemtapText>
      </View>
    </View>
  );
}

export function PageScroll({ children }: { children: React.ReactNode }) {
  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="gap-4 px-4 pb-8 pt-4"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
}

export function ActionGrid({
  actions,
}: {
  actions: Array<{ label: string; icon: IconName; onPress?: () => void }>;
}) {
  return (
    <View className="flex-row gap-2">
      {actions.map(action => (
        <Button
          key={action.label}
          label={action.label}
          variant="secondary"
          size="sm"
          fullWidth={false}
          className="min-w-0 flex-1"
          onPress={action.onPress}
          leftIcon={<Icon name={action.icon} size={18} color={colors.primary} />}
        />
      ))}
    </View>
  );
}

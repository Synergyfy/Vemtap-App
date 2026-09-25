import React from 'react';
import { Image, Pressable, TextInput, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { Button } from '@components/ui/Button';
import { Icon, type IconName } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';
import { navbarBottomShadow } from '@theme/shadows';

cssInterop(View, { className: 'style' });
cssInterop(Pressable, { className: 'style' });
cssInterop(TextInput, { className: 'style' });

const hubHeaderTitleClasses = {
  headingXl: 'text-heading-xl',
  headingMd: 'text-heading-md',
  headingSm: 'text-heading-sm',
} as const;

export function HubHeader({
  title,
  leadingIcon,
  titleVariant = 'headingSm',
  actionNames = [],
  actionLabels = [],
  onActions = [],
  accountAction,
}: {
  title: string;
  leadingIcon?: IconName;
  titleVariant?: keyof typeof hubHeaderTitleClasses;
  actionNames?: IconName[];
  actionLabels?: string[];
  onActions?: Array<(() => void) | undefined>;
  accountAction?: () => void;
}) {
  return (
    <View
      className="flex-row items-center justify-between bg-surface px-4 py-2"
      style={navbarBottomShadow}
    >
      <View className="min-w-0 flex-1 flex-row items-center gap-2">
        {leadingIcon ? (
          <Icon name={leadingIcon} size={20} color={colors.primary} />
        ) : null}
        <VemtapText
          accessibilityRole="header"
          variant={titleVariant}
          className={hubHeaderTitleClasses[titleVariant]}
          numberOfLines={1}
        >
          {title}
        </VemtapText>
      </View>
      <View className="shrink-0 flex-row items-center gap-1">
        {actionNames.map((name, index) => (
          <Pressable
            key={name}
            accessibilityRole="button"
            accessibilityLabel={actionLabels[index]}
            onPress={onActions[index]}
            className="h-11 w-11 items-center justify-center rounded-full active:bg-surface-container-low"
          >
            <Icon name={name} size={22} color={colors.surfaceDark} />
          </Pressable>
        ))}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={accountAction ? 'Open account' : undefined}
          onPress={accountAction}
          className="h-8 w-8 items-center justify-center rounded-full bg-primary"
        >
          <Icon name="person" size={18} color={colors.surface} />
        </Pressable>
      </View>
    </View>
  );
}

export function HubSearchField({
  value,
  onChangeText,
  placeholder,
  filterLabel,
  onFilter,
}: {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  filterLabel: string;
  onFilter?: () => void;
}) {
  return (
    <View className="relative">
      <Icon
        name="search"
        size={20}
        color={colors.textTertiary}
        style={styles.searchIcon}
      />
      <TextInput
        accessibilityLabel={placeholder}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        className="h-12 w-full rounded-field bg-surface-container-lowest pl-11 pr-12 text-body-md text-text shadow-sm"
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={filterLabel}
        onPress={onFilter}
        className="absolute right-0 top-0 h-12 w-12 items-center justify-center"
      >
        <Icon name="tune" size={19} color={colors.textSecondary} />
      </Pressable>
    </View>
  );
}

export function StatusPillTabs({
  labels,
  selected,
  onSelect,
  variant = 'solid',
}: {
  labels: readonly string[];
  selected: number;
  onSelect: (index: number) => void;
  variant?: 'solid' | 'subtle';
}) {
  const activeClass =
    variant === 'subtle'
      ? 'shrink-0 rounded-full bg-surface-tint-blue px-4 py-2 shadow-sm'
      : 'shrink-0 rounded-full bg-primary px-4 py-2 shadow-sm';
  const activeTextClass =
    variant === 'subtle' ? 'text-primary' : 'text-primary-foreground';
  return (
    <View className="flex-row gap-2">
      {labels.map((label, index) => (
        <Pressable
          key={label}
          accessibilityRole="tab"
          accessibilityState={{ selected: index === selected }}
          onPress={() => onSelect(index)}
          className={
            index === selected
              ? activeClass
              : 'shrink-0 rounded-full bg-surface-container-high px-4 py-2'
          }
        >
          <VemtapText
            variant="labelMd"
            className={index === selected ? activeTextClass : 'text-text-secondary'}
          >
            {label}
          </VemtapText>
        </Pressable>
      ))}
    </View>
  );
}

export function SectionLink({ label, onPress }: { label: string; onPress?: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="flex-row items-center"
    >
      <VemtapText variant="labelSm" tone="brand" className="font-sans-semibold">
        {label}
      </VemtapText>
      <Icon name="forward" size={16} color={colors.primary} />
    </Pressable>
  );
}

export function MetricTile({
  value,
  label,
  icon,
  tone,
}: {
  value: string;
  label: string;
  icon: IconName;
  tone: 'primary' | 'tertiary' | 'success';
}) {
  const iconBackground = {
    primary: 'bg-surface-tint-blue',
    tertiary: 'bg-tertiary-fixed',
    success: 'bg-badge-discount-bg',
  }[tone];
  const iconColor = {
    primary: colors.primary,
    tertiary: colors.tertiary,
    success: colors.badgeDiscountText,
  }[tone];

  return (
    <View className="min-w-0 flex-1 rounded-card bg-surface p-3 shadow-sm">
      <View
        className={`mb-2 h-8 w-8 items-center justify-center rounded-lg ${iconBackground}`}
      >
        <Icon name={icon} size={18} color={iconColor} />
      </View>
      <VemtapText
        variant="headingMd"
        className={tone === 'success' ? 'text-badge-discount-text' : 'text-text'}
        numberOfLines={1}
      >
        {value}
      </VemtapText>
      <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
        {label}
      </VemtapText>
    </View>
  );
}

export function ImageBadge({
  uri,
  badge,
  className = 'h-20 w-20',
}: {
  uri: string;
  badge: string;
  className?: string;
}) {
  return (
    <View
      className={`relative shrink-0 overflow-hidden rounded-field bg-surface-container ${className}`}
    >
      <Image source={{ uri }} className="h-full w-full" resizeMode="cover" />
      <View className="absolute left-1 top-1 rounded bg-badge-discount-bg px-1.5 py-0.5">
        <VemtapText variant="caption" className="font-sans-bold text-badge-discount-text">
          {badge}
        </VemtapText>
      </View>
    </View>
  );
}

export function QuickAction({
  icon,
  label,
  onPress,
}: {
  icon: IconName;
  label: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="min-w-0 flex-1 items-center rounded-card bg-surface px-1 py-3 shadow-sm active:bg-surface-container-low"
    >
      <View className="mb-1 h-10 w-10 items-center justify-center rounded-full bg-surface-tint-blue">
        <Icon name={icon} size={21} color={colors.primary} />
      </View>
      <VemtapText variant="caption" className="text-text" numberOfLines={1}>
        {label}
      </VemtapText>
    </Pressable>
  );
}

export function ActionButton({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: IconName;
  onPress?: () => void;
}) {
  return (
    <Button
      label={label}
      size="sm"
      leftIcon={<Icon name={icon} size={17} color={colors.surface} />}
      onPress={onPress}
    />
  );
}

const styles = {
  searchIcon: { position: 'absolute' as const, left: 16, top: 15, zIndex: 2 },
};

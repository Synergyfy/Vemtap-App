import React from 'react';
import { Image, Pressable, TextInput, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { Button } from '@components/ui/Button';
import { Icon, type IconName } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';

cssInterop(View, { className: 'style' });
cssInterop(Pressable, { className: 'style' });
cssInterop(TextInput, { className: 'style' });

export function HubHeader({
  title,
  actionNames = [],
  actionLabels = [],
  onActions = [],
  accountAction,
}: {
  title: string;
  actionNames?: IconName[];
  actionLabels?: string[];
  onActions?: Array<(() => void) | undefined>;
  accountAction?: () => void;
}) {
  return (
    <View className="flex-row items-center justify-between bg-surface px-4 py-2">
      <VemtapText
        accessibilityRole="header"
        variant="headingXl"
        className="text-heading-xl"
      >
        {title}
      </VemtapText>
      <View className="flex-row items-center gap-1">
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
}: {
  labels: readonly string[];
  selected: number;
  onSelect: (index: number) => void;
}) {
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
              ? 'shrink-0 rounded-full bg-primary px-4 py-2 shadow-sm'
              : 'shrink-0 rounded-full bg-surface-container-high px-4 py-2'
          }
        >
          <VemtapText
            variant="labelMd"
            className={
              index === selected ? 'text-primary-foreground' : 'text-text-secondary'
            }
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

export function HubBottomBar({
  active,
  onNavigate,
  mode = 'consumer',
}: {
  active: 'home' | 'deals' | 'discover' | 'saved' | 'account';
  onNavigate?: (destination: string) => void;
  mode?: 'consumer' | 'dashboard';
}) {
  const items: { key: typeof active; label: string; icon: IconName; badge?: string }[] =
    mode === 'dashboard'
      ? [
          { key: 'home', label: 'Home', icon: 'home' },
          { key: 'deals', label: 'My Deals', icon: 'voucher', badge: '3' },
          { key: 'discover', label: 'Messages', icon: 'message', badge: '1' },
          { key: 'saved', label: 'Orders', icon: 'badge' },
          { key: 'account', label: 'More', icon: 'more' },
        ]
      : [
          { key: 'home', label: 'Home', icon: 'home' },
          { key: 'deals', label: 'My Deals', icon: 'voucher', badge: '3' },
          { key: 'discover', label: 'Discover', icon: 'explore' },
          { key: 'saved', label: 'Saved', icon: 'bookmark' },
          { key: 'account', label: 'Account', icon: 'accountCircle' },
        ];
  return (
    <View className="flex-row items-center justify-around border-t border-border bg-surface px-2 pb-2 pt-1">
      {items.map(item => {
        const selected = item.key === active;
        return (
          <Pressable
            key={item.key}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onNavigate?.(item.key)}
            className="min-h-12 min-w-14 items-center justify-center py-1"
          >
            <Icon
              name={item.icon}
              size={22}
              color={selected ? colors.primary : colors.textSecondary}
            />
            <VemtapText
              variant="micro"
              className={selected ? 'text-primary' : 'text-text-secondary'}
            >
              {item.label}
            </VemtapText>
          </Pressable>
        );
      })}
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

import React from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { Icon } from '@components/ui/Icon';
import { colors } from '@theme/colors';
import { strings } from '@constants/strings';
import { cn } from '@utils/cn';

cssInterop(View, { className: 'style' });
cssInterop(TextInput, { className: 'style' });
cssInterop(Pressable, { className: 'style' });

export interface HomeSearchBarProps {
  variant?: 'default' | 'outlined';
  placeholder?: string;
  filterLabel?: string;
  onFilterPress?: () => void;
  value?: string;
  onChangeText?: (value: string) => void;
  showFilter?: boolean;
}

export function HomeSearchBar({
  variant = 'default',
  placeholder,
  filterLabel,
  onFilterPress,
  value,
  onChangeText,
  showFilter = true,
}: HomeSearchBarProps) {
  const isOutlined = variant === 'outlined';
  const label = placeholder ?? strings.home.searchPlaceholder;
  const a11yFilter = filterLabel ?? strings.home.filter;

  return (
    <View className="w-full">
      <View
        className={cn(
          'flex-row items-center shadow-sm',
          isOutlined
            ? 'h-12 gap-2 rounded-xl border border-outline-variant/60 bg-surface-container-lowest px-4'
            : 'h-[50px] gap-3 rounded-2xl bg-surface-container-low px-4',
        )}
      >
        <Icon
          name="search"
          size={22}
          color={isOutlined ? colors.textSecondary : colors.textTertiary}
        />
        <TextInput
          accessibilityLabel={label}
          placeholder={label}
          placeholderTextColor={colors.textTertiary}
          value={value}
          onChangeText={onChangeText}
          className="min-w-0 flex-1 bg-transparent p-0 font-sans text-body-md text-text"
        />
        {showFilter ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={a11yFilter}
            className={cn(
              isOutlined ? 'h-8 w-8 items-center justify-center rounded-lg' : 'p-1',
            )}
            hitSlop={8}
            onPress={onFilterPress}
          >
            <Icon name="tune" size={isOutlined ? 20 : 22} color={colors.textSecondary} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

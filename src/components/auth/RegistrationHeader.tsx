import React from 'react';
import { Pressable, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { VemtapText } from '@components/ui/Text';
import { Icon } from '@components/ui/Icon';
import { colors } from '@theme/colors';
import { navbarBottomShadow } from '@theme/shadows';
import { strings } from '@constants/strings';

cssInterop(View, { className: 'style' });
cssInterop(Pressable, { className: 'style' });

export interface RegistrationHeaderProps {
  title: string;
  onBack: () => void;
  showShareAction?: boolean;
  onShare?: () => void;
  showMoreAction?: boolean;
  onMore?: () => void;
  largeTitle?: boolean;
}

/** Fixed chrome header from customer_registration_step_* HTML (back · title · avatar). */
export function RegistrationHeader({
  title,
  onBack,
  showShareAction = false,
  onShare,
  showMoreAction = false,
  onMore,
  largeTitle = false,
}: RegistrationHeaderProps) {
  return (
    <View
      className="w-full flex-row items-center justify-between bg-surface px-6 pb-3 pt-2"
      style={navbarBottomShadow}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={strings.common.goBack}
        hitSlop={8}
        className="-ml-2 h-11 w-11 items-center justify-center rounded-full active:bg-surface-container-low"
        onPress={onBack}
      >
        <Icon name="back" size={24} color={colors.surfaceDark} />
      </Pressable>
      <VemtapText
        accessibilityRole="header"
        variant={largeTitle ? 'headingXl' : 'headingSm'}
        className={
          largeTitle
            ? 'max-w-[200px] text-center text-heading-xl'
            : 'max-w-[200px] text-center'
        }
        numberOfLines={1}
      >
        {title}
      </VemtapText>
      <View className="flex-row items-center justify-end gap-1">
        {showShareAction ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={strings.deals.dealShare}
            hitSlop={8}
            className="h-11 w-11 items-center justify-center rounded-full active:bg-surface-container-high"
            onPress={onShare}
          >
            <Icon name="share" size={22} color={colors.textSecondary} />
          </Pressable>
        ) : null}
        {showMoreAction ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={strings.common.more}
            hitSlop={8}
            className="h-11 w-11 items-center justify-center rounded-full active:bg-surface-container-high"
            onPress={onMore}
          >
            <Icon name="more" size={22} color={colors.textSecondary} />
          </Pressable>
        ) : null}
        <View className="h-8 w-8 items-center justify-center rounded-full bg-primary shadow-sm">
          <Icon name="person" size={18} color={colors.surface} />
        </View>
      </View>
    </View>
  );
}

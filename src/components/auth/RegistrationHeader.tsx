import React from 'react';
import { Pressable, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { cn } from '@utils/cn';
import { VemtapText } from '@components/ui/Text';
import { Avatar } from '@components/ui/Avatar';
import { Icon } from '@components/ui/Icon';
import { ProgressDots } from '@components/onboarding/ProgressDots';
import { colors } from '@theme/colors';
import { navbarBottomShadow } from '@theme/shadows';
import { strings } from '@constants/strings';
import { useCurrentUserDisplay } from '@hooks/useCurrentUserDisplay';

cssInterop(View, { className: 'style' });
cssInterop(Pressable, { className: 'style' });

export interface RegistrationHeaderProps {
  title: string;
  onBack: () => void;
  showShareAction?: boolean;
  onShare?: () => void;
  showMoreAction?: boolean;
  onMore?: () => void;
  helpLabel?: string;
  onHelp?: () => void;
  titleAlign?: 'center' | 'start';
  largeTitle?: boolean;
  compactTitle?: boolean;
  progress?: { activeIndex: number; total: number };
}

/** Fixed chrome header from customer_registration_step_* HTML (back · title · avatar). */
export function RegistrationHeader({
  title,
  onBack,
  showShareAction = false,
  onShare,
  showMoreAction = false,
  onMore,
  helpLabel,
  onHelp,
  titleAlign = 'center',
  largeTitle = false,
  compactTitle = false,
  progress,
}: RegistrationHeaderProps) {
  const display = useCurrentUserDisplay();
  const alignStart = titleAlign === 'start';
  return (
    <View
      className="w-full flex-row items-center justify-between bg-surface px-6 pb-3 pt-2"
      style={navbarBottomShadow}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={strings.common.goBack}
        hitSlop={8}
        className="-ml-2 h-11 w-11 shrink-0 items-center justify-center rounded-full active:bg-surface-container-low"
        onPress={onBack}
      >
        <Icon name="back" size={24} color={colors.surfaceDark} />
      </Pressable>
      <View
        className={cn(
          'min-w-0 flex-1 justify-center',
          alignStart ? 'items-start' : 'items-center',
        )}
      >
        {progress ? (
          <View className="mb-1">
            <ProgressDots total={progress.total} activeIndex={progress.activeIndex} />
          </View>
        ) : null}
        <VemtapText
          accessibilityRole="header"
          variant={compactTitle ? 'labelSm' : largeTitle ? 'headingXl' : 'headingSm'}
          tone={compactTitle ? 'secondary' : 'default'}
          className={cn(
            'max-w-full',
            largeTitle ? 'text-heading-xl' : 'text-heading-sm',
            alignStart ? 'text-left' : 'text-center',
          )}
          numberOfLines={1}
        >
          {title}
        </VemtapText>
      </View>
      <View className="shrink-0 flex-row items-center justify-end gap-1">
        {helpLabel ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={helpLabel}
            hitSlop={8}
            onPress={onHelp}
            className="h-11 w-11 items-center justify-center rounded-full active:bg-surface-container-high"
          >
            <Icon name="help" size={20} color={colors.textSecondary} />
          </Pressable>
        ) : null}
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
        <Avatar name={display.fullName} size="sm" tone="brand" />
      </View>
    </View>
  );
}

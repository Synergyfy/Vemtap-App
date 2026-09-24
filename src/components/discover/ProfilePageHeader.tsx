import React from 'react';
import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cssInterop } from 'nativewind';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';
import { navbarBottomShadow } from '@theme/shadows';
import { strings } from '@constants/strings';

cssInterop(View, { className: 'style' });
cssInterop(Pressable, { className: 'style' });
cssInterop(SafeAreaView, { className: 'style' });

interface ProfilePageHeaderProps {
  title: string;
  onBack: () => void;
  right?: React.ReactNode;
}

export function ProfilePageHeader({ title, onBack, right }: ProfilePageHeaderProps) {
  return (
    <SafeAreaView edges={['top']} className="bg-surface">
      <View
        style={navbarBottomShadow}
        className="h-14 w-full flex-row items-center justify-between bg-surface px-6"
      >
        <View className="min-w-0 flex-1 flex-row items-center gap-1">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={strings.common.goBack}
            onPress={onBack}
            className="h-11 w-11 shrink-0 items-center justify-center rounded-full active:bg-surface-muted"
          >
            <Icon name="back" size={24} color={colors.text} />
          </Pressable>
          <VemtapText
            accessibilityRole="header"
            variant="headingSm"
            className="min-w-0 flex-1 text-heading-sm text-text"
            numberOfLines={1}
          >
            {title}
          </VemtapText>
        </View>
        <View className="shrink-0 flex-row items-center gap-1">{right}</View>
      </View>
    </SafeAreaView>
  );
}

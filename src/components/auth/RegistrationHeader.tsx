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
}

/** Fixed chrome header from customer_registration_step_* HTML (back · title · avatar). */
export function RegistrationHeader({ title, onBack }: RegistrationHeaderProps) {
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
        variant="headingSm"
        className="max-w-[200px] text-center"
        numberOfLines={1}
      >
        {title}
      </VemtapText>
      <View className="h-8 w-8 items-center justify-center rounded-full bg-primary">
        <Icon name="person" size={18} color="#FFFFFF" />
      </View>
    </View>
  );
}

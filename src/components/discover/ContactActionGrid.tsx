import React from 'react';
import { Linking, Pressable, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { Icon, type IconName } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';
import { strings } from '@constants/strings';

cssInterop(View, { className: 'style' });
cssInterop(Pressable, { className: 'style' });

interface ContactAction {
  label: string;
  icon: IconName;
  onPress: () => void;
  badge?: string;
  success?: boolean;
}

interface ContactActionGridProps {
  phone: string;
  whatsappUrl: string;
  onInApp: () => void;
  onWebsite: () => void;
}

export function ContactActionGrid({
  phone,
  whatsappUrl,
  onInApp,
  onWebsite,
}: ContactActionGridProps) {
  const actions: ContactAction[] = [
    {
      label: strings.urbanProfile.call,
      icon: 'phone',
      onPress: () => {
        Linking.openURL(`tel:${phone}`).catch(() => undefined);
      },
    },
    {
      label: strings.urbanProfile.inApp,
      icon: 'message',
      onPress: onInApp,
      badge: strings.urbanProfile.fast,
    },
    {
      label: strings.urbanProfile.whatsapp,
      icon: 'whatsapp',
      onPress: () => {
        Linking.openURL(whatsappUrl).catch(() => undefined);
      },
      success: true,
    },
    { label: strings.urbanProfile.website, icon: 'explore', onPress: onWebsite },
  ];
  return (
    <View className="flex-row gap-2">
      {actions.map(action => (
        <Pressable
          key={action.label}
          accessibilityRole="button"
          onPress={action.onPress}
          className="relative min-w-0 flex-1 items-center gap-1 rounded-2xl border border-border bg-surface-canvas p-3 shadow-md active:scale-95"
        >
          <View
            className={`h-10 w-10 items-center justify-center rounded-full ${action.success ? 'bg-badge-discount-bg' : 'bg-surface-tint'}`}
          >
            <Icon
              name={action.icon}
              size={20}
              color={action.success ? colors.badgeDiscountText : colors.primary}
            />
          </View>
          <VemtapText
            variant="caption"
            tone="secondary"
            className="text-center"
            numberOfLines={1}
          >
            {action.label}
          </VemtapText>
          {action.badge ? (
            <View className="absolute -top-1 rounded-full bg-primary px-1.5 py-0.5">
              <VemtapText className="text-micro text-primary-foreground">
                {action.badge}
              </VemtapText>
            </View>
          ) : null}
        </Pressable>
      ))}
    </View>
  );
}

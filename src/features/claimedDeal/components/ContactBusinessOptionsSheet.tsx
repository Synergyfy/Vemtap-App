import React, { useCallback } from 'react';
import { Linking, Pressable, ScrollView, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { BottomSheet } from '@components/shared/BottomSheet';
import { Button } from '@components/ui/Button';
import { Icon, type IconName } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';

cssInterop(View, { className: 'style' });
cssInterop(Pressable, { className: 'style' });
cssInterop(ScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});

export interface ContactBusinessOptionsSheetProps {
  visible: boolean;
  onClose: () => void;
  onOpenChat: () => void;
}

const copy = strings.myClaimedDeal.contact;

type ContactOptionProps = {
  icon: IconName;
  title: string;
  description: string;
  recommended?: string;
  onPress: () => void;
};

function ContactOption({
  icon,
  title,
  description,
  recommended,
  onPress,
}: ContactOptionProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="w-full flex-row items-center justify-between rounded-xl border border-border bg-surface-subtle p-3 active:border-border-active active:bg-surface-container-high"
    >
      <View className="min-w-0 flex-1 flex-row items-center gap-3">
        <View className="h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface-tint">
          <Icon name={icon} size={22} color={colors.primary} />
        </View>
        <View className="min-w-0 flex-1">
          <View className="flex-row flex-wrap items-center gap-1.5">
            <VemtapText variant="labelMd" className="font-sans-semibold text-text">
              {title}
            </VemtapText>
            {recommended ? (
              <View className="rounded-full bg-primary px-1.5 py-0.5">
                <VemtapText className="font-sans-semibold text-caption uppercase text-primary-foreground">
                  {recommended}
                </VemtapText>
              </View>
            ) : null}
          </View>
          <VemtapText variant="caption" tone="secondary" className="mt-0.5">
            {description}
          </VemtapText>
        </View>
      </View>
      <Icon name="forward" size={20} color={colors.textTertiary} />
    </Pressable>
  );
}

export function ContactBusinessOptionsSheet({
  visible,
  onClose,
  onOpenChat,
}: ContactBusinessOptionsSheetProps) {
  const openExternal = useCallback((url: string) => {
    Linking.openURL(url).catch(() => undefined);
  }, []);

  return (
    <BottomSheet visible={visible} onClose={onClose} title={copy.title}>
      <ScrollView
        className="max-h-[68vh]"
        contentContainerClassName="gap-2.5 px-4 pb-4"
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-1 flex-row items-start gap-1.5 self-start rounded-full bg-surface-tint-blue px-2 py-0.5">
          <Icon name="help" size={14} color={colors.primary} />
          <VemtapText className="font-sans-semibold text-label-sm uppercase tracking-wider text-primary">
            {copy.contactMerchant}
          </VemtapText>
        </View>
        <VemtapText variant="caption" tone="secondary" className="leading-snug">
          {copy.description}
        </VemtapText>
        <ContactOption
          icon="message"
          title={copy.inAppChat}
          description={copy.chatReplyTime}
          recommended={copy.recommended}
          onPress={onOpenChat}
        />
        <ContactOption
          icon="whatsapp"
          title={copy.whatsapp}
          description={copy.whatsappDescription}
          onPress={() =>
            openExternal(
              'https://wa.me/2348023456789?text=Hello%2C%20I%20claimed%20Lunch%20Combo%20-%2020%25%20Off%20(VT-48291)%20on%20VEMTAP.%20I%20would%20like%20to%20inquire%20about%20redemption.',
            )
          }
        />
        <ContactOption
          icon="phone"
          title={copy.callBusiness}
          description={copy.callDescription}
          onPress={() => openExternal('tel:+2348023456789')}
        />
        <ContactOption
          icon="mail"
          title={copy.sendEmail}
          description={copy.emailDescription}
          onPress={() =>
            openExternal(
              'mailto:reservations@urbangrill.ng?subject=VEMTAP%20Claim%20Voucher%20VT-48291&body=Hi%20Urban%20Grill%20team%2C%0A%0AI%20have%20a%20claim%20voucher%20for%20Lunch%20Combo%20-%2020%25%20Off%20(Code%3A%20VT-48291).%20I%20would%20like%20to%20make%20a%20reservation.',
            )
          }
        />
        <View className="mt-1 flex-row items-start gap-2 rounded-lg border border-border bg-surface-container-low p-3">
          <Icon name="shield" size={18} color={colors.textSecondary} />
          <VemtapText
            variant="caption"
            tone="secondary"
            className="min-w-0 flex-1 leading-snug"
          >
            {copy.externalNotice}
          </VemtapText>
        </View>
        <View className="mt-1 flex-row items-start gap-2 rounded-lg bg-surface-tint-blue p-3">
          <Icon name="schedule" size={18} color={colors.badgeDiscountText} />
          <View className="min-w-0 flex-1">
            <View className="flex-row flex-wrap items-baseline gap-1">
              <VemtapText
                variant="labelMd"
                className="font-sans-semibold text-badge-discount-text"
              >
                {copy.openNow}
              </VemtapText>
              <VemtapText variant="labelMd" className="text-text">
                {copy.closesAt}
              </VemtapText>
            </View>
            <VemtapText variant="caption" tone="secondary" className="mt-0.5">
              {copy.mentionCode}
            </VemtapText>
          </View>
        </View>
        <Button
          label={copy.close}
          variant="secondary"
          className="mt-1 bg-surface-container-highest"
          labelClassName="text-text"
          onPress={onClose}
        />
      </ScrollView>
    </BottomSheet>
  );
}

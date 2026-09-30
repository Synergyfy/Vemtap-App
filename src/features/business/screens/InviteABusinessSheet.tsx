import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { BottomSheet } from '@components/shared/BottomSheet';
import { BusinessIconWell } from '@features/business/components/BusinessOpsPrimitives';
import {
  inviteMerchantStats,
  inviteMessage,
  networkGrowth,
} from '@features/business/data/businessNetworkData';

cssInterop(ScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});

const copy = strings.inviteABusiness;

export interface InviteABusinessSheetProps {
  visible: boolean;
  onClose: () => void;
  onCopyMessage?: () => void;
  onCopyLink?: () => void;
  onShareDevice?: () => void;
  onShareChannel?: (channelId: string) => void;
}

/**
 * Invite-a-business sheet. Uses the shared `BottomSheet` shell (delayed scrim
 * fade, upward sheet animation, Android-back dismissal) rather than a bare
 * `Modal`, so it matches every other sheet in the app.
 */
export function InviteABusinessSheet({
  visible,
  onClose,
  onCopyMessage,
  onCopyLink,
  onShareDevice,
  onShareChannel,
}: InviteABusinessSheetProps) {
  return (
    <BottomSheet visible={visible} onClose={onClose} title={copy.title}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="gap-3.5 pb-3"
      >
        <View className="flex-row items-center gap-2.5">
          <View className="h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-tint">
            <VemtapText
              variant="labelSm"
              className="font-sans-bold text-primary"
              numberOfLines={1}
            >
              V
            </VemtapText>
          </View>
          <View className="min-w-0 flex-1">
            <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
              {copy.statsTitle}
            </VemtapText>
            <VemtapText
              variant="labelMd"
              className="min-w-0 font-sans-semibold"
              numberOfLines={1}
            >
              {strings.myBusinessNetwork.hubLabel}
            </VemtapText>
          </View>
        </View>

        <View className="flex-row flex-wrap gap-2">
          {inviteMerchantStats.map(stat => (
            <View
              key={stat.id}
              className="min-w-[30%] flex-1 gap-0.5 rounded-field bg-surface-subtle p-2.5"
            >
              <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
                {stat.label}
              </VemtapText>
              <VemtapText
                variant="labelMd"
                className="font-sans-semibold"
                numberOfLines={1}
              >
                {stat.value}
              </VemtapText>
            </View>
          ))}
        </View>

        <VemtapText
          variant="bodyMd"
          tone="secondary"
          className="leading-relaxed"
          numberOfLines={3}
        >
          {copy.body}
        </VemtapText>

        <View className="gap-1.5">
          <View className="flex-row items-center justify-between gap-2">
            <VemtapText
              variant="labelMd"
              className="font-sans-semibold"
              numberOfLines={2}
            >
              {copy.messagePreviewTitle}
            </VemtapText>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={copy.copyMessageCta}
              onPress={onCopyMessage}
              className="min-h-9 shrink-0 flex-row items-center gap-1 rounded-full bg-surface-container px-3 active:scale-95"
            >
              <Icon name="copy" size={14} color={colors.text} />
              <VemtapText
                variant="labelSm"
                className="font-sans-semibold"
                numberOfLines={1}
              >
                {copy.copyMessageCta}
              </VemtapText>
            </Pressable>
          </View>
          <View className="rounded-field bg-surface-subtle p-3">
            <VemtapText
              variant="caption"
              tone="secondary"
              className="leading-relaxed"
              numberOfLines={6}
            >
              {inviteMessage}
            </VemtapText>
          </View>
        </View>

        <View className="flex-row items-center justify-between gap-2 rounded-field bg-surface p-3">
          <View className="min-w-0 flex-1 flex-row items-center gap-2">
            <Icon name="link" size={17} color={colors.primary} />
            <View className="min-w-0 flex-1">
              <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
                {copy.linkLabel}
              </VemtapText>
              <VemtapText
                variant="labelMd"
                className="font-sans-semibold"
                numberOfLines={1}
              >
                {networkGrowth.referralLink}
              </VemtapText>
            </View>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.copyLinkCta}
            onPress={onCopyLink}
            className="h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-container-high active:scale-95"
          >
            <Icon name="copy" size={17} color={colors.text} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.shareDeviceCta}
            onPress={onShareDevice}
            className="h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary active:scale-95"
          >
            <Icon name="share" size={17} color={colors.surface} />
          </Pressable>
        </View>

        <View className="gap-1.5">
          <VemtapText variant="labelMd" className="font-sans-semibold" numberOfLines={1}>
            {copy.channelsTitle}
          </VemtapText>
          <View className="flex-row flex-wrap gap-2">
            {copy.channels.map(channel => (
              <Pressable
                key={channel.id}
                accessibilityRole="link"
                accessibilityLabel={channel.label}
                onPress={() => onShareChannel?.(channel.id)}
                className="min-h-11 min-w-[45%] flex-1 flex-row items-center gap-2 rounded-field bg-surface px-3 active:scale-95"
              >
                <BusinessIconWell icon={channel.icon} tone="brand" size="sm" />
                <VemtapText
                  variant="labelSm"
                  className="min-w-0 flex-1 font-sans-semibold"
                  numberOfLines={1}
                >
                  {channel.label}
                </VemtapText>
                <View className="shrink-0">
                  <Icon name="forward" size={15} color={colors.textTertiary} />
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        <View className="flex-row items-start gap-2 rounded-field bg-surface-subtle p-3">
          <Icon name="verifiedUser" size={15} color={colors.textTertiary} />
          <VemtapText
            variant="micro"
            tone="tertiary"
            className="min-w-0 flex-1"
            numberOfLines={4}
          >
            {copy.verificationNote}
          </VemtapText>
        </View>
      </ScrollView>
    </BottomSheet>
  );
}

import React, { useState } from 'react';
import { Clipboard, Image, Pressable, Share, StyleSheet, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { BottomSheet } from '@components/shared/BottomSheet';
import { Icon, type IconName } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';
import { strings } from '@constants/strings';
import type { DealGridItem } from '@features/deals/data/dealsFeed';

cssInterop(View, { className: 'style' });
cssInterop(Pressable, { className: 'style' });

export interface DealShareSheetProps {
  visible: boolean;
  onClose: () => void;
  deal: DealGridItem;
  shareUrl: string;
}

type Channel = {
  label: string;
  icon: IconName;
  color: string;
  background: string;
};

const channels: Channel[] = [
  {
    label: strings.deals.whatsapp,
    icon: 'whatsapp',
    color: '#25D366',
    background: 'rgba(37, 211, 102, 0.15)',
  },
  {
    label: strings.deals.messages,
    icon: 'message',
    color: colors.primary,
    background: colors.primaryFixed,
  },
  {
    label: strings.deals.instagram,
    icon: 'instagram',
    color: '#E1306C',
    background: 'rgba(225, 48, 108, 0.15)',
  },
  {
    label: strings.deals.x,
    icon: 'x',
    color: colors.inverseSurface,
    background: 'rgba(41, 48, 64, 0.10)',
  },
  {
    label: strings.deals.more,
    icon: 'more',
    color: colors.textSecondary,
    background: colors.surfaceContainerHigh,
  },
];

const friends = [
  { name: 'Amara O.', initials: 'AO', background: colors.primaryFixed },
  { name: 'Samuel A.', initials: 'SA', background: colors.secondaryFixed },
  { name: 'Tunde B.', initials: 'TB', background: colors.surfaceContainer },
  { name: 'Kemi D.', initials: 'KD', background: colors.tertiaryFixed },
];

export function DealShareSheet({
  visible,
  onClose,
  deal,
  shareUrl,
}: DealShareSheetProps) {
  const [copied, setCopied] = useState(false);
  const [sentFriend, setSentFriend] = useState<string | null>(null);

  const copyLink = () => {
    Clipboard.setString(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const share = async () => {
    await Share.share({
      title: `${deal.title} at ${deal.merchant}`,
      message: `Claim this deal on VEMTAP: ${shareUrl}`,
      url: shareUrl,
    });
  };

  const sendToFriend = (name: string) => {
    setSentFriend(name);
    setTimeout(() => setSentFriend(null), 2500);
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={strings.deals.shareTitle}
      titleVariant="headingMd"
    >
      <View style={styles.content}>
        <View style={styles.dealCard}>
          <Image source={deal.image} style={styles.thumbnail} resizeMode="cover" />
          <View style={styles.dealCopy}>
            <VemtapText
              variant="labelMd"
              className="font-sans-semibold text-text"
              numberOfLines={1}
            >
              {deal.title}
            </VemtapText>
            <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
              {deal.merchant} • Apo, Abuja
            </VemtapText>
            <View style={styles.savingBadge}>
              <VemtapText className="font-sans-semibold text-caption text-badge-discount-text">
                {deal.price} ({deal.save})
              </VemtapText>
            </View>
          </View>
        </View>

        <View style={styles.linkRow}>
          <View style={styles.linkCopy}>
            <Icon name="link" size={20} color={colors.textTertiary} />
            <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
              {shareUrl.replace('https://', '')}
            </VemtapText>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copied ? strings.deals.copied : strings.deals.copyLink}
            onPress={copyLink}
            style={[styles.copyButton, copied && styles.copiedButton]}
          >
            <Icon
              name={copied ? 'check' : 'copy'}
              size={16}
              color={copied ? colors.badgeDiscountText : colors.surface}
            />
            <VemtapText
              className={
                copied
                  ? 'font-sans-semibold text-label-sm text-badge-discount-text'
                  : 'font-sans-semibold text-label-sm text-primary-foreground'
              }
            >
              {copied ? strings.deals.copied : strings.deals.copyLink}
            </VemtapText>
          </Pressable>
        </View>

        <View style={styles.section}>
          <VemtapText variant="labelSm" tone="tertiary" className="font-sans-medium">
            {strings.deals.shareVia}
          </VemtapText>
          <View style={styles.channels}>
            {channels.map(channel => (
              <Pressable
                key={channel.label}
                accessibilityRole="button"
                accessibilityLabel={`Share to ${channel.label}`}
                onPress={share}
                style={styles.channel}
              >
                <View
                  style={[styles.channelIcon, { backgroundColor: channel.background }]}
                >
                  <Icon name={channel.icon} size={24} color={channel.color} />
                </View>
                <VemtapText variant="caption" className="text-center text-text">
                  {channel.label}
                </VemtapText>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.friendHeader}>
            <VemtapText variant="labelSm" tone="tertiary" className="font-sans-medium">
              {strings.deals.sendDirectly}
            </VemtapText>
            <VemtapText variant="caption" tone="brand" className="font-sans-medium">
              {strings.deals.hyperlocal}
            </VemtapText>
          </View>
          <View style={styles.friends}>
            {friends.map(friend => (
              <View key={friend.name} style={styles.friend}>
                <View
                  style={[styles.friendAvatar, { backgroundColor: friend.background }]}
                >
                  <VemtapText className="font-sans-semibold text-caption text-text">
                    {friend.initials}
                  </VemtapText>
                </View>
                <VemtapText
                  variant="caption"
                  className="text-center text-text"
                  numberOfLines={1}
                >
                  {friend.name}
                </VemtapText>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${strings.deals.send} ${friend.name}`}
                  onPress={() => sendToFriend(friend.name)}
                  style={[
                    styles.sendButton,
                    sentFriend === friend.name && styles.sentButton,
                  ]}
                >
                  <VemtapText
                    className={
                      sentFriend === friend.name
                        ? 'font-sans-semibold text-caption text-badge-discount-text'
                        : 'font-sans-semibold text-caption text-primary'
                    }
                  >
                    {sentFriend === friend.name ? strings.deals.sent : strings.deals.send}
                  </VemtapText>
                </Pressable>
              </View>
            ))}
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={strings.deals.cancel}
          onPress={onClose}
          style={styles.cancelButton}
        >
          <VemtapText variant="button" className="text-text">
            {strings.deals.cancel}
          </VemtapText>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 24, paddingBottom: 8, gap: 16 },
  dealCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 12,
    backgroundColor: colors.surfaceContainerLow,
    padding: 12,
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.surfaceContainer,
  },
  dealCopy: { flex: 1, minWidth: 0, gap: 2 },
  savingBadge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: colors.badgeDiscountBg,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    backgroundColor: colors.surfaceMuted,
    padding: 10,
  },
  linkCopy: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 8 },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  copiedButton: { backgroundColor: colors.badgeDiscountBg },
  section: { gap: 10 },
  channels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  channel: { width: 58, alignItems: 'center', gap: 6 },
  channelIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  friendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  friends: { flexDirection: 'row', justifyContent: 'space-between' },
  friend: { width: 68, alignItems: 'center', gap: 6 },
  friendAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButton: {
    width: '100%',
    alignItems: 'center',
    borderRadius: 999,
    backgroundColor: colors.surfaceTint,
    paddingVertical: 5,
  },
  sentButton: { backgroundColor: colors.badgeDiscountBg },
  cancelButton: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: colors.surfaceContainerLow,
  },
});

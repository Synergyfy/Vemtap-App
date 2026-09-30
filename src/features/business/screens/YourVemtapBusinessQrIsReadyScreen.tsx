import React, { useEffect, useRef, useState } from 'react';
import { Clipboard, Pressable, StyleSheet, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';
import { strings } from '@constants/strings';
import { cn } from '@utils/cn';
import {
  BusinessProductImage,
  BusinessScreenLayout,
} from '@features/business/components/BusinessPrimitives';
import { BusinessQrGraphic } from '@features/business/components/BusinessProductContent';
import {
  businessMedia,
  businessQrIdentity,
} from '@features/business/data/businessSetupData';

cssInterop(View, { className: 'style' });
cssInterop(LinearGradient, { className: 'style' });

const copy = strings.businessQrReady;

export interface YourVemtapBusinessQrIsReadyScreenProps {
  onBack: () => void;
  onShare?: () => void;
  onSupport?: () => void;
  onOrderKits?: () => void;
  onPresentFullscreen?: () => void;
  onDownloadKit?: () => void;
  onCopyLink?: (link: string) => void;
  onContinue?: () => void;
  /** Business Network hand-off behind the referral perk's "Get Started". */
  onOpenReferrals?: () => void;
}

export function YourVemtapBusinessQrIsReadyScreen({
  onBack,
  onShare,
  onSupport,
  onOrderKits,
  onPresentFullscreen,
  onDownloadKit,
  onCopyLink,
  onContinue,
  onOpenReferrals,
}: YourVemtapBusinessQrIsReadyScreenProps) {
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    },
    [],
  );

  const copyLink = () => {
    Clipboard.setString(businessQrIdentity.fullLink);
    onCopyLink?.(businessQrIdentity.fullLink);
    setCopied(true);
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setCopied(false), 2200);
  };

  return (
    <BusinessScreenLayout
      header={{
        title: copy.headerTitle,
        onBack,
        actions: [
          { label: copy.shareActionLabel, icon: 'share', onPress: onShare },
          { label: copy.supportActionLabel, icon: 'help', onPress: onSupport },
        ],
      }}
      contentContainerClassName="pb-10"
    >
      <View className="items-start">
        <View className="mb-3 flex-row items-center gap-1 rounded-full bg-surface-container-high px-3 py-1 shadow-sm">
          <Icon name="checkCircle" size={16} color={colors.primary} />
          <VemtapText variant="labelSm" className="text-primary">
            {copy.setupBadge}
          </VemtapText>
        </View>
        <VemtapText
          accessibilityRole="header"
          variant="headingMd"
          className="text-heading-md"
        >
          {copy.title}
        </VemtapText>
        <VemtapText tone="secondary" className="mt-1 leading-relaxed">
          {copy.subtitle}
        </VemtapText>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={copy.kitActionLabel}
        className="my-2 flex-row items-center justify-between gap-3 rounded-xl bg-surface-container-low p-3"
        onPress={onOrderKits}
      >
        <View className="min-w-0 flex-1 flex-row items-center gap-2">
          <View className="h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary">
            <Icon name="printer" size={16} color={colors.surface} />
          </View>
          <VemtapText
            variant="caption"
            tone="secondary"
            className="min-w-0 flex-1"
            numberOfLines={1}
          >
            {`${copy.kitLabel} `}
            <VemtapText className="font-sans-semibold text-text">
              {copy.kitValue}
            </VemtapText>
          </VemtapText>
        </View>
        <VemtapText
          variant="labelSm"
          className="shrink-0 font-sans-semibold text-primary"
        >
          {copy.kitCta}
        </VemtapText>
      </Pressable>

      <View className="relative mb-4 mt-3 flex-col items-center overflow-hidden rounded-2xl bg-surface p-6 shadow-xl">
        <View className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-primary/10" />
        <View className="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-surface-tint" />
        <View className="mb-4 w-full flex-row items-center justify-between gap-3 pb-4">
          <View className="min-w-0 shrink flex-row items-center gap-1 rounded-full bg-surface-tint px-2 py-1">
            <View className="h-4 w-4 items-center justify-center rounded-full bg-primary">
              <VemtapText className="font-sans-bold text-micro text-primary-foreground">
                V
              </VemtapText>
            </View>
            <VemtapText
              variant="caption"
              className="min-w-0 shrink font-sans-semibold uppercase tracking-wider text-primary"
            >
              {copy.passBadge}
            </VemtapText>
          </View>
          <View className="shrink-0 flex-row items-center gap-1">
            <View className="shrink-0">
              <Icon name="sensors" size={14} color={colors.textTertiary} />
            </View>
            <VemtapText
              variant="caption"
              className="shrink-0 uppercase tracking-wider text-text-tertiary"
            >
              {copy.passEnabledLabel}
            </VemtapText>
          </View>
        </View>
        <BusinessQrGraphic />
        <View className="mt-4 w-full items-center">
          <VemtapText variant="headingSm" className="font-sans-semibold">
            {businessQrIdentity.businessName}
          </VemtapText>
          <VemtapText variant="caption" tone="secondary" className="mt-1 text-center">
            {businessQrIdentity.descriptor}
          </VemtapText>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.copyLinkActionLabel}
            className="mt-3 flex-row items-center gap-1 rounded-full bg-surface-container-low px-3 py-1.5 active:scale-95"
            onPress={copyLink}
          >
            <Icon name="link" size={15} color={colors.primary} />
            <VemtapText variant="labelSm" className="font-sans-medium">
              {businessQrIdentity.publicLink}
            </VemtapText>
            <Icon
              name={copied ? 'check' : 'copy'}
              size={15}
              color={colors.textTertiary}
            />
          </Pressable>
          <VemtapText
            variant="caption"
            className={cn('mt-1 text-success', !copied && 'opacity-0')}
          >
            {copy.copiedLabel}
          </VemtapText>
        </View>
      </View>

      <View className="mb-6 flex-row gap-3">
        <Button
          label={copy.fullscreenCta}
          labelVariant="labelMd"
          labelNumberOfLines={2}
          variant="secondary"
          className="min-h-12 min-w-0 flex-1 border-0 bg-surface-container-high px-2"
          leftIcon={<Icon name="fullscreen" size={18} color={colors.text} />}
          onPress={onPresentFullscreen}
        />
        <Button
          label={copy.downloadCta}
          labelVariant="labelMd"
          labelNumberOfLines={2}
          variant="secondary"
          className="min-h-12 min-w-0 flex-1 border-0 bg-surface-tint px-2 shadow-sm"
          leftIcon={<Icon name="download" size={18} color={colors.primary} />}
          onPress={onDownloadKit}
        />
      </View>

      <View className="mb-6 mt-2">
        <View className="mb-3 flex-row items-center justify-between gap-3">
          <View className="flex-row items-center gap-1">
            <Icon name="visibility" size={18} color={colors.primary} />
            <VemtapText variant="labelMd" className="font-sans-semibold">
              {copy.previewTitle}
            </VemtapText>
          </View>
          <View className="rounded-full bg-badge-discount-bg px-2 py-0.5">
            <VemtapText variant="caption" className="text-success">
              {copy.previewBadge}
            </VemtapText>
          </View>
        </View>
        <View className="overflow-hidden rounded-2xl bg-surface shadow-md">
          <View className="relative h-28 w-full overflow-hidden">
            <BusinessProductImage
              source={businessMedia.customerPassPreview}
              alt={copy.previewImageAlt}
              className="h-full w-full"
            />
            <LinearGradient
              colors={['transparent', 'rgba(20, 27, 43, 0.8)']}
              locations={[0.45, 1]}
              style={StyleSheet.absoluteFill}
              pointerEvents="none"
            />
            <View className="absolute inset-x-3 bottom-2 flex-row items-end justify-between gap-3">
              <View className="min-w-0 flex-1">
                <VemtapText variant="labelSm" className="text-inverse font-sans-semibold">
                  {businessQrIdentity.businessName}
                </VemtapText>
                <VemtapText variant="caption" className="text-inverse">
                  {copy.previewStatus}
                </VemtapText>
              </View>
              <View className="shrink-0 flex-row items-center gap-1 rounded bg-surface/20 px-2 py-0.5">
                <Icon name="bolt" size={12} color={colors.surface} />
                <VemtapText variant="caption" className="text-inverse font-sans-semibold">
                  {copy.previewPass}
                </VemtapText>
              </View>
            </View>
          </View>
          <View className="gap-2 p-4">
            <View className="flex-row items-center justify-between gap-3 rounded-xl bg-badge-discount-bg p-3">
              <View className="min-w-0 flex-1 flex-row items-center gap-2">
                <View className="h-8 w-8 shrink-0 items-center justify-center rounded-full bg-success/10">
                  <Icon name="fire" size={18} color={colors.badgeDiscountText} />
                </View>
                <View className="min-w-0 flex-1">
                  <VemtapText
                    variant="labelSm"
                    className="font-sans-semibold text-success"
                  >
                    {copy.previewDeal}
                  </VemtapText>
                  <VemtapText variant="caption" tone="secondary">
                    {copy.previewDealBody}
                  </VemtapText>
                </View>
              </View>
              <Icon name="arrowForward" size={18} color={colors.badgeDiscountText} />
            </View>
            <View className="flex-row items-center justify-between gap-2 px-1 py-1">
              <View className="min-w-0 flex-row items-center gap-1">
                <Icon name="star" size={16} color={colors.primary} />
                <VemtapText variant="caption" tone="secondary" className="min-w-0">
                  {copy.previewPoints}
                </VemtapText>
              </View>
              <View className="min-w-0 flex-row items-center gap-1">
                <Icon name="restaurant" size={16} color={colors.primary} />
                <VemtapText
                  variant="caption"
                  tone="secondary"
                  className="min-w-0 text-right"
                >
                  {copy.previewMenu}
                </VemtapText>
              </View>
            </View>
            <View className="flex-row items-center justify-center gap-1 pt-1">
              <Icon name="bolt" size={14} color={colors.textTertiary} />
              <VemtapText variant="caption" tone="tertiary" className="text-center">
                {copy.previewReassurance}
              </VemtapText>
            </View>
          </View>
        </View>
      </View>

      <View className="mb-10 flex-row items-start gap-3 rounded-2xl bg-surface-container-high p-4">
        <View className="h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface shadow-sm">
          <Icon name="lightbulb" size={18} color={colors.primary} />
        </View>
        <View className="min-w-0 flex-1">
          <VemtapText variant="labelSm" className="font-sans-semibold">
            {copy.accessTitle}
          </VemtapText>
          <VemtapText variant="caption" tone="secondary" className="mt-0.5">
            {`Find or customize desk-specific codes under `}
            <VemtapText className="font-sans-medium text-text">
              {copy.accessPath}
            </VemtapText>
            {`. ${copy.accessBodySuffix}`}
          </VemtapText>
        </View>
      </View>

      {/* New in the revised design: the referral perk sits above the bottom
          progression block, at the same type scale as the rest of the screen
          (micro eyebrow, labelMd title, caption body, labelSm action). */}
      <View className="border-border-subtle mb-4 flex-row items-start gap-3 overflow-hidden rounded-2xl border bg-surface p-4 shadow-sm">
        <View className="h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-tint">
          <Icon name="groupAdd" size={22} color={colors.primary} />
        </View>
        <View className="min-w-0 flex-1">
          <View className="mb-0.5 flex-row items-center gap-1">
            <View className="rounded bg-primary/10 px-1.5 py-0.5">
              <VemtapText
                variant="micro"
                className="font-sans-semibold uppercase tracking-wider text-primary"
                numberOfLines={1}
              >
                {copy.referralBadge}
              </VemtapText>
            </View>
          </View>
          <VemtapText variant="labelMd" className="font-sans-semibold" numberOfLines={2}>
            {copy.referralTitle}
          </VemtapText>
          <VemtapText tone="secondary" className="mt-1 leading-relaxed" numberOfLines={4}>
            {copy.referralBody}
          </VemtapText>
        </View>
      </View>
      <View className="mb-4">
        <Button
          label={copy.referralCta}
          accessibilityLabel={copy.referralCta}
          labelVariant="labelSm"
          variant="secondary"
          className="min-h-8 self-start rounded-lg px-3"
          onPress={onOpenReferrals}
        />
      </View>

      <View className="flex-col items-center gap-3">
        <Button
          label={copy.continueCta}
          labelVariant="labelMd"
          labelNumberOfLines={2}
          className="min-h-[54px] rounded-2xl shadow-lg"
          rightIcon={<Icon name="arrowForward" size={20} color={colors.surface} />}
          onPress={onContinue}
        />
        <Button
          label={copy.shareLinkCta}
          labelVariant="labelMd"
          labelNumberOfLines={2}
          variant="ghost"
          className="min-h-11 rounded-full px-4"
          leftIcon={<Icon name="share" size={18} color={colors.primary} />}
          onPress={onShare}
        />
      </View>
    </BusinessScreenLayout>
  );
}

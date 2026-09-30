import React from 'react';
import { Pressable, View } from 'react-native';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import {
  BusinessActionDock,
  BusinessInlineAction,
  BusinessScreenLayout,
  BusinessStatusPill,
} from '@features/business/components/BusinessPrimitives';
import {
  BusinessIconWell,
  BusinessPanel,
  BusinessSearchTrigger,
} from '@features/business/components/BusinessOpsPrimitives';
import { BusinessInitialsAvatar } from '@features/business/components/BusinessPosPrimitives';
import { cartCustomer } from '@features/business/data/businessPosFlowData';

const copy = strings.posCustomerLookupActive;

const perks = [
  {
    id: 'weekend-prime',
    icon: 'localOffer' as const,
    title: copy.perk1Title,
    body: copy.perk1Body,
    badge: copy.perk1Badge,
    cta: copy.perk1Cta,
    tone: 'bg-success-container' as const,
  },
  {
    id: 'loyalty-cashback',
    icon: 'wallet' as const,
    title: copy.perk2Title,
    body: copy.perk2Body,
    badge: null,
    cta: copy.perk2Cta,
    tone: 'bg-surface-tint' as const,
  },
  {
    id: 'birthday-dessert',
    icon: 'cake' as const,
    title: copy.perk3Title,
    body: copy.perk3Body,
    badge: copy.perk3Badge,
    cta: copy.perk3Cta,
    tone: 'bg-warning-container' as const,
  },
];

export interface PosCustomerLookupActiveScreenProps {
  onBack?: () => void;
  onOpenProfile?: () => void;
  onSearch?: () => void;
  onClearSearch?: () => void;
  onScan?: () => void;
  onLiveScan?: () => void;
  onNewWalkInProfile?: () => void;
  onApplyPerk?: (perkId: string) => void;
  onAttach?: () => void;
  onViewReceipts?: () => void;
  onSendWhatsApp?: () => void;
}

/**
 * `pos_customer_lookup_1` - the matched-customer attach surface for the active
 * checkout: NFC/QR capture, the patron's standing data, redeemable perks and
 * the server's dietary note.
 */
export function PosCustomerLookupActiveScreen({
  onBack,
  onOpenProfile,
  onSearch,
  onClearSearch,
  onScan,
  onLiveScan,
  onNewWalkInProfile,
  onApplyPerk,
  onAttach,
  onViewReceipts,
  onSendWhatsApp,
}: PosCustomerLookupActiveScreenProps) {
  return (
    <BusinessScreenLayout
      header={{
        title: copy.headerTitle,
        subtitle: copy.headerSubtitle,
        onBack,
        titleAccessory: (
          <View className="mt-1 flex-row justify-center">
            <BusinessStatusPill label={copy.syncedBadge} tone="success" />
          </View>
        ),
        actions: [
          {
            icon: 'accountCircle',
            label: copy.profileActionLabel,
            onPress: onOpenProfile,
          },
        ],
      }}
      contentContainerClassName="pb-8"
      footer={
        <BusinessActionDock>
          <Button
            label={copy.attachCta}
            labelVariant="labelMd"
            onPress={onAttach}
            rightIcon={<Icon name="arrowForward" size={17} color={colors.surface} />}
          />
          <View className="mt-2 flex-row items-center justify-center gap-1.5">
            <Icon name="clockLock" size={13} color={colors.textTertiary} />
            <VemtapText
              variant="micro"
              tone="tertiary"
              className="text-center"
              numberOfLines={2}
            >
              {copy.attachHint}
            </VemtapText>
          </View>
        </BusinessActionDock>
      }
    >
      <View className="flex-row items-center gap-2">
        <View className="min-w-0 flex-1">
          <BusinessSearchTrigger
            placeholder={copy.searchPlaceholder}
            onPress={onSearch}
            onFilterPress={onClearSearch}
            filterLabel={copy.searchPlaceholder}
          />
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.scanCta}
          onPress={onScan}
          className="h-11 w-11 shrink-0 items-center justify-center rounded-field bg-surface-tint active:scale-95"
        >
          <Icon name="barcodeScan" size={20} color={colors.primary} />
        </Pressable>
      </View>

      <View className="mt-3 flex-row items-center gap-3 rounded-card bg-primary p-4">
        <View className="h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface/20">
          <Icon name="contactless" size={24} color={colors.surface} />
        </View>
        <View className="min-w-0 flex-1">
          <VemtapText
            variant="labelMd"
            className="font-sans-semibold text-surface"
            numberOfLines={2}
          >
            {copy.nfcTitle}
          </VemtapText>
          <VemtapText variant="caption" className="text-surface" numberOfLines={2}>
            {copy.nfcBody}
          </VemtapText>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.nfcCta}
          onPress={onLiveScan}
          className="shrink-0 flex-row items-center gap-1.5 rounded-full bg-surface px-3 py-2 active:scale-95"
        >
          <Icon name="sensors" size={15} color={colors.primary} />
          <VemtapText
            variant="labelSm"
            className="font-sans-semibold text-primary"
            numberOfLines={1}
          >
            {copy.nfcCta}
          </VemtapText>
        </Pressable>
      </View>

      <View className="mt-4 flex-row items-center justify-between gap-2">
        <View className="min-w-0 flex-1 flex-row items-center gap-1.5">
          <View className="h-2 w-2 shrink-0 rounded-full bg-success" />
          <VemtapText
            variant="labelSm"
            className="font-sans-semibold uppercase tracking-wider"
            numberOfLines={1}
          >
            {copy.matchedLabel}
          </VemtapText>
        </View>
        <BusinessInlineAction
          label={copy.walkInCta}
          icon="personAdd"
          onPress={onNewWalkInProfile}
        />
      </View>

      <BusinessPanel className="mt-2" tone="canvas">
        <View className="flex-row items-start gap-3">
          <BusinessInitialsAvatar initials="MJ" size="lg" badgeIcon="star" />
          <View className="min-w-0 flex-1">
            <VemtapText
              variant="headingSm"
              className="font-sans-semibold"
              numberOfLines={1}
            >
              {cartCustomer.name}
            </VemtapText>
            <View className="mt-1 flex-row flex-wrap items-center gap-1.5">
              <BusinessStatusPill label={copy.tierBadge} tone="brand" icon="verified" />
              <BusinessStatusPill label={copy.goldTier} tone="brand" />
              <VemtapText
                variant="caption"
                className="font-sans-semibold"
                numberOfLines={1}
              >
                {copy.pointsLabel}
              </VemtapText>
            </View>
            <VemtapText
              variant="bodyMd"
              tone="secondary"
              className="mt-1"
              numberOfLines={1}
            >
              {cartCustomer.phone}
            </VemtapText>
          </View>
          <View className="shrink-0 items-end">
            <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
              {copy.memberIdLabel}
            </VemtapText>
            <VemtapText
              variant="labelSm"
              className="font-sans-semibold"
              numberOfLines={1}
            >
              {copy.memberIdValue}
            </VemtapText>
          </View>
        </View>

        <View className="mt-3 flex-row gap-2">
          {[
            { label: copy.visitsLabel, value: '14', note: copy.visitsNote },
            { label: copy.spendLabel, value: '\u20a6184.2k', note: copy.spendNote },
            { label: copy.avgLabel, value: '\u20a613,150', note: copy.avgNote },
          ].map(stat => (
            <View
              key={stat.label}
              className="min-w-0 flex-1 rounded-field bg-surface-container-low p-2.5"
            >
              <VemtapText
                variant="micro"
                tone="tertiary"
                className="truncate"
                numberOfLines={1}
              >
                {stat.label}
              </VemtapText>
              <VemtapText
                variant="labelMd"
                className="font-sans-semibold"
                numberOfLines={1}
              >
                {stat.value}
              </VemtapText>
              <VemtapText
                variant="micro"
                tone={stat.label === copy.visitsLabel ? 'success' : 'secondary'}
                numberOfLines={1}
              >
                {stat.note}
              </VemtapText>
            </View>
          ))}
        </View>
      </BusinessPanel>

      <View className="mt-4 flex-row items-center justify-between gap-2">
        <View className="min-w-0 flex-1 flex-row items-center gap-1.5">
          <Icon name="redeem" size={17} color={colors.primary} />
          <VemtapText variant="labelMd" className="font-sans-semibold" numberOfLines={1}>
            {copy.perksTitle}
          </VemtapText>
        </View>
        <VemtapText variant="caption" tone="success" numberOfLines={1}>
          {copy.perksBadge}
        </VemtapText>
      </View>

      <View className="mt-2 gap-2">
        {perks.map(perk => (
          <View
            key={perk.id}
            className={`flex-row items-center gap-2.5 rounded-card p-2.5 ${perk.tone}`}
          >
            <BusinessIconWell icon={perk.icon} tone="brand" size="sm" />
            <View className="min-w-0 flex-1">
              <View className="flex-row flex-wrap items-center gap-1.5">
                <VemtapText
                  variant="labelSm"
                  className="font-sans-semibold"
                  numberOfLines={1}
                >
                  {perk.title}
                </VemtapText>
                {perk.badge ? (
                  <BusinessStatusPill label={perk.badge} tone="brand" />
                ) : null}
              </View>
              <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                {perk.body}
              </VemtapText>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${perk.cta} ${perk.title}`}
              onPress={() => onApplyPerk?.(perk.id)}
              className="shrink-0 flex-row items-center gap-1 rounded-full bg-primary px-3 py-2 active:scale-95"
            >
              <Icon
                name={perk.id === 'loyalty-cashback' ? 'plus' : 'checkCircle'}
                size={15}
                color={colors.surface}
              />
              <VemtapText
                variant="labelSm"
                className="font-sans-semibold text-surface"
                numberOfLines={1}
              >
                {perk.cta}
              </VemtapText>
            </Pressable>
          </View>
        ))}
      </View>

      <View className="mt-3 rounded-card bg-surface-tint p-3">
        <View className="flex-row items-start justify-between gap-2">
          <View className="min-w-0 flex-1 flex-row items-center gap-1.5">
            <Icon name="alert" size={16} color={colors.error} />
            <VemtapText
              variant="labelSm"
              className="font-sans-semibold uppercase"
              numberOfLines={1}
            >
              {copy.notesTitle}
            </VemtapText>
          </View>
          <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
            {copy.notesBadge}
          </VemtapText>
        </View>
        <VemtapText variant="bodyMd" className="mt-1.5 leading-relaxed">
          {copy.notesBody}
        </VemtapText>
      </View>

      <View className="mt-3 flex-row items-center justify-between gap-2">
        <View className="min-w-0 flex-1 flex-row items-center gap-1.5">
          <Icon name="creditCard" size={16} color={colors.textSecondary} />
          <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
            {copy.preferredLabel}
          </VemtapText>
        </View>
        <View className="shrink-0 flex-row items-center gap-1.5">
          <Icon name="schedule" size={15} color={colors.primary} />
          <VemtapText
            variant="caption"
            className="font-sans-semibold text-primary"
            numberOfLines={1}
          >
            {copy.lastVisitLabel}
          </VemtapText>
        </View>
      </View>

      <View className="mt-3 flex-row gap-2">
        <View className="min-w-0 flex-1">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.receiptsCta}
            onPress={onViewReceipts}
            className="min-h-11 flex-row items-center justify-center gap-1.5 rounded-card bg-surface shadow-sm active:scale-[0.98]"
          >
            <Icon name="receiptLong" size={17} color={colors.text} />
            <VemtapText
              variant="labelSm"
              className="font-sans-semibold"
              numberOfLines={1}
            >
              {copy.receiptsCta}
            </VemtapText>
          </Pressable>
        </View>
        <View className="min-w-0 flex-1">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.whatsappCta}
            onPress={onSendWhatsApp}
            className="min-h-11 flex-row items-center justify-center gap-1.5 rounded-card bg-surface shadow-sm active:scale-[0.98]"
          >
            <Icon name="message" size={17} color={colors.text} />
            <VemtapText
              variant="labelSm"
              className="font-sans-semibold"
              numberOfLines={1}
            >
              {copy.whatsappCta}
            </VemtapText>
          </Pressable>
        </View>
      </View>
    </BusinessScreenLayout>
  );
}

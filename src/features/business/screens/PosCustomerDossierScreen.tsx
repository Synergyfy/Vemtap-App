import React from 'react';
import { Pressable, View } from 'react-native';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import type { IconName } from '@components/ui/Icon';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import {
  BusinessIconWell,
  BusinessLinkRow,
  BusinessPanel,
} from '@features/business/components/BusinessOpsPrimitives';
import { BusinessInitialsAvatar } from '@features/business/components/BusinessPosPrimitives';
import {
  BusinessActionDock,
  BusinessScreenLayout,
  BusinessStatusPill,
} from '@features/business/components/BusinessPrimitives';
import { cartCustomer } from '@features/business/data/businessPosFlowData';
import {
  posDossierPerks,
  posDossierVisits,
} from '@features/business/data/businessPosCustomerData';

const copy = strings.posCustomerDossier;

export interface PosCustomerDossierScreenProps {
  onBack?: () => void;
  onOpenProfile?: () => void;
  onAttachToSale?: () => void;
  onApplyPerk?: (perkId: string) => void;
  onOpenNotes?: () => void;
  onOpenVisit?: (visitId: string) => void;
  onOpenCrm?: () => void;
}

/**
 * `pos_customer_dossier` - the register quick dossier: identity, the three
 * standing figures, redeemable perks, the kitchen note, recent Wuse tickets and
 * the hand-off to full CRM analytics.
 */
export function PosCustomerDossierScreen({
  onBack,
  onOpenProfile,
  onAttachToSale,
  onApplyPerk,
  onOpenNotes,
  onOpenVisit,
  onOpenCrm,
}: PosCustomerDossierScreenProps) {
  const statTiles: { label: string; caption: string; note: string; icon: IconName }[] = [
    {
      label: copy.pointsValue,
      caption: copy.pointsLabel,
      note: copy.pointsNote,
      icon: 'star',
    },
    {
      label: copy.spendValue,
      caption: copy.spendLabel,
      note: copy.spendNote,
      icon: 'payments',
    },
    {
      label: copy.avgValue,
      caption: copy.avgLabel,
      note: copy.avgNote,
      icon: 'receiptLong',
    },
  ];

  return (
    <BusinessScreenLayout
      header={{
        title: copy.headerTitle,
        onBack,
        titleVariant: 'labelMd',
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
            onPress={onAttachToSale}
            leftIcon={<Icon name="cartPlus" size={17} color={colors.surface} />}
          />
        </BusinessActionDock>
      }
    >
      <BusinessPanel>
        <View className="flex-row items-start gap-3">
          <BusinessInitialsAvatar
            initials={copy.customerInitials}
            size="lg"
            badgeIcon="verified"
          />
          <View className="min-w-0 flex-1">
            <VemtapText
              variant="headingSm"
              className="font-sans-semibold"
              numberOfLines={1}
            >
              {cartCustomer.name}
            </VemtapText>
            <BusinessStatusPill
              label={copy.memberRef}
              tone="neutral"
              className="mt-1 self-start"
            />
          </View>
        </View>
        <BusinessStatusPill
          label={copy.verifiedLabel}
          tone="success"
          icon="checkCircle"
          className="mt-2 self-start"
        />
        <View className="mt-3 gap-2">
          <View className="flex-row items-center gap-2">
            <Icon name="phone" size={16} color={colors.textSecondary} />
            <VemtapText variant="bodyMd" numberOfLines={1}>
              {cartCustomer.phone}
            </VemtapText>
          </View>
          <View className="flex-row items-center gap-2">
            <Icon name="email" size={16} color={colors.textSecondary} />
            <VemtapText variant="bodyMd" numberOfLines={1}>
              {copy.email}
            </VemtapText>
          </View>
        </View>
      </BusinessPanel>

      <View className="mt-3 flex-row flex-wrap items-center justify-between gap-2">
        <View className="min-w-0 flex-1 flex-row items-center gap-1.5">
          <View className="h-2 w-2 shrink-0 rounded-full bg-success" />
          <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
            {copy.registerLinkLabel}
          </VemtapText>
        </View>
        <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
          {copy.registerLinkMeta}
        </VemtapText>
      </View>

      <View className="mt-2 flex-row gap-2">
        {statTiles.map(stat => (
          <View
            key={stat.caption}
            className="min-w-0 flex-1 gap-1 rounded-card bg-surface p-2.5 shadow-sm"
          >
            <View className="flex-row items-center gap-1.5">
              <Icon name={stat.icon} size={15} color={colors.primary} />
              <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
                {stat.caption}
              </VemtapText>
            </View>
            <VemtapText variant="headingSm" className="font-sans-bold" numberOfLines={1}>
              {stat.label}
            </VemtapText>
            <VemtapText variant="micro" tone="secondary" numberOfLines={2}>
              {stat.note}
            </VemtapText>
          </View>
        ))}
      </View>

      <View className="mt-4 flex-row items-center justify-between gap-2">
        <View className="min-w-0 flex-1 flex-row items-center gap-1.5">
          <Icon name="localOffer" size={17} color={colors.primary} />
          <VemtapText variant="labelMd" className="font-sans-semibold" numberOfLines={1}>
            {copy.perksTitle}
          </VemtapText>
        </View>
        <VemtapText variant="caption" tone="success" numberOfLines={1}>
          {copy.perksBadge}
        </VemtapText>
      </View>

      <View className="mt-2 gap-2">
        {posDossierPerks.map(perk => (
          <View
            key={perk.id}
            className="flex-row items-center gap-3 rounded-card bg-surface p-3 shadow-sm"
          >
            <BusinessIconWell icon={perk.icon} tone={perk.tone} />
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
              <VemtapText
                variant="caption"
                tone="secondary"
                className="mt-0.5"
                numberOfLines={2}
              >
                {perk.body}
              </VemtapText>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${perk.cta} ${perk.title}`}
              onPress={() => onApplyPerk?.(perk.id)}
              className="min-h-9 shrink-0 justify-center rounded-field bg-surface-tint px-3 active:scale-95"
            >
              <VemtapText
                variant="labelSm"
                className="font-sans-semibold text-primary"
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
            <Icon name="notificationsActive" size={17} color={colors.tertiary} />
            <VemtapText
              variant="labelSm"
              className="font-sans-semibold"
              numberOfLines={1}
            >
              {copy.notesTitle}
            </VemtapText>
          </View>
          <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
            {copy.notesBadge}
          </VemtapText>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.notesTitle}
          onPress={onOpenNotes}
          className="mt-2 rounded-field bg-surface p-3 active:scale-[0.99]"
        >
          <VemtapText variant="bodyMd" className="leading-relaxed">
            {copy.notesBody}
          </VemtapText>
        </Pressable>
      </View>

      <View className="mt-4 flex-row items-center justify-between gap-2">
        <View className="min-w-0 flex-1 flex-row items-center gap-1.5">
          <Icon name="history" size={17} color={colors.text} />
          <VemtapText variant="labelMd" className="font-sans-semibold" numberOfLines={1}>
            {copy.visitsTitle}
          </VemtapText>
        </View>
        <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
          {copy.visitsBadge}
        </VemtapText>
      </View>

      <View className="mt-2 overflow-hidden rounded-card bg-surface shadow-sm">
        {posDossierVisits.map((visit, index) => (
          <View key={visit.id}>
            {index > 0 ? <View className="h-px bg-surface-container-low" /> : null}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${visit.reference} ${visit.total}`}
              onPress={() => onOpenVisit?.(visit.id)}
              className="flex-row items-center gap-2 px-3 py-2.5 active:bg-surface-container-low"
            >
              <View className="min-w-0 flex-1">
                <View className="flex-row items-center gap-1.5">
                  <VemtapText
                    variant="labelSm"
                    className="font-sans-semibold"
                    numberOfLines={1}
                  >
                    {visit.when}
                  </VemtapText>
                  <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
                    {visit.reference}
                  </VemtapText>
                </View>
                <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                  {visit.items}
                </VemtapText>
              </View>
              <View className="shrink-0 items-end">
                <VemtapText
                  variant="labelSm"
                  className="font-sans-semibold"
                  numberOfLines={1}
                >
                  {visit.total}
                </VemtapText>
                <View className="mt-0.5 flex-row items-center gap-1">
                  <BusinessStatusPill label={visit.tender} tone="neutral" />
                  <Icon name="checkCircle" size={14} color={colors.success} />
                </View>
              </View>
            </Pressable>
          </View>
        ))}
      </View>

      <View className="bg-neutral-dark mt-3 flex-row items-center gap-3 rounded-card p-3">
        <View className="h-12 w-12 shrink-0 items-center justify-center rounded-field bg-white/10">
          <Icon name="restaurant" size={22} color={colors.surface} />
        </View>
        <View className="min-w-0 flex-1">
          <VemtapText
            variant="labelSm"
            className="font-sans-semibold text-surface"
            numberOfLines={1}
          >
            {copy.storeFooter}
          </VemtapText>
          <VemtapText variant="caption" className="text-surface" numberOfLines={1}>
            {copy.storeMeta}
          </VemtapText>
        </View>
        <BusinessStatusPill label={copy.storeBadge} tone="success" />
      </View>

      <View className="mt-3 rounded-card bg-surface-tint p-3">
        <View className="flex-row items-start gap-2.5">
          <View className="mt-0.5 shrink-0">
            <Icon name="hub" size={19} color={colors.primary} />
          </View>
          <View className="min-w-0 flex-1">
            <VemtapText
              variant="labelSm"
              className="font-sans-semibold"
              numberOfLines={2}
            >
              {copy.crmTitle}
            </VemtapText>
            <VemtapText
              variant="caption"
              tone="secondary"
              className="mt-0.5"
              numberOfLines={3}
            >
              {copy.crmBody}
            </VemtapText>
            <BusinessLinkRow
              label={copy.crmCta}
              onPress={onOpenCrm}
              icon="openInNew"
              className="mt-1"
            />
          </View>
        </View>
      </View>
    </BusinessScreenLayout>
  );
}

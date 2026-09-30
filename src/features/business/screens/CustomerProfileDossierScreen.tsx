import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { Button } from '@components/ui/Button';
import { Icon, type IconName } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { MetaLine } from '@features/business/components/BusinessSetupPrimitives';
import { businessOpsMedia } from '@features/business/data/businessOpsImages';
import {
  BusinessProductImage,
  BusinessScreenLayout,
  BusinessStatusPill,
} from '@features/business/components/BusinessPrimitives';
import {
  BusinessKeyValueRow,
  BusinessLinkRow,
  BusinessMetricTile,
  BusinessPanel,
  BusinessToastPill,
} from '@features/business/components/BusinessOpsPrimitives';

cssInterop(Pressable, { className: 'style' });

const copy = strings.customerDossier;

export interface CustomerProfileDossierScreenProps {
  onBack?: () => void;
  onMoreActions?: () => void;
  onCall?: () => void;
  onCopyEmail?: () => void;
  onSendMessage?: () => void;
  onCustomDeal?: () => void;
  onLogVisit?: () => void;
  onViewOrder?: () => void;
  onViewVoucher?: () => void;
  onAddNote?: () => void;
}

/**
 * Full customer dossier: identity + contact, relationship summary, transaction
 * and loyalty history, and the private staff-note block.
 */
export function CustomerProfileDossierScreen({
  onBack,
  onMoreActions,
  onCall,
  onCopyEmail,
  onSendMessage,
  onCustomDeal,
  onLogVisit,
  onViewOrder,
  onViewVoucher,
  onAddNote,
}: CustomerProfileDossierScreenProps) {
  const [toast, setToast] = useState<string | null>(null);

  const handleCopyEmail = () => {
    setToast(copy.emailCopied);
    onCopyEmail?.();
  };

  return (
    <BusinessScreenLayout
      header={{
        title: copy.headerTitle,
        onBack,
        actions: [{ icon: 'more', label: copy.headerTitle, onPress: onMoreActions }],
      }}
      contentContainerClassName="pb-8"
    >
      <View className="mt-1 gap-3 rounded-card bg-surface p-4 shadow-sm">
        <View className="flex-row items-start gap-4">
          <View className="relative h-16 w-16 shrink-0">
            <BusinessProductImage
              source={businessOpsMedia.customerMichael}
              alt={businessOpsMedia.customerMichael.alt}
              className="h-full w-full rounded-full shadow-sm"
            />
            <View className="absolute -bottom-1 -right-1 h-6 w-6 items-center justify-center rounded-full bg-primary shadow-sm">
              <Icon name="verified" size={14} color={colors.surface} />
            </View>
          </View>
          <View className="min-w-0 flex-1">
            <VemtapText
              variant="headingMd"
              className="font-sans-semibold"
              numberOfLines={1}
            >
              {copy.name}
            </VemtapText>
            <View className="mt-1 flex-row items-center gap-1.5">
              <View className="h-2 w-2 shrink-0 rounded-full bg-badge-discount-text" />
              <VemtapText
                variant="labelSm"
                className="min-w-0 flex-1 font-sans-semibold text-primary"
                numberOfLines={1}
              >
                {copy.tier}
              </VemtapText>
            </View>
            <VemtapText
              variant="caption"
              tone="tertiary"
              className="mt-0.5"
              numberOfLines={1}
            >
              {copy.id}
            </VemtapText>
          </View>
        </View>

        <View className="gap-3 rounded-field bg-surface-subtle p-3">
          <ContactRow
            icon="call"
            value={copy.phone}
            actionLabel={copy.call}
            onAction={onCall}
          />
          <ContactRow
            icon="mail"
            value={copy.email}
            actionLabel={copy.copyEmail}
            onAction={handleCopyEmail}
          />
          <View className="flex-row items-center gap-3">
            <Icon name="storefront" size={17} color={colors.textSecondary} />
            <VemtapText
              variant="caption"
              tone="secondary"
              className="min-w-0 flex-1"
              numberOfLines={1}
            >
              {`${copy.preferredPrefix}${copy.preferred}`}
            </VemtapText>
          </View>
        </View>
      </View>

      <View className="mt-3 gap-2">
        <Button
          label={copy.sendMessage}
          labelVariant="labelMd"
          onPress={onSendMessage}
          leftIcon={<Icon name="message" size={19} color={colors.surface} />}
        />
        <View className="flex-row gap-2">
          <Button
            label={copy.customDeal}
            labelVariant="labelSm"
            variant="secondary"
            className="flex-1"
            onPress={onCustomDeal}
            leftIcon={<Icon name="localOffer" size={17} color={colors.primary} />}
          />
          <Button
            label={copy.logVisit}
            labelVariant="labelSm"
            variant="secondary"
            className="flex-1"
            onPress={onLogVisit}
            leftIcon={<Icon name="addLocation" size={17} color={colors.text} />}
          />
        </View>
      </View>

      <View className="mt-4 flex-row items-center justify-between gap-2">
        <VemtapText variant="labelMd" className="font-sans-semibold">
          {copy.summaryTitle}
        </VemtapText>
        <BusinessStatusPill label={copy.syncedLive} tone="success" />
      </View>
      <View className="mt-2 flex-row flex-wrap gap-2">
        {copy.metrics.map(metric => (
          <BusinessMetricTile
            key={metric.label}
            label={metric.label}
            figure={metric.figure}
            subline={metric.sub}
            icon={metric.icon as IconName}
            className="min-w-[45%]"
          />
        ))}
      </View>

      <BusinessPanel className="mt-4" tone="low">
        <BusinessKeyValueRow
          icon="history"
          label={copy.firstInteraction}
          value={copy.firstInteractionValue}
        />
        <BusinessKeyValueRow
          icon="schedule"
          label={copy.latestInteraction}
          value={copy.latestInteractionValue}
        />
      </BusinessPanel>

      <View className="mt-4 flex-row items-center justify-between gap-2">
        <VemtapText variant="labelMd" className="font-sans-semibold">
          {copy.transactionsTitle}
        </VemtapText>
        <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
          {copy.updated}
        </VemtapText>
      </View>

      <View className="mt-2 gap-3">
        <View className="gap-2 rounded-card bg-surface p-3 shadow-sm">
          <View className="flex-row items-center justify-between gap-2">
            <View className="min-w-0 flex-1 flex-row items-center gap-2">
              <View className="h-2 w-2 shrink-0 rounded-full bg-badge-discount-text" />
              <VemtapText
                variant="labelMd"
                className="min-w-0 flex-1 font-sans-semibold"
                numberOfLines={1}
              >
                {copy.orderTitle}
              </VemtapText>
            </View>
            <BusinessStatusPill label={copy.orderBadge} tone="success" />
          </View>
          <VemtapText variant="bodyMd" tone="secondary" numberOfLines={2}>
            {copy.orderBody}
          </VemtapText>
          <View className="flex-row items-center justify-between gap-2 border-t border-border pt-2">
            <VemtapText variant="labelMd" className="font-sans-bold">
              {copy.orderAmount}
            </VemtapText>
            <VemtapText variant="caption" tone="tertiary" numberOfLines={1}>
              {copy.orderTime}
            </VemtapText>
          </View>
          <BusinessLinkRow label={copy.viewOrder} onPress={onViewOrder} />
        </View>

        <View className="gap-2 rounded-card bg-surface p-3 shadow-sm">
          <View className="flex-row items-center justify-between gap-2">
            <VemtapText
              variant="labelMd"
              className="min-w-0 flex-1 font-sans-semibold"
              numberOfLines={1}
            >
              {copy.voucherTitle}
            </VemtapText>
            <BusinessStatusPill label={copy.voucherBadge} tone="brand" />
          </View>
          <View className="flex-row items-center justify-between gap-2">
            <VemtapText
              variant="caption"
              tone="secondary"
              className="min-w-0 flex-1"
              numberOfLines={1}
            >
              {`${copy.voucherCodePrefix}${copy.voucherCode}`}
            </VemtapText>
            <VemtapText
              variant="labelSm"
              className="shrink-0 font-sans-semibold text-badge-discount-text"
            >
              {copy.voucherSaved}
            </VemtapText>
          </View>
          <VemtapText variant="caption" tone="tertiary" numberOfLines={1}>
            {copy.voucherWhere}
          </VemtapText>
          <BusinessLinkRow label={copy.viewVoucher} onPress={onViewVoucher} />
        </View>

        <View className="gap-2 rounded-card bg-surface p-3 shadow-sm">
          <View className="flex-row items-center justify-between gap-2">
            <VemtapText
              variant="labelMd"
              className="min-w-0 flex-1 font-sans-semibold"
              numberOfLines={1}
            >
              {copy.ledgerTitle}
            </VemtapText>
            <Icon name="trophy" size={17} color={colors.textTertiary} />
          </View>
          {copy.ledger.map(entry => (
            <MetaLine
              key={entry.text}
              icon={entry.icon as IconName}
              value={entry.text}
              trailing={entry.when}
              iconColor={
                entry.positive ? colors.badgeDiscountText : colors.tertiaryContainer
              }
            />
          ))}
        </View>
      </View>

      <BusinessPanel
        className="mt-4"
        title={copy.notesTitle}
        badge={copy.notesPrivate}
        badgeTone="warning"
      >
        <View className="gap-1 rounded-field bg-surface-subtle p-3">
          <VemtapText variant="bodyMd" tone="secondary" className="leading-relaxed">
            {copy.notesBody}
          </VemtapText>
          <VemtapText variant="caption" tone="tertiary">
            {copy.notesAuthor}
          </VemtapText>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.addNote}
          onPress={onAddNote}
          className="min-h-11 flex-row items-center justify-center gap-1.5 rounded-field bg-surface-container active:scale-[0.98]"
        >
          <Icon name="plus" size={17} color={colors.primary} />
          <VemtapText
            variant="labelMd"
            className="font-sans-semibold text-primary"
            numberOfLines={1}
          >
            {copy.addNote}
          </VemtapText>
        </Pressable>
      </BusinessPanel>

      {toast ? <BusinessToastPill message={toast} /> : null}
    </BusinessScreenLayout>
  );
}

function ContactRow({
  icon,
  value,
  actionLabel,
  onAction,
}: {
  icon: IconName;
  value: string;
  actionLabel: string;
  onAction?: () => void;
}) {
  return (
    <View className="flex-row items-center gap-3">
      <Icon name={icon} size={17} color={colors.textSecondary} />
      <VemtapText
        variant="bodyMd"
        className="min-w-0 flex-1 font-sans-medium"
        numberOfLines={1}
      >
        {value}
      </VemtapText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={actionLabel}
        onPress={onAction}
        className="h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-container-high active:scale-95"
      >
        <Icon name={icon === 'call' ? 'send' : 'copy'} size={15} color={colors.primary} />
      </Pressable>
    </View>
  );
}

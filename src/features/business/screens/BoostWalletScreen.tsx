import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { cn } from '@utils/cn';
import { BusinessScreenLayout } from '@features/business/components/BusinessPrimitives';
import {
  SetupCallout,
  SetupSectionCard,
  SetupSectionHeading,
  TextActionButton,
  ToggleRow,
} from '@features/business/components/BusinessSetupPrimitives';
import { BusinessAnalyticsRow } from '@features/business/components/BusinessAnalyticsPrimitives';

cssInterop(Pressable, { className: 'style' });

const copy = strings.boostWizard;
const { wallet } = copy;

export interface BoostWalletScreenProps {
  onBack?: () => void;
  onStatement?: () => void;
  onFilterHistory?: () => void;
  onViewLedger?: () => void;
  onTopUp?: (prepackId: string) => void;
  onCopyAccount?: () => void;
  onTaxInvoices?: (period: string) => void;
}

function PrepackCard({
  badge,
  title,
  bonus,
  tier,
  selected,
  onPress,
}: {
  badge: string;
  title: string;
  bonus: string;
  tier?: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <SetupSectionCard
      tone={selected ? 'container' : 'lowest'}
      className="flex-row items-center gap-3 p-3.5"
    >
      <Pressable
        accessibilityRole="radio"
        accessibilityState={{ selected }}
        accessibilityLabel={title}
        onPress={onPress}
        className="min-w-0 flex-1 flex-row items-center gap-3"
      >
        <View className="min-w-0 flex-1 gap-1">
          <View className="flex-row flex-wrap items-center gap-1.5">
            <View className="rounded-full bg-surface-container px-2 py-0.5">
              <VemtapText variant="micro" className="font-sans-semibold">
                {badge}
              </VemtapText>
            </View>
            {tier ? (
              <View
                className={cn(
                  'rounded-full px-2 py-0.5',
                  tier === 'Growth Tier' ? 'bg-tertiary-fixed' : 'bg-primary',
                )}
              >
                <VemtapText
                  variant="micro"
                  className={cn(
                    'font-sans-semibold',
                    tier === 'Growth Tier'
                      ? 'text-on-tertiary-fixed'
                      : 'text-primary-foreground',
                  )}
                >
                  {tier}
                </VemtapText>
              </View>
            ) : null}
          </View>
          <VemtapText variant="labelMd" className="font-sans-semibold" numberOfLines={1}>
            {title}
          </VemtapText>
          <VemtapText
            variant="caption"
            className="text-badge-discount-text"
            numberOfLines={1}
          >
            {bonus}
          </VemtapText>
        </View>
      </Pressable>
      <Pressable
        accessibilityRole="radio"
        accessibilityState={{ selected }}
        accessibilityLabel={title}
        onPress={onPress}
        className="h-7 w-7 shrink-0 items-center justify-center"
      >
        <Icon
          name={selected ? 'checkCircle' : 'addCircle'}
          size={20}
          color={selected ? colors.primary : colors.textTertiary}
        />
      </Pressable>
    </SetupSectionCard>
  );
}

/**
 * Boost Wallet & Advertising Credits.
 * stitch_vemtap_mobile_app_design/boost_wallet_advertising_credits
 * The source draws its own 4-tab bar, but AGENTS rule 21 gives bottom navigation
 * to the owning shell, so this screen deliberately renders none of its own.
 */
export function BoostWalletScreen({
  onBack,
  onStatement,
  onFilterHistory,
  onViewLedger,
  onTopUp,
  onCopyAccount,
  onTaxInvoices,
}: BoostWalletScreenProps) {
  const [prepack, setPrepack] = useState<string>('25');
  const [autoReload, setAutoReload] = useState(true);
  const [copied, setCopied] = useState(false);

  return (
    <BusinessScreenLayout
      header={{
        title: wallet.headerTitle,
        subtitle: wallet.engine,
        titleVariant: 'headingSm',
        leading: (
          <View className="h-9 w-9 items-center justify-center rounded-full bg-primary">
            <Icon name="rocketLaunch" size={18} color={colors.surface} />
          </View>
        ),
        actions: [
          { label: wallet.notifications, icon: 'bellRing', onPress: onStatement },
        ],
        showAvatar: true,
      }}
      contentContainerClassName="gap-5 pb-8"
    >
      <View className="flex-row items-center gap-2">
        <TextActionButton
          label={wallet.backToHub}
          icon="back"
          tone="brand"
          onPress={onBack}
        />
        <View className="min-w-0 flex-1">
          <TextActionButton
            label={wallet.statement}
            icon="receiptLong"
            tone="brand"
            onPress={onStatement}
          />
        </View>
      </View>
      <View className="flex-row items-center gap-1.5">
        <View className="h-1.5 w-1.5 rounded-full bg-success" />
        <VemtapText variant="caption" tone="secondary">
          {wallet.headerSub}
        </VemtapText>
      </View>

      <View className="overflow-hidden rounded-2xl bg-primary p-5 shadow-xl">
        <View className="flex-row items-center justify-between gap-2">
          <View className="shrink-0 flex-row items-center gap-1 rounded-full bg-surface/20 px-2 py-1">
            <Icon name="shieldLock" size={12} color={colors.surface} />
            <VemtapText
              variant="micro"
              className="font-sans-semibold uppercase tracking-wide text-surface"
              numberOfLines={1}
            >
              {wallet.escrowBadge}
            </VemtapText>
          </View>
          <VemtapText
            variant="caption"
            className="shrink-0 text-surface"
            numberOfLines={1}
          >
            {wallet.walletRef}
          </VemtapText>
        </View>
        <VemtapText
          variant="displayMobile"
          className="mt-2 font-sans-bold text-surface"
          numberOfLines={1}
        >
          {wallet.balance}
        </VemtapText>
        <View className="mt-3 flex-row gap-2 rounded-xl bg-surface/10 p-3">
          <View className="min-w-0 flex-1 gap-0.5">
            <VemtapText variant="micro" className="text-surface" numberOfLines={1}>
              {wallet.reservedLabel}
            </VemtapText>
            <VemtapText
              variant="headingSm"
              className="font-sans-semibold text-surface"
              numberOfLines={1}
            >
              {wallet.reserved}
            </VemtapText>
          </View>
          <View className="min-w-0 flex-1 gap-0.5">
            <VemtapText variant="micro" className="text-surface" numberOfLines={1}>
              {wallet.spendableLabel}
            </VemtapText>
            <VemtapText
              variant="headingSm"
              className="font-sans-semibold text-badge-discount-bg"
              numberOfLines={1}
            >
              {wallet.spendable}
            </VemtapText>
          </View>
        </View>
        <View className="mt-3 flex-row gap-2">
          <Button
            label={wallet.topUpCta}
            labelVariant="button"
            size="sm"
            className="min-h-[50px] flex-1"
            leftIcon={<Icon name="plusCircle" size={18} color={colors.primary} />}
            onPress={() => onTopUp?.(prepack)}
          />
          <Button
            label={wallet.invoiceCta}
            labelVariant="labelMd"
            variant="secondary"
            size="sm"
            className="min-h-[50px] flex-1"
            onPress={() => onTaxInvoices?.(wallet.vatCta)}
          />
        </View>
      </View>

      <View className="gap-3">
        <View className="flex-row items-center justify-between gap-2">
          <View className="min-w-0 flex-1 gap-0.5">
            <SetupSectionHeading title={wallet.prepackTitle} />
            <VemtapText variant="caption" tone="secondary" numberOfLines={2}>
              {wallet.prepackSubtitle}
            </VemtapText>
          </View>
          <View className="shrink-0 rounded-full bg-badge-discount-bg px-2 py-0.5">
            <VemtapText
              variant="caption"
              className="font-sans-semibold text-badge-discount-text"
            >
              {wallet.prepackBadge}
            </VemtapText>
          </View>
        </View>
        <View className="gap-2">
          {wallet.prepacks.map(option => (
            <PrepackCard
              key={option.id}
              badge={option.badge}
              title={option.title}
              bonus={option.bonus}
              tier={'tier' in option ? option.tier : undefined}
              selected={option.id === prepack}
              onPress={() => {
                setPrepack(option.id);
                onTopUp?.(option.id);
              }}
            />
          ))}
        </View>

        <SetupSectionCard tone="low" className="gap-2.5 p-4">
          <View className="flex-row items-center justify-between gap-2">
            <VemtapText
              variant="labelSm"
              className="min-w-0 flex-1 font-sans-semibold uppercase tracking-wider text-text-secondary"
              numberOfLines={2}
            >
              {wallet.accountTitle}
            </VemtapText>
            <View className="shrink-0 flex-row items-center gap-1 rounded-full bg-badge-discount-bg px-2 py-0.5">
              <Icon name="offlineBolt" size={11} color={colors.badgeDiscountText} />
              <VemtapText
                variant="micro"
                className="font-sans-semibold text-badge-discount-text"
              >
                {wallet.accountStatus}
              </VemtapText>
            </View>
          </View>
          <View className="flex-row items-center gap-3 rounded-lg bg-surface p-3">
            <View className="h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary">
              <VemtapText
                variant="micro"
                className="font-sans-bold text-primary-foreground"
              >
                WEMA
              </VemtapText>
            </View>
            <View className="min-w-0 flex-1 gap-0.5">
              <VemtapText variant="caption" tone="tertiary" numberOfLines={1}>
                {wallet.accountBank}
              </VemtapText>
              <VemtapText
                variant="headingSm"
                className="font-sans-semibold tracking-wider"
                numberOfLines={1}
              >
                {wallet.accountNumber}
              </VemtapText>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={wallet.copyAccount}
              onPress={() => {
                setCopied(true);
                onCopyAccount?.();
              }}
              className="h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-subtle"
            >
              <Icon
                name={copied ? 'checkCircle' : 'copy'}
                size={18}
                color={copied ? colors.badgeDiscountText : colors.textSecondary}
              />
            </Pressable>
          </View>
          {copied ? (
            <VemtapText variant="micro" className="text-success">
              {wallet.copied}
            </VemtapText>
          ) : null}
          <View className="gap-1.5">
            {wallet.channels.map(channel => (
              <View key={channel} className="flex-row items-center gap-1.5">
                <Icon name="check" size={13} color={colors.textSecondary} />
                <VemtapText variant="caption" tone="secondary" className="min-w-0 flex-1">
                  {channel}
                </VemtapText>
              </View>
            ))}
          </View>
        </SetupSectionCard>
      </View>

      <SetupSectionCard tone="lowest" className="gap-3 p-4">
        <View className="flex-row items-center justify-between gap-2">
          <SetupSectionHeading
            title={wallet.guardTitle}
            badge={wallet.guardBadge}
            className="min-w-0 flex-1"
          />
        </View>
        <ToggleRow
          title={wallet.guardBody}
          value={autoReload}
          onValueChange={setAutoReload}
        />
        <SetupCallout
          icon="verifiedUser"
          body={wallet.guardNote}
          tone="tint"
          bodyVariant="caption"
        />
      </SetupSectionCard>

      <View className="gap-3">
        <View className="flex-row items-center justify-between gap-2">
          <View className="min-w-0 flex-1 gap-0.5">
            <SetupSectionHeading title={wallet.historyTitle} />
            <VemtapText variant="caption" tone="secondary" numberOfLines={2}>
              {wallet.historySubtitle}
            </VemtapText>
          </View>
          <TextActionButton
            label={wallet.historyFilter}
            icon="tune"
            tone="brand"
            onPress={onFilterHistory}
          />
        </View>
        <View className="gap-2">
          {wallet.transactions.map(entry => (
            <BusinessAnalyticsRow
              key={entry.id}
              title={entry.title}
              subtitle={entry.meta}
              icon={entry.icon}
              trailing={entry.amount}
              trailingTone={'credit' in entry && entry.credit ? 'success' : 'brand'}
              badge={entry.status}
            />
          ))}
        </View>
        <Button
          label={wallet.ledgerCta}
          labelVariant="labelMd"
          variant="secondary"
          size="md"
          onPress={onViewLedger}
        />
      </View>

      <SetupSectionCard tone="lowest" className="gap-3 p-4">
        <View className="flex-row items-center justify-between gap-2">
          <View className="min-w-0 flex-1 flex-row items-center gap-2">
            <Icon name="policy" size={18} color={colors.primary} />
            <VemtapText
              variant="labelMd"
              className="min-w-0 flex-1 font-sans-semibold"
              numberOfLines={2}
            >
              {wallet.complianceTitle}
            </VemtapText>
          </View>
          <View className="shrink-0 rounded-full bg-surface-container px-2 py-0.5">
            <VemtapText
              variant="micro"
              className="font-sans-semibold text-text-secondary"
            >
              {wallet.complianceBadge}
            </VemtapText>
          </View>
        </View>
        <VemtapText variant="bodyMd" tone="secondary">
          {wallet.complianceLead}
        </VemtapText>
        <View className="gap-1 rounded-xl bg-surface-subtle p-3">
          <VemtapText variant="caption" tone="tertiary">
            {wallet.tinLabel}
          </VemtapText>
          <View className="flex-row items-center justify-between gap-2">
            <VemtapText
              variant="headingSm"
              className="font-sans-semibold tracking-wider"
              numberOfLines={1}
            >
              {wallet.tin}
            </VemtapText>
            <VemtapText variant="caption" className="shrink-0 text-badge-discount-text">
              {wallet.tinStatus}
            </VemtapText>
          </View>
        </View>
        <View className="flex-row gap-2">
          <Button
            label={wallet.vatCta}
            labelVariant="labelMd"
            variant="secondary"
            size="sm"
            className="min-h-[44px] flex-1"
            leftIcon={<Icon name="download" size={16} color={colors.text} />}
            onPress={() => onTaxInvoices?.(wallet.vatCta)}
          />
          <Button
            label={wallet.vatHistoryCta}
            labelVariant="labelMd"
            variant="secondary"
            size="sm"
            className="min-h-[44px] flex-1"
            leftIcon={<Icon name="calendar" size={16} color={colors.text} />}
            onPress={() => onTaxInvoices?.(wallet.vatHistoryCta)}
          />
        </View>
      </SetupSectionCard>
    </BusinessScreenLayout>
  );
}

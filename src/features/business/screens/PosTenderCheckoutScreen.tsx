import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import {
  BusinessActionDock,
  BusinessScreenLayout,
  BusinessStatusPill,
} from '@features/business/components/BusinessPrimitives';
import { BusinessPanel } from '@features/business/components/BusinessOpsPrimitives';
import {
  BusinessGrandTotalRow,
  BusinessTotalsRow,
} from '@features/business/components/BusinessPosPrimitives';
import {
  tenderBank,
  tenderCash,
  tenderLines,
  tenderOrder,
  tenderVat,
} from '@features/business/data/businessPosFlowData';

const copy = strings.posTenderCheckout;

const tenderIcon: Record<string, import('@components/ui/Icon').IconName> = {
  card: 'creditCard',
  transfer: 'accountBalance',
  voucher: 'token',
};

export interface PosTenderCheckoutScreenProps {
  onBack?: () => void;
  onOpenProfile?: () => void;
  onApplyPoints?: () => void;
  onSelectTender?: (tenderId: string) => void;
  onCashPreset?: (amount: string) => void;
  onSwitchTerminal?: () => void;
  onResendTransfer?: () => void;
  onCheckInflow?: () => void;
  onCopyAccount?: (account: string) => void;
  onApplyVoucher?: (code: string) => void;
  onScanVoucher?: () => void;
  onReceiptOption?: (optionId: string) => void;
  onCompleteSale?: () => void;
}

/** Tender checkout: order summary, loyalty points, tender method, cash/voucher detail and receipt dispatch. */
export function PosTenderCheckoutScreen({
  onBack,
  onOpenProfile,
  onApplyPoints,
  onSelectTender,
  onCashPreset,
  onSwitchTerminal,
  onResendTransfer,
  onCheckInflow,
  onCopyAccount,
  onApplyVoucher,
  onScanVoucher,
  onReceiptOption,
  onCompleteSale,
}: PosTenderCheckoutScreenProps) {
  const [tender, setTender] = useState<string>('card');
  const [cashPreset, setCashPreset] = useState<string>(tenderCash.presets[2]);

  return (
    <BusinessScreenLayout
      header={{
        title: copy.headerTitle,
        onBack,
        actions: [
          { icon: 'accountCircle', label: copy.headerTitle, onPress: onOpenProfile },
        ],
      }}
      contentContainerClassName="pb-8"
      footer={
        <BusinessActionDock>
          <Button
            label={`${copy.completeCta} (${tenderOrder.due})`}
            labelVariant="labelMd"
            onPress={onCompleteSale}
            leftIcon={<Icon name="checkCircle" size={18} color={colors.surface} />}
          />
          <View className="flex-row items-center justify-center gap-1.5">
            <Icon name="lock" size={13} color={colors.textTertiary} />
            <VemtapText
              variant="micro"
              tone="tertiary"
              className="text-center"
              numberOfLines={2}
            >
              {copy.securityNote}
            </VemtapText>
          </View>
        </BusinessActionDock>
      }
    >
      <View className="flex-row items-center gap-2">
        <VemtapText
          variant="caption"
          tone="secondary"
          className="min-w-0 flex-1"
          numberOfLines={2}
        >
          {`${copy.orderLabel} #${tenderOrder.id} • ${tenderOrder.table} • ${tenderOrder.branch}`}
        </VemtapText>
        <BusinessStatusPill label={copy.dineInLabel} tone="brand" />
      </View>

      <View className="mt-3 gap-1 rounded-card bg-primary p-4">
        <VemtapText variant="caption" className="text-surface" numberOfLines={1}>
          {copy.dueLabel}
        </VemtapText>
        <VemtapText
          variant="headingLg"
          className="font-sans-bold text-surface"
          numberOfLines={1}
        >
          {tenderOrder.due}
        </VemtapText>
      </View>

      <View className="mt-3 gap-2">
        <View className="flex-row items-center justify-between gap-2">
          <VemtapText variant="labelMd" className="font-sans-semibold" numberOfLines={1}>
            {copy.preServiceLabel}
          </VemtapText>
          <VemtapText
            variant="caption"
            tone="secondary"
            className="shrink-0"
            numberOfLines={1}
          >
            {`${tenderOrder.items} ${strings.posNewSaleCatalog.itemsLabel}`}
          </VemtapText>
        </View>
        {tenderLines.map(line => (
          <View key={line.id} className="flex-row items-center justify-between gap-2">
            <VemtapText
              variant="caption"
              tone="secondary"
              className="min-w-0 flex-1"
              numberOfLines={1}
            >
              {`${line.qty} ${line.name}`}
            </VemtapText>
            <VemtapText
              variant="caption"
              className="shrink-0 font-sans-medium"
              numberOfLines={1}
            >
              {line.price}
            </VemtapText>
          </View>
        ))}
        <BusinessTotalsRow label={tenderVat.label} value={tenderVat.value} />
      </View>

      <View className="mt-3 flex-row items-center gap-2.5 rounded-card bg-surface-tint p-3">
        <View className="h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary">
          <VemtapText
            variant="labelSm"
            className="font-sans-bold text-primary-foreground"
            numberOfLines={1}
          >
            MJ
          </VemtapText>
        </View>
        <View className="min-w-0 flex-1">
          <VemtapText
            variant="labelMd"
            className="font-sans-semibold text-primary"
            numberOfLines={1}
          >
            Michael James
          </VemtapText>
          <VemtapText variant="caption" className="text-primary" numberOfLines={1}>
            {`2,450 ${copy.pointsBalance}`}
          </VemtapText>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.applyPointsCta}
          onPress={onApplyPoints}
          className="h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface active:scale-95"
        >
          <Icon name="starFilled" size={17} color={colors.primary} />
        </Pressable>
      </View>

      <View className="mt-3">
        <VemtapText
          variant="labelMd"
          className="mb-2 font-sans-semibold"
          numberOfLines={1}
        >
          {copy.tenderTitle}
        </VemtapText>
        <View className="flex-row flex-wrap gap-2">
          {copy.tenderMethods.map(method => {
            const active = method.id === tender;
            return (
              <Pressable
                key={method.id}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityLabel={method.label}
                onPress={() => {
                  setTender(method.id);
                  onSelectTender?.(method.id);
                }}
                className={`min-w-[45%] flex-1 gap-1.5 rounded-card p-3 active:scale-[0.98] ${
                  active ? 'bg-primary' : 'bg-surface shadow-sm'
                }`}
              >
                <Icon
                  name={tenderIcon[method.id]}
                  size={19}
                  color={active ? colors.surface : colors.primary}
                />
                <VemtapText
                  variant="labelSm"
                  className={`font-sans-semibold ${active ? 'text-surface' : ''}`}
                  numberOfLines={2}
                >
                  {method.label}
                </VemtapText>
                <VemtapText
                  variant="micro"
                  className={active ? 'text-surface' : 'text-text-tertiary'}
                  numberOfLines={2}
                >
                  {method.hint}
                </VemtapText>
              </Pressable>
            );
          })}
        </View>
      </View>

      {tender === 'card' ? (
        <BusinessPanel className="mt-3" title="POS Terminal Card" icon="creditCard">
          <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
            {strings.posTenderCheckout.tenderMethods[0].hint}
          </VemtapText>
          <View className="flex-row items-center gap-1.5">
            <Icon name="contactless" size={15} color={colors.primary} />
            <VemtapText
              variant="caption"
              className="min-w-0 flex-1 font-sans-medium"
              numberOfLines={1}
            >
              {copy.cardLinked}
            </VemtapText>
          </View>
          <View className="flex-row gap-2">
            <View className="min-w-0 flex-1">
              <Button
                label={copy.cardSwitchCta}
                labelVariant="labelSm"
                variant="secondary"
                size="sm"
                onPress={onSwitchTerminal}
              />
            </View>
            <View className="min-w-0 flex-1">
              <Button
                label={copy.resendCta}
                labelVariant="labelSm"
                variant="secondary"
                size="sm"
                onPress={onResendTransfer}
              />
            </View>
          </View>
        </BusinessPanel>
      ) : null}

      {tender === 'transfer' ? (
        <BusinessPanel
          className="mt-3"
          title={strings.posTenderCheckout.tenderMethods[1].label}
          icon="accountBalance"
        >
          <VemtapText variant="caption" tone="tertiary" numberOfLines={1}>
            {copy.bankLabel}
          </VemtapText>
          <VemtapText variant="labelMd" className="font-sans-semibold" numberOfLines={1}>
            {tenderBank.bank}
          </VemtapText>
          <VemtapText
            variant="caption"
            tone="tertiary"
            className="mt-1"
            numberOfLines={1}
          >
            {copy.accountLabel}
          </VemtapText>
          <View className="flex-row items-center justify-between gap-2 rounded-field bg-surface-subtle p-2.5">
            <VemtapText
              variant="labelMd"
              className="min-w-0 flex-1 font-sans-semibold"
              numberOfLines={1}
            >
              {tenderBank.account}
            </VemtapText>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={copy.accountLabel}
              onPress={() => onCopyAccount?.(tenderBank.account)}
              className="h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-container-high active:scale-95"
            >
              <Icon name="copy" size={16} color={colors.text} />
            </Pressable>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.inflowCta}
            onPress={onCheckInflow}
            className="min-h-10 flex-row items-center gap-1.5 rounded-field bg-surface-container active:scale-95"
          >
            <Icon name="verifiedUser" size={15} color={colors.text} />
            <VemtapText
              variant="labelSm"
              className="min-w-0 flex-1 font-sans-semibold"
              numberOfLines={2}
            >
              {copy.inflowCta}
            </VemtapText>
          </Pressable>
        </BusinessPanel>
      ) : null}

      {tender === 'voucher' ? (
        <BusinessPanel
          className="mt-3"
          title={strings.posTenderCheckout.tenderMethods[2].label}
          icon="token"
        >
          <View className="flex-row items-center gap-2 rounded-field bg-surface-subtle p-2.5">
            <VemtapText variant="caption" className="min-w-0 flex-1" numberOfLines={1}>
              {copy.voucherPlaceholder}
            </VemtapText>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={copy.applyCta}
              onPress={() => onApplyVoucher?.('')}
              className="h-8 shrink-0 items-center justify-center rounded-lg bg-primary px-3 active:scale-95"
            >
              <VemtapText
                variant="labelSm"
                className="font-sans-semibold text-surface"
                numberOfLines={1}
              >
                {copy.applyCta}
              </VemtapText>
            </Pressable>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.scanVoucherCta}
            onPress={onScanVoucher}
            className="min-h-10 flex-row items-center gap-1.5 rounded-field bg-surface-container active:scale-95"
          >
            <Icon name="qrCodeScanner" size={15} color={colors.text} />
            <VemtapText
              variant="labelSm"
              className="min-w-0 flex-1 font-sans-semibold"
              numberOfLines={1}
            >
              {copy.scanVoucherCta}
            </VemtapText>
          </Pressable>
        </BusinessPanel>
      ) : null}

      {tender === 'card' ? (
        <View className="mt-3 gap-2 rounded-card border border-border bg-surface p-3 shadow-sm">
          <View className="flex-row items-center gap-2">
            <Icon name="callSplitIcon" size={17} color={colors.primary} />
            <VemtapText
              variant="labelMd"
              className="min-w-0 flex-1 font-sans-semibold"
              numberOfLines={1}
            >
              Cash
            </VemtapText>
            <BusinessStatusPill label="Exact" tone="neutral" />
          </View>
          <View className="flex-row flex-wrap gap-1.5">
            {tenderCash.presets.map(preset => {
              const active = preset === cashPreset;
              return (
                <Pressable
                  key={preset}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={preset}
                  onPress={() => {
                    setCashPreset(preset);
                    onCashPreset?.(preset);
                  }}
                  className={`min-h-10 min-w-[22%] flex-1 items-center justify-center rounded-field px-2 active:scale-95 ${
                    active ? 'bg-primary' : 'bg-surface-container'
                  }`}
                >
                  <VemtapText
                    variant="labelSm"
                    className={`font-sans-semibold ${active ? 'text-surface' : ''}`}
                    numberOfLines={1}
                  >
                    {preset}
                  </VemtapText>
                </Pressable>
              );
            })}
          </View>
          <BusinessTotalsRow label="Tendered Cash:" value={tenderCash.tendered} />
          <BusinessTotalsRow label="Change Due Back:" value={tenderCash.change} />
        </View>
      ) : null}

      <BusinessPanel className="mt-3" title={copy.receiptTitle} icon="receiptLong">
        <View className="flex-row gap-2">
          {copy.receiptOptions.map(option => (
            <Pressable
              key={option.id}
              accessibilityRole="button"
              accessibilityLabel={option.label}
              onPress={() => onReceiptOption?.(option.id)}
              className="min-h-11 min-w-0 flex-1 flex-row items-center justify-center gap-2 rounded-field bg-surface-container active:scale-95"
            >
              <Icon name={option.icon as never} size={17} color={colors.text} />
              <VemtapText
                variant="labelSm"
                className="min-w-0 font-sans-semibold"
                numberOfLines={1}
              >
                {option.label}
              </VemtapText>
            </Pressable>
          ))}
        </View>
        <BusinessGrandTotalRow label={copy.dueLabel} value={tenderOrder.due} />
      </BusinessPanel>
    </BusinessScreenLayout>
  );
}

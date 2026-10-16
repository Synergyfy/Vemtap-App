import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Button } from '@components/ui/Button';
import { Icon, type IconName } from '@components/ui/Icon';
import { Input } from '@components/ui/Input';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { EmptyState } from '@components/shared/EmptyState';
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
import { naira, type TotalsRow } from '@features/business/utils/posMappers';

const copy = strings.posTenderCheckout;

export type TenderId = 'cash' | 'card' | 'transfer' | 'split';

const tenderIcon: Record<TenderId, IconName> = {
  cash: 'payments',
  card: 'creditCard',
  transfer: 'accountBalance',
  split: 'callSplitIcon',
};

export interface PosTenderCheckoutView {
  orderLabel: string;
  orderTypeLabel: string;
  /** Total in naira, used for cash change. */
  totalAmount: number;
  lines: { id: string; qty: string; name: string; price: string }[];
  itemCount: number;
  totals: TotalsRow[];
  customer: { name: string; initials: string; points: string } | null;
  methods: TenderId[];
  cardTerminal: string | null;
  transfer: { bankName: string; accountNumber: string; accountName: string } | null;
  offline: boolean;
}

export interface PosTenderCheckoutScreenProps {
  view: PosTenderCheckoutView;
  isSubmitting?: boolean;
  onBack?: () => void;
  onOpenRewards?: () => void;
  onCopyAccount?: (account: string) => void;
  onSplit?: () => void;
  onCompleteSale?: (payment: {
    method: Exclude<TenderId, 'split'>;
    amountPaid: number;
  }) => void;
}

/** Round cash notes a customer is likely to hand over for this total. */
export function cashPresets(total: number): number[] {
  const steps = [1000, 5000, 10000];
  const presets = new Set<number>([Math.ceil(total)]);
  for (const step of steps) presets.add(Math.ceil(total / step) * step);
  return [...presets]
    .filter(value => value >= total)
    .sort((a, b) => a - b)
    .slice(0, 4);
}

/** Tender checkout: order summary, tender method, cash change and completion. */
export function PosTenderCheckoutScreen({
  view,
  isSubmitting,
  onBack,
  onOpenRewards,
  onCopyAccount,
  onSplit,
  onCompleteSale,
}: PosTenderCheckoutScreenProps) {
  const [tender, setTender] = useState<TenderId>(view.methods[0] ?? 'cash');
  const [cash, setCash] = useState('');
  const tendered = Number(cash.replace(/[^\d.]/g, '')) || 0;
  const change = Math.max(0, tendered - view.totalAmount);
  const cashShort = tender === 'cash' && tendered < view.totalAmount;
  const empty = view.lines.length === 0;

  return (
    <BusinessScreenLayout
      header={{ title: copy.headerTitle, onBack }}
      contentContainerClassName="pb-8"
      footer={
        <BusinessActionDock>
          <Button
            label={`${view.offline ? copy.completeOfflineCta : copy.completeCta} (${naira(view.totalAmount)})`}
            labelVariant="labelMd"
            disabled={empty || cashShort || tender === 'split'}
            loading={isSubmitting}
            onPress={() =>
              tender !== 'split' &&
              onCompleteSale?.({
                method: tender,
                amountPaid: tender === 'cash' ? tendered : view.totalAmount,
              })
            }
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
              {view.offline ? copy.offlineNote : copy.securityNote}
            </VemtapText>
          </View>
        </BusinessActionDock>
      }
    >
      {empty ? (
        <EmptyState icon="list" title={copy.empty.title} description={copy.empty.body} />
      ) : (
        <>
          <View className="flex-row items-center gap-2">
            <VemtapText
              variant="caption"
              tone="secondary"
              className="min-w-0 flex-1"
              numberOfLines={2}
            >
              {view.orderLabel}
            </VemtapText>
            <BusinessStatusPill label={view.orderTypeLabel} tone="brand" />
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
              {naira(view.totalAmount)}
            </VemtapText>
          </View>

          <View className="mt-3 gap-2">
            <View className="flex-row items-center justify-between gap-2">
              <VemtapText
                variant="labelMd"
                className="font-sans-semibold"
                numberOfLines={1}
              >
                {copy.summaryLabel}
              </VemtapText>
              <VemtapText
                variant="caption"
                tone="secondary"
                className="shrink-0"
                numberOfLines={1}
              >
                {copy.itemsCount(view.itemCount)}
              </VemtapText>
            </View>
            {view.lines.map(line => (
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
            {view.totals.map(row => (
              <BusinessTotalsRow
                key={row.id}
                label={row.label}
                value={row.value}
                tone={row.tone}
              />
            ))}
          </View>

          {view.customer ? (
            <View className="mt-3 flex-row items-center gap-2.5 rounded-card bg-surface-tint p-3">
              <View className="h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary">
                <VemtapText
                  variant="labelSm"
                  className="font-sans-bold text-primary-foreground"
                  numberOfLines={1}
                >
                  {view.customer.initials}
                </VemtapText>
              </View>
              <View className="min-w-0 flex-1">
                <VemtapText
                  variant="labelMd"
                  className="font-sans-semibold text-primary"
                  numberOfLines={1}
                >
                  {view.customer.name}
                </VemtapText>
                <VemtapText variant="caption" className="text-primary" numberOfLines={1}>
                  {view.customer.points}
                </VemtapText>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={copy.rewardsCta}
                onPress={onOpenRewards}
                className="h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface active:scale-95"
              >
                <Icon name="starFilled" size={17} color={colors.primary} />
              </Pressable>
            </View>
          ) : null}

          <View className="mt-3">
            <VemtapText
              variant="labelMd"
              className="mb-2 font-sans-semibold"
              numberOfLines={1}
            >
              {copy.tenderTitle}
            </VemtapText>
            <View className="flex-row flex-wrap gap-2">
              {view.methods.map(method => {
                const active = method === tender;
                return (
                  <Pressable
                    key={method}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    accessibilityLabel={copy.methods[method].label}
                    onPress={() => {
                      setTender(method);
                      if (method === 'split') onSplit?.();
                    }}
                    className={`min-w-[45%] flex-1 gap-1.5 rounded-card p-3 active:scale-[0.98] ${
                      active ? 'bg-primary' : 'bg-surface shadow-sm'
                    }`}
                  >
                    <Icon
                      name={tenderIcon[method]}
                      size={19}
                      color={active ? colors.surface : colors.primary}
                    />
                    <VemtapText
                      variant="labelSm"
                      className={`font-sans-semibold ${active ? 'text-surface' : ''}`}
                      numberOfLines={2}
                    >
                      {copy.methods[method].label}
                    </VemtapText>
                    <VemtapText
                      variant="micro"
                      className={active ? 'text-surface' : 'text-text-tertiary'}
                      numberOfLines={2}
                    >
                      {copy.methods[method].hint}
                    </VemtapText>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {tender === 'cash' ? (
            <View className="mt-3 gap-2 rounded-card border border-border bg-surface p-3 shadow-sm">
              <View className="flex-row flex-wrap gap-1.5">
                {cashPresets(view.totalAmount).map(preset => {
                  const active = preset === tendered;
                  return (
                    <Pressable
                      key={preset}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}
                      accessibilityLabel={naira(preset)}
                      onPress={() => setCash(String(preset))}
                      className={`min-h-10 min-w-[22%] flex-1 items-center justify-center rounded-field px-2 active:scale-95 ${
                        active ? 'bg-primary' : 'bg-surface-container'
                      }`}
                    >
                      <VemtapText
                        variant="labelSm"
                        className={`font-sans-semibold ${active ? 'text-surface' : ''}`}
                        numberOfLines={1}
                      >
                        {preset === Math.ceil(view.totalAmount)
                          ? copy.exactLabel
                          : naira(preset)}
                      </VemtapText>
                    </Pressable>
                  );
                })}
              </View>
              <Input
                label={copy.tenderedLabel}
                keyboardType="numeric"
                value={cash}
                onChangeText={setCash}
                placeholder={String(Math.ceil(view.totalAmount))}
              />
              <BusinessTotalsRow
                label={copy.changeLabel}
                value={naira(change)}
                tone="strong"
              />
            </View>
          ) : null}

          {tender === 'card' ? (
            <BusinessPanel
              className="mt-3"
              title={copy.methods.card.label}
              icon="creditCard"
            >
              <View className="flex-row items-center gap-1.5">
                <Icon name="contactless" size={15} color={colors.primary} />
                <VemtapText
                  variant="caption"
                  className="min-w-0 flex-1 font-sans-medium"
                  numberOfLines={2}
                >
                  {view.cardTerminal
                    ? copy.cardLinked(view.cardTerminal)
                    : copy.cardNoTerminal}
                </VemtapText>
              </View>
            </BusinessPanel>
          ) : null}

          {tender === 'transfer' && view.transfer ? (
            <BusinessPanel
              className="mt-3"
              title={copy.methods.transfer.label}
              icon="accountBalance"
            >
              <VemtapText variant="caption" tone="tertiary" numberOfLines={1}>
                {copy.bankLabel}
              </VemtapText>
              <VemtapText
                variant="labelMd"
                className="font-sans-semibold"
                numberOfLines={2}
              >
                {[view.transfer.bankName, view.transfer.accountName]
                  .filter(Boolean)
                  .join(' • ')}
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
                  {view.transfer.accountNumber}
                </VemtapText>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={copy.copyAccountCta}
                  onPress={() =>
                    view.transfer && onCopyAccount?.(view.transfer.accountNumber)
                  }
                  className="h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-container-high active:scale-95"
                >
                  <Icon name="copy" size={16} color={colors.text} />
                </Pressable>
              </View>
              <VemtapText variant="micro" tone="tertiary" numberOfLines={2}>
                {copy.transferConfirmNote}
              </VemtapText>
            </BusinessPanel>
          ) : null}

          <BusinessGrandTotalRow label={copy.dueLabel} value={naira(view.totalAmount)} />
        </>
      )}
    </BusinessScreenLayout>
  );
}

import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { Input } from '@components/ui/Input';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { EmptyState } from '@components/shared/EmptyState';
import {
  BusinessActionDock,
  BusinessScreenLayout,
} from '@features/business/components/BusinessPrimitives';
import {
  BusinessIconWell,
  BusinessPanel,
} from '@features/business/components/BusinessOpsPrimitives';
import {
  BusinessGrandTotalRow,
  BusinessTotalsRow,
} from '@features/business/components/BusinessPosPrimitives';
import type { TotalsRow } from '@features/business/utils/posMappers';

const copy = strings.posCurrentSaleCart;

export interface CartLineView {
  id: string;
  name: string;
  qty: number;
  unit: string;
  lineTotal: string;
  discountNote?: string;
  /** At or above the stock on hand. */
  atStockLimit: boolean;
}

export interface PosCurrentSaleCartView {
  storeLabel: string;
  tableLabel: string | null;
  customer: { name: string; tier: string; phone: string; points: string } | null;
  lines: CartLineView[];
  totals: TotalsRow[];
  grandTotal: string;
  note: string;
  cartDiscount: string;
  takeaway: boolean;
}

export interface PosCurrentSaleCartScreenProps {
  view: PosCurrentSaleCartView;
  isHolding?: boolean;
  onBack?: () => void;
  onChangeCustomer?: () => void;
  onAddMore?: () => void;
  onChangeQty?: (lineId: string, qty: number) => void;
  onRemoveLine?: (lineId: string) => void;
  onNoteChange?: (note: string) => void;
  onCartDiscountChange?: (amount: number) => void;
  onToggleTakeaway?: (takeaway: boolean) => void;
  onHold?: () => void;
  onCharge?: () => void;
}

/** Current ticket: customer context, editable line items, totals and hold/charge actions. */
export function PosCurrentSaleCartScreen({
  view,
  isHolding,
  onBack,
  onChangeCustomer,
  onAddMore,
  onChangeQty,
  onRemoveLine,
  onNoteChange,
  onCartDiscountChange,
  onToggleTakeaway,
  onHold,
  onCharge,
}: PosCurrentSaleCartScreenProps) {
  const [editor, setEditor] = useState<'note' | 'discount' | null>(null);
  const empty = view.lines.length === 0;

  return (
    <BusinessScreenLayout
      header={{ title: copy.headerTitle, onBack }}
      contentContainerClassName="pb-8"
      footer={
        <BusinessActionDock>
          <View className="flex-row gap-2">
            <View className="min-w-0 flex-1">
              <Button
                label={copy.holdTicketCta}
                labelVariant="labelMd"
                variant="secondary"
                disabled={empty}
                loading={isHolding}
                onPress={onHold}
                leftIcon={<Icon name="pauseCircle" size={17} color={colors.text} />}
              />
            </View>
            <View className="min-w-0 flex-1">
              <Button
                label={copy.chargeCta}
                labelVariant="labelMd"
                disabled={empty}
                onPress={onCharge}
                rightIcon={<Icon name="arrowForward" size={17} color={colors.surface} />}
              />
            </View>
          </View>
        </BusinessActionDock>
      }
    >
      <View className="min-w-0">
        <VemtapText variant="caption" tone="tertiary" numberOfLines={1}>
          {view.storeLabel}
        </VemtapText>
        <View className="flex-row items-center gap-1.5">
          <VemtapText variant="labelMd" className="font-sans-semibold" numberOfLines={1}>
            {copy.ticketLabel}
          </VemtapText>
          {view.tableLabel ? (
            <>
              <View className="h-1 w-1 rounded-full bg-outline" />
              <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                {view.tableLabel}
              </VemtapText>
            </>
          ) : null}
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={copy.changeCta}
        onPress={onChangeCustomer}
        className="mt-3 flex-row items-center gap-2.5 rounded-card bg-surface-tint p-3"
      >
        <BusinessIconWell
          icon={view.customer ? 'starFilled' : 'accountCircle'}
          tone="brand"
          size="sm"
        />
        <View className="min-w-0 flex-1">
          <VemtapText
            variant="labelMd"
            className="font-sans-semibold text-primary"
            numberOfLines={1}
          >
            {view.customer?.name ?? copy.walkInLabel}
          </VemtapText>
          <VemtapText variant="caption" className="text-primary" numberOfLines={1}>
            {view.customer
              ? `${view.customer.tier} • ${view.customer.phone}`
              : copy.attachHint}
          </VemtapText>
        </View>
        {view.customer ? (
          <VemtapText
            variant="labelSm"
            className="shrink-0 font-sans-semibold text-primary"
            numberOfLines={1}
          >
            {view.customer.points}
          </VemtapText>
        ) : null}
        <Icon name="edit" size={17} color={colors.primary} />
      </Pressable>

      <View className="mt-3 flex-row items-center justify-between gap-2">
        <View className="min-w-0 flex-1 flex-row items-center gap-1.5">
          <Icon name="list" size={16} color={colors.primary} />
          <VemtapText variant="labelMd" className="font-sans-semibold" numberOfLines={1}>
            {copy.itemsTitle}
          </VemtapText>
          <View className="rounded-full bg-surface-container px-1.5 py-0.5">
            <VemtapText variant="micro" className="font-sans-bold" numberOfLines={1}>
              {String(view.lines.length)}
            </VemtapText>
          </View>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.addMoreCta}
          onPress={onAddMore}
          className="min-h-9 shrink-0 flex-row items-center gap-1.5 rounded-full bg-surface-container px-3 active:scale-95"
        >
          <Icon name="plus" size={14} color={colors.text} />
          <VemtapText variant="labelSm" className="font-sans-semibold" numberOfLines={1}>
            {copy.addMoreCta}
          </VemtapText>
        </Pressable>
      </View>

      <View className="mt-2 gap-2">
        {view.lines.map(line => (
          <View key={line.id} className="gap-2 rounded-card bg-surface p-3 shadow-sm">
            <View className="flex-row items-start justify-between gap-2">
              <VemtapText
                variant="labelMd"
                className="min-w-0 flex-1 font-sans-semibold"
                numberOfLines={2}
              >
                {line.name}
              </VemtapText>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${line.name} delete`}
                onPress={() => onRemoveLine?.(line.id)}
                className="h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-container"
              >
                <Icon name="delete" size={16} color={colors.textSecondary} />
              </Pressable>
            </View>
            <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
              {`${copy.unitLabel}: ${line.unit}`}
            </VemtapText>
            {line.discountNote ? (
              <View className="flex-row items-center gap-1.5">
                <Icon name="localOffer" size={13} color={colors.badgeDiscountText} />
                <VemtapText
                  variant="micro"
                  className="min-w-0 flex-1 text-badge-discount-text"
                  numberOfLines={2}
                >
                  {line.discountNote}
                </VemtapText>
              </View>
            ) : null}
            <View className="flex-row items-center justify-between gap-3">
              <View className="flex-row items-center gap-2">
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${line.name} decrease`}
                  onPress={() => onChangeQty?.(line.id, line.qty - 1)}
                  className="h-8 w-8 items-center justify-center rounded-lg bg-surface-container"
                >
                  <Icon name="remove" size={16} color={colors.text} />
                </Pressable>
                <VemtapText
                  variant="labelMd"
                  className="w-5 text-center font-sans-semibold"
                  numberOfLines={1}
                >
                  {String(line.qty)}
                </VemtapText>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${line.name} increase`}
                  accessibilityState={{ disabled: line.atStockLimit }}
                  disabled={line.atStockLimit}
                  onPress={() => onChangeQty?.(line.id, line.qty + 1)}
                  className="h-8 w-8 items-center justify-center rounded-lg bg-surface-container"
                >
                  <Icon
                    name="plus"
                    size={16}
                    color={line.atStockLimit ? colors.textTertiary : colors.text}
                  />
                </Pressable>
              </View>
              <View className="items-end">
                <VemtapText
                  variant="labelSm"
                  className="font-sans-semibold"
                  numberOfLines={1}
                >
                  {line.lineTotal}
                </VemtapText>
                <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
                  {copy.lineTotalLabel}
                </VemtapText>
              </View>
            </View>
          </View>
        ))}
      </View>

      {empty ? (
        <EmptyState
          icon="list"
          variant="contained"
          title={copy.empty.title}
          description={copy.empty.body}
          actionLabel={copy.addMoreCta}
          onAction={onAddMore}
        />
      ) : null}

      <View className="mt-3 flex-row flex-wrap gap-2">
        {[
          {
            id: 'note',
            label: copy.noteCta,
            icon: 'editNote' as const,
            onPress: () => setEditor(editor === 'note' ? null : 'note'),
          },
          {
            id: 'discount',
            label: copy.discountCta,
            icon: 'percentBadge' as const,
            onPress: () => setEditor(editor === 'discount' ? null : 'discount'),
          },
          {
            id: 'takeaway',
            label: view.takeaway ? copy.dineInCta : copy.takeawayCta,
            icon: 'shoppingBag' as const,
            onPress: () => onToggleTakeaway?.(!view.takeaway),
          },
        ].map(action => (
          <Pressable
            key={action.id}
            accessibilityRole="button"
            accessibilityLabel={action.label}
            onPress={action.onPress}
            className="min-h-10 min-w-[45%] flex-1 flex-row items-center justify-center gap-1.5 rounded-field bg-surface-container px-2.5 active:scale-95"
          >
            <Icon name={action.icon} size={15} color={colors.text} />
            <VemtapText
              variant="labelSm"
              className="min-w-0 font-sans-semibold"
              numberOfLines={1}
            >
              {action.label}
            </VemtapText>
          </Pressable>
        ))}
      </View>

      {editor === 'note' ? (
        <Input
          containerClassName="mt-3"
          label={copy.noteCta}
          value={view.note}
          onChangeText={onNoteChange}
          multiline
        />
      ) : null}
      {editor === 'discount' ? (
        <Input
          containerClassName="mt-3"
          label={copy.discountInputLabel}
          keyboardType="numeric"
          value={view.cartDiscount}
          onChangeText={text =>
            onCartDiscountChange?.(Number(text.replace(/[^\d.]/g, '')) || 0)
          }
        />
      ) : null}

      <BusinessPanel className="mt-3" title={copy.totalDueLabel} icon="receipt">
        <View className="gap-1.5">
          {view.totals.map(row => (
            <BusinessTotalsRow
              key={row.id}
              label={row.label}
              value={row.value}
              tone={row.tone}
            />
          ))}
        </View>
        <BusinessGrandTotalRow label={copy.totalDueLabel} value={view.grandTotal} />
        <VemtapText variant="micro" tone="tertiary" numberOfLines={2}>
          {copy.totalDueNote}
        </VemtapText>
      </BusinessPanel>
    </BusinessScreenLayout>
  );
}

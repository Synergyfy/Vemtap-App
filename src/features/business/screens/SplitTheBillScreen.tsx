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
} from '@features/business/components/BusinessPrimitives';
import { BusinessPanel } from '@features/business/components/BusinessOpsPrimitives';
import {
  BusinessInitialsAvatar,
  BusinessGrandTotalRow,
  BusinessLineItem,
  BusinessOptionGrid,
  BusinessTotalsRow,
} from '@features/business/components/BusinessPosPrimitives';
import { businessOpsImageById } from '@features/business/data/businessOpsImages';
import {
  splitGrandTotal,
  splitLines,
  splitModes,
  splitPeople,
  splitTotals,
} from '@features/business/data/businessAnalyticsData';

const copy = strings.splitTheBill;

export interface SplitTheBillScreenProps {
  onBack?: () => void;
  onChangeMode?: (mode: string) => void;
  onAssignItem?: (itemId: string) => void;
  onPayShare?: (amount: string) => void;
}

/**
 * Split-this-bill flow: pick how to split, review the items, see who pays what,
 * then settle your own share. Item assignment is a follow-up flow; this screen
 * owns the mode picker, the totals and the per-person breakdown.
 */
export function SplitTheBillScreen({
  onBack,
  onChangeMode,
  onAssignItem,
  onPayShare,
}: SplitTheBillScreenProps) {
  const [mode, setMode] = useState<string>('even');
  const me = splitPeople[0];

  return (
    <BusinessScreenLayout
      header={{ title: copy.headerTitle, onBack }}
      contentContainerClassName="pb-8"
      footer={
        <BusinessActionDock>
          <Button
            label={copy.payShareCta}
            labelVariant="labelMd"
            onPress={() => onPayShare?.(me.amount)}
            leftIcon={<Icon name="walletPay" size={18} color={colors.surface} />}
          />
          <VemtapText variant="caption" tone="secondary" className="text-center">
            {copy.tipNote}
          </VemtapText>
        </BusinessActionDock>
      }
    >
      <View className="flex-row items-center justify-between gap-2">
        <View className="rounded-full bg-surface-container px-3 py-1.5">
          <VemtapText variant="labelSm" className="font-sans-semibold" numberOfLines={1}>
            {`${copy.tableLabel} ${splitPeople.length}`}
          </VemtapText>
        </View>
        <VemtapText
          variant="caption"
          tone="secondary"
          className="shrink-0"
          numberOfLines={1}
        >
          {copy.billTitle}
        </VemtapText>
      </View>

      <View className="mt-1">
        <VemtapText variant="bodyMd" tone="secondary" numberOfLines={2}>
          {copy.billSubtitle}
        </VemtapText>
      </View>

      <BusinessPanel className="mt-3" title={copy.modesTitle} icon="splitBill">
        <BusinessOptionGrid
          options={splitModes}
          value={mode}
          onChange={next => {
            setMode(next);
            onChangeMode?.(next);
          }}
          columns={3}
          accessibilityLabel={copy.modesTitle}
        />
      </BusinessPanel>

      <BusinessPanel
        className="mt-3"
        title={copy.itemsTitle}
        icon="list"
        badge={String(splitLines.length)}
        badgeTone="neutral"
      >
        <VemtapText variant="caption" tone="secondary" numberOfLines={2}>
          {copy.itemsSubtitle}
        </VemtapText>
        <View className="gap-3">
          {splitLines.map(item => {
            const image = businessOpsImageById[item.imageId];
            return (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                accessibilityLabel={item.name}
                onPress={() => onAssignItem?.(item.id)}
                className="active:opacity-70"
              >
                <BusinessLineItem
                  name={item.name}
                  price={item.price}
                  modifier={item.shares}
                  imageUri={image?.uri}
                  imageAlt={image?.alt}
                />
              </Pressable>
            );
          })}
        </View>
      </BusinessPanel>

      <BusinessPanel className="mt-3" title={copy.totalsTitle} icon="receipt">
        <View className="gap-1.5">
          {splitTotals.map(row => (
            <BusinessTotalsRow
              key={row.id}
              label={row.label}
              value={row.value}
              tone={row.tone}
            />
          ))}
        </View>
        <BusinessGrandTotalRow label={copy.totalsTitle} value={splitGrandTotal} />
      </BusinessPanel>

      <BusinessPanel
        className="mt-3"
        title={copy.peopleTitle}
        icon="group"
        badge={String(splitPeople.length)}
        badgeTone="neutral"
      >
        <VemtapText variant="caption" tone="secondary" numberOfLines={2}>
          {copy.peopleSubtitle}
        </VemtapText>
        <View className="gap-2">
          {splitPeople.map(person => (
            <View
              key={person.id}
              className="flex-row items-center gap-3 rounded-field bg-surface-subtle p-2.5"
            >
              <BusinessInitialsAvatar
                initials={person.initials}
                size="sm"
                tone={person.id === splitPeople[0].id ? 'brand' : 'neutral'}
              />
              <VemtapText variant="labelMd" className="min-w-0 flex-1" numberOfLines={1}>
                {person.name}
              </VemtapText>
              <VemtapText
                variant="labelMd"
                className="shrink-0 font-sans-semibold"
                numberOfLines={1}
              >
                {person.amount}
              </VemtapText>
            </View>
          ))}
        </View>
        <View className="mt-1 flex-row items-center gap-1.5">
          <Icon name="info" size={14} color={colors.textTertiary} />
          <VemtapText
            variant="caption"
            tone="tertiary"
            className="min-w-0 flex-1"
            numberOfLines={2}
          >
            {copy.tipNote}
          </VemtapText>
        </View>
      </BusinessPanel>
    </BusinessScreenLayout>
  );
}

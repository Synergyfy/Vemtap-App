import React from 'react';
import { Pressable, View } from 'react-native';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import {
  BusinessChipScroller,
  BusinessCountChip,
  BusinessPanel,
  BusinessSearchTrigger,
} from '@features/business/components/BusinessOpsPrimitives';
import { BusinessInitialsAvatar } from '@features/business/components/BusinessPosPrimitives';
import {
  BusinessActionDock,
  BusinessScreenLayout,
  BusinessStatusPill,
} from '@features/business/components/BusinessPrimitives';
import {
  posShiftJournal,
  posShiftLedgerFilters,
  posShiftSalesMix,
  type PosShiftJournalTicket,
} from '@features/business/data/businessPosLedgerData';

const copy = strings.posTransactionsLedgerShift;

const mixDot: Record<string, string> = {
  card: 'bg-primary',
  transfer: 'bg-primary-fixed',
  cash: 'bg-success',
};

const actionTone: Record<PosShiftJournalTicket['actions'][number]['tone'], string> = {
  default: 'bg-surface-container text-text',
  danger: 'bg-error-container text-error',
};

export interface PosTransactionsLedgerShiftScreenProps {
  onBack?: () => void;
  onOpenProfile?: () => void;
  onOpenNotifications?: () => void;
  onOpenScope?: () => void;
  onSearch?: () => void;
  onSelectFilter?: (filterId: string) => void;
  onReprint?: (ticketId: string) => void;
  onOpenDetails?: (ticketId: string) => void;
  onVoid?: (ticketId: string) => void;
  onOpenReceipt?: (ticketId: string) => void;
  onOpenSplits?: (ticketId: string) => void;
  onResumeTicket?: (ticketId: string) => void;
  onExportShift?: () => void;
  onOpenZReport?: () => void;
}

/**
 * `pos_transactions_ledger_1` - the shift journal: today's totals with the
 * tender mix, then the live ticket feed including parked and split bills. The
 * design's own tab bar is not rendered (BusinessTabBar owns navigation).
 */
export function PosTransactionsLedgerShiftScreen({
  onBack,
  onOpenProfile,
  onOpenNotifications,
  onOpenScope,
  onSearch,
  onSelectFilter,
  onReprint,
  onOpenDetails,
  onVoid,
  onOpenReceipt,
  onOpenSplits,
  onResumeTicket,
  onExportShift,
  onOpenZReport,
}: PosTransactionsLedgerShiftScreenProps) {
  return (
    <BusinessScreenLayout
      header={{
        title: copy.headerTitle,
        subtitle: copy.headerSubtitle,
        onBack,
        showAvatar: false,
        titleVariant: 'labelMd',
        leading: (
          <View className="h-9 w-9 items-center justify-center rounded-xl bg-primary">
            <Icon name="pointOfSale" size={18} color={colors.surface} />
          </View>
        ),
        actions: [
          {
            icon: 'notifications',
            label: copy.bellActionLabel,
            onPress: onOpenNotifications,
          },
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
          <View className="flex-row gap-2">
            <View className="min-w-0 flex-1">
              <Button
                label={copy.exportCta}
                labelVariant="labelMd"
                variant="secondary"
                onPress={onExportShift}
                leftIcon={<Icon name="download" size={16} color={colors.text} />}
              />
            </View>
            <View className="min-w-0 flex-1">
              <Button
                label={copy.zReportCta}
                labelVariant="labelMd"
                onPress={onOpenZReport}
                leftIcon={<Icon name="chartBox" size={16} color={colors.surface} />}
              />
            </View>
          </View>
          <View className="mt-2 flex-row items-center justify-center gap-1.5">
            <Icon name="lock" size={13} color={colors.textTertiary} />
            <VemtapText
              variant="micro"
              tone="tertiary"
              className="text-center"
              numberOfLines={2}
            >
              {copy.footerNote}
            </VemtapText>
          </View>
        </BusinessActionDock>
      }
    >
      <View className="flex-row flex-wrap items-center justify-between gap-2">
        <View className="min-w-0 flex-1 flex-row items-center gap-1.5">
          <Icon name="back" size={16} color={colors.textSecondary} />
          <VemtapText variant="labelSm" className="font-sans-semibold" numberOfLines={1}>
            {copy.sectionTitle}
          </VemtapText>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.scopeLabel}
          onPress={onOpenScope}
          className="min-h-9 shrink-0 flex-row items-center gap-1.5 rounded-full bg-surface-container px-3 active:scale-95"
        >
          <View className="h-2 w-2 rounded-full bg-success" />
          <VemtapText variant="caption" numberOfLines={1}>
            {copy.scopeLabel}
          </VemtapText>
        </Pressable>
      </View>

      <View className="mt-3 flex-row items-start justify-between gap-2">
        <View className="min-w-0 flex-1">
          <VemtapText
            variant="headingLg"
            className="font-sans-semibold"
            numberOfLines={2}
          >
            {copy.title}
          </VemtapText>
          <VemtapText variant="caption" tone="secondary" numberOfLines={2}>
            {copy.subtitle}
          </VemtapText>
        </View>
        <View className="shrink-0 flex-row items-center gap-1.5 rounded-full bg-success-container px-2.5 py-1.5">
          <Icon name="sync" size={14} color={colors.success} />
          <VemtapText variant="caption" tone="success" numberOfLines={1}>
            {copy.liveBadge}
          </VemtapText>
        </View>
      </View>

      <View className="mt-3">
        <BusinessSearchTrigger
          placeholder={copy.searchPlaceholder}
          onPress={onSearch}
          onFilterPress={onSearch}
          filterLabel={copy.searchPlaceholder}
        />
      </View>

      <View className="mt-3">
        <BusinessChipScroller>
          {posShiftLedgerFilters.map(filter => (
            <BusinessCountChip
              key={filter.id}
              label={filter.label}
              count={filter.count}
              selected={filter.active}
              onPress={() => onSelectFilter?.(filter.id)}
            />
          ))}
        </BusinessChipScroller>
      </View>

      <BusinessPanel className="mt-3">
        <View className="flex-row items-center gap-2.5">
          <View className="h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-tint">
            <Icon name="wallet" size={18} color={colors.primary} />
          </View>
          <View className="min-w-0 flex-1">
            <VemtapText
              variant="micro"
              tone="tertiary"
              className="uppercase tracking-wider"
              numberOfLines={1}
            >
              {copy.shiftSalesLabel}
            </VemtapText>
            <VemtapText variant="headingXl" className="font-sans-bold" numberOfLines={1}>
              {copy.shiftSalesValue}
            </VemtapText>
          </View>
          <View className="shrink-0 flex-row items-center gap-1 rounded-field bg-success-container px-2 py-1.5">
            <Icon name="trendingUp" size={13} color={colors.success} />
            <VemtapText variant="caption" tone="success" numberOfLines={1}>
              {copy.shiftSalesDelta}
            </VemtapText>
          </View>
        </View>
        <View className="flex-row gap-1">
          <View className="h-2 flex-[68] rounded-full bg-primary" />
          <View className="h-2 flex-[22] rounded-full bg-primary-fixed" />
          <View className="h-2 flex-[10] rounded-full bg-success" />
        </View>
        <View className="mt-1 flex-row gap-2">
          {posShiftSalesMix.map(mix => (
            <View key={mix.id} className="min-w-0 flex-1">
              <View className="flex-row items-center gap-1.5">
                <View className={`h-2 w-2 shrink-0 rounded-full ${mixDot[mix.id]}`} />
                <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
                  {mix.label}
                </VemtapText>
              </View>
              <VemtapText
                variant="labelSm"
                className="font-sans-semibold"
                numberOfLines={1}
              >
                {mix.value}
              </VemtapText>
            </View>
          ))}
        </View>
      </BusinessPanel>

      <View className="mt-4 flex-row items-center justify-between gap-2">
        <VemtapText variant="labelMd" className="font-sans-semibold" numberOfLines={1}>
          {copy.feedTitle}
        </VemtapText>
        <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
          {copy.feedBadge}
        </VemtapText>
      </View>

      <View className="mt-2 gap-2.5">
        {posShiftJournal.map(ticket => (
          <View key={ticket.id} className="rounded-card bg-surface p-3 shadow-sm">
            <View className="flex-row items-start justify-between gap-2">
              <View className="min-w-0 flex-1">
                <View className="flex-row flex-wrap items-center gap-1.5">
                  <VemtapText
                    variant="labelMd"
                    className="font-sans-semibold"
                    numberOfLines={1}
                  >
                    {ticket.reference}
                  </VemtapText>
                  <BusinessStatusPill label={ticket.badge} tone={ticket.badgeTone} />
                </View>
                <VemtapText
                  variant="caption"
                  tone="secondary"
                  className="mt-0.5"
                  numberOfLines={1}
                >
                  {ticket.when}
                </VemtapText>
              </View>
              <VemtapText
                variant="labelMd"
                className="shrink-0 font-sans-bold"
                numberOfLines={1}
              >
                {ticket.total}
              </VemtapText>
            </View>

            <View className="mt-1.5 flex-row items-center gap-1.5">
              <Icon name={ticket.tenderIcon} size={14} color={colors.textSecondary} />
              <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                {ticket.tender}
              </VemtapText>
            </View>

            {ticket.patron ? (
              <View className="mt-2 flex-row items-center gap-2 rounded-field bg-surface-container-low px-2.5 py-2">
                <BusinessInitialsAvatar initials={ticket.patron.initials} size="sm" />
                <View className="min-w-0 flex-1">
                  <VemtapText
                    variant="caption"
                    className="font-sans-semibold"
                    numberOfLines={1}
                  >
                    {ticket.patron.name}
                  </VemtapText>
                  <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
                    {ticket.patron.terminal}
                  </VemtapText>
                </View>
                <BusinessStatusPill label={ticket.patron.tier} tone="warning" />
              </View>
            ) : null}

            {ticket.expanded ? (
              <View className="mt-2 gap-1.5">
                {ticket.lines.map(line => (
                  <View
                    key={line.id}
                    className="flex-row items-start justify-between gap-2"
                  >
                    <VemtapText
                      variant="caption"
                      className="min-w-0 flex-1"
                      numberOfLines={2}
                    >
                      {`${line.qty} ${line.name}`}
                    </VemtapText>
                    <VemtapText
                      variant="caption"
                      className="shrink-0 font-sans-semibold"
                      numberOfLines={1}
                    >
                      {line.price}
                    </VemtapText>
                  </View>
                ))}
                {ticket.discount ? (
                  <View className="flex-row items-center justify-between gap-2">
                    <View className="min-w-0 flex-1 flex-row items-center gap-1.5">
                      <Icon name="localOffer" size={14} color={colors.success} />
                      <VemtapText variant="caption" tone="success" numberOfLines={1}>
                        {ticket.discount.label}
                      </VemtapText>
                    </View>
                    <VemtapText
                      variant="caption"
                      tone="success"
                      className="shrink-0"
                      numberOfLines={1}
                    >
                      {ticket.discount.value}
                    </VemtapText>
                  </View>
                ) : null}
              </View>
            ) : null}

            {ticket.note ? (
              <VemtapText
                variant="caption"
                tone="secondary"
                className="mt-2"
                numberOfLines={2}
              >
                {ticket.note}
              </VemtapText>
            ) : null}
            {ticket.id === 'tk-105' ? (
              <VemtapText
                variant="caption"
                tone="tertiary"
                className="mt-1"
                numberOfLines={1}
              >
                {copy.parkedBy}
              </VemtapText>
            ) : null}

            <View className="mt-2.5 flex-row flex-wrap gap-2">
              {ticket.actions.map(action => (
                <Pressable
                  key={action.id}
                  accessibilityRole="button"
                  accessibilityLabel={`${action.label} ${ticket.reference}`}
                  onPress={() => {
                    if (action.id === 'reprint') onReprint?.(ticket.id);
                    if (action.id === 'details') onOpenDetails?.(ticket.id);
                    if (action.id === 'void') onVoid?.(ticket.id);
                    if (action.id === 'receipt') onOpenReceipt?.(ticket.id);
                    if (action.id === 'splits') onOpenSplits?.(ticket.id);
                    if (action.id === 'resume') onResumeTicket?.(ticket.id);
                  }}
                  className={`min-h-9 flex-row items-center gap-1.5 rounded-field px-3 active:scale-95 ${actionTone[action.tone]}`}
                >
                  <Icon
                    name={action.icon}
                    size={14}
                    color={action.tone === 'danger' ? colors.error : colors.text}
                  />
                  <VemtapText
                    variant="caption"
                    className={`font-sans-semibold ${action.tone === 'danger' ? 'text-error' : ''}`}
                    numberOfLines={1}
                  >
                    {action.label}
                  </VemtapText>
                </Pressable>
              ))}
            </View>
          </View>
        ))}
      </View>
    </BusinessScreenLayout>
  );
}

import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Button } from '@components/ui/Button';
import { BottomSheet } from '@components/shared/BottomSheet';
import { EmptyState } from '@components/shared/EmptyState';
import { ErrorState } from '@components/shared/ErrorState';
import { LoadingState } from '@components/shared/LoadingState';
import { Icon } from '@components/ui/Icon';
import { Input } from '@components/ui/Input';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { BusinessPanel } from '@features/business/components/BusinessOpsPrimitives';
import { BusinessTotalsRow } from '@features/business/components/BusinessPosPrimitives';
import {
  BusinessActionDock,
  BusinessScreenLayout,
  BusinessStatusPill,
} from '@features/business/components/BusinessPrimitives';
import { PosLedgerRow } from '@features/business/components/PosLedgerRow';
import type { LedgerRowView } from '@features/business/utils/posMappers';

const copy = strings.posTransactionsLedgerShift;

const mixDot: Record<string, string> = {
  card: 'bg-primary',
  transfer: 'bg-primary-fixed',
  cash: 'bg-success',
  split: 'bg-tertiary',
};

export interface HeldTicketView {
  id: string;
  label: string;
  total: string;
  meta: string;
  items: string;
}

export interface PosLedgerShiftView {
  scopeLabel: string;
  /** No open register: the journal shows today's held tickets only. */
  shiftOpen: boolean;
  shiftSales: string;
  shiftMeta: string;
  mix: { id: string; label: string; percent: number }[];
  drawer: { id: string; label: string; value: string }[];
  rows: LedgerRowView[];
  held: HeldTicketView[];
  expectedCash: number;
}

export interface PosTransactionsLedgerShiftScreenProps {
  view?: PosLedgerShiftView;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  isClosing?: boolean;
  onBack?: () => void;
  onOpenScope?: () => void;
  onOpenDetails?: (saleId: string) => void;
  onResumeTicket?: (heldId: string) => void;
  onDiscardTicket?: (heldId: string) => void;
  onCloseShift?: (countedCash: number | undefined) => void;
  onOpenRegister?: () => void;
}

/** The shift journal: totals with the tender mix, this shift's tickets and parked bills. */
export function PosTransactionsLedgerShiftScreen({
  view,
  isLoading,
  isError,
  onRetry,
  isClosing,
  onBack,
  onOpenScope,
  onOpenDetails,
  onResumeTicket,
  onDiscardTicket,
  onCloseShift,
  onOpenRegister,
}: PosTransactionsLedgerShiftScreenProps) {
  const [closeVisible, setCloseVisible] = useState(false);
  const [counted, setCounted] = useState('');

  return (
    <>
      <BusinessScreenLayout
        header={{ title: copy.headerTitle, onBack }}
        contentContainerClassName="pb-8"
        footer={
          view ? (
            <BusinessActionDock>
              {view.shiftOpen ? (
                <Button
                  label={copy.closeShiftCta}
                  labelVariant="labelMd"
                  loading={isClosing}
                  onPress={() => {
                    setCounted('');
                    setCloseVisible(true);
                  }}
                  leftIcon={<Icon name="lock" size={17} color={colors.surface} />}
                />
              ) : (
                <Button
                  label={copy.openRegisterCta}
                  labelVariant="labelMd"
                  onPress={onOpenRegister}
                />
              )}
              <VemtapText
                variant="micro"
                tone="tertiary"
                className="text-center"
                numberOfLines={2}
              >
                {copy.footerNote}
              </VemtapText>
            </BusinessActionDock>
          ) : undefined
        }
      >
        {!view ? (
          isError ? (
            <ErrorState
              title={copy.error.title}
              description={copy.error.body}
              onRetry={onRetry}
            />
          ) : (
            <LoadingState label={isLoading ? copy.loading : undefined} />
          )
        ) : (
          <>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={view.scopeLabel}
              onPress={onOpenScope}
              className="flex-row items-center gap-1.5"
            >
              <Icon name="store" size={15} color={colors.textSecondary} />
              <VemtapText
                variant="caption"
                className="min-w-0 flex-1 font-sans-semibold"
                numberOfLines={1}
              >
                {view.scopeLabel}
              </VemtapText>
              <Icon name="expandMore" size={16} color={colors.textSecondary} />
            </Pressable>

            <View className="mt-2 flex-row items-center justify-between gap-2">
              <View className="min-w-0 flex-1">
                <VemtapText
                  variant="headingLg"
                  className="text-heading-lg"
                  numberOfLines={1}
                >
                  {copy.title}
                </VemtapText>
                <VemtapText variant="caption" tone="secondary" numberOfLines={2}>
                  {copy.subtitle}
                </VemtapText>
              </View>
              <BusinessStatusPill
                label={view.shiftOpen ? copy.liveBadge : copy.closedBadge}
                tone={view.shiftOpen ? 'success' : 'neutral'}
              />
            </View>

            <View className="mt-3 rounded-card bg-surface p-3 shadow-sm">
              <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                {copy.shiftSalesLabel}
              </VemtapText>
              <View className="mt-1 flex-row items-end justify-between gap-2">
                <VemtapText
                  variant="display"
                  className="font-sans-bold"
                  numberOfLines={1}
                >
                  {view.shiftSales}
                </VemtapText>
                <VemtapText
                  variant="micro"
                  tone="tertiary"
                  className="shrink-0"
                  numberOfLines={1}
                >
                  {view.shiftMeta}
                </VemtapText>
              </View>
              {view.mix.length ? (
                <View className="mt-2 flex-row flex-wrap gap-x-3 gap-y-1">
                  {view.mix.map(mix => (
                    <View key={mix.id} className="flex-row items-center gap-1.5">
                      <View
                        className={`h-2 w-2 rounded-full ${mixDot[mix.id] ?? 'bg-outline'}`}
                      />
                      <VemtapText variant="micro" tone="secondary" numberOfLines={1}>
                        {`${mix.label} (${mix.percent}%)`}
                      </VemtapText>
                    </View>
                  ))}
                </View>
              ) : null}
              {view.drawer.length ? (
                <View className="mt-3 gap-1.5 border-t border-border pt-2">
                  {view.drawer.map(row => (
                    <BusinessTotalsRow key={row.id} label={row.label} value={row.value} />
                  ))}
                </View>
              ) : null}
            </View>

            {view.held.length ? (
              <BusinessPanel
                className="mt-3"
                title={copy.heldTitle}
                icon="pauseCircle"
                badge={String(view.held.length)}
                badgeTone="warning"
              >
                <View className="gap-2">
                  {view.held.map(ticket => (
                    <View
                      key={ticket.id}
                      className="gap-1.5 rounded-field bg-surface-subtle p-2.5"
                    >
                      <View className="flex-row items-center justify-between gap-2">
                        <VemtapText
                          variant="labelMd"
                          className="min-w-0 flex-1 font-sans-semibold"
                          numberOfLines={1}
                        >
                          {ticket.label}
                        </VemtapText>
                        <VemtapText
                          variant="labelMd"
                          className="shrink-0 font-sans-bold"
                          numberOfLines={1}
                        >
                          {ticket.total}
                        </VemtapText>
                      </View>
                      <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
                        {ticket.meta}
                      </VemtapText>
                      <VemtapText variant="caption" tone="secondary" numberOfLines={2}>
                        {ticket.items}
                      </VemtapText>
                      <View className="flex-row gap-2">
                        <View className="min-w-0 flex-1">
                          <Button
                            label={copy.resumeCta}
                            size="sm"
                            labelVariant="labelSm"
                            onPress={() => onResumeTicket?.(ticket.id)}
                          />
                        </View>
                        <View className="min-w-0 flex-1">
                          <Button
                            label={copy.discardCta}
                            size="sm"
                            labelVariant="labelSm"
                            variant="secondary"
                            onPress={() => onDiscardTicket?.(ticket.id)}
                          />
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              </BusinessPanel>
            ) : null}

            <View className="mt-3 flex-row items-center justify-between gap-2">
              <VemtapText
                variant="labelMd"
                className="font-sans-semibold"
                numberOfLines={1}
              >
                {copy.feedTitle}
              </VemtapText>
              <BusinessStatusPill
                label={copy.feedBadge(view.rows.length)}
                tone="neutral"
              />
            </View>
            <View className="mt-2 gap-2.5">
              {view.rows.map(row => (
                <PosLedgerRow
                  key={row.id}
                  row={row}
                  onPress={() => onOpenDetails?.(row.id)}
                />
              ))}
            </View>
            {view.rows.length === 0 ? (
              <EmptyState
                icon="receiptLong"
                variant="contained"
                title={copy.empty.title}
                description={view.shiftOpen ? copy.empty.body : copy.empty.closedBody}
              />
            ) : null}
          </>
        )}
      </BusinessScreenLayout>

      <BottomSheet
        visible={closeVisible}
        onClose={() => setCloseVisible(false)}
        title={copy.closeSheetTitle}
      >
        <View className="gap-3">
          <VemtapText variant="bodyMd" tone="secondary">
            {copy.closeSheetBody}
          </VemtapText>
          <Input
            label={copy.countedLabel}
            keyboardType="numeric"
            value={counted}
            onChangeText={setCounted}
            placeholder={String(view?.expectedCash ?? 0)}
          />
          <Button
            label={copy.confirmCloseCta}
            onPress={() => {
              setCloseVisible(false);
              const amount = counted.trim()
                ? Number(counted.replace(/[^\d.]/g, ''))
                : undefined;
              onCloseShift?.(Number.isFinite(amount) ? amount : undefined);
            }}
          />
        </View>
      </BottomSheet>
    </>
  );
}

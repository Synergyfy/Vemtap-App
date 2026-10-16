import React from 'react';
import { View } from 'react-native';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { ErrorState } from '@components/shared/ErrorState';
import { LoadingState } from '@components/shared/LoadingState';
import {
  BusinessActionDock,
  BusinessScreenLayout,
} from '@features/business/components/BusinessPrimitives';
import { BusinessPanel } from '@features/business/components/BusinessOpsPrimitives';
import { CustomerDisplayTicketLines } from '@features/business/components/CustomerDisplayTicketLines';
import type { TotalsRow } from '@features/business/utils/posMappers';

const copy = strings.customerDisplayOrderTotal;

export interface CustomerDisplayTicketView {
  venue: string;
  tableLabel: string | null;
  lines: { id: string; label: string; value: string }[];
  totals: TotalsRow[];
  total: string;
}

export interface CustomerDisplayOrderTotalScreenProps {
  venue?: string;
  ticket?: CustomerDisplayTicketView | null;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  onPay?: () => void;
}

/** Customer-facing: the live ticket from the till and its total. */
export function CustomerDisplayOrderTotalScreen({
  venue,
  ticket,
  isLoading,
  isError,
  onRetry,
  onPay,
}: CustomerDisplayOrderTotalScreenProps) {
  return (
    <BusinessScreenLayout
      header={{ title: ticket?.venue || venue || copy.orderLabel }}
      contentContainerClassName="pb-8"
      footer={
        ticket ? (
          <BusinessActionDock>
            <Button
              label={copy.payCta}
              labelVariant="labelMd"
              onPress={onPay}
              leftIcon={<Icon name="payments" size={18} color={colors.surface} />}
            />
          </BusinessActionDock>
        ) : undefined
      }
    >
      {ticket === undefined ? (
        isError ? (
          <ErrorState
            title={copy.error.title}
            description={copy.error.body}
            onRetry={onRetry}
          />
        ) : (
          <LoadingState label={isLoading ? copy.loading : undefined} />
        )
      ) : ticket === null ? (
        <View className="items-center gap-2 py-16">
          <Icon name="storefront" size={40} color={colors.primary} />
          <VemtapText variant="headingLg" className="text-center text-heading-lg">
            {copy.welcomeTitle(venue ?? '')}
          </VemtapText>
          <VemtapText variant="bodyMd" tone="secondary" className="text-center">
            {copy.welcomeBody}
          </VemtapText>
        </View>
      ) : (
        <>
          <View className="items-center gap-1 rounded-card bg-primary p-5">
            <VemtapText
              variant="micro"
              className="font-sans-semibold uppercase tracking-wider text-surface"
            >
              {copy.orderLabel}
            </VemtapText>
            <VemtapText
              variant="display"
              className="font-sans-bold text-surface"
              numberOfLines={1}
            >
              {ticket.total}
            </VemtapText>
            {ticket.tableLabel ? (
              <VemtapText variant="caption" className="text-surface">
                {ticket.tableLabel}
              </VemtapText>
            ) : null}
          </View>
          <BusinessPanel className="mt-3" title={copy.itemsTitle} icon="list">
            <CustomerDisplayTicketLines lines={ticket.lines} totals={ticket.totals} />
          </BusinessPanel>
          <VemtapText variant="micro" tone="tertiary" className="mt-3 text-center">
            {copy.footerLegal}
          </VemtapText>
        </>
      )}
    </BusinessScreenLayout>
  );
}

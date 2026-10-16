import React from 'react';
import { ScrollView, View } from 'react-native';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { BottomSheet } from '@components/shared/BottomSheet';
import { ErrorState } from '@components/shared/ErrorState';
import { LoadingState } from '@components/shared/LoadingState';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { BusinessAnalyticsRow } from '@features/business/components/BusinessAnalyticsPrimitives';

const copy = strings.boostWizard.wallet.live.invoices;

export interface WalletInvoiceRow {
  id: string;
  invoiceNo: string;
  title: string;
  meta: string;
  amount: string;
  status: string;
}

export interface WalletInvoicesSheetProps {
  visible: boolean;
  onClose: () => void;
  invoices: readonly WalletInvoiceRow[];
  isLoading?: boolean;
  error?: string;
  onRetry?: () => void;
  hasMore?: boolean;
  onLoadMore?: () => void;
  /** Share one invoice (as text). */
  onShare: (id: string) => void;
  /** Export every invoice as a CSV. */
  onExport: () => void;
  exportPending?: boolean;
}

/**
 * Tax Invoices from the Boost Wallet: one per boost or campaign launch, each
 * shareable, all exportable. No VAT is charged, so there is no tax panel.
 */
export function WalletInvoicesSheet({
  visible,
  onClose,
  invoices,
  isLoading = false,
  error,
  onRetry,
  hasMore = false,
  onLoadMore,
  onShare,
  onExport,
  exportPending = false,
}: WalletInvoicesSheetProps) {
  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={copy.title}
      titleVariant="headingXl"
      titleClassName="text-heading-xl"
    >
      <ScrollView className="flex-shrink">
        <View className="gap-3 pb-2">
          <VemtapText variant="bodyMd" tone="secondary">
            {copy.intro}
          </VemtapText>
          {isLoading ? <LoadingState /> : null}
          {!isLoading && error ? (
            <ErrorState description={error} onRetry={onRetry} />
          ) : null}
          {!isLoading && !error && invoices.length === 0 ? (
            <VemtapText variant="caption" tone="tertiary">
              {copy.empty}
            </VemtapText>
          ) : null}
          {invoices.map(invoice => (
            <BusinessAnalyticsRow
              key={invoice.id}
              title={invoice.title}
              subtitle={invoice.meta}
              icon="receiptLong"
              trailing={invoice.amount}
              badge={invoice.status}
              onPress={() => onShare(invoice.id)}
            />
          ))}
          {hasMore ? (
            <Button
              label={copy.loadMore}
              labelVariant="labelMd"
              variant="secondary"
              size="md"
              onPress={onLoadMore}
            />
          ) : null}
          {invoices.length > 0 ? (
            <Button
              label={copy.exportAll}
              labelVariant="labelMd"
              leftIcon={<Icon name="download" size={16} color={colors.surface} />}
              loading={exportPending}
              disabled={exportPending}
              onPress={onExport}
            />
          ) : null}
        </View>
      </ScrollView>
    </BottomSheet>
  );
}

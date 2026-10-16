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
  BusinessStatusPill,
} from '@features/business/components/BusinessPrimitives';
import { BusinessPanel } from '@features/business/components/BusinessOpsPrimitives';
import {
  BusinessGrandTotalRow,
  BusinessTotalsRow,
} from '@features/business/components/BusinessPosPrimitives';

const copy = strings.publicPosOrderTracking;

export interface OrderTrackingView {
  headline: string;
  body: string;
  readyBy: string;
  cancelled: boolean;
  steps: { status: string; label: string; at: string; reached: boolean }[];
  reference: string;
  tableLabel: string | null;
  server: string | null;
  lines: { id: string; label: string; value: string }[];
  total: string;
}

export interface PublicPosOrderTrackingScreenProps {
  view?: OrderTrackingView;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  onBack?: () => void;
  onReopenMenu?: () => void;
}

/** Guest order tracking: live preparation steps, the order and the total to pay. */
export function PublicPosOrderTrackingScreen({
  view,
  isLoading,
  isError,
  onRetry,
  onBack,
  onReopenMenu,
}: PublicPosOrderTrackingScreenProps) {
  return (
    <BusinessScreenLayout
      header={{ title: copy.headerTitle, onBack }}
      contentContainerClassName="pb-8"
      footer={
        view ? (
          <BusinessActionDock>
            <Button
              label={copy.addItemsCta}
              labelVariant="labelSm"
              variant="secondary"
              onPress={onReopenMenu}
            />
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
          <View className="items-center gap-2">
            <Icon
              name={view.cancelled ? 'close' : 'checkCircle'}
              size={44}
              color={view.cancelled ? colors.error : colors.badgeDiscountText}
            />
            <VemtapText variant="headingLg" className="text-center text-heading-lg">
              {view.headline}
            </VemtapText>
            <VemtapText variant="bodyMd" tone="secondary" className="text-center">
              {view.body}
            </VemtapText>
            {!view.cancelled ? (
              <BusinessStatusPill label={view.readyBy} tone="brand" icon="schedule" />
            ) : null}
          </View>

          <BusinessPanel
            className="mt-3"
            title={copy.timelineTitle}
            icon="timeline"
            badge={copy.timelineBadge}
            badgeTone="success"
          >
            <View className="gap-2.5">
              {view.steps.map(step => (
                <View key={step.status} className="flex-row items-center gap-2.5">
                  <View
                    className={`h-6 w-6 items-center justify-center rounded-full ${step.reached ? 'bg-primary' : 'bg-surface-container'}`}
                  >
                    {step.reached ? (
                      <Icon name="check" size={14} color={colors.surface} />
                    ) : null}
                  </View>
                  <VemtapText
                    variant="labelSm"
                    className={`min-w-0 flex-1 font-sans-semibold ${step.reached ? '' : 'text-text-tertiary'}`}
                    numberOfLines={1}
                  >
                    {step.label}
                  </VemtapText>
                  <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
                    {step.at}
                  </VemtapText>
                </View>
              ))}
            </View>
          </BusinessPanel>

          <BusinessPanel className="mt-3" title={copy.summaryTitle} icon="receiptLong">
            <VemtapText variant="micro" tone="tertiary">
              {[view.reference, view.tableLabel, view.server].filter(Boolean).join(' • ')}
            </VemtapText>
            <View className="gap-1.5">
              {view.lines.map(line => (
                <BusinessTotalsRow key={line.id} label={line.label} value={line.value} />
              ))}
            </View>
            <BusinessGrandTotalRow label={copy.totalLabel} value={view.total} />
            <VemtapText variant="micro" tone="tertiary">
              {copy.totalNote}
            </VemtapText>
          </BusinessPanel>

          <VemtapText variant="micro" tone="tertiary" className="mt-3 text-center">
            {copy.footNote}
          </VemtapText>
        </>
      )}
    </BusinessScreenLayout>
  );
}

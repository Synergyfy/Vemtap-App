import React from 'react';
import { View } from 'react-native';
import { Button } from '@components/ui/Button';
import { Icon, type IconName } from '@components/ui/Icon';
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

const copy = strings.customerDisplayTapQrPay;

export interface CustomerDisplayPayView {
  total: string | null;
  tableLabel: string | null;
  methods: { id: 'cash' | 'card' | 'transfer' | 'oneTap'; enabled: boolean }[];
  transfer: { bankName: string; accountNumber: string; accountName: string } | null;
}

export interface CustomerDisplayTapQrPayScreenProps {
  view: CustomerDisplayPayView;
  onBack?: () => void;
}

const methodIcon: Record<CustomerDisplayPayView['methods'][number]['id'], IconName> = {
  cash: 'payments',
  card: 'contactless',
  transfer: 'accountBalance',
  oneTap: 'bolt',
};

/** Customer-facing payment: the amount due and every way to pay here. */
export function CustomerDisplayTapQrPayScreen({
  view,
  onBack,
}: CustomerDisplayTapQrPayScreenProps) {
  return (
    <BusinessScreenLayout
      header={{ title: copy.headerTitle, onBack }}
      contentContainerClassName="pb-8"
      footer={
        <BusinessActionDock>
          <Button
            label={copy.backCta}
            labelVariant="labelSm"
            variant="secondary"
            onPress={onBack}
          />
        </BusinessActionDock>
      }
    >
      {!view.total ? (
        <EmptyState
          icon="payments"
          title={copy.empty.title}
          description={copy.empty.body}
        />
      ) : (
        <>
          <View className="items-center gap-1 rounded-card bg-primary p-5">
            <VemtapText
              variant="micro"
              className="font-sans-semibold uppercase tracking-wider text-surface"
            >
              {copy.totalDueLabel}
            </VemtapText>
            <VemtapText
              variant="display"
              className="font-sans-bold text-surface"
              numberOfLines={1}
            >
              {view.total}
            </VemtapText>
            {view.tableLabel ? (
              <VemtapText variant="caption" className="text-surface">
                {view.tableLabel}
              </VemtapText>
            ) : null}
          </View>

          {view.transfer ? (
            <BusinessPanel
              className="mt-3"
              title={copy.transferTitle}
              icon="accountBalance"
            >
              <VemtapText variant="caption" tone="secondary">
                {view.transfer.bankName}
              </VemtapText>
              <VemtapText
                variant="headingLg"
                className="font-sans-bold tracking-widest"
                numberOfLines={1}
              >
                {view.transfer.accountNumber}
              </VemtapText>
              <VemtapText variant="caption" tone="secondary">
                {view.transfer.accountName}
              </VemtapText>
            </BusinessPanel>
          ) : null}

          <BusinessPanel className="mt-3" title={copy.methodsTitle} icon="creditCard">
            <View className="gap-2">
              {view.methods
                .filter(method => method.enabled)
                .map(method => (
                  <View
                    key={method.id}
                    className="flex-row items-center gap-2.5 rounded-field bg-surface-subtle p-2.5"
                  >
                    <BusinessIconWell
                      icon={methodIcon[method.id]}
                      tone="brand"
                      size="sm"
                    />
                    <VemtapText
                      variant="labelSm"
                      className="min-w-0 flex-1 font-sans-semibold"
                      numberOfLines={1}
                    >
                      {copy.methods[method.id]}
                    </VemtapText>
                  </View>
                ))}
            </View>
          </BusinessPanel>

          <View className="mt-3 flex-row items-start gap-2">
            <Icon name="info" size={14} color={colors.textTertiary} />
            <VemtapText variant="micro" tone="tertiary" className="min-w-0 flex-1">
              {copy.staffNote}
            </VemtapText>
          </View>
        </>
      )}
    </BusinessScreenLayout>
  );
}

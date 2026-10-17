import React from 'react';
import { View } from 'react-native';
import { BottomSheet } from '@components/shared/BottomSheet';
import { Button } from '@components/ui/Button';
import { VemtapText } from '@components/ui/Text';
import { vemtapAddOnsCopy as copy } from '@features/business/verificationCopy';
import type { CreditPlan } from '@api/creditPlansApi';
import type { CreditChannel } from '@features/business/hooks/useCreditPlans';
import { formatCurrency } from '@utils/formatters';

export interface CreditBundleSheetProps {
  channel: CreditChannel | null;
  plans: CreditPlan[];
  /** The plan being paid for, if any. */
  buyingId?: string | null;
  onBuy: (plan: CreditPlan) => void;
  onClose: () => void;
}

/** The credit bundles on sale for one channel, each with its own Buy button. */
export function CreditBundleSheet({
  channel,
  plans,
  buyingId,
  onBuy,
  onClose,
}: CreditBundleSheetProps) {
  return (
    <BottomSheet
      visible={channel !== null}
      onClose={onClose}
      title={channel ? copy.pickBundleTitle(channel) : ''}
      titleVariant="headingSm"
    >
      <View className="gap-3 pb-2">
        {plans.map(plan => {
          const count = (
            channel === 'sms' ? plan.smsAmount : plan.aiAmount
          ).toLocaleString('en-NG');
          return (
            <View
              key={plan.id}
              className="flex-row items-center justify-between gap-3 rounded-card bg-surface-container-low p-4"
            >
              <View className="min-w-0 flex-1">
                <VemtapText
                  variant="labelMd"
                  className="font-sans-semibold"
                  numberOfLines={1}
                >
                  {plan.name}
                </VemtapText>
                <VemtapText variant="caption" tone="secondary">
                  {copy.bundleLine(count, channel === 'sms' ? copy.smsUnit : copy.aiUnit)}
                </VemtapText>
              </View>
              <Button
                label={`${copy.buy} ${formatCurrency(plan.price, plan.currency ?? 'NGN')}`}
                size="sm"
                fullWidth={false}
                labelVariant="labelSm"
                loading={buyingId === plan.id}
                disabled={Boolean(buyingId)}
                onPress={() => onBuy(plan)}
              />
            </View>
          );
        })}
      </View>
    </BottomSheet>
  );
}

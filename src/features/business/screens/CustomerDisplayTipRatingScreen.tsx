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
import { BusinessTotalsRow } from '@features/business/components/BusinessPosPrimitives';
import { naira } from '@features/business/utils/posMappers';

const copy = strings.customerDisplayTipRating;

export interface CustomerDisplayTipRatingScreenProps {
  billTotal: number | null;
  tipPercents?: number[];
  isSubmitting?: boolean;
  done?: boolean;
  onSubmit?: (feedback: { rating?: number; tipAmount: number }) => void;
  onSkip?: () => void;
  onFinish?: () => void;
}

/** Customer-facing after payment: star rating and an optional tip on the bill. */
export function CustomerDisplayTipRatingScreen({
  billTotal,
  tipPercents = [0, 5, 10, 15],
  isSubmitting,
  done,
  onSubmit,
  onSkip,
  onFinish,
}: CustomerDisplayTipRatingScreenProps) {
  const [rating, setRating] = useState(0);
  const [percent, setPercent] = useState(0);
  const tip = billTotal ? Math.round((billTotal * percent) / 100) : 0;

  if (done) {
    return (
      <BusinessScreenLayout
        header={{ title: copy.headerTitle }}
        contentContainerClassName="pb-8"
      >
        <View className="items-center gap-2 py-16">
          <Icon name="checkCircle" size={44} color={colors.badgeDiscountText} />
          <VemtapText variant="headingLg" className="text-center text-heading-lg">
            {copy.doneTitle}
          </VemtapText>
          <VemtapText variant="bodyMd" tone="secondary" className="text-center">
            {copy.doneBody}
          </VemtapText>
          <Button label={copy.doneCta} onPress={onFinish} fullWidth={false} />
        </View>
      </BusinessScreenLayout>
    );
  }

  return (
    <BusinessScreenLayout
      header={{ title: copy.headerTitle }}
      contentContainerClassName="pb-8"
      footer={
        <BusinessActionDock>
          <Button
            label={copy.submitCta}
            labelVariant="labelMd"
            disabled={!rating && !tip}
            loading={isSubmitting}
            onPress={() => onSubmit?.({ rating: rating || undefined, tipAmount: tip })}
          />
          <Button
            label={copy.ratingSkipCta}
            labelVariant="labelSm"
            variant="secondary"
            onPress={onSkip}
          />
        </BusinessActionDock>
      }
    >
      <View className="items-center gap-2">
        <VemtapText variant="headingLg" className="text-center text-heading-lg">
          {copy.thanksTitle}
        </VemtapText>
        <VemtapText variant="caption" tone="secondary" className="text-center">
          {copy.ratingBody}
        </VemtapText>
        <View className="mt-2 flex-row gap-2">
          {[1, 2, 3, 4, 5].map(star => (
            <Pressable
              key={star}
              accessibilityRole="button"
              accessibilityLabel={copy.starLabel(star)}
              accessibilityState={{ selected: rating >= star }}
              onPress={() => setRating(star)}
              className="h-12 w-12 items-center justify-center"
            >
              <Icon
                name={rating >= star ? 'starFilled' : 'star'}
                size={34}
                color={colors.primary}
              />
            </Pressable>
          ))}
        </View>
      </View>

      {billTotal ? (
        <BusinessPanel className="mt-4" title={copy.tipTitle} icon="favorite">
          <VemtapText variant="caption" tone="secondary">
            {copy.tipBody}
          </VemtapText>
          <View className="flex-row gap-2">
            {tipPercents.map(option => (
              <Pressable
                key={option}
                accessibilityRole="button"
                accessibilityState={{ selected: percent === option }}
                accessibilityLabel={option ? `${option}%` : copy.noTip}
                onPress={() => setPercent(option)}
                className={`min-h-12 flex-1 items-center justify-center rounded-field ${percent === option ? 'bg-primary' : 'bg-surface-container'}`}
              >
                <VemtapText
                  variant="labelMd"
                  className={`font-sans-semibold ${percent === option ? 'text-surface' : ''}`}
                >
                  {option ? `${option}%` : copy.noTip}
                </VemtapText>
                {option ? (
                  <VemtapText
                    variant="micro"
                    className={percent === option ? 'text-surface' : 'text-text-tertiary'}
                  >
                    {naira(Math.round((billTotal * option) / 100))}
                  </VemtapText>
                ) : null}
              </Pressable>
            ))}
          </View>
          <BusinessTotalsRow label={copy.totalLabel} value={naira(billTotal)} />
          <BusinessTotalsRow
            label={copy.tipLabel}
            value={naira(tip)}
            hint={copy.tipIncluded}
          />
        </BusinessPanel>
      ) : null}
    </BusinessScreenLayout>
  );
}

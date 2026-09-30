import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { Input } from '@components/ui/Input';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { BusinessScreenLayout } from '@features/business/components/BusinessPrimitives';
import { BusinessPanel } from '@features/business/components/BusinessOpsPrimitives';
import {
  BusinessGrandTotalRow,
  BusinessOptionGrid,
  BusinessRatingStars,
  BusinessTotalsRow,
} from '@features/business/components/BusinessPosPrimitives';
import {
  displayOrder,
  ratingScale,
  tipPresets,
  tipTotal,
} from '@features/business/data/businessAnalyticsData';

const copy = strings.customerDisplayTipRating;

export interface CustomerDisplayTipRatingScreenProps {
  onBack?: () => void;
  onSubmitRating?: (rating: number) => void;
  onSubmitTip?: (tipId: string) => void;
  onFinish?: () => void;
  onSkip?: () => void;
}

/**
 * Post-visit feedback in two steps: star rating with an optional comment, then
 * a tip picker. Both steps live on one screen so the guest never loses context
 * between them.
 */
export function CustomerDisplayTipRatingScreen({
  onBack,
  onSubmitRating,
  onSubmitTip,
  onFinish,
  onSkip,
}: CustomerDisplayTipRatingScreenProps) {
  const [rating, setRating] = useState(0);
  const [tip, setTip] = useState<string>('ten');
  const [step, setStep] = useState<'rate' | 'tip' | 'done'>('rate');

  const submitRating = () => {
    if (rating > 0) onSubmitRating?.(rating);
    setStep('tip');
  };

  return (
    <BusinessScreenLayout
      header={{ title: copy.headerTitle, onBack }}
      contentContainerClassName="pb-8"
      footer={
        step === 'rate' ? (
          <View className="gap-2">
            <Button
              label={copy.ratingSubmitCta}
              labelVariant="labelMd"
              onPress={submitRating}
              disabled={rating === 0}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={copy.ratingSkipCta}
              onPress={onSkip}
              className="min-h-10 flex-row items-center justify-center"
            >
              <VemtapText
                variant="labelSm"
                className="font-sans-semibold text-primary"
                numberOfLines={1}
              >
                {copy.ratingSkipCta}
              </VemtapText>
            </Pressable>
          </View>
        ) : step === 'tip' ? (
          <Button
            label={copy.tipSubmitCta}
            labelVariant="labelMd"
            onPress={() => {
              onSubmitTip?.(tip);
              setStep('done');
            }}
            leftIcon={<Icon name="payments" size={18} color={colors.surface} />}
          />
        ) : (
          <Button label={copy.doneCta} labelVariant="labelMd" onPress={onFinish} />
        )
      }
    >
      <View className="flex-row items-center justify-between gap-2">
        <View className="rounded-full bg-surface-container px-3 py-1.5">
          <VemtapText variant="labelSm" className="font-sans-semibold" numberOfLines={1}>
            {`${copy.tableLabel} ${displayOrder.table}`}
          </VemtapText>
        </View>
        <View className="h-2 w-2 shrink-0 rounded-full bg-badge-discount-text" />
      </View>

      {step === 'rate' ? (
        <>
          <View className="mt-3 gap-1">
            <VemtapText variant="headingLg" className="text-heading-lg" numberOfLines={2}>
              {copy.thanksTitle}
            </VemtapText>
            <VemtapText variant="bodyMd" tone="secondary" numberOfLines={2}>
              {copy.ratingBody}
            </VemtapText>
          </View>

          <BusinessPanel className="mt-3" icon="rateReview">
            <VemtapText
              variant="labelMd"
              className="font-sans-semibold"
              numberOfLines={1}
            >
              {copy.ratingLabel}
            </VemtapText>
            <View className="items-center py-2">
              <BusinessRatingStars
                rating={rating}
                size={36}
                onRate={setRating}
                accessibilityLabel={copy.ratingLabel}
              />
            </View>
            <View className="flex-row items-center justify-between gap-1.5">
              {ratingScale.map(scale => {
                const active = scale.value === rating;
                return (
                  <View key={scale.value} className="flex-1 items-center gap-1">
                    <Icon
                      name={scale.icon}
                      size={20}
                      color={active ? colors.tertiary : colors.outline}
                    />
                    <VemtapText
                      variant="micro"
                      className={
                        active ? 'font-sans-semibold text-text' : 'text-text-tertiary'
                      }
                      numberOfLines={1}
                    >
                      {scale.title}
                    </VemtapText>
                  </View>
                );
              })}
            </View>
          </BusinessPanel>

          <BusinessPanel className="mt-3" icon="comment">
            <VemtapText
              variant="labelMd"
              className="font-sans-semibold"
              numberOfLines={2}
            >
              {copy.commentLabel}
            </VemtapText>
            <Input
              multiline
              placeholder={copy.commentPlaceholder}
              accessibilityLabel={copy.commentLabel}
              containerClassName="mt-2"
              fieldClassName="min-h-[84px] items-start bg-surface-subtle"
            />
          </BusinessPanel>
        </>
      ) : step === 'tip' ? (
        <>
          <View className="mt-3 gap-1">
            <VemtapText variant="headingLg" className="text-heading-lg" numberOfLines={1}>
              {copy.tipTitle}
            </VemtapText>
            <VemtapText variant="bodyMd" tone="secondary" numberOfLines={2}>
              {copy.tipBody}
            </VemtapText>
          </View>

          <BusinessPanel className="mt-3" icon="wallet">
            <BusinessOptionGrid
              options={tipPresets}
              value={tip}
              onChange={setTip}
              columns={3}
              accessibilityLabel={copy.tipTitle}
            />
            <View className="mt-3 gap-1.5 border-t border-border pt-3">
              <BusinessTotalsRow
                label={copy.totalLabel}
                value={displayOrder.grandTotal}
              />
              <BusinessTotalsRow
                label={copy.tipLabel}
                value={tipTotal[tip] ?? displayOrder.grandTotal}
                tone="discount"
                badge={copy.tipIncluded}
              />
              <BusinessGrandTotalRow
                label={copy.grandLabel}
                value={tipTotal[tip] ?? displayOrder.grandTotal}
              />
            </View>
          </BusinessPanel>
        </>
      ) : (
        <BusinessPanel className="mt-6" icon="autoAwesome" title={copy.doneTitle}>
          <VemtapText variant="bodyMd" tone="secondary" numberOfLines={3}>
            {copy.doneBody}
          </VemtapText>
          <View className="mt-3 items-center gap-1.5">
            <Icon name="checkCircle" size={30} color={colors.badgeDiscountText} />
            <VemtapText
              variant="labelMd"
              className="font-sans-semibold"
              numberOfLines={1}
            >
              {displayOrder.grandTotal}
            </VemtapText>
          </View>
        </BusinessPanel>
      )}
    </BusinessScreenLayout>
  );
}

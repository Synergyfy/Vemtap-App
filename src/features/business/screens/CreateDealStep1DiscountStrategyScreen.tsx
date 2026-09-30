import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';
import { strings } from '@constants/strings';
import {
  BusinessCollapsibleCard,
  BusinessInlineAction,
  BusinessNumberInput,
  BusinessRange,
  BusinessScreenLayout,
  BusinessSectionHeading,
  BusinessSelectionChip,
} from '@features/business/components/BusinessPrimitives';
import {
  HorizontallyScrollableRow,
  SetupCallout,
  SetupStepBar,
} from '@features/business/components/BusinessSetupPrimitives';
import { ProductStatusSnapshot } from '@features/business/components/BusinessProductContent';
import { ServiceFlowFooter } from '@features/business/components/ServiceFlowPrimitives';
import {
  businessMedia,
  formatNaira,
  productIdentity,
} from '@features/business/data/businessSetupData';
import { cn } from '@utils/cn';

const copy = strings.businessCreateDeal.step1;
const CATALOG_BASE_PRICE = 12000;
const RATE_MINIMUM = 5;
const RATE_MAXIMUM = 60;
const RATE_STEP = 5;

export type CreateDealStrategyId = 'percentage' | 'fixed' | 'combo' | 'tiered';

export type CreateDealDiscountValue = {
  strategy: CreateDealStrategyId;
  discountRate: number;
  memberPrice: number;
  savings: number;
};

export interface CreateDealStep1DiscountStrategyScreenProps {
  onBack: () => void;
  onContinue?: (value: CreateDealDiscountValue) => void;
  onSave?: (value: CreateDealDiscountValue) => void;
  onChangeItem?: () => void;
}

export function CreateDealStep1DiscountStrategyScreen({
  onBack,
  onContinue,
  onSave,
  onChangeItem,
}: CreateDealStep1DiscountStrategyScreenProps) {
  const [strategy, setStrategy] = useState<CreateDealStrategyId>('percentage');
  const [discountRate, setDiscountRate] = useState(20);

  const value = useMemo<CreateDealDiscountValue>(() => {
    const memberPrice = Math.round(CATALOG_BASE_PRICE * (1 - discountRate / 100));
    return {
      strategy,
      discountRate,
      memberPrice,
      savings: CATALOG_BASE_PRICE - memberPrice,
    };
  }, [discountRate, strategy]);

  return (
    <BusinessScreenLayout
      header={{
        eyebrow: copy.eyebrow,
        title: copy.headerTitle,
        onBack,
        actionLabel: 'Save',
        onAction: () => onSave?.(value),
      }}
      contentContainerClassName="pb-8"
      footer={
        <ServiceFlowFooter
          primaryLabel={copy.continueLabel}
          onPrimary={() => onContinue?.(value)}
          secondaryLabel={copy.backLabel}
          onSecondary={onBack}
          footnote={<LaunchFootnote text={copy.footnote} />}
        />
      }
    >
      <SetupStepBar
        step={copy.stepLabel}
        percent={copy.percentLabel}
        progress={25}
        stepStyle="plain"
        stepMarker="number"
        stepNumber={1}
      />

      <View className="mt-3">
        <ProductStatusSnapshot
          image={businessMedia.ribeyeThumbnailOne}
          imageAlt="Woodfire grilled ribeye steak plated with rosemary potatoes"
          imageBadge="POS Live"
          className="gap-2 p-3"
          name={productIdentity.name}
          statusLabel={copy.syncedLabel}
          statusVariant="eyebrow"
          catalogId={copy.branchesPill}
          price={
            <View className="mt-1 flex-row flex-wrap items-baseline gap-1.5">
              <VemtapText variant="caption" tone="secondary">
                {copy.catalogBase}
              </VemtapText>
              <VemtapText variant="labelMd" className="font-sans-bold">
                {formatNaira(CATALOG_BASE_PRICE)}
              </VemtapText>
              <VemtapText variant="caption" tone="tertiary">
                {copy.catalogUnit}
              </VemtapText>
            </View>
          }
          footer={
            <View className="-mx-3 -mb-3 mt-1 flex-row items-center justify-between gap-3 bg-surface-subtle px-3 py-1.5">
              <View className="min-w-0 min-w-0 flex-1 flex-row items-center gap-1">
                <Icon name="storefront" size={15} color={colors.primary} />
                <VemtapText variant="caption" numberOfLines={1}>
                  {copy.itemLocation}
                </VemtapText>
              </View>
              <BusinessInlineAction
                label={copy.changeItem}
                icon="tune"
                onPress={onChangeItem}
              />
            </View>
          }
        />
      </View>

      <View className="mt-6">
        <BusinessSectionHeading
          title={copy.strategyTitle}
          subtitle={copy.strategyBody}
          icon="localOffer"
        />
      </View>

      <View className="mt-4 gap-2">
        {copy.strategies.map(option => {
          const selected = option.id === strategy;
          return (
            <BusinessCollapsibleCard
              key={option.id}
              title={option.title}
              subtitle={option.description}
              badge={option.badge}
              icon={option.icon}
              expanded={selected}
              selected={selected}
              onToggle={() => setStrategy(option.id)}
            >
              {option.id === 'percentage' ? (
                <View className="gap-4">
                  <View className="gap-2">
                    <VemtapText variant="labelSm" tone="secondary">
                      {copy.presetsLabel}
                    </VemtapText>
                    <HorizontallyScrollableRow>
                      {copy.presets.map(preset => {
                        const presetValue = Number(preset.replace(/[^0-9]/g, ''));
                        return (
                          <BusinessSelectionChip
                            key={preset}
                            label={preset}
                            selected={presetValue === discountRate}
                            onPress={() => setDiscountRate(presetValue)}
                          />
                        );
                      })}
                    </HorizontallyScrollableRow>
                  </View>

                  <View className="gap-1 rounded-xl bg-surface-subtle p-3">
                    <View className="flex-row items-center justify-between gap-3">
                      <VemtapText variant="labelSm" className="font-sans-semibold">
                        {copy.customRate}
                      </VemtapText>
                      <BusinessNumberInput
                        compact
                        value={String(discountRate)}
                        onChangeText={text => {
                          const parsed = Number(text.replace(/[^0-9]/g, ''));
                          if (!Number.isNaN(parsed) && text.length > 0) {
                            setDiscountRate(
                              Math.max(RATE_MINIMUM, Math.min(RATE_MAXIMUM, parsed)),
                            );
                          }
                        }}
                        accessibilityLabel={copy.customRate}
                        trailingText="%"
                      />
                    </View>
                    <BusinessRange
                      value={discountRate}
                      minimum={RATE_MINIMUM}
                      maximum={RATE_MAXIMUM}
                      step={RATE_STEP}
                      onChange={setDiscountRate}
                      accessibilityLabel={copy.customRate}
                    />
                    <View className="flex-row items-center justify-between gap-2">
                      <VemtapText variant="caption" tone="tertiary">
                        {copy.scaleLow}
                      </VemtapText>
                      <VemtapText variant="caption" tone="tertiary">
                        {copy.scaleMid}
                      </VemtapText>
                      <VemtapText variant="caption" tone="tertiary">
                        {copy.scaleHigh}
                      </VemtapText>
                    </View>
                  </View>

                  <PricingMath discountRate={discountRate} />
                </View>
              ) : null}
            </BusinessCollapsibleCard>
          );
        })}
      </View>

      <View className="mt-4">
        <SetupCallout
          icon="insights"
          title={copy.tipTitle}
          body={copy.tipBody}
          tone="tint"
          iconSurface="circleMd"
          className="p-3"
        />
      </View>
    </BusinessScreenLayout>
  );
}

function PricingMath({ discountRate }: { discountRate: number }) {
  const savings = Math.round((CATALOG_BASE_PRICE * discountRate) / 100);
  const dealPrice = CATALOG_BASE_PRICE - savings;

  return (
    <View className="gap-2 rounded-xl bg-surface-container-high p-4">
      <View className="flex-row items-center justify-between gap-2">
        <VemtapText
          variant="labelSm"
          tone="secondary"
          className="font-sans-semibold uppercase"
        >
          {copy.mathTitle}
        </VemtapText>
        <View className="flex-row items-center gap-1 rounded-full bg-badge-discount-bg px-2 py-0.5">
          <Icon name="bolt" size={13} color={colors.badgeDiscountText} />
          <VemtapText
            variant="caption"
            className="font-sans-semibold text-badge-discount-text"
          >
            {copy.instantPreview}
          </VemtapText>
        </View>
      </View>

      <View className="gap-2 pt-1">
        <View className="flex-row items-center justify-between gap-3">
          <VemtapText
            variant="bodyMd"
            tone="secondary"
            className="min-w-0 min-w-0 flex-1"
          >
            {copy.regularPrice}
          </VemtapText>
          <VemtapText variant="labelMd" tone="tertiary" className="shrink-0 line-through">
            {formatNaira(CATALOG_BASE_PRICE)}
          </VemtapText>
        </View>

        <View className="flex-row items-center justify-between gap-3">
          <View className="min-w-0 min-w-0 flex-1 flex-row items-center gap-1">
            <VemtapText variant="labelMd" className="font-sans-semibold">
              {copy.memberPrice}
            </VemtapText>
            <Icon name="info" size={16} color={colors.textTertiary} />
          </View>
          <VemtapText
            variant="headingSm"
            className="shrink-0 font-sans-bold text-primary"
          >
            {formatNaira(dealPrice)}
          </VemtapText>
        </View>

        <View className="flex-row items-center justify-between gap-3">
          <VemtapText
            variant="bodyMd"
            className="min-w-0 min-w-0 flex-1 text-badge-discount-text"
          >
            {copy.netSavings}
          </VemtapText>
          <VemtapText
            variant="labelMd"
            className="shrink-0 font-sans-semibold text-badge-discount-text"
          >
            {`${formatNaira(savings)} (${discountRate}% OFF)`}
          </VemtapText>
        </View>

        <View className="mt-2 flex-row items-center justify-between gap-3 rounded-lg bg-surface-canvas p-2.5 shadow-sm">
          <View className="min-w-0 min-w-0 flex-1">
            <VemtapText variant="labelSm" className="font-sans-bold">
              {copy.merchantTakeHome}
            </VemtapText>
            <VemtapText variant="caption" tone="secondary">
              {copy.takeHomeNote}
            </VemtapText>
          </View>
          <VemtapText variant="headingSm" className="shrink-0 font-sans-bold">
            {formatNaira(dealPrice)}
          </VemtapText>
        </View>
      </View>
    </View>
  );
}

function LaunchFootnote({ text }: { text: string }) {
  return (
    <View className="mt-1 flex-row items-center justify-center gap-1.5">
      <Icon name="shield" size={14} color={colors.textTertiary} />
      <VemtapText variant="caption" tone="tertiary" className={cn('flex-1 text-center')}>
        {text}
      </VemtapText>
    </View>
  );
}

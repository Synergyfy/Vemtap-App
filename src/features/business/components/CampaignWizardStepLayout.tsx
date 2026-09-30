import React, { type ReactNode } from 'react';
import { View } from 'react-native';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import {
  BusinessActionDock,
  BusinessScreenLayout,
} from '@features/business/components/BusinessPrimitives';
import { TextActionButton } from '@features/business/components/BusinessSetupPrimitives';

const copy = strings.campaignWizard;

export interface CampaignWizardStepLayoutProps {
  /** 1-based position in the six-step create-campaign flow. */
  step: number;
  title: string;
  hero: string;
  heroBody?: string;
  onBack: () => void;
  onNext: () => void;
  nextLabel: string;
  backLabel?: string;
  draftLabel?: string;
  onSaveDraft?: () => void;
  loading?: boolean;
  disabled?: boolean;
  /** Rendered under the step tracker (budget summaries, notes, etc). */
  trackerExtra?: ReactNode;
  footerExtra?: ReactNode;
  children: ReactNode;
}

/**
 * Shared chrome for all six Create Campaign steps: app bar, the six-stage
 * tracker and the sticky CTA deck. Extracted so the flow can never disagree on
 * its own step indicator, hero tier or footer treatment.
 *
 * Hero tier is `headingLg` for every step — the specs alternate between
 * `heading-lg` and `heading-md`, and AGENTS rule 8 forbids the same page title
 * wearing two tokens across a flow. The wizard is a dense, compact business
 * flow, so it takes the `headingLg` tier.
 */
export function CampaignWizardStepLayout({
  step,
  title,
  hero,
  heroBody,
  onBack,
  onNext,
  nextLabel,
  backLabel,
  draftLabel,
  onSaveDraft,
  loading = false,
  disabled = false,
  trackerExtra,
  footerExtra,
  children,
}: CampaignWizardStepLayoutProps) {
  const percent = Math.round((step / copy.stageLabels.length) * 100);

  return (
    <BusinessScreenLayout
      header={{
        title,
        subtitle: copy.headerSubtitle,
        onBack,
        titleVariant: 'headingSm',
        showAvatar: true,
      }}
      contentContainerClassName="gap-4 pb-6"
      footer={
        <BusinessActionDock>
          <Button
            label={nextLabel}
            labelVariant="button"
            size="md"
            loading={loading}
            disabled={disabled}
            accessibilityLabel={nextLabel}
            className="min-h-[52px] rounded-2xl"
            leftIcon={<Icon name="arrowForward" size={18} color={colors.surface} />}
            onPress={onNext}
          />
          {backLabel || draftLabel ? (
            <View className="flex-row items-center justify-between gap-2">
              {backLabel ? (
                <TextActionButton
                  label={backLabel}
                  icon="back"
                  tone="secondary"
                  onPress={onBack}
                />
              ) : (
                <View />
              )}
              {draftLabel ? (
                <TextActionButton
                  label={draftLabel}
                  icon="save"
                  tone="brand"
                  onPress={onSaveDraft}
                />
              ) : null}
            </View>
          ) : null}
          {footerExtra}
        </BusinessActionDock>
      }
    >
      <View className="gap-2">
        <View className="flex-row items-center justify-between gap-2">
          <VemtapText variant="labelMd" className="font-sans-semibold text-primary">
            {copy.stepOf.replace('{step}', String(step))}
          </VemtapText>
          <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
            {step === copy.stageLabels.length
              ? copy.finalStep
              : copy.stageLabels[step - 1]}
          </VemtapText>
        </View>
        <View
          accessibilityRole="progressbar"
          accessibilityLabel={copy.progressLabel}
          accessibilityValue={{ min: 0, max: 100, now: percent }}
          className="h-1.5 w-full flex-row gap-1"
        >
          {copy.stageLabels.map((label, index) => (
            <View
              key={label}
              className={
                index < step
                  ? 'h-full flex-1 rounded-full bg-primary'
                  : 'h-full flex-1 rounded-full bg-surface-container-highest'
              }
            />
          ))}
        </View>
        <View className="flex-row flex-wrap items-center gap-x-2 gap-y-1">
          {copy.stageLabels.map((label, index) => (
            <VemtapText
              key={label}
              variant="caption"
              className={
                index + 1 === step
                  ? 'font-sans-medium text-primary'
                  : 'text-text-tertiary'
              }
              numberOfLines={1}
            >
              {label}
            </VemtapText>
          ))}
        </View>
        {trackerExtra}
      </View>

      <View className="gap-1">
        <VemtapText
          variant="headingLg"
          className="font-sans-semibold text-heading-lg"
          numberOfLines={2}
        >
          {hero}
        </VemtapText>
        {heroBody ? (
          <VemtapText variant="bodyMd" tone="secondary">
            {heroBody}
          </VemtapText>
        ) : null}
      </View>

      {children}
    </BusinessScreenLayout>
  );
}

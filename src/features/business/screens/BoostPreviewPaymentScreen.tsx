import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { cn } from '@utils/cn';
import {
  BusinessActionDock,
  BusinessCheckRow,
  BusinessScreenLayout,
} from '@features/business/components/BusinessPrimitives';
import {
  PreviewShell,
  SetupCallout,
  SetupSectionCard,
  SetupSectionHeading,
  SetupStepBar,
  TextActionButton,
} from '@features/business/components/BusinessSetupPrimitives';
import {
  BusinessKeyValueRow,
  BusinessSegmentTabs,
  type BusinessSegmentTab,
} from '@features/business/components/BusinessOpsPrimitives';
import { PushNotificationPreview } from '@features/business/components/PushNotificationPreview';
import { type BoostPreviewView } from '@features/business/utils/boostMappers';

cssInterop(Pressable, { className: 'style' });

const copy = strings.boostWizard;
const step = copy.preview;

const previewTabs: BusinessSegmentTab[] = [
  { key: 'feed', label: step.previewTabs[0] },
  { key: 'spotlight', label: step.previewTabs[1] },
  { key: 'push', label: step.previewTabs[2] },
];

export interface BoostPreviewPaymentScreenProps {
  onBack?: () => void;
  onEditParameters?: () => void;
  onLaunch?: (methodId: string) => void;
  onSaveDraft?: () => void;
  /** Opens Boost Wallet & Credits from the wallet payment method. */
  onOpenWallet?: () => void;
  /** The live boost. */
  preview: BoostPreviewView;
  initialMethod?: string;
  /** The launch is waiting for the API. */
  launching?: boolean;
  error?: string;
}

function LaunchButton({
  launching,
  label,
  onPress,
}: {
  launching: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Button
      label={label}
      labelVariant="button"
      size="md"
      loading={launching}
      accessibilityLabel={label}
      className="min-h-[56px] rounded-2xl"
      leftIcon={<Icon name="rocketLaunch" size={20} color={colors.surface} />}
      onPress={onPress}
    />
  );
}

/**
 * Boost Wizard — Step 3: Customer Preview & Payment.
 * stitch_vemtap_mobile_app_design/boost_setup_customer_preview_payment
 * Full wizard page with its own fixed CTA deck; the device preview is an inline
 * mock (not a modal) and bottom navigation stays with the owning shell.
 */
export function BoostPreviewPaymentScreen({
  onBack,
  onEditParameters,
  onLaunch,
  onSaveDraft,
  onOpenWallet,
  preview,
  initialMethod,
  launching = false,
  error,
}: BoostPreviewPaymentScreenProps) {
  const view = preview;
  const [tab, setTab] = useState<string>('feed');
  const [method, setMethod] = useState<string>(initialMethod ?? view.methods[0].id);
  const [agreed, setAgreed] = useState(true);

  const methodCopy = view.methods.find(option => option.id === method) ?? view.methods[0];

  return (
    <BusinessScreenLayout
      header={{ title: step.title, onBack, titleVariant: 'headingSm', showAvatar: true }}
      contentContainerClassName="gap-5 pb-6"
      footer={
        <BusinessActionDock>
          <LaunchButton
            launching={launching}
            label={launching ? step.ctaLoading : view.cta}
            onPress={() => {
              if (!agreed || launching) return;
              onLaunch?.(methodCopy.id);
            }}
          />
          <TextActionButton
            label={step.draftCta}
            tone="secondary"
            onPress={onSaveDraft}
          />
          <View className="flex-row items-center justify-center gap-1.5">
            <Icon name="lock" size={12} color={colors.textTertiary} />
            <VemtapText variant="micro" tone="tertiary" className="text-center">
              {step.securityNote}
            </VemtapText>
          </View>
        </BusinessActionDock>
      }
    >
      <SetupStepBar
        step={step.stepEyebrow}
        percent="100%"
        progress={1}
        stepMarker="number"
        stepNumber={3}
      />

      <View className="gap-3">
        <SetupSectionHeading title={step.previewTitle} badge={step.previewBadge} />
        <BusinessSegmentTabs
          tabs={previewTabs}
          value={tab}
          onChange={setTab}
          accessibilityLabel={step.previewTitle}
        />
        <PreviewShell label={step.previewTabs[0]} tone="lowest" className="gap-3 p-2">
          <View className="flex-row items-center justify-between gap-2 px-2 pt-1">
            <VemtapText variant="micro" tone="secondary">
              12:45 PM
            </VemtapText>
            <View className="h-2.5 w-14 rounded-full bg-surface-container-highest" />
            <View className="flex-row items-center gap-1">
              <Icon name="wifiAlert" size={12} color={colors.textTertiary} />
              <Icon name="deployedCode" size={12} color={colors.textTertiary} />
            </View>
          </View>

          {tab === 'feed' ? (
            <View className="gap-2.5 rounded-card bg-surface p-3">
              <View className="flex-row items-center justify-between gap-2">
                <View className="flex-row items-center gap-1.5">
                  <View className="flex-row items-center gap-1 rounded-full bg-surface-tint px-2 py-0.5">
                    <Icon name="fire" size={11} color={colors.primary} />
                    <VemtapText
                      variant="micro"
                      className="font-sans-semibold text-primary"
                    >
                      {step.feedPromoted}
                    </VemtapText>
                  </View>
                  <VemtapText
                    variant="micro"
                    className="text-inverse-on-surface"
                    numberOfLines={1}
                  >
                    {view.feed.distance}
                  </VemtapText>
                </View>
                <View className="h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-subtle">
                  <Icon name="bookmark" size={14} color={colors.textSecondary} />
                </View>
              </View>
              <View className="h-24 w-full items-center justify-center rounded-field bg-surface-subtle">
                <VemtapText variant="caption" tone="tertiary" numberOfLines={1}>
                  {view.feed.name}
                </VemtapText>
              </View>
              <View className="flex-row items-center gap-1.5">
                <VemtapText variant="labelSm" tone="secondary" numberOfLines={1}>
                  {view.feed.business}
                </VemtapText>
                <Icon name="verified" size={12} color={colors.badgeDiscountText} />
              </View>
              <VemtapText
                variant="headingSm"
                className="font-sans-semibold"
                numberOfLines={2}
              >
                {view.feed.name}
              </VemtapText>
              <View className="flex-row flex-wrap items-center gap-2">
                {view.feed.price ? (
                  <VemtapText variant="headingSm" className="font-sans-bold text-primary">
                    {view.feed.price}
                  </VemtapText>
                ) : null}
                {view.feed.was ? (
                  <VemtapText variant="caption" tone="tertiary" className="line-through">
                    {view.feed.was}
                  </VemtapText>
                ) : null}
                {view.feed.save ? (
                  <View className="rounded-full bg-badge-discount-bg px-2 py-0.5">
                    <VemtapText
                      variant="caption"
                      className="font-sans-semibold text-badge-discount-text"
                    >
                      {view.feed.save}
                    </VemtapText>
                  </View>
                ) : null}
              </View>
              <View className="flex-row items-center justify-center gap-1 rounded-xl bg-primary py-2.5">
                <VemtapText
                  variant="labelMd"
                  className="font-sans-semibold text-primary-foreground"
                >
                  {view.feed.cta}
                </VemtapText>
                <Icon name="arrowForward" size={16} color={colors.surface} />
              </View>
            </View>
          ) : null}

          {tab === 'spotlight' ? (
            <View className="gap-2.5">
              <VemtapText
                variant="micro"
                className="font-sans-semibold uppercase tracking-wider text-primary"
              >
                {step.spotlightEyebrow}
              </VemtapText>
              <View className="overflow-hidden rounded-card bg-surface-subtle">
                <View className="h-28 w-full items-center justify-center bg-inverse-surface/90">
                  <VemtapText
                    variant="headingSm"
                    className="font-sans-semibold text-inverse-on-surface"
                    numberOfLines={1}
                  >
                    {view.spotlight.title}
                  </VemtapText>
                  <VemtapText
                    variant="micro"
                    className="text-inverse-on-surface"
                    numberOfLines={1}
                  >
                    {view.spotlight.sub}
                  </VemtapText>
                </View>
                <View className="flex-row items-center justify-between gap-2 p-3">
                  <View className="rounded-full bg-surface-tint px-2 py-0.5">
                    <VemtapText
                      variant="micro"
                      className="font-sans-semibold text-primary"
                    >
                      {step.spotlightTag}
                    </VemtapText>
                  </View>
                  {view.spotlight.caption ? (
                    <VemtapText
                      variant="caption"
                      tone="tertiary"
                      className="min-w-0 flex-1 text-right"
                      numberOfLines={2}
                    >
                      {view.spotlight.caption}
                    </VemtapText>
                  ) : null}
                </View>
              </View>
            </View>
          ) : null}

          {tab === 'push' ? (
            <PushNotificationPreview
              app={step.pushApp}
              time={step.pushTime}
              title={view.push.title}
              body={view.push.body}
            />
          ) : null}
        </PreviewShell>
        {view.trustNote ? (
          <SetupCallout
            icon="group"
            body={view.trustNote}
            tone="tint"
            bodyVariant="caption"
          />
        ) : null}
      </View>

      <View className="gap-3">
        <View className="flex-row items-center justify-between gap-2">
          <SetupSectionHeading title={step.paramsTitle} className="min-w-0 flex-1" />
          <TextActionButton
            label={step.paramsBadge}
            icon="edit"
            tone="brand"
            onPress={onEditParameters}
          />
        </View>
        <View className="rounded-card">
          <SetupSectionCard tone="lowest" className="gap-0 p-0">
            {view.params.map((row, index) => (
              <View key={row.id}>
                {index > 0 ? <View className="h-px bg-surface-container" /> : null}
                <View className="px-4 py-3">
                  <BusinessKeyValueRow
                    icon={row.icon}
                    label={row.label}
                    value={row.value}
                    detail={row.detail}
                  />
                </View>
              </View>
            ))}
          </SetupSectionCard>
        </View>
      </View>

      <View className="gap-3">
        <SetupSectionHeading title={step.paymentTitle} badge={step.paymentBadge} />
        <SetupSectionCard
          tone="container"
          className="flex-row items-end justify-between gap-3 p-4"
        >
          <View className="min-w-0 flex-1 gap-0.5">
            <VemtapText variant="caption" tone="tertiary">
              {step.totalLabel}
            </VemtapText>
            <VemtapText
              variant="displayMobile"
              className="font-sans-bold"
              numberOfLines={1}
            >
              {view.total.value}
            </VemtapText>
          </View>
          <View className="shrink-0 items-end gap-1">
            <View className="rounded-full bg-badge-discount-bg px-2 py-0.5">
              <VemtapText
                variant="labelSm"
                className="font-sans-semibold text-badge-discount-text"
              >
                {view.total.note}
              </VemtapText>
            </View>
            <VemtapText variant="caption" tone="tertiary">
              {view.total.pace}
            </VemtapText>
          </View>
        </SetupSectionCard>

        <View className="gap-2">
          {view.methods.map(option => {
            // The wallet method doubles as the door into Boost Wallet & Credits.
            const chip = option.chip ? (
              option.id === 'wallet' && onOpenWallet ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={step.openWallet}
                  onPress={onOpenWallet}
                  className="self-start rounded-full bg-surface-tint px-2 py-0.5"
                >
                  <VemtapText variant="micro" className="font-sans-semibold text-primary">
                    {option.chip}
                  </VemtapText>
                </Pressable>
              ) : (
                <View className="self-start rounded-full bg-surface-tint px-2 py-0.5">
                  <VemtapText variant="micro" className="font-sans-semibold text-primary">
                    {option.chip}
                  </VemtapText>
                </View>
              )
            ) : null;
            return (
              <SetupSectionCard
                key={option.id}
                tone={option.id === method ? 'container' : 'lowest'}
                className="gap-1.5 p-4"
              >
                <View className="flex-row items-center justify-between gap-2">
                  <VemtapText
                    variant="labelMd"
                    className="min-w-0 flex-1 font-sans-semibold"
                    numberOfLines={2}
                  >
                    {option.title}
                  </VemtapText>
                  <Pressable
                    accessibilityRole="radio"
                    accessibilityState={{ selected: option.id === method }}
                    accessibilityLabel={option.title}
                    onPress={() => setMethod(option.id)}
                    className={cn(
                      'h-5 w-5 shrink-0 items-center justify-center rounded-full',
                      option.id === method
                        ? 'bg-primary'
                        : 'bg-surface-container-highest',
                    )}
                  >
                    {option.id === method ? (
                      <Icon name="check" size={13} color={colors.surface} />
                    ) : null}
                  </Pressable>
                </View>
                {chip}
                <VemtapText variant="caption" tone="secondary">
                  {option.body}
                </VemtapText>
                {option.note ? (
                  <VemtapText variant="micro" tone="tertiary">
                    {option.note}
                  </VemtapText>
                ) : null}
              </SetupSectionCard>
            );
          })}
        </View>

        <BusinessCheckRow
          type="checkbox"
          title={`${step.termsPrefix} ${step.termsLink}. ${view.termsSuffix}`}
          selected={agreed}
          onPress={() => setAgreed(current => !current)}
        />
        {!agreed ? (
          <SetupCallout icon="alert" body={step.termsAlert} tone="subtle" />
        ) : null}
        {error ? (
          <VemtapText variant="caption" className="text-error" accessibilityRole="alert">
            {error}
          </VemtapText>
        ) : null}
      </View>
    </BusinessScreenLayout>
  );
}

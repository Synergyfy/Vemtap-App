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
}

function LaunchButton({
  launching,
  done,
  label,
  onPress,
}: {
  launching: boolean;
  done: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Button
      label={label}
      labelVariant="button"
      size="md"
      loading={launching}
      disabled={done}
      accessibilityLabel={label}
      className="min-h-[56px] rounded-2xl"
      leftIcon={
        done ? (
          <Icon name="checkCircle" size={20} color={colors.surface} />
        ) : (
          <Icon name="rocketLaunch" size={20} color={colors.surface} />
        )
      }
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
}: BoostPreviewPaymentScreenProps) {
  const [tab, setTab] = useState<string>('feed');
  const [method, setMethod] = useState<string>(step.methods[0].id);
  const [agreed, setAgreed] = useState(true);
  const [launching, setLaunching] = useState(false);
  const [done, setDone] = useState(false);

  const methodCopy = step.methods.find(option => option.id === method) ?? step.methods[0];

  return (
    <BusinessScreenLayout
      header={{ title: step.title, onBack, titleVariant: 'headingSm', showAvatar: true }}
      contentContainerClassName="gap-5 pb-6"
      footer={
        <BusinessActionDock>
          <LaunchButton
            launching={launching}
            done={done}
            label={done ? step.ctaDone : launching ? step.ctaLoading : step.cta}
            onPress={() => {
              if (!agreed || launching) {
                setLaunching(false);
                return;
              }
              setLaunching(true);
              setDone(true);
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
                    {step.feedDistance}
                  </VemtapText>
                </View>
                <View className="h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-subtle">
                  <Icon name="bookmark" size={14} color={colors.textSecondary} />
                </View>
              </View>
              <View className="h-24 w-full items-center justify-center rounded-field bg-surface-subtle">
                <VemtapText variant="caption" tone="tertiary" numberOfLines={1}>
                  {step.feedName}
                </VemtapText>
              </View>
              <View className="flex-row items-center gap-1.5">
                <VemtapText variant="labelSm" tone="secondary" numberOfLines={1}>
                  {step.feedBusiness}
                </VemtapText>
                <Icon name="verified" size={12} color={colors.badgeDiscountText} />
              </View>
              <VemtapText
                variant="headingSm"
                className="font-sans-semibold"
                numberOfLines={2}
              >
                {step.feedName}
              </VemtapText>
              <View className="flex-row flex-wrap items-center gap-2">
                <VemtapText variant="headingSm" className="font-sans-bold text-primary">
                  {step.feedPrice}
                </VemtapText>
                <VemtapText variant="caption" tone="tertiary" className="line-through">
                  {step.feedWas}
                </VemtapText>
                <View className="rounded-full bg-badge-discount-bg px-2 py-0.5">
                  <VemtapText
                    variant="caption"
                    className="font-sans-semibold text-badge-discount-text"
                  >
                    {step.feedSave}
                  </VemtapText>
                </View>
              </View>
              <View className="flex-row items-center justify-center gap-1 rounded-xl bg-primary py-2.5">
                <VemtapText
                  variant="labelMd"
                  className="font-sans-semibold text-primary-foreground"
                >
                  {step.feedCta}
                </VemtapText>
                <Icon name="arrowForward" size={16} color={colors.surface} />
              </View>
              <View className="flex-row flex-wrap items-center gap-x-3 gap-y-1">
                <VemtapText variant="micro" tone="secondary" numberOfLines={1}>
                  {step.feedLikes}
                </VemtapText>
                <VemtapText variant="micro" tone="secondary" numberOfLines={1}>
                  {step.feedShares}
                </VemtapText>
                <VemtapText variant="micro" className="text-primary" numberOfLines={1}>
                  {step.feedSpeed}
                </VemtapText>
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
                    {step.spotlightTitle}
                  </VemtapText>
                  <VemtapText
                    variant="micro"
                    className="text-inverse-on-surface"
                    numberOfLines={1}
                  >
                    {step.spotlightSub}
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
                  <VemtapText
                    variant="caption"
                    tone="tertiary"
                    className="min-w-0 flex-1 text-right"
                    numberOfLines={2}
                  >
                    {step.spotlightCaption}
                  </VemtapText>
                </View>
              </View>
            </View>
          ) : null}

          {tab === 'push' ? (
            <View className="flex-row gap-2.5 rounded-card bg-surface p-3">
              <View className="h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary">
                <VemtapText
                  variant="labelMd"
                  className="font-sans-bold text-primary-foreground"
                >
                  V
                </VemtapText>
              </View>
              <View className="min-w-0 flex-1 gap-1">
                <View className="flex-row items-center gap-1.5">
                  <VemtapText
                    variant="labelSm"
                    className="font-sans-semibold"
                    numberOfLines={1}
                  >
                    {step.pushApp}
                  </VemtapText>
                  <VemtapText variant="caption" tone="tertiary" className="shrink-0">
                    {step.pushTime}
                  </VemtapText>
                </View>
                <VemtapText
                  variant="labelSm"
                  className="font-sans-semibold"
                  numberOfLines={2}
                >
                  {step.pushTitle}
                </VemtapText>
                <VemtapText variant="caption" tone="secondary">
                  {step.pushBody}
                </VemtapText>
              </View>
              <View className="h-12 w-12 shrink-0 rounded-field bg-surface-subtle" />
            </View>
          ) : null}
        </PreviewShell>
        <SetupCallout
          icon="group"
          body={step.trustNote}
          tone="tint"
          bodyVariant="caption"
        />
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
            {step.params.map((row, index) => (
              <View key={row.id}>
                {index > 0 ? <View className="h-px bg-surface-container" /> : null}
                <View className="px-4 py-3">
                  <BusinessKeyValueRow
                    icon={row.icon}
                    label={row.label}
                    value={row.value}
                    detail={'detail' in row ? row.detail : undefined}
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
              {step.totalValue}
            </VemtapText>
          </View>
          <View className="shrink-0 items-end gap-1">
            <View className="rounded-full bg-badge-discount-bg px-2 py-0.5">
              <VemtapText
                variant="labelSm"
                className="font-sans-semibold text-badge-discount-text"
              >
                {step.totalNote}
              </VemtapText>
            </View>
            <VemtapText variant="caption" tone="tertiary">
              {step.totalPace}
            </VemtapText>
          </View>
        </SetupSectionCard>

        <View className="gap-2">
          {step.methods.map(option => {
            // The wallet method doubles as the door into Boost Wallet & Credits.
            const chip =
              'chip' in option ? (
                option.id === 'wallet' && onOpenWallet ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={step.openWallet}
                    onPress={onOpenWallet}
                    className="self-start rounded-full bg-surface-tint px-2 py-0.5"
                  >
                    <VemtapText
                      variant="micro"
                      className="font-sans-semibold text-primary"
                    >
                      {option.chip}
                    </VemtapText>
                  </Pressable>
                ) : (
                  <View className="self-start rounded-full bg-surface-tint px-2 py-0.5">
                    <VemtapText
                      variant="micro"
                      className="font-sans-semibold text-primary"
                    >
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
                {'note' in option ? (
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
          title={`${step.termsPrefix} ${step.termsLink}. ${step.termsSuffix}`}
          selected={agreed}
          onPress={() => setAgreed(current => !current)}
        />
        {!agreed ? (
          <SetupCallout icon="alert" body={step.termsAlert} tone="subtle" />
        ) : null}
      </View>
    </BusinessScreenLayout>
  );
}

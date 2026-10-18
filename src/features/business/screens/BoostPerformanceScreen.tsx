import React from 'react';
import { View } from 'react-native';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { BusinessScreenLayout } from '@features/business/components/BusinessPrimitives';
import {
  SetupCallout,
  SetupSectionCard,
  SetupSectionHeading,
  TextActionButton,
} from '@features/business/components/BusinessSetupPrimitives';
import {
  BusinessMetricGrid,
  BusinessSectionHeader,
} from '@features/business/components/BusinessAnalyticsPrimitives';
import { BusinessProgressMeter } from '@features/business/components/BusinessOpsPrimitives';
import { ErrorState } from '@components/shared/ErrorState';
import { LoadingState } from '@components/shared/LoadingState';
import { type PerformanceView } from '@features/business/utils/campaignPerformanceMappers';

const copy = strings.boostWizard;
const perf = copy.performance;

export interface BoostPerformanceScreenProps {
  onBack?: () => void;
  onShare?: () => void;
  onAddBudget?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onEndCampaign?: () => void;
  /** The live boost or campaign; absent until it loads. */
  performance?: PerformanceView;
  isLoading?: boolean;
  error?: string;
  onRetry?: () => void;
  /** A pause/resume/end request is in flight. */
  busy?: boolean;
}

/**
 * Boost Campaign Performance Analytics.
 * stitch_vemtap_mobile_app_design/boost_campaign_performance_analytics
 * The source draws its own 4-tab bar, but AGENTS rule 21 gives bottom navigation
 * to the owning shell, so this screen deliberately renders none of its own.
 */
export function BoostPerformanceScreen({
  onBack,
  onShare,
  onAddBudget,
  onPause,
  onResume,
  onEndCampaign,
  performance,
  isLoading = false,
  error,
  onRetry,
  busy = false,
}: BoostPerformanceScreenProps) {
  const view = performance;
  const spend = view?.kpis.spend;
  const redemptions = view?.kpis.redemptions;

  return (
    <BusinessScreenLayout
      header={{
        title: perf.title,
        subtitle: perf.engine,
        titleVariant: 'headingSm',
        leading: (
          <View className="h-9 w-9 items-center justify-center rounded-full bg-primary">
            <Icon name="rocketLaunch" size={18} color={colors.surface} />
          </View>
        ),
        actions: [{ label: perf.notifications, icon: 'bellRing', onPress: onShare }],
        showAvatar: true,
      }}
      contentContainerClassName="gap-5 pb-8"
    >
      <View className="flex-row items-center gap-2">
        <TextActionButton
          label={view?.backLabel ?? perf.live.backToBoosts}
          icon="back"
          tone="brand"
          onPress={onBack}
        />
        <View className="min-w-0 flex-1">
          <TextActionButton
            label={perf.share}
            icon="share"
            tone="brand"
            onPress={onShare}
          />
        </View>
      </View>
      <VemtapText variant="caption" tone="secondary">
        {perf.live.headerSub}
      </VemtapText>

      {isLoading || (!view && !error) ? <LoadingState /> : null}
      {!isLoading && error ? <ErrorState description={error} onRetry={onRetry} /> : null}
      {!isLoading && !error && view && spend && redemptions ? (
        <>
          <SetupSectionCard tone="lowest" className="gap-2.5 p-4">
            <View className="flex-row flex-wrap items-center gap-1.5">
              <View className="rounded-full bg-surface-tint px-2 py-0.5">
                <VemtapText variant="labelSm" className="font-sans-semibold text-primary">
                  {view.badge}
                </VemtapText>
              </View>
              <VemtapText variant="caption" tone="tertiary">
                {view.idLabel}
              </VemtapText>
            </View>
            <VemtapText
              variant="headingMd"
              className="font-sans-semibold"
              numberOfLines={2}
            >
              {view.name}
            </VemtapText>
            <VemtapText variant="bodyMd" tone="secondary" numberOfLines={2}>
              {view.sub}
            </VemtapText>
            <View className="flex-row items-center gap-2 rounded-field bg-surface-tint px-3 py-2">
              <View className="h-1.5 w-1.5 rounded-full bg-primary" />
              <VemtapText
                variant="labelSm"
                className="min-w-0 flex-1 font-sans-medium text-primary"
                numberOfLines={2}
              >
                {view.banner}
              </VemtapText>
            </View>
          </SetupSectionCard>

          <View className="gap-3">
            <BusinessSectionHeader
              title={perf.pulseTitle}
              meta={view.pulseEyebrow}
              icon="sync"
            />
            <BusinessMetricGrid
              columns={2}
              cells={[spend, redemptions, view.kpis.reach, view.kpis.cost].map(kpi => ({
                label: kpi.label,
                value: kpi.value,
                note: kpi.sub,
                noteTone: 'brand' as const,
              }))}
            />
            <View className="rounded-card bg-surface-container-lowest p-4 shadow-sm">
              <BusinessProgressMeter
                label={spend.label}
                value={spend.value}
                percent={spend.percent}
                filledLabel={spend.consumed}
                remainingLabel={spend.left}
              />
            </View>
            <View className="flex-row items-center justify-between gap-2 rounded-card bg-surface-container-lowest p-4 shadow-sm">
              <View className="min-w-0 flex-1 gap-0.5">
                <VemtapText variant="caption" tone="tertiary">
                  {redemptions.boxLabel}
                </VemtapText>
                <VemtapText
                  variant="labelMd"
                  className="font-sans-bold"
                  numberOfLines={1}
                >
                  {redemptions.boxValue}
                </VemtapText>
              </View>
              <View className="shrink-0 items-end gap-1">
                {view.kpis.reach.delta ? (
                  <VemtapText variant="micro" className="text-success" numberOfLines={1}>
                    {view.kpis.reach.delta}
                  </VemtapText>
                ) : null}
                {view.kpis.cost.badge ? (
                  <View className="rounded-full bg-badge-discount-bg px-2 py-0.5">
                    <VemtapText
                      variant="micro"
                      className="font-sans-semibold text-badge-discount-text"
                    >
                      {view.kpis.cost.badge}
                    </VemtapText>
                  </View>
                ) : null}
              </View>
            </View>
          </View>

          <View className="gap-3">
            <BusinessSectionHeader
              title={perf.funnelTitle}
              meta={perf.funnelSubtitle}
              icon="tune"
            />
            <SetupSectionCard tone="lowest" className="gap-3 p-4">
              {view.funnel.map(stage => (
                <View key={stage.id} className="gap-1.5">
                  <View className="flex-row items-center justify-between gap-2">
                    <VemtapText
                      variant={stage.verified ? 'labelMd' : 'labelSm'}
                      className={
                        stage.verified
                          ? 'min-w-0 flex-1 font-sans-semibold text-primary'
                          : 'min-w-0 flex-1'
                      }
                      numberOfLines={2}
                    >
                      {stage.label}
                    </VemtapText>
                    <View className="shrink-0 items-end">
                      <VemtapText
                        variant={stage.verified ? 'headingSm' : 'labelSm'}
                        className="font-sans-bold"
                        numberOfLines={1}
                      >
                        {stage.value}
                      </VemtapText>
                      <VemtapText variant="micro" tone="tertiary">
                        {stage.percent}
                      </VemtapText>
                    </View>
                  </View>
                  <View className="h-3 overflow-hidden rounded-full bg-surface-container">
                    <View
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${stage.fill}%` }}
                    />
                  </View>
                </View>
              ))}
              {view.funnelCaption ? (
                <VemtapText
                  variant="caption"
                  className="font-sans-medium text-badge-discount-text"
                >
                  {view.funnelCaption}
                </VemtapText>
              ) : null}
              <SetupCallout
                icon="qrCodeScanner"
                title={view.attributionTitle}
                body={view.attributionBody}
                tone="subtle"
                bodyVariant="caption"
              />
            </SetupSectionCard>
          </View>

          <View className="gap-3">
            <BusinessSectionHeader
              title={perf.rhythmTitle}
              meta={view.rhythmSubtitle}
              icon="chartBox"
            />
            <SetupSectionCard tone="lowest" className="gap-3 p-4">
              <View className="flex-row items-center gap-3">
                {view.showViews ? (
                  <View className="flex-row items-center gap-1">
                    <View className="h-2 w-2 rounded-full bg-primary" />
                    <VemtapText variant="caption" tone="secondary">
                      {perf.rhythmViews}
                    </VemtapText>
                  </View>
                ) : null}
                <View className="flex-row items-center gap-1">
                  <View className="h-2 w-2 rounded-full bg-badge-discount-text" />
                  <VemtapText variant="caption" tone="secondary">
                    {perf.rhythmClaims}
                  </VemtapText>
                </View>
              </View>
              <View className="h-36 flex-row items-end gap-2">
                {view.rhythm.map((slot, index) => (
                  <View
                    key={slot.id}
                    className={
                      view.peak?.index === index
                        ? 'min-w-0 flex-1 items-center gap-1 rounded-lg bg-surface-tint p-1'
                        : 'min-w-0 flex-1 items-center gap-1'
                    }
                  >
                    <View className="w-full flex-1 items-end justify-end gap-0.5">
                      {view.showViews ? (
                        <View
                          className="w-full rounded-t-sm bg-primary"
                          style={{ height: `${slot.views}%` }}
                        />
                      ) : null}
                      <View
                        className="w-full rounded-t-sm bg-badge-discount-text"
                        style={{ height: `${slot.claims}%` }}
                      />
                    </View>
                    <VemtapText
                      variant="micro"
                      className={
                        view.peak?.index === index
                          ? 'font-sans-bold text-primary'
                          : 'text-text-tertiary'
                      }
                      numberOfLines={1}
                    >
                      {slot.label}
                    </VemtapText>
                  </View>
                ))}
              </View>
              {view.peak ? (
                <View className="self-start rounded-full bg-primary px-2 py-0.5">
                  <VemtapText
                    variant="micro"
                    className="font-sans-semibold text-primary-foreground"
                  >
                    {view.peak.tag}
                  </VemtapText>
                </View>
              ) : (
                <VemtapText variant="caption" tone="tertiary">
                  {perf.live.noActivity}
                </VemtapText>
              )}
              {view.peak ? (
                <View className="flex-row items-center gap-3 rounded-field bg-surface-subtle p-3">
                  <Icon name="restaurant" size={18} color={colors.primary} />
                  <View className="min-w-0 flex-1 gap-0.5">
                    <VemtapText
                      variant="labelSm"
                      className="font-sans-semibold"
                      numberOfLines={2}
                    >
                      {view.peak.title}
                    </VemtapText>
                    <VemtapText variant="caption" tone="secondary" numberOfLines={2}>
                      {view.peak.body}
                    </VemtapText>
                  </View>
                  <VemtapText
                    variant="labelMd"
                    className="shrink-0 font-sans-bold text-primary"
                  >
                    {view.peak.value}
                  </VemtapText>
                </View>
              ) : null}
            </SetupSectionCard>
          </View>

          <View className="gap-3">
            <BusinessSectionHeader
              title={view.geoTitle}
              meta={view.geoSubtitle}
              icon="distance"
            />
            <View className="gap-2">
              {view.geo.length === 0 ? (
                <VemtapText variant="caption" tone="tertiary">
                  {perf.live.noActivity}
                </VemtapText>
              ) : null}
              {view.geo.map(cluster => (
                <View
                  key={cluster.id}
                  className="gap-2 rounded-card bg-surface-container-lowest p-3.5 shadow-sm"
                >
                  <View className="flex-row items-start justify-between gap-2">
                    <View className="min-w-0 flex-1 gap-0.5">
                      <VemtapText
                        variant="labelMd"
                        className="font-sans-semibold"
                        numberOfLines={1}
                      >
                        {cluster.name}
                      </VemtapText>
                      {cluster.meta ? (
                        <VemtapText variant="caption" tone="tertiary" numberOfLines={1}>
                          {cluster.meta}
                        </VemtapText>
                      ) : null}
                    </View>
                    <VemtapText variant="labelMd" className="shrink-0 font-sans-bold">
                      {cluster.percent}
                    </VemtapText>
                  </View>
                  <View className="flex-row items-center justify-between gap-2">
                    <VemtapText variant="micro" tone="secondary" numberOfLines={1}>
                      {cluster.diners}
                    </VemtapText>
                    {cluster.note ? (
                      <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
                        {cluster.note}
                      </VemtapText>
                    ) : null}
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View className="gap-3">
            <SetupSectionHeading title={perf.optimizeTitle} />
            <VemtapText variant="caption" tone="secondary">
              {perf.optimizeSubtitle}
            </VemtapText>
            {view.endedNote ? (
              <VemtapText variant="caption" tone="secondary">
                {view.endedNote}
              </VemtapText>
            ) : null}
            <View className="gap-2">
              {view.canAddBudget ? (
                <Button
                  label={view.addBudgetLabel ?? perf.addBudget}
                  labelVariant="button"
                  size="md"
                  className="min-h-[52px] rounded-xl"
                  leftIcon={<Icon name="bolt" size={18} color={colors.surface} />}
                  disabled={busy}
                  onPress={onAddBudget}
                />
              ) : null}
              {view.canPause ? (
                <Button
                  label={perf.pauseCta}
                  labelVariant="labelMd"
                  variant="secondary"
                  size="md"
                  className="min-h-[44px] rounded-xl"
                  leftIcon={<Icon name="pauseCircle" size={18} color={colors.text} />}
                  disabled={busy}
                  onPress={onPause}
                />
              ) : null}
              {view.canResume ? (
                <Button
                  label={perf.live.resumeCta}
                  labelVariant="labelMd"
                  variant="secondary"
                  size="md"
                  className="min-h-[44px] rounded-xl"
                  leftIcon={<Icon name="playCircle" size={18} color={colors.text} />}
                  disabled={busy}
                  onPress={onResume}
                />
              ) : null}
              {view.canEnd ? (
                <Button
                  label={view.endLabel}
                  labelVariant="labelMd"
                  variant="ghost"
                  size="md"
                  className="min-h-[44px] rounded-xl"
                  leftIcon={<Icon name="close" size={18} color={colors.error} />}
                  disabled={busy}
                  onPress={() => {
                    onEndCampaign?.();
                  }}
                />
              ) : null}
            </View>
          </View>
        </>
      ) : null}
    </BusinessScreenLayout>
  );
}

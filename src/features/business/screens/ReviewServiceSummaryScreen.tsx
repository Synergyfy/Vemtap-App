import React from 'react';
import { Pressable, View } from 'react-native';
import { cssInterop } from 'nativewind';
import {
  ServiceFlowPage,
  ServiceInfoRow,
  ServiceProgress,
  ServiceSection,
  ServiceSectionHeader,
} from '@features/business/components/ServiceFlowPrimitives';
import { serviceDeliveryOptions } from '@features/business/data/serviceFlowData';
import { BusinessProductImage } from '@features/business/components/BusinessPrimitives';
import { useBusinessBranches } from '@features/business/hooks/useCatalogueMutations';
import type { ServiceDraft } from '@store/catalogueDraftStore';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';
import { strings } from '@constants/strings';
import {
  parseTime,
  shortDateLabel,
  toClock,
  weekdaysLabel,
} from '@features/business/utils/serviceSchedule';

cssInterop(Pressable, { className: 'style' });
cssInterop(View, { className: 'style' });

export interface ReviewServiceSummaryScreenProps {
  /** The service being set up (`catalogueDraftStore`). */
  draft: ServiceDraft;
  publishing?: boolean;
  onBack: () => void;
  onPublish?: () => void;
  onSaveDraft?: () => void;
  onPreview?: () => void;
  /** The business the service is listed under (live only). */
  provider?: { name: string; category: string };
}

const reviewCopy = strings.serviceFlow.review;

function naira(value: string | undefined): string {
  return `\u20a6${(Number((value ?? '').replace(/[^0-9.]/g, '')) || 0).toLocaleString('en-NG')}`;
}

function daysLabel(days: number[] | undefined): string {
  return weekdaysLabel(days, reviewCopy.everyDay);
}

/** A branch's own schedule, when it has one. */
function customHoursLabel(draft: ServiceDraft, branchId: string): string | undefined {
  const own = draft.bookingRules?.branchSchedules?.find(
    entry => entry.branchId === branchId,
  );
  if (!own) return undefined;
  const clock = (value: string | undefined) => {
    const minutes = parseTime(value ?? '');
    return minutes === null ? '' : toClock(minutes);
  };
  return reviewCopy.customHours(daysLabel(own.days), clock(own.from), clock(own.to));
}

/** The draft's booking rules as policy rows. */
function ruleRows(draft: ServiceDraft) {
  if (!draft.bookingEnabled) {
    return [
      { title: reviewCopy.bookingOff, description: '', icon: 'doNotDisturb' as const },
    ];
  }
  const rules = draft.bookingRules ?? {};
  const days = daysLabel(rules.days);
  const time = (value: string | undefined, fallback: string) => {
    const minutes = parseTime(value ?? '');
    return minutes === null ? fallback : toClock(minutes);
  };
  const blocked = [...(rules.blockouts ?? [])].sort((a, b) =>
    a.date.localeCompare(b.date),
  );
  const blockedRow = blocked.length
    ? [
        {
          title: reviewCopy.blockedTitle(blocked.length),
          description: [
            ...blocked
              .slice(0, 3)
              .map(entry =>
                entry.reason
                  ? `${shortDateLabel(entry.date)} (${entry.reason})`
                  : shortDateLabel(entry.date),
              ),
            ...(blocked.length > 3 ? [reviewCopy.blockedMore(blocked.length - 3)] : []),
          ].join(', '),
          icon: 'doNotDisturb' as const,
        },
      ]
    : [];
  return [
    ...blockedRow,
    {
      title: reviewCopy.daysHours(
        days,
        time(rules.from, '9:00 AM'),
        time(rules.to, '6:00 PM'),
      ),
      description: reviewCopy.daysHoursBody,
      icon: 'eventAvailable' as const,
    },
    {
      title: reviewCopy.bufferTitle,
      description: reviewCopy.bufferBody(rules.bufferMinutes ?? 0, rules.capacity ?? 1),
      icon: 'group' as const,
    },
    {
      title: reviewCopy.horizonTitle(rules.horizonDays ?? 30),
      description:
        rules.requiresConfirmation === false
          ? reviewCopy.confirmOff
          : reviewCopy.confirmOn,
      icon: 'verifiedUser' as const,
    },
  ];
}

export function ReviewServiceSummaryScreen({
  draft,
  publishing = false,
  onBack,
  onPublish,
  onSaveDraft,
  onPreview,
  provider,
}: ReviewServiceSummaryScreenProps) {
  const photoCount = (draft.mainImage ? 1 : 0) + draft.galleryImages.length;
  const base = Number((draft.basePrice ?? '').replace(/[^0-9.]/g, '')) || 0;
  const was = Number((draft.compareAtPrice ?? '').replace(/[^0-9.]/g, '')) || 0;
  const leadHours = Math.round((draft.bookingRules?.leadMinutes ?? 120) / 60);
  const deliveryLabel = serviceDeliveryOptions.find(
    option => option.id === draft.deliveryMode,
  )?.title;
  const liveBranches = useBusinessBranches();
  const shownBranches = (liveBranches.data ?? [])
    .filter(branch => draft.branchIds.includes(branch.id))
    .map(branch => ({
      name: branch.name,
      summary: [
        reviewCopy.branchSummary(
          naira(
            draft.pricingMode === 'per_branch'
              ? (draft.branchPrices[branch.id] ?? draft.basePrice)
              : draft.basePrice,
          ),
        ),
        customHoursLabel(draft, branch.id),
      ]
        .filter(Boolean)
        .join(' \u2022 '),
      badge: 'Active',
    }));
  const shownBranchCount = draft.branchIds.length;
  const shownHighlights = draft.highlights;
  return (
    <ServiceFlowPage
      step={4}
      title="Review Service Summary"
      onBack={onBack}
      onSaveDraft={onSaveDraft}
      contentContainerClassName="w-full max-w-[640px] self-center gap-6 px-6 pb-12 pt-4"
    >
      <ServiceSection className="gap-3">
        <ServiceProgress
          stepLabel="Step 4 of 4: Final Review"
          statusLabel="100% Complete"
          statusTone="success"
          progress={100}
          leadingIcon="verified"
        />
        <View className="flex-row items-start gap-2 rounded-lg bg-surface-tint p-3">
          <Icon name="checkCircle" size={18} color={colors.primary} />
          <VemtapText
            variant="caption"
            tone="secondary"
            className="min-w-0 flex-1 leading-relaxed"
          >
            <VemtapText tone="brand" className="font-sans-semibold">
              Almost there:
            </VemtapText>{' '}
            Check the details below. Customers see exactly this once you publish.
          </VemtapText>
        </View>
      </ServiceSection>

      <ServiceSection className="gap-0 overflow-hidden p-0">
        <View className="relative h-52 w-full bg-surface-container">
          {!draft.mainImage ? (
            <View className="h-full w-full items-center justify-center">
              <Icon name="photoLibrary" size={28} color={colors.textTertiary} />
            </View>
          ) : (
            <BusinessProductImage
              source={{ uri: draft.mainImage }}
              alt={strings.serviceFlow.coverAlt}
              className="h-full w-full"
              resizeMode="cover"
            />
          )}
          <View className="absolute left-3 top-3 flex-row flex-wrap gap-1.5">
            <View className="flex-row items-center gap-1 rounded-full bg-surface/90 px-2 py-1 shadow-sm">
              <Icon name="photoLibrary" size={14} color={colors.text} />
              <VemtapText variant="caption" className="font-sans-medium text-text">
                {reviewCopy.photos(photoCount)}
              </VemtapText>
            </View>
            {deliveryLabel ? (
              <View className="flex-row items-center gap-1 rounded-full bg-primary px-2 py-1 shadow-sm">
                <Icon name="spa" size={14} color={colors.surface} />
                <VemtapText variant="caption" className="text-inverse font-sans-medium">
                  {deliveryLabel}
                </VemtapText>
              </View>
            ) : null}
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Edit Basics"
            className="absolute bottom-3 right-3 min-h-11 flex-row items-center gap-1 rounded-full bg-surface px-3 py-2 shadow-sm active:bg-surface-muted"
          >
            <VemtapText variant="labelSm" tone="brand" className="font-sans-semibold">
              Edit Basics
            </VemtapText>
            <Icon name="forward" size={14} color={colors.primary} />
          </Pressable>
        </View>
        <View className="gap-2 p-4">
          {provider?.name ? (
            <View className="flex-row items-center gap-1">
              <Icon name="storefront" size={16} color={colors.primary} />
              <VemtapText variant="labelSm" tone="tertiary" numberOfLines={1}>
                {provider.name}
              </VemtapText>
            </View>
          ) : null}
          <VemtapText variant="headingMd" className="text-heading-md text-text">
            {draft.name || 'Untitled service'}
          </VemtapText>
          {provider?.category ? (
            <VemtapText variant="bodyMd" tone="secondary">
              {provider.category}
            </VemtapText>
          ) : null}
        </View>
      </ServiceSection>

      <ServiceSection>
        <ServiceSectionHeader
          icon="payments"
          title="Pricing & Session Tiers"
          subtitle={reviewCopy.tiersSubtitle(draft.tiers.length)}
          actionLabel="Edit"
          boxedIcon
        />
        <View className="flex-row flex-wrap items-center justify-between gap-2 rounded-lg bg-surface-muted p-3">
          <View className="min-w-[150px] flex-1">
            <VemtapText variant="labelSm" tone="secondary">
              Base Starting Rate
            </VemtapText>
            <View className="mt-0.5 flex-row flex-wrap items-baseline gap-2">
              <VemtapText variant="headingSm" className="font-sans-bold text-text">
                {naira(draft.basePrice)}
              </VemtapText>
              {was > base ? (
                <VemtapText variant="caption" tone="tertiary" className="line-through">
                  {naira(draft.compareAtPrice)}
                </VemtapText>
              ) : null}
              <VemtapText variant="caption" tone="secondary">
                {draft.duration ? `\u2022 ${draft.duration}` : ''}
              </VemtapText>
            </View>
          </View>
          {was > base ? (
            <View className="rounded-full bg-success-container px-2 py-1">
              <VemtapText variant="caption" tone="success" className="font-sans-semibold">
                {`Save \u20a6${(was - base).toLocaleString('en-NG')}`}
              </VemtapText>
            </View>
          ) : null}
        </View>
        <View className="gap-2">
          {draft.tiers
            .map(tier => ({
              id: tier.id,
              reviewName: tier.name,
              reviewDescription: tier.duration ?? '',
              price: naira(tier.price),
            }))
            .map(tier => (
              <View
                key={tier.id}
                className="flex-row items-center justify-between gap-3 rounded-lg bg-surface p-3 shadow-sm"
              >
                <View className="min-w-0 flex-1 flex-row items-center gap-3">
                  <View className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                  <View className="min-w-0 flex-1">
                    <VemtapText
                      variant="labelMd"
                      className="font-sans-semibold text-text"
                      numberOfLines={1}
                    >
                      {tier.reviewName}
                    </VemtapText>
                    <VemtapText variant="caption" tone="tertiary">
                      {tier.reviewDescription}
                    </VemtapText>
                  </View>
                </View>
                <VemtapText
                  variant="labelMd"
                  className="shrink-0 font-sans-bold text-text"
                >
                  {tier.price}
                </VemtapText>
              </View>
            ))}
        </View>
      </ServiceSection>

      <ServiceSection>
        <ServiceSectionHeader
          icon="locationOn"
          title="Branch Availability"
          subtitle={reviewCopy.branchesSubtitle(shownBranchCount)}
          actionLabel="Edit"
          boxedIcon
        />
        <View className="gap-1.5">
          {shownBranches.map((branch, index) => (
            <View key={branch.name} className="gap-1 rounded-lg bg-surface-muted p-3">
              <View className="flex-row flex-wrap items-center justify-between gap-2">
                <VemtapText variant="labelMd" className="font-sans-semibold text-text">
                  {branch.name}
                </VemtapText>
                <View
                  className={
                    index === 0
                      ? 'rounded-full bg-surface-container-high px-2 py-0.5'
                      : 'rounded-full bg-surface-tint px-2 py-0.5'
                  }
                >
                  <VemtapText
                    variant="caption"
                    className={
                      index === 0
                        ? 'font-sans-medium text-text'
                        : 'font-sans-medium text-primary'
                    }
                  >
                    {index === 0 ? strings.serviceFlow.flagship : 'Secondary'}
                  </VemtapText>
                </View>
              </View>
              <VemtapText variant="caption" tone="secondary">
                {branch.summary}
              </VemtapText>
            </View>
          ))}
        </View>
        <View className="flex-row items-center gap-2 pt-1">
          <Icon name="schedule" size={18} color={colors.tertiaryContainer} />
          <VemtapText variant="labelSm" tone="secondary" className="min-w-0 flex-1">
            {reviewCopy.notice(leadHours)}
          </VemtapText>
        </View>
      </ServiceSection>

      <ServiceSection>
        <ServiceSectionHeader
          icon="policy"
          title={reviewCopy.rulesTitle}
          actionLabel="Edit"
          boxedIcon
        />
        <View className="gap-3">
          {ruleRows(draft).map((policy, index) => (
            <ServiceInfoRow
              key={policy.title}
              icon={policy.icon}
              title={policy.title}
              description={policy.description}
              tone={index === 0 ? 'primary' : index === 1 ? 'success' : 'tertiary'}
            />
          ))}
        </View>
      </ServiceSection>

      <ServiceSection>
        <ServiceSectionHeader
          icon="autoAwesome"
          title="Treatment Highlights"
          actionLabel="Edit"
          boxedIcon
        />
        <VemtapText variant="bodyMd" tone="secondary" className="leading-relaxed">
          {draft.description || 'No description yet.'}
        </VemtapText>
        <View className="flex-row flex-wrap gap-1">
          {shownHighlights.map(highlight => (
            <View key={highlight} className="rounded-full bg-surface-muted px-3 py-1">
              <VemtapText variant="caption" tone="secondary">
                {highlight}
              </VemtapText>
            </View>
          ))}
        </View>
      </ServiceSection>

      {!onPreview ? null : (
        <View className="flex-row flex-wrap items-center justify-between gap-3 rounded-card-lg bg-surface-tint p-4 shadow-sm">
          <View className="min-w-[180px] flex-1 flex-row items-center gap-3">
            <View className="h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Icon name="visibility" size={20} color={colors.primary} />
            </View>
            <View className="min-w-0 flex-1">
              <VemtapText variant="labelMd" tone="brand" className="font-sans-semibold">
                Consumer View Preview
              </VemtapText>
              <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                Simulate live client booking screen
              </VemtapText>
            </View>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Inspect consumer view"
            onPress={onPreview}
            className="min-h-11 shrink-0 justify-center rounded-lg bg-surface px-3 py-2 shadow-sm active:bg-surface-muted"
          >
            <VemtapText variant="labelSm" tone="brand" className="font-sans-semibold">
              Inspect
            </VemtapText>
          </Pressable>
        </View>
      )}

      <View className="gap-3 pt-1">
        <Button
          label={publishing ? 'Publishing…' : 'Publish Service to Storefront 🚀'}
          labelVariant="labelMd"
          labelNumberOfLines={2}
          disabled={publishing}
          onPress={onPublish}
        />
        <Button
          label="Save as Draft"
          variant="ghost"
          onPress={onSaveDraft}
          labelVariant="labelMd"
        />
        <VemtapText
          variant="caption"
          tone="tertiary"
          className="px-3 text-center leading-relaxed"
        >
          You can edit treatment details, block calendar dates, or convert this service
          into a promotional deal voucher anytime from your merchant portal.
        </VemtapText>
      </View>
    </ServiceFlowPage>
  );
}

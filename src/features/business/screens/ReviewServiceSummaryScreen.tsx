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
import {
  serviceBranches,
  serviceFlowDraft,
  serviceFlowImages,
  servicePolicyRows,
  serviceReviewHighlights,
  serviceTiers,
} from '@features/business/data/serviceFlowData';
import { BusinessProductImage } from '@features/business/components/BusinessPrimitives';
import { useBusinessBranches } from '@features/business/hooks/useCatalogueMutations';
import type { ServiceDraft } from '@store/catalogueDraftStore';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';
import { strings } from '@constants/strings';
import { parseTime, toClock } from '@features/business/utils/serviceSchedule';

cssInterop(Pressable, { className: 'style' });
cssInterop(View, { className: 'style' });

export interface ReviewServiceSummaryScreenProps {
  /** Live draft from the setup wizard. Absent in standalone (storybook) use. */
  draft?: ServiceDraft;
  publishing?: boolean;
  onBack: () => void;
  onPublish?: () => void;
  onSaveDraft?: () => void;
  onPreview?: () => void;
  /** The business the service is listed under (live only). */
  provider?: { name: string; category: string };
}

const reviewCopy = strings.serviceFlow.review;
const DAY_LABEL = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function naira(value: string | undefined): string {
  return `\u20a6${(Number((value ?? '').replace(/[^0-9.]/g, '')) || 0).toLocaleString('en-NG')}`;
}

/** The draft's booking rules as policy rows. */
function ruleRows(draft: ServiceDraft) {
  if (!draft.bookingEnabled) {
    return [
      { title: reviewCopy.bookingOff, description: '', icon: 'doNotDisturb' as const },
    ];
  }
  const rules = draft.bookingRules ?? {};
  const days =
    !rules.days || rules.days.length === 7
      ? reviewCopy.everyDay
      : rules.days.map(day => DAY_LABEL[day]).join(', ');
  const time = (value: string | undefined, fallback: string) => {
    const minutes = parseTime(value ?? '');
    return minutes === null ? fallback : toClock(minutes);
  };
  return [
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
  const live = draft !== undefined;
  const photoCount = live ? (draft.mainImage ? 1 : 0) + draft.galleryImages.length : 3;
  const base = Number((draft?.basePrice ?? '').replace(/[^0-9.]/g, '')) || 0;
  const was = Number((draft?.compareAtPrice ?? '').replace(/[^0-9.]/g, '')) || 0;
  const leadHours = Math.round((draft?.bookingRules?.leadMinutes ?? 120) / 60);
  const liveBranches = useBusinessBranches();
  const shownBranches =
    draft && liveBranches.data
      ? liveBranches.data
          .filter(branch => draft.branchIds.includes(branch.id))
          .map(branch => ({
            name: branch.name,
            summary: reviewCopy.branchSummary(naira(draft.basePrice)),
            badge: 'Active',
          }))
      : serviceBranches;
  const shownBranchCount = draft ? draft.branchIds.length : 2;
  const shownHighlights = live ? draft.highlights : serviceReviewHighlights;
  return (
    <ServiceFlowPage
      title="Add Service   Step 4: Review Service Summary"
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
              Ready for bookings:
            </VemtapText>{' '}
            All treatment safety protocols and calendar schedules match VEMTAP Instant
            Booking standards.
          </VemtapText>
        </View>
      </ServiceSection>

      <ServiceSection className="gap-0 overflow-hidden p-0">
        <View className="relative h-52 w-full bg-surface-container">
          {live && !draft.mainImage ? (
            <View className="h-full w-full items-center justify-center">
              <Icon name="photoLibrary" size={28} color={colors.textTertiary} />
            </View>
          ) : (
            <BusinessProductImage
              source={{ uri: live ? draft.mainImage : serviceFlowImages.review.uri }}
              alt={live ? strings.serviceFlow.coverAlt : serviceFlowImages.review.alt}
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
            <View className="flex-row items-center gap-1 rounded-full bg-primary px-2 py-1 shadow-sm">
              <Icon name="spa" size={14} color={colors.surface} />
              <VemtapText variant="caption" className="text-inverse font-sans-medium">
                In-Studio &amp; Mobile
              </VemtapText>
            </View>
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
          <View className="flex-row items-center gap-1">
            <Icon name="storefront" size={16} color={colors.primary} />
            <VemtapText variant="labelSm" tone="tertiary" numberOfLines={1}>
              {provider?.name ?? serviceFlowDraft.provider}
            </VemtapText>
          </View>
          <VemtapText variant="headingMd" className="text-heading-md text-text">
            {draft?.name || serviceFlowDraft.title}
          </VemtapText>
          <VemtapText variant="bodyMd" tone="secondary">
            {provider?.category ??
              `${serviceFlowDraft.primaryCategory} > ${serviceFlowDraft.subCategory}`}
          </VemtapText>
        </View>
      </ServiceSection>

      <ServiceSection>
        <ServiceSectionHeader
          icon="payments"
          title="Pricing & Session Tiers"
          subtitle={
            live
              ? reviewCopy.tiersSubtitle(draft.tiers.length)
              : '3 customizable options available'
          }
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
                {live ? naira(draft.basePrice) : `₦${serviceFlowDraft.basePrice}`}
              </VemtapText>
              {live && !(was > base) ? null : (
                <VemtapText variant="caption" tone="tertiary" className="line-through">
                  {live
                    ? naira(draft.compareAtPrice)
                    : serviceFlowDraft.compareAtPriceFormatted}
                </VemtapText>
              )}
              <VemtapText variant="caption" tone="secondary">
                • {draft?.duration || serviceFlowDraft.duration}
              </VemtapText>
            </View>
          </View>
          {live && !(was > base) ? null : (
            <View className="rounded-full bg-success-container px-2 py-1">
              <VemtapText variant="caption" tone="success" className="font-sans-semibold">
                {live
                  ? `Save \u20a6${(was - base).toLocaleString('en-NG')}`
                  : 'Save ₦4,000'}
              </VemtapText>
            </View>
          )}
        </View>
        <View className="gap-2">
          {(live
            ? draft.tiers.map(tier => ({
                id: tier.id,
                reviewName: tier.name,
                reviewDescription: tier.duration ?? '',
                price: naira(tier.price),
              }))
            : serviceTiers
          ).map(tier => (
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
              <VemtapText variant="labelMd" className="shrink-0 font-sans-bold text-text">
                {tier.price}
              </VemtapText>
            </View>
          ))}
        </View>
        {live ? null : (
          <View className="flex-row items-start gap-2 pt-1">
            <Icon name="badge" size={18} color={colors.primary} />
            <VemtapText variant="labelSm" tone="secondary" className="min-w-0 flex-1">
              {serviceFlowDraft.specialist}
            </VemtapText>
          </View>
        )}
      </ServiceSection>

      <ServiceSection>
        <ServiceSectionHeader
          icon="locationOn"
          title="Branch Availability"
          subtitle={
            live
              ? reviewCopy.branchesSubtitle(shownBranchCount)
              : `${shownBranchCount} Active Studios Serving This Treatment`
          }
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
            {live
              ? reviewCopy.notice(leadHours)
              : 'Minimum 2 hours advance booking required'}
          </VemtapText>
        </View>
      </ServiceSection>

      <ServiceSection>
        <ServiceSectionHeader
          icon="policy"
          title={live ? reviewCopy.rulesTitle : 'Booking & Safety Policies'}
          actionLabel="Edit"
          boxedIcon
        />
        <View className="gap-3">
          {(live ? ruleRows(draft) : servicePolicyRows).map((policy, index) => (
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
          {live ? draft.description : serviceFlowDraft.reviewDescription}
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

      {live && !onPreview ? null : (
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

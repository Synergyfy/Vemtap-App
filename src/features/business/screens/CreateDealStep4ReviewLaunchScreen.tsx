import React from 'react';
import { View } from 'react-native';
import { cssInterop } from 'nativewind';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon, type IconName } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { TwoColumnGrid } from '@components/shared/TwoColumnGrid';
import { colors } from '@theme/colors';
import { strings } from '@constants/strings';
import {
  BusinessInlineAction,
  BusinessProductImage,
  BusinessScreenLayout,
  BusinessSectionHeading,
  BusinessStatusPill,
  SetupCard,
} from '@features/business/components/BusinessPrimitives';
import {
  InlineImageCard,
  SetupCallout,
  SetupStepBar,
  StatusPill,
} from '@features/business/components/BusinessSetupPrimitives';
import { ServiceFlowFooter } from '@features/business/components/ServiceFlowPrimitives';
import { businessMedia, formatNaira } from '@features/business/data/businessSetupData';
import { cn } from '@utils/cn';
import type { DealReviewView } from '@features/business/utils/dealPresentation';
import type { DealLaunchPhase } from '@features/business/hooks/useDealReviewLaunch';

cssInterop(View, { className: 'style' });
cssInterop(LinearGradient, { className: 'style' });

const copy = strings.businessCreateDeal.step4;
const ORIGINAL_PRICE = 12000;
const MEMBER_PRICE = 9600;
const REACH_ESTIMATE = '~1,420';

const mapFade = {
  position: 'absolute',
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
} as const;

export interface CreateDealStep4ReviewLaunchScreenProps {
  onBack: () => void;
  onLaunch?: () => void;
  onSaveDraft?: () => void;
  onSave?: () => void;
  onEditOffer?: () => void;
  onEditRules?: () => void;
  onEditBranches?: () => void;
  /**
   * `edit` reviews changes to an existing deal: the primary action saves to
   * every branch (`onLaunch`) and there is no draft option.
   */
  mode?: 'create' | 'edit';
  /** The draft as it will publish; omit to render the Stitch prototype. */
  review?: DealReviewView;
  /** The real request's state: the button only reads "Published" after it succeeds. */
  phase?: DealLaunchPhase;
  /** A request is in flight; both actions are blocked. */
  isBusy?: boolean;
}

export function CreateDealStep4ReviewLaunchScreen({
  onBack,
  onLaunch,
  onSaveDraft,
  onSave,
  onEditOffer,
  onEditRules,
  onEditBranches,
  mode = 'create',
  review,
  phase = 'idle',
  isBusy = false,
}: CreateDealStep4ReviewLaunchScreenProps) {
  const isEdit = mode === 'edit';
  // An edit already has its item and branches; only a new deal can be blocked.
  const blocker = isEdit ? undefined : review?.blocker;
  const blocked = Boolean(blocker);

  const handleLaunch = () => {
    if (isBusy || blocked || phase === 'published') return;
    onLaunch?.();
  };

  return (
    <BusinessScreenLayout
      header={{
        eyebrow: copy.eyebrow,
        title: isEdit ? copy.editHeaderTitle : copy.headerTitle,
        onBack,
        actionLabel: isEdit ? undefined : 'Save',
        onAction: isEdit ? undefined : onSave,
      }}
      contentContainerClassName="gap-4 pb-6"
      footer={
        <ServiceFlowFooter
          primaryLabel={
            isEdit
              ? phase === 'idle'
                ? copy.saveChanges
                : phase === 'publishing'
                  ? copy.savingChanges
                  : copy.savedChanges
              : phase === 'idle'
                ? copy.publishLabel
                : phase === 'publishing'
                  ? review
                    ? copy.publishingLive
                    : copy.publishingLabel
                  : copy.publishedLabel
          }
          primaryRightIcon={phase === 'published' ? 'checkCircle' : null}
          onPrimary={handleLaunch}
          primaryDisabled={isBusy || blocked}
          secondaryLabel={isEdit ? undefined : copy.saveDraft}
          onSecondary={isEdit ? undefined : () => onSaveDraft?.()}
          secondaryDisabled={isBusy || blocked}
          footnote={<LaunchFootnote text={copy.footnote} />}
        />
      }
    >
      <SetupStepBar
        step={`${copy.stepLabel} \u00b7 ${copy.finalReview}`}
        percent={copy.percentLabel}
        progress={100}
        stepStyle="plain"
        trailing={
          blocked ? (
            <StatusPill label={copy.needsAttentionPill} tone="warning" icon="info" />
          ) : (
            <StatusPill label={copy.readyPill} tone="success" icon="checkCircle" />
          )
        }
      />

      <View>
        {blocker ? (
          <SetupCallout
            icon="info"
            title={copy.needsAttentionPill}
            body={blocker}
            tone="subtle"
            iconSurface="circleMd"
            iconSize={20}
            className="p-4"
          />
        ) : (
          <SetupCallout
            icon="autoAwesome"
            title={copy.celebrateTitle}
            body={copy.celebrateBody}
            tone="tint"
            iconSurface="circleMd"
            iconSize={20}
            className="p-4"
          />
        )}
      </View>

      <View className="gap-4">
        <SetupCard className="gap-4">
          <View className="flex-row flex-wrap items-center justify-between gap-2">
            <VemtapText
              variant="labelMd"
              tone="secondary"
              className="min-w-0 flex-1 uppercase tracking-wider"
            >
              {copy.showcaseTitle}
            </VemtapText>
            <BusinessInlineAction label={copy.edit} icon="edit" onPress={onEditOffer} />
          </View>
          <View className="flex-row items-start gap-3">
            <View className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-surface-container">
              {review && !review.image ? null : (
                <BusinessProductImage
                  source={review?.image ?? businessMedia.ribeyeCover}
                  alt={
                    review?.image?.alt ??
                    'Woodfire aged ribeye steak on a rustic dark slate board'
                  }
                  className="h-full w-full"
                />
              )}
              <View className="absolute left-1.5 top-1.5 rounded-full bg-badge-discount-bg px-1.5 py-0.5 shadow-sm">
                <VemtapText
                  variant="caption"
                  className="font-sans-semibold text-badge-discount-text"
                >
                  {review?.discountBadge ?? copy.discountBadge}
                </VemtapText>
              </View>
            </View>
            <View className="min-w-0 flex-1">
              {review ? null : (
                <View className="flex-row flex-wrap items-center gap-1.5">
                  <View className="rounded-full bg-surface-container px-2 py-0.5">
                    <VemtapText variant="caption" tone="secondary">
                      {copy.autoSynced}
                    </VemtapText>
                  </View>
                  <View className="rounded-full bg-surface-tint-blue px-2 py-0.5">
                    <VemtapText variant="caption" className="text-primary">
                      {copy.flashDeal}
                    </VemtapText>
                  </View>
                </View>
              )}
              <VemtapText variant="headingSm" numberOfLines={2} className="mt-1">
                {review?.title ?? copy.offerTitle}
              </VemtapText>
              {(review ? review.body : copy.offerBody) ? (
                <VemtapText variant="bodyMd" tone="secondary" numberOfLines={2}>
                  {review ? review.body : copy.offerBody}
                </VemtapText>
              ) : null}
            </View>
          </View>

          <View className="gap-2 rounded-xl bg-surface-subtle p-3">
            {review && !review.originalPrice ? null : (
              <>
                <View className="flex-row items-baseline justify-between gap-3">
                  <VemtapText
                    variant="bodyMd"
                    tone="secondary"
                    className="min-w-0 flex-1"
                  >
                    {copy.originalPrice}
                  </VemtapText>
                  <VemtapText
                    variant="bodyMd"
                    tone="secondary"
                    className="shrink-0 line-through"
                  >
                    {review?.originalPrice ?? formatNaira(ORIGINAL_PRICE)}
                  </VemtapText>
                </View>
                <View className="flex-row items-start justify-between gap-3 pt-1">
                  <View className="min-w-0 flex-1">
                    <VemtapText variant="headingSm" className="font-sans-semibold">
                      {copy.memberPay}
                    </VemtapText>
                    <VemtapText variant="caption" className="text-badge-discount-text">
                      {review?.savings ?? copy.instantSavings}
                    </VemtapText>
                  </View>
                  <VemtapText
                    variant="headingLg"
                    className="shrink-0 font-sans-bold text-primary"
                  >
                    {review?.memberPrice ?? formatNaira(MEMBER_PRICE)}
                  </VemtapText>
                </View>
              </>
            )}
            <View className="mt-2 flex-row items-center justify-between gap-3 rounded-lg bg-surface-canvas px-3 py-2 shadow-sm">
              <View className="min-w-0 flex-1 flex-row items-center gap-2">
                <Icon name="localOffer" size={18} color={colors.primary} />
                <VemtapText variant="labelSm" numberOfLines={1}>
                  {review?.strategySummary ?? copy.strategySummary}
                </VemtapText>
              </View>
              <Icon name="verified" size={16} color={colors.textTertiary} />
            </View>
          </View>
        </SetupCard>

        <SetupCard className="gap-3">
          <BusinessSectionHeading
            title={copy.rulesTitle}
            icon="tune"
            trailing={
              <BusinessInlineAction label={copy.edit} icon="edit" onPress={onEditRules} />
            }
          />
          <TwoColumnGrid
            items={[
              {
                label: copy.availableVouchers,
                value: review?.vouchers ?? copy.vouchersValue,
                note: review?.vouchersNote ?? copy.vouchersNote,
              },
              {
                label: copy.claimLimit,
                value: review?.claimLimit ?? copy.claimLimitValue,
                note: review?.claimLimitNote ?? copy.claimLimitNote,
              },
            ]}
            keyExtractor={item => item.label}
            renderItem={item => <SummaryTile {...item} />}
          />
          <RuleRow
            icon="gifting"
            title={review?.giftingTitle ?? copy.giftingTitle}
            body={review?.giftingBody ?? copy.giftingBody}
          />
          {review ? null : (
            <>
              <RuleRow
                icon="restaurant"
                title={copy.orderTypes}
                body={undefined}
                trailing={
                  <View className="mt-1 flex-row flex-wrap items-center gap-2">
                    <ChannelPill label={copy.dineIn} tone="success" />
                    <ChannelPill label={copy.pickup} tone="success" />
                    <ChannelPill label={copy.delivery} tone="neutral" />
                  </View>
                }
              />
              <RuleRow
                icon="hourglass"
                title={copy.advanceNotice}
                body={copy.advanceBody}
              />
            </>
          )}
        </SetupCard>

        <SetupCard className="gap-3">
          <BusinessSectionHeading
            title={copy.branchesTitle}
            icon="storefront"
            trailing={
              <BusinessInlineAction
                label={copy.edit}
                icon="edit"
                onPress={onEditBranches}
              />
            }
          />
          {review?.branchesNote ? (
            <VemtapText variant="caption" tone="secondary">
              {review.branchesNote}
            </VemtapText>
          ) : null}
          <View className="gap-2">
            {(review?.branches ?? copy.branches).map(branch => (
              <View
                key={branch.id}
                className="flex-row items-center justify-between gap-3 rounded-lg bg-surface-subtle p-2.5"
              >
                <View className="min-w-0 flex-1 flex-row items-center gap-2.5">
                  <Icon name="locationOn" size={18} color={colors.primary} />
                  <View className="min-w-0 flex-1">
                    <VemtapText variant="labelMd" numberOfLines={1}>
                      {branch.name}
                    </VemtapText>
                    {branch.address ? (
                      <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                        {branch.address}
                      </VemtapText>
                    ) : null}
                  </View>
                </View>
                <View className="shrink-0">
                  <BusinessStatusPill label={copy.active} tone="success" />
                </View>
              </View>
            ))}
          </View>
          {review ? (
            <SummaryTile
              label={copy.duration}
              value={review.duration}
              note={review.durationNote}
              surface="containerLow"
            />
          ) : (
            <TwoColumnGrid
              items={[
                {
                  label: copy.redeemHours,
                  value: copy.redeemHoursValue,
                  note: copy.redeemHoursNote,
                  noteTone: 'brand' as const,
                  surface: 'containerLow' as const,
                },
                {
                  label: copy.duration,
                  value: copy.durationValue,
                  note: copy.durationNote,
                  noteTone: 'secondary' as const,
                  surface: 'containerLow' as const,
                },
              ]}
              keyExtractor={item => item.label}
              renderItem={item => <SummaryTile {...item} />}
            />
          )}
        </SetupCard>

        {review ? (
          <SetupCard className="gap-3">
            <BusinessSectionHeading
              title={copy.termsTitle}
              icon="policy"
              trailing={
                <BusinessInlineAction
                  label={copy.edit}
                  icon="edit"
                  onPress={onEditBranches}
                />
              }
            />
            {review.claimSteps.length ? (
              <ReviewList
                label={copy.claimStepsLabel}
                lines={review.claimSteps}
                numbered
              />
            ) : null}
            {review.terms.length ? (
              <ReviewList label={copy.termsLabel} lines={review.terms} />
            ) : null}
            {review.claimSteps.length || review.terms.length ? null : (
              <VemtapText variant="caption" tone="secondary">
                {copy.noTerms}
              </VemtapText>
            )}
          </SetupCard>
        ) : null}

        {review ? null : (
          <SetupCard className="gap-4">
            <BusinessSectionHeading
              title={copy.audienceTitle}
              icon="radar"
              trailing={<StatusPill label={copy.hyperlocalLive} tone="brand" />}
            />
            <View className="flex-row items-center gap-3 rounded-xl bg-surface-tint-blue p-3">
              <View className="h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary shadow-lg">
                <Icon name="activeNotifications" size={24} color={colors.surface} />
              </View>
              <View className="min-w-0 flex-1">
                <View className="flex-row items-baseline gap-1">
                  <VemtapText variant="headingLg" className="font-sans-bold">
                    {REACH_ESTIMATE}
                  </VemtapText>
                  <VemtapText variant="labelSm" className="text-primary">
                    {copy.foodies}
                  </VemtapText>
                </View>
                <VemtapText variant="caption" tone="secondary">
                  {copy.reachBody}
                </VemtapText>
              </View>
            </View>
            <View className="gap-2">
              <ReachRow icon="pushPin" text={copy.pinned} />
              <ReachRow
                icon="verifiedUser"
                text={copy.zeroCommission}
                iconColor={colors.badgeDiscountText}
              />
            </View>
            <View>
              <InlineImageCard
                uri={businessMedia.reviewMap.uri}
                alt={copy.mapAlt}
                height={112}
              >
                <LinearGradient
                  colors={['transparent', 'rgba(20, 27, 43, 0.7)']}
                  locations={[0, 1]}
                  style={mapFade}
                  pointerEvents="none"
                />
                <View className="absolute inset-x-0 bottom-0 flex-row items-center gap-1.5 p-2.5">
                  <Icon name="myLocation" size={14} color={colors.surface} />
                  <VemtapText variant="caption" className="text-surface">
                    {copy.coverageZone}
                  </VemtapText>
                </View>
              </InlineImageCard>
            </View>
          </SetupCard>
        )}
      </View>
    </BusinessScreenLayout>
  );
}

function SummaryTile({
  label,
  value,
  note,
  noteTone = 'secondary',
  surface = 'subtle',
}: {
  label: string;
  value: string;
  note: string;
  noteTone?: 'brand' | 'secondary';
  surface?: 'subtle' | 'containerLow';
}) {
  return (
    <View
      className={cn(
        'flex-col gap-0.5 rounded-lg p-3',
        surface === 'subtle' ? 'bg-surface-subtle' : 'bg-surface-container-low',
      )}
    >
      <VemtapText variant="caption" tone="secondary">
        {label}
      </VemtapText>
      <VemtapText variant="headingSm" className="font-sans-semibold" numberOfLines={1}>
        {value}
      </VemtapText>
      <VemtapText
        variant="caption"
        tone={noteTone === 'brand' ? 'brand' : 'secondary'}
        numberOfLines={1}
      >
        {note}
      </VemtapText>
    </View>
  );
}

/** A labelled list of the deal's terms or numbered claim steps. */
function ReviewList({
  label,
  lines,
  numbered = false,
}: {
  label: string;
  lines: string[];
  numbered?: boolean;
}) {
  return (
    <View className="gap-1.5">
      <VemtapText
        variant="micro"
        tone="secondary"
        className="font-sans-semibold uppercase tracking-wider"
      >
        {label}
      </VemtapText>
      <View className="gap-1.5 rounded-lg bg-surface-subtle p-3">
        {lines.map((line, index) => (
          <View key={line} className="flex-row items-start gap-2">
            {numbered ? (
              <View className="mt-0.5 h-4 w-4 shrink-0 items-center justify-center rounded-full bg-surface-container">
                <VemtapText variant="micro" className="font-sans-semibold">
                  {String(index + 1)}
                </VemtapText>
              </View>
            ) : (
              <View className="mt-2 h-1 w-1 shrink-0 rounded-full bg-text-secondary" />
            )}
            <VemtapText variant="caption" tone="secondary" className="min-w-0 flex-1">
              {line}
            </VemtapText>
          </View>
        ))}
      </View>
    </View>
  );
}

function RuleRow({
  icon,
  title,
  body,
  trailing,
}: {
  icon: IconName;
  title: string;
  body?: string;
  trailing?: React.ReactNode;
}) {
  return (
    <View className="flex-row items-start gap-2">
      <View className="mt-0.5 h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-container">
        <Icon name={icon} size={16} color={colors.primary} />
      </View>
      <View className="min-w-0 flex-1">
        <VemtapText variant="labelMd">{title}</VemtapText>
        {body ? (
          <VemtapText variant="caption" tone="secondary">
            {body}
          </VemtapText>
        ) : null}
        {trailing}
      </View>
    </View>
  );
}

function ChannelPill({ label, tone }: { label: string; tone: 'success' | 'neutral' }) {
  return (
    <View
      className={cn(
        'flex-row items-center gap-1 rounded-full px-2 py-0.5',
        tone === 'success' ? 'bg-badge-discount-bg' : 'bg-surface-container',
      )}
    >
      <Icon
        name={tone === 'success' ? 'check' : 'close'}
        size={13}
        color={tone === 'success' ? colors.badgeDiscountText : colors.textTertiary}
      />
      <VemtapText
        variant="caption"
        className={tone === 'success' ? 'text-badge-discount-text' : 'text-text-tertiary'}
      >
        {label}
      </VemtapText>
    </View>
  );
}

function ReachRow({
  icon,
  text,
  iconColor,
}: {
  icon: IconName;
  text: string;
  iconColor?: string;
}) {
  return (
    <View className="flex-row items-start gap-2.5">
      <View className="pt-0.5">
        <Icon name={icon} size={18} color={iconColor ?? colors.primary} />
      </View>
      <VemtapText variant="bodyMd" className="min-w-0 flex-1">
        {text}
      </VemtapText>
    </View>
  );
}

function LaunchFootnote({ text }: { text: string }) {
  return (
    <VemtapText variant="caption" tone="tertiary" className="px-4 text-center">
      {text}
    </VemtapText>
  );
}

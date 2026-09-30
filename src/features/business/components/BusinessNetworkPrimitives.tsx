import React from 'react';
import { Pressable, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { Icon, type IconName } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { cn } from '@utils/cn';
import { colors } from '@theme/colors';
import { BusinessStatusPill, type BusinessPillTone } from './BusinessPrimitives';
import { BusinessIconWell, BusinessProgressMeter } from './BusinessOpsPrimitives';

cssInterop(Pressable, { className: 'style' });
cssInterop(View, { className: 'style' });

/* -------------------------------------------------------------------------- */
/* Milestone tier card                                                        */
/* -------------------------------------------------------------------------- */

export type NetworkMilestoneState = 'unlocked' | 'active' | 'locked';

export interface NetworkMilestoneCardProps {
  name: string;
  threshold: string;
  state: NetworkMilestoneState;
  icon: IconName;
  /** Active tier, e.g. `Active Tier (7/5)`. */
  tierNote?: string;
  /** Locked/active caption, e.g. `3 more needed`. */
  progressNote?: string;
  /** 0–100 toward this tier; drives the progress meter. */
  percent?: number;
  /** `7 of 10 verified`. */
  verifiedCaption?: string;
  perks: readonly { text: string }[];
  onPress?: () => void;
  accessibilityLabel?: string;
  className?: string;
}

const milestoneStateLabel: Record<NetworkMilestoneState, string> = {
  unlocked: 'Unlocked',
  active: 'Active Tier',
  locked: 'Locked',
};

const milestoneStateTone: Record<NetworkMilestoneState, BusinessPillTone> = {
  unlocked: 'success',
  active: 'brand',
  locked: 'neutral',
};

const milestoneStateIcon: Record<NetworkMilestoneState, IconName> = {
  unlocked: 'checkBold',
  active: 'star',
  locked: 'lock',
};

const milestoneStateTile: Record<NetworkMilestoneState, string> = {
  unlocked: 'bg-badge-discount-bg',
  active: 'bg-surface-tint',
  locked: 'bg-surface-container-high',
};

const milestoneStateGlyph: Record<NetworkMilestoneState, string> = {
  unlocked: colors.badgeDiscountText,
  active: colors.primary,
  locked: colors.outline,
};

/**
 * One rung of the network growth ladder: icon, tier name, verification
 * threshold, state pill, progress toward the threshold and the perks it grants.
 * Single owner of the ladder so the milestone screen and the dashboard can
 * never disagree on a tier's state or copy.
 */
export function NetworkMilestoneCard({
  name,
  threshold,
  state,
  icon,
  tierNote,
  progressNote,
  percent,
  verifiedCaption,
  perks,
  onPress,
  accessibilityLabel,
  className,
}: NetworkMilestoneCardProps) {
  const locked = state === 'locked';
  const Wrapper = onPress ? Pressable : View;
  return (
    <Wrapper
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={accessibilityLabel ?? name}
      onPress={onPress}
      className={cn(
        'gap-2 rounded-card bg-surface p-3 shadow-sm',
        locked && 'opacity-75',
        onPress && 'active:bg-surface-subtle',
        className,
      )}
    >
      <View className="flex-row items-center gap-2.5">
        <View
          className={cn(
            'h-10 w-10 shrink-0 items-center justify-center rounded-lg',
            milestoneStateTile[state],
          )}
        >
          <Icon name={icon} size={20} color={milestoneStateGlyph[state]} />
        </View>
        <View className="min-w-0 flex-1">
          <VemtapText
            variant="labelMd"
            className="min-w-0 font-sans-semibold"
            numberOfLines={2}
          >
            {name}
          </VemtapText>
          <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
            {threshold}
          </VemtapText>
        </View>
        <BusinessStatusPill
          label={tierNote ?? progressNote ?? milestoneStateLabel[state]}
          tone={milestoneStateTone[state]}
        />
      </View>

      {typeof percent === 'number' ? (
        <BusinessProgressMeter
          label={verifiedCaption ?? threshold}
          value={String(percent)}
          percent={percent}
          tone={state === 'active' ? 'primary' : 'tertiary'}
        />
      ) : null}

      <View className="gap-1.5">
        {perks.map(perk => (
          <View key={perk.text} className="flex-row items-start gap-2">
            <Icon
              name={milestoneStateIcon[state]}
              size={14}
              color={locked ? colors.outline : colors.badgeDiscountText}
            />
            <VemtapText
              variant="caption"
              tone="secondary"
              className="min-w-0 flex-1"
              numberOfLines={2}
            >
              {perk.text}
            </VemtapText>
          </View>
        ))}
      </View>
    </Wrapper>
  );
}

/* -------------------------------------------------------------------------- */
/* Network partner / referral row                                             */
/* -------------------------------------------------------------------------- */

export interface NetworkPartnerRowProps {
  name: string;
  initials: string;
  subtitle: string;
  meta?: string;
  status: string;
  statusTone: BusinessPillTone;
  icon?: IconName;
  /** Renders a trailing chevron instead of a status pill. */
  chevron?: boolean;
  onPress?: () => void;
  accessibilityLabel?: string;
  className?: string;
}

/**
 * Tappable merchant row used by the referral directory, the recently-connected
 * list and the dashboard connections — initials avatar, name, category and a
 * status pill or chevron.
 */
export function NetworkPartnerRow({
  name,
  initials,
  subtitle,
  meta,
  status,
  statusTone,
  icon,
  chevron = false,
  onPress,
  accessibilityLabel,
  className,
}: NetworkPartnerRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? name}
      onPress={onPress}
      className={cn(
        'min-h-[56px] flex-row items-center gap-3 rounded-field bg-surface-subtle p-2.5 active:bg-surface-container',
        className,
      )}
    >
      <View className="h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-tint">
        {icon ? (
          <Icon name={icon} size={19} color={colors.primary} />
        ) : (
          <VemtapText
            variant="labelSm"
            className="font-sans-bold text-primary"
            numberOfLines={1}
          >
            {initials}
          </VemtapText>
        )}
      </View>
      <View className="min-w-0 flex-1">
        <VemtapText
          variant="labelMd"
          className="min-w-0 font-sans-semibold"
          numberOfLines={1}
        >
          {name}
        </VemtapText>
        <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
          {subtitle}
        </VemtapText>
        {meta ? (
          <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
            {meta}
          </VemtapText>
        ) : null}
      </View>
      {chevron ? (
        <View className="shrink-0">
          <Icon name="forward" size={18} color={colors.textTertiary} />
        </View>
      ) : (
        <BusinessStatusPill label={status} tone={statusTone} />
      )}
    </Pressable>
  );
}

/* -------------------------------------------------------------------------- */
/* Tinted info banner                                                         */
/* -------------------------------------------------------------------------- */

export interface NetworkInfoBannerProps {
  title: string;
  body?: string;
  icon: IconName;
  /** `plain` is a neutral footnote; `tint` is the actionable callout. */
  tone?: 'tint' | 'plain';
  onPress?: () => void;
  accessibilityLabel?: string;
  className?: string;
}

/**
 * The single-line highlight strip used for referral-link, scan and tier-status
 * callouts. One owner so the banner's surface, radius and type ramp stay
 * identical wherever the network surfaces nudge the merchant.
 */
export function NetworkInfoBanner({
  title,
  body,
  icon,
  tone = 'tint',
  onPress,
  accessibilityLabel,
  className,
}: NetworkInfoBannerProps) {
  const Wrapper = onPress ? Pressable : View;
  return (
    <Wrapper
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={accessibilityLabel ?? title}
      onPress={onPress}
      className={cn(
        'flex-row items-center gap-2.5 rounded-card p-3',
        tone === 'tint' ? 'bg-surface-tint' : 'bg-surface-subtle',
        onPress && 'active:opacity-80',
        className,
      )}
    >
      <BusinessIconWell
        icon={icon}
        tone={tone === 'tint' ? 'brand' : 'neutral'}
        className={tone === 'tint' ? 'bg-surface' : undefined}
      />
      <View className="min-w-0 flex-1">
        <VemtapText
          variant="caption"
          className={cn('min-w-0 font-sans-semibold', tone === 'tint' && 'text-primary')}
          numberOfLines={2}
        >
          {title}
        </VemtapText>
        {body ? (
          <VemtapText
            variant="micro"
            tone={tone === 'tint' ? undefined : 'tertiary'}
            className={cn('mt-0.5', tone === 'tint' && 'text-primary')}
            numberOfLines={2}
          >
            {body}
          </VemtapText>
        ) : null}
      </View>
    </Wrapper>
  );
}

/* -------------------------------------------------------------------------- */
/* Network growth summary                                                     */
/* -------------------------------------------------------------------------- */

export interface NetworkGrowthSummaryProps {
  verifiedCount: string;
  tierName: string;
  nextTierName: string;
  remaining: string;
  remainingTotal: string;
  percent: number;
  nextMilestoneBody: string;
  onViewMilestones?: () => void;
  milestonesCta?: string;
  className?: string;
}

/**
 * The "you are N verified, M to go" block shared by the network screen and the
 * network dashboard so the progress figure is stated identically in both.
 */
export function NetworkGrowthSummary({
  verifiedCount,
  tierName,
  nextTierName,
  remaining,
  remainingTotal,
  percent,
  nextMilestoneBody,
  onViewMilestones,
  milestonesCta,
  className,
}: NetworkGrowthSummaryProps) {
  return (
    <View className={cn('gap-2.5 rounded-card bg-surface p-4 shadow-sm', className)}>
      <View className="flex-row items-center gap-3">
        <View className="h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-surface-tint">
          <Icon name="shield" size={24} color={colors.primary} />
        </View>
        <View className="min-w-0 flex-1">
          <VemtapText variant="caption" tone="tertiary" numberOfLines={1}>
            {verifiedCount} Verified
          </VemtapText>
          <VemtapText
            variant="labelMd"
            className="min-w-0 font-sans-semibold"
            numberOfLines={1}
          >
            {tierName}
          </VemtapText>
        </View>
        <BusinessStatusPill label={`${remaining} more`} tone="brand" />
      </View>

      <BusinessProgressMeter
        label={nextTierName}
        value={`${percent}%`}
        percent={percent}
        filledLabel={`${remainingTotal} verified`}
      />

      <VemtapText
        variant="caption"
        tone="secondary"
        className="leading-relaxed"
        numberOfLines={3}
      >
        {nextMilestoneBody}
      </VemtapText>

      {milestonesCta ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={milestonesCta}
          onPress={onViewMilestones}
          className="min-h-10 flex-row items-center gap-1.5 self-start px-1"
        >
          <Icon name="trophy" size={16} color={colors.primary} />
          <VemtapText
            variant="labelSm"
            className="font-sans-semibold text-primary"
            numberOfLines={1}
          >
            {milestonesCta}
          </VemtapText>
          <Icon name="forward" size={15} color={colors.primary} />
        </Pressable>
      ) : null}
    </View>
  );
}

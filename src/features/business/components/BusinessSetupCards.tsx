import React, { useState } from 'react';
import { RangeSlider } from '@components/ui/RangeSlider';
import { Pressable, StyleSheet, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon, type IconName } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';
import { cn } from '@utils/cn';
import { businessIntroCopy, businessLocationCopy } from '@features/business/businessCopy';
import type {
  BranchSummary,
  BusinessPillar,
  CatalogItem,
  SocialPresence,
} from '@features/business/businessData';
import {
  InlineImageCard,
  MetaLine,
  StatusPill,
  TextActionButton,
  Thumbnail,
} from '@features/business/components/BusinessSetupPrimitives';

cssInterop(View, { className: 'style' });
cssInterop(Pressable, { className: 'style' });

const pillarIconTone: Record<BusinessPillar['iconTone'], { bg: string; fg: string }> = {
  brand: { bg: 'bg-surface-tint-blue', fg: colors.primary },
  tertiary: { bg: 'bg-tertiary-fixed', fg: colors.tertiary },
  success: { bg: 'bg-badge-discount-bg', fg: colors.badgeDiscountText },
  neutral: { bg: 'bg-surface-container', fg: colors.surfaceDark },
  secondary: { bg: 'bg-secondary-container', fg: colors.onSecondaryContainer },
};

export function PillarRow({ pillar }: { pillar: BusinessPillar }) {
  const tone = pillarIconTone[pillar.iconTone];
  return (
    <View className="flex-row items-start gap-3 rounded-card bg-surface-container-lowest p-4 shadow-sm">
      <View
        className={cn(
          'h-11 w-11 shrink-0 items-center justify-center rounded-xl',
          tone.bg,
        )}
      >
        <Icon name={pillar.icon} size={24} color={tone.fg} />
      </View>
      <View className="min-w-0 flex-1">
        <View className="flex-row flex-wrap items-center justify-between gap-2">
          <VemtapText variant="headingSm" className="min-w-0 text-text">
            {pillar.title}
          </VemtapText>
          <VemtapText
            variant="caption"
            className={cn(
              'shrink-0 font-sans-semibold',
              pillar.iconTone === 'success'
                ? 'text-badge-discount-text'
                : pillar.iconTone === 'tertiary'
                  ? 'text-tertiary'
                  : 'text-primary',
            )}
          >
            {pillar.tag}
          </VemtapText>
        </View>
        <VemtapText variant="bodyMd" tone="secondary" className="mt-1">
          {pillar.body}
        </VemtapText>
      </View>
    </View>
  );
}

export function SocialProofTile({
  avatarUri,
  quote,
  author,
}: {
  avatarUri: string;
  quote: string;
  author: string;
}) {
  return (
    <View className="flex-row items-center gap-3 rounded-card bg-surface-container p-4">
      <Thumbnail uri={avatarUri} label={author} className="h-12 w-12 rounded-xl" />
      <View className="min-w-0 flex-1">
        <VemtapText
          variant="labelSm"
          numberOfLines={3}
          className="italic text-on-surface"
        >
          {quote}
        </VemtapText>
        <VemtapText
          variant="caption"
          tone="secondary"
          className="mt-0.5 font-sans-medium"
        >
          {author}
        </VemtapText>
      </View>
    </View>
  );
}

export function TrustRow({ label }: { label: string }) {
  return (
    <View className="flex-row items-center gap-1">
      <Icon name="checkCircle" size={14} color={colors.badgeDiscountText} />
      <VemtapText variant="caption" className="font-sans-medium text-text-secondary">
        {label}
      </VemtapText>
    </View>
  );
}

export interface PulseStripProps {
  title: string;
  body: string;
  onPress?: () => void;
}

export function PulseStrip({ title, body, onPress }: PulseStripProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      className="flex-row items-center justify-between gap-2 bg-surface-subtle px-4 py-3 active:bg-surface-container-low"
    >
      <View className="min-w-0 flex-1 flex-row items-center gap-2">
        <View className="h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-tint-blue">
          <Icon name="signal" size={18} color={colors.primary} />
        </View>
        <View className="min-w-0 flex-1">
          <VemtapText variant="labelSm" className="font-sans-semibold text-text">
            {title}
          </VemtapText>
          <VemtapText variant="caption" tone="secondary">
            {body}
          </VemtapText>
        </View>
      </View>
      <Icon name="forward" size={20} color={colors.textTertiary} />
    </Pressable>
  );
}

export interface StorefrontHeroProps {
  imageUri: string;
  districtLabel: string;
  badgeLabel: string;
  footfallLabel: string;
  footfallValue: string;
  returnLabel: string;
  returnValue: string;
}

export function StorefrontHero({
  imageUri,
  districtLabel,
  badgeLabel,
  footfallLabel,
  footfallValue,
  returnLabel,
  returnValue,
}: StorefrontHeroProps) {
  return (
    <View className="overflow-hidden rounded-card bg-surface-container-lowest shadow-md">
      <View className="relative h-48 w-full bg-surface-dim">
        <View className="h-full w-full">
          <InlineImageCard
            uri={imageUri}
            height={192}
            rounded="card"
            className="h-full w-full rounded-none shadow-none"
          />
        </View>
        <LinearGradient
          colors={['transparent', 'rgba(20, 27, 43, 0.3)', 'rgba(20, 27, 43, 0.92)']}
          locations={[0, 0.5, 1]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        <View className="absolute left-3 right-3 top-3 flex-row items-center justify-between gap-2">
          <View className="min-w-0 flex-row items-center gap-1 rounded-full bg-surface-canvas/90 px-2.5 py-1">
            <Icon name="locationOn" size={16} color={colors.primary} />
            <VemtapText variant="labelSm" className="min-w-0 text-text" numberOfLines={1}>
              {districtLabel}
            </VemtapText>
          </View>
          <View className="shrink-0 flex-row items-center gap-1 rounded-full bg-badge-discount-bg px-2.5 py-1">
            <Icon name="verified" size={14} color={colors.badgeDiscountText} />
            <VemtapText
              variant="labelSm"
              className="font-sans-semibold text-badge-discount-text"
            >
              {badgeLabel}
            </VemtapText>
          </View>
        </View>
        <View className="absolute bottom-3 left-3 right-3 flex-row items-end justify-between gap-3">
          <View className="min-w-0 flex-1">
            <VemtapText
              variant="caption"
              className="font-sans-medium uppercase tracking-wider text-primary-foreground opacity-90"
            >
              {footfallLabel}
            </VemtapText>
            <View className="flex-row items-center gap-1.5">
              <VemtapText
                variant="headingSm"
                className="font-sans-bold text-primary-foreground"
                numberOfLines={1}
              >
                {footfallValue}
              </VemtapText>
              <View className="h-2 w-2 rounded-full bg-badge-discount-text" />
            </View>
          </View>
          <View className="shrink-0 items-end">
            <VemtapText
              variant="caption"
              className="font-sans-medium uppercase tracking-wider text-primary-foreground opacity-90"
            >
              {returnLabel}
            </VemtapText>
            <VemtapText variant="headingSm" className="font-sans-bold text-primary-200">
              {returnValue}
            </VemtapText>
          </View>
        </View>
      </View>
      <PulseStrip
        title={businessIntroCopy.pulseTitle}
        body={businessIntroCopy.pulseBody}
      />
    </View>
  );
}

export interface RadiusSliderProps {
  min: number;
  max: number;
  step: number;
  initialValue: number;
  onChange?: (value: number) => void;
  accessibilityLabel?: string;
}

/**
 * Business-setup wrapper over the shared `RadiusSlider` owner so branch radius
 * and the consumer location/filter sheets share one rail implementation
 * (AGENTS rule 17). Uncontrolled here via `initialValue`; the shared primitive
 * is controlled.
 */
export function RadiusSlider({
  min,
  max,
  step,
  initialValue,
  onChange,
  accessibilityLabel = 'Radius',
}: RadiusSliderProps) {
  const [value, setValue] = useState(initialValue);
  return (
    <RangeSlider
      value={value}
      min={min}
      max={max}
      step={step}
      accessibilityLabel={accessibilityLabel}
      onChange={next => {
        setValue(next);
        onChange?.(next);
      }}
    />
  );
}

export function BranchCard({
  branch,
  onEdit,
  onManageHours,
}: {
  branch: BranchSummary;
  onEdit?: () => void;
  onManageHours?: () => void;
}) {
  return (
    <View className="gap-3 rounded-card bg-surface-container-lowest p-4 shadow-md">
      <View className="flex-row items-start gap-3">
        <Thumbnail uri={branch.imageUri} label={branch.name} />
        <View className="min-w-0 flex-1">
          <View className="mb-1 flex-row flex-wrap items-center justify-between gap-1">
            <VemtapText
              variant="headingSm"
              className="min-w-0 flex-1 text-text"
              numberOfLines={1}
            >
              {branch.name}
            </VemtapText>
            <View className="shrink-0 flex-row items-center gap-1.5">
              {branch.isPrimary ? (
                <StatusPill label="Primary" tone="brand" className="px-2 py-0.5" />
              ) : null}
              <View className="flex-row items-center gap-1 rounded-full bg-badge-discount-bg px-2 py-0.5">
                <View className="h-1.5 w-1.5 rounded-full bg-badge-discount-text" />
                <VemtapText
                  variant="labelSm"
                  className="font-sans-semibold text-badge-discount-text"
                >
                  Active (Trial)
                </VemtapText>
              </View>
            </View>
          </View>
          <VemtapText variant="labelSm" tone="secondary" numberOfLines={1}>
            {branch.businessLine}
          </VemtapText>
        </View>
      </View>
      <View className="gap-1.5 rounded-lg bg-surface-subtle p-3">
        <MetaLine icon="locationOn" value={branch.address} />
        <MetaLine icon="phone" value={branch.phone} />
        <View className="flex-row items-center gap-2">
          <Icon name="schedule" size={17} color={colors.badgeDiscountText} />
          <VemtapText variant="caption" className="font-sans-medium text-text">
            {branch.openStatus}
          </VemtapText>
          <VemtapText
            variant="caption"
            tone="secondary"
            className="min-w-0 flex-1"
            numberOfLines={1}
          >
            {branch.hours}
          </VemtapText>
        </View>
      </View>
      <View className="flex-row gap-2">
        <TextActionButton
          label={businessLocationCopy.locations.editBranch}
          icon="edit"
          onPress={onEdit}
          className="min-h-[40px] flex-1 bg-surface-container px-2"
        />
        <TextActionButton
          label={businessLocationCopy.locations.manageHours}
          icon="eventAvailable"
          onPress={onManageHours}
          className="min-h-[40px] flex-1 bg-surface-container px-2"
        />
      </View>
    </View>
  );
}

export function AddBranchRow({ onPress }: { onPress?: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={businessLocationCopy.locations.addBranch}
      onPress={onPress}
      className="w-full flex-row items-center gap-3 rounded-card bg-surface-tint-blue px-4 py-3 shadow-sm active:scale-[0.99]"
    >
      <View className="h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary shadow-sm">
        <Icon name="addBusiness" size={22} color={colors.surface} />
      </View>
      <View className="min-w-0 flex-1">
        <VemtapText variant="button" className="font-sans-semibold text-primary">
          {businessLocationCopy.locations.addBranch}
        </VemtapText>
        <VemtapText variant="caption" tone="secondary" numberOfLines={2}>
          {businessLocationCopy.locations.addBranchBody}
        </VemtapText>
      </View>
      <Icon name="forward" size={20} color={colors.primary} />
    </Pressable>
  );
}

export function CatalogItemCard({
  item,
  onEdit,
  onRemove,
}: {
  item: CatalogItem;
  onEdit?: () => void;
  onRemove?: () => void;
}) {
  const availabilityColor =
    item.availabilityTone === 'success' ? colors.badgeDiscountText : colors.secondary;

  return (
    <View className="overflow-hidden rounded-card bg-surface-container-lowest shadow-sm">
      <View className="flex-row items-start gap-3 p-4">
        {item.image ? (
          <Thumbnail source={item.image} label={item.title} className="h-20 w-20" />
        ) : (
          <View className="h-20 w-20 shrink-0 flex-col items-center justify-center rounded-lg bg-surface-tint-blue">
            <Icon name="wine" size={30} color={colors.primary} />
            <VemtapText
              variant="caption"
              className="mt-0.5 font-sans-semibold uppercase tracking-wide text-primary"
            >
              Experience
            </VemtapText>
          </View>
        )}
        <View className="min-w-0 flex-1">
          <View className="flex-row items-start justify-between gap-2">
            <View className="min-w-0 flex-1">
              <VemtapText
                variant="caption"
                tone="tertiary"
                numberOfLines={1}
                className="font-sans-semibold uppercase tracking-wider"
              >
                {item.category}
              </VemtapText>
              <VemtapText
                variant="labelMd"
                className="mt-0.5 font-sans-semibold text-text"
                numberOfLines={1}
              >
                {item.title}
              </VemtapText>
            </View>
            <View className="shrink-0 flex-row items-center gap-1">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Edit ${item.title}`}
                hitSlop={6}
                onPress={onEdit}
                className="h-8 w-8 items-center justify-center rounded-full active:bg-surface-subtle"
              >
                <Icon name="edit" size={18} color={colors.textSecondary} />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Remove ${item.title}`}
                hitSlop={6}
                onPress={onRemove}
                className="h-8 w-8 items-center justify-center rounded-full active:bg-surface-subtle"
              >
                <Icon name="delete" size={18} color={colors.textSecondary} />
              </Pressable>
            </View>
          </View>
          <View className="mt-2 flex-row flex-wrap items-center gap-1.5">
            <VemtapText variant="button" className="font-sans-bold text-text">
              {item.priceSummary}
            </VemtapText>
            {item.multiPrice ? <StatusPill label="Multi-Price" tone="brand" /> : null}
            {item.priceNote ? (
              <VemtapText variant="caption" tone="secondary" className="font-sans-medium">
                {item.priceNote}
              </VemtapText>
            ) : null}
          </View>
        </View>
      </View>
      <View className="flex-row items-center justify-between gap-2 bg-surface-subtle px-4 py-3">
        <View className="min-w-0 flex-1 flex-row items-center gap-1">
          <Icon name={item.availabilityIcon} size={16} color={availabilityColor} />
          <VemtapText
            variant="labelSm"
            numberOfLines={1}
            className={
              item.availabilityTone === 'success'
                ? 'text-badge-discount-text'
                : 'text-secondary'
            }
          >
            {item.availability}
          </VemtapText>
        </View>
        <VemtapText
          variant="caption"
          tone="secondary"
          numberOfLines={1}
          className="shrink-0"
        >
          {item.meta}
        </VemtapText>
      </View>
    </View>
  );
}

export interface AddChoiceCardProps {
  icon: IconName;
  title: string;
  body: string;
  tone: 'brand' | 'tertiary';
  onPress?: () => void;
}

export function AddChoiceCard({ icon, title, body, tone, onPress }: AddChoiceCardProps) {
  const iconTile = tone === 'brand' ? 'bg-surface-tint-blue' : 'bg-tertiary-fixed';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      className="min-w-0 flex-1 flex-col items-start rounded-card bg-surface-container-lowest p-4 shadow-sm active:scale-[0.98]"
    >
      <View
        className={cn(
          'mb-3 h-10 w-10 items-center justify-center rounded-full',
          iconTile,
        )}
      >
        <Icon
          name={icon}
          size={22}
          color={tone === 'brand' ? colors.primary : colors.tertiary}
        />
      </View>
      <View className="flex-row items-center gap-1">
        <VemtapText variant="labelMd" className="font-sans-semibold text-text">
          {title}
        </VemtapText>
      </View>
      <VemtapText variant="caption" tone="secondary" className="mt-1" numberOfLines={3}>
        {body}
      </VemtapText>
      <View className="mt-1">
        <Icon
          name="devices"
          size={18}
          color={tone === 'brand' ? colors.primary : colors.tertiary}
        />
      </View>
    </Pressable>
  );
}

export function GalleryTile({
  uri,
  label,
  onRemove,
  onAdd,
}: {
  uri?: string;
  label: string;
  onRemove?: () => void;
  onAdd?: () => void;
}) {
  if (!uri) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={onAdd}
        className="aspect-square flex-1 flex-col items-center justify-center gap-1 rounded-field bg-surface-subtle p-2 active:scale-95"
      >
        <View className="h-8 w-8 items-center justify-center rounded-full bg-surface-tint-blue">
          <Icon name="plus" size={20} color={colors.primary} />
        </View>
        <VemtapText
          variant="labelSm"
          className="text-center font-sans-semibold text-primary"
        >
          {label}
        </VemtapText>
      </Pressable>
    );
  }

  return (
    <View className="relative aspect-square flex-1 overflow-hidden rounded-field bg-surface-container shadow-sm">
      <View
        accessible
        accessibilityRole="image"
        accessibilityLabel={label}
        className="h-full w-full"
      >
        <InlineImageCard
          uri={uri}
          height={200}
          rounded="field"
          className="h-full w-full rounded-none shadow-none"
        />
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Remove ${label}`}
        hitSlop={6}
        onPress={onRemove}
        className="absolute right-1.5 top-1.5 h-6 w-6 items-center justify-center rounded-full bg-text/70"
      >
        <Icon name="close" size={14} color={colors.surface} />
      </Pressable>
    </View>
  );
}

export function FeedPreviewCard({
  imageUri,
  badge,
  openBadge,
  name,
  meta,
  rating,
}: {
  imageUri: string;
  badge: string;
  openBadge: string;
  name: string;
  meta: string;
  rating: string;
}) {
  return (
    <View className="overflow-hidden rounded-card bg-surface-canvas shadow-md">
      <View className="relative h-32 w-full">
        <InlineImageCard
          uri={imageUri}
          height={128}
          rounded="card"
          className="h-full w-full rounded-none shadow-none"
        />
        <View className="absolute left-2 top-2 rounded-full bg-badge-discount-bg px-2 py-0.5 shadow-sm">
          <VemtapText
            variant="caption"
            className="font-sans-bold text-badge-discount-text"
          >
            {badge}
          </VemtapText>
        </View>
        <View className="absolute bottom-2 right-2 flex-row items-center gap-1 rounded-full bg-surface-canvas/90 px-2 py-0.5">
          <View className="h-1.5 w-1.5 rounded-full bg-badge-discount-text" />
          <VemtapText
            variant="labelSm"
            className="font-sans-semibold text-badge-discount-text"
          >
            {openBadge}
          </VemtapText>
        </View>
      </View>
      <View className="flex-row items-start gap-3 p-3">
        <View className="-mt-6 h-11 w-11 shrink-0 items-center justify-center rounded-field bg-primary shadow-sm">
          <Icon name="restaurant" size={20} color={colors.surface} />
        </View>
        <View className="min-w-0 flex-1">
          <View className="flex-row items-center justify-between gap-2">
            <VemtapText
              variant="headingSm"
              className="min-w-0 flex-1 text-text"
              numberOfLines={1}
            >
              {name}
            </VemtapText>
            <View className="shrink-0 flex-row items-center gap-0.5">
              <Icon name="starFilled" size={16} color={colors.tertiaryContainer} />
              <VemtapText
                variant="labelSm"
                className="font-sans-semibold text-tertiary-container"
              >
                {rating}
              </VemtapText>
            </View>
          </View>
          <VemtapText
            variant="caption"
            tone="secondary"
            numberOfLines={1}
            className="mt-0.5"
          >
            {meta}
          </VemtapText>
        </View>
      </View>
    </View>
  );
}

export function ConsumerPreviewRow({
  name,
  specialties,
  districtLabel,
}: {
  name: string;
  specialties: string;
  districtLabel: string;
}) {
  return (
    <View className="flex-row items-center gap-3 rounded-field bg-surface-subtle p-3">
      <View className="h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-surface-container">
        <Icon name="restaurant" size={24} color={colors.primary} />
      </View>
      <View className="min-w-0 flex-1">
        <VemtapText
          variant="labelMd"
          className="font-sans-semibold text-text"
          numberOfLines={1}
        >
          {name}
        </VemtapText>
        <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
          {specialties}
        </VemtapText>
        <View className="mt-0.5 flex-row items-center gap-0.5">
          <Icon name="pin" size={14} color={colors.primary} />
          <VemtapText variant="caption" className="text-primary">
            {districtLabel}
          </VemtapText>
        </View>
      </View>
    </View>
  );
}

export function SocialPresenceRow({
  presence,
  editLabel,
  onEdit,
}: {
  presence: SocialPresence;
  editLabel: string;
  onEdit?: () => void;
}) {
  const iconBg =
    presence.iconTone === 'success'
      ? 'bg-badge-discount-bg'
      : 'bg-surface-container-high';
  const iconColor =
    presence.iconTone === 'success' ? colors.badgeDiscountText : colors.surfaceDark;
  const labelClass =
    presence.iconTone === 'success' ? 'text-badge-discount-text' : 'text-text-secondary';

  return (
    <View className="flex-row items-center justify-between gap-2 rounded-field bg-surface-subtle p-3">
      <View className="min-w-0 flex-1 flex-row items-center gap-3">
        <View
          className={cn(
            'h-9 w-9 shrink-0 items-center justify-center rounded-lg',
            iconBg,
          )}
        >
          <Icon name={presence.icon} size={20} color={iconColor} />
        </View>
        <View className="min-w-0 flex-1">
          <VemtapText variant="labelSm" className={labelClass}>
            {presence.label}
          </VemtapText>
          <VemtapText
            variant="labelMd"
            className="font-sans-medium text-text"
            numberOfLines={1}
          >
            {presence.handle}
          </VemtapText>
        </View>
      </View>
      <View className="shrink-0 flex-row items-center gap-1.5">
        {presence.verified ? (
          <Icon
            name={presence.iconTone === 'success' ? 'checkCircle' : 'verified'}
            size={18}
            color={iconColor}
          />
        ) : null}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${editLabel} ${presence.label}`}
          hitSlop={6}
          onPress={onEdit}
          className="h-7 w-7 items-center justify-center active:opacity-70"
        >
          <Icon name="edit" size={16} color={colors.textTertiary} />
        </Pressable>
      </View>
    </View>
  );
}

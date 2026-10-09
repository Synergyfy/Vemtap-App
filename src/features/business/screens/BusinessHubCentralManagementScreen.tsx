import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { cssInterop } from 'nativewind';
import { Avatar } from '@components/ui/Avatar';
import { Icon, type IconName } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { TypeDensityProvider } from '@theme/TypeDensityProvider';
import { colors } from '@theme/colors';
import { businessHubMedia } from '@features/business/data/businessHubImages';
import {
  BusinessInlineAction,
  BusinessProductImage,
  BusinessScreenLayout,
} from '@features/business/components/BusinessPrimitives';
import { HorizontallyScrollableRow } from '@features/business/components/BusinessSetupPrimitives';
import type { BusinessBranch } from '@features/business/components/BusinessBranchSwitcher';
import type {
  BusinessHubModuleId,
  BusinessHubView,
} from '@features/business/hooks/useBusinessHubData';

cssInterop(Pressable, { className: 'style' });
cssInterop(LinearGradient, { className: 'style' });

const copy = strings.businessHub;

type ModuleAccent = (typeof copy.modules)[number]['accent'];

const moduleAccentStyles: Record<
  ModuleAccent,
  { tile: string; iconColor: string; body: string; highlight?: string }
> = {
  brand: {
    tile: 'bg-surface-tint-blue',
    iconColor: colors.primaryContainer,
    body: 'text-primary',
  },
  discount: {
    tile: 'bg-badge-discount-bg',
    iconColor: colors.badgeDiscountText,
    body: 'text-badge-discount-text',
    highlight: 'bg-badge-discount-bg',
  },
  secondary: {
    tile: 'bg-surface-container-high',
    iconColor: colors.secondary,
    body: 'text-text-primary',
  },
  tertiary: {
    tile: 'bg-tertiary-fixed',
    iconColor: colors.tertiary,
    body: 'text-tertiary',
    highlight: 'bg-tertiary-fixed',
  },
  neutral: {
    tile: 'bg-surface-container-high',
    iconColor: colors.onSurfaceVariant,
    body: 'text-text-primary',
  },
};

export interface BusinessHubCentralManagementScreenProps {
  onOpenLocationSwitcher?: () => void;
  onPreviewStorefront?: () => void;
  onEditProfile?: () => void;
  onOpenLocations?: () => void;
  onOpenCatalogue?: () => void;
  onOpenDeals?: () => void;
  onOpenCrm?: () => void;
  onOpenLoyalty?: () => void;
  onOpenStaff?: () => void;
  onOpenReader?: () => void;
  onCall?: () => void;
  onOpenWebsite?: () => void;
  /** Live view from the hub queries; omitted keeps the designed fallback. */
  hub?: BusinessHubView;
  branches?: readonly BusinessBranch[];
  activeBranchId?: string;
  onChangeBranch?: (branchId: string) => void;
}

export function BusinessHubCentralManagementScreen({
  onOpenLocationSwitcher,
  onPreviewStorefront,
  onEditProfile,
  onOpenLocations,
  onOpenCatalogue,
  onOpenDeals,
  onOpenCrm,
  onOpenLoyalty,
  onOpenStaff,
  onOpenReader,
  onCall,
  onOpenWebsite,
  hub,
  branches,
  activeBranchId,
  onChangeBranch,
}: BusinessHubCentralManagementScreenProps) {
  const [branchPickerOpen, setBranchPickerOpen] = useState(false);
  const [fallbackBranch, setFallbackBranch] = useState<string>(copy.branchOptions[0]);

  const liveBranchOptions = (branches ?? []).map(branchOption => ({
    id: branchOption.id,
    name: branchOption.name,
  }));
  const branchOptions =
    liveBranchOptions.length > 0
      ? liveBranchOptions
      : copy.branchOptions.map(name => ({ id: name, name }));
  const resolvedBranchId = activeBranchId ?? fallbackBranch;
  const activeBranch =
    branchOptions.find(option => option.id === resolvedBranchId) ?? branchOptions[0];

  const moduleActions: Record<string, (() => void) | undefined> = {
    locations: onOpenLocations,
    products: onOpenCatalogue,
    deals: onOpenDeals,
    crm: onOpenCrm,
    loyalty: onOpenLoyalty,
    staff: onOpenStaff,
  };

  const handleSelectBranch = (branchId: string) => {
    setBranchPickerOpen(false);
    if (liveBranchOptions.length > 0) {
      onChangeBranch?.(branchId);
    } else {
      setFallbackBranch(branchId);
    }
    onOpenLocationSwitcher?.();
  };

  const branchLabel = `${copy.viewingPrefix}: ${activeBranch?.name ?? ''}`;

  const features = hub
    ? hub.amenities.map((label, index) => ({
        id: `amenity-${index}`,
        label,
        icon: 'checkCircle' as IconName,
      }))
    : copy.features;

  // Dense hub: many rows read at a glance, so the subtree (navbar included)
  // uses the compact type density rather than per-row size overrides.
  return (
    <TypeDensityProvider density="compact">
      <BusinessScreenLayout
        header={{
          title: copy.title,
          centerTitle: false,
          showAvatar: true,
          avatarUri: hub?.logoUrl,
          avatarName: hub?.name ?? copy.name,
          titleAccessory:
            !hub || hub.isVerified ? (
              <Icon name="verified" size={18} color={colors.primaryContainer} />
            ) : undefined,
          actions: [
            {
              icon: 'swapHoriz',
              label: copy.quickSwitchLabel,
              onPress: onOpenLocationSwitcher,
            },
          ],
        }}
        contentContainerClassName="pb-8"
      >
        <View className="z-20 flex-row items-center gap-2">
          {/* min-w-0 + flex-1 so the label ellipsizes instead of pushing the row
            past the gutter; the trailing action keeps its full label. */}
          <View className="min-w-0 flex-1">
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ expanded: branchPickerOpen }}
              accessibilityLabel={branchLabel}
              onPress={() => setBranchPickerOpen(open => !open)}
              className="min-w-0 flex-row items-center gap-2 self-start rounded-full bg-surface-container-high px-3 py-1.5 shadow-sm active:scale-95"
            >
              <Icon name="store" size={17} color={colors.primaryContainer} />
              <VemtapText
                variant="labelSm"
                className="min-w-0 flex-1 font-sans-semibold"
                numberOfLines={1}
              >
                {branchLabel}
              </VemtapText>
              <Icon
                name="expandMore"
                size={18}
                color={colors.onSurfaceVariant}
                style={
                  branchPickerOpen ? { transform: [{ rotate: '180deg' }] } : undefined
                }
              />
            </Pressable>
            {/* The popover is clamped to the viewport so it can never run off-screen. */}
            {branchPickerOpen ? (
              <View className="absolute left-0 top-full z-30 mt-1 w-64 max-w-[70vw] gap-1 rounded-xl bg-surface-container-lowest p-1 shadow-xl">
                {branchOptions.map(option => {
                  const selected = option.id === activeBranch?.id;
                  return (
                    <Pressable
                      key={option.id}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      accessibilityLabel={option.name}
                      onPress={() => handleSelectBranch(option.id)}
                      className={`flex-row items-center justify-between rounded-lg px-3 py-2 ${
                        selected
                          ? 'bg-surface-tint-blue'
                          : 'active:bg-surface-container-low'
                      }`}
                    >
                      <VemtapText
                        variant="labelSm"
                        className={
                          selected
                            ? 'font-sans-semibold text-primary'
                            : 'text-text-primary'
                        }
                        numberOfLines={1}
                      >
                        {option.name}
                      </VemtapText>
                      <Icon
                        name={selected ? 'check' : 'arrowForward'}
                        size={16}
                        color={selected ? colors.primary : colors.onSurfaceVariant}
                      />
                    </Pressable>
                  );
                })}
              </View>
            ) : null}
          </View>
          <View className="shrink-0">
            <BusinessInlineAction
              label={copy.previewStorefront}
              icon="northEast"
              onPress={onPreviewStorefront}
            />
          </View>
        </View>

        <View className="mt-3 overflow-hidden rounded-card-lg bg-surface-container-lowest shadow-md">
          <View className="relative h-28 w-full overflow-hidden bg-surface-dim">
            <BusinessProductImage
              source={{ uri: hub?.coverUrl ?? businessHubMedia.cover.uri }}
              alt={businessHubMedia.cover.alt}
              className="h-full w-full"
            />
            <LinearGradient
              colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.6)']}
              locations={[0, 0.5, 1]}
              className="absolute inset-0"
            />
            {!hub || hub.isVerified ? (
              <View className="absolute right-2.5 top-2.5 flex-row items-center gap-1.5 rounded-full bg-badge-discount-bg px-2.5 py-1 shadow-sm">
                <Icon name="verified" size={13} color={colors.badgeDiscountText} />
                <VemtapText
                  variant="caption"
                  className="font-sans-semibold text-badge-discount-text"
                >
                  {copy.verifiedBusiness}
                </VemtapText>
              </View>
            ) : null}
          </View>

          <View className="relative gap-1 p-4 pt-0">
            <View className="-mt-9 mb-1 flex-row items-end justify-between gap-3">
              <View className="h-[68px] w-[68px] overflow-hidden rounded-card-lg bg-surface-container-lowest p-1 shadow-lg">
                <Avatar
                  uri={hub?.logoUrl}
                  name={hub?.name ?? copy.name}
                  size="lg"
                  tone="brand"
                  className="rounded-xl"
                  accessibilityLabel={`${hub?.name ?? copy.name} logo`}
                />
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={copy.editProfile}
                onPress={onEditProfile}
                className="mb-1 flex-row items-center gap-1.5 rounded-full bg-surface-container-high px-3.5 py-2 active:scale-95"
              >
                <Icon name="edit" size={16} color={colors.primaryContainer} />
                <VemtapText variant="labelSm">{copy.editProfile}</VemtapText>
              </Pressable>
            </View>

            <VemtapText
              variant="labelMd"
              className="font-sans-semibold"
              numberOfLines={1}
            >
              {hub?.name ?? copy.name}
            </VemtapText>
            <VemtapText variant="bodyMd" tone="secondary" numberOfLines={2}>
              {hub?.categoryLine ?? copy.category}
            </VemtapText>

            <View className="mt-2 flex-row gap-2 pt-1">
              <View className="min-w-0 flex-1 flex-row items-center gap-2 rounded-xl bg-surface-container-low p-2">
                <View className="h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-surface-container-high">
                  <Icon name="locationOn" size={17} color={colors.primaryContainer} />
                </View>
                <View className="min-w-0 flex-1">
                  <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                    {copy.branchesStat.label}
                  </VemtapText>
                  <VemtapText
                    variant="labelSm"
                    className="font-sans-semibold"
                    numberOfLines={1}
                  >
                    {hub
                      ? [
                          `${hub.branchCount} Branch${hub.branchCount === 1 ? '' : 'es'}`,
                          hub.branchNames,
                        ]
                          .filter(Boolean)
                          .join(' · ')
                      : copy.branchesStat.value}
                  </VemtapText>
                </View>
              </View>
              <View className="min-w-0 flex-1 flex-row items-center gap-2 rounded-xl bg-surface-container-low p-2">
                <View className="h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-surface-container-high">
                  <Icon name="starFilled" size={17} color={colors.tertiaryContainer} />
                </View>
                <View className="min-w-0 flex-1">
                  <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                    {copy.reviewsStat.label}
                  </VemtapText>
                  <VemtapText
                    variant="labelSm"
                    className="font-sans-semibold"
                    numberOfLines={1}
                  >
                    {hub ? (
                      hub.reviews.total > 0 && hub.reviews.average !== null ? (
                        <>
                          {hub.reviews.average.toFixed(1)}
                          <VemtapText variant="caption" tone="secondary">
                            {` (${hub.reviews.total})`}
                          </VemtapText>
                        </>
                      ) : (
                        'No reviews yet'
                      )
                    ) : (
                      <>
                        {copy.reviewsStat.rating}
                        <VemtapText variant="caption" tone="secondary">
                          {` ${copy.reviewsStat.count}`}
                        </VemtapText>
                      </>
                    )}
                  </VemtapText>
                </View>
              </View>
            </View>

            <View className="mt-1 flex-row gap-2 pt-1">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={copy.callLabel}
                onPress={onCall}
                className="min-w-0 flex-1 flex-row items-center justify-center gap-1.5 rounded-lg bg-surface-subtle px-2 py-1.5"
              >
                <Icon name="call" size={15} color={colors.textSecondary} />
                <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                  {hub?.phone || copy.phone}
                </VemtapText>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={copy.websiteLabel}
                onPress={onOpenWebsite}
                className="min-w-0 flex-1 flex-row items-center justify-center gap-1.5 rounded-lg bg-surface-subtle px-2 py-1.5"
              >
                <Icon name="web" size={15} color={colors.textSecondary} />
                <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                  {hub?.website || copy.website}
                </VemtapText>
              </Pressable>
            </View>
          </View>
        </View>

        {!hub || features.length > 0 ? (
          <View className="mt-3 gap-1.5">
            <View className="flex-row items-center justify-between gap-2">
              <VemtapText
                variant="caption"
                tone="secondary"
                className="font-sans-semibold uppercase tracking-wider"
                numberOfLines={1}
              >
                {copy.featuresTitle}
              </VemtapText>
              <View className="flex-row items-center gap-0.5">
                <View className="h-1.5 w-1.5 rounded-full bg-badge-discount-text" />
                <VemtapText
                  variant="caption"
                  className="font-sans-semibold text-badge-discount-text"
                >
                  {copy.featuresAllActive}
                </VemtapText>
              </View>
            </View>
            <HorizontallyScrollableRow>
              {features.map(feature => (
                <View
                  key={feature.id}
                  className="shrink-0 flex-row items-center gap-1.5 rounded-full bg-surface-container-high px-3 py-1.5"
                >
                  <Icon
                    name={feature.icon as IconName}
                    size={15}
                    color={colors.primaryContainer}
                  />
                  <VemtapText
                    variant="caption"
                    className="font-sans-medium"
                    numberOfLines={1}
                  >
                    {feature.label}
                  </VemtapText>
                </View>
              ))}
            </HorizontallyScrollableRow>
          </View>
        ) : null}

        <View className="mt-3 gap-3">
          <View className="flex-row items-center justify-between gap-2">
            <VemtapText
              variant="labelMd"
              className="min-w-0 flex-1 font-sans-semibold"
              numberOfLines={1}
            >
              {copy.modulesTitle}
            </VemtapText>
            <VemtapText variant="caption" tone="tertiary" className="shrink-0">
              {copy.modulesCount}
            </VemtapText>
          </View>

          {copy.modules.map(module => {
            const accent = moduleAccentStyles[module.accent];
            return (
              <Pressable
                key={module.id}
                accessibilityRole="button"
                accessibilityLabel={module.title}
                onPress={moduleActions[module.id]}
                className="relative overflow-hidden rounded-card-lg bg-surface-container-lowest p-4 shadow-sm active:scale-[0.99]"
              >
                {module.highlighted && accent.highlight ? (
                  <View
                    pointerEvents="none"
                    className={`absolute -right-8 -top-8 h-20 w-20 rounded-full opacity-50 ${accent.highlight}`}
                  />
                ) : null}
                <View className="flex-row items-center gap-3">
                  <View
                    className={`h-12 w-12 shrink-0 items-center justify-center rounded-xl ${accent.tile}`}
                  >
                    <Icon
                      name={module.icon as IconName}
                      size={26}
                      color={accent.iconColor}
                    />
                  </View>
                  <View className="min-w-0 flex-1">
                    <View className="mb-0.5 flex-row items-center justify-between gap-2">
                      <VemtapText
                        variant="labelMd"
                        className="min-w-0 flex-1 font-sans-semibold"
                        numberOfLines={1}
                      >
                        {module.title}
                      </VemtapText>
                      <Icon name="forward" size={20} color={colors.onSurfaceVariant} />
                    </View>
                    <VemtapText
                      variant="labelMd"
                      className={`font-sans-semibold ${accent.body}`}
                      numberOfLines={2}
                    >
                      {hub?.moduleBodies[module.id as BusinessHubModuleId] ?? module.body}
                    </VemtapText>
                    <VemtapText
                      variant="caption"
                      tone="secondary"
                      className="mt-0.5"
                      numberOfLines={2}
                    >
                      {module.meta}
                    </VemtapText>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.readerTitle}
          onPress={onOpenReader}
          className="mt-3 overflow-hidden rounded-card-lg shadow-lg active:scale-[0.99]"
        >
          <LinearGradient
            colors={[colors.primary, colors.primaryContainer]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="flex-row items-center justify-between gap-3 p-4"
          >
            <View className="min-w-0 flex-1 flex-row items-center gap-3">
              <View className="h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface/15">
                <Icon name="contactless" size={22} color={colors.surface} />
              </View>
              <View className="min-w-0 flex-1">
                <VemtapText
                  variant="labelMd"
                  className="font-sans-bold text-surface"
                  numberOfLines={1}
                >
                  {copy.readerTitle}
                </VemtapText>
                <VemtapText variant="caption" className="text-surface" numberOfLines={1}>
                  {hub?.readerStatus ?? copy.readerStatus}
                </VemtapText>
              </View>
            </View>
            <View className="shrink-0 rounded-full bg-surface px-3 py-1.5 shadow-sm">
              <VemtapText variant="caption" className="font-sans-bold text-primary">
                {copy.readerAction}
              </VemtapText>
            </View>
          </LinearGradient>
        </Pressable>
      </BusinessScreenLayout>
    </TypeDensityProvider>
  );
}

import React from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import {
  BusinessActionDock,
  BusinessScreenLayout,
  BusinessStatusPill,
} from '@features/business/components/BusinessPrimitives';
import {
  BusinessIconWell,
  BusinessPanel,
} from '@features/business/components/BusinessOpsPrimitives';
import {
  BusinessInitialsAvatar,
  BusinessPillar,
} from '@features/business/components/BusinessPosPrimitives';
import type { VerificationCheck, VerificationStatus } from '@api/verificationApi';
import {
  displayName,
  formatDay,
  idTypeLabel,
} from '@features/business/verificationDisplay';

const copy = strings.businessVerificationTrust;

export interface BusinessVerificationTrustScreenProps {
  status?: VerificationStatus | null;
  businessName?: string | null;
  /** City or area shown on the feed preview. */
  location?: string | null;
  branchNames?: string[];
  loading?: boolean;
  error?: boolean;
  onBack?: () => void;
  onOpenProfile?: () => void;
  /** Start, continue or review verification. */
  onOpenVerification?: () => void;
  onManageLocations?: () => void;
}

function initialsOf(name: string | null | undefined): string {
  return (name ?? '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0].toUpperCase())
    .join('');
}

function checkStatus(check: VerificationCheck | null): string {
  return check ? (copy.checkStatus[check.status] ?? check.status) : copy.notStarted;
}

/**
 * Verification & trust: the verification state from `GET /verification/status`,
 * how the business appears in customer feeds, and the checks behind the badge.
 */
export function BusinessVerificationTrustScreen({
  status,
  businessName,
  location,
  branchNames = [],
  loading = false,
  error = false,
  onBack,
  onOpenProfile,
  onOpenVerification,
  onManageLocations,
}: BusinessVerificationTrustScreenProps) {
  const overall = status?.status ?? 'unverified';
  const isVerified = overall === 'verified';
  const identity = status?.identity ?? null;
  const business = status?.business ?? null;
  const pillarsDone = [
    identity?.status === 'verified',
    business?.status === 'verified' || isVerified,
    branchNames.length > 0,
  ].filter(Boolean).length;
  const checksDone = [identity?.status === 'verified', isVerified].filter(Boolean).length;
  const verifiedOn = formatDay(status?.verifiedAt);
  const ctaLabel =
    overall === 'unverified'
      ? copy.startCta
      : overall === 'in_progress' || overall === 'rejected'
        ? copy.continueCta
        : copy.viewStatusCta;

  return (
    <BusinessScreenLayout
      header={{
        title: copy.headerTitle,
        onBack,
        actions: [
          {
            icon: 'accountCircle',
            label: strings.businessShell.profileLabel,
            onPress: onOpenProfile,
          },
        ],
      }}
      contentContainerClassName="pb-8"
      footer={
        <BusinessActionDock>
          <Button
            label={ctaLabel}
            labelVariant="labelMd"
            onPress={onOpenVerification}
            leftIcon={<Icon name="verifiedUser" size={18} color={colors.surface} />}
          />
        </BusinessActionDock>
      }
    >
      {loading ? (
        <View className="items-center py-10">
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : error ? (
        <View className="items-center gap-1 rounded-card bg-surface p-6 shadow-sm">
          <VemtapText variant="labelMd" className="font-sans-semibold">
            {copy.error.title}
          </VemtapText>
          <VemtapText variant="caption" tone="secondary" className="text-center">
            {copy.error.body}
          </VemtapText>
        </View>
      ) : (
        <>
          <View className="items-center gap-2 rounded-card bg-surface p-4 shadow-sm">
            <View
              className={`h-12 w-12 items-center justify-center rounded-full ${
                isVerified ? 'bg-badge-discount-bg' : 'bg-surface-tint'
              }`}
            >
              <Icon
                name={isVerified ? 'shieldLock' : 'shieldPerson'}
                size={26}
                color={isVerified ? colors.badgeDiscountText : colors.primary}
              />
            </View>
            <VemtapText
              variant="headingLg"
              className="text-center text-heading-lg"
              numberOfLines={2}
            >
              {copy.headlines[overall]}
            </VemtapText>
            {businessName ? (
              <VemtapText
                variant="bodyMd"
                className="text-center font-sans-semibold"
                numberOfLines={2}
              >
                {businessName}
              </VemtapText>
            ) : null}
            <BusinessStatusPill
              label={copy.badges[overall]}
              tone={isVerified ? 'success' : 'neutral'}
            />
            {verifiedOn ? (
              <VemtapText variant="caption" tone="secondary">
                {copy.verifiedOn(verifiedOn)}
              </VemtapText>
            ) : null}
          </View>

          <View className="mt-3 flex-row items-center gap-3 rounded-card bg-surface p-4 shadow-sm">
            <View className="min-w-0 flex-1">
              <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                {copy.progressLabel}
              </VemtapText>
              <VemtapText
                variant="headingLg"
                className="font-sans-bold text-primary"
                numberOfLines={1}
              >
                {copy.progressValue(checksDone, 2)}
              </VemtapText>
            </View>
            <View className="min-w-0 flex-[1.2] items-end gap-1">
              <Icon
                name={isVerified ? 'checkCircle' : 'pendingActions'}
                size={18}
                color={isVerified ? colors.badgeDiscountText : colors.primary}
              />
              <VemtapText
                variant="caption"
                tone="secondary"
                className="text-right"
                numberOfLines={2}
              >
                {copy.progressNotes[overall]}
              </VemtapText>
            </View>
          </View>

          <BusinessPanel
            className="mt-3"
            title={copy.previewTitle}
            icon="radar"
            badge={copy.previewLive}
            badgeTone="success"
          >
            <View className="flex-row items-center gap-3 rounded-field bg-surface-subtle p-3">
              <BusinessInitialsAvatar
                initials={initialsOf(businessName)}
                size="lg"
                tone="brand"
              />
              <View className="min-w-0 flex-1 gap-0.5">
                <View className="flex-row items-center gap-1.5">
                  <VemtapText
                    variant="labelMd"
                    className="min-w-0 font-sans-semibold"
                    numberOfLines={1}
                  >
                    {businessName ?? ''}
                  </VemtapText>
                  {isVerified ? (
                    <Icon name="verified" size={15} color={colors.primary} />
                  ) : null}
                </View>
                <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                  {isVerified ? copy.previewVerified : copy.previewUnverified}
                </VemtapText>
                {location ? (
                  <View className="flex-row items-center gap-1">
                    <View className="h-1.5 w-1.5 rounded-full bg-outline" />
                    <VemtapText
                      variant="caption"
                      tone="tertiary"
                      className="min-w-0 flex-1"
                      numberOfLines={1}
                    >
                      {location}
                    </VemtapText>
                  </View>
                ) : null}
              </View>
            </View>
          </BusinessPanel>

          <BusinessPanel
            className="mt-3"
            title={copy.pillarsTitle}
            icon="verified"
            badge={copy.pillarsBadge(pillarsDone, 3)}
            badgeTone={pillarsDone === 3 ? 'success' : 'neutral'}
          >
            <View className="gap-2">
              <BusinessPillar
                title={copy.identityTitle}
                icon="badge"
                status={checkStatus(identity)}
                state={identity?.status === 'verified' ? 'done' : 'pending'}
                lines={
                  identity
                    ? [
                        displayName(identity.recordName),
                        `${idTypeLabel(identity.idType)}${identity.maskedId ? ` ${identity.maskedId}` : ''}`,
                      ].filter((line): line is string => Boolean(line))
                    : []
                }
              />
              <BusinessPillar
                title={copy.businessTitle}
                icon="accountBalance"
                status={checkStatus(business)}
                state={business?.status === 'verified' || isVerified ? 'done' : 'pending'}
                lines={
                  !business
                    ? []
                    : business.idType === 'unregistered'
                      ? [copy.unregistered]
                      : [business.maskedId, displayName(business.recordName)].filter(
                          (line): line is string => Boolean(line),
                        )
                }
              />
              <BusinessPillar
                title={copy.storefrontTitle}
                icon="storefront"
                status={
                  branchNames.length
                    ? copy.branchesActive(branchNames.length)
                    : copy.noBranches
                }
                state={branchNames.length ? 'done' : 'pending'}
                lines={branchNames.length ? [branchNames.join(' • ')] : []}
                cta={onManageLocations ? copy.manageLocationsCta : undefined}
                onCtaPress={onManageLocations}
              />
            </View>
          </BusinessPanel>

          <BusinessPanel
            className="mt-3"
            title={copy.perksTitle}
            icon="workspacePremium"
            badge={String(copy.perks.length)}
            badgeTone="brand"
          >
            <View className="gap-2">
              {copy.perks.map(perk => (
                <View key={perk} className="flex-row items-start gap-2">
                  <Icon
                    name={isVerified ? 'checkBold' : 'lock'}
                    size={15}
                    color={isVerified ? colors.badgeDiscountText : colors.textTertiary}
                  />
                  <VemtapText
                    variant="caption"
                    tone="secondary"
                    className="min-w-0 flex-1 leading-relaxed"
                    numberOfLines={3}
                  >
                    {perk}
                  </VemtapText>
                </View>
              ))}
            </View>
          </BusinessPanel>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.updateCta}
            onPress={onOpenVerification}
            className="mt-3 flex-row items-center gap-2.5 rounded-card bg-surface p-3 shadow-sm active:bg-surface-subtle"
          >
            <BusinessIconWell icon="info" tone="brand" size="md" />
            <View className="min-w-0 flex-1">
              <VemtapText
                variant="labelMd"
                className="font-sans-semibold"
                numberOfLines={2}
              >
                {copy.updateTitle}
              </VemtapText>
              <VemtapText
                variant="caption"
                className="font-sans-semibold text-primary"
                numberOfLines={2}
              >
                {copy.updateCta}
              </VemtapText>
            </View>
            <View className="shrink-0">
              <Icon name="forward" size={18} color={colors.primary} />
            </View>
          </Pressable>
        </>
      )}
    </BusinessScreenLayout>
  );
}

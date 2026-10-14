import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { BottomSheet } from '@components/shared/BottomSheet';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';
import {
  verificationImages,
  verificationStatusCenterCopy as copy,
} from '@features/business/verificationCopy';
import { BusinessProductImage } from '@features/business/components/BusinessPrimitives';
import {
  SetupCallout,
  SetupSectionCard,
  StatusPill,
} from '@features/business/components/BusinessSetupPrimitives';
import {
  VerificationPage,
  VerificationPillarRow,
  VerificationSummaryRow,
} from '@features/business/components/VerificationPrimitives';
import type { IconName } from '@components/ui/Icon';
import type {
  BusinessVerificationStatus,
  VerificationCheck,
  VerificationStatus,
} from '@api/verificationApi';
import { reasonCopy } from '@api/verificationApi';
import {
  displayName,
  formatDay,
  formatVerifiedAt,
  idTypeLabel,
} from '@features/business/verificationDisplay';

export interface VerificationStatusCenterCredential {
  id: string;
  title: string;
}

interface CredentialRow {
  id: 'identity' | 'business' | 'locations';
  icon: IconName;
  title: string;
  body: string;
  meta: string | null;
  action: string | null;
  status: string;
  done: boolean;
  check: VerificationCheck | null;
}

function checkStatusLabel(check: VerificationCheck | null): string {
  return check ? copy.checkStatus[check.status] : copy.notSubmitted;
}

function buildCredentials(
  status: VerificationStatus | null | undefined,
  branchCount: number,
  branchSummary: string | null | undefined,
): CredentialRow[] {
  const identity = status?.identity ?? null;
  const business = status?.business ?? null;
  const operator = displayName(identity?.recordName);
  const identityBody = identity
    ? [
        operator,
        `${idTypeLabel(identity.idType)}${identity.maskedId ? ` (${identity.maskedId})` : ''}`,
      ]
        .filter(Boolean)
        .join(' • ')
    : copy.identityMissing;
  const businessBody = !business
    ? copy.businessMissing
    : business.idType === 'unregistered'
      ? copy.unregisteredBody
      : [business.maskedId, displayName(business.recordName)].filter(Boolean).join(' • ');
  return [
    {
      id: 'identity',
      icon: 'badge',
      title: copy.identityTitle,
      body: identityBody,
      meta: identity ? copy.identityMeta : null,
      action: identity ? copy.viewDetails : null,
      status: checkStatusLabel(identity),
      done: identity?.status === 'verified',
      check: identity,
    },
    {
      id: 'business',
      icon: 'accountBalance',
      title: copy.businessTitle,
      body: businessBody,
      meta: business && business.idType !== 'unregistered' ? copy.businessMeta : null,
      action: business ? copy.viewDetails : null,
      status: checkStatusLabel(business),
      done: business?.status === 'verified',
      check: business,
    },
    {
      id: 'locations',
      icon: 'pinDrop',
      title: copy.locationsTitle,
      body:
        branchCount > 0
          ? (branchSummary ?? branchesLabel(branchCount))
          : copy.locationsMissing,
      meta: null,
      action: copy.manageLocations,
      status: branchCount > 0 ? copy.locationsAdded : copy.notSubmitted,
      done: branchCount > 0,
      check: null,
    },
  ];
}

function branchesLabel(count: number): string {
  return count === 1 ? copy.branchesOne : `${count}${copy.branchesMany}`;
}

export interface BusinessVerificationStatusCenterScreenProps {
  status?: VerificationStatus | null;
  businessName?: string | null;
  logoUrl?: string | null;
  branchCount?: number;
  /** e.g. "Apo & Wuse II". */
  branchSummary?: string | null;
  onBack?: () => void;
  onUpdateVerification?: () => void;
  /** Exit to the business app (skip verification for now). */
  onOpenDashboard?: () => void;
  onManageLocations?: () => void;
  onViewCredential?: (credential: VerificationStatusCenterCredential) => void;
  onHelp?: () => void;
}

/**
 * Conversion of
 * stitch_vemtap_design_system_1/business_verification_status_center/code.html
 */
export function BusinessVerificationStatusCenterScreen({
  status,
  businessName,
  logoUrl,
  branchCount = 0,
  branchSummary,
  onBack,
  onUpdateVerification,
  onOpenDashboard,
  onManageLocations,
  onViewCredential,
  onHelp,
}: BusinessVerificationStatusCenterScreenProps) {
  const [selectedCheck, setSelectedCheck] = useState<VerificationCheck | null>(null);

  const handleBack = useCallback(() => onBack?.(), [onBack]);
  const closeCertificate = useCallback(() => setSelectedCheck(null), []);

  const overall: BusinessVerificationStatus = status?.status ?? 'unverified';
  const isVerified = overall === 'verified';
  const credentials = useMemo(
    () => buildCredentials(status, branchCount, branchSummary),
    [branchCount, branchSummary, status],
  );
  const verifiedCount = credentials.filter(credential => credential.done).length;
  const lastVerified = formatDay(status?.verifiedAt);
  const pillarMeta = [
    status?.business?.status === 'verified' || isVerified
      ? copy.pillarDone
      : copy.pillarPending,
    branchCount > 0 ? branchesLabel(branchCount) : copy.pillarPending,
    copy.pillars[2].meta,
  ];

  const updateBody = (
    <>
      {copy.updateBody}
      <VemtapText className="font-sans-medium text-text">
        {copy.updateHighlight}
      </VemtapText>
      {copy.updateTail}
    </>
  );

  return (
    <VerificationPage
      title={copy.header}
      onBack={handleBack}
      helpLabel={copy.helpLabel}
      onHelp={onHelp}
      contentContainerClassName="gap-4"
      footer={
        <>
          <Button
            label={copy.dashboardAction}
            labelVariant="labelMd"
            className="min-h-[52px]"
            labelClassName="text-center"
            leftIcon={<Icon name="dashboard" size={20} color={colors.surface} />}
            onPress={() => onOpenDashboard?.()}
          />
          <VemtapText variant="micro" tone="tertiary" className="text-center">
            {copy.dashboardHint}
          </VemtapText>
          <Button
            label={overall === 'unverified' ? copy.startAction : copy.updateAction}
            labelVariant="labelMd"
            variant="secondary"
            className="border-0 bg-surface-container-high"
            labelClassName="text-text"
            leftIcon={<Icon name="fileEdit" size={20} color={colors.textSecondary} />}
            onPress={onUpdateVerification}
          />
          <View className="items-center pt-1">
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: true }}
              accessibilityLabel={copy.auditLetterDisabledLabel}
              disabled
              className="min-h-9 flex-row items-center gap-1 opacity-50"
            >
              <VemtapText variant="labelMd" className="font-sans-semibold text-primary">
                {copy.auditLetterAction}
              </VemtapText>
              <Icon name="arrowForward" size={16} color={colors.primary} />
            </Pressable>
          </View>
          <View className="flex-row items-center justify-center gap-1.5 pt-1">
            <Icon name="lock" size={14} color={colors.textTertiary} />
            <VemtapText variant="caption" tone="tertiary" className="text-center">
              {copy.footer}
            </VemtapText>
          </View>
        </>
      }
    >
      <SetupSectionCard className="w-full p-6">
        <View className="flex-row items-start gap-3">
          <View className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-surface-container shadow-sm">
            <BusinessProductImage
              source={{ uri: logoUrl ?? verificationImages.statusCenterLogo }}
              alt={businessName ?? ''}
              className="h-full w-full"
            />
            <View className="absolute inset-0 bg-primary/5" />
          </View>
          <View className="min-w-0 flex-1">
            <VemtapText
              variant="labelMd"
              className="font-sans-semibold"
              numberOfLines={1}
            >
              {businessName ?? ''}
            </VemtapText>
            <View className="mt-0.5 flex-row items-center gap-1">
              <Icon name="history" size={14} color={colors.textTertiary} />
              <VemtapText variant="caption" tone="secondary" className="min-w-0 flex-1">
                {lastVerified
                  ? `${copy.lastVerifiedLead}${lastVerified}`
                  : copy.notVerifiedYet}
              </VemtapText>
            </View>
          </View>
        </View>

        <View className="flex-row flex-wrap items-center justify-between gap-2 rounded-lg bg-surface-tint-blue p-3">
          <View className="min-w-0 flex-row items-center gap-2">
            <Icon
              name={isVerified ? 'verified' : 'shieldPerson'}
              size={20}
              color={colors.primary}
            />
            <View className="min-w-0">
              <VemtapText
                variant="labelSm"
                className="font-sans-semibold tracking-tight text-primary"
              >
                {copy.statusTitles[overall]}
              </VemtapText>
              <VemtapText variant="caption" tone="secondary">
                {copy.statusBodies[overall]}
              </VemtapText>
            </View>
          </View>
          <StatusPill
            label={copy.statusPills[overall]}
            tone={isVerified ? 'success' : 'neutral'}
          />
        </View>

        <View className="flex-row gap-1">
          {copy.pillars.map((pillar, index) => (
            <View key={pillar.title} className="min-w-0 flex-1 items-center px-1 py-1">
              <Icon
                name={pillar.icon}
                size={18}
                color={
                  pillar.icon === 'storefront' ? colors.badgeDiscountText : colors.primary
                }
              />
              <VemtapText
                variant="caption"
                className="mt-1 text-center font-sans-semibold"
                numberOfLines={2}
              >
                {pillar.title}
              </VemtapText>
              <VemtapText
                variant="caption"
                tone="tertiary"
                className="text-center"
                numberOfLines={1}
              >
                {pillarMeta[index]}
              </VemtapText>
            </View>
          ))}
        </View>
      </SetupSectionCard>

      <View className="mt-2 gap-2">
        <View className="flex-row flex-wrap items-center justify-between gap-2">
          <VemtapText variant="labelMd" className="font-sans-semibold">
            {copy.listTitle}
          </VemtapText>
          <VemtapText variant="labelSm" tone="secondary">
            {`${verifiedCount}${copy.listCountOf}`}
          </VemtapText>
        </View>

        <View className="gap-2">
          {credentials.map(credential => (
            <SetupSectionCard key={credential.id} className="w-full">
              <VerificationPillarRow
                layout={credential.action ? 'footer' : 'stacked'}
                icon={credential.icon}
                title={credential.title}
                body={credential.body}
                meta={credential.meta}
                actionLabel={credential.action ?? undefined}
                onAction={() => {
                  if (credential.id === 'locations') {
                    onManageLocations?.();
                    return;
                  }
                  setSelectedCheck(credential.check);
                  onViewCredential?.({ id: credential.id, title: credential.title });
                }}
                statusLabel={credential.status}
                statusIcon={credential.done ? 'check' : undefined}
              />
            </SetupSectionCard>
          ))}
        </View>
      </View>

      <SetupCallout
        icon="shieldStar"
        tone="container"
        iconSurface="circle"
        iconSize={22}
        className="mt-2 p-4"
        title={copy.boostTitle}
        body={copy.boostBody}
      />

      <SetupCallout
        icon="info"
        tone="plain"
        iconSurface="circleMd"
        iconSize={18}
        iconTone="tertiary"
        className="p-4"
        bodyClassName="leading-relaxed"
        title={copy.updateTitle}
        body={updateBody}
      />

      <BottomSheet
        visible={selectedCheck !== null}
        onClose={closeCertificate}
        title={copy.sheetTitle}
      >
        <View className="gap-4 px-6 pb-2">
          <VemtapText variant="caption" tone="secondary">
            {copy.sheetSubtitle}
          </VemtapText>
          <View className="gap-4 rounded-card bg-surface-container-low p-4">
            <VerificationSummaryRow
              label={copy.sheetRegistrationLabel}
              value={
                selectedCheck?.kind === 'identity'
                  ? `${idTypeLabel(selectedCheck.idType)} ${selectedCheck.maskedId ?? ''}`.trim()
                  : (selectedCheck?.maskedId ?? '—')
              }
            />
            <VerificationSummaryRow
              label={copy.sheetEntityLabel}
              value={displayName(selectedCheck?.recordName) ?? '—'}
            />
            <VerificationSummaryRow
              label={copy.sheetStatusLabel}
              value={checkStatusLabel(selectedCheck)}
              valueTone={selectedCheck?.status === 'verified' ? 'success' : undefined}
              trailing={
                selectedCheck?.status === 'verified' ? (
                  <Icon name="checkCircle" size={14} color={colors.badgeDiscountText} />
                ) : undefined
              }
            />
            <VerificationSummaryRow
              label={copy.sheetCheckedLabel}
              value={
                formatVerifiedAt(selectedCheck?.reviewedAt ?? selectedCheck?.createdAt) ??
                '—'
              }
              valueVariant="caption"
            />
            {selectedCheck?.reasons.length ? (
              <VerificationSummaryRow
                label={copy.sheetReasonsLabel}
                value={reasonCopy(selectedCheck.reasons).join('\n')}
                valueVariant="caption"
              />
            ) : null}
          </View>
          <Button
            label={copy.sheetDone}
            onPress={closeCertificate}
            labelVariant="labelMd"
          />
        </View>
      </BottomSheet>
    </VerificationPage>
  );
}

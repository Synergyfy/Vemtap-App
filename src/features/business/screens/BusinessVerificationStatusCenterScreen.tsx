import React, { useCallback, useState } from 'react';
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

export interface VerificationStatusCenterCredential {
  id: string;
  title: string;
}

export interface BusinessVerificationStatusCenterScreenProps {
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
  onBack,
  onUpdateVerification,
  onOpenDashboard,
  onManageLocations,
  onViewCredential,
  onHelp,
}: BusinessVerificationStatusCenterScreenProps) {
  const [certificateVisible, setCertificateVisible] = useState(false);

  const handleBack = useCallback(() => onBack?.(), [onBack]);
  const openCertificate = useCallback(() => setCertificateVisible(true), []);
  const closeCertificate = useCallback(() => setCertificateVisible(false), []);

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
            label={copy.updateAction}
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
              source={{ uri: verificationImages.statusCenterLogo }}
              alt={copy.businessName}
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
              {copy.businessName}
            </VemtapText>
            <View className="mt-0.5 flex-row items-center gap-1">
              <Icon name="history" size={14} color={colors.textTertiary} />
              <VemtapText variant="caption" tone="secondary" className="min-w-0 flex-1">
                {copy.lastVerifiedLead}
              </VemtapText>
            </View>
          </View>
        </View>

        <View className="flex-row flex-wrap items-center justify-between gap-2 rounded-lg bg-surface-tint-blue p-3">
          <View className="min-w-0 flex-row items-center gap-2">
            <Icon name="verified" size={20} color={colors.primary} />
            <View className="min-w-0">
              <VemtapText
                variant="labelSm"
                className="font-sans-semibold tracking-tight text-primary"
              >
                {copy.trustTitle}
              </VemtapText>
              <VemtapText variant="caption" tone="secondary">
                {copy.trustTier}
              </VemtapText>
            </View>
          </View>
          <StatusPill label={copy.trustScore} tone="success" />
        </View>

        <View className="flex-row gap-1">
          {copy.pillars.map(pillar => (
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
                {pillar.meta}
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
            {copy.listCount}
          </VemtapText>
        </View>

        <View className="gap-2">
          {copy.credentials.map((credential, index) => (
            <SetupSectionCard key={credential.title} className="w-full">
              <VerificationPillarRow
                layout={credential.action ? 'footer' : 'stacked'}
                icon={credential.icon}
                title={credential.title}
                body={credential.body}
                meta={credential.meta}
                actionLabel={credential.action ?? undefined}
                onAction={() => {
                  if (index === 2) {
                    onManageLocations?.();
                    return;
                  }
                  if (index === 0 || index === 1) {
                    openCertificate();
                  }
                  onViewCredential?.({ id: String(index), title: credential.title });
                }}
                statusLabel={credential.status}
                statusIcon={
                  credential.statusIcon === 'dot' ? undefined : credential.statusIcon
                }
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
        visible={certificateVisible}
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
              value={copy.sheetRegistrationValue}
            />
            <VerificationSummaryRow
              label={copy.sheetEntityLabel}
              value={copy.sheetEntityValue}
            />
            <VerificationSummaryRow
              label={copy.sheetStatusLabel}
              value={copy.sheetStatusValue}
              valueTone="success"
              trailing={
                <Icon name="checkCircle" size={14} color={colors.badgeDiscountText} />
              }
            />
            <VerificationSummaryRow
              label={copy.sheetHashLabel}
              value={copy.sheetHashValue}
              valueVariant="caption"
            />
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

import React, { useCallback, useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { ProgressDots } from '@components/onboarding/ProgressDots';
import { BottomSheet } from '@components/shared/BottomSheet';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';
import { cn } from '@utils/cn';
import { idVerificationCopy as copy } from '@features/business/verificationCopy';
import {
  FieldInput,
  PrimaryActionButton,
  SetupCallout,
  SetupSectionCard,
  StatusPill,
} from '@features/business/components/BusinessSetupPrimitives';
import { BusinessFieldLabel } from '@features/business/components/BusinessPrimitives';
import {
  UploadChip,
  VerificationPage,
} from '@features/business/components/VerificationPrimitives';
import { uploadDocument } from '@features/business/utils/uploadBusinessMedia';
import { useVerifyNin } from '@features/business/hooks/useCatalogueMutations';
import { showToast } from '@components/shared/toast';
import { strings } from '@constants/strings';

export interface IdVerificationScreenProps {
  onBack?: () => void;
  onSubmit?: (value: {
    nin: string;
    fullName: string;
    slipFile?: string;
    verificationId?: string;
  }) => void;
  onCaptureSlip?: () => void;
}

/**
 * Conversion of stitch_vemtap_design_system_1/id_verification/code.html
 */
export function IdVerificationScreen({
  onBack,
  onSubmit,
  onCaptureSlip,
}: IdVerificationScreenProps) {
  const [nin, setNin] = useState<string>(copy.ninValue);
  const [fullName, setFullName] = useState<string>(copy.nameValue);
  const [slipFile, setSlipFile] = useState<string | null>(null);
  const [slipFileUri, setSlipFileUri] = useState<string | null>(null);
  const [infoVisible, setInfoVisible] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const verifyNin = useVerifyNin();

  const handleBack = useCallback(() => onBack?.(), [onBack]);
  const openInfo = useCallback(() => setInfoVisible(true), []);
  const closeInfo = useCallback(() => setInfoVisible(false), []);

  const pickAndUploadSlip = useCallback(async () => {
    const docResult = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
      copyToCacheDirectory: true,
    });

    if (docResult.canceled || !docResult.assets[0]?.uri) return;

    const { uri } = docResult.assets[0];
    setSlipFile(docResult.assets[0].name ?? 'nin_slip.pdf');
    setSlipFileUri(uri);

    onCaptureSlip?.();
  }, [onCaptureSlip]);

  const pickAndUploadSlipImage = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(copy.photoPermissionTitle, copy.photoPermissionBody);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]?.uri) return;

    const { uri } = result.assets[0];
    setSlipFile(`nin_slip_${Date.now()}.jpg`);
    setSlipFileUri(uri);

    onCaptureSlip?.();
  }, [onCaptureSlip]);

  const handleSubmit = useCallback(async () => {
    if (!nin.trim() || !fullName.trim()) {
      showToast(strings.common.error, 'error');
      return;
    }

    if (!slipFileUri) {
      showToast('Please upload your NIN slip first', 'error');
      return;
    }

    setVerifying(true);

    try {
      // Upload the slip document
      const documentUrl = await uploadDocument({
        fileUri: slipFileUri,
        fileName: slipFile ?? `nin_slip_${Date.now()}.pdf`,
        mimeType: slipFile?.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg',
      });

      if (!documentUrl) {
        throw new Error('Document upload failed');
      }

      // Verify NIN via Dojah
      const result = await verifyNin.mutateAsync({
        documentUrl,
        nin,
        firstName: fullName.split(' ')[0],
        lastName: fullName.split(' ').slice(1).join(' ') || fullName,
      });

      if (!result.success) {
        throw new Error(result.message);
      }

      showToast('NIN verified successfully', 'success');
      onSubmit?.({
        nin,
        fullName,
        slipFile: documentUrl,
        verificationId: result.verificationId,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Verification failed';
      showToast(message, 'error');
    } finally {
      setVerifying(false);
    }
  }, [nin, fullName, slipFile, slipFileUri, verifyNin, onSubmit]);

  const removeSlip = useCallback(() => {
    setSlipFile(null);
    setSlipFileUri(null);
  }, []);

  return (
    <VerificationPage
      title={copy.header}
      onBack={handleBack}
      contentContainerClassName="gap-5"
      footer={
        <>
          <PrimaryActionButton
            label={copy.submit}
            onPress={handleSubmit}
            loading={verifying}
            disabled={verifying}
          />
          <VemtapText variant="caption" tone="secondary" className="text-center">
            {copy.submitHint}
          </VemtapText>
        </>
      }
    >
      <View className="gap-2">
        <View className="flex-row flex-wrap items-center justify-between gap-2">
          <StatusPill label={copy.pill} tone="brandContainer" icon="verifiedUser" />
          <VemtapText variant="caption" tone="tertiary">
            {copy.step}
          </VemtapText>
        </View>
        <ProgressDots total={3} activeIndex={1} className="self-start" />
      </View>

      <View className="mt-1 gap-1">
        <VemtapText
          accessibilityRole="header"
          variant="headingLg"
          className="text-heading-lg"
        >
          {copy.title}
        </VemtapText>
        <VemtapText variant="bodyMd" tone="secondary">
          {copy.subtitle}
        </VemtapText>
      </View>

      <View className="mt-1 gap-4">
        <View className="gap-1.5">
          <BusinessFieldLabel
            label={copy.ninLabel}
            trailing={
              <View className="flex-row items-center gap-2">
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={copy.ninInfoLabel}
                  hitSlop={8}
                  onPress={openInfo}
                  className="-mr-1 h-8 w-8 items-center justify-center rounded-full active:bg-surface-container-low"
                >
                  <Icon name="info" size={16} color={colors.textTertiary} />
                </Pressable>
                <VemtapText variant="caption" tone="tertiary">
                  {copy.ninCounter}
                </VemtapText>
              </View>
            }
          />
          <FieldInput
            accessibilityLabel={copy.ninLabel}
            value={nin}
            onChangeText={setNin}
            placeholder={copy.ninPlaceholder}
            keyboardType="default"
            autoCapitalize="none"
            maxLength={14}
            tone="lowest"
            trailingIcon={nin ? 'check' : undefined}
            trailingIconColor={colors.badgeDiscountText}
          />
          <View className="flex-row items-center gap-1.5 px-1 pt-0.5">
            <Icon name="phoneDevice" size={14} color={colors.primary} />
            <VemtapText variant="caption" tone="secondary" className="min-w-0 flex-1">
              {copy.ussdLead}
              <VemtapText className="font-sans-semibold text-primary">
                {copy.ussdCode}
              </VemtapText>
              {copy.ussdTail}
            </VemtapText>
          </View>
        </View>

        <View className="gap-1.5">
          <BusinessFieldLabel label={copy.nameLabel} />
          <FieldInput
            accessibilityLabel={copy.nameLabel}
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
            tone="lowest"
            trailingIcon="lock"
            trailingIconColor={colors.textTertiary}
          />
        </View>
      </View>

      <SetupSectionCard className="w-full">
        <View className="flex-row items-start gap-3">
          <View className="h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-tint-blue">
            <Icon name="badge" size={22} color={colors.primary} />
          </View>
          <View className="min-w-0 flex-1">
            <View className="flex-row flex-wrap items-center gap-1.5">
              <VemtapText variant="labelMd" className="min-w-0 font-sans-semibold">
                {copy.uploadTitle}
              </VemtapText>
              <VemtapText
                variant="caption"
                tone="secondary"
                className="rounded bg-surface-container px-1.5 py-0.5 uppercase"
              >
                {copy.uploadBadge}
              </VemtapText>
            </View>
            <VemtapText
              variant="caption"
              tone="secondary"
              className="mt-0.5 leading-relaxed"
            >
              {copy.uploadBody}
            </VemtapText>
          </View>
        </View>
        <View className="flex-row gap-2">
          <Button
            label="Upload Document (PDF)"
            labelVariant="labelSm"
            variant="outline"
            size="sm"
            className="flex-1 border-0 bg-surface-subtle"
            leftIcon={<Icon name="fileDocument" size={18} color={colors.primary} />}
            onPress={pickAndUploadSlip}
          />
          <Button
            label="Upload Photo"
            labelVariant="labelSm"
            variant="outline"
            size="sm"
            className="flex-1 border-0 bg-surface-subtle"
            leftIcon={<Icon name="camera" size={18} color={colors.primary} />}
            onPress={pickAndUploadSlipImage}
          />
        </View>
        {slipFile ? (
          <UploadChip
            fileName={slipFile}
            onRemove={removeSlip}
            removeLabel={copy.removeFileLabel}
            icon="checkBold"
            tone="subtle"
          />
        ) : null}
      </SetupSectionCard>

      <SetupCallout
        icon="shieldLock"
        tone="tint"
        iconSurface="plain"
        className="p-4"
        bodyClassName="leading-relaxed"
        body={copy.security}
      />

      <BottomSheet visible={infoVisible} onClose={closeInfo} title={copy.infoTitle}>
        <View className={cn('px-6 pb-2')}>
          <VemtapText variant="caption" tone="secondary" className="leading-relaxed">
            {copy.infoBody}
          </VemtapText>
        </View>
      </BottomSheet>
    </VerificationPage>
  );
}

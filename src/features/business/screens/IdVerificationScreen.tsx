import React, { useCallback, useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
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
import {
  useLivenessCheck,
  useVerifyIdentity,
} from '@features/business/hooks/useVerification';
import type { IdentityIdType, VerificationCheck } from '@api/verificationApi';
import { useAuthStore } from '@store/authStore';
import { showToast } from '@components/shared/toast';

export interface IdVerificationScreenProps {
  idType?: IdentityIdType;
  onBack?: () => void;
  /** Called with the stored check; route on `check.status`. */
  onResult?: (check: VerificationCheck) => void;
}

/**
 * Conversion of stitch_vemtap_design_system_1/id_verification/code.html.
 * Identity check on bytID: ID details + a hosted selfie (liveness) check.
 */
export function IdVerificationScreen({
  idType = 'nin',
  onBack,
  onResult,
}: IdVerificationScreenProps) {
  const user = useAuthStore(state => state.user);
  const [idNumber, setIdNumber] = useState('');
  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [livenessSessionId, setLivenessSessionId] = useState<string | null>(null);
  const [passportUri, setPassportUri] = useState<string | null>(null);
  const [infoVisible, setInfoVisible] = useState(false);
  const [uploading, setUploading] = useState(false);

  const liveness = useLivenessCheck();
  const verifyIdentity = useVerifyIdentity();
  const isPassport = idType === 'passport';
  const isNin = idType === 'nin';

  const handleBack = useCallback(() => onBack?.(), [onBack]);
  const openInfo = useCallback(() => setInfoVisible(true), []);
  const closeInfo = useCallback(() => setInfoVisible(false), []);

  const startSelfie = useCallback(async () => {
    try {
      const result = await liveness.mutateAsync();
      if (!result.completed) {
        showToast(copy.selfieIncomplete, 'error');
        return;
      }
      setLivenessSessionId(result.sessionId);
    } catch (error) {
      showToast(error instanceof Error ? error.message : copy.selfieIncomplete, 'error');
    }
  }, [liveness]);

  const pickPassportPhoto = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(copy.photoPermissionTitle, copy.photoPermissionBody);
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.85,
    });
    if (result.canceled || !result.assets[0]?.uri) return;
    setPassportUri(result.assets[0].uri);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!isPassport && !idNumber.trim()) {
      showToast(copy.missingNumber, 'error');
      return;
    }
    if (!firstName.trim() || !lastName.trim()) {
      showToast(copy.missingName, 'error');
      return;
    }
    if (isPassport && !passportUri) {
      showToast(copy.missingPassport, 'error');
      return;
    }
    if (!livenessSessionId) {
      showToast(copy.missingSelfie, 'error');
      return;
    }

    try {
      let documentUrl: string | undefined;
      if (isPassport && passportUri) {
        setUploading(true);
        const url = await uploadDocument({
          fileUri: passportUri,
          fileName: copy.passportFileName,
          mimeType: 'image/jpeg',
        });
        setUploading(false);
        if (!url) {
          showToast(copy.uploadFailed, 'error');
          return;
        }
        documentUrl = url;
      }

      const check = await verifyIdentity.mutateAsync({
        idType,
        idNumber: isPassport ? undefined : idNumber.replace(/\s+/g, ''),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        livenessSessionId,
        documentUrl,
      });
      onResult?.(check);
    } catch (error) {
      setUploading(false);
      const message = error instanceof Error ? error.message : 'Verification failed';
      // A used or expired selfie must be taken again.
      if (/selfie/i.test(message)) setLivenessSessionId(null);
      showToast(message, 'error');
    }
  }, [
    firstName,
    idNumber,
    idType,
    isPassport,
    lastName,
    livenessSessionId,
    onResult,
    passportUri,
    verifyIdentity,
  ]);

  const submitting = uploading || verifyIdentity.isPending;

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
            loading={submitting}
            disabled={submitting}
          />
          <VemtapText variant="caption" tone="secondary" className="text-center">
            {copy.submitHint}
          </VemtapText>
        </>
      }
    >
      <View className="gap-2">
        <View className="flex-row flex-wrap items-center justify-between gap-2">
          <StatusPill
            label={copy.pills[idType]}
            tone="brandContainer"
            icon="verifiedUser"
          />
          <VemtapText variant="caption" tone="tertiary">
            {copy.step}
          </VemtapText>
        </View>
        <ProgressDots total={2} activeIndex={0} className="self-start" />
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
        {isPassport ? null : (
          <View className="gap-1.5">
            <BusinessFieldLabel
              label={copy.numberLabels[idType]}
              trailing={
                isNin ? (
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
                ) : undefined
              }
            />
            <FieldInput
              accessibilityLabel={copy.numberLabels[idType]}
              value={idNumber}
              onChangeText={setIdNumber}
              placeholder={copy.numberPlaceholders[idType]}
              keyboardType={isNin ? 'number-pad' : 'default'}
              autoCapitalize={isNin ? 'none' : 'characters'}
              maxLength={isNin ? 11 : 30}
              tone="lowest"
            />
            {isNin ? (
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
            ) : null}
          </View>
        )}

        <View className="gap-1.5">
          <BusinessFieldLabel label={copy.firstNameLabel} />
          <FieldInput
            accessibilityLabel={copy.firstNameLabel}
            value={firstName}
            onChangeText={setFirstName}
            autoCapitalize="words"
            tone="lowest"
          />
        </View>
        <View className="gap-1.5">
          <BusinessFieldLabel label={copy.lastNameLabel} />
          <FieldInput
            accessibilityLabel={copy.lastNameLabel}
            value={lastName}
            onChangeText={setLastName}
            autoCapitalize="words"
            tone="lowest"
          />
          <VemtapText variant="caption" tone="secondary" className="px-1">
            {copy.nameHint}
          </VemtapText>
        </View>
      </View>

      {isPassport ? (
        <SetupSectionCard className="w-full">
          <View className="flex-row items-start gap-3">
            <View className="h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-tint-blue">
              <Icon name="passport" size={22} color={colors.primary} />
            </View>
            <View className="min-w-0 flex-1">
              <VemtapText variant="labelMd" className="min-w-0 font-sans-semibold">
                {copy.passportTitle}
              </VemtapText>
              <VemtapText
                variant="caption"
                tone="secondary"
                className="mt-0.5 leading-relaxed"
              >
                {copy.passportBody}
              </VemtapText>
            </View>
          </View>
          {passportUri ? (
            <UploadChip
              fileName={copy.passportFileName}
              onRemove={() => setPassportUri(null)}
              removeLabel={copy.removeFileLabel}
              icon="checkBold"
              tone="subtle"
            />
          ) : (
            <Button
              label={copy.passportAction}
              labelVariant="labelSm"
              variant="outline"
              size="sm"
              className="border-0 bg-surface-subtle"
              leftIcon={<Icon name="camera" size={18} color={colors.primary} />}
              onPress={pickPassportPhoto}
            />
          )}
        </SetupSectionCard>
      ) : null}

      <SetupSectionCard className="w-full">
        <View className="flex-row items-start gap-3">
          <View className="h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-tint-blue">
            <Icon
              name={livenessSessionId ? 'checkBold' : 'faceRecognition'}
              size={22}
              color={livenessSessionId ? colors.badgeDiscountText : colors.primary}
            />
          </View>
          <View className="min-w-0 flex-1">
            <VemtapText variant="labelMd" className="min-w-0 font-sans-semibold">
              {livenessSessionId ? copy.selfieDone : copy.selfieTitle}
            </VemtapText>
            <VemtapText
              variant="caption"
              tone="secondary"
              className="mt-0.5 leading-relaxed"
            >
              {copy.selfieBody}
            </VemtapText>
          </View>
        </View>
        <Button
          label={livenessSessionId ? copy.selfieRetake : copy.selfieAction}
          labelVariant="labelSm"
          variant="outline"
          size="sm"
          className="border-0 bg-surface-subtle"
          leftIcon={<Icon name="camera" size={18} color={colors.primary} />}
          loading={liveness.isPending}
          disabled={liveness.isPending || submitting}
          onPress={startSelfie}
        />
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

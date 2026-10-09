import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cssInterop } from 'nativewind';
import { RegistrationHeader } from '@components/auth/RegistrationHeader';
import { OtpInput } from '@components/auth/OtpInput';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';
import { businessProfileCopy as copy } from '@features/business/businessCopy';
import {
  InfoHint,
  PrimaryActionButton,
  SetupSectionCard,
  SetupStepBar,
} from '@features/business/components/BusinessSetupPrimitives';
import {
  useRequestOwnerOtp,
  useVerifyOwnerOtp,
} from '@features/business/hooks/useOwnerRegistration';

cssInterop(View, { className: 'style' });
cssInterop(Pressable, { className: 'style' });
cssInterop(ScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});
cssInterop(SafeAreaView, { className: 'style' });

const OTP_LENGTH = 4;
const RESEND_SECONDS = 45;
const noop = () => undefined;

export interface BusinessAccountOtpScreenProps {
  email: string;
  onBack?: () => void;
  /** Return to the credentials screen to fix a typo in the email. */
  onEditEmail?: () => void;
  /**
   * Runs after the API accepts the code. Awaiting it keeps the screen in its
   * loading state while registration continues, and any rejection surfaces
   * here instead of as a silent failure.
   */
  onVerified?: () => void | Promise<void>;
}

/**
 * Owner registration uses a 4-character email code (shorter than the customer
 * 6-digit one), requested by a separate endpoint.
 */
export function BusinessAccountOtpScreen({
  email,
  onBack,
  onEditEmail,
  onVerified,
}: BusinessAccountOtpScreenProps) {
  const requestOtp = useRequestOwnerOtp();
  const verifyOtp = useVerifyOwnerOtp();

  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resent, setResent] = useState(false);
  const [timeLeft, setTimeLeft] = useState(RESEND_SECONDS);
  const requestedRef = useRef(false);

  const requestCode = useCallback(() => {
    setResent(false);
    requestOtp.mutate(
      { email, role: 'Owner' },
      { onSuccess: () => setTimeLeft(RESEND_SECONDS) },
    );
  }, [email, requestOtp]);

  // Fire once on mount. The guard also keeps the request out of React's
  // StrictMode double-invoke in development.
  useEffect(() => {
    if (requestedRef.current) return;
    requestedRef.current = true;
    requestCode();
    // Deliberately mount-only: `requestCode` is recreated when the email
    // changes, and that case goes back through the credentials screen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const id = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timeLeft]);

  const maskedEmail = useMemo(() => {
    const trimmed = email.trim();
    if (!trimmed.includes('@')) return trimmed || 'your email';
    const [local, domain] = trimmed.split('@');
    const head = local.slice(0, 2);
    return `${head}****@${domain}`;
  }, [email]);

  const handleChange = useCallback((text: string) => {
    setCode(text.replace(/[^0-9]/g, '').slice(0, OTP_LENGTH));
  }, []);

  const handleVerify = useCallback(async () => {
    setError(null);
    if (code.length !== OTP_LENGTH) {
      setError(copy.accountSetup.otp.errors.codeIncomplete);
      return;
    }
    setSubmitting(true);
    try {
      await verifyOtp.mutateAsync({ email, code });
      await onVerified?.();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : copy.accountSetup.upgrade.errorFallback,
      );
    } finally {
      setSubmitting(false);
    }
  }, [code, email, onVerified, verifyOtp]);

  const requestError = requestOtp.error?.message ?? null;
  const displayedError = error ?? requestError;
  const canVerify = code.length === OTP_LENGTH && !submitting;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <RegistrationHeader title={copy.accountSetup.otp.header} onBack={onBack ?? noop} />

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-4 px-6 pb-10 pt-4"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <SetupStepBar
          step={copy.accountSetup.otp.step}
          percent={copy.accountSetup.otp.percent}
          progress={80}
        />

        <View className="items-center gap-2 pt-2">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-surface-tint">
            <Icon name="mailRead" size={30} color={colors.primary} />
          </View>
          <VemtapText
            accessibilityRole="header"
            variant="headingMd"
            className="text-center text-heading-md"
          >
            {copy.accountSetup.otp.title}
          </VemtapText>
          <VemtapText tone="secondary" className="max-w-[300px] text-center leading-snug">
            {copy.accountSetup.otp.subtitlePrefix}{' '}
            <VemtapText className="font-sans-semibold text-text">
              {maskedEmail}
            </VemtapText>
          </VemtapText>
          {onEditEmail ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={copy.accountSetup.otp.editEmail}
              hitSlop={8}
              onPress={onEditEmail}
              className="flex-row items-center gap-1 py-1"
            >
              <Icon name="edit" size={15} color={colors.primary} />
              <VemtapText variant="labelSm" className="font-sans-semibold text-primary">
                {copy.accountSetup.otp.editEmail}
              </VemtapText>
            </Pressable>
          ) : null}
        </View>

        <SetupSectionCard className="gap-3">
          <OtpInput
            value={code}
            onChangeText={handleChange}
            length={OTP_LENGTH}
            autoFocus
            accessibilityLabel="4-digit owner verification code"
          />

          {displayedError ? (
            <VemtapText
              tone="error"
              accessibilityRole="alert"
              className="text-center text-caption"
            >
              {displayedError}
            </VemtapText>
          ) : resent ? (
            <VemtapText
              tone="success"
              accessibilityRole="alert"
              className="text-center text-caption"
            >
              {copy.accountSetup.otp.sent}
            </VemtapText>
          ) : null}

          <View className="flex-row items-center justify-center gap-1.5">
            <VemtapText tone="secondary">{copy.accountSetup.otp.resend}</VemtapText>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={copy.accountSetup.otp.resend}
              disabled={timeLeft > 0 || requestOtp.isPending}
              onPress={requestCode}
              hitSlop={6}
            >
              <VemtapText
                className={
                  timeLeft > 0
                    ? 'font-sans-semibold text-label-sm text-text-tertiary'
                    : 'font-sans-semibold text-label-sm text-primary underline'
                }
              >
                {timeLeft > 0
                  ? `${copy.accountSetup.otp.resendIn} ${timeLeft}s`
                  : copy.accountSetup.otp.resend}
              </VemtapText>
            </Pressable>
          </View>
        </SetupSectionCard>

        <InfoHint text={copy.accountSetup.otp.spamHint} icon="info" />
      </ScrollView>

      <View className="gap-3 px-6 pb-6 pt-0">
        <PrimaryActionButton
          label={copy.accountSetup.otp.verify}
          onPress={handleVerify}
          loading={submitting}
          className={canVerify ? undefined : 'opacity-50'}
        />
      </View>
    </SafeAreaView>
  );
}

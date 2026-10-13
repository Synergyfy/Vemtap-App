import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { VemtapText } from '@components/ui/Text';
import { Button } from '@components/ui/Button';
import { RegistrationHeader } from '@components/auth/RegistrationHeader';
import { Input } from '@components/ui/Input';
import { OtpInput } from '@components/auth/OtpInput';
import { PinInput } from '@components/auth/PinInput';
import { strings } from '@constants/strings';
import { emailSchema } from '@utils/validators';
import {
  useRequestPinReset,
  useResetPin,
} from '@features/auth/hooks/useCustomerRegister';
import type { AuthStackParamList } from '@navigation/types';

cssInterop(View, { className: 'style' });
cssInterop(ScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});
cssInterop(SafeAreaView, { className: 'style' });

const OTP_LENGTH = 6;

type Nav = NativeStackNavigationProp<AuthStackParamList, 'ForgotPin'>;

export interface ForgotPinScreenProps {
  /** Prefills the email phase — used when the reset is opened from a signed-in flow. */
  initialEmail?: string;
  /**
   * Replaces the default "back to sign in" action after a successful reset.
   * The business wizard returns to its confirmation step instead.
   */
  onDone?: () => void;
  doneLabel?: string;
}

/**
 * Customer PIN reset. No Stitch design exists for this flow, so it is composed
 * from the same primitives as registration: TextField, the shared OtpInput and
 * the shared PinInput. One route, two phases, mirroring the two API calls
 * (POST /auth/customer/pin/forgot then POST /auth/customer/pin/reset).
 */
export function ForgotPinScreen({
  initialEmail,
  onDone,
  doneLabel,
}: ForgotPinScreenProps = {}) {
  const navigation = useNavigation<Nav>();
  const requestPinReset = useRequestPinReset();
  const resetPin = useResetPin();

  const [phase, setPhase] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState(initialEmail ?? '');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinVisible, setPinVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (phase !== 'code' || timeLeft <= 0) return;
    const id = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [phase, timeLeft]);

  const pinMatch: 'match' | 'mismatch' | null =
    newPin.length === OTP_LENGTH && confirmPin.length === OTP_LENGTH
      ? newPin === confirmPin
        ? 'match'
        : 'mismatch'
      : null;

  const onSendCode = useCallback(() => {
    const parsed = emailSchema.safeParse(email.trim());
    if (!parsed.success) {
      setEmailError(strings.auth.forgotPinEmailError);
      return;
    }
    setEmailError(null);
    requestPinReset.mutate({ email: parsed.data }, { onSuccess: () => setPhase('code') });
  }, [email, requestPinReset]);

  const onResend = useCallback(() => {
    requestPinReset.mutate({ email: email.trim() }, { onSuccess: () => setTimeLeft(45) });
  }, [email, requestPinReset]);

  const onSubmit = useCallback(() => {
    resetPin.mutate(
      { email: email.trim(), otp: code, newPin },
      { onSuccess: () => setSuccess(strings.auth.forgotPinSuccess) },
    );
  }, [code, email, newPin, resetPin]);

  const canSubmit =
    code.length === OTP_LENGTH && pinMatch === 'match' && !resetPin.isPending;

  return (
    <SafeAreaView className="flex-1 bg-surface-canvas" edges={['top', 'bottom']}>
      <RegistrationHeader
        title={strings.auth.forgotPinHeader}
        onBack={() => (phase === 'code' ? setPhase('email') : navigation.goBack())}
      />

      <ScrollView
        className="flex-1"
        contentContainerClassName="flex-grow px-6 pb-8"
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1">
          <View className="gap-2">
            <VemtapText
              variant="headingLg"
              className="text-heading-lg"
              accessibilityRole="header"
            >
              {strings.auth.forgotPinTitle}
            </VemtapText>
            <VemtapText className="leading-relaxed text-text-secondary">
              {phase === 'email'
                ? strings.auth.forgotPinSubtitle
                : strings.auth.forgotPinCodeSentTo(email.trim())}
            </VemtapText>
          </View>

          {phase === 'email' ? (
            <View className="mt-8 gap-5">
              <Input
                label={strings.auth.forgotPinEmailLabel}
                value={email}
                onChangeText={t => {
                  setEmail(t);
                  if (emailError) setEmailError(null);
                }}
                placeholder={strings.auth.emailPlaceholder}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                error={emailError ?? undefined}
                textContentType="emailAddress"
                testID="forgot-pin-email"
              />
              {requestPinReset.error ? (
                <VemtapText tone="error" accessibilityRole="alert">
                  {(requestPinReset.error as Error).message || strings.common.error}
                </VemtapText>
              ) : null}
              <Button
                label={strings.auth.forgotPinSendCode}
                loading={requestPinReset.isPending}
                disabled={requestPinReset.isPending}
                rightIcon={null}
                onPress={onSendCode}
              />
            </View>
          ) : (
            <View className="mt-6 gap-6">
              <View>
                <VemtapText className="mb-2 font-sans-medium text-label-sm text-text-secondary">
                  {strings.auth.forgotPinCodeLabel}
                </VemtapText>
                <OtpInput
                  value={code}
                  onChangeText={t =>
                    setCode(t.replace(/[^0-9]/g, '').slice(0, OTP_LENGTH))
                  }
                  accessibilityLabel={strings.auth.forgotPinCodeLabel}
                />
                <View className="flex-row items-center justify-center gap-1.5">
                  <VemtapText tone="secondary">{strings.auth.otpDidntReceive}</VemtapText>
                  <Button
                    label={
                      timeLeft > 0
                        ? strings.auth.forgotPinResendTimer(timeLeft)
                        : strings.auth.forgotPinResend
                    }
                    labelVariant="labelSm"
                    variant="outline"
                    className="min-h-0 px-2 py-1"
                    disabled={timeLeft > 0 || requestPinReset.isPending}
                    onPress={onResend}
                  />
                </View>
              </View>

              <PinInput
                label={strings.auth.forgotPinNewPinLabel}
                value={newPin}
                onPinChange={setNewPin}
                pinVisible={pinVisible}
                onToggleVisibility={() => setPinVisible(v => !v)}
                showToggle
              />
              <PinInput
                label={strings.auth.forgotPinConfirmPinLabel}
                value={confirmPin}
                onPinChange={setConfirmPin}
                match={pinMatch}
                pinVisible={pinVisible}
                onToggleVisibility={() => setPinVisible(v => !v)}
              />

              {resetPin.error ? (
                <VemtapText tone="error" accessibilityRole="alert">
                  {(resetPin.error as Error).message || strings.auth.verifyFailed}
                </VemtapText>
              ) : null}
              {success ? (
                <VemtapText tone="success" accessibilityRole="alert">
                  {success}
                </VemtapText>
              ) : null}

              <View className="gap-3">
                <Button
                  label={
                    resetPin.isPending
                      ? strings.common.loading
                      : strings.auth.forgotPinSubmit
                  }
                  disabled={!canSubmit}
                  loading={resetPin.isPending}
                  onPress={onSubmit}
                />
                <Button
                  label={doneLabel ?? strings.auth.forgotPinBackToSignIn}
                  variant="ghost"
                  disabled={!success}
                  onPress={() => (onDone ? onDone() : navigation.goBack())}
                />
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

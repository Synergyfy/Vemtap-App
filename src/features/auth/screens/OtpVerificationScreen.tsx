import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { VemtapText } from '@components/ui/Text';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { RegistrationHeader } from '@components/auth/RegistrationHeader';
import { OtpInput } from '@components/auth/OtpInput';
import { colors } from '@theme/colors';
import { strings } from '@constants/strings';
import type { AuthStackParamList } from '@navigation/types';
import { useRequestSignupOtp } from '@features/auth/hooks/useCustomerRegister';

cssInterop(View, { className: 'style' });
cssInterop(ScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});
cssInterop(SafeAreaView, { className: 'style' });
cssInterop(Pressable, { className: 'style' });
cssInterop(TextInput, { className: 'style' });

type Nav = NativeStackNavigationProp<AuthStackParamList, 'VerifyEmail'>;
type Rt = RouteProp<AuthStackParamList, 'VerifyEmail'>;

/**
 * Conversion of stitch_vemtap_design_system/customer_registration_step_2_verification_1/code.html
 */
export function OtpVerificationScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Rt>();
  const requestOtp = useRequestSignupOtp();
  const [code, setCode] = useState('');
  const OTP_LENGTH = 6;
  const [resent, setResent] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const id = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timeLeft]);

  const handleChange = useCallback((text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, OTP_LENGTH);
    setCode(cleaned);
  }, []);

  const maskedEmail = useMemo(() => {
    const email = params.email.trim();
    if (!email.includes('@')) return strings.auth.otpMaskedEmail;
    const [local, domain] = email.split('@');
    const head = local.slice(0, 2);
    return `${head}****@${domain}`;
  }, [params.email]);

  const canContinue = code.length === OTP_LENGTH;

  return (
    <SafeAreaView className="flex-1 bg-surface-canvas" edges={['top', 'bottom']}>
      <RegistrationHeader
        title={strings.auth.otpHeader}
        onBack={() => navigation.goBack()}
      />
      <ScrollView
        contentContainerClassName="px-6 pb-8"
        keyboardShouldPersistTaps="handled"
      >
        {/* Progress */}
        <View className="flex-row items-center justify-between pb-4 pt-4">
          <View className="flex-row items-center gap-1">
            <View className="h-1.5 w-6 rounded-full bg-primary" />
            <View className="h-1.5 w-6 rounded-full bg-primary" />
            <View className="h-1.5 w-2 rounded-full bg-surface-container-highest" />
          </View>
          <VemtapText className="text-label-sm text-text-secondary">
            {strings.auth.registerStepOf(2, 3)}
          </VemtapText>
        </View>

        {/* Hero */}
        <View className="mb-6 items-center text-center">
          <View className="relative mb-4 h-[135px] w-[135px] items-center justify-center rounded-full bg-surface-container-low shadow-sm">
            <View className="h-[95px] w-[95px] items-center justify-center rounded-full bg-surface-container">
              <Icon name="mailRead" size={51} color={colors.primary} />
            </View>
            <View className="absolute -bottom-1 -right-1 h-[47px] w-[47px] items-center justify-center rounded-full bg-primary shadow-md">
              <Icon name="verifiedUser" size={27} color="#FFFFFF" />
            </View>
          </View>
          <VemtapText
            variant="headingXl"
            accessibilityRole="header"
            className="mb-1 text-center text-heading-xl"
          >
            {strings.auth.otpTitle}
          </VemtapText>
          <VemtapText tone="secondary" className="max-w-[280px] text-center">
            {strings.auth.otpSubtitle}
          </VemtapText>
          <View className="mt-3 flex-row items-center gap-2 rounded-full bg-surface-subtle px-4 py-1.5 shadow-sm">
            <VemtapText className="font-sans-semibold text-label-md text-text">
              {maskedEmail}
            </VemtapText>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={strings.auth.otpEditEmail}
              hitSlop={8}
              className="h-6 w-6 items-center justify-center rounded-full"
              onPress={() => navigation.goBack()}
            >
              <Icon name="edit" size={16} color={colors.primary} />
            </Pressable>
          </View>
        </View>

        <OtpInput value={code} onChangeText={handleChange} autoFocus />

        {/* Resend */}
        {requestOtp.error || resent ? (
          <VemtapText
            tone={requestOtp.error ? 'error' : 'success'}
            accessibilityRole="alert"
            className="mt-4 text-center text-caption"
          >
            {requestOtp.error
              ? (requestOtp.error as Error).message || strings.auth.otpSendFailed
              : strings.auth.otpResent}
          </VemtapText>
        ) : null}
        <View className="mt-4 flex-row items-center justify-center gap-1.5">
          <VemtapText tone="secondary">{strings.auth.otpDidntReceive}</VemtapText>
          <Pressable
            accessibilityRole="button"
            disabled={timeLeft > 0 || requestOtp.isPending}
            onPress={() =>
              requestOtp.mutate(
                { email: params.email },
                {
                  onSuccess: () => {
                    setTimeLeft(45);
                    setResent(true);
                  },
                },
              )
            }
            className="flex-row items-center gap-1"
          >
            <VemtapText
              className={
                timeLeft > 0
                  ? 'font-sans-semibold text-label-md text-primary'
                  : 'font-sans-semibold text-label-md text-primary underline'
              }
            >
              {strings.auth.otpResend}
            </VemtapText>
            {timeLeft > 0 ? (
              <VemtapText className="text-caption text-text-tertiary">
                {strings.auth.otpResendTimer(timeLeft)}
              </VemtapText>
            ) : null}
          </Pressable>
        </View>

        {/* Info card */}
        <View className="mt-6 flex-row items-start gap-2 rounded-xl bg-surface-container-low p-3 shadow-sm">
          <View className="mt-0.5">
            <Icon name="info" size={20} color={colors.secondary} />
          </View>
          <VemtapText className="flex-1 text-caption leading-relaxed text-text-secondary">
            {strings.auth.otpSpamHint}
          </VemtapText>
        </View>

        {/* Actions */}
        <View className="mt-8 gap-4">
          <Button
            label={strings.auth.otpContinue}
            disabled={!canContinue}
            rightIcon={<Icon name="arrowForward" size={20} color="#FFFFFF" />}
            onPress={() =>
              navigation.navigate('ProfileSetup', { email: params.email, code })
            }
          />
          <View className="items-center">
            <Pressable
              accessibilityRole="button"
              hitSlop={8}
              className="py-2"
              onPress={() => navigation.goBack()}
            >
              <VemtapText tone="secondary" className="text-button-md">
                {strings.auth.otpUseDifferentEmail}
              </VemtapText>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

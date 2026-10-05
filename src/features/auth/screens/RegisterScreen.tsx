import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation, type CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { VemtapText } from '@components/ui/Text';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { TextField } from '@components/forms/TextField';
import { emailSchema } from '@utils/validators';
import { z } from 'zod';
import { colors } from '@theme/colors';
import { strings } from '@constants/strings';
import type { AuthStackParamList, RootStackParamList } from '@navigation/types';
import { useRequestSignupOtp } from '@features/auth/hooks/useCustomerRegister';

cssInterop(View, { className: 'style' });
cssInterop(ScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});
cssInterop(SafeAreaView, { className: 'style' });
cssInterop(Pressable, { className: 'style' });

const registerSchema = z.object({ email: emailSchema });
type RegisterInput = z.infer<typeof registerSchema>;

type Nav = CompositeNavigationProp<
  NativeStackNavigationProp<AuthStackParamList, 'Register'>,
  NativeStackNavigationProp<RootStackParamList>
>;

/**
 * Conversion of stitch_vemtap_design_system/customer_registration_step_1_email/code.html
 */
export function RegisterScreen() {
  const navigation = useNavigation<Nav>();
  const [submitState, setSubmitState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const requestOtp = useRequestSignupOtp();

  const { control, handleSubmit, formState } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '' },
    mode: 'onBlur',
  });

  const onSubmit = useCallback(
    (values: RegisterInput) => {
      setSubmitState('sending');
      requestOtp.mutate(
        { email: values.email },
        {
          onSuccess: () => {
            setSubmitState('sent');
            navigation.navigate('VerifyEmail', { email: values.email });
          },
          onError: () => setSubmitState('idle'),
        },
      );
    },
    [navigation, requestOtp],
  );

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView
        contentContainerClassName="px-screen pb-8 pt-2"
        keyboardShouldPersistTaps="handled"
      >
        {/* Top Navigation & Progress */}
        <View className="flex-row items-center justify-between py-2">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={strings.common.goBack}
            hitSlop={8}
            className="-ml-2 h-10 w-10 items-center justify-center rounded-full active:bg-surface-container-low"
            onPress={() => navigation.goBack()}
          >
            <Icon name="backIos" size={22} color={colors.surfaceDark} />
          </Pressable>
          <View className="flex-row items-center gap-1.5 rounded-full bg-surface-container-low px-3 py-1">
            <View className="h-1.5 w-1.5 rounded-full bg-primary" />
            <VemtapText className="font-sans-medium text-caption text-text-secondary">
              {strings.auth.registerStepOf(1, 3)}
            </VemtapText>
          </View>
          <View className="h-10 w-10" />
        </View>

        {/* Micro Progress Gauge */}
        <View className="mb-6 mt-2 h-1 w-full overflow-hidden rounded-full bg-surface-container-low">
          <View className="h-full w-1/3 rounded-full bg-primary" />
        </View>

        {/* App Brand Header */}
        <View className="mb-8 items-center text-center">
          <View className="mb-4 h-12 w-12 items-center justify-center rounded-2xl bg-surface-tint shadow-sm">
            <Icon name="localMall" size={28} color={colors.primary} />
          </View>
          <VemtapText className="mb-1 font-sans-bold text-label-sm uppercase tracking-widest text-primary">
            VEMTAP
          </VemtapText>
          <VemtapText
            variant="headingXl"
            accessibilityRole="header"
            className="mb-2 text-center text-heading-xl"
          >
            {strings.auth.registerWelcomeTitle}
          </VemtapText>
          <VemtapText tone="secondary" className="max-w-[280px] text-center text-body-md">
            {strings.auth.registerWelcomeSubtitle}
          </VemtapText>
        </View>

        {/* Email Input Form */}
        <View className="w-full gap-4">
          <TextField
            control={control}
            name="email"
            label={strings.auth.registerEmailLabel}
            placeholder={strings.auth.registerEmailPlaceholder}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
            leadingIcon={<Icon name="mail" size={20} color={colors.textTertiary} />}
            className="rounded-cta border-0 bg-surface-muted"
          />

          <View className="flex-row items-start gap-1.5">
            <View className="mt-0.5">
              <Icon name="verifiedUser" size={15} color={colors.primary} />
            </View>
            <VemtapText className="flex-1 text-caption text-text-secondary">
              {strings.auth.registerEmailHint}
            </VemtapText>
          </View>

          {requestOtp.error ? (
            <VemtapText
              tone="error"
              accessibilityRole="alert"
              className="text-center text-caption"
            >
              {(requestOtp.error as Error).message || strings.auth.otpSendFailed}
            </VemtapText>
          ) : null}

          <Button
            label={
              submitState === 'sending'
                ? strings.auth.registerSendingCode
                : submitState === 'sent'
                  ? strings.auth.registerCodeSent
                  : strings.auth.registerContinue
            }
            loading={submitState === 'sending'}
            disabled={!formState.isValid && submitState === 'idle'}
            className="mt-1"
            rightIcon={
              submitState === 'sent' ? null : (
                <Icon name="arrowForward" size={20} color="#FFFFFF" />
              )
            }
            onPress={handleSubmit(onSubmit)}
          />

          <View className="items-center py-2">
            <VemtapText tone="secondary">
              {strings.auth.registerHaveAccount}{' '}
              <Pressable
                accessibilityRole="link"
                accessibilityLabel={strings.common.signIn}
                hitSlop={8}
                onPress={() => navigation.navigate('SignIn')}
              >
                <VemtapText className="font-sans-bold text-primary">
                  {strings.common.signIn}
                </VemtapText>
              </Pressable>
            </VemtapText>
          </View>
        </View>

        {/* Legal & Trust Footer */}
        <View className="mt-8 items-center px-2">
          <VemtapText className="text-center text-caption leading-relaxed text-text-secondary">
            {strings.auth.registerTermsPrefix}
            <VemtapText className="text-center font-sans-medium text-primary underline">
              {strings.auth.registerTerms}
            </VemtapText>
            {strings.auth.registerAnd}
            <VemtapText className="text-center font-sans-medium text-primary underline">
              {strings.auth.registerPrivacy}
            </VemtapText>
            .
          </VemtapText>
          <View className="mt-2 flex-row items-center justify-center gap-1">
            <Icon name="lock" size={14} color={colors.textTertiary} />
            <VemtapText className="text-center text-caption text-text-tertiary">
              {strings.auth.registerEncrypted}
            </VemtapText>
          </View>
        </View>

        {/* Own a Business entry (secondary path) */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={strings.auth.registerOwnBusiness}
          className="mt-6 flex-row items-center justify-between gap-3 rounded-cta border border-border-active bg-surface-tint p-4 active:bg-surface-container-low"
          onPress={() => navigation.navigate('BusinessSetup')}
        >
          <View className="min-w-0 flex-1 flex-row items-center gap-3">
            <View className="h-10 w-10 items-center justify-center rounded-lg bg-surface-canvas shadow-sm">
              <Icon name="storefront" size={20} color={colors.primary} />
            </View>
            <View className="min-w-0 flex-1">
              <VemtapText className="font-sans-bold text-label-md text-text">
                {strings.auth.registerOwnBusiness}
              </VemtapText>
              <VemtapText className="text-caption text-text-secondary">
                {strings.auth.registerOwnBusinessSub}
              </VemtapText>
            </View>
          </View>
          <View className="shrink-0 flex-row items-center gap-1">
            <VemtapText
              numberOfLines={1}
              className="font-sans-medium text-label-md text-primary"
            >
              {strings.auth.registerRegisterHere}
            </VemtapText>
            <Icon name="arrowForward" size={18} color={colors.primary} />
          </View>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

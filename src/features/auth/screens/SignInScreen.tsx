import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation, type CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { z } from 'zod';
import { VemtapText } from '@components/ui/Text';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { GoogleLogo } from '@components/ui/GoogleLogo';
import { RegistrationHeader } from '@components/auth/RegistrationHeader';
import { TextField } from '@components/forms/TextField';
import { CheckboxField } from '@components/forms/CheckboxField';
import { colors } from '@theme/colors';
import { strings } from '@constants/strings';
import { useLogin } from '@features/auth/hooks/useLogin';
import type { AuthStackParamList, RootStackParamList } from '@navigation/types';

cssInterop(View, { className: 'style' });
cssInterop(ScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});
cssInterop(SafeAreaView, { className: 'style' });
cssInterop(Pressable, { className: 'style' });

const signInFormSchema = z.object({
  identifier: z.string().trim().min(1, strings.auth.signInIdentifierError),
  credential: z.string().min(6, strings.auth.signInCredentialError),
  rememberMe: z.boolean(),
});

type SignInFormInput = z.infer<typeof signInFormSchema>;

type Nav = CompositeNavigationProp<
  NativeStackNavigationProp<AuthStackParamList, 'SignIn'>,
  NativeStackNavigationProp<RootStackParamList>
>;

/**
 * Conversion of stitch_vemtap_design_system/customer_sign_in/code.html
 */
export function SignInScreen() {
  const navigation = useNavigation<Nav>();
  const login = useLogin();
  const [showCredential, setShowCredential] = useState(false);

  const { control, handleSubmit, formState } = useForm<SignInFormInput>({
    resolver: zodResolver(signInFormSchema),
    defaultValues: { identifier: '', credential: '', rememberMe: true },
    mode: 'onBlur',
  });

  const onSubmit = useCallback(
    (values: SignInFormInput) => {
      login.mutate({
        email: values.identifier,
        password: values.credential,
      });
    },
    [login],
  );

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <RegistrationHeader
        title={strings.auth.signInHeader}
        onBack={() => navigation.goBack()}
      />
      <ScrollView
        contentContainerClassName="px-screen pb-8 pt-4"
        keyboardShouldPersistTaps="handled"
      >
        {/* Accent pill (spec badge slot) */}
        <View className="mb-3 h-1.5 w-8 rounded-full bg-secondary-container" />

        {/* Hero */}
        <View className="mb-6 gap-2">
          <VemtapText
            variant="headingXl"
            accessibilityRole="header"
            className="text-heading-xl"
          >
            {strings.auth.signInTitle}
          </VemtapText>
          <VemtapText tone="secondary" className="text-body-md">
            {strings.auth.signInSubtitle}
          </VemtapText>
        </View>

        {/* Social Authentication */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={strings.auth.registerContinueWithGoogle}
          className="h-[52px] w-full flex-row items-center justify-center gap-3 rounded-cta bg-surface shadow-sm active:scale-[0.98]"
        >
          <GoogleLogo size={20} />
          <VemtapText className="font-sans-medium text-button-md text-text">
            {strings.auth.registerContinueWithGoogle}
          </VemtapText>
        </Pressable>

        {/* Visual Divider */}
        <View className="my-5 flex-row items-center">
          <View className="h-px flex-1 bg-surface-container-highest" />
          <VemtapText className="px-4 font-sans-medium text-label-sm uppercase tracking-wider text-text-tertiary">
            {strings.auth.signInOr}
          </VemtapText>
          <View className="h-px flex-1 bg-surface-container-highest" />
        </View>

        {/* Form */}
        <View className="gap-4">
          <TextField
            control={control}
            name="identifier"
            label={strings.auth.signInIdentifierLabel}
            placeholder={strings.auth.signInIdentifierPlaceholder}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="username"
            textContentType="username"
            leadingIcon={<Icon name="mail" size={20} color={colors.outline} />}
            className="rounded-cta border-0 bg-surface shadow-sm"
          />

          <View className="gap-1.5">
            <View className="flex-row items-center justify-between">
              <VemtapText variant="labelMd" className="text-text">
                {strings.auth.signInCredentialLabel}
              </VemtapText>
              <Pressable
                accessibilityRole="link"
                hitSlop={8}
                onPress={() => {
                  // Forgot-password flow not designed yet — no route invented.
                }}
              >
                <VemtapText variant="labelSm" className="text-primary">
                  {strings.auth.signInForgot}
                </VemtapText>
              </Pressable>
            </View>
            <TextField
              control={control}
              name="credential"
              placeholder={strings.auth.signInCredentialPlaceholder}
              secureTextEntry={!showCredential}
              autoComplete="password"
              textContentType="password"
              autoCapitalize="none"
              leadingIcon={<Icon name="lock" size={20} color={colors.outline} />}
              trailingIcon={
                <Icon
                  name={showCredential ? 'visibility' : 'visibilityOff'}
                  size={20}
                  color={colors.outline}
                />
              }
              trailingIconLabel={
                showCredential
                  ? strings.auth.signInHidePassword
                  : strings.auth.signInShowPassword
              }
              onTrailingIconPress={() => setShowCredential(v => !v)}
              className={`rounded-cta border-0 bg-surface shadow-sm${showCredential ? '' : ' tracking-widest'}`}
            />
          </View>

          <CheckboxField
            control={control}
            name="rememberMe"
            label={strings.auth.signInRemember}
            containerClassName="mt-0.5"
          />

          {login.isError ? (
            <VemtapText tone="error" accessibilityRole="alert">
              {(login.error as Error).message || strings.auth.invalidCredentials}
            </VemtapText>
          ) : null}

          <Button
            label={strings.common.signIn}
            loading={login.isPending}
            disabled={!formState.isValid}
            className="mt-1 min-h-[54px]"
            rightIcon={<Icon name="arrowForward" size={20} color={colors.surface} />}
            onPress={() => {
              handleSubmit(onSubmit)();
            }}
          />
        </View>

        {/* Create account footer */}
        <View className="items-center py-4">
          <VemtapText tone="secondary" className="text-center">
            {strings.auth.signInNoAccount}{' '}
            <VemtapText
              className="text-center font-sans-bold text-primary"
              accessibilityRole="link"
              onPress={() => navigation.navigate('Register')}
            >
              {strings.auth.signInCreateAccount}
            </VemtapText>
          </VemtapText>
        </View>

        {/* Own a Business entry (secondary path) */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={strings.auth.signInOwnBusiness}
          className="mt-4 flex-row items-center justify-between gap-3 rounded-cta bg-surface-container-low p-4 shadow-sm active:bg-surface-container"
          onPress={() => navigation.navigate('BusinessSetup')}
        >
          <View className="min-w-0 flex-1 flex-row items-center gap-3">
            <View className="h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-container-highest">
              <Icon name="storefront" size={22} color={colors.primary} />
            </View>
            <View className="min-w-0 flex-1">
              <VemtapText
                numberOfLines={1}
                className="font-sans-bold text-heading-sm text-text"
              >
                {strings.auth.signInOwnBusiness}
              </VemtapText>
              <VemtapText numberOfLines={1} className="text-caption text-text-secondary">
                {strings.auth.signInOwnBusinessSub}
              </VemtapText>
            </View>
          </View>
          <View className="h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-container-highest">
            <Icon name="forward" size={18} color={colors.text} />
          </View>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cssInterop } from 'nativewind';
import { RegistrationHeader } from '@components/auth/RegistrationHeader';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';
import { businessProfileCopy as copy } from '@features/business/businessCopy';
import {
  FieldInput,
  InfoHint,
  PrimaryActionButton,
  SetupCallout,
  SetupSectionCard,
  SetupStepBar,
  StatusPill,
} from '@features/business/components/BusinessSetupPrimitives';

cssInterop(View, { className: 'style' });
cssInterop(Pressable, { className: 'style' });
cssInterop(ScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});
cssInterop(SafeAreaView, { className: 'style' });

export type BusinessAccountMode = 'create' | 'confirm';

export interface BusinessAccountCredentialsValue {
  email: string;
  password: string;
}

export interface BusinessAccountCredentialsScreenProps {
  /** `create` collects email + password; `confirm` only re-asks the password. */
  mode?: BusinessAccountMode;
  initialEmail?: string;
  onBack?: () => void;
  onContinue?: (value: BusinessAccountCredentialsValue) => void;
  loading?: boolean;
  error?: string | null;
  onForgotPassword?: () => void;
  /**
   * Session-only accounts (Google) have no password to confirm: the backend
   * upgrades on the strength of the token, so the field is replaced by a
   * one-tap CTA.
   */
  passwordlessAccount?: boolean;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const noop = () => undefined;

const getPasswordRules = (password: string) => ({
  minLength: password.length >= 8,
  hasLowercase: /[a-z]/.test(password),
  hasUppercase: /[A-Z]/.test(password),
  hasNumber: /[0-9]/.test(password),
  hasSymbol: /[^A-Za-z0-9]/.test(password),
});

/**
 * Account creation step of the business setup wizard. Sits between the profile
 * screens (which collect the business) and the location screens (which need a
 * session). For an existing customer it degrades to a password confirmation so
 * the account keeps both sides.
 */
export function BusinessAccountCredentialsScreen({
  mode = 'create',
  initialEmail = '',
  onBack,
  onContinue,
  loading = false,
  error,
  onForgotPassword,
  passwordlessAccount = false,
}: BusinessAccountCredentialsScreenProps) {
  const isConfirm = mode === 'confirm';
  const stepCopy = isConfirm ? copy.accountSetup.confirm : copy.accountSetup.create;

  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const rules = useMemo(() => getPasswordRules(password), [password]);
  const passwordStrong = Object.values(rules).every(Boolean);

  const handleContinue = useCallback(() => {
    setLocalError(null);

    if (!isConfirm && !EMAIL_PATTERN.test(email.trim())) {
      setLocalError(copy.accountSetup.create.errors.emailRequired);
      return;
    }
    if (!passwordlessAccount && !password) {
      setLocalError(
        isConfirm
          ? copy.accountSetup.confirm.errors.passwordRequired
          : copy.accountSetup.create.errors.passwordWeak,
      );
      return;
    }
    if (!isConfirm) {
      if (!passwordStrong) {
        setLocalError(copy.accountSetup.create.errors.passwordWeak);
        return;
      }
      if (password !== confirmPassword) {
        setLocalError(copy.accountSetup.create.errors.passwordMismatch);
        return;
      }
    }

    onContinue?.({ email: email.trim(), password });
  }, [
    confirmPassword,
    email,
    isConfirm,
    onContinue,
    password,
    passwordlessAccount,
    passwordStrong,
  ]);

  const displayedError = localError ?? error ?? null;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <RegistrationHeader title={stepCopy.header} onBack={onBack ?? noop} />

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-4 px-6 pb-10 pt-4"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <SetupStepBar step={stepCopy.step} percent={stepCopy.percent} progress={60} />

        <View className="gap-2 pt-1">
          <StatusPill
            label={isConfirm ? 'Welcome Back' : 'One Last Thing'}
            icon="lock"
            tone="brand"
          />
          <VemtapText
            accessibilityRole="header"
            variant="headingMd"
            className="text-heading-md"
          >
            {stepCopy.title}
          </VemtapText>
          <VemtapText tone="secondary" className="leading-snug">
            {stepCopy.subtitle}
          </VemtapText>
        </View>

        {isConfirm ? (
          <SetupSectionCard className="gap-2">
            <VemtapText variant="labelMd" className="font-sans-medium text-text">
              {copy.accountSetup.confirm.emailLabel}
            </VemtapText>
            <View className="min-h-[52px] flex-row items-center gap-2 rounded-field bg-surface-subtle px-3">
              <Icon name="mail" size={20} color={colors.textTertiary} />
              <VemtapText
                className="min-w-0 flex-1 text-body-md text-text"
                numberOfLines={1}
              >
                {initialEmail || '—'}
              </VemtapText>
              <Icon name="verifiedUser" size={18} color={colors.primary} />
            </View>
            <InfoHint text={copy.accountSetup.confirm.keepBoth} />
          </SetupSectionCard>
        ) : (
          <SetupSectionCard className="gap-2">
            <VemtapText variant="labelMd" className="font-sans-medium text-text">
              {copy.accountSetup.create.emailLabel}
            </VemtapText>
            <FieldInput
              value={email}
              onChangeText={setEmail}
              placeholder={copy.accountSetup.create.emailPlaceholder}
              accessibilityLabel={copy.accountSetup.create.emailLabel}
              keyboardType="email-address"
              autoCapitalize="none"
              trailingIcon="mail"
            />
            <InfoHint text={copy.accountSetup.create.emailHint} icon="verifiedUser" />
          </SetupSectionCard>
        )}

        {isConfirm && passwordlessAccount ? (
          <SetupSectionCard className="gap-2">
            <InfoHint text={copy.accountSetup.confirm.googleHint} icon="verifiedUser" />
          </SetupSectionCard>
        ) : (
          <SetupSectionCard className="gap-2">
            <VemtapText variant="labelMd" className="font-sans-medium text-text">
              {isConfirm
                ? copy.accountSetup.confirm.passwordLabel
                : copy.accountSetup.create.passwordLabel}
            </VemtapText>
            <FieldInput
              value={password}
              onChangeText={setPassword}
              placeholder={
                isConfirm
                  ? copy.accountSetup.confirm.passwordPlaceholder
                  : copy.accountSetup.create.passwordPlaceholder
              }
              accessibilityLabel={
                isConfirm
                  ? copy.accountSetup.confirm.passwordLabel
                  : copy.accountSetup.create.passwordLabel
              }
              autoCapitalize="none"
              secureTextEntry={!showPassword}
              trailingIcon={showPassword ? 'visibilityOff' : 'visibility'}
              onTrailingIconPress={() => setShowPassword(current => !current)}
            />

            {!isConfirm ? (
              <>
                <VemtapText variant="labelMd" className="pt-2 font-sans-medium text-text">
                  {copy.accountSetup.create.confirmLabel}
                </VemtapText>
                <FieldInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder={copy.accountSetup.create.confirmPlaceholder}
                  accessibilityLabel={copy.accountSetup.create.confirmLabel}
                  autoCapitalize="none"
                  secureTextEntry={!showPassword}
                />

                <View className="gap-2 pt-2">
                  <VemtapText
                    variant="labelSm"
                    tone="secondary"
                    className="font-sans-semibold"
                  >
                    {copy.accountSetup.create.rulesTitle}
                  </VemtapText>
                  {[
                    {
                      label: copy.accountSetup.create.ruleMinLength,
                      pass: rules.minLength,
                    },
                    {
                      label: copy.accountSetup.create.ruleLowercase,
                      pass: rules.hasLowercase,
                    },
                    {
                      label: copy.accountSetup.create.ruleUppercase,
                      pass: rules.hasUppercase,
                    },
                    { label: copy.accountSetup.create.ruleNumber, pass: rules.hasNumber },
                    { label: copy.accountSetup.create.ruleSymbol, pass: rules.hasSymbol },
                  ].map(rule => (
                    <View key={rule.label} className="flex-row items-center gap-2">
                      <Icon
                        name={rule.pass ? 'checkCircle' : 'radioButtonUnchecked'}
                        size={16}
                        color={rule.pass ? colors.success : colors.textTertiary}
                      />
                      <VemtapText
                        variant="caption"
                        tone={rule.pass ? 'default' : 'secondary'}
                      >
                        {rule.label}
                      </VemtapText>
                    </View>
                  ))}
                </View>
              </>
            ) : (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={copy.accountSetup.confirm.forgotPassword}
                hitSlop={6}
                onPress={onForgotPassword}
                className="pt-1"
              >
                <VemtapText variant="labelSm" className="font-sans-semibold text-primary">
                  {copy.accountSetup.confirm.forgotPassword}
                </VemtapText>
              </Pressable>
            )}
          </SetupSectionCard>
        )}

        {displayedError ? (
          <VemtapText
            tone="error"
            accessibilityRole="alert"
            className="text-center text-caption"
          >
            {displayedError}
          </VemtapText>
        ) : null}

        <SetupCallout
          icon="shield"
          title={isConfirm ? 'Both sides stay active' : 'Your data stays private'}
          body={
            isConfirm
              ? copy.accountSetup.confirm.keepBoth
              : 'Passwords are encrypted end-to-end and never shared with customers.'
          }
          iconSize={20}
          className="shadow-none"
        />
      </ScrollView>

      <View className="gap-3 px-6 pb-6 pt-0">
        <PrimaryActionButton
          label={
            isConfirm
              ? passwordlessAccount
                ? copy.accountSetup.confirm.continueGoogle
                : copy.accountSetup.confirm.continue
              : copy.accountSetup.create.continue
          }
          onPress={handleContinue}
          loading={loading}
        />
      </View>
    </SafeAreaView>
  );
}

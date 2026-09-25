import React, { useCallback, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { VemtapText } from '@components/ui/Text';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { RegistrationHeader } from '@components/auth/RegistrationHeader';
import { colors } from '@theme/colors';
import { strings } from '@constants/strings';
import type { AuthStackParamList } from '@navigation/types';

cssInterop(View, { className: 'style' });
cssInterop(ScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});
cssInterop(SafeAreaView, { className: 'style' });
cssInterop(Pressable, { className: 'style' });
cssInterop(TextInput, { className: 'style' });

const styles = StyleSheet.create({
  filledPinBackground: { opacity: 1 },
  filledPinDot: { opacity: 1, transform: [{ scale: 1.25 }] },
  hiddenPinState: { opacity: 0 },
});

type Nav = NativeStackNavigationProp<AuthStackParamList, 'ProfileSetup'>;
type Rt = RouteProp<AuthStackParamList, 'ProfileSetup'>;

function RequiredLabel({ children }: { children: string }) {
  return (
    <VemtapText className="font-sans-medium text-label-sm text-text-secondary">
      {children}
      <VemtapText className="text-error"> *</VemtapText>
    </VemtapText>
  );
}

function PinBoxes({
  value,
  onPinChange,
  label,
  counter,
  match,
  pinVisible,
  onToggleVisibility,
  showToggle,
}: {
  value: string;
  onPinChange: (v: string) => void;
  label: string;
  counter?: string;
  match?: 'match' | 'mismatch' | null;
  pinVisible: boolean;
  onToggleVisibility: () => void;
  showToggle?: boolean;
}) {
  const inputRef = useRef<TextInput>(null);
  const pinSlots = ['pin-1', 'pin-2', 'pin-3', 'pin-4', 'pin-5', 'pin-6'];

  return (
    <View className="gap-2 pt-1">
      <View className="flex-row items-center justify-between">
        <RequiredLabel>{label}</RequiredLabel>
        {counter ? (
          <VemtapText className="text-caption text-text-tertiary">{counter}</VemtapText>
        ) : null}
        {match === 'match' ? (
          <View className="flex-row items-center gap-1">
            <Icon name="checkCircle" size={16} color={colors.badgeDiscountText} />
            <VemtapText className="font-sans-semibold text-caption text-badge-discount-text">
              {strings.auth.profilePinMatches}
            </VemtapText>
          </View>
        ) : null}
        {match === 'mismatch' ? (
          <View className="flex-row items-center gap-1">
            <Icon name="close" size={16} color={colors.error} />
            <VemtapText className="font-sans-semibold text-caption text-error">
              {strings.auth.profilePinMismatch}
            </VemtapText>
          </View>
        ) : null}
        {showToggle ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={pinVisible ? strings.auth.hidePin : strings.auth.showPin}
            hitSlop={8}
            onPress={onToggleVisibility}
            className="h-9 w-9 items-center justify-center"
          >
            <Icon
              name={pinVisible ? 'visibilityOff' : 'visibility'}
              size={19}
              color={colors.textSecondary}
            />
          </Pressable>
        ) : null}
      </View>
      <Pressable onPress={() => inputRef.current?.focus()}>
        <View className="flex-row gap-2">
          {pinSlots.map((slotId, i) => {
            const filled = i < value.length;
            return (
              <View
                key={slotId}
                className="h-12 flex-1 items-center justify-center overflow-hidden rounded-xl bg-surface-canvas shadow-sm"
              >
                <View
                  pointerEvents="none"
                  className="absolute inset-0 rounded-xl bg-surface-tint"
                  style={filled ? styles.filledPinBackground : styles.hiddenPinState}
                />
                {filled && pinVisible ? (
                  <VemtapText variant="headingMd" className="text-heading-md">
                    {value[i]}
                  </VemtapText>
                ) : (
                  <>
                    <View className="h-2.5 w-2.5 rounded-full bg-surface-dim" />
                    <View
                      pointerEvents="none"
                      className="absolute h-2.5 w-2.5 rounded-full bg-primary"
                      style={filled ? styles.filledPinDot : styles.hiddenPinState}
                    />
                  </>
                )}
              </View>
            );
          })}
        </View>
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={t => onPinChange(t.replace(/[^0-9]/g, '').slice(0, 6))}
          keyboardType="number-pad"
          secureTextEntry={!pinVisible}
          maxLength={6}
          className="absolute h-12 w-full opacity-0"
          accessibilityLabel={label}
        />
      </Pressable>
    </View>
  );
}

/**
 * Conversion of stitch_vemtap_design_system/customer_registration_step_3_profile_pin/code.html
 */
export function ProfileSetupScreen() {
  const navigation = useNavigation<Nav>();
  useRoute<Rt>();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [pin1, setPin1] = useState('');
  const [pin2, setPin2] = useState('');
  const [pinVisible, setPinVisible] = useState(false);
  const [hasAcceptedPolicy, setHasAcceptedPolicy] = useState(false);

  const match: 'match' | 'mismatch' | null =
    pin1.length === 6 && pin2.length === 6
      ? pin1 === pin2
        ? 'match'
        : 'mismatch'
      : null;

  const onPin1 = useCallback((v: string) => {
    setPin1(v);
  }, []);

  const onPin2 = useCallback((v: string) => {
    setPin2(v);
  }, []);

  const canSubmit =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    phone.replace(/\D/g, '').length >= 7 &&
    match === 'match' &&
    hasAcceptedPolicy;

  const onComplete = useCallback(() => {
    if (!canSubmit) {
      return;
    }

    navigation.reset({
      index: 0,
      routes: [{ name: 'LocationPermission' }],
    });
  }, [canSubmit, navigation]);

  return (
    <SafeAreaView className="flex-1 bg-surface-canvas" edges={['top', 'bottom']}>
      <RegistrationHeader
        title={strings.auth.profileHeader}
        onBack={() => navigation.goBack()}
      />
      <ScrollView
        contentContainerClassName="px-6 pb-8"
        keyboardShouldPersistTaps="handled"
      >
        {/* Progress rail */}
        <View className="gap-1 pb-3 pt-2">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-1 rounded-full bg-surface-container-high px-2 py-1">
              <View className="h-1.5 w-1.5 rounded-full bg-primary" />
              <VemtapText className="font-sans-semibold text-label-sm text-primary">
                {strings.auth.registerStepOf(3, 3)}
              </VemtapText>
            </View>
            <View className="flex-row items-center gap-1.5">
              <View className="h-2 w-2 rounded-full bg-primary" />
              <View className="h-2 w-2 rounded-full bg-primary" />
              <View className="h-2 w-6 rounded-full bg-primary" />
            </View>
          </View>
          <View className="mt-1 h-1 w-full overflow-hidden rounded-full bg-surface-container">
            <View className="h-full w-full rounded-full bg-primary" />
          </View>
        </View>

        {/* Header content */}
        <View className="pb-4 pt-2">
          <VemtapText
            variant="headingXl"
            accessibilityRole="header"
            className="text-heading-xl"
          >
            {strings.auth.profileTitle}
          </VemtapText>
          <VemtapText tone="secondary" className="mt-1">
            {strings.auth.profileSubtitle}
          </VemtapText>
          <VemtapText className="mt-2 text-caption text-text-tertiary">
            {strings.auth.profileRequiredFields}
          </VemtapText>
        </View>

        <View className="gap-6 pb-12">
          {/* Personal Information */}
          <View className="gap-4">
            <View className="flex-row items-center gap-2">
              <View className="h-7 w-7 items-center justify-center rounded-full bg-surface-tint">
                <Icon name="badge" size={16} color={colors.primary} />
              </View>
              <VemtapText className="font-sans-semibold text-label-md text-text">
                {strings.auth.profilePersonalInfo}
              </VemtapText>
            </View>

            <View className="flex-row gap-3">
              <View className="min-w-0 flex-1 gap-1.5">
                <RequiredLabel>{strings.auth.profileFirstName}</RequiredLabel>
                <TextInput
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder={strings.auth.profileFirstNamePlaceholder}
                  placeholderTextColor={colors.textTertiary}
                  autoCapitalize="words"
                  autoComplete="given-name"
                  className="h-[50px] rounded-xl bg-surface-subtle px-4 text-body-md text-text shadow-sm"
                  accessibilityLabel={strings.auth.profileFirstName}
                />
              </View>
              <View className="min-w-0 flex-1 gap-1.5">
                <RequiredLabel>{strings.auth.profileLastName}</RequiredLabel>
                <TextInput
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder={strings.auth.profileLastNamePlaceholder}
                  placeholderTextColor={colors.textTertiary}
                  autoCapitalize="words"
                  autoComplete="family-name"
                  className="h-[50px] rounded-xl bg-surface-subtle px-4 text-body-md text-text shadow-sm"
                  accessibilityLabel={strings.auth.profileLastName}
                />
              </View>
            </View>

            <View className="gap-1.5">
              <RequiredLabel>{strings.auth.profilePhone}</RequiredLabel>
              <View className="h-[50px] flex-row items-center gap-2 rounded-xl bg-surface-subtle px-3 shadow-sm">
                <View className="flex-row items-center gap-1.5 rounded-lg bg-surface-canvas px-2.5 py-1.5 shadow-sm">
                  <View className="h-3.5 w-5 overflow-hidden rounded-sm">
                    <View className="h-[4.67px] bg-[#008753]" />
                    <View className="h-[4.67px] bg-white" />
                    <View className="h-[4.67px] bg-[#008753]" />
                  </View>
                  <VemtapText className="font-sans-semibold text-label-sm text-text">
                    +234
                  </VemtapText>
                  <Icon name="expandMore" size={14} color={colors.textTertiary} />
                </View>
                <TextInput
                  value={phone}
                  onChangeText={t => setPhone(t.replace(/[^0-9 ]/g, ''))}
                  placeholder={strings.auth.profilePhonePlaceholder}
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="phone-pad"
                  className="h-full flex-1 text-body-md text-text"
                  accessibilityLabel={strings.auth.profilePhone}
                />
              </View>
            </View>
          </View>

          {/* PIN card */}
          <View className="gap-4 rounded-xl bg-surface-subtle p-4 shadow-sm">
            <View className="gap-1">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <View className="h-7 w-7 items-center justify-center rounded-full bg-surface-tint">
                    <Icon name="lock" size={18} color={colors.primary} />
                  </View>
                  <VemtapText variant="headingSm">
                    {strings.auth.profilePinCardTitle}
                  </VemtapText>
                </View>
                <View className="rounded-full bg-surface-container px-2 py-0.5">
                  <VemtapText className="font-sans-semibold text-caption text-primary">
                    {strings.auth.profilePinEncrypted}
                  </VemtapText>
                </View>
              </View>
              <VemtapText className="text-caption text-text-secondary">
                {strings.auth.profilePinHelper}
              </VemtapText>
            </View>

            <PinBoxes
              value={pin1}
              onPinChange={onPin1}
              label={strings.auth.profileCreatePin}
              counter={strings.auth.profilePinCounter(pin1.length)}
              pinVisible={pinVisible}
              onToggleVisibility={() => setPinVisible(visible => !visible)}
              showToggle
            />
            <PinBoxes
              value={pin2}
              onPinChange={onPin2}
              label={strings.auth.profileConfirmPin}
              match={match}
              pinVisible={pinVisible}
              onToggleVisibility={() => setPinVisible(visible => !visible)}
            />

            <View className="flex-row items-center gap-2 pt-1">
              <Icon name="verifiedUser" size={18} color={colors.primary} />
              <VemtapText className="text-caption text-text-secondary">
                {strings.auth.profilePinSecurity}
              </VemtapText>
            </View>
          </View>

          {/* Benefit card */}
          <View className="flex-row items-center gap-3 rounded-xl bg-surface-tint p-3">
            <View className="h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-canvas shadow-sm">
              <Icon name="loyalty" size={22} color={colors.primary} />
            </View>
            <View className="min-w-0 flex-1">
              <VemtapText className="font-sans-semibold text-label-sm text-text">
                {strings.auth.profileBenefitTitle}
              </VemtapText>
              <VemtapText numberOfLines={2} className="text-caption text-text-secondary">
                {strings.auth.profileBenefitBody}
              </VemtapText>
            </View>
          </View>

          <Pressable
            accessibilityRole="checkbox"
            accessibilityLabel={strings.auth.profileConsent}
            accessibilityState={{ checked: hasAcceptedPolicy }}
            className="flex-row items-start gap-2 px-1 py-1"
            onPress={() => setHasAcceptedPolicy(value => !value)}
          >
            <View
              className={
                hasAcceptedPolicy
                  ? 'mt-0.5 h-5 w-5 items-center justify-center rounded-md bg-primary'
                  : 'mt-0.5 h-5 w-5 items-center justify-center rounded-md border border-border-active bg-surface-canvas'
              }
            >
              {hasAcceptedPolicy ? <Icon name="check" size={14} color="#FFFFFF" /> : null}
            </View>
            <VemtapText className="flex-1 text-caption leading-relaxed text-text-secondary">
              {strings.auth.profileConsent}
            </VemtapText>
          </Pressable>

          {/* Actions */}
          <View className="gap-3 pt-2">
            <Button
              label={strings.auth.profileCompleteSetup}
              disabled={!canSubmit}
              rightIcon={<Icon name="arrowForward" size={20} color="#FFFFFF" />}
              onPress={onComplete}
            />
            <View className="items-center gap-1 px-3 py-2">
              <VemtapText className="text-center text-label-sm text-text-secondary">
                {strings.auth.profileNextLabel}
              </VemtapText>
              <Pressable
                accessibilityRole="button"
                hitSlop={8}
                className="max-w-full items-center"
                onPress={onComplete}
              >
                <VemtapText className="text-center font-sans-medium text-label-sm text-primary">
                  {strings.auth.profileNextLocation}
                </VemtapText>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

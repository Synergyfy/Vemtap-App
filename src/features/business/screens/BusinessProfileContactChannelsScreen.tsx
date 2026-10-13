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
  countryFlags,
  socialPresences,
  type SocialPresence,
} from '@features/business/businessData';
import { SocialPresenceRow } from '@features/business/components/BusinessSetupCards';
import {
  FieldInput,
  InfoHint,
  PhonePrefix,
  PrimaryActionButton,
  SetupCallout,
  SetupStepBar,
  SetupSectionCard,
  SetupSectionHeading,
  StatusPill,
  TextActionButton,
  ToggleRow,
} from '@features/business/components/BusinessSetupPrimitives';

cssInterop(View, { className: 'style' });
cssInterop(Pressable, { className: 'style' });
cssInterop(ScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});
cssInterop(SafeAreaView, { className: 'style' });

export interface BusinessContactChannelsValue {
  phone: string;
  email: string;
  website: string;
  presences: SocialPresence[];
  allowInAppChat: boolean;
  whatsappAlerts: boolean;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface BusinessProfileContactChannelsScreenProps {
  onBack?: () => void;
  onComplete?: (value: BusinessContactChannelsValue) => void;
  onSaveDraft?: (value: BusinessContactChannelsValue) => void;
  onAddPresence?: () => void;
  onEditPresence?: (presence: SocialPresence) => void;
  initialValue?: Partial<BusinessContactChannelsValue>;
}

/**
 * Conversion of
 * stitch_vemtap_design_system_1/business_profile_3._contact_channels/code.html
 */
export function BusinessProfileContactChannelsScreen({
  onBack,
  onComplete,
  onSaveDraft,
  onAddPresence,
  onEditPresence,
  initialValue,
}: BusinessProfileContactChannelsScreenProps) {
  const [phone, setPhone] = useState(initialValue?.phone ?? '803 555 9821');
  const [email, setEmail] = useState(initialValue?.email ?? 'hello@urbangrill.ng');
  const [website, setWebsite] = useState(
    initialValue?.website ?? 'https://www.urbangrill.ng',
  );
  const [presences, setPresences] = useState<SocialPresence[]>(
    initialValue?.presences ?? socialPresences,
  );
  const [allowChat, setAllowChat] = useState(initialValue?.allowInAppChat ?? true);
  const [whatsappAlerts, setWhatsappAlerts] = useState(
    initialValue?.whatsappAlerts ?? true,
  );

  const handleBack = useCallback(() => onBack?.(), [onBack]);

  const onAdd = useCallback(() => {
    const added = onAddPresence?.();
    if (added) {
      setPresences(current => [...current, added]);
    }
  }, [onAddPresence]);

  const value = useMemo<BusinessContactChannelsValue>(
    () => ({
      phone,
      email,
      website,
      presences,
      allowInAppChat: allowChat,
      whatsappAlerts,
    }),
    [allowChat, email, phone, presences, website, whatsappAlerts],
  );

  // Phone feeds voucher verification; the email becomes the account identity
  // and the invoices address on `register/owner` / `upgrade-to-owner`.
  const phoneValid = phone.replace(/\D/g, '').length >= 7;
  const emailValid = EMAIL_PATTERN.test(email.trim());
  const blockingReason = !phoneValid
    ? copy.contactChannels.phoneRequired
    : !emailValid
      ? copy.contactChannels.emailRequired
      : null;
  const canContinue = blockingReason === null;

  const handleComplete = useCallback(() => {
    if (!canContinue) return;
    onComplete?.(value);
  }, [canContinue, onComplete, value]);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <RegistrationHeader title={copy.contactChannels.header} onBack={handleBack} />

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-4 px-6 pb-10 pt-4"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <SetupStepBar
          step={copy.contactChannels.step}
          percent={copy.contactChannels.percent}
          progress={100}
          stepStyle="plain"
          stepMarker="check"
        />

        <View className="gap-2 pt-1">
          <StatusPill
            label={copy.contactChannels.finalStep}
            icon="contactSupport"
            tone="brand"
          />
          <VemtapText
            accessibilityRole="header"
            variant="headingMd"
            className="text-heading-md"
          >
            {copy.contactChannels.title}
          </VemtapText>
          <VemtapText tone="secondary" className="leading-snug">
            {copy.contactChannels.subtitle}
          </VemtapText>
        </View>

        <SetupSectionCard className="gap-2">
          <View className="flex-row flex-wrap items-center justify-between gap-2">
            <VemtapText
              variant="labelMd"
              className="min-w-0 flex-1 font-sans-medium text-text"
            >
              {copy.contactChannels.phoneLabel}
            </VemtapText>
            <StatusPill
              label={copy.contactChannels.required}
              tone="brand"
              className="px-2"
            />
          </View>
          <View className="flex-row items-center gap-2">
            <PhonePrefix
              flag={countryFlags.nigeria}
              dialCode="+234"
              accessibilityLabel={copy.contactChannels.phoneLabel}
            />
            <View className="min-w-0 flex-1">
              <FieldInput
                value={phone}
                onChangeText={setPhone}
                placeholder={copy.contactChannels.phonePlaceholder}
                accessibilityLabel={copy.contactChannels.phoneLabel}
                keyboardType="phone-pad"
                trailingIcon="phone"
              />
            </View>
          </View>
          <InfoHint text={copy.contactChannels.phoneHint} />
        </SetupSectionCard>

        <SetupSectionCard className="gap-2">
          <View className="flex-row flex-wrap items-center justify-between gap-2">
            <VemtapText
              variant="labelMd"
              className="min-w-0 flex-1 font-sans-medium text-text"
            >
              {copy.contactChannels.emailLabel}
            </VemtapText>
            <StatusPill
              label={copy.contactChannels.required}
              tone="brand"
              className="px-2"
            />
          </View>
          <FieldInput
            value={email}
            onChangeText={setEmail}
            placeholder={copy.contactChannels.emailPlaceholder}
            accessibilityLabel={copy.contactChannels.emailLabel}
            keyboardType="email-address"
            autoCapitalize="none"
            trailingIcon="mail"
          />
          <InfoHint text={copy.contactChannels.emailHint} icon="verifiedUser" />
        </SetupSectionCard>

        <SetupSectionCard className="gap-2">
          <VemtapText variant="labelMd" className="font-sans-medium text-text">
            {copy.contactChannels.websiteLabel}
          </VemtapText>
          <FieldInput
            value={website}
            onChangeText={setWebsite}
            placeholder={copy.contactChannels.websitePlaceholder}
            accessibilityLabel={copy.contactChannels.websiteLabel}
            keyboardType="url"
            autoCapitalize="none"
            trailingIcon="web"
          />
        </SetupSectionCard>

        <SetupSectionCard className="gap-3">
          <View className="flex-row items-start justify-between gap-2">
            <View className="min-w-0 flex-1">
              <VemtapText variant="labelMd" className="font-sans-semibold text-text">
                {copy.contactChannels.socialTitle}
              </VemtapText>
              <VemtapText variant="caption" tone="secondary">
                {copy.contactChannels.socialBody}
              </VemtapText>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={copy.contactChannels.socialAdd}
              hitSlop={6}
              onPress={onAdd}
              className="h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-subtle active:bg-surface-tint-blue"
            >
              <Icon name="plus" size={18} color={colors.primary} />
            </Pressable>
          </View>
          <View className="gap-2.5">
            {presences.map(presence => (
              <SocialPresenceRow
                key={presence.id}
                presence={presence}
                editLabel={copy.contactChannels.editHandle}
                onEdit={() => onEditPresence?.(presence)}
              />
            ))}
          </View>
        </SetupSectionCard>

        <SetupSectionCard className="gap-3">
          <SetupSectionHeading title={copy.contactChannels.preferencesTitle} />
          <View className="gap-4">
            <ToggleRow
              title={copy.contactChannels.chatLabel}
              badge={copy.contactChannels.chatBadge}
              body={copy.contactChannels.chatBody}
              value={allowChat}
              onValueChange={setAllowChat}
            />
            <ToggleRow
              title={copy.contactChannels.whatsappAlertsLabel}
              body={copy.contactChannels.whatsappAlertsBody}
              value={whatsappAlerts}
              onValueChange={setWhatsappAlerts}
            />
          </View>
        </SetupSectionCard>

        <SetupCallout
          icon="rocket"
          title={copy.contactChannels.launchTitle}
          body={copy.contactChannels.launchBody}
          iconSize={22}
          className="shadow-none"
        />
      </ScrollView>

      <View className="gap-3 px-6 pb-6 pt-0">
        {blockingReason ? (
          <VemtapText
            tone="secondary"
            accessibilityRole="alert"
            className="text-center text-caption"
          >
            {blockingReason}
          </VemtapText>
        ) : null}
        <PrimaryActionButton
          label={copy.contactChannels.complete}
          disabled={!canContinue}
          onPress={handleComplete}
        />
        <TextActionButton
          label={copy.contactChannels.saveDraft}
          onPress={() => onSaveDraft?.(value)}
        />
      </View>
    </SafeAreaView>
  );
}

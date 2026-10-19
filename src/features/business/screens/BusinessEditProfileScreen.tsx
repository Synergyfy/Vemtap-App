import React, { useState } from 'react';
import { ActivityIndicator, Image, Pressable, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { Avatar } from '@components/ui/Avatar';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import {
  BusinessActionDock,
  BusinessScreenLayout,
} from '@features/business/components/BusinessPrimitives';
import { FieldInput } from '@features/business/components/BusinessSetupPrimitives';
import type { BusinessImageKind } from '@features/business/hooks/useBusinessImageUpload';

cssInterop(Pressable, { className: 'style' });
cssInterop(Image, { className: 'style' });

const copy = strings.businessEditProfile;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** The editable profile, as the form holds it. */
export interface BusinessProfileFormValue {
  name: string;
  about: string;
  phone: string;
  whatsappNumber: string;
  officialEmail: string;
  website: string;
  address: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  x: string;
}

export interface BusinessEditProfileScreenProps {
  /** The saved profile the form starts from. */
  initialValue: BusinessProfileFormValue;
  logoUri?: string;
  coverUri?: string;
  onBack?: () => void;
  onSave: (value: BusinessProfileFormValue) => void;
  saving?: boolean;
  /** Pick, upload and save a new logo or banner. */
  onChangeImage?: (kind: BusinessImageKind) => void;
  /** The image currently uploading, if any. */
  uploading?: BusinessImageKind | null;
  onPreviewStorefront?: () => void;
}

function SectionTitle({ children }: { children: string }) {
  return (
    <VemtapText variant="labelMd" className="font-sans-semibold">
      {children}
    </VemtapText>
  );
}

/**
 * Edit the business's public profile: logo and banner (saved as soon as they
 * upload), then name, about, contact channels and social links, saved together
 * with `PATCH /businesses/my-business`.
 */
export function BusinessEditProfileScreen({
  initialValue,
  logoUri,
  coverUri,
  onBack,
  onSave,
  saving = false,
  onChangeImage,
  uploading = null,
  onPreviewStorefront,
}: BusinessEditProfileScreenProps) {
  const [value, setValue] = useState<BusinessProfileFormValue>(initialValue);
  const [submitted, setSubmitted] = useState(false);
  const set = (key: keyof BusinessProfileFormValue) => (text: string) =>
    setValue(current => ({ ...current, [key]: text }));

  const nameError = !value.name.trim() ? copy.nameRequired : null;
  const emailError =
    value.officialEmail.trim() && !EMAIL_PATTERN.test(value.officialEmail.trim())
      ? copy.emailInvalid
      : null;
  const firstError = nameError ?? emailError;

  const save = () => {
    setSubmitted(true);
    if (firstError || saving) return;
    onSave(value);
  };

  return (
    <BusinessScreenLayout
      header={{ title: copy.title, onBack, centerTitle: false }}
      contentContainerClassName="gap-5 pb-8"
      footer={
        <BusinessActionDock>
          {submitted && firstError ? (
            <VemtapText
              variant="caption"
              className="text-center text-error"
              accessibilityRole="alert"
            >
              {firstError}
            </VemtapText>
          ) : null}
          <Button
            label={copy.save}
            labelVariant="labelMd"
            loading={saving}
            disabled={saving}
            onPress={save}
          />
          {onPreviewStorefront ? (
            <Button
              label={copy.previewStorefront}
              labelVariant="labelMd"
              variant="secondary"
              onPress={onPreviewStorefront}
            />
          ) : null}
        </BusinessActionDock>
      }
    >
      <View className="gap-3">
        <View className="gap-0.5">
          <SectionTitle>{copy.imagesTitle}</SectionTitle>
          <VemtapText variant="caption" tone="secondary">
            {copy.imagesHint}
          </VemtapText>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.changeCover}
          disabled={uploading !== null}
          onPress={() => onChangeImage?.('cover')}
          className="h-36 w-full items-center justify-center overflow-hidden rounded-card bg-surface-container"
        >
          {coverUri ? (
            <Image
              source={{ uri: coverUri }}
              className="absolute inset-0 h-full w-full"
              resizeMode="cover"
            />
          ) : null}
          <View className="flex-row items-center gap-1.5 rounded-full bg-inverse-surface px-3 py-1.5">
            {uploading === 'cover' ? (
              <ActivityIndicator size="small" color={colors.surface} />
            ) : (
              <Icon name="camera" size={16} color={colors.surface} />
            )}
            <VemtapText variant="labelSm" className="font-sans-semibold text-surface">
              {uploading === 'cover' ? copy.uploading : copy.changeCover}
            </VemtapText>
          </View>
        </Pressable>
        <View className="flex-row items-center gap-3">
          <Avatar uri={logoUri} name={value.name} size="lg" tone="brand" />
          <Button
            label={uploading === 'logo' ? copy.uploading : copy.changeLogo}
            labelVariant="labelSm"
            variant="secondary"
            size="sm"
            fullWidth={false}
            loading={uploading === 'logo'}
            disabled={uploading !== null}
            onPress={() => onChangeImage?.('logo')}
          />
        </View>
      </View>

      <View className="gap-3">
        <SectionTitle>{copy.detailsTitle}</SectionTitle>
        <FieldInput
          label={copy.nameLabel}
          value={value.name}
          onChangeText={set('name')}
          placeholder={copy.namePlaceholder}
          accessibilityLabel={copy.nameLabel}
          autoCapitalize="words"
          maxLength={80}
        />
        <FieldInput
          label={copy.aboutLabel}
          value={value.about}
          onChangeText={set('about')}
          placeholder={copy.aboutPlaceholder}
          accessibilityLabel={copy.aboutLabel}
          multiline
          maxLength={500}
        />
      </View>

      <View className="gap-3">
        <SectionTitle>{copy.contactTitle}</SectionTitle>
        <FieldInput
          label={copy.phoneLabel}
          value={value.phone}
          onChangeText={set('phone')}
          accessibilityLabel={copy.phoneLabel}
          keyboardType="phone-pad"
          leadingIcon="call"
        />
        <FieldInput
          label={copy.whatsappLabel}
          value={value.whatsappNumber}
          onChangeText={set('whatsappNumber')}
          accessibilityLabel={copy.whatsappLabel}
          keyboardType="phone-pad"
          leadingIcon="whatsapp"
        />
        <FieldInput
          label={copy.emailLabel}
          value={value.officialEmail}
          onChangeText={set('officialEmail')}
          accessibilityLabel={copy.emailLabel}
          keyboardType="email-address"
          autoCapitalize="none"
          leadingIcon="alternateEmail"
        />
        <FieldInput
          label={copy.websiteLabel}
          value={value.website}
          onChangeText={set('website')}
          accessibilityLabel={copy.websiteLabel}
          keyboardType="url"
          autoCapitalize="none"
          leadingIcon="web"
        />
        <FieldInput
          label={copy.addressLabel}
          value={value.address}
          onChangeText={set('address')}
          accessibilityLabel={copy.addressLabel}
          leadingIcon="locationOn"
        />
      </View>

      <View className="gap-3">
        <SectionTitle>{copy.socialsTitle}</SectionTitle>
        {(
          [
            ['instagram', copy.instagramLabel],
            ['facebook', copy.facebookLabel],
            ['tiktok', copy.tiktokLabel],
            ['x', copy.xLabel],
          ] as const
        ).map(([key, label]) => (
          <FieldInput
            key={key}
            label={label}
            value={value[key]}
            onChangeText={set(key)}
            accessibilityLabel={label}
            autoCapitalize="none"
          />
        ))}
      </View>
    </BusinessScreenLayout>
  );
}

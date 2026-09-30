import React, { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { cssInterop } from 'nativewind';
import { Button } from '@components/ui/Button';
import { Icon, type IconName } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { businessOpsMedia } from '@features/business/data/businessOpsImages';
import {
  BusinessActionDock,
  BusinessProductImage,
  BusinessScreenLayout,
  BusinessStatusPill,
} from '@features/business/components/BusinessPrimitives';
import {
  BusinessPanel,
  BusinessToastPill,
  BusinessToggleChip,
} from '@features/business/components/BusinessOpsPrimitives';

cssInterop(Pressable, { className: 'style' });
cssInterop(LinearGradient, { className: 'style' });

const copy = strings.businessProfilePreview;

export interface BusinessProfilePreviewScreenProps {
  onBack?: () => void;
  onMoreActions?: () => void;
  onChangeCover?: () => void;
  onEditAvatar?: () => void;
  onPublicPreview?: () => void;
  onPublicStorefront?: () => void;
  onEditProfile?: () => void;
  onManageContacts?: () => void;
  onCopyValue?: (value: string) => void;
  onAddSocial?: () => void;
  onSaveChanges?: () => void;
  onDiscardChanges?: () => void;
}

/**
 * Merchant-facing storefront profile: live cover, verified trust block, public
 * contact channels and toggleable amenities, with a docked save bar.
 */
export function BusinessProfilePreviewScreen({
  onBack,
  onMoreActions,
  onChangeCover,
  onEditAvatar,
  onPublicPreview,
  onPublicStorefront,
  onEditProfile,
  onManageContacts,
  onCopyValue,
  onAddSocial,
  onSaveChanges,
  onDiscardChanges,
}: BusinessProfilePreviewScreenProps) {
  const [activeAmenities, setActiveAmenities] = useState<string[]>(
    copy.amenities.map(amenity => amenity.id),
  );
  const [saved, setSaved] = useState(false);

  const toggleAmenity = (id: string) => {
    setActiveAmenities(current =>
      current.includes(id) ? current.filter(item => item !== id) : [...current, id],
    );
  };

  const activeCount = activeAmenities.length;
  const activeLabel = useMemo(
    () =>
      strings.businessProfilePreview.amenitiesActiveCount.replace(
        '%s',
        String(activeCount),
      ),
    [activeCount],
  );

  const handleSave = () => {
    setSaved(true);
    onSaveChanges?.();
  };

  return (
    <BusinessScreenLayout
      header={{
        title: copy.headerTitle,
        onBack,
        centerTitle: false,
        actions: [{ icon: 'more', label: copy.discardChanges, onPress: onMoreActions }],
      }}
      contentContainerClassName="pb-8"
      footer={
        <BusinessActionDock>
          <View className="flex-row gap-2">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={copy.discardChanges}
              onPress={onDiscardChanges}
              className="h-12 w-12 shrink-0 items-center justify-center rounded-field bg-surface-container active:scale-95"
            >
              <Icon name="restore" size={20} color={colors.textSecondary} />
            </Pressable>
            <Button
              label={copy.saveChanges}
              labelVariant="labelMd"
              onPress={handleSave}
              className="flex-1"
              leftIcon={<Icon name="check" size={18} color={colors.surface} />}
            />
          </View>
        </BusinessActionDock>
      }
    >
      <View className="flex-row items-center justify-between gap-2">
        <View className="min-w-0 flex-1 flex-row items-center gap-2">
          <View className="h-2.5 w-2.5 shrink-0 rounded-full bg-badge-discount-text" />
          <VemtapText
            variant="labelSm"
            tone="secondary"
            numberOfLines={1}
            className="min-w-0 flex-1"
          >
            {copy.liveNetwork}
          </VemtapText>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.publicPreview}
          onPress={onPublicPreview}
          className="min-h-9 shrink-0 flex-row items-center gap-1.5 rounded-full bg-surface-container-high px-3 py-1.5 active:scale-95"
        >
          <Icon name="visibility" size={16} color={colors.primary} />
          <VemtapText variant="labelSm" className="font-sans-semibold text-primary">
            {copy.publicPreview}
          </VemtapText>
        </Pressable>
      </View>

      <View className="relative mt-3 overflow-hidden rounded-card shadow-sm">
        <View className="h-40 w-full bg-surface-dim">
          <BusinessProductImage
            source={businessOpsMedia.profileCover}
            alt={businessOpsMedia.profileCover.alt}
            className="h-full w-full"
          />
        </View>
        <LinearGradient
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.6)']}
          locations={[0, 0.5, 1]}
          className="absolute inset-0"
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.changeCover}
          onPress={onChangeCover}
          className="absolute right-2.5 top-2.5 min-h-9 flex-row items-center gap-1.5 rounded-full bg-inverse-surface px-3 py-1.5 active:scale-95"
        >
          <Icon name="camera" size={16} color={colors.surface} />
          <VemtapText variant="labelSm" className="font-sans-semibold text-surface">
            {copy.changeCover}
          </VemtapText>
        </Pressable>
        <View className="absolute bottom-2.5 right-2.5 flex-row items-center gap-1.5 rounded-full bg-surface px-2.5 py-1 shadow-sm">
          <Icon name="storefront" size={14} color={colors.badgeDiscountText} />
          <VemtapText variant="labelSm" className="font-sans-semibold">
            {copy.storeNumber}
          </VemtapText>
        </View>
      </View>

      <View className="-mt-9 flex-row items-end justify-between gap-3 px-3">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.editProfile}
          onPress={onEditAvatar}
          className="h-[68px] w-[68px] shrink-0 overflow-hidden rounded-full border-2 border-surface bg-surface p-1 shadow-md"
        >
          <BusinessProductImage
            source={businessOpsMedia.profileLogo}
            alt={businessOpsMedia.profileLogo.alt}
            className="h-full w-full rounded-full"
          />
          <View className="absolute bottom-0 right-0 h-7 w-7 items-center justify-center rounded-full bg-primary shadow-md">
            <Icon name="edit" size={14} color={colors.surface} />
          </View>
        </Pressable>
        <View className="pb-1">
          <BusinessStatusPill
            label={copy.activeVerified}
            tone="success"
            icon="verified"
          />
        </View>
      </View>

      <View className="mt-3 gap-2">
        <View className="flex-row flex-wrap items-center gap-2">
          <VemtapText
            accessibilityRole="header"
            variant="headingLg"
            className="text-heading-lg"
            numberOfLines={2}
          >
            {copy.name}
          </VemtapText>
          <Icon name="verified" size={18} color={colors.primary} />
        </View>
        <View className="flex-row items-center gap-1.5 self-start rounded-full bg-surface-container px-2.5 py-1">
          <Icon name="restaurant" size={14} color={colors.secondary} />
          <VemtapText variant="labelSm" className="text-secondary" numberOfLines={1}>
            {copy.category}
          </VemtapText>
        </View>
        <VemtapText variant="bodyMd" tone="secondary" className="leading-snug">
          {copy.bio}
        </VemtapText>
        <View className="mt-1 flex-row gap-2">
          <Button
            label={copy.publicStorefront}
            labelVariant="labelMd"
            variant="secondary"
            className="flex-1"
            onPress={onPublicStorefront}
            leftIcon={<Icon name="store" size={17} color={colors.primary} />}
          />
          <Button
            label={copy.editProfile}
            labelVariant="labelMd"
            className="flex-1"
            onPress={onEditProfile}
            leftIcon={<Icon name="tune" size={17} color={colors.surface} />}
          />
        </View>
      </View>

      <View className="relative mt-4">
        <View className="absolute -bottom-3 -right-3 h-24 w-24 rounded-full bg-badge-discount-bg opacity-60" />
        <View className="relative gap-3">
          <View className="flex-row items-start gap-3">
            <View className="h-10 w-10 shrink-0 items-center justify-center rounded-full bg-badge-discount-bg">
              <Icon name="shield" size={22} color={colors.badgeDiscountText} />
            </View>
            <View className="min-w-0 flex-1">
              <View className="flex-row items-center justify-between gap-2">
                <VemtapText
                  variant="labelMd"
                  className="min-w-0 flex-1 font-sans-semibold"
                >
                  {copy.verifiedTitle}
                </VemtapText>
                <BusinessStatusPill label={copy.verifiedTier} tone="brand" />
              </View>
              <VemtapText
                variant="caption"
                tone="secondary"
                className="mt-1 leading-snug"
              >
                {copy.verifiedBody}
              </VemtapText>
            </View>
          </View>
          <View className="flex-row gap-2 border-t border-border pt-2">
            {copy.verifiedChecks.map(check => (
              <View
                key={check.label}
                className="min-w-0 flex-1 flex-row items-center gap-1"
              >
                <Icon
                  name={check.icon as IconName}
                  size={14}
                  color={colors.badgeDiscountText}
                />
                <VemtapText
                  variant="micro"
                  className="min-w-0 flex-1 font-sans-medium text-badge-discount-text"
                  numberOfLines={2}
                >
                  {check.label}
                </VemtapText>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View className="mt-4">
        <View className="mb-2 flex-row items-center justify-between gap-2">
          <VemtapText variant="labelMd" className="min-w-0 flex-1 font-sans-semibold">
            {copy.contactsTitle}
          </VemtapText>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.contactsManage}
            hitSlop={8}
            onPress={onManageContacts}
          >
            <VemtapText variant="labelSm" className="font-sans-semibold text-primary">
              {copy.contactsManage}
            </VemtapText>
          </Pressable>
        </View>
        <BusinessPanel className="gap-1">
          {copy.contacts.map(contact => (
            <View
              key={contact.label}
              className="flex-row items-center gap-3 rounded-field px-1 py-2"
            >
              <View className="h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-tint">
                <Icon name={contact.icon as IconName} size={18} color={colors.primary} />
              </View>
              <View className="min-w-0 flex-1">
                <VemtapText variant="caption" tone="tertiary" numberOfLines={1}>
                  {contact.label}
                </VemtapText>
                <VemtapText variant="bodyMd" numberOfLines={1}>
                  {contact.value}
                </VemtapText>
              </View>
              {contact.trailing === copy.contactVerified ? (
                <BusinessStatusPill label={contact.trailing} tone="success" />
              ) : (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${contact.label}: ${contact.value}`}
                  hitSlop={8}
                  onPress={() => onCopyValue?.(contact.value)}
                >
                  <Icon
                    name={contact.trailing === copy.contactCopy ? 'copy' : 'forward'}
                    size={18}
                    color={colors.textTertiary}
                  />
                </Pressable>
              )}
            </View>
          ))}
          <View className="mt-1 flex-row items-center justify-between gap-2 border-t border-border px-1 pt-3">
            {copy.socials.map(social => (
              <View
                key={social.label}
                className="flex-row items-center gap-1.5 rounded-full bg-surface-container px-3 py-1.5"
              >
                <Icon
                  name={social.icon as IconName}
                  size={14}
                  color={colors.textSecondary}
                />
                <VemtapText
                  variant="caption"
                  className="font-sans-medium"
                  numberOfLines={1}
                >
                  {social.label}
                </VemtapText>
              </View>
            ))}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={copy.addSocial}
              hitSlop={8}
              onPress={onAddSocial}
              className="h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-container active:scale-95"
            >
              <Icon name="plus" size={18} color={colors.textSecondary} />
            </Pressable>
          </View>
        </BusinessPanel>
      </View>

      <View className="mt-4">
        <View className="mb-2 flex-row items-start justify-between gap-2">
          <View className="min-w-0 flex-1">
            <VemtapText variant="labelMd" className="font-sans-semibold">
              {copy.amenitiesTitle}
            </VemtapText>
            <VemtapText variant="caption" tone="secondary" className="mt-0.5">
              {copy.amenitiesHint}
            </VemtapText>
          </View>
          <BusinessStatusPill label={activeLabel} tone="brand" className="mt-0.5" />
        </View>
        <View className="flex-row flex-wrap gap-2">
          {copy.amenities.map(amenity => (
            <BusinessToggleChip
              key={amenity.id}
              label={amenity.label}
              icon={amenity.icon as IconName}
              selected={activeAmenities.includes(amenity.id)}
              onPress={() => toggleAmenity(amenity.id)}
            />
          ))}
        </View>
      </View>

      {saved ? <BusinessToastPill message={copy.savedToast} /> : null}
    </BusinessScreenLayout>
  );
}

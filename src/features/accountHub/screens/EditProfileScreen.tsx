import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  AccountHeader,
  FormSection,
  PageScroll,
  ProfileField,
} from '@features/accountHub/components/AccountScreensPrimitives';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { useCurrentUserDisplay } from '@hooks/useCurrentUserDisplay';
import { colors } from '@theme/colors';

const copy = strings.accountScreens.editProfile;

export interface EditProfileScreenProps {
  onBack?: () => void;
  onSave?: () => void;
  onDiscard?: () => void;
  onChangePhoto?: () => void;
  onChooseDistrict?: () => void;
}

export function EditProfileScreen({
  onBack,
  onSave,
  onDiscard,
  onChangePhoto,
  onChooseDistrict,
}: EditProfileScreenProps) {
  const me = useCurrentUserDisplay();
  const [firstName, setFirstName] = useState(me.firstName);
  const [lastName, setLastName] = useState(me.lastName);
  const [gender, setGender] = useState<string>(copy.female);
  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-background">
      <AccountHeader title={copy.title} onBack={onBack} />
      <PageScroll>
        <View className="items-center gap-2 py-3">
          <View className="h-28 w-28 items-center justify-center rounded-full bg-surface-container-high shadow-md">
            <VemtapText
              variant="displayMobile"
              className="text-heading-xl text-secondary"
            >
              {me.initials}
            </VemtapText>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={copy.changePhoto}
              onPress={onChangePhoto}
              className="absolute bottom-0 right-0 h-9 w-9 items-center justify-center rounded-full bg-primary"
            >
              <Icon name="edit" size={18} color={colors.surface} />
            </Pressable>
          </View>
          <Pressable accessibilityRole="button" onPress={onChangePhoto}>
            <VemtapText variant="labelSm" tone="brand">
              {copy.changePhoto}
            </VemtapText>
          </Pressable>
          <VemtapText variant="caption" tone="tertiary">
            {copy.photoHint}
          </VemtapText>
        </View>
        <View className="flex-row items-center gap-3 rounded-card bg-surface p-4 shadow-sm">
          <View className="h-10 w-10 shrink-0 items-center justify-center rounded-full bg-badge-discount-bg">
            <Icon name="verifiedUser" size={22} color={colors.badgeDiscountText} />
          </View>
          <View className="min-w-0 flex-1">
            <View className="flex-row items-center gap-2">
              <VemtapText
                variant="labelMd"
                className="font-sans-semibold"
                numberOfLines={1}
              >
                {copy.verifiedConsumer}
              </VemtapText>
              <Icon name="checkCircle" size={16} color={colors.badgeDiscountText} />
            </View>
            <VemtapText variant="caption" tone="secondary">
              {copy.activeSince}
            </VemtapText>
          </View>
          <View className="shrink-0 rounded-full bg-badge-discount-bg px-2 py-1">
            <VemtapText variant="labelSm" tone="success" numberOfLines={1}>
              {copy.level}
            </VemtapText>
          </View>
        </View>
        <FormSection>
          <View className="flex-row gap-3">
            <View className="min-w-0 flex-1">
              <ProfileField
                label={copy.firstName}
                value={firstName}
                onChangeText={setFirstName}
              />
            </View>
            <View className="min-w-0 flex-1">
              <ProfileField
                label={copy.lastName}
                value={lastName}
                onChangeText={setLastName}
              />
            </View>
          </View>
          <ProfileField label={copy.email} value={me.email} icon="mail" />
          <ProfileField label={copy.phone} value={me.phone} icon="phone" />
          <Pressable
            accessibilityRole="button"
            onPress={onChooseDistrict}
            className="flex-row items-center justify-between rounded-field bg-surface-container-low px-3 py-4"
          >
            <View className="min-w-0 flex-row items-center gap-2">
              <Icon name="locationOn" size={20} color={colors.primary} />
              <VemtapText variant="bodyMd" numberOfLines={1}>
                {copy.districtValue}
              </VemtapText>
            </View>
            <Icon name="forward" size={20} color={colors.textTertiary} />
          </Pressable>
          <ProfileField
            label={`${copy.birthday} (${copy.optional})`}
            value={copy.birthdayValue}
            icon="eventAvailable"
          />
          <View className="gap-2">
            <VemtapText variant="labelSm" tone="secondary">
              {copy.gender}
            </VemtapText>
            <View className="flex-row flex-wrap gap-2">
              {[copy.female, copy.male, copy.preferNot].map(option => (
                <Pressable
                  key={option}
                  accessibilityRole="button"
                  accessibilityState={{ selected: gender === option }}
                  onPress={() => setGender(option)}
                  className={`rounded-full px-4 py-2 shadow-sm ${gender === option ? 'bg-surface-tint' : 'bg-surface-container-low'}`}
                >
                  <VemtapText
                    variant="labelSm"
                    tone={gender === option ? 'brand' : 'secondary'}
                  >
                    {option}
                  </VemtapText>
                </Pressable>
              ))}
            </View>
          </View>
        </FormSection>
        <View className="flex-row gap-3 rounded-card bg-surface-tint p-4">
          <Icon name="localMall" size={22} color={colors.primary} />
          <View className="min-w-0 flex-1">
            <VemtapText variant="bodyMd" className="font-sans-semibold">
              {copy.perks}
            </VemtapText>
            <VemtapText variant="caption" tone="secondary">
              {copy.perksBody}
            </VemtapText>
          </View>
        </View>
        <View className="gap-2">
          <Button label={copy.save} onPress={onSave} labelVariant="labelMd" />
          <Button
            label={copy.discard}
            variant="ghost"
            onPress={onDiscard}
            labelVariant="labelMd"
          />
        </View>
      </PageScroll>
    </SafeAreaView>
  );
}

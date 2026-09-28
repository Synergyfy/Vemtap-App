import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cssInterop } from 'nativewind';
import { LocationMapView } from '@components/shared/LocationMapView';
import { RegistrationHeader } from '@components/auth/RegistrationHeader';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';
import { businessLocationCopy as copy } from '@features/business/businessCopy';
import { BusinessSectionHeading } from '@features/business/components/BusinessPrimitives';
import {
  countryFlags,
  primaryBranchRegion,
  roleTitles,
} from '@features/business/businessData';
import {
  FieldInput,
  HorizontallyScrollableRow,
  PhonePrefix,
  PrimaryActionButton,
  SelectableChip,
  SetupCallout,
  SetupSectionCard,
  SetupSectionHeading,
  SwitchToggle,
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

const MAP_HEIGHT = 144;

export interface BranchDraft {
  name: string;
  street: string;
  landmark: string;
  district: string;
  phone: string;
  email: string;
  leadRole: string;
  leadName: string;
  leadEmail: string;
  leadPhone: string;
  grantDashboardAccess: boolean;
  customizeDayHours: boolean;
}

export interface AddBranchLocationScreenProps {
  onBack?: () => void;
  onSave?: (draft: BranchDraft) => void;
  onChangeGps?: () => void;
  onEditHours?: () => void;
  initialValue?: Partial<BranchDraft>;
}

/**
 * Conversion of
 * stitch_vemtap_design_system_1/add_branch_location/code.html
 */
export function AddBranchLocationScreen({
  onBack,
  onSave,
  onChangeGps,
  onEditHours,
  initialValue,
}: AddBranchLocationScreenProps) {
  const [name, setName] = useState(initialValue?.name ?? 'Garki District Flagship');
  const [street, setStreet] = useState(
    initialValue?.street ?? 'Plot 742, Tafawa Balewa Way, Area 11',
  );
  const [landmark, setLandmark] = useState(
    initialValue?.landmark ?? 'Directly opposite Area 11 Post Office, Wing B',
  );
  const [district, setDistrict] = useState(
    initialValue?.district ?? 'Abuja Municipal • Garki District, FCT',
  );
  const [phone, setPhone] = useState(initialValue?.phone ?? '809 111 4455');
  const [email, setEmail] = useState(initialValue?.email ?? 'garki.store@urbangrill.ng');
  const [leadRole, setLeadRole] = useState(initialValue?.leadRole ?? roleTitles[0]);
  const [leadName, setLeadName] = useState(initialValue?.leadName ?? 'Chidinma Okafor');
  const [leadEmail, setLeadEmail] = useState(
    initialValue?.leadEmail ?? 'chidinma@urbangrill.ng',
  );
  const [leadPhone, setLeadPhone] = useState(initialValue?.leadPhone ?? '803 762 9901');
  const [grantAccess, setGrantAccess] = useState(
    initialValue?.grantDashboardAccess ?? true,
  );
  const [customizeHours, setCustomizeHours] = useState(
    initialValue?.customizeDayHours ?? false,
  );

  const handleBack = useCallback(() => onBack?.(), [onBack]);

  const draft = useMemo<BranchDraft>(
    () => ({
      name,
      street,
      landmark,
      district,
      phone,
      email,
      leadRole,
      leadName,
      leadEmail,
      leadPhone,
      grantDashboardAccess: grantAccess,
      customizeDayHours: customizeHours,
    }),
    [
      district,
      email,
      grantAccess,
      customizeHours,
      landmark,
      leadEmail,
      leadName,
      leadPhone,
      leadRole,
      name,
      phone,
      street,
    ],
  );

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <RegistrationHeader
        title={copy.addBranch.header}
        onBack={handleBack}
        compactTitle
        progress={{ activeIndex: 0, total: 3 }}
      />

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-6 px-6 pb-8 pt-4"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="gap-1">
          <View className="flex-row items-center gap-1.5 self-start">
            <Icon name="addLocation" size={20} color={colors.primary} />
            <VemtapText
              variant="labelSm"
              className="font-sans-semibold uppercase tracking-wider text-primary"
            >
              {copy.addBranch.eyebrow}
            </VemtapText>
          </View>
          <VemtapText
            accessibilityRole="header"
            variant="headingMd"
            className="text-heading-md"
          >
            {copy.addBranch.title}
          </VemtapText>
          <VemtapText tone="secondary">{copy.addBranch.subtitle}</VemtapText>
        </View>

        <SetupCallout
          icon="verified"
          title={copy.addBranch.inheritTitle}
          body={copy.addBranch.inheritBody}
          titleClassName="text-primary"
          iconSize={22}
        />

        <SetupSectionCard>
          <SetupSectionHeading title={copy.addBranch.identityTitle} dot />
          <FieldInput
            label={copy.addBranch.nameLabel}
            value={name}
            onChangeText={setName}
            placeholder={copy.addBranch.namePlaceholder}
            accessibilityLabel={copy.addBranch.nameLabel}
            trailingIcon="storefront"
          />
        </SetupSectionCard>

        <SetupSectionCard>
          <SetupSectionHeading
            title={copy.addBranch.locationTitle}
            badge={copy.addBranch.gpsLinked}
            badgeTone="success"
            dot
          />
          <View className="gap-3">
            <FieldInput
              label={copy.addBranch.streetLabel}
              value={street}
              onChangeText={setStreet}
              placeholder={copy.addBranch.streetPlaceholder}
              accessibilityLabel={copy.addBranch.streetLabel}
            />
            <FieldInput
              label={copy.addBranch.landmarkLabel}
              value={landmark}
              onChangeText={setLandmark}
              placeholder={copy.addBranch.landmarkPlaceholder}
              accessibilityLabel={copy.addBranch.landmarkLabel}
            />
            <FieldInput
              label={copy.addBranch.districtLabel}
              value={district}
              onChangeText={setDistrict}
              placeholder={copy.addBranch.districtPlaceholder}
              accessibilityLabel={copy.addBranch.districtLabel}
            />
          </View>
          <View className="overflow-hidden rounded-field bg-surface-container shadow-sm">
            <View style={{ height: MAP_HEIGHT }}>
              <LocationMapView
                region={primaryBranchRegion}
                style={StyleSheet.absoluteFill}
                scrollEnabled={false}
                zoomEnabled={false}
              />
            </View>
            <View className="flex-row items-center justify-between gap-2 bg-surface-canvas p-3">
              <View className="min-w-0 flex-1 flex-row items-center gap-2">
                <Icon name="pin" size={20} color={colors.primary} />
                <View className="min-w-0 flex-1">
                  <VemtapText variant="labelSm" className="text-text" numberOfLines={1}>
                    {copy.addBranch.coordinates}
                  </VemtapText>
                  <VemtapText variant="caption" tone="tertiary">
                    {copy.addBranch.coordinatesHint}
                  </VemtapText>
                </View>
              </View>
              <TextActionButton
                label={copy.addBranch.changeGps}
                icon="editLocation"
                tone="brand"
                onPress={onChangeGps}
                className="min-h-[36px] shrink-0 bg-surface-tint-blue px-3"
              />
            </View>
          </View>
        </SetupSectionCard>

        <SetupSectionCard>
          <SetupSectionHeading title={copy.addBranch.contactTitle} dot />
          <View className="gap-3">
            <View className="gap-1.5">
              <VemtapText variant="labelSm" tone="secondary" className="font-sans-medium">
                {copy.addBranch.phoneLabel}
              </VemtapText>
              <View className="flex-row items-center gap-2">
                <PhonePrefix
                  flag={countryFlags.nigeria}
                  dialCode="+234"
                  accessibilityLabel={copy.addBranch.phoneLabel}
                />
                <View className="min-w-0 flex-1">
                  <FieldInput
                    value={phone}
                    onChangeText={setPhone}
                    placeholder={copy.addBranch.phonePlaceholder}
                    accessibilityLabel={copy.addBranch.phoneLabel}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>
            </View>
            <FieldInput
              label={copy.addBranch.emailLabel}
              value={email}
              onChangeText={setEmail}
              placeholder={copy.addBranch.emailPlaceholder}
              accessibilityLabel={copy.addBranch.emailLabel}
              keyboardType="email-address"
              autoCapitalize="none"
              trailingIcon="alternateEmail"
            />
          </View>
        </SetupSectionCard>

        <SetupSectionCard>
          <View className="gap-1">
            <SetupSectionHeading title={copy.addBranch.leadTitle} dot />
            <VemtapText variant="caption" tone="secondary">
              {copy.addBranch.leadBody}
            </VemtapText>
          </View>
          <View className="gap-1.5">
            <VemtapText variant="labelSm" tone="secondary" className="font-sans-medium">
              {copy.addBranch.leadSuggestedTitle}
            </VemtapText>
            <HorizontallyScrollableRow>
              {roleTitles.map(role => (
                <SelectableChip
                  key={role}
                  label={role}
                  selected={role === leadRole}
                  onPress={() => setLeadRole(role)}
                />
              ))}
            </HorizontallyScrollableRow>
          </View>
          <View className="gap-3">
            <FieldInput
              label={copy.addBranch.leadRoleLabel}
              value={leadRole}
              onChangeText={setLeadRole}
              placeholder={copy.addBranch.leadRolePlaceholder}
              accessibilityLabel={copy.addBranch.leadRoleLabel}
              trailingIcon="badge"
            />
            <FieldInput
              label={copy.addBranch.leadNameLabel}
              value={leadName}
              onChangeText={setLeadName}
              placeholder={copy.addBranch.leadNamePlaceholder}
              accessibilityLabel={copy.addBranch.leadNameLabel}
              trailingIcon="personPin"
            />
            <FieldInput
              label={copy.addBranch.leadEmailLabel}
              value={leadEmail}
              onChangeText={setLeadEmail}
              placeholder={copy.addBranch.leadEmailPlaceholder}
              accessibilityLabel={copy.addBranch.leadEmailLabel}
              keyboardType="email-address"
              autoCapitalize="none"
              trailingIcon="mail"
            />
            <View className="gap-1.5">
              <VemtapText variant="labelSm" tone="secondary" className="font-sans-medium">
                {copy.addBranch.leadPhoneLabel}
              </VemtapText>
              <View className="flex-row items-center gap-2">
                <PhonePrefix
                  flag={countryFlags.nigeria}
                  dialCode="+234"
                  accessibilityLabel={copy.addBranch.leadPhoneLabel}
                />
                <View className="min-w-0 flex-1">
                  <FieldInput
                    value={leadPhone}
                    onChangeText={setLeadPhone}
                    placeholder={copy.addBranch.leadPhonePlaceholder}
                    accessibilityLabel={copy.addBranch.leadPhoneLabel}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>
            </View>
          </View>
          <View className="flex-row items-center justify-between gap-3 rounded-field bg-surface-subtle p-3">
            <View className="min-w-0 flex-1 pr-2">
              <VemtapText variant="labelMd" className="text-text">
                {copy.addBranch.grantAccess}
              </VemtapText>
              <VemtapText variant="caption" tone="secondary">
                {copy.addBranch.grantAccessBody}
              </VemtapText>
            </View>
            <View className="shrink-0">
              <SwitchToggle
                value={grantAccess}
                onValueChange={setGrantAccess}
                accessibilityLabel={copy.addBranch.grantAccess}
              />
            </View>
          </View>
        </SetupSectionCard>

        <SetupSectionCard>
          <BusinessSectionHeading
            title={copy.addBranch.hoursTitle}
            dot
            trailing={<Icon name="schedule" size={20} color={colors.textTertiary} />}
          />
          <View className="flex-row items-center justify-between gap-3 rounded-field bg-surface-subtle p-3">
            <View className="min-w-0 flex-1 flex-row items-center gap-3">
              <View className="h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-tint-blue">
                <Icon name="calendar" size={20} color={colors.primary} />
              </View>
              <View className="min-w-0 flex-1">
                <VemtapText variant="labelMd" className="text-text">
                  {copy.addBranch.hoursLabel}
                </VemtapText>
                <VemtapText variant="caption" tone="secondary">
                  {copy.addBranch.hoursValue}
                </VemtapText>
              </View>
            </View>
            <TextActionButton
              label={copy.addBranch.hoursEdit}
              tone="brand"
              onPress={onEditHours}
              className="min-h-[36px] shrink-0 px-2"
            />
          </View>
          <ToggleRow
            title={copy.addBranch.hoursCustomize}
            value={customizeHours}
            onValueChange={setCustomizeHours}
          />
        </SetupSectionCard>
      </ScrollView>

      <View className="gap-3 px-6 pb-6 pt-0">
        <PrimaryActionButton
          label={copy.addBranch.save}
          onPress={() => onSave?.(draft)}
        />
        <TextActionButton label={copy.addBranch.cancel} onPress={handleBack} />
      </View>
    </SafeAreaView>
  );
}

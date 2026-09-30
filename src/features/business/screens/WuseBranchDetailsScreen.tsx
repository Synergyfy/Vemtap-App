import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { cssInterop } from 'nativewind';
import { AppModal } from '@components/ui/Modal';
import { Button } from '@components/ui/Button';
import { Icon, type IconName } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { LocationMapView } from '@components/shared/LocationMapView';
import { businessOpsMedia } from '@features/business/data/businessOpsImages';
import {
  BusinessProductImage,
  BusinessScreenLayout,
  BusinessStatusPill,
} from '@features/business/components/BusinessPrimitives';
import {
  BusinessKeyValueRow,
  BusinessPanel,
  BusinessStatTile,
  BusinessToastPill,
} from '@features/business/components/BusinessOpsPrimitives';

cssInterop(Pressable, { className: 'style' });
cssInterop(LinearGradient, { className: 'style' });

const copy = strings.wuseBranchDetails;

const mapStyles = StyleSheet.create({ plane: { height: 176, width: '100%' } });

export interface WuseBranchDetailsScreenProps {
  onBack?: () => void;
  onMoreActions?: () => void;
  onEdit?: () => void;
  onCallManager?: () => void;
  onCopyCoordinates?: () => void;
  onDirections?: () => void;
  onOpenStat?: (label: string) => void;
  onSwitchOperatingView?: () => void;
  onConfirmDeactivate?: () => void;
}

/**
 * Branch dossier: identity + manager spotlight, map preview, inventory and
 * velocity stats, trading dossier and the deactivation policy confirm modal.
 */
export function WuseBranchDetailsScreen({
  onBack,
  onMoreActions,
  onEdit,
  onCallManager,
  onCopyCoordinates,
  onDirections,
  onOpenStat,
  onSwitchOperatingView,
  onConfirmDeactivate,
}: WuseBranchDetailsScreenProps) {
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    onCopyCoordinates?.();
  };

  return (
    <BusinessScreenLayout
      header={{
        title: copy.headerTitle,
        onBack,
        actions: [{ icon: 'more', label: copy.headerTitle, onPress: onMoreActions }],
      }}
      contentContainerClassName="pb-8"
    >
      <BusinessPanel className="mt-1">
        <View className="flex-row items-center justify-between gap-2">
          <View className="flex-row flex-wrap items-center gap-2">
            <BusinessStatusPill
              label={copy.activeTerminal}
              tone="success"
              icon="checkCircle"
            />
            <BusinessStatusPill label={copy.primaryBranch} tone="neutral" />
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.edit}
            hitSlop={8}
            onPress={onEdit}
            className="flex-row items-center gap-1.5"
          >
            <Icon name="edit" size={17} color={colors.primary} />
            <VemtapText variant="labelMd" className="text-primary">
              {copy.edit}
            </VemtapText>
          </Pressable>
        </View>
        <VemtapText variant="headingLg" className="text-heading-lg" numberOfLines={2}>
          {copy.name}
        </VemtapText>
        <View className="flex-row items-start gap-1.5">
          <Icon name="locationOn" size={17} color={colors.primary} />
          <VemtapText variant="bodyMd" tone="secondary" className="min-w-0 flex-1">
            {copy.address}
          </VemtapText>
        </View>
        <View className="flex-row items-center gap-3 rounded-field bg-surface-subtle p-3">
          <View className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-surface-container">
            <BusinessProductImage
              source={businessOpsMedia.staffJohn}
              alt={businessOpsMedia.staffJohn.alt}
              className="h-full w-full"
            />
          </View>
          <View className="min-w-0 flex-1">
            <VemtapText variant="labelMd" numberOfLines={1}>
              {copy.manager}
            </VemtapText>
            <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
              {copy.managerRole}
            </VemtapText>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.call}
            onPress={onCallManager}
            className="h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-fixed active:scale-95"
          >
            <Icon name="call" size={17} color={colors.primary} />
          </Pressable>
        </View>
      </BusinessPanel>

      <View className="mt-3 overflow-hidden rounded-card shadow-sm">
        <View className="relative h-44 w-full bg-surface-container-low">
          <LocationMapView
            style={mapStyles.plane}
            region={{
              latitude: 9.0765,
              longitude: 7.4735,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            }}
            scrollEnabled={false}
            zoomEnabled={false}
            pitchEnabled={false}
            rotateEnabled={false}
          >
            <View className="absolute inset-0 items-center justify-center">
              <View className="items-center justify-center rounded-full bg-primary p-2 shadow-lg">
                <Icon name="storefront" size={19} color={colors.surface} />
              </View>
            </View>
          </LocationMapView>
          <LinearGradient
            colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.75)']}
            locations={[0.45, 1]}
            className="absolute inset-0"
          />
          <View className="absolute bottom-3 left-3 right-3 flex-row items-center justify-between gap-2">
            <View className="min-w-0 flex-1 flex-row items-center gap-1.5">
              <Icon name="explore" size={15} color={colors.badgeDiscountBg} />
              <VemtapText
                variant="caption"
                className="min-w-0 flex-1 text-inverse-on-surface"
                numberOfLines={1}
              >
                {copy.coordinates}
              </VemtapText>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={copied ? copy.copied : copy.copyCoordinates}
              hitSlop={8}
              onPress={handleCopy}
              className="min-h-8 shrink-0 flex-row items-center gap-1.5 rounded-md bg-inverse-surface px-2 py-1"
            >
              <Icon name={copied ? 'check' : 'copy'} size={13} color={colors.surface} />
              <VemtapText variant="micro" className="text-surface">
                {copied ? copy.copied : copy.copyCoordinates}
              </VemtapText>
            </Pressable>
          </View>
        </View>
        <View className="flex-row items-center justify-between gap-2 bg-surface-container-low p-3">
          <View className="min-w-0 flex-1 flex-row items-center gap-2">
            <Icon name="locationPrecision" size={17} color={colors.primary} />
            <VemtapText
              variant="labelSm"
              tone="secondary"
              className="min-w-0 flex-1"
              numberOfLines={1}
            >
              {copy.navLink}
            </VemtapText>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.directions}
            hitSlop={8}
            onPress={onDirections}
            className="flex-row items-center gap-1"
          >
            <VemtapText variant="labelMd" className="text-primary" numberOfLines={1}>
              {copy.directions}
            </VemtapText>
            <Icon name="northEast" size={15} color={colors.primary} />
          </Pressable>
        </View>
      </View>

      <View className="mt-4 flex-row items-center justify-between gap-2">
        <VemtapText variant="labelMd" className="font-sans-semibold">
          {copy.inventoryTitle}
        </VemtapText>
        <VemtapText variant="caption" tone="tertiary" numberOfLines={1}>
          {copy.realTimeSync}
        </VemtapText>
      </View>
      <View className="mt-2 flex-row gap-2">
        {copy.stats.map(stat => (
          <BusinessStatTile
            key={stat.label}
            label={stat.label}
            value={stat.value}
            icon={stat.icon as IconName}
            onPress={() => onOpenStat?.(stat.label)}
          />
        ))}
      </View>

      <BusinessPanel className="mt-4" title={copy.dossierTitle}>
        {copy.dossier.map(row => (
          <BusinessKeyValueRow
            key={row.label}
            icon={row.icon as IconName}
            label={row.label}
            value={row.value}
            detail={'detail' in row ? row.detail : undefined}
          />
        ))}
      </BusinessPanel>

      <Button
        className="mt-4"
        label={copy.switchView}
        labelVariant="labelMd"
        onPress={onSwitchOperatingView}
        leftIcon={<Icon name="swapHoriz" size={20} color={colors.surface} />}
      />
      <Button
        className="mt-2"
        label={copy.editDetails}
        labelVariant="labelMd"
        variant="secondary"
        onPress={onEdit}
        leftIcon={<Icon name="tune" size={18} color={colors.text} />}
      />

      <View className="mt-4 gap-2 rounded-card bg-error-container p-4">
        <View className="flex-row items-center gap-2">
          <Icon name="info" size={19} color={colors.error} />
          <VemtapText variant="labelMd" className="font-sans-semibold text-error">
            {copy.deactivationTitle}
          </VemtapText>
        </View>
        <VemtapText variant="caption" tone="secondary" className="leading-relaxed">
          {copy.deactivationBody}
        </VemtapText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.deactivate}
          onPress={() => setDeactivateOpen(true)}
          className="min-h-11 flex-row items-center justify-center gap-1.5 rounded-field bg-surface active:scale-[0.98]"
        >
          <Icon name="block" size={17} color={colors.error} />
          <VemtapText variant="labelMd" className="font-sans-semibold text-error">
            {copy.deactivate}
          </VemtapText>
        </Pressable>
      </View>

      <AppModal
        visible={deactivateOpen}
        onClose={() => setDeactivateOpen(false)}
        title={copy.deactivateTitle}
      >
        <View className="items-center gap-3 py-2">
          <View className="h-12 w-12 items-center justify-center rounded-full bg-error-container">
            <Icon name="block" size={26} color={colors.error} />
          </View>
          <VemtapText variant="bodyMd" tone="secondary" className="text-center">
            {copy.deactivateBody}
          </VemtapText>
        </View>
        <Button
          label={copy.confirmDeactivate}
          labelVariant="labelMd"
          variant="destructive"
          onPress={() => {
            setDeactivateOpen(false);
            onConfirmDeactivate?.();
          }}
        />
        <Button
          className="mt-2"
          label={copy.keepActive}
          labelVariant="labelMd"
          variant="secondary"
          onPress={() => setDeactivateOpen(false)}
        />
      </AppModal>

      {copied ? <BusinessToastPill message={copy.copied} icon="check" /> : null}
    </BusinessScreenLayout>
  );
}

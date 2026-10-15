import React, { useState } from 'react';
import { Clipboard, Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { cssInterop } from 'nativewind';
import { AppModal } from '@components/ui/Modal';
import { Button } from '@components/ui/Button';
import { Icon, type IconName } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { LocationMapView } from '@components/shared/LocationMapView';
import type { Branch } from '@api/branchApi';
import type { OpeningHours } from '@api/businessProfileApi';
import { hoursWindow } from '@features/dealDetail/utils/openingHours';
import {
  BusinessScreenLayout,
  BusinessStatusPill,
} from '@features/business/components/BusinessPrimitives';
import {
  BusinessKeyValueRow,
  BusinessPanel,
  BusinessToastPill,
} from '@features/business/components/BusinessOpsPrimitives';

cssInterop(Pressable, { className: 'style' });
cssInterop(LinearGradient, { className: 'style' });

const copy = strings.wuseBranchDetails;

const mapStyles = StyleSheet.create({ plane: { height: 176, width: '100%' } });

/** One dossier line, built only from fields the API actually returned. */
interface DossierRow {
  key: string;
  icon: IconName;
  label: string;
  value: string;
}

/**
 * `9.0765, 7.4735` — the decimal pair, which is what a maps URL needs.
 * `null` when either coordinate is missing, because a half-set pair would put
 * the pin in the ocean.
 */
function toCoordinates(branch: Branch | undefined): string | null {
  const { latitude, longitude } = branch ?? {};
  if (
    typeof latitude !== 'number' ||
    typeof longitude !== 'number' ||
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude)
  ) {
    return null;
  }
  return `${latitude}, ${longitude}`;
}

/**
 * The branch's `businessHours` column is `jsonb` shaped as `{ open, close,
 * closed }` per weekday, while `hoursWindow` reads the profile API's
 * `{ from, to, isClosed }`. Normalise rather than loosening the shared helper.
 */
function toOpeningHours(raw: Record<string, unknown> | null | undefined) {
  if (!raw) return null;
  const normalised: OpeningHours = {};
  for (const [key, value] of Object.entries(raw)) {
    if (value && typeof value === 'object') {
      const day = value as Record<string, unknown>;
      normalised[key] = {
        from: (day.from ?? day.open ?? null) as string | null,
        to: (day.to ?? day.close ?? null) as string | null,
        isClosed: day.isClosed === true || day.closed === true,
      };
    }
  }
  return Object.keys(normalised).length > 0 ? normalised : null;
}

export interface WuseBranchDetailsScreenProps {
  /** The branch being viewed. Omitted renders an empty-state shell. */
  branch?: Branch;
  isLoading?: boolean;
  error?: boolean;
  onBack?: () => void;
  onEdit?: () => void;
  onCallBranch?: () => void;
  onSwitchOperatingView?: () => void;
  onConfirmDeactivate?: () => void;
  onConfirmReactivate?: () => void;
  onRetry?: () => void;
}

/**
 * Branch dossier: live identity, map preview, trading dossier and the
 * pause/reactivate policy confirm.
 *
 * Everything on this screen reads from the `branch` prop. There is no designed
 * fallback copy, because a details page that quietly shows a different
 * location's name and address is worse than an empty one — the previous version
 * rendered hardcoded "Wuse Branch" fixtures regardless of which branch was
 * tapped. Sections with no data behind them are omitted instead of filled in.
 */
export function WuseBranchDetailsScreen({
  branch,
  isLoading = false,
  error = false,
  onBack,
  onEdit,
  onCallBranch,
  onSwitchOperatingView,
  onConfirmDeactivate,
  onConfirmReactivate,
  onRetry,
}: WuseBranchDetailsScreenProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const isActive = branch?.isActive !== false;
  const coordinates = toCoordinates(branch);
  const hours = hoursWindow(toOpeningHours(branch?.businessHours));

  // Rows are built from what exists, so a branch with no phone number does not
  // render an empty "Direct Contact Hotline" line.
  const dossierRows: DossierRow[] = [];
  if (branch) {
    const location = [branch.state, branch.city].filter(Boolean).join(' • ');
    if (location) {
      dossierRows.push({
        key: 'location',
        icon: 'storeMallDirectory',
        label: copy.dossierLabels.location,
        value: location,
      });
    }
    if (branch.phone) {
      dossierRows.push({
        key: 'contact',
        icon: 'phone',
        label: copy.dossierLabels.contact,
        value: branch.phone,
      });
    }
    dossierRows.push({
      key: 'hours',
      icon: 'schedule',
      label: copy.dossierLabels.hours,
      value: hours ? `${hours.days}: ${hours.window}` : copy.hoursUnavailable,
    });
  }

  const handleCopy = () => {
    if (!coordinates) return;
    Clipboard.setString(coordinates);
    setCopied(true);
  };

  if (error && !branch) {
    return (
      <BusinessScreenLayout
        header={{ title: copy.headerTitle, onBack }}
        contentContainerClassName="pb-8"
      >
        <View className="mt-6 items-center gap-3">
          <Icon name="cloudOff" size={26} color={colors.onSurfaceVariant} />
          <VemtapText variant="bodyMd" tone="secondary" className="text-center">
            {copy.loadFailed}
          </VemtapText>
          {onRetry ? (
            <Button label={copy.retry} labelVariant="labelMd" onPress={onRetry} />
          ) : null}
        </View>
      </BusinessScreenLayout>
    );
  }

  if (!branch) {
    // Still loading, or navigated without an id. Nothing is invented here.
    return (
      <BusinessScreenLayout
        header={{ title: copy.headerTitle, onBack }}
        contentContainerClassName="pb-8"
      >
        {isLoading ? null : (
          <View className="mt-6 items-center gap-3">
            <VemtapText variant="bodyMd" tone="secondary" className="text-center">
              {copy.loadFailed}
            </VemtapText>
            {onRetry ? (
              <Button label={copy.retry} labelVariant="labelMd" onPress={onRetry} />
            ) : null}
          </View>
        )}
      </BusinessScreenLayout>
    );
  }

  return (
    <BusinessScreenLayout
      header={{
        title: copy.headerTitle,
        onBack,
        actions: onEdit ? [{ icon: 'more', label: copy.edit, onPress: onEdit }] : [],
      }}
      contentContainerClassName="pb-8"
    >
      <BusinessPanel className="mt-1">
        <View className="flex-row items-center justify-between gap-2">
          <View className="flex-row flex-wrap items-center gap-2">
            <BusinessStatusPill
              label={isActive ? copy.activeTerminal : copy.pausedPill}
              tone={isActive ? 'success' : 'neutral'}
              icon={isActive ? 'checkCircle' : 'block'}
            />
            {branch.isMainBranch ? (
              <BusinessStatusPill label={copy.primaryBranch} tone="brand" />
            ) : null}
          </View>
          {onEdit ? (
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
          ) : null}
        </View>
        <VemtapText variant="headingLg" className="text-heading-lg" numberOfLines={2}>
          {branch.name}
        </VemtapText>
        {branch.address ? (
          <View className="flex-row items-start gap-1.5">
            <Icon name="locationOn" size={17} color={colors.primary} />
            <VemtapText variant="bodyMd" tone="secondary" className="min-w-0 flex-1">
              {branch.address}
            </VemtapText>
          </View>
        ) : null}
        {branch.phone ? (
          <View className="flex-row items-center justify-between gap-2 rounded-field bg-surface-subtle p-3">
            <View className="min-w-0 flex-1 flex-row items-center gap-2">
              <Icon name="call" size={17} color={colors.primary} />
              <VemtapText variant="labelMd" className="min-w-0 flex-1" numberOfLines={1}>
                {branch.phone}
              </VemtapText>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={copy.call}
              onPress={onCallBranch}
              className="h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-fixed active:scale-95"
            >
              <Icon name="call" size={17} color={colors.primary} />
            </Pressable>
          </View>
        ) : null}
      </BusinessPanel>

      {coordinates ? (
        <View className="mt-3 overflow-hidden rounded-card shadow-sm">
          <View className="relative h-44 w-full bg-surface-container-low">
            <LocationMapView
              style={mapStyles.plane}
              region={{
                latitude: branch.latitude as number,
                longitude: branch.longitude as number,
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
                  {coordinates}
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
        </View>
      ) : (
        <View className="mt-3 flex-row items-start gap-2 rounded-card bg-surface-container-low p-3">
          <Icon name="mapPin" size={17} color={colors.onSurfaceVariant} />
          <View className="min-w-0 flex-1">
            <VemtapText variant="labelSm" tone="secondary">
              {copy.noCoordinates}
            </VemtapText>
            <VemtapText variant="caption" tone="tertiary" className="mt-0.5">
              {copy.noCoordinatesHint}
            </VemtapText>
          </View>
        </View>
      )}

      {dossierRows.length > 0 ? (
        <BusinessPanel className="mt-4" title={copy.dossierTitle}>
          {dossierRows.map(row => (
            <BusinessKeyValueRow
              key={row.key}
              icon={row.icon}
              label={row.label}
              value={row.value}
            />
          ))}
        </BusinessPanel>
      ) : null}

      <Button
        className="mt-4"
        label={copy.switchView}
        labelVariant="labelMd"
        onPress={onSwitchOperatingView}
        leftIcon={<Icon name="swapHoriz" size={20} color={colors.surface} />}
      />
      {onEdit ? (
        <Button
          className="mt-2"
          label={copy.editDetails}
          labelVariant="labelMd"
          variant="secondary"
          onPress={onEdit}
          leftIcon={<Icon name="tune" size={18} color={colors.text} />}
        />
      ) : null}

      {isActive ? (
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
            onPress={() => setConfirmOpen(true)}
            className="min-h-11 flex-row items-center justify-center gap-1.5 rounded-field bg-surface active:scale-[0.98]"
          >
            <Icon name="block" size={17} color={colors.error} />
            <VemtapText variant="labelMd" className="font-sans-semibold text-error">
              {copy.deactivate}
            </VemtapText>
          </Pressable>
        </View>
      ) : (
        <View className="mt-4 gap-2 rounded-card bg-surface-container p-4">
          <View className="flex-row items-center gap-2">
            <Icon name="checkCircle" size={19} color={colors.primary} />
            <VemtapText variant="labelMd" className="font-sans-semibold text-primary">
              {copy.reactivateTitle}
            </VemtapText>
          </View>
          <VemtapText variant="caption" tone="secondary" className="leading-relaxed">
            {copy.reactivateBody}
          </VemtapText>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.reactivate}
            onPress={() => setConfirmOpen(true)}
            className="min-h-11 flex-row items-center justify-center gap-1.5 rounded-field bg-primary active:scale-[0.98]"
          >
            <Icon name="bolt" size={17} color={colors.surface} />
            <VemtapText
              variant="labelMd"
              className="font-sans-semibold text-primary-foreground"
            >
              {copy.reactivate}
            </VemtapText>
          </Pressable>
        </View>
      )}

      <AppModal
        visible={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={isActive ? copy.deactivateTitle : copy.reactivateTitle}
      >
        <View className="items-center gap-3 py-2">
          <View
            className={`h-12 w-12 items-center justify-center rounded-full ${
              isActive ? 'bg-error-container' : 'bg-surface-tint-blue'
            }`}
          >
            <Icon
              name={isActive ? 'block' : 'checkCircle'}
              size={26}
              color={isActive ? colors.error : colors.primary}
            />
          </View>
          <VemtapText variant="bodyMd" tone="secondary" className="text-center">
            {isActive ? copy.deactivateBody : copy.reactivateBody}
          </VemtapText>
        </View>
        <Button
          label={isActive ? copy.confirmDeactivate : copy.confirmReactivate}
          labelVariant="labelMd"
          variant={isActive ? 'destructive' : 'primary'}
          onPress={() => {
            setConfirmOpen(false);
            if (isActive) {
              onConfirmDeactivate?.();
            } else {
              onConfirmReactivate?.();
            }
          }}
        />
        <Button
          className="mt-2"
          label={isActive ? copy.keepActive : copy.keepActive}
          labelVariant="labelMd"
          variant="secondary"
          onPress={() => setConfirmOpen(false)}
        />
      </AppModal>

      {copied ? <BusinessToastPill message={copy.copied} icon="check" /> : null}
    </BusinessScreenLayout>
  );
}

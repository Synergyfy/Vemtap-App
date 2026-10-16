import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Button } from '@components/ui/Button';
import { BottomSheet } from '@components/shared/BottomSheet';
import { ErrorState } from '@components/shared/ErrorState';
import { LoadingState } from '@components/shared/LoadingState';
import { Icon } from '@components/ui/Icon';
import { Input } from '@components/ui/Input';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { BusinessPanel } from '@features/business/components/BusinessOpsPrimitives';
import {
  BusinessInitialsAvatar,
  BusinessSettingRow,
} from '@features/business/components/BusinessPosPrimitives';
import {
  BusinessScreenLayout,
  BusinessStatusPill,
} from '@features/business/components/BusinessPrimitives';
import type { PosSettings, PosSettingsUpdate } from '@api/posApi';
import {
  toNumber,
  usePosSettingsDraft,
} from '@features/business/hooks/usePosSettingsDraft';

const copy = strings.staffPermissionsPasscodes;

export interface StaffPinMemberView {
  userId: string;
  name: string;
  initials: string;
  role: string;
  hasPin: boolean;
  isSupervisor: boolean;
  locked: boolean;
}

export interface OverrideEntryView {
  id: string;
  title: string;
  detail: string;
  when: string;
}

export interface StaffPermissionsPasscodesScreenProps {
  settings?: PosSettings;
  team?: StaffPinMemberView[];
  overrides?: { total: number; recent: OverrideEntryView[] };
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  isSaving?: boolean;
  canEdit?: boolean;
  onBack?: () => void;
  onSave?: (update: PosSettingsUpdate) => void;
  onSetPin?: (userId: string, pin: string, isSupervisor: boolean) => void;
  onRemovePin?: (userId: string) => void;
}

const GUARDS = [
  'voidRequiresPin',
  'refundRequiresPin',
  'reprintRequiresPin',
  'drawerOpenRequiresPin',
  'discountOverrideRequiresPin',
] as const;

/** Which till actions need a supervisor, the cashier discount cap, and the team's PINs. */
export function StaffPermissionsPasscodesScreen({
  settings,
  team,
  isLoading,
  isError,
  onRetry,
  onBack,
  ...formProps
}: StaffPermissionsPasscodesScreenProps) {
  return (
    <BusinessScreenLayout
      header={{ title: copy.headerTitle, onBack, titleVariant: 'labelMd' }}
      contentContainerClassName="pb-8"
    >
      {!settings || !team ? (
        isError ? (
          <ErrorState
            title={copy.error.title}
            description={copy.error.body}
            onRetry={onRetry}
          />
        ) : (
          <LoadingState label={isLoading ? copy.loading : undefined} />
        )
      ) : (
        <PermissionsForm {...formProps} settings={settings} team={team} />
      )}
    </BusinessScreenLayout>
  );
}

function PermissionsForm({
  settings,
  team,
  overrides,
  isSaving,
  canEdit = true,
  onSave,
  onSetPin,
  onRemovePin,
}: Omit<
  StaffPermissionsPasscodesScreenProps,
  'isLoading' | 'isError' | 'onRetry' | 'onBack'
> & {
  settings: PosSettings;
  team: StaffPinMemberView[];
}) {
  const { draft, dirty, permission, setPermission } = usePosSettingsDraft(settings);
  const [editing, setEditing] = useState<StaffPinMemberView | null>(null);
  const [pin, setPin] = useState('');
  const [supervisor, setSupervisor] = useState(false);

  return (
    <>
      <BusinessPanel
        title={copy.guardsTitle}
        icon="adminPanel"
        badge={copy.guardsBadge}
        badgeTone="brand"
      >
        {GUARDS.map(key => (
          <BusinessSettingRow
            key={key}
            title={copy.guards[key].title}
            subtitle={copy.guards[key].body}
            trailing="switch"
            switchValue={Boolean(permission(key))}
            onSwitchChange={next => canEdit && setPermission(key, next)}
          />
        ))}
      </BusinessPanel>

      <BusinessPanel className="mt-3" title={copy.salesTitle} icon="percentBadge">
        <Input
          label={copy.discountPercentLabel}
          keyboardType="decimal-pad"
          value={String(permission('discountMaxPercent'))}
          editable={canEdit}
          onChangeText={text =>
            setPermission('discountMaxPercent', Math.min(100, toNumber(text, 100)))
          }
        />
        <Input
          label={copy.discountAmountLabel}
          keyboardType="numeric"
          value={
            permission('discountMaxAmount') ? String(permission('discountMaxAmount')) : ''
          }
          placeholder={copy.noCap}
          editable={canEdit}
          onChangeText={text => setPermission('discountMaxAmount', toNumber(text))}
        />
        <Input
          label={copy.idleLabel}
          keyboardType="number-pad"
          value={
            permission('idleLockMinutes') ? String(permission('idleLockMinutes')) : ''
          }
          placeholder={copy.idleOff}
          editable={canEdit}
          onChangeText={text =>
            setPermission('idleLockMinutes', Math.round(toNumber(text)))
          }
        />
        <Button
          label={copy.saveCta}
          labelVariant="labelMd"
          disabled={!dirty || !canEdit}
          loading={isSaving}
          onPress={() => onSave?.(draft)}
        />
      </BusinessPanel>

      <BusinessPanel
        className="mt-3"
        title={copy.pinsTitle}
        icon="shieldLock"
        badge={copy.pinsBadge(
          team.filter(member => member.isSupervisor && member.hasPin).length,
        )}
        badgeTone="success"
      >
        <View className="gap-2">
          {team.map(member => (
            <Pressable
              key={member.userId}
              accessibilityRole="button"
              accessibilityLabel={member.name}
              disabled={!canEdit}
              onPress={() => {
                setPin('');
                setSupervisor(member.isSupervisor);
                setEditing(member);
              }}
              className="flex-row items-center gap-2.5 rounded-field bg-surface-subtle p-2.5 active:bg-surface-container"
            >
              <BusinessInitialsAvatar
                initials={member.initials}
                size="sm"
                tone={member.isSupervisor ? 'brand' : 'neutral'}
              />
              <View className="min-w-0 flex-1">
                <VemtapText
                  variant="labelSm"
                  className="font-sans-semibold"
                  numberOfLines={1}
                >
                  {member.name}
                </VemtapText>
                <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
                  {member.role}
                </VemtapText>
              </View>
              {member.locked ? (
                <BusinessStatusPill label={copy.lockedBadge} tone="tertiary" />
              ) : null}
              <BusinessStatusPill
                label={
                  member.hasPin
                    ? member.isSupervisor
                      ? copy.supervisorBadge
                      : copy.pinSetBadge
                    : copy.noPinBadge
                }
                tone={member.hasPin ? 'success' : 'neutral'}
              />
            </Pressable>
          ))}
        </View>
      </BusinessPanel>

      <BusinessPanel
        className="mt-3"
        title={copy.auditTitle}
        icon="history"
        badge={String(overrides?.total ?? 0)}
        badgeTone="neutral"
      >
        {overrides?.recent.length ? (
          <View className="gap-2">
            {overrides.recent.map(entry => (
              <View
                key={entry.id}
                className="gap-0.5 rounded-field bg-surface-subtle p-2.5"
              >
                <View className="flex-row items-center justify-between gap-2">
                  <VemtapText
                    variant="labelSm"
                    className="min-w-0 flex-1 font-sans-semibold"
                    numberOfLines={1}
                  >
                    {entry.title}
                  </VemtapText>
                  <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
                    {entry.when}
                  </VemtapText>
                </View>
                <VemtapText variant="caption" tone="secondary" numberOfLines={2}>
                  {entry.detail}
                </VemtapText>
              </View>
            ))}
          </View>
        ) : (
          <VemtapText variant="caption" tone="secondary">
            {copy.noOverrides}
          </VemtapText>
        )}
      </BusinessPanel>

      <BottomSheet
        visible={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing?.name ?? copy.pinsTitle}
      >
        <View className="gap-3">
          <Input
            label={copy.pinLabel}
            keyboardType="number-pad"
            secureTextEntry
            value={pin}
            onChangeText={text => setPin(text.replace(/\D/g, '').slice(0, 6))}
          />
          <BusinessSettingRow
            title={copy.supervisorToggle}
            trailing="switch"
            switchValue={supervisor}
            onSwitchChange={setSupervisor}
          />
          <Button
            label={copy.setPinCta}
            disabled={!/^\d{4,6}$/.test(pin)}
            onPress={() => {
              if (editing) onSetPin?.(editing.userId, pin, supervisor);
              setEditing(null);
            }}
          />
          {editing?.hasPin ? (
            <Button
              label={copy.removePinCta}
              variant="secondary"
              leftIcon={<Icon name="delete" size={16} color={colors.error} />}
              onPress={() => {
                onRemovePin?.(editing.userId);
                setEditing(null);
              }}
            />
          ) : null}
        </View>
      </BottomSheet>
    </>
  );
}

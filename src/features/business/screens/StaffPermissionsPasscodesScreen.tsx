import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { BusinessPanel } from '@features/business/components/BusinessOpsPrimitives';
import {
  BusinessInitialsAvatar,
  BusinessSettingRow,
} from '@features/business/components/BusinessPosPrimitives';
import {
  BusinessActionDock,
  BusinessScreenLayout,
  BusinessStatusPill,
} from '@features/business/components/BusinessPrimitives';

const copy = strings.staffPermissionsPasscodes;

export interface StaffPermissionsPasscodesScreenProps {
  onBack?: () => void;
  onOpenProfile?: () => void;
  onToggleGuard?: (guardId: string, value: boolean) => void;
  onAddSupervisorPin?: () => void;
  onEditSupervisorPin?: (pinId: string) => void;
  onToggleControl?: (controlId: string, value: boolean) => void;
  onOpenAuditLog?: () => void;
  onSave?: () => void;
}

/**
 * `staff_permissions_passcodes` - till security policy. Reversal controls are
 * shown in the same switch vocabulary as the rest of the app so a cashier reads
 * one rule per row, and the guarded ones carry their risk badge inline.
 */
export function StaffPermissionsPasscodesScreen({
  onBack,
  onOpenProfile,
  onToggleGuard,
  onAddSupervisorPin,
  onEditSupervisorPin,
  onToggleControl,
  onOpenAuditLog,
  onSave,
}: StaffPermissionsPasscodesScreenProps) {
  const [idleGuard, setIdleGuard] = useState(true);
  const [overrideGuard, setOverrideGuard] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [voidControl, setVoidControl] = useState(true);
  const [refundControl, setRefundControl] = useState(true);
  const [reprintControl, setReprintControl] = useState(true);
  const [forcePush, setForcePush] = useState(true);
  const [clearCache, setClearCache] = useState(false);

  const supervisors = [
    { id: 'tunde', initials: 'TB', name: 'Chief Tunde B.', role: 'General Manager' },
    { id: 'sarah', initials: 'SA', name: 'Sarah A.', role: 'Floor Supervisor' },
  ] as const;

  return (
    <BusinessScreenLayout
      header={{
        title: copy.headerTitle,
        onBack,
        titleVariant: 'labelMd',
        titleAccessory: (
          <View className="mt-1 flex-row flex-wrap items-center gap-1.5">
            <BusinessStatusPill
              label={copy.accessBadge}
              tone="neutral"
              icon="verifiedUser"
            />
            <BusinessStatusPill label={copy.modeBadge} tone="brand" />
          </View>
        ),
        actions: [
          {
            icon: 'accountCircle',
            label: copy.profileActionLabel,
            onPress: onOpenProfile,
          },
        ],
      }}
      contentContainerClassName="pb-8"
      footer={
        <BusinessActionDock>
          <Button
            label={copy.saveCta}
            labelVariant="labelMd"
            onPress={onSave}
            leftIcon={<Icon name="save" size={17} color={colors.surface} />}
          />
          <VemtapText
            variant="micro"
            tone="tertiary"
            className="mt-2 text-center"
            numberOfLines={2}
          >
            {copy.saveNote}
          </VemtapText>
        </BusinessActionDock>
      }
    >
      <View className="flex-row items-center gap-2.5 rounded-card bg-surface-tint p-3">
        <View className="h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary">
          <Icon name="shieldLock" size={19} color={colors.surface} />
        </View>
        <View className="min-w-0 flex-1">
          <VemtapText variant="labelMd" className="font-sans-semibold" numberOfLines={1}>
            {copy.vaultTitle}
          </VemtapText>
          <VemtapText variant="micro" tone="secondary" numberOfLines={1}>
            {copy.vaultMeta}
          </VemtapText>
        </View>
        <View className="shrink-0 items-end gap-1">
          <BusinessStatusPill
            label={copy.vaultBadge}
            tone="tertiary"
            className="self-end"
          />
          <VemtapText variant="micro" tone="error" numberOfLines={1}>
            {copy.vaultAccess}
          </VemtapText>
        </View>
      </View>

      <BusinessPanel
        className="mt-3"
        title={copy.tillTitle}
        icon="lock"
        badge={copy.tillBadge}
        badgeTone="success"
      >
        <BusinessSettingRow
          title={copy.idleTitle}
          subtitle={copy.idleBody}
          trailing="switch"
          switchValue={idleGuard}
          accessibilityLabel={copy.idleTitle}
          onSwitchChange={value => {
            setIdleGuard(value);
            onToggleGuard?.('idle', value);
          }}
          className="rounded-field bg-surface-container-low px-3 py-2.5"
        />
        <View className="mt-2">
          <BusinessSettingRow
            title={copy.overrideTitle}
            subtitle={copy.overrideBody}
            trailing="switch"
            switchValue={overrideGuard}
            accessibilityLabel={copy.overrideTitle}
            onSwitchChange={value => {
              setOverrideGuard(value);
              onToggleGuard?.('override', value);
            }}
            className="rounded-field bg-surface-container-low px-3 py-2.5"
          />
        </View>

        <View className="mt-3 flex-row flex-wrap items-center justify-between gap-2">
          <VemtapText
            variant="micro"
            tone="tertiary"
            className="font-sans-semibold uppercase tracking-wider"
            numberOfLines={1}
          >
            {copy.pinsTitle}
          </VemtapText>
          <VemtapText variant="micro" tone="secondary" numberOfLines={1}>
            {copy.pinsBadge}
          </VemtapText>
        </View>

        <View className="mt-1.5 gap-2">
          {supervisors.map(supervisor => (
            <View
              key={supervisor.id}
              className="flex-row items-center gap-2 rounded-field bg-surface-container-low p-2.5"
            >
              <BusinessInitialsAvatar
                initials={supervisor.initials}
                size="sm"
                tone="brand"
              />
              <View className="min-w-0 flex-1">
                <VemtapText
                  variant="labelSm"
                  className="font-sans-semibold"
                  numberOfLines={1}
                >
                  {supervisor.name}
                </VemtapText>
                <VemtapText variant="micro" tone="secondary" numberOfLines={1}>
                  {`${supervisor.role} \u2022 PIN \u2022\u2022\u2022\u2022`}
                </VemtapText>
              </View>
              <Icon name="verified" size={16} color={colors.success} />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Edit ${supervisor.name}`}
                onPress={() => onEditSupervisorPin?.(supervisor.id)}
                hitSlop={8}
                className="h-8 w-8 shrink-0 items-center justify-center rounded-lg active:bg-surface-container"
              >
                <Icon name="edit" size={16} color={colors.textSecondary} />
              </Pressable>
            </View>
          ))}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.addPinCta}
          onPress={onAddSupervisorPin}
          className="mt-2 min-h-11 flex-row items-center justify-center gap-1.5 rounded-field bg-surface-container active:scale-[0.99]"
        >
          <Icon name="plusCircle" size={16} color={colors.primary} />
          <VemtapText
            variant="labelSm"
            className="font-sans-semibold text-primary"
            numberOfLines={1}
          >
            {copy.addPinCta}
          </VemtapText>
        </Pressable>
      </BusinessPanel>

      <BusinessPanel className="mt-3" title={copy.salesTitle} icon="pointOfSale">
        <View className="rounded-field bg-surface-container-low p-2.5">
          <View className="flex-row items-start justify-between gap-2">
            <View className="min-w-0 flex-1">
              <VemtapText
                variant="labelSm"
                className="font-sans-semibold"
                numberOfLines={2}
              >
                {copy.discountTitle}
              </VemtapText>
              <VemtapText variant="micro" tone="secondary" numberOfLines={2}>
                {copy.discountBody}
              </VemtapText>
            </View>
            <BusinessStatusPill
              label={copy.discountValue}
              tone="neutral"
              className="shrink-0"
            />
          </View>
          <View className="mt-2 flex-row flex-wrap items-center justify-between gap-2 border-t border-surface-container-highest pt-2">
            <View className="min-w-0 flex-1 flex-row items-center gap-1.5">
              <Icon name="info" size={14} color={colors.tertiary} />
              <VemtapText
                variant="micro"
                tone="secondary"
                className="min-w-0 flex-1"
                numberOfLines={2}
              >
                {copy.discountRule}
              </VemtapText>
            </View>
            <VemtapText variant="micro" tone="brand" numberOfLines={1}>
              {copy.discountValue.replace('Limit', 'Configured')}
            </VemtapText>
          </View>
        </View>

        <View className="mt-2">
          <BusinessSettingRow
            title={copy.drawerTitle}
            subtitle={copy.drawerBody}
            badge={copy.drawerBadge}
            trailing="switch"
            switchValue={drawerOpen}
            accessibilityLabel={copy.drawerTitle}
            onSwitchChange={value => {
              setDrawerOpen(value);
              onToggleControl?.('drawer', value);
            }}
            className="rounded-field bg-surface-container-low px-3 py-2.5"
          />
        </View>

        <View className="mt-2 rounded-field bg-surface-container-low p-2.5">
          <View className="flex-row items-start justify-between gap-2">
            <View className="min-w-0 flex-1">
              <VemtapText
                variant="labelSm"
                className="font-sans-semibold"
                numberOfLines={2}
              >
                {copy.customTitle}
              </VemtapText>
              <VemtapText variant="micro" tone="secondary" numberOfLines={2}>
                {copy.customBody}
              </VemtapText>
            </View>
            <BusinessStatusPill
              label={copy.customValue}
              tone="neutral"
              className="shrink-0"
            />
          </View>
          <View className="mt-2 flex-row flex-wrap items-center justify-between gap-2 border-t border-surface-container-highest pt-2">
            <VemtapText
              variant="micro"
              tone="secondary"
              className="min-w-0 flex-1"
              numberOfLines={2}
            >
              {copy.customRule}
            </VemtapText>
            <VemtapText variant="micro" tone="success" numberOfLines={1}>
              {copy.customState}
            </VemtapText>
          </View>
        </View>
      </BusinessPanel>

      <BusinessPanel
        className="mt-3"
        title={copy.reversalTitle}
        icon="alert"
        badge={copy.reversalBadge}
        badgeTone="tertiary"
      >
        <BusinessSettingRow
          title={copy.voidTitle}
          subtitle={copy.voidBody}
          trailing="switch"
          switchValue={voidControl}
          accessibilityLabel={copy.voidTitle}
          onSwitchChange={value => {
            setVoidControl(value);
            onToggleControl?.('void', value);
          }}
          className="rounded-field bg-surface-container-low px-3 py-2.5"
        />
        <View className="mt-2">
          <BusinessSettingRow
            title={copy.refundTitle}
            subtitle={copy.refundBody}
            trailing="switch"
            switchValue={refundControl}
            accessibilityLabel={copy.refundTitle}
            onSwitchChange={value => {
              setRefundControl(value);
              onToggleControl?.('refund', value);
            }}
            className="rounded-field bg-surface-container-low px-3 py-2.5"
          />
        </View>
        <View className="mt-2">
          <BusinessSettingRow
            title={copy.reprintTitle}
            subtitle={copy.reprintBody}
            trailing="switch"
            switchValue={reprintControl}
            accessibilityLabel={copy.reprintTitle}
            onSwitchChange={value => {
              setReprintControl(value);
              onToggleControl?.('reprint', value);
            }}
            className="rounded-field bg-surface-container-low px-3 py-2.5"
          />
        </View>
      </BusinessPanel>

      <BusinessPanel className="mt-3" title={copy.shiftTitle} icon="wallet">
        <View className="rounded-field bg-surface-container-low p-2.5">
          <View className="flex-row items-start justify-between gap-2">
            <View className="min-w-0 flex-1">
              <VemtapText
                variant="labelSm"
                className="font-sans-semibold"
                numberOfLines={2}
              >
                {copy.blindTitle}
              </VemtapText>
              <VemtapText variant="micro" tone="secondary" numberOfLines={2}>
                {copy.blindBody}
              </VemtapText>
            </View>
            <BusinessStatusPill
              label={copy.blindValue}
              tone="success"
              className="shrink-0"
            />
          </View>
          <View className="mt-2 flex-row items-center gap-1.5 border-t border-surface-container-highest pt-2">
            <Icon name="visibilityOff" size={14} color={colors.tertiary} />
            <VemtapText
              variant="micro"
              tone="secondary"
              className="min-w-0 flex-1"
              numberOfLines={2}
            >
              {copy.blindRule}
            </VemtapText>
          </View>
        </View>

        <View className="mt-2 rounded-field bg-surface-container-low p-2.5">
          <View className="flex-row items-start justify-between gap-2">
            <View className="min-w-0 flex-1">
              <VemtapText
                variant="labelSm"
                className="font-sans-semibold"
                numberOfLines={2}
              >
                {copy.closeTitle}
              </VemtapText>
              <VemtapText variant="micro" tone="secondary" numberOfLines={2}>
                {copy.closeBody}
              </VemtapText>
            </View>
            <VemtapText
              variant="micro"
              tone="tertiary"
              className="shrink-0 font-sans-semibold"
              numberOfLines={2}
            >
              {copy.closeValue}
            </VemtapText>
          </View>
        </View>
      </BusinessPanel>

      <BusinessPanel className="mt-3" title={copy.offlineTitle} icon="cloudQueue">
        <BusinessSettingRow
          title={copy.forcePushTitle}
          subtitle={copy.forcePushBody}
          trailing="switch"
          switchValue={forcePush}
          accessibilityLabel={copy.forcePushTitle}
          onSwitchChange={value => {
            setForcePush(value);
            onToggleControl?.('force-push', value);
          }}
          className="rounded-field bg-surface-container-low px-3 py-2.5"
        />
        <View className="mt-2">
          <BusinessSettingRow
            title={copy.clearCacheTitle}
            subtitle={copy.clearCacheBody}
            trailing="switch"
            switchValue={clearCache}
            accessibilityLabel={copy.clearCacheTitle}
            onSwitchChange={value => {
              setClearCache(value);
              onToggleControl?.('clear-cache', value);
            }}
            className="rounded-field bg-surface-container-low px-3 py-2.5"
          />
        </View>
      </BusinessPanel>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={copy.auditCta}
        onPress={onOpenAuditLog}
        className="mt-3 flex-row items-center gap-2.5 rounded-card bg-surface-tint p-3 active:scale-[0.99]"
      >
        <View className="h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface">
          <Icon name="history" size={17} color={colors.primary} />
        </View>
        <View className="min-w-0 flex-1">
          <VemtapText variant="labelSm" className="font-sans-semibold" numberOfLines={1}>
            {copy.auditTitle}
          </VemtapText>
          <VemtapText variant="micro" tone="secondary" numberOfLines={1}>
            {copy.auditBody}
          </VemtapText>
        </View>
        <View className="shrink-0 flex-row items-center gap-1.5">
          <VemtapText
            variant="labelSm"
            className="font-sans-semibold text-primary"
            numberOfLines={1}
          >
            {copy.auditCta}
          </VemtapText>
          <Icon name="forward" size={15} color={colors.primary} />
        </View>
      </Pressable>
    </BusinessScreenLayout>
  );
}

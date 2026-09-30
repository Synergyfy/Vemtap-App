import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import {
  BusinessInfoStrip,
  BusinessPanel,
} from '@features/business/components/BusinessOpsPrimitives';
import { BusinessSettingRow } from '@features/business/components/BusinessPosPrimitives';
import {
  BusinessActionDock,
  BusinessScreenLayout,
  BusinessStatusPill,
} from '@features/business/components/BusinessPrimitives';

const copy = strings.taxesSurcharges;

/** A numeric rule field: a read-only figure with its unit, per the design. */
function TaxRuleField({
  accessibilityLabel,
  label,
  value,
  unit,
}: {
  accessibilityLabel: string;
  label: string;
  value: string;
  unit: string;
}) {
  return (
    <View className="flex-row items-center justify-between gap-3">
      <View className="min-w-0 flex-1">
        <VemtapText variant="labelSm" className="font-sans-semibold" numberOfLines={1}>
          {label}
        </VemtapText>
        <VemtapText variant="micro" tone="secondary" numberOfLines={2}>
          {accessibilityLabel}
        </VemtapText>
      </View>
      <View
        accessibilityRole="text"
        accessibilityLabel={`${label} ${value}${unit}`}
        className="min-w-[86px] shrink-0 flex-row items-center justify-center gap-0.5 rounded-field bg-surface-container py-2"
      >
        <VemtapText variant="headingSm" className="font-sans-bold" numberOfLines={1}>
          {value}
        </VemtapText>
        <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
          {unit}
        </VemtapText>
      </View>
    </View>
  );
}

export interface TaxesSurchargesScreenProps {
  onBack?: () => void;
  onOpenProfile?: () => void;
  onSelectPriceApplication?: (modeId: string) => void;
  onToggleExemption?: (value: boolean) => void;
  onCopyTin?: () => void;
  onToggleServiceWaiver?: (value: boolean) => void;
  onTogglePackagingAuto?: (value: boolean) => void;
  onToggleSelfOrdering?: (value: boolean) => void;
  onToggleRushPause?: (value: boolean) => void;
  onApply?: () => void;
}

/**
 * `taxes_surcharges` - statutory VAT, dine-in/packaging surcharges and the
 * public-POS QR rules. Statutory values are shown as read-only fields with their
 * unit because they come from the national schedule, not from the cashier.
 */
export function TaxesSurchargesScreen({
  onBack,
  onOpenProfile,
  onSelectPriceApplication,
  onToggleExemption,
  onCopyTin,
  onToggleServiceWaiver,
  onTogglePackagingAuto,
  onToggleSelfOrdering,
  onToggleRushPause,
  onApply,
}: TaxesSurchargesScreenProps) {
  const [priceMode, setPriceMode] = useState<'inclusive' | 'exclusive'>('exclusive');
  const [exempt, setExempt] = useState(true);
  const [serviceWaiver, setServiceWaiver] = useState(true);
  const [packagingAuto, setPackagingAuto] = useState(true);
  const [selfOrdering, setSelfOrdering] = useState(true);
  const [rushPause, setRushPause] = useState(false);

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
            label={copy.applyCta}
            labelVariant="labelMd"
            onPress={onApply}
            leftIcon={<Icon name="save" size={17} color={colors.surface} />}
          />
          <View className="mt-2 flex-row items-center justify-center gap-1.5">
            <Icon name="clockLock" size={13} color={colors.textTertiary} />
            <VemtapText
              variant="micro"
              tone="tertiary"
              className="text-center"
              numberOfLines={1}
            >
              {copy.applyNote}
            </VemtapText>
          </View>
        </BusinessActionDock>
      }
    >
      <View className="flex-row items-start justify-between gap-2">
        <View className="min-w-0 flex-1">
          <VemtapText
            variant="headingLg"
            className="font-sans-semibold"
            numberOfLines={1}
          >
            {copy.title}
          </VemtapText>
          <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
            {copy.subtitle}
          </VemtapText>
          <View className="mt-1 flex-row items-center gap-1.5">
            <Icon name="lock" size={13} color={colors.textSecondary} />
            <VemtapText variant="micro" tone="secondary" numberOfLines={1}>
              {copy.sessionLabel}
            </VemtapText>
          </View>
        </View>
        <BusinessStatusPill
          label={copy.pinBadge}
          tone="success"
          icon="verifiedUser"
          className="shrink-0"
        />
      </View>

      <BusinessPanel
        className="mt-3"
        title={copy.statutoryTitle}
        icon="percent"
        badge={copy.statutoryBadge}
        badgeTone="brand"
      >
        <TaxRuleField
          accessibilityLabel={copy.vatBody}
          label={copy.vatTitle}
          value={copy.vatValue}
          unit="%"
        />

        <VemtapText
          variant="micro"
          tone="tertiary"
          className="font-sans-semibold uppercase tracking-wider"
          numberOfLines={1}
        >
          {copy.applicationTitle}
        </VemtapText>
        {[
          { id: 'inclusive', title: copy.inclusiveTitle, body: copy.inclusiveBody },
          { id: 'exclusive', title: copy.exclusiveTitle, body: copy.exclusiveBody },
        ].map(mode => {
          const selected = priceMode === mode.id;
          return (
            <Pressable
              key={mode.id}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={mode.title}
              onPress={() => {
                setPriceMode(mode.id as 'inclusive' | 'exclusive');
                onSelectPriceApplication?.(mode.id);
              }}
              className={`flex-row items-center gap-2.5 rounded-field p-2.5 ${
                selected ? 'bg-surface-tint' : 'bg-surface-container-low'
              }`}
            >
              <View
                className={`h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                  selected ? 'border-primary' : 'border-surface-container-highest'
                }`}
              >
                {selected ? (
                  <View className="h-2.5 w-2.5 rounded-full bg-primary" />
                ) : null}
              </View>
              <View className="min-w-0 flex-1">
                <VemtapText
                  variant="caption"
                  className={
                    selected ? 'font-sans-semibold text-primary' : 'font-sans-semibold'
                  }
                  numberOfLines={2}
                >
                  {mode.title}
                </VemtapText>
                <VemtapText variant="micro" tone="secondary" numberOfLines={2}>
                  {mode.body}
                </VemtapText>
              </View>
              {selected ? <Icon name="check" size={16} color={colors.primary} /> : null}
            </Pressable>
          );
        })}

        <View className="mt-1">
          <BusinessSettingRow
            title={copy.exemptionTitle}
            subtitle={copy.exemptionBody}
            trailing="switch"
            switchValue={exempt}
            accessibilityLabel={copy.exemptionTitle}
            onSwitchChange={value => {
              setExempt(value);
              onToggleExemption?.(value);
            }}
            className="rounded-field bg-surface-container-low px-3 py-2.5"
          />
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.tinValue}
          onPress={onCopyTin}
          className="mt-1 flex-row items-center gap-2 rounded-field bg-surface-container px-3 py-2.5 active:scale-[0.99]"
        >
          <View className="mt-0.5 shrink-0">
            <Icon name="badge" size={16} color={colors.textSecondary} />
          </View>
          <View className="min-w-0 flex-1">
            <VemtapText variant="micro" tone="secondary" numberOfLines={1}>
              {copy.tinLabel}
            </VemtapText>
            <VemtapText
              variant="labelSm"
              className="font-sans-semibold"
              numberOfLines={1}
            >
              {copy.tinValue}
            </VemtapText>
          </View>
          <Icon name="checkCircle" size={17} color={colors.success} />
        </Pressable>
      </BusinessPanel>

      <BusinessPanel className="mt-3" title={copy.serviceTitle} icon="receiptLong">
        <TaxRuleField
          accessibilityLabel={copy.serviceChargeBody}
          label={copy.serviceChargeTitle}
          value={copy.serviceChargeValue}
          unit="%"
        />
        <BusinessSettingRow
          title={copy.serviceWaiverTitle}
          trailing="switch"
          switchValue={serviceWaiver}
          accessibilityLabel={copy.serviceWaiverTitle}
          onSwitchChange={value => {
            setServiceWaiver(value);
            onToggleServiceWaiver?.(value);
          }}
          className="mt-1 rounded-field bg-surface-container-low px-3 py-2.5"
        />

        <View className="mt-2 h-px bg-surface-container-low" />

        <TaxRuleField
          accessibilityLabel={copy.packagingBody}
          label={copy.packagingTitle}
          value={copy.packagingValue}
          unit={'\u20a6'}
        />
        <BusinessSettingRow
          title={copy.packagingAutoTitle}
          trailing="switch"
          switchValue={packagingAuto}
          accessibilityLabel={copy.packagingAutoTitle}
          onSwitchChange={value => {
            setPackagingAuto(value);
            onTogglePackagingAuto?.(value);
          }}
          className="mt-1 rounded-field bg-surface-container-low px-3 py-2.5"
        />
      </BusinessPanel>

      <BusinessPanel className="mt-3" title={copy.qrTitle} icon="qrCode">
        <BusinessSettingRow
          title={copy.selfOrderTitle}
          subtitle={copy.selfOrderBody}
          trailing="switch"
          switchValue={selfOrdering}
          accessibilityLabel={copy.selfOrderTitle}
          onSwitchChange={value => {
            setSelfOrdering(value);
            onToggleSelfOrdering?.(value);
          }}
          className="rounded-field bg-surface-container-low px-3 py-2.5"
        />

        <View className="mt-2 flex-row items-start gap-2.5 rounded-field bg-surface-tint px-3 py-2.5">
          <View className="mt-0.5 shrink-0">
            <Icon name="roomService" size={17} color={colors.primary} />
          </View>
          <View className="min-w-0 flex-1">
            <VemtapText
              variant="labelSm"
              className="font-sans-semibold"
              numberOfLines={1}
            >
              {copy.qrScopeTitle}
            </VemtapText>
            <VemtapText
              variant="caption"
              tone="secondary"
              className="mt-0.5"
              numberOfLines={3}
            >
              {copy.qrScopeBody}
            </VemtapText>
          </View>
        </View>

        <View className="mt-2">
          <TaxRuleField
            accessibilityLabel={copy.maxOrderBody}
            label={copy.maxOrderTitle}
            value={copy.maxOrderValue}
            unit={'\u20a6'}
          />
        </View>

        <BusinessSettingRow
          title={copy.rushTitle}
          subtitle={copy.rushBody}
          trailing="switch"
          switchValue={rushPause}
          accessibilityLabel={copy.rushTitle}
          onSwitchChange={value => {
            setRushPause(value);
            onToggleRushPause?.(value);
          }}
          className="mt-1 rounded-field bg-surface-container-low px-3 py-2.5"
        />
      </BusinessPanel>

      <BusinessInfoStrip
        className="mt-3"
        icon="policy"
        title={copy.auditTitle.replace(':', '')}
        body={copy.auditBody}
        tone="subtle"
      />
    </BusinessScreenLayout>
  );
}

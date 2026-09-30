import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { BusinessPanel } from '@features/business/components/BusinessOpsPrimitives';
import { BusinessSettingRow } from '@features/business/components/BusinessPosPrimitives';
import {
  BusinessActionDock,
  BusinessScreenLayout,
  BusinessStatusPill,
} from '@features/business/components/BusinessPrimitives';
import {
  posPeripheralGroups,
  posTenderRails,
  posTerminalChannels,
  type PosTenderRail,
} from '@features/business/data/businessPosSettingsData';

const copy = strings.paymentHardwareSetup;

export interface PaymentHardwareSetupScreenProps {
  onBack?: () => void;
  onOpenProfile?: () => void;
  onToggleRail?: (railId: string, switchId: string, value: boolean) => void;
  onSelectRailAction?: (railId: string, actionId: string) => void;
  onTestFeed?: (peripheralId: string) => void;
  onTestDrawer?: () => void;
  onPairPrinter?: () => void;
  onToggleFallbackScanner?: (value: boolean) => void;
  onSave?: () => void;
}

/**
 * `payment_hardware_setup` - tender rails and counter peripherals. Every toggle
 * is local until the single save action applies the whole hardware profile, so
 * the screen never claims a change the device has not accepted.
 */
export function PaymentHardwareSetupScreen({
  onBack,
  onOpenProfile,
  onToggleRail,
  onSelectRailAction,
  onTestFeed,
  onTestDrawer,
  onPairPrinter,
  onToggleFallbackScanner,
  onSave,
}: PaymentHardwareSetupScreenProps) {
  // Rail switch state is owned here so a press has visible effect before save.
  const [railSwitches, setRailSwitches] = useState<Record<string, boolean>>(() => {
    const seed: Record<string, boolean> = {};
    posTenderRails.forEach(rail => {
      rail.switches.forEach(item => {
        seed[`${rail.id}:${item.id}`] = item.on;
      });
    });
    return seed;
  });

  const toggleRail = (rail: PosTenderRail, switchId: string, value: boolean) => {
    setRailSwitches(current => ({ ...current, [`${rail.id}:${switchId}`]: value }));
    onToggleRail?.(rail.id, switchId, value);
  };

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
            numberOfLines={1}
          >
            {copy.footerNote}
          </VemtapText>
        </BusinessActionDock>
      }
    >
      <BusinessPanel>
        <View className="flex-row items-start gap-2.5">
          <View className="h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-tint">
            <Icon name="pointOfSale" size={19} color={colors.primary} />
          </View>
          <View className="min-w-0 flex-1">
            <VemtapText
              variant="labelMd"
              className="font-sans-semibold"
              numberOfLines={1}
            >
              {copy.headerCardTitle}
            </VemtapText>
            <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
              {copy.headerCardBody}
            </VemtapText>
          </View>
          <BusinessStatusPill
            label={copy.readyBadge}
            tone="success"
            className="shrink-0"
          />
        </View>
        <View className="mt-2.5 flex-row flex-wrap items-center justify-between gap-2">
          {posTerminalChannels.map(channel => (
            <View
              key={channel.id}
              className="min-w-[30%] flex-1 flex-row items-center gap-1.5"
            >
              <Icon name={channel.icon} size={14} color={colors.success} />
              <VemtapText variant="micro" tone="secondary" numberOfLines={1}>
                {channel.label}
              </VemtapText>
            </View>
          ))}
        </View>
      </BusinessPanel>

      <View className="mt-3 overflow-hidden rounded-card bg-surface shadow-sm">
        <View className="bg-primary px-3 py-2.5">
          <View className="flex-row items-center gap-1.5">
            <Icon name="wifi" size={15} color={colors.surface} />
            <VemtapText
              variant="micro"
              className="font-sans-bold uppercase tracking-wider text-surface"
              numberOfLines={1}
            >
              {copy.liveLabel}
            </VemtapText>
          </View>
          <VemtapText
            variant="labelMd"
            className="font-sans-semibold text-surface"
            numberOfLines={1}
          >
            {copy.liveTitle}
          </VemtapText>
          <VemtapText variant="micro" className="text-surface" numberOfLines={1}>
            {copy.liveBody}
          </VemtapText>
        </View>
        <View className="flex-row flex-wrap items-center justify-between gap-2 px-3 py-2.5">
          <VemtapText variant="labelSm" className="font-sans-semibold" numberOfLines={1}>
            {copy.methodsTitle}
          </VemtapText>
          <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
            {copy.methodsBadge}
          </VemtapText>
        </View>
      </View>

      {posTenderRails.map(rail => (
        <View key={rail.id} className="mt-2.5 rounded-card bg-surface p-3 shadow-sm">
          <View className="flex-row items-start gap-2.5">
            <View
              className={`h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                rail.accent === 'success'
                  ? 'bg-success-container'
                  : rail.accent === 'brand'
                    ? 'bg-surface-tint'
                    : 'bg-surface-container'
              }`}
            >
              <Icon
                name={rail.icon}
                size={17}
                color={
                  rail.accent === 'success'
                    ? colors.success
                    : rail.accent === 'brand'
                      ? colors.primary
                      : colors.textSecondary
                }
              />
            </View>
            <View className="min-w-0 flex-1">
              <View className="flex-row flex-wrap items-center gap-1.5">
                <VemtapText
                  variant="labelSm"
                  className="font-sans-semibold"
                  numberOfLines={2}
                >
                  {rail.title}
                </VemtapText>
                {rail.badge ? (
                  <BusinessStatusPill label={rail.badge} tone="brand" />
                ) : null}
              </View>
              <VemtapText variant="micro" tone="secondary" numberOfLines={2}>
                {rail.body}
              </VemtapText>
            </View>
            {rail.statusDot ? (
              <View className="h-2.5 w-2.5 shrink-0 rounded-full bg-success" />
            ) : null}
          </View>

          {rail.detail ? (
            <View className="mt-2.5 rounded-field bg-surface-tint px-2.5 py-2">
              <View className="flex-row items-center gap-2">
                <Icon name="hub" size={15} color={colors.textSecondary} />
                <View className="min-w-0 flex-1">
                  <VemtapText
                    variant="caption"
                    className="font-sans-semibold"
                    numberOfLines={1}
                  >
                    {rail.detail.label}
                  </VemtapText>
                  <VemtapText
                    variant="micro"
                    tone={rail.detail.valueTone === 'brand' ? 'brand' : 'secondary'}
                    numberOfLines={1}
                  >
                    {rail.detail.value}
                  </VemtapText>
                </View>
                {rail.id === 'bank' ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={rail.detail.value}
                    onPress={() => onSelectRailAction?.(rail.id, 'copy-account')}
                    hitSlop={8}
                  >
                    <Icon name="copy" size={15} color={colors.textSecondary} />
                  </Pressable>
                ) : null}
              </View>
              {rail.detail.actions ? (
                <View className="mt-2 flex-row flex-wrap gap-2">
                  {rail.detail.actions.map(action => (
                    <Pressable
                      key={action.id}
                      accessibilityRole="button"
                      accessibilityLabel={action.label}
                      onPress={() => onSelectRailAction?.(rail.id, action.id)}
                      className={`min-h-9 flex-1 items-center justify-center rounded-field px-2.5 active:scale-95 ${
                        action.primary ? 'bg-primary' : 'bg-surface-container'
                      }`}
                    >
                      <VemtapText
                        variant="caption"
                        className={
                          action.primary
                            ? 'font-sans-semibold text-surface'
                            : 'font-sans-semibold'
                        }
                        numberOfLines={1}
                      >
                        {action.label}
                      </VemtapText>
                    </Pressable>
                  ))}
                </View>
              ) : null}
            </View>
          ) : null}

          {rail.feature ? (
            <View className="mt-2.5 flex-row flex-wrap items-center justify-between gap-2 rounded-field bg-surface-tint px-2.5 py-2">
              <View className="min-w-0 flex-1 flex-row items-center gap-1.5">
                <Icon name="verified" size={15} color={colors.success} />
                <VemtapText
                  variant="caption"
                  className="min-w-0 flex-1"
                  numberOfLines={2}
                >
                  {rail.feature.title}
                </VemtapText>
              </View>
              <VemtapText
                variant="caption"
                tone="brand"
                className="shrink-0 font-sans-semibold"
                numberOfLines={1}
              >
                {rail.feature.value}
              </VemtapText>
            </View>
          ) : null}

          {rail.switches.map(item => (
            <View key={item.id} className="mt-2">
              <BusinessSettingRow
                title={item.title}
                subtitle={item.body}
                trailing="switch"
                switchValue={railSwitches[`${rail.id}:${item.id}`] ?? item.on}
                accessibilityLabel={item.title}
                onSwitchChange={value => toggleRail(rail, item.id, value)}
                className="rounded-field bg-surface-container-low px-3 py-2.5"
              />
            </View>
          ))}

          {rail.warning ? (
            <View className="mt-2 flex-row items-start gap-2 rounded-field bg-warning-container px-2.5 py-2">
              <View className="mt-0.5 shrink-0">
                <Icon name="shield" size={15} color={colors.tertiary} />
              </View>
              <VemtapText variant="micro" className="min-w-0 flex-1" numberOfLines={3}>
                {rail.warning}
              </VemtapText>
            </View>
          ) : null}
        </View>
      ))}

      <BusinessPanel
        className="mt-3"
        title={copy.hardwareTitle}
        icon="devices"
        badge={copy.hardwareBadge}
        badgeTone="success"
      >
        {posPeripheralGroups.map(group => (
          <View key={group.id} className="gap-2">
            <View className="flex-row flex-wrap items-center justify-between gap-2">
              <VemtapText
                variant="micro"
                tone="tertiary"
                className="font-sans-semibold uppercase tracking-wider"
                numberOfLines={1}
              >
                {group.title}
              </VemtapText>
              <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
                {group.meta}
              </VemtapText>
            </View>
            {group.items.map(item => (
              <View
                key={item.id}
                className="rounded-field bg-surface-container-low p-2.5"
              >
                <View className="flex-row items-start gap-2.5">
                  <View className="h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface">
                    <Icon name={item.icon} size={17} color={colors.textSecondary} />
                  </View>
                  <View className="min-w-0 flex-1">
                    <VemtapText
                      variant="labelSm"
                      className="font-sans-semibold"
                      numberOfLines={1}
                    >
                      {item.title}
                    </VemtapText>
                    <VemtapText variant="micro" tone="secondary" numberOfLines={1}>
                      {item.meta}
                    </VemtapText>
                    {item.body ? (
                      <VemtapText variant="micro" tone="tertiary" numberOfLines={2}>
                        {item.body}
                      </VemtapText>
                    ) : null}
                  </View>
                  {item.badge ? (
                    <BusinessStatusPill
                      label={item.badge}
                      tone={item.badgeTone}
                      className="shrink-0"
                    />
                  ) : null}
                </View>

                <View className="mt-2 flex-row flex-wrap items-center justify-between gap-2">
                  {item.signal ? (
                    <View className="min-w-0 flex-1 flex-row items-center gap-1.5">
                      <Icon name="signal" size={14} color={colors.success} />
                      <VemtapText variant="micro" tone="success" numberOfLines={1}>
                        {item.signal}
                      </VemtapText>
                    </View>
                  ) : (
                    <View className="flex-1" />
                  )}
                  {!item.switchId && item.cta ? (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={item.cta}
                      onPress={() => {
                        if (item.id === 'cash-drawer') onTestDrawer?.();
                        else if (item.id === 'kitchen-printer') onPairPrinter?.();
                        else onTestFeed?.(item.id);
                      }}
                      className={`min-h-9 shrink-0 flex-row items-center gap-1.5 rounded-field px-3 active:scale-95 ${
                        item.id === 'kitchen-printer' ? 'bg-surface-tint' : 'bg-surface'
                      }`}
                    >
                      {item.id === 'kitchen-printer' ? (
                        <Icon name="plusCircle" size={14} color={colors.primary} />
                      ) : null}
                      <VemtapText
                        variant="caption"
                        className={
                          item.id === 'kitchen-printer'
                            ? 'font-sans-semibold text-primary'
                            : 'font-sans-semibold'
                        }
                        numberOfLines={1}
                      >
                        {item.cta}
                      </VemtapText>
                    </Pressable>
                  ) : null}
                </View>
              </View>
            ))}
          </View>
        ))}

        <View className="mt-2 rounded-field bg-surface-container-low p-2.5">
          <BusinessSettingRow
            title={copy.fallbackTitle}
            subtitle={copy.fallbackBody}
            trailing="switch"
            switchValue
            accessibilityLabel={copy.fallbackTitle}
            onSwitchChange={value => onToggleFallbackScanner?.(value)}
            className="p-0"
          />
        </View>
      </BusinessPanel>
    </BusinessScreenLayout>
  );
}

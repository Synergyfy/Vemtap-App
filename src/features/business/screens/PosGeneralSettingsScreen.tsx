import React from 'react';
import { Pressable, View } from 'react-native';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { BusinessPanel } from '@features/business/components/BusinessOpsPrimitives';
import {
  BusinessScreenLayout,
  BusinessStatusPill,
  type BusinessPillTone,
} from '@features/business/components/BusinessPrimitives';
import {
  posSettingsGroups,
  posSettingsLinks,
  posSettingsTelemetry,
} from '@features/business/data/businessPosSettingsData';

const copy = strings.posGeneralSettings;

export interface PosGeneralSettingsScreenProps {
  onBack?: () => void;
  onOpenProfile?: () => void;
  onSyncNow?: () => void;
  onOpenSetting?: (settingId: string) => void;
  onTestFeed?: () => void;
  onOpenTill?: () => void;
}

/**
 * `pos_general_settings` - the owner-facing register hub. Every row here is a
 * hand-off into the screen that owns that concern; the only hardware actions
 * this screen performs itself are the two immediate till controls.
 */
export function PosGeneralSettingsScreen({
  onBack,
  onOpenProfile,
  onSyncNow,
  onOpenSetting,
  onTestFeed,
  onOpenTill,
}: PosGeneralSettingsScreenProps) {
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
    >
      <BusinessPanel>
        <View className="flex-row items-start gap-2.5">
          <View className="h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-tint">
            <Icon name="store" size={19} color={colors.primary} />
          </View>
          <View className="min-w-0 flex-1">
            <VemtapText
              variant="labelMd"
              className="font-sans-semibold"
              numberOfLines={1}
            >
              {copy.venueLabel}
            </VemtapText>
            <VemtapText variant="caption" tone="secondary" numberOfLines={2}>
              {copy.tillLabel}
            </VemtapText>
            <VemtapText variant="micro" tone="tertiary" numberOfLines={2}>
              {copy.venueMeta}
            </VemtapText>
          </View>
          <BusinessStatusPill
            label={copy.liveBadge}
            tone="success"
            className="shrink-0"
          />
        </View>
        <View className="mt-2.5 flex-row items-center gap-2 rounded-field bg-surface-tint px-2.5 py-2">
          <View className="h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface">
            <Icon name="verifiedUser" size={16} color={colors.primary} />
          </View>
          <VemtapText
            variant="caption"
            className="min-w-0 flex-1 font-sans-semibold"
            numberOfLines={1}
          >
            {copy.modeTitle}
          </VemtapText>
          <BusinessStatusPill
            label={copy.modePin}
            tone="neutral"
            icon="lock"
            className="shrink-0"
          />
        </View>
      </BusinessPanel>

      <BusinessPanel
        className="mt-3"
        title={copy.telemetryTitle}
        icon="sensors"
        trailing={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.syncNowCta}
            onPress={onSyncNow}
            className="min-h-9 flex-row items-center gap-1 rounded-lg px-2 active:bg-surface-tint"
          >
            <Icon name="sync" size={14} color={colors.primary} />
            <VemtapText
              variant="labelSm"
              className="font-sans-semibold text-primary"
              numberOfLines={1}
            >
              {copy.syncNowCta}
            </VemtapText>
          </Pressable>
        }
      >
        <View className="flex-row gap-2">
          {posSettingsTelemetry.map(node => (
            <View key={node.id} className="min-w-0 flex-1 items-center gap-1">
              <View className="flex-row items-center gap-1">
                <View className="h-2 w-2 rounded-full bg-success" />
                <Icon name={node.icon} size={14} color={colors.textSecondary} />
              </View>
              <VemtapText
                variant="micro"
                tone="secondary"
                className="text-center"
                numberOfLines={1}
              >
                {node.title}
              </VemtapText>
              <VemtapText
                variant="micro"
                tone="tertiary"
                className="text-center"
                numberOfLines={1}
              >
                {node.meta}
              </VemtapText>
            </View>
          ))}
        </View>
      </BusinessPanel>

      {posSettingsGroups.map(group => (
        <BusinessPanel
          key={group.id}
          className="mt-3"
          title={group.title}
          icon={
            group.id === 'security'
              ? 'shield'
              : group.id === 'payments'
                ? 'wallet'
                : 'store'
          }
          badge={group.badge}
          badgeTone="neutral"
        >
          <View className="overflow-hidden rounded-field bg-surface-subtle">
            {group.linkIds.map((linkId, index) => {
              const link = posSettingsLinks.find(item => item.id === linkId);
              if (!link) return null;
              return (
                <View key={link.id}>
                  {index > 0 ? <View className="h-px bg-surface-container-low" /> : null}
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={link.title}
                    onPress={() => onOpenSetting?.(link.id)}
                    className="flex-row items-center gap-2.5 px-3 py-2.5 active:bg-surface-container"
                  >
                    <View className="h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface">
                      <Icon
                        name={link.icon}
                        size={17}
                        color={
                          link.iconTone === 'brand' ? colors.primary : colors.tertiary
                        }
                      />
                    </View>
                    <View className="min-w-0 flex-1">
                      <VemtapText
                        variant="labelSm"
                        className="font-sans-semibold"
                        numberOfLines={2}
                      >
                        {link.title}
                      </VemtapText>
                      <VemtapText variant="micro" tone="secondary" numberOfLines={2}>
                        {link.body}
                      </VemtapText>
                      <View className="mt-1 flex-row flex-wrap items-center gap-1.5">
                        {link.chips.map(chip => (
                          <BusinessStatusPill
                            key={chip.label}
                            label={chip.label}
                            tone={chip.tone as BusinessPillTone}
                          />
                        ))}
                      </View>
                    </View>
                    <View className="shrink-0">
                      <Icon name="forward" size={17} color={colors.textTertiary} />
                    </View>
                  </Pressable>
                </View>
              );
            })}
          </View>
        </BusinessPanel>
      ))}

      <BusinessPanel
        className="mt-3"
        title={copy.controlsTitle}
        icon="bolt"
        badge={copy.controlsBadge}
        badgeTone="warning"
      >
        <View className="gap-2">
          <View className="flex-row items-center gap-2.5 rounded-field bg-surface-subtle px-3 py-2.5">
            <View className="h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface">
              <Icon name="receiptLong" size={17} color={colors.primary} />
            </View>
            <View className="min-w-0 flex-1">
              <VemtapText
                variant="labelSm"
                className="font-sans-semibold"
                numberOfLines={1}
              >
                {copy.feedTestTitle}
              </VemtapText>
              <VemtapText variant="micro" tone="secondary" numberOfLines={2}>
                {copy.feedTestBody}
              </VemtapText>
            </View>
            <View className="min-w-[35%]">
              <Button
                label={copy.feedTestCta}
                labelVariant="labelSm"
                variant="secondary"
                onPress={onTestFeed}
              />
            </View>
          </View>
          <View className="flex-row items-center gap-2.5 rounded-field bg-surface-subtle px-3 py-2.5">
            <View className="h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface">
              <Icon name="pointOfSale" size={17} color={colors.primary} />
            </View>
            <View className="min-w-0 flex-1">
              <VemtapText
                variant="labelSm"
                className="font-sans-semibold"
                numberOfLines={1}
              >
                {copy.drawerPopTitle}
              </VemtapText>
              <VemtapText variant="micro" tone="secondary" numberOfLines={2}>
                {copy.drawerPopBody}
              </VemtapText>
            </View>
            <View className="min-w-[35%]">
              <Button
                label={copy.drawerPopCta}
                labelVariant="labelSm"
                variant="secondary"
                onPress={onOpenTill}
              />
            </View>
          </View>
        </View>
      </BusinessPanel>

      <View className="mt-4 items-center gap-1">
        <View className="flex-row items-center gap-1.5">
          <View className="h-2 w-2 rounded-full bg-success" />
          <VemtapText variant="caption" className="font-sans-semibold" numberOfLines={1}>
            {copy.engineLabel}
          </VemtapText>
        </View>
        <VemtapText
          variant="micro"
          tone="tertiary"
          className="text-center"
          numberOfLines={2}
        >
          {copy.engineMeta}
        </VemtapText>
        <VemtapText
          variant="micro"
          tone="tertiary"
          className="text-center"
          numberOfLines={2}
        >
          {copy.licenseLabel}
        </VemtapText>
      </View>
    </BusinessScreenLayout>
  );
}

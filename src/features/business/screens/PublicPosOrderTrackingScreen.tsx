import React from 'react';
import { Pressable, View } from 'react-native';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { BusinessPanel } from '@features/business/components/BusinessOpsPrimitives';
import {
  BusinessActionDock,
  BusinessScreenLayout,
  BusinessStatusPill,
} from '@features/business/components/BusinessPrimitives';
import {
  publicPosOrderLines,
  publicPosPrepSteps,
  type PosPrepState,
} from '@features/business/data/businessPublicPosData';

const copy = strings.publicPosOrderTracking;

const stepWell: Record<PosPrepState, string> = {
  done: 'bg-success-container',
  active: 'bg-primary',
  pending: 'bg-surface-container',
};

export interface PublicPosOrderTrackingScreenProps {
  onBack?: () => void;
  onOpenProfile?: () => void;
  onOpenOrderSummary?: () => void;
  onCallWaiter?: () => void;
  onReopenMenu?: () => void;
}

/**
 * `public_pos_live_order_tracking` - the guest's live prep timeline. It is a
 * read-only status surface: the only actions are asking for help and adding
 * more food, both of which the design owns.
 */
export function PublicPosOrderTrackingScreen({
  onBack,
  onOpenProfile,
  onOpenOrderSummary,
  onCallWaiter,
  onReopenMenu,
}: PublicPosOrderTrackingScreenProps) {
  return (
    <BusinessScreenLayout
      header={{
        title: copy.headerTitle,
        onBack,
        titleVariant: 'labelMd',
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
          <View className="flex-row items-center justify-center gap-1.5">
            <Icon name="info" size={14} color={colors.textTertiary} />
            <VemtapText
              variant="caption"
              tone="tertiary"
              className="text-center"
              numberOfLines={2}
            >
              {copy.footNote}
            </VemtapText>
          </View>
        </BusinessActionDock>
      }
    >
      <View className="items-center gap-2 rounded-card bg-success-container px-4 py-5">
        <View className="h-16 w-16 items-center justify-center rounded-full bg-surface">
          <Icon name="restaurant" size={30} color={colors.success} />
        </View>
        <VemtapText
          variant="headingLg"
          className="text-center font-sans-semibold"
          numberOfLines={2}
        >
          {copy.headline}
        </VemtapText>
        <VemtapText
          variant="bodyMd"
          tone="secondary"
          className="text-center"
          numberOfLines={2}
        >
          {copy.body}
        </VemtapText>
        <View className="mt-1 flex-row items-center gap-1.5 rounded-full bg-surface px-3 py-1.5">
          <Icon name="schedule" size={15} color={colors.success} />
          <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
            {copy.prepLabel}
          </VemtapText>
          <VemtapText
            variant="labelSm"
            tone="success"
            className="font-sans-bold"
            numberOfLines={1}
          >
            {copy.prepValue}
          </VemtapText>
        </View>
      </View>

      <BusinessPanel
        className="mt-3"
        title={copy.timelineTitle}
        icon="sync"
        badge={copy.timelineBadge}
        badgeTone="brand"
      >
        <View className="flex-row flex-wrap items-center justify-between gap-2">
          <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
            {copy.timelineMeta}
          </VemtapText>
        </View>
        <View className="mt-1">
          {publicPosPrepSteps.map((step, index) => (
            <View key={step.id} className="flex-row gap-3">
              <View className="items-center">
                <View
                  className={`h-9 w-9 items-center justify-center rounded-full ${stepWell[step.state]}`}
                >
                  <Icon
                    name={step.state === 'done' ? 'check' : step.icon}
                    size={16}
                    color={
                      step.state === 'done'
                        ? colors.success
                        : step.state === 'active'
                          ? colors.surface
                          : colors.textSecondary
                    }
                  />
                </View>
                {index < publicPosPrepSteps.length - 1 ? (
                  <View className="h-10 w-0.5 flex-1 bg-surface-container-highest" />
                ) : null}
              </View>
              <View className="min-w-0 flex-1 pb-4">
                <View className="flex-row items-center justify-between gap-2">
                  <VemtapText
                    variant="labelMd"
                    className={`min-w-0 flex-1 ${step.state === 'active' ? 'font-sans-bold text-primary' : step.state === 'done' ? 'font-sans-semibold' : ''}`}
                    numberOfLines={1}
                  >
                    {step.title}
                  </VemtapText>
                  {step.time ? (
                    <VemtapText
                      variant="caption"
                      tone="secondary"
                      className="shrink-0"
                      numberOfLines={1}
                    >
                      {step.time}
                    </VemtapText>
                  ) : null}
                </View>
                <VemtapText variant="caption" tone="secondary" numberOfLines={2}>
                  {step.body}
                </VemtapText>
              </View>
            </View>
          ))}
        </View>
      </BusinessPanel>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={copy.summaryTitle}
        onPress={onOpenOrderSummary}
        className="mt-3 rounded-card bg-surface p-3 shadow-sm active:scale-[0.99]"
      >
        <View className="flex-row items-center justify-between gap-2">
          <View className="min-w-0 flex-1">
            <VemtapText
              variant="labelMd"
              className="font-sans-semibold"
              numberOfLines={1}
            >
              {copy.summaryTitle}
            </VemtapText>
            <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
              {copy.summaryMeta}
            </VemtapText>
          </View>
          <BusinessStatusPill
            label={copy.serverBadge}
            tone="neutral"
            className="shrink-0"
          />
        </View>

        <View className="mt-2.5 gap-2">
          {publicPosOrderLines.map(line => (
            <View
              key={line.id}
              className="flex-row items-start gap-2 rounded-field bg-surface-container-low p-2.5"
            >
              <View className="h-10 w-10 shrink-0 items-center justify-center rounded-field bg-surface-container">
                <Icon name="food" size={17} color={colors.textSecondary} />
              </View>
              <View className="min-w-0 flex-1">
                <View className="flex-row items-center gap-2">
                  <VemtapText
                    variant="caption"
                    className="font-sans-semibold"
                    numberOfLines={1}
                  >
                    {`${line.qty} ${line.name}`}
                  </VemtapText>
                  <VemtapText
                    variant="caption"
                    className="shrink-0 font-sans-bold"
                    numberOfLines={1}
                  >
                    {line.price}
                  </VemtapText>
                </View>
                <VemtapText variant="micro" tone="secondary" numberOfLines={1}>
                  {line.modifier}
                </VemtapText>
              </View>
            </View>
          ))}
        </View>

        <View className="mt-2.5 flex-row items-center justify-between gap-2 rounded-field bg-surface-tint px-2.5 py-2">
          <View className="min-w-0 flex-1">
            <VemtapText
              variant="labelSm"
              className="font-sans-semibold"
              numberOfLines={1}
            >
              {copy.totalLabel}
            </VemtapText>
            <VemtapText variant="micro" tone="secondary" numberOfLines={2}>
              {copy.totalNote}
            </VemtapText>
          </View>
          <VemtapText
            variant="headingSm"
            className="shrink-0 font-sans-bold"
            numberOfLines={1}
          >
            {'\u20a627,950'}
          </VemtapText>
        </View>
      </Pressable>

      <View className="mt-3 gap-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.callWaiterCta}
          onPress={onCallWaiter}
          className="min-h-12 flex-row items-center justify-center gap-2 rounded-field bg-surface-tint active:scale-[0.99]"
        >
          <Icon name="notificationsActive" size={18} color={colors.primary} />
          <VemtapText
            variant="labelMd"
            className="font-sans-semibold text-primary"
            numberOfLines={1}
          >
            {copy.callWaiterCta}
          </VemtapText>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.addItemsCta}
          onPress={onReopenMenu}
          className="min-h-12 flex-row items-center justify-center gap-2 rounded-field bg-surface-tint active:scale-[0.99]"
        >
          <Icon name="plusCircle" size={18} color={colors.primary} />
          <VemtapText
            variant="labelMd"
            className="font-sans-semibold text-primary"
            numberOfLines={1}
          >
            {copy.addItemsCta}
          </VemtapText>
        </Pressable>
      </View>
    </BusinessScreenLayout>
  );
}

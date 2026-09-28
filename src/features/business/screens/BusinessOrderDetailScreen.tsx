import React, { useState } from 'react';
import { Image, Pressable, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { Icon, type IconName } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { TwoColumnGrid } from '@components/shared/TwoColumnGrid';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import {
  BusinessActionTile,
  BusinessInlineAction,
  BusinessScreenLayout,
  BusinessSectionHeading,
  SetupCard,
} from '@features/business/components/BusinessPrimitives';
import { InfoHint } from '@features/business/components/BusinessSetupPrimitives';
import { cn } from '@utils/cn';

cssInterop(Pressable, { className: 'style' });
cssInterop(Image, { className: 'style' });

const copy = strings.businessOrderDetail;

const itemImages: Record<string, string> = {
  ribeye:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAdEdxdPUi3zdxvqRBnywcwOBfjvzxOgZx8MjTUIkBghPm6KYVd4olOdgnqqr5yF2VVsQxk2sbvIa9Tx4MRdC0vFtAUtAEtcWyTURedMqvJGja981oTRata25f3_CZu57QUkhnkWDP7waN4tgaDwDnqwTv-ZQZSGZmUFh0Mhl6dJmiAA1v9BEranHVeh2XawBFiXEJAVzIIotojuvbod9VrkV2gsioARmWx--_LkbL557YEXuMZJwQJyg',
  fries:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAcGi_IZcSTyg9UzFWd_zG-FYfidkdpXeXJrbnK5zeIWwCC6I0D3DON0r3Pxb_1O-myGFKNp6ah9qllEy_iy2u48Kf2YxMQNpicNth3xKRrR5NW20S0wS3fLVU3ME05_OSfi79l3oWrxFh2OyYW5UP6qIgiRATx6mYBFt4P0wisVvoNJrfSG9GzYC93383OnhqUC8VPAgOcYjA2JQ8GIhGukJxccDuDJUEnCoyP_blcD38TZfBenPw2Zg',
  lemonade:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBhj3lZVf1FYiEtzrUTaeW3_22hRkZ4opss8ICs2jvFOsbNA1v3ntezZG7IXweOfsrnBHi6lgyoGT2-a6fmGz-cu1MQnqAaUfPtllHD8p5zCq3krYwH2O3DjsUUfCIGFXHs4T-y-F8UUxRQvQtdrPN124ZSd_X2mdmKdilnQb9oloradFoIkQLNtqpb9EvMkr5hL60DDvI8PZP8NwyHjJnmXFVFJn07-sdRED1FLjrYpNxXAEfmNG0lxA',
};

const customerAvatar =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDitUORjWP7gx6kzReC-WC4_yC5Ja28lpv1WIlPM2_rR6m6Zbq4IrgjDPoVGDWJxJ6_woLHsEbok1JQhIU8i8SR9IRvnY9BkE0i3RQXPD2dmpYrD6JJp0_mPLTap9499v3GWSz4OiR-sYYmEJh19jciYH5woENo6_jSey0LJBYjnroSlIE10ko7lu52qs-MeJlzZ1svFROLNUDpBCV4FHTPXxXbmHK0pQ_J_AGQDdPg_5KqENLycIXiZA';

const timelineIcons: Record<string, IconName> = {
  done: 'check',
  active: 'hourglass',
  pending: 'flag',
};

export interface OrderDetailScreenProps {
  onBack: () => void;
  onAcceptOrder?: () => void;
  onDeclineOrder?: () => void;
  onMarkProcessing?: () => void;
  onMarkReady?: () => void;
  onConfirmPayment?: () => void;
  onAdjustRefund?: () => void;
  onCallCustomer?: () => void;
  onOpenChat?: () => void;
  onOpenBranchSwitcher?: () => void;
}

export function OrderDetailScreen({
  onBack,
  onAcceptOrder,
  onDeclineOrder,
  onMarkProcessing,
  onMarkReady,
  onConfirmPayment,
  onAdjustRefund,
  onCallCustomer,
  onOpenChat,
  onOpenBranchSwitcher,
}: OrderDetailScreenProps) {
  const [accepted, setAccepted] = useState(false);

  return (
    <BusinessScreenLayout
      header={{
        title: copy.reference,
        titleVariant: 'labelMd',
        onBack,
        showAvatar: true,
        accessory: (
          <BusinessInlineAction
            label={copy.branch}
            icon="storefront"
            onPress={onOpenBranchSwitcher}
          />
        ),
      }}
      contentContainerClassName="pb-8"
    >
      <View className="rounded-card-lg bg-tertiary-fixed p-4 shadow-sm">
        <View className="flex-row items-center justify-between gap-2">
          <View className="flex-row items-center gap-2">
            <View className="h-3 w-3 rounded-full bg-tertiary-container" />
            <VemtapText
              variant="labelSm"
              className="font-sans-semibold uppercase text-tertiary-container"
            >
              {copy.statusLabel}
            </VemtapText>
          </View>
          <View className="flex-row items-center gap-1 rounded-full bg-surface-container px-2 py-0.5">
            <Icon name="hourglass" size={13} color={colors.textSecondary} />
            <VemtapText variant="micro" tone="secondary">
              {copy.statusTime}
            </VemtapText>
          </View>
        </View>
        <VemtapText variant="labelMd" className="mt-2 font-sans-semibold">
          {copy.statusTitle}
        </VemtapText>
        <View className="mt-1 flex-row flex-wrap items-center gap-1.5">
          <Icon name="timer" size={16} color={colors.primary} />
          <VemtapText variant="bodyMd" tone="secondary" className="min-w-0 flex-1">
            {copy.statusEstimate}
          </VemtapText>
          <VemtapText variant="bodyMd" className="font-sans-semibold">
            {copy.statusEstimateValue}
          </VemtapText>
        </View>
      </View>

      <TwoColumnGrid
        className="mt-4"
        items={[
          {
            id: 'decline',
            label: copy.triageDecline,
            icon: 'close' as IconName,
            tone: 'error' as const,
            action: () => onDeclineOrder?.(),
          },
          {
            id: 'accept',
            label: copy.triageAccept,
            icon: 'restaurant' as IconName,
            tone: 'brand' as const,
            action: () => {
              setAccepted(true);
              onAcceptOrder?.();
            },
          },
        ]}
        keyExtractor={item => item.id}
        renderItem={item => (
          <BusinessActionTile
            label={item.label}
            icon={item.icon}
            size="lg"
            tone={item.tone === 'error' ? 'errorContainer' : 'primary'}
            onPress={item.action}
          />
        )}
      />

      {accepted ? (
        <View className="mt-3 flex-row items-center justify-center gap-1.5 rounded-lg bg-badge-discount-bg px-3 py-2">
          <Icon name="checkCircle" size={18} color={colors.badgeDiscountText} />
          <VemtapText variant="labelMd" className="text-badge-discount-text">
            {copy.kitchenNotice}
          </VemtapText>
        </View>
      ) : null}

      <SetupCard className="mt-4 gap-3">
        <BusinessSectionHeading
          title={copy.customerSectionTitle}
          titleVariant="labelMd"
          icon="person"
        />
        <View className="flex-row items-center gap-3">
          <Image
            source={{ uri: customerAvatar }}
            accessibilityLabel={`${copy.customerName} portrait`}
            className="h-12 w-12 rounded-full bg-surface-container"
            resizeMode="cover"
          />
          <View className="min-w-0 flex-1">
            <View className="flex-row items-center gap-1">
              <VemtapText
                variant="labelMd"
                className="font-sans-semibold"
                numberOfLines={1}
              >
                {copy.customerName}
              </VemtapText>
              <Icon name="verified" size={16} color={colors.primary} />
            </View>
            <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
              {copy.customerPhone}
            </VemtapText>
          </View>
        </View>
        <VemtapText variant="caption" tone="tertiary">
          {copy.customerMeta}
        </VemtapText>
        <TwoColumnGrid
          items={[
            {
              id: 'call',
              label: copy.callCustomer,
              icon: 'phone' as IconName,
              onPress: onCallCustomer,
            },
            {
              id: 'chat',
              label: copy.vemtapChat,
              icon: 'message' as IconName,
              onPress: onOpenChat,
            },
          ]}
          keyExtractor={item => item.id}
          renderItem={item => (
            <BusinessActionTile
              label={item.label}
              icon={item.icon}
              size="sm"
              tone={item.id === 'call' ? 'neutral' : 'brand'}
              onPress={item.onPress}
            />
          )}
        />
        <View className="flex-row items-start gap-2 rounded-lg bg-surface-container-low p-3">
          <View className="pt-0.5">
            <Icon name="directionsCar" size={16} color={colors.primary} />
          </View>
          <View className="min-w-0 flex-1">
            <VemtapText variant="labelSm" className="font-sans-semibold">
              {copy.arrivalNote}
            </VemtapText>
            <VemtapText variant="caption" tone="secondary">
              {copy.arrivalBody}
            </VemtapText>
          </View>
        </View>
      </SetupCard>

      <SetupCard className="mt-4 gap-3">
        <View className="flex-row items-center justify-between gap-2">
          <BusinessSectionHeading
            title={copy.itemsTitle}
            titleVariant="labelMd"
            icon="restaurant"
            trailing={
              <View className="rounded-full bg-surface-container px-2 py-0.5">
                <VemtapText
                  variant="micro"
                  className="font-sans-medium text-text-secondary"
                >
                  {copy.itemsCount}
                </VemtapText>
              </View>
            }
          />
        </View>
        <View className="self-start rounded-full bg-surface-container px-2 py-0.5">
          <VemtapText variant="caption" className="font-sans-medium text-text-secondary">
            {copy.itemsStatus}
          </VemtapText>
        </View>

        {copy.items.map(item => (
          <View key={item.id} className="flex-row items-start gap-3 py-2">
            <Image
              source={{ uri: itemImages[item.id] }}
              accessibilityLabel={item.imageAlt}
              className="h-14 w-14 shrink-0 rounded-lg bg-surface-container"
              resizeMode="cover"
            />
            <View className="min-w-0 flex-1">
              <View className="flex-row items-start justify-between gap-2">
                <VemtapText
                  variant="labelMd"
                  className="min-w-0 flex-1 font-sans-semibold"
                  numberOfLines={2}
                >
                  {item.name}
                </VemtapText>
                <VemtapText variant="labelMd" className="shrink-0 font-sans-semibold">
                  {item.price}
                </VemtapText>
              </View>
              <VemtapText
                variant="caption"
                tone="secondary"
                className="mt-0.5"
                numberOfLines={1}
              >
                {item.note}
              </VemtapText>
              <View className="mt-1 flex-row flex-wrap items-center gap-1.5">
                <View className="rounded bg-surface-container px-1.5 py-0.5">
                  <VemtapText
                    variant="micro"
                    className="font-sans-medium text-text-secondary"
                  >
                    {item.quantity}
                  </VemtapText>
                </View>
                {item.each ? (
                  <VemtapText variant="micro" tone="tertiary">
                    {item.each}
                  </VemtapText>
                ) : null}
              </View>
            </View>
          </View>
        ))}

        <View className="mt-1 gap-1.5 rounded-xl bg-surface-container-low p-3">
          <View className="flex-row items-center justify-between gap-2">
            <VemtapText variant="labelSm" tone="secondary" className="min-w-0 flex-1">
              {copy.subtotal}
            </VemtapText>
            <VemtapText variant="labelMd" tone="secondary" className="shrink-0">
              {copy.subtotalValue}
            </VemtapText>
          </View>
          <View className="flex-row items-center justify-between gap-2">
            <View className="min-w-0 flex-1 flex-row items-center gap-1">
              <Icon name="localOffer" size={15} color={colors.badgeDiscountText} />
              <VemtapText
                variant="labelSm"
                className="min-w-0 text-badge-discount-text"
                numberOfLines={1}
              >
                {copy.memberPerk}
              </VemtapText>
            </View>
            <VemtapText variant="labelMd" className="shrink-0 text-badge-discount-text">
              {copy.memberPerkValue}
            </VemtapText>
          </View>
          <View className="flex-row items-center justify-between gap-2">
            <View className="min-w-0 flex-1 flex-row items-center gap-1">
              <Icon name="loyalty" size={15} color={colors.badgeDiscountText} />
              <VemtapText
                variant="labelSm"
                className="min-w-0 text-badge-discount-text"
                numberOfLines={1}
              >
                {copy.pointsRedeemed}
              </VemtapText>
            </View>
            <VemtapText variant="labelMd" className="shrink-0 text-badge-discount-text">
              {copy.pointsRedeemedValue}
            </VemtapText>
          </View>
          <View className="mt-2 flex-row items-center justify-between gap-2 border-t border-border pt-2">
            <VemtapText variant="labelSm" className="min-w-0 flex-1 font-sans-bold">
              {copy.totalLabel}
            </VemtapText>
            <VemtapText
              variant="labelMd"
              className="shrink-0 font-sans-bold text-primary"
            >
              {copy.totalValue}
            </VemtapText>
          </View>
        </View>

        <View className="rounded-lg border border-border bg-surface p-3">
          <View className="flex-row items-center justify-between gap-2">
            <VemtapText
              variant="labelSm"
              tone="secondary"
              className="min-w-0 flex-1 font-sans-semibold uppercase"
              numberOfLines={1}
            >
              {copy.settlementLabel}
            </VemtapText>
            <VemtapText variant="labelSm" className="shrink-0 font-sans-semibold">
              {copy.settlementMethod}
            </VemtapText>
          </View>
          <InfoHint text={copy.settlementNote} icon="info" className="mt-2" />
        </View>
      </SetupCard>

      <SetupCard className="mt-4 gap-3">
        <View className="flex-row items-center justify-between gap-2">
          <BusinessSectionHeading
            title={copy.timelineTitle}
            titleVariant="labelMd"
            icon="history"
          />
          <VemtapText variant="caption" className="font-sans-semibold text-primary">
            {copy.timelineLive}
          </VemtapText>
        </View>
        {copy.timeline.map((step, index) => (
          <View key={step.id} className="flex-row items-start gap-3">
            <View className="flex-col items-center">
              <View
                className={cn(
                  'h-7 w-7 items-center justify-center rounded-full',
                  step.state === 'done'
                    ? 'bg-badge-discount-bg'
                    : step.state === 'active'
                      ? 'bg-primary'
                      : 'bg-surface-container-high',
                )}
              >
                <Icon
                  name={timelineIcons[step.state]}
                  size={15}
                  color={
                    step.state === 'done'
                      ? colors.badgeDiscountText
                      : step.state === 'active'
                        ? colors.surface
                        : colors.textTertiary
                  }
                />
              </View>
              {index < copy.timeline.length - 1 ? (
                <View className="my-0.5 w-0.5 flex-1 bg-border" />
              ) : null}
            </View>
            <View className="min-w-0 flex-1 pb-1">
              <View className="flex-row flex-wrap items-baseline justify-between gap-2">
                <VemtapText
                  variant="labelMd"
                  className={cn(
                    'min-w-0 flex-1 font-sans-semibold',
                    step.state === 'pending' && 'text-text-secondary',
                  )}
                  numberOfLines={1}
                >
                  {step.title}
                </VemtapText>
                <VemtapText
                  variant="micro"
                  tone={step.state === 'active' ? 'brand' : 'tertiary'}
                >
                  {step.time}
                </VemtapText>
              </View>
              <VemtapText variant="caption" tone="secondary" numberOfLines={2}>
                {step.body}
              </VemtapText>
            </View>
          </View>
        ))}
      </SetupCard>

      <SetupCard className="mt-4 gap-3">
        <BusinessSectionHeading
          title={copy.fulfilmentTitle}
          titleVariant="labelMd"
          icon="storefront"
        />
        <TwoColumnGrid
          items={[
            { id: 'branch', label: copy.branchLabel, value: copy.branchValue },
            { id: 'station', label: copy.stationLabel, value: copy.stationValue },
          ]}
          keyExtractor={item => item.id}
          renderItem={item => (
            <View className="gap-0.5 rounded-lg bg-surface-container-low p-2.5">
              <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                {item.label}
              </VemtapText>
              <VemtapText
                variant="labelSm"
                className="font-sans-semibold"
                numberOfLines={1}
              >
                {item.value}
              </VemtapText>
            </View>
          )}
        />
        <VemtapText variant="caption" tone="secondary">
          {copy.fulfilmentNote}
        </VemtapText>
      </SetupCard>

      <View className="mt-4 gap-2">
        <VemtapText
          variant="labelSm"
          tone="secondary"
          className="px-1 font-sans-semibold uppercase"
        >
          {copy.modifiersTitle}
        </VemtapText>
        <TwoColumnGrid
          items={[
            {
              id: 'processing',
              label: copy.markProcessing,
              icon: 'sync' as IconName,
              onPress: onMarkProcessing,
            },
            {
              id: 'ready',
              label: copy.markReady,
              icon: 'inventory' as IconName,
              onPress: onMarkReady,
            },
            {
              id: 'payment',
              label: copy.confirmPayment,
              icon: 'payments' as IconName,
              onPress: onConfirmPayment,
            },
            {
              id: 'refund',
              label: copy.adjustRefund,
              icon: 'autorenew' as IconName,
              onPress: onAdjustRefund,
              tone: 'error' as const,
            },
          ]}
          keyExtractor={item => item.id}
          renderItem={item => (
            <BusinessActionTile
              label={item.label}
              icon={item.icon}
              size="sm"
              tone={item.tone === 'error' ? 'error' : 'neutral'}
              onPress={item.onPress}
            />
          )}
        />
      </View>
    </BusinessScreenLayout>
  );
}

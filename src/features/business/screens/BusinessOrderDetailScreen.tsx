import React, { useState } from 'react';
import { Alert, Image, Pressable, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { Avatar } from '@components/ui/Avatar';
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
import type { OrderDetailView } from '@features/business/hooks/useBusinessOrders';
import { cn } from '@utils/cn';
import { LoadingState } from '@components/shared/LoadingState';
import { ErrorState } from '@components/shared/ErrorState';

cssInterop(Pressable, { className: 'style' });
cssInterop(Image, { className: 'style' });

const copy = strings.businessOrderDetail;

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
  /** Live detail from `GET /catalogue/orders/:id`; absent while it loads. */
  detail?: OrderDetailView;
  /** The order failed to load. */
  isError?: boolean;
  onRetry?: () => void;
}

interface DetailItem {
  id: string;
  name: string;
  price: string;
  note?: string;
  quantity: string;
  each?: string;
  imageUri?: string;
  imageAlt: string;
}

export function OrderDetailScreen({
  detail,
  isError,
  onRetry,
  ...props
}: OrderDetailScreenProps) {
  const { onBack } = props;
  if (!detail) {
    return (
      <BusinessScreenLayout
        header={{ title: copy.title, titleVariant: 'labelMd', onBack, showAvatar: true }}
        contentContainerClassName="pb-8"
      >
        {isError ? <ErrorState onRetry={onRetry} /> : <LoadingState />}
      </BusinessScreenLayout>
    );
  }
  return <OrderDetailBody {...props} detail={detail} />;
}

type OrderDetailBodyProps = Omit<
  OrderDetailScreenProps,
  'detail' | 'isError' | 'onRetry'
> & {
  detail: OrderDetailView;
};

function OrderDetailBody({
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
  detail,
}: OrderDetailBodyProps) {
  const [accepted, setAccepted] = useState(false);

  const { reference, statusLabel, statusTitle, statusTime, showTriage } = detail;
  const branchLabel = detail.branchName;
  const kitchenAccepted = accepted || detail.kitchenAccepted === true;

  const items: DetailItem[] = detail.items.map(line => ({
    id: line.id,
    name: line.name,
    price: line.lineTotalLabel,
    quantity: `Qty: ${line.quantity}`,
    each: `${line.unitPriceLabel} each`,
    imageUri: line.image,
    imageAlt: line.name,
  }));

  const { timeline } = detail;

  const confirmRefund = () => {
    Alert.alert(copy.refundConfirmTitle, copy.refundConfirmBody, [
      { text: copy.refundConfirmCancel, style: 'cancel' },
      {
        text: copy.refundConfirmAction,
        style: 'destructive',
        onPress: () => onAdjustRefund?.(),
      },
    ]);
  };

  const liveActionTiles: {
    id: string;
    label: string;
    icon: IconName;
    onPress?: () => void;
    tone?: 'error';
  }[] = [
    ...(detail.canMarkProcessing
      ? [
          {
            id: 'processing',
            label: copy.markProcessing,
            icon: 'sync' as IconName,
            onPress: onMarkProcessing,
          },
        ]
      : []),
    ...(detail.canMarkReady
      ? [
          {
            id: 'ready',
            label: copy.markReady,
            icon: 'inventory' as IconName,
            onPress: onMarkReady,
          },
        ]
      : []),
    ...(detail.canComplete
      ? [
          {
            id: 'complete',
            label: copy.completeOrder,
            icon: 'checkCircle' as IconName,
            onPress: onConfirmPayment,
          },
        ]
      : []),
    ...(detail.canRefund
      ? [
          {
            id: 'refund',
            label: copy.refundOrder,
            icon: 'autorenew' as IconName,
            onPress: confirmRefund,
            tone: 'error' as const,
          },
        ]
      : []),
  ];

  return (
    <BusinessScreenLayout
      header={{
        title: reference,
        titleVariant: 'labelMd',
        onBack,
        showAvatar: true,
        accessory: (
          <BusinessInlineAction
            label={branchLabel}
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
              {statusLabel}
            </VemtapText>
          </View>
          <View className="flex-row items-center gap-1 rounded-full bg-surface-container px-2 py-0.5">
            <Icon name="hourglass" size={13} color={colors.textSecondary} />
            <VemtapText variant="micro" tone="secondary">
              {statusTime}
            </VemtapText>
          </View>
        </View>
        <VemtapText variant="labelMd" className="mt-2 font-sans-semibold">
          {statusTitle}
        </VemtapText>
      </View>

      {showTriage ? (
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
      ) : null}

      {kitchenAccepted ? (
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
          <Avatar
            uri={detail.customer.avatar ?? undefined}
            name={detail.customer.name}
            size="lg"
            tone="brand"
            className="bg-surface-container"
            accessibilityLabel={`${detail.customer.name} portrait`}
          />
          <View className="min-w-0 flex-1">
            <View className="flex-row items-center gap-1">
              <VemtapText
                variant="labelMd"
                className="font-sans-semibold"
                numberOfLines={1}
              >
                {detail.customer.name}
              </VemtapText>
              <Icon name="verified" size={16} color={colors.primary} />
            </View>
            <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
              {detail.customer.phone || '—'}
            </VemtapText>
          </View>
        </View>
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
                  {detail.itemsCountLabel}
                </VemtapText>
              </View>
            }
          />
        </View>
        <View className="self-start rounded-full bg-surface-container px-2 py-0.5">
          <VemtapText variant="caption" className="font-sans-medium text-text-secondary">
            {copy.itemsStatusFor(detail.status)}
          </VemtapText>
        </View>

        {items.map(item => (
          <View key={item.id} className="flex-row items-start gap-3 py-2">
            <Image
              source={{ uri: item.imageUri }}
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
              {item.note ? (
                <VemtapText
                  variant="caption"
                  tone="secondary"
                  className="mt-0.5"
                  numberOfLines={1}
                >
                  {item.note}
                </VemtapText>
              ) : null}
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
              {detail.subtotalLabel}
            </VemtapText>
          </View>
          {detail.loyaltyAwarded ? (
            <InfoHint text={copy.loyaltyAwardedHint} icon="loyalty" />
          ) : null}
          <View className="mt-2 flex-row items-center justify-between gap-2 border-t border-border pt-2">
            <VemtapText variant="labelSm" className="min-w-0 flex-1 font-sans-bold">
              {copy.totalLabel}
            </VemtapText>
            <VemtapText
              variant="labelMd"
              className="shrink-0 font-sans-bold text-primary"
            >
              {detail.totalLabel}
            </VemtapText>
          </View>
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
        {timeline.map((step, index) => (
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
              {index < timeline.length - 1 ? (
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
            {
              id: 'branch',
              label: copy.branchLabel,
              value: detail.fulfilment.branch,
            },
            {
              id: 'station',
              label: copy.stationLabel,
              value: detail.fulfilment.station,
            },
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
          {detail.fulfilment.note}
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
          items={liveActionTiles}
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

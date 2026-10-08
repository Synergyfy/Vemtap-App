import React from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RegistrationHeader } from '@components/auth/RegistrationHeader';
import { Button } from '@components/ui/Button';
import { Icon, type IconName } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import {
  OrderLineItem,
  PriceBreakdown,
} from '@features/order/components/OrderComponents';
import { EmptyState } from '@components/shared/EmptyState';
import { ErrorState } from '@components/shared/ErrorState';
import { LoadingState } from '@components/shared/LoadingState';
import { OrderStatusTimelineRow } from '@features/order/components/OrderHubComponents';
import { useCustomerOrderDetail } from '@features/order/hooks/useCustomerOrders';
import type { CatalogueOrder } from '@api/ordersApi';
import { statusLabel } from '@features/order/orderStatus';
import { orderImages } from '@features/order/orderData';
import { useCurrentUserDisplay } from '@hooks/useCurrentUserDisplay';
import { formatCurrency, formatWhen } from '@utils/formatters';
import { colors } from '@theme/colors';

const itemImages = [orderImages.steak, orderImages.drink, orderImages.merchant];
/**
 * The customer rows carry the signed-in user, so they are built per render from
 * `useCurrentUserDisplay` rather than frozen at module load.
 */
const transactionRows = (
  identity: { name: string; phone: string },
  order?: CatalogueOrder,
): Array<{
  icon: IconName;
  label: string;
  value: string;
  copyable?: boolean;
}> => [
  {
    icon: 'badge',
    label: strings.urbanOrderDetail.orderReference,
    value: `${strings.ordersHub.orderNumberLabel}${(order?.id ?? '').slice(0, 8).toUpperCase()}`,
    copyable: true,
  },
  {
    icon: 'eventAvailable',
    label: strings.urbanOrderDetail.dateTime,
    value: formatWhen(order?.createdAt ?? ''),
  },
  {
    icon: 'person',
    label: strings.urbanOrderDetail.customer,
    value: identity.name,
  },
  {
    icon: 'phone',
    label: strings.urbanOrderDetail.contact,
    value: identity.phone,
  },
];

export interface UrbanOrderDetailScreenProps {
  /**
   * The customer's own order id. The detail is resolved from
   * `GET /catalogue/orders/my-orders` rather than `GET /catalogue/orders/{id}`,
   * which is Admin-only and answers 403 for a customer token.
   */
  orderId?: string;
  onBack?: () => void;
  onShare?: () => void;
  onMore?: () => void;
  onCopy?: (value: string) => void;
  onCall?: () => void;
  onChat?: () => void;
  onDirections?: () => void;
  onReorder?: () => void;
  onDownloadInvoice?: () => void;
  onReportIssue?: () => void;
}

export function UrbanOrderDetailScreen({
  orderId,
  onBack,
  onShare,
  onMore,
  onCopy,
  onCall,
  onChat,
  onDirections,
  onReorder,
  onDownloadInvoice,
  onReportIssue,
}: UrbanOrderDetailScreenProps) {
  const insets = useSafeAreaInsets();
  const copy = onCopy ?? (() => undefined);
  const me = useCurrentUserDisplay();

  const detail = useCustomerOrderDetail(orderId);
  const { order } = detail;

  /**
   * The timeline is derived from the single status the API returns instead of
   * faking a step-by-step animation: a `completed` order marks every earlier
   * stage done, one still `processing` leaves the final stage pending, and a
   * terminal state (cancelled, refunded) stops at that stage.
   */
  const STAGE_ORDER = ['new', 'processing', 'completed'];
  const currentStage = STAGE_ORDER.indexOf(order?.status ?? '');
  const stageState = (
    stage: string,
    isLast: boolean,
  ): 'complete' | 'active' | 'pending' => {
    if (currentStage < 0) return 'pending';
    const index = STAGE_ORDER.indexOf(stage);
    if (index > currentStage) return 'pending';
    if (index < currentStage) return 'complete';
    return isLast && currentStage === STAGE_ORDER.length - 1 ? 'complete' : 'active';
  };

  const itemRows = (order?.items ?? []).filter(line => line !== undefined);
  const subtotal = itemRows.reduce(
    (sum, line) => sum + (typeof line.totalPrice === 'number' ? line.totalPrice : 0),
    0,
  );
  const total = typeof order?.totalAmount === 'number' ? order.totalAmount : null;

  /**
   * The API does not break out promo or fee — it returns line totals and an
   * order total. When the order total is below the sum of its lines the
   * difference is a discount; otherwise the lines already account for it and
   * inventing a fee row would be fiction.
   */
  const discount = total == null ? 0 : Math.max(0, subtotal - total);
  const priceRows = [
    { label: strings.urbanOrderDetail.subtotal, value: formatCurrency(subtotal) },
    ...(discount > 0
      ? [
          {
            label: strings.urbanOrderDetail.promo,
            value: `-${formatCurrency(discount)}`,
            tone: 'success' as const,
          },
        ]
      : []),
  ];

  return (
    <View className="flex-1 bg-background">
      <View style={{ paddingTop: Math.max(insets.top, 8) }} className="bg-surface">
        <RegistrationHeader
          title={strings.urbanOrderDetail.title}
          onBack={onBack ?? (() => undefined)}
          titleAlign="start"
          showShareAction
          onShare={onShare}
          showMoreAction
          onMore={onMore}
        />
      </View>
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-3 px-4 pb-8 pt-3"
        showsVerticalScrollIndicator={false}
      >
        {detail.isLoading ? (
          <LoadingState label={strings.common.loading} />
        ) : detail.isError ? (
          <ErrorState title={strings.common.error} onRetry={detail.refetch} />
        ) : !order ? (
          <EmptyState
            icon="receipt"
            title={strings.ordersHub.orderDetailUnavailableTitle}
            description={strings.ordersHub.orderDetailUnavailableBody}
          />
        ) : (
          <>
            <View className="rounded-xl bg-surface-container-low p-4 shadow-sm">
              <View className="mb-4 flex-row flex-wrap items-center justify-between gap-2">
                <View className="flex-row items-center gap-2 rounded-full bg-tertiary-fixed px-3 py-1.5">
                  <View className="h-2 w-2 rounded-full bg-tertiary" />
                  <VemtapText variant="labelMd" className="font-sans-semibold">
                    {statusLabel(order?.status)}
                  </VemtapText>
                </View>
                <View className="flex-row items-center gap-1">
                  <Icon name="schedule" size={17} color={colors.tertiary} />
                  <VemtapText variant="labelSm" className="font-sans-medium">
                    {formatWhen(order?.createdAt ?? '')}
                  </VemtapText>
                </View>
              </View>
              <VemtapText
                accessibilityRole="header"
                variant="headingMd"
                className="text-heading-md"
              >
                {strings.urbanOrderDetail.heading}
              </VemtapText>
              <VemtapText variant="bodyMd" tone="secondary" className="mt-1">
                {strings.urbanOrderDetail.subheading}
              </VemtapText>
              <View className="mt-4 gap-4">
                <OrderStatusTimelineRow
                  title={strings.urbanOrderDetail.status.placed}
                  body={strings.urbanOrderDetail.status.placedBody}
                  meta={formatWhen(order?.createdAt ?? '')}
                  state={stageState('new', false)}
                  icon="check"
                />
                <OrderStatusTimelineRow
                  title={strings.urbanOrderDetail.status.preparing}
                  body={strings.urbanOrderDetail.status.preparingBody}
                  meta={
                    currentStage >= 1
                      ? formatWhen(order?.updatedAt ?? '')
                      : strings.ordersHub.orderNotStarted
                  }
                  state={stageState('processing', false)}
                  icon="restaurant"
                />
                <OrderStatusTimelineRow
                  title={strings.urbanOrderDetail.status.ready}
                  body={strings.urbanOrderDetail.status.readyBody}
                  meta={
                    currentStage >= 2
                      ? formatWhen(order?.updatedAt ?? '')
                      : strings.ordersHub.orderNotStarted
                  }
                  state={stageState('completed', true)}
                  icon="shoppingBag"
                  last
                />
              </View>
            </View>

            <View className="flex-row items-center gap-3 rounded-xl bg-surface-tint p-4 shadow-sm">
              <View className="min-w-0 flex-1 flex-row items-center gap-3">
                <View className="h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary shadow-sm">
                  <Icon name="pin" size={23} color={colors.surface} />
                </View>
                <View className="min-w-0 flex-1">
                  <VemtapText
                    variant="caption"
                    tone="secondary"
                    className="font-sans-medium uppercase"
                    numberOfLines={1}
                  >
                    {strings.urbanOrderDetail.expressPass}
                  </VemtapText>
                  <VemtapText
                    variant="headingMd"
                    className="font-sans-bold text-heading-md tracking-widest"
                    numberOfLines={1}
                  >
                    {strings.urbanOrderDetail.pickupPin}
                  </VemtapText>
                  <VemtapText variant="caption" tone="secondary" numberOfLines={2}>
                    {strings.urbanOrderDetail.pickupHint}
                  </VemtapText>
                </View>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={strings.urbanOrderDetail.copy}
                onPress={() => copy(strings.urbanOrderDetail.pickupPin)}
                className="h-8 max-w-[86px] shrink-0 flex-row items-center justify-center gap-1 self-center rounded-lg bg-surface px-2 shadow-sm active:scale-95"
              >
                <Icon name="copy" size={15} color={colors.primary} />
                <VemtapText
                  variant="micro"
                  tone="brand"
                  className="shrink font-sans-semibold"
                  numberOfLines={1}
                >
                  {strings.urbanOrderDetail.copy}
                </VemtapText>
              </Pressable>
            </View>

            <View className="rounded-xl bg-surface p-4 shadow-sm">
              <View className="flex-row items-start gap-3">
                <Image
                  source={{ uri: orderImages.merchant }}
                  className="h-12 w-12 shrink-0 rounded-xl bg-surface-container"
                />
                <View className="min-w-0 flex-1">
                  <View className="flex-row items-center gap-1">
                    <VemtapText
                      variant="labelMd"
                      numberOfLines={1}
                      className="min-w-0 flex-1 font-sans-semibold"
                    >
                      {order?.branch?.name ?? strings.urbanProfile.name}
                    </VemtapText>
                    <Icon name="verified" size={18} color={colors.primary} />
                  </View>
                  <VemtapText variant="labelSm" tone="secondary" numberOfLines={2}>
                    {order?.branch?.address ?? strings.urbanOrderDetail.branch}
                  </VemtapText>
                  <VemtapText
                    variant="caption"
                    tone="brand"
                    className="mt-0.5 font-sans-semibold"
                  >
                    {strings.urbanOrderDetail.openMeta}
                  </VemtapText>
                </View>
              </View>
              <View className="mt-3 flex-row gap-2">
                {[
                  {
                    label: strings.urbanOrderDetail.call,
                    icon: 'phone' as const,
                    action: onCall,
                    active: false,
                  },
                  {
                    label: strings.urbanOrderDetail.chat,
                    icon: 'comment' as const,
                    action: onChat,
                    active: true,
                  },
                  {
                    label: strings.urbanOrderDetail.directions,
                    icon: 'nearMe' as const,
                    action: onDirections,
                    active: false,
                  },
                ].map(action => (
                  <Pressable
                    key={action.label}
                    accessibilityRole="button"
                    accessibilityLabel={action.label}
                    onPress={action.action}
                    className={`min-h-[70px] flex-1 items-center justify-center rounded-xl px-1 py-2 ${action.active ? 'bg-surface-tint' : 'bg-surface-subtle'}`}
                  >
                    <View
                      className={`mb-1 h-9 w-9 items-center justify-center rounded-full ${action.active ? 'bg-primary shadow-sm' : 'bg-surface-tint'}`}
                    >
                      <Icon
                        name={action.icon}
                        size={20}
                        color={action.active ? colors.surface : colors.primary}
                      />
                    </View>
                    <VemtapText
                      variant="labelSm"
                      tone={action.active ? 'brand' : 'default'}
                      numberOfLines={1}
                      className={`text-center ${action.active ? 'font-sans-semibold' : 'font-sans-medium'}`}
                    >
                      {action.label}
                    </VemtapText>
                  </Pressable>
                ))}
              </View>
            </View>

            <View className="rounded-xl bg-surface p-4 shadow-sm">
              <View className="mb-4 flex-row items-center justify-between">
                <View className="flex-row items-center gap-1">
                  <Icon name="shoppingBag" size={20} color={colors.primary} />
                  <VemtapText variant="labelMd" className="font-sans-semibold">
                    {strings.urbanOrderDetail.orderSummary}
                  </VemtapText>
                </View>
                <VemtapText
                  variant="labelSm"
                  tone="secondary"
                  className="rounded-full bg-surface-subtle px-2.5 py-1"
                >
                  {strings.ordersHub.orderItemsCount(itemRows.length)}
                </VemtapText>
              </View>
              <View className="gap-4">
                {itemRows.map((line, index) => (
                  <OrderLineItem
                    key={line.id ?? line.itemId ?? index}
                    image={
                      line.image
                        ? { uri: line.image }
                        : { uri: itemImages[index % itemImages.length] }
                    }
                    title={line.name ?? strings.ordersHub.orderItemFallback}
                    description=""
                    price={line.totalPrice == null ? '' : formatCurrency(line.totalPrice)}
                    quantity={line.quantity}
                  />
                ))}
              </View>
              <View className="mt-4">
                <PriceBreakdown
                  rows={priceRows}
                  totalLabel={strings.urbanOrderDetail.totalPaid}
                  totalCaption={strings.urbanOrderDetail.visa}
                  total={total == null ? '' : formatCurrency(total)}
                />
              </View>
            </View>

            <View className="rounded-xl bg-surface p-4 shadow-sm">
              <VemtapText variant="labelMd" className="font-sans-semibold">
                {strings.urbanOrderDetail.transaction}
              </VemtapText>
              <View className="mt-2 gap-1">
                {transactionRows({ name: me.fullName, phone: me.phone }, order).map(
                  row => (
                    <View
                      key={row.label}
                      className="flex-row items-center justify-between gap-3 py-1"
                    >
                      <View className="min-w-0 flex-1 flex-row items-center gap-2">
                        <Icon name={row.icon} size={19} color={colors.outline} />
                        <VemtapText
                          variant="bodyMd"
                          tone="secondary"
                          className="min-w-0 flex-1"
                        >
                          {row.label}
                        </VemtapText>
                      </View>
                      <Pressable
                        accessibilityRole="button"
                        disabled={!row.copyable}
                        onPress={() => copy(row.value)}
                        className="min-w-0 shrink-0 flex-row items-center gap-1"
                      >
                        <VemtapText
                          variant="labelMd"
                          className="font-sans-medium"
                          numberOfLines={1}
                        >
                          {row.value}
                        </VemtapText>
                        {row.copyable ? (
                          <Icon name="copy" size={16} color={colors.primary} />
                        ) : null}
                      </Pressable>
                    </View>
                  ),
                )}
              </View>
            </View>

            <View className="gap-3 pt-1">
              <Button
                label={strings.urbanOrderDetail.contactRestaurant}
                onPress={onCall}
                leftIcon={<Icon name="phone" size={21} color={colors.surface} />}
              />
              <Button
                label={strings.urbanOrderDetail.reorder}
                variant="outline"
                onPress={onReorder}
                leftIcon={<Icon name="history" size={19} color={colors.primary} />}
              />
              <Pressable
                accessibilityRole="button"
                onPress={onDownloadInvoice}
                className="flex-row items-center gap-1.5 py-1"
              >
                <Icon name="arrowForward" size={18} color={colors.primary} />
                <VemtapText variant="labelMd" tone="brand" className="font-sans-semibold">
                  {strings.urbanOrderDetail.invoice}
                </VemtapText>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={onReportIssue}
                className="flex-row items-center gap-1 py-1"
              >
                <Icon name="help" size={16} color={colors.textSecondary} />
                <VemtapText variant="labelSm" tone="secondary">
                  {strings.urbanOrderDetail.issue}
                </VemtapText>
              </Pressable>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

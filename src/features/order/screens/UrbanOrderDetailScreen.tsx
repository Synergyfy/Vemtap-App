import React, { useMemo, useState } from 'react';
import { Clipboard, Linking, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMutation } from '@tanstack/react-query';
import { RegistrationHeader } from '@components/auth/RegistrationHeader';
import { Button } from '@components/ui/Button';
import { Icon, type IconName } from '@components/ui/Icon';
import { Input } from '@components/ui/Input';
import { AppModal } from '@components/ui/Modal';
import { VemtapText } from '@components/ui/Text';
import { showToast } from '@components/shared/toast';
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
import { ordersApi } from '@api/ordersApi';
import { supportApi } from '@api/supportApi';
import { statusLabel } from '@features/order/orderStatus';
import { useCurrentUserDisplay } from '@hooks/useCurrentUserDisplay';
import type { OrderDraft } from '@navigation/types';
import { shareBase64File } from '@utils/csvExport';
import { formatCurrency, formatWhen } from '@utils/formatters';
import { colors } from '@theme/colors';

const copy = strings.urbanOrderDetail;

/** The reference customers and staff both see: the id's first eight characters. */
function orderReference(id: string): string {
  return `#${id.slice(0, 8).toUpperCase()}`;
}

function toNumber(value: string | number | null | undefined): number | null {
  if (value == null) return null;
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export interface UrbanOrderDetailScreenProps {
  /**
   * The customer's own order id. The detail is resolved from
   * `GET /catalogue/orders/my-orders` rather than `GET /catalogue/orders/{id}`,
   * which is Admin-only and answers 403 for a customer token.
   */
  orderId?: string;
  onBack?: () => void;
  /** Hidden when absent: not every stack has a conversation to open. */
  onChat?: () => void;
  /** Opens checkout with the order's items at the same branch. */
  onReorder?: (draft: OrderDraft) => void;
}

/**
 * One of the customer's orders, read from `my-orders`. Every action works on
 * the order itself: the pickup code is the order reference the business also
 * sees, Call and Directions use the branch, the receipt is
 * `GET /catalogue/orders/my-orders/:id/receipt`, and a report opens a support
 * ticket that names the order.
 */
export function UrbanOrderDetailScreen({
  orderId,
  onBack,
  onChat,
  onReorder,
}: UrbanOrderDetailScreenProps) {
  const insets = useSafeAreaInsets();
  const me = useCurrentUserDisplay();
  const detail = useCustomerOrderDetail(orderId);
  const { order } = detail;
  const [copiedRef, setCopiedRef] = useState(false);
  const [issueOpen, setIssueOpen] = useState(false);
  const [issueText, setIssueText] = useState('');

  const receipt = useMutation({
    mutationFn: (id: string) => ordersApi.getMyOrderReceipt(id),
    onSuccess: async file => {
      const shared = await shareBase64File(
        file.filename,
        file.contentBase64,
        file.mimeType,
        copy.invoice,
      );
      if (!shared) showToast(copy.invoiceUnavailable, 'error');
    },
    onError: () => showToast(copy.invoiceFailed, 'error'),
  });

  const report = useMutation({
    mutationFn: (input: { ref: string; message: string }) =>
      supportApi.createTicket({
        subject: copy.issueSubject(input.ref),
        category: copy.issueCategory,
        message: input.message,
      }),
    onSuccess: () => {
      setIssueOpen(false);
      setIssueText('');
      showToast(copy.issueSent, 'success');
    },
    onError: () => showToast(copy.issueFailed, 'error'),
  });

  /**
   * The timeline is derived from the single status the API returns: a
   * `completed` order marks every earlier stage done, one still `processing`
   * leaves the final stage pending, and a terminal state stops at that stage.
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
  const total = toNumber(order?.totalAmount);
  /** Only a total below its lines is a discount; nothing else is invented. */
  const discount = total == null ? 0 : Math.max(0, subtotal - total);
  const priceRows = [
    { label: copy.subtotal, value: formatCurrency(subtotal) },
    ...(discount > 0
      ? [
          {
            label: copy.discount,
            value: `-${formatCurrency(discount)}`,
            tone: 'success' as const,
          },
        ]
      : []),
  ];

  const branch = order?.branch;
  const businessName = branch?.business?.name ?? order?.business?.name ?? '';
  const ref = order ? orderReference(order.id) : '';

  const reorderDraft = useMemo<OrderDraft | null>(() => {
    if (!order?.branchId) return null;
    const lines = (order.items ?? []).flatMap(line =>
      line.itemId
        ? [
            {
              itemId: line.itemId,
              name: line.name ?? strings.ordersHub.orderItemFallback,
              image: line.image,
              unitPrice: toNumber(line.unitPrice) ?? 0,
              quantity: line.quantity,
            },
          ]
        : [],
    );
    if (lines.length === 0) return null;
    return {
      branchId: order.branchId,
      businessName: businessName || undefined,
      branchName: branch?.name ?? undefined,
      items: lines,
      instructions: '',
    };
  }, [branch?.name, businessName, order]);

  const copyRef = () => {
    Clipboard.setString(ref);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const branchActions: { label: string; icon: IconName; onPress: () => void }[] = [
    ...(branch?.phone
      ? [
          {
            label: copy.call,
            icon: 'phone' as const,
            onPress: () => {
              Linking.openURL(`tel:${branch.phone}`).catch(() => undefined);
            },
          },
        ]
      : []),
    ...(onChat ? [{ label: copy.chat, icon: 'comment' as const, onPress: onChat }] : []),
    ...(branch?.address
      ? [
          {
            label: copy.directions,
            icon: 'nearMe' as const,
            onPress: () => {
              Linking.openURL(
                `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(branch.address ?? '')}`,
              ).catch(() => undefined);
            },
          },
        ]
      : []),
  ];

  const detailsRows: { icon: IconName; label: string; value: string }[] = order
    ? [
        {
          icon: 'eventAvailable',
          label: copy.dateTime,
          value: formatWhen(order.createdAt ?? ''),
        },
        ...(me.fullName
          ? [{ icon: 'person' as const, label: copy.customer, value: me.fullName }]
          : []),
        ...(me.phone
          ? [{ icon: 'phone' as const, label: copy.contact, value: me.phone }]
          : []),
        ...(order.tableNumber
          ? [{ icon: 'restaurant' as const, label: copy.table, value: order.tableNumber }]
          : []),
        ...(order.notes
          ? [{ icon: 'editNote' as const, label: copy.note, value: order.notes }]
          : []),
      ]
    : [];

  return (
    <View className="flex-1 bg-background">
      <View style={{ paddingTop: Math.max(insets.top, 8) }} className="bg-surface">
        <RegistrationHeader
          title={copy.title}
          onBack={onBack ?? (() => undefined)}
          titleAlign="start"
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
                    {statusLabel(order.status)}
                  </VemtapText>
                </View>
                <View className="flex-row items-center gap-1">
                  <Icon name="schedule" size={17} color={colors.tertiary} />
                  <VemtapText variant="labelSm" className="font-sans-medium">
                    {formatWhen(order.createdAt ?? '')}
                  </VemtapText>
                </View>
              </View>
              <VemtapText
                accessibilityRole="header"
                variant="headingMd"
                className="text-heading-md"
              >
                {copy.headings[order.status ?? ''] ?? copy.headingFallback}
              </VemtapText>
              <VemtapText variant="bodyMd" tone="secondary" className="mt-1">
                {copy.subheading(businessName)}
              </VemtapText>
              <View className="mt-4 gap-4">
                <OrderStatusTimelineRow
                  title={copy.status.placed}
                  body={copy.status.placedBody}
                  meta={formatWhen(order.createdAt ?? '')}
                  state={stageState('new', false)}
                  icon="check"
                />
                <OrderStatusTimelineRow
                  title={copy.status.preparing}
                  body={copy.status.preparingBody}
                  meta={
                    currentStage >= 1
                      ? formatWhen(order.updatedAt ?? '')
                      : strings.ordersHub.orderNotStarted
                  }
                  state={stageState('processing', false)}
                  icon="restaurant"
                />
                <OrderStatusTimelineRow
                  title={copy.status.ready}
                  body={copy.status.readyBody}
                  meta={
                    currentStage >= 2
                      ? formatWhen(order.updatedAt ?? '')
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
                    {copy.pickupTitle}
                  </VemtapText>
                  <VemtapText
                    variant="headingMd"
                    className="font-sans-bold text-heading-md tracking-widest"
                    numberOfLines={1}
                  >
                    {ref}
                  </VemtapText>
                  <VemtapText variant="caption" tone="secondary" numberOfLines={2}>
                    {copy.pickupHint}
                  </VemtapText>
                </View>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={copiedRef ? copy.copied : copy.copy}
                onPress={copyRef}
                className="h-8 max-w-[86px] shrink-0 flex-row items-center justify-center gap-1 self-center rounded-lg bg-surface px-2 shadow-sm active:scale-95"
              >
                <Icon
                  name={copiedRef ? 'check' : 'copy'}
                  size={15}
                  color={colors.primary}
                />
                <VemtapText
                  variant="micro"
                  tone="brand"
                  className="shrink font-sans-semibold"
                  numberOfLines={1}
                >
                  {copiedRef ? copy.copied : copy.copy}
                </VemtapText>
              </Pressable>
            </View>

            {branch?.name || branch?.address || branchActions.length ? (
              <View className="rounded-xl bg-surface p-4 shadow-sm">
                <View className="flex-row items-start gap-3">
                  <View className="h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface-container">
                    <Icon name="storefront" size={22} color={colors.primary} />
                  </View>
                  <View className="min-w-0 flex-1">
                    <VemtapText
                      variant="labelMd"
                      numberOfLines={1}
                      className="min-w-0 font-sans-semibold"
                    >
                      {[businessName, branch?.name].filter(Boolean).join(' • ')}
                    </VemtapText>
                    {branch?.address ? (
                      <VemtapText variant="labelSm" tone="secondary" numberOfLines={2}>
                        {branch.address}
                      </VemtapText>
                    ) : null}
                  </View>
                </View>
                {branchActions.length ? (
                  <View className="mt-3 flex-row gap-2">
                    {branchActions.map(action => (
                      <Pressable
                        key={action.label}
                        accessibilityRole="button"
                        accessibilityLabel={action.label}
                        onPress={action.onPress}
                        className="min-h-[70px] flex-1 items-center justify-center rounded-xl bg-surface-subtle px-1 py-2"
                      >
                        <View className="mb-1 h-9 w-9 items-center justify-center rounded-full bg-surface-tint">
                          <Icon name={action.icon} size={20} color={colors.primary} />
                        </View>
                        <VemtapText
                          variant="labelSm"
                          numberOfLines={1}
                          className="text-center font-sans-medium"
                        >
                          {action.label}
                        </VemtapText>
                      </Pressable>
                    ))}
                  </View>
                ) : null}
              </View>
            ) : null}

            <View className="rounded-xl bg-surface p-4 shadow-sm">
              <View className="mb-4 flex-row items-center justify-between">
                <View className="flex-row items-center gap-1">
                  <Icon name="shoppingBag" size={20} color={colors.primary} />
                  <VemtapText variant="labelMd" className="font-sans-semibold">
                    {copy.orderSummary}
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
                    image={line.image ? { uri: line.image } : undefined}
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
                  totalLabel={copy.totalPaid}
                  totalCaption={copy.payAtCounter}
                  total={total == null ? '' : formatCurrency(total)}
                />
              </View>
            </View>

            <View className="rounded-xl bg-surface p-4 shadow-sm">
              <VemtapText variant="labelMd" className="font-sans-semibold">
                {copy.transaction}
              </VemtapText>
              <View className="mt-2 gap-1">
                <View className="flex-row items-center justify-between gap-3 py-1">
                  <View className="min-w-0 flex-1 flex-row items-center gap-2">
                    <Icon name="badge" size={19} color={colors.outline} />
                    <VemtapText
                      variant="bodyMd"
                      tone="secondary"
                      className="min-w-0 flex-1"
                    >
                      {copy.orderReference}
                    </VemtapText>
                  </View>
                  <VemtapText
                    variant="labelMd"
                    className="font-sans-medium"
                    numberOfLines={1}
                  >
                    {ref}
                  </VemtapText>
                </View>
                {detailsRows.map(row => (
                  <View
                    key={row.label}
                    className="flex-row items-center justify-between gap-3 py-1"
                  >
                    <View className="min-w-0 flex-row items-center gap-2">
                      <Icon name={row.icon} size={19} color={colors.outline} />
                      <VemtapText variant="bodyMd" tone="secondary">
                        {row.label}
                      </VemtapText>
                    </View>
                    <VemtapText
                      variant="labelMd"
                      className="min-w-0 shrink text-right font-sans-medium"
                      numberOfLines={2}
                    >
                      {row.value}
                    </VemtapText>
                  </View>
                ))}
              </View>
            </View>

            <View className="gap-3 pt-1">
              {onReorder ? (
                <Button
                  label={copy.reorder}
                  variant="outline"
                  onPress={() =>
                    reorderDraft
                      ? onReorder(reorderDraft)
                      : showToast(copy.reorderUnavailable, 'error')
                  }
                  leftIcon={<Icon name="history" size={19} color={colors.primary} />}
                />
              ) : null}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={copy.invoice}
                disabled={receipt.isPending}
                onPress={() => receipt.mutate(order.id)}
                className="flex-row items-center gap-1.5 py-1"
              >
                <Icon name="download" size={18} color={colors.primary} />
                <VemtapText variant="labelMd" tone="brand" className="font-sans-semibold">
                  {receipt.isPending ? strings.common.loading : copy.invoice}
                </VemtapText>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={copy.issue}
                onPress={() => setIssueOpen(true)}
                className="flex-row items-center gap-1 py-1"
              >
                <Icon name="help" size={16} color={colors.textSecondary} />
                <VemtapText variant="labelSm" tone="secondary">
                  {copy.issue}
                </VemtapText>
              </Pressable>
            </View>
          </>
        )}
      </ScrollView>

      <AppModal
        visible={issueOpen}
        onClose={() => setIssueOpen(false)}
        title={copy.issueTitle}
      >
        <View className="gap-3">
          <VemtapText variant="caption" tone="secondary">
            {copy.issueHint(ref)}
          </VemtapText>
          <Input
            value={issueText}
            onChangeText={setIssueText}
            placeholder={copy.issuePlaceholder}
            accessibilityLabel={copy.issueTitle}
            multiline
            maxLength={2000}
          />
          <Button
            label={copy.issueSend}
            loading={report.isPending}
            disabled={report.isPending || !issueText.trim()}
            onPress={() => report.mutate({ ref, message: issueText.trim() })}
          />
        </View>
      </AppModal>
    </View>
  );
}

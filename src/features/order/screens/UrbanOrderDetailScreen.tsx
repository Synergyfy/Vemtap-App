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
import { OrderStatusTimelineRow } from '@features/order/components/OrderHubComponents';
import { orderImages } from '@features/order/orderData';
import { colors } from '@theme/colors';

const itemImages = [orderImages.steak, orderImages.drink, orderImages.merchant];
const transactionRows: Array<{
  icon: IconName;
  label: string;
  value: string;
  copyable?: boolean;
}> = [
  {
    icon: 'badge',
    label: strings.urbanOrderDetail.orderReference,
    value: strings.urbanOrderDetail.orderNumber,
    copyable: true,
  },
  {
    icon: 'eventAvailable',
    label: strings.urbanOrderDetail.dateTime,
    value: strings.urbanOrderDetail.dateValue,
  },
  {
    icon: 'person',
    label: strings.urbanOrderDetail.customer,
    value: strings.urbanOrderDetail.customerName,
  },
  {
    icon: 'phone',
    label: strings.urbanOrderDetail.contact,
    value: strings.urbanOrderDetail.phone,
  },
];

export interface UrbanOrderDetailScreenProps {
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

  return (
    <View className="flex-1 bg-background">
      <View style={{ paddingTop: Math.max(insets.top, 8) }} className="bg-surface">
        <RegistrationHeader
          title={strings.urbanOrderDetail.title}
          onBack={onBack ?? (() => undefined)}
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
        <View className="rounded-xl bg-surface-container-low p-4 shadow-sm">
          <View className="mb-4 flex-row flex-wrap items-center justify-between gap-2">
            <View className="flex-row items-center gap-2 rounded-full bg-tertiary-fixed px-3 py-1.5">
              <View className="h-2 w-2 rounded-full bg-tertiary" />
              <VemtapText variant="labelMd" className="font-sans-semibold">
                {strings.urbanOrderDetail.preparing}
              </VemtapText>
            </View>
            <View className="flex-row items-center gap-1">
              <Icon name="schedule" size={17} color={colors.tertiary} />
              <VemtapText variant="labelSm" className="font-sans-medium">
                {strings.urbanOrderDetail.pickupEstimate}
              </VemtapText>
            </View>
          </View>
          <VemtapText
            accessibilityRole="header"
            variant="headingLg"
            className="text-heading-lg"
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
              meta={strings.urbanOrderDetail.status.placedTime}
              state="complete"
              icon="check"
            />
            <OrderStatusTimelineRow
              title={strings.urbanOrderDetail.status.confirmed}
              body={strings.urbanOrderDetail.status.confirmedBody}
              meta={strings.urbanOrderDetail.status.confirmedTime}
              state="complete"
              icon="check"
            />
            <OrderStatusTimelineRow
              title={strings.urbanOrderDetail.status.preparing}
              body={strings.urbanOrderDetail.status.preparingBody}
              meta={strings.urbanOrderDetail.status.inProgress}
              state="active"
              icon="restaurant"
            />
            <OrderStatusTimelineRow
              title={strings.urbanOrderDetail.status.ready}
              body={strings.urbanOrderDetail.status.readyBody}
              meta={strings.urbanOrderDetail.status.readyTime}
              state="pending"
              icon="shoppingBag"
              last
            />
          </View>
        </View>

        <View className="flex-row items-center justify-between gap-3 rounded-xl bg-surface-tint p-4 shadow-sm">
          <View className="min-w-0 flex-row items-center gap-3">
            <View className="h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary shadow-sm">
              <Icon name="pin" size={23} color={colors.surface} />
            </View>
            <View className="min-w-0">
              <VemtapText
                variant="caption"
                tone="secondary"
                className="font-sans-medium uppercase"
              >
                {strings.urbanOrderDetail.expressPass}
              </VemtapText>
              <VemtapText
                variant="displayMobile"
                className="text-display-mobile tracking-widest"
              >
                {strings.urbanOrderDetail.pickupPin}
              </VemtapText>
              <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                {strings.urbanOrderDetail.pickupHint}
              </VemtapText>
            </View>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={strings.urbanOrderDetail.copy}
            onPress={() => copy(strings.urbanOrderDetail.pickupPin)}
            className="h-10 shrink-0 flex-row items-center gap-1 rounded-lg bg-surface px-3 shadow-sm active:scale-95"
          >
            <Icon name="copy" size={17} color={colors.primary} />
            <VemtapText variant="button" tone="brand">
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
                  variant="headingSm"
                  numberOfLines={1}
                  className="min-w-0 flex-1"
                >
                  {strings.urbanProfile.name}
                </VemtapText>
                <Icon name="verified" size={18} color={colors.primary} />
              </View>
              <VemtapText variant="labelSm" tone="secondary" numberOfLines={2}>
                {strings.urbanOrderDetail.branch}
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
              <VemtapText variant="headingSm" className="font-sans-semibold">
                {strings.urbanOrderDetail.orderSummary}
              </VemtapText>
            </View>
            <VemtapText
              variant="labelSm"
              tone="secondary"
              className="rounded-full bg-surface-subtle px-2.5 py-1"
            >
              {strings.urbanOrderDetail.itemsCount}
            </VemtapText>
          </View>
          <View className="gap-4">
            {strings.urbanOrderDetail.items.map((item, index) => (
              <OrderLineItem
                key={item.name}
                image={{ uri: itemImages[index] }}
                title={item.name}
                description={item.description}
                price={item.price}
                quantity={1}
              />
            ))}
          </View>
          <View className="mt-4">
            <PriceBreakdown
              rows={[
                {
                  label: strings.urbanOrderDetail.subtotal,
                  value: strings.urbanOrderDetail.subtotalValue,
                },
                {
                  label: strings.urbanOrderDetail.promo,
                  value: strings.urbanOrderDetail.discountValue,
                  tone: 'success',
                },
                {
                  label: strings.urbanOrderDetail.fee,
                  value: strings.urbanOrderDetail.feeValue,
                },
              ]}
              totalLabel={strings.urbanOrderDetail.totalPaid}
              totalCaption={strings.urbanOrderDetail.visa}
              total={strings.urbanOrderDetail.totalValue}
            />
          </View>
        </View>

        <View className="rounded-xl bg-surface p-4 shadow-sm">
          <VemtapText variant="headingSm" className="font-sans-semibold">
            {strings.urbanOrderDetail.transaction}
          </VemtapText>
          <View className="mt-2 gap-1">
            {transactionRows.map(row => (
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
                <Pressable
                  accessibilityRole="button"
                  disabled={!row.copyable}
                  onPress={() => copy(row.value)}
                  className="min-w-0 flex-row items-center gap-1"
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
            ))}
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
      </ScrollView>
    </View>
  );
}

import React from 'react';
import { Pressable, View } from 'react-native';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { EmptyState } from '@components/shared/EmptyState';
import { ErrorState } from '@components/shared/ErrorState';
import { LoadingState } from '@components/shared/LoadingState';
import {
  BusinessChipScroller,
  BusinessCountChip,
} from '@features/business/components/BusinessOpsPrimitives';
import { BusinessTotalsRow } from '@features/business/components/BusinessPosPrimitives';
import {
  BusinessActionDock,
  BusinessScreenLayout,
  BusinessStatusPill,
} from '@features/business/components/BusinessPrimitives';

const copy = strings.merchantPosKitchenStream;

export type KitchenTab = 'new' | 'processing' | 'ready' | 'completed';
export type KitchenAction = 'accept' | 'ready' | 'complete' | 'reject';

export interface KitchenOrderView {
  id: string;
  reference: string;
  tableLabel: string;
  guest: string;
  guestPhone: string | null;
  elapsed: string;
  lines: { id: string; qty: string; name: string; price: string }[];
  note: string | null;
  total: string;
  paid: boolean;
}

export interface MerchantPosKitchenStreamView {
  branchLabel: string;
  counts: Record<KitchenTab, number>;
  orders: KitchenOrderView[];
  stats: { active: string; avgPrep: string; unpaid: string };
}

export interface MerchantPosKitchenStreamScreenProps {
  view?: MerchantPosKitchenStreamView;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  tab: KitchenTab;
  /** Order whose status change is in flight. */
  busyOrderId?: string | null;
  onBack?: () => void;
  onSelectTab?: (tab: KitchenTab) => void;
  onAction?: (orderId: string, action: KitchenAction) => void;
  onCallGuest?: (phone: string) => void;
  onReturnToRegister?: () => void;
}

const ACTIONS: Record<
  KitchenTab,
  { primary?: KitchenAction; secondary?: KitchenAction }
> = {
  new: { primary: 'accept', secondary: 'reject' },
  processing: { primary: 'ready', secondary: 'reject' },
  ready: { primary: 'complete' },
  completed: {},
};

/** Live kitchen board: today's orders by stage, with the next action on each ticket. */
export function MerchantPosKitchenStreamScreen({
  view,
  isLoading,
  isError,
  onRetry,
  tab,
  busyOrderId,
  onBack,
  onSelectTab,
  onAction,
  onCallGuest,
  onReturnToRegister,
}: MerchantPosKitchenStreamScreenProps) {
  const actions = ACTIONS[tab];
  return (
    <BusinessScreenLayout
      header={{ title: copy.headerTitle, subtitle: view?.branchLabel, onBack }}
      contentContainerClassName="pb-8"
      footer={
        view ? (
          <BusinessActionDock>
            <View className="flex-row gap-2">
              {[
                { label: copy.activeLabel, value: view.stats.active },
                { label: copy.avgPrepLabel, value: view.stats.avgPrep },
                { label: copy.unpaidLabel, value: view.stats.unpaid },
              ].map(stat => (
                <View
                  key={stat.label}
                  className="min-w-0 flex-1 items-center rounded-field bg-surface-subtle p-2"
                >
                  <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
                    {stat.label}
                  </VemtapText>
                  <VemtapText
                    variant="labelMd"
                    className="font-sans-bold"
                    numberOfLines={1}
                  >
                    {stat.value}
                  </VemtapText>
                </View>
              ))}
            </View>
            <Button
              label={copy.returnCta}
              labelVariant="labelSm"
              variant="secondary"
              onPress={onReturnToRegister}
            />
          </BusinessActionDock>
        ) : undefined
      }
    >
      {!view ? (
        isError ? (
          <ErrorState
            title={copy.error.title}
            description={copy.error.body}
            onRetry={onRetry}
          />
        ) : (
          <LoadingState label={isLoading ? copy.loading : undefined} />
        )
      ) : (
        <>
          <View className="flex-row items-center gap-1.5">
            <View className="h-2 w-2 rounded-full bg-success" />
            <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
              {copy.liveBadge(view.counts.new)}
            </VemtapText>
          </View>

          <BusinessChipScroller className="mt-3">
            {(['new', 'processing', 'ready', 'completed'] as const).map(id => (
              <BusinessCountChip
                key={id}
                label={copy.tabs[id]}
                count={String(view.counts[id])}
                selected={tab === id}
                onPress={() => onSelectTab?.(id)}
              />
            ))}
          </BusinessChipScroller>

          <View className="mt-3 gap-2.5">
            {view.orders.map(order => (
              <View
                key={order.id}
                className="gap-2 rounded-card bg-surface p-3 shadow-sm"
              >
                <View className="flex-row items-start justify-between gap-2">
                  <View className="min-w-0 flex-1">
                    <VemtapText
                      variant="labelMd"
                      className="font-sans-semibold"
                      numberOfLines={1}
                    >
                      {`${order.reference} • ${order.tableLabel}`}
                    </VemtapText>
                    <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
                      {order.guest}
                    </VemtapText>
                  </View>
                  <BusinessStatusPill
                    label={order.elapsed}
                    tone={tab === 'completed' ? 'neutral' : 'warning'}
                    icon="schedule"
                  />
                </View>
                <View className="gap-1">
                  {order.lines.map(line => (
                    <BusinessTotalsRow
                      key={line.id}
                      label={`${line.qty}× ${line.name}`}
                      value={line.price}
                    />
                  ))}
                </View>
                {order.note ? (
                  <View className="rounded-field bg-warning-container p-2">
                    <VemtapText variant="caption" numberOfLines={3}>
                      {order.note}
                    </VemtapText>
                  </View>
                ) : null}
                <View className="flex-row items-center justify-between gap-2">
                  <VemtapText
                    variant="labelMd"
                    className="font-sans-bold"
                    numberOfLines={1}
                  >
                    {order.total}
                  </VemtapText>
                  <BusinessStatusPill
                    label={order.paid ? copy.paidBadge : copy.unpaidBadge}
                    tone={order.paid ? 'success' : 'tertiary'}
                  />
                </View>
                <View className="flex-row gap-2">
                  {actions.primary ? (
                    <View className="min-w-0 flex-1">
                      <Button
                        label={copy.actions[actions.primary]}
                        size="sm"
                        labelVariant="labelSm"
                        loading={busyOrderId === order.id}
                        onPress={() =>
                          onAction?.(order.id, actions.primary as KitchenAction)
                        }
                      />
                    </View>
                  ) : null}
                  {actions.secondary ? (
                    <View className="min-w-0 flex-1">
                      <Button
                        label={copy.actions[actions.secondary]}
                        size="sm"
                        labelVariant="labelSm"
                        variant="secondary"
                        disabled={busyOrderId === order.id}
                        onPress={() =>
                          onAction?.(order.id, actions.secondary as KitchenAction)
                        }
                      />
                    </View>
                  ) : null}
                  {order.guestPhone ? (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={copy.callGuest}
                      onPress={() => order.guestPhone && onCallGuest?.(order.guestPhone)}
                      className="h-9 w-9 items-center justify-center rounded-lg bg-surface-container"
                    >
                      <Icon name="phone" size={16} color={colors.text} />
                    </Pressable>
                  ) : null}
                </View>
              </View>
            ))}
          </View>

          {view.orders.length === 0 ? (
            <EmptyState
              icon="roomService"
              variant="contained"
              title={copy.empty.title}
              description={copy.empty.body}
            />
          ) : null}
        </>
      )}
    </BusinessScreenLayout>
  );
}

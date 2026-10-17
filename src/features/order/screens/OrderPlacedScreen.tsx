import React, { useCallback } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { EmptyState } from '@components/shared/EmptyState';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { formatCurrency } from '@utils/formatters';
import type { AppStackParamList } from '@navigation/types';
import { NumberedInstructions } from '@features/order/components/OrderComponents';

cssInterop(Pressable, { className: 'style' });
cssInterop(ScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});
cssInterop(SafeAreaView, { className: 'style' });
cssInterop(View, { className: 'style' });

type Props = NativeStackScreenProps<AppStackParamList, 'OrderPlaced'>;

const copy = strings.orderPlaced;

/** Confirmation for the order the server just created, with its own total. */
export function OrderPlacedScreen({ route, navigation }: Props) {
  const insets = useSafeAreaInsets();
  const order = route.params;

  const goHome = useCallback(() => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Tabs', params: { screen: 'Home' } }],
    });
  }, [navigation]);

  const openOrder = useCallback(() => {
    navigation.navigate('Tabs', {
      screen: 'Account',
      params: { screen: 'OrderDetail', params: { orderId: order?.orderId } },
    });
  }, [navigation, order?.orderId]);

  const openOrders = useCallback(() => {
    navigation.navigate('Tabs', {
      screen: 'Account',
      params: { screen: 'OrdersBookings' },
    });
  }, [navigation]);

  const header = (
    <SafeAreaView edges={['top']} className="bg-surface">
      <View className="flex-row items-center justify-between px-6 py-3">
        <View className="h-10 w-10" />
        <VemtapText
          accessibilityRole="header"
          variant="headingSm"
          className="min-w-0 flex-1 text-center text-text"
        >
          {copy.headerTitle}
        </VemtapText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.close}
          onPress={goHome}
          className="h-10 w-10 items-center justify-center rounded-full bg-surface-container active:bg-surface-container-high"
        >
          <Icon name="close" size={20} color={colors.text} />
        </Pressable>
      </View>
    </SafeAreaView>
  );

  if (!order) {
    return (
      <View className="flex-1 bg-surface">
        {header}
        <EmptyState
          icon="receipt"
          title={strings.orderCheckout.empty.title}
          description={strings.orderCheckout.empty.body}
          actionLabel={copy.home}
          onAction={goHome}
          className="mt-16"
        />
      </View>
    );
  }

  const facts = [
    [copy.orderNumber, order.orderNumber],
    [copy.items, String(order.itemCount)],
    [copy.total, formatCurrency(order.total)],
    ...(order.branchName || order.businessName
      ? [
          [
            copy.branch,
            [order.businessName, order.branchName].filter(Boolean).join(' • '),
          ],
        ]
      : []),
  ];

  return (
    <View className="flex-1 bg-surface">
      {header}
      <ScrollView
        className="flex-1 bg-surface"
        contentContainerClassName="pb-48"
        showsVerticalScrollIndicator={false}
      >
        <View className="mx-auto w-full max-w-screen gap-6 px-6">
          <View className="items-center gap-3 pt-1">
            <View className="h-24 w-24 items-center justify-center rounded-full bg-surface-tint">
              <View className="h-20 w-20 items-center justify-center rounded-full bg-success-container shadow-md">
                <Icon name="checkCircle" size={36} color={colors.badgeDiscountText} />
              </View>
            </View>
            <VemtapText
              variant="headingXl"
              className="text-center text-heading-xl text-text"
            >
              {copy.title}
            </VemtapText>
            <VemtapText variant="bodyMd" tone="secondary" className="text-center">
              {copy.body(order.businessName ?? '')}
            </VemtapText>
          </View>

          <View className="gap-2 rounded-field bg-surface p-4 shadow-sm">
            {facts.map(([label, value]) => (
              <View key={label} className="flex-row items-center justify-between gap-3">
                <VemtapText variant="labelSm" tone="secondary">
                  {label}
                </VemtapText>
                <VemtapText
                  variant="labelMd"
                  className="min-w-0 shrink text-right font-sans-semibold text-text"
                  numberOfLines={1}
                >
                  {value}
                </VemtapText>
              </View>
            ))}
          </View>

          <View className="gap-3">
            <VemtapText variant="headingSm" className="text-text">
              {copy.stepsTitle}
            </VemtapText>
            <NumberedInstructions items={[...copy.steps]} />
          </View>
        </View>
      </ScrollView>

      <View
        className="gap-2 bg-surface px-6 pt-3 shadow-xl"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
      >
        <View className="mx-auto w-full max-w-screen gap-2">
          <Button label={copy.viewOrder} onPress={openOrder} />
          <Button label={copy.allOrders} variant="secondary" onPress={openOrders} />
        </View>
      </View>
    </View>
  );
}

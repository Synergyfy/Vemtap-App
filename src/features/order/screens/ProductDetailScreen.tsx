import React, { useCallback, useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { cssInterop } from 'nativewind';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RegistrationHeader } from '@components/auth/RegistrationHeader';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import type { AppStackParamList } from '@navigation/types';
import { orderImages } from '@features/order/orderData';
import {
  QuantityStepper,
  SelectionRow,
} from '@features/order/components/OrderComponents';

cssInterop(Pressable, { className: 'style' });
cssInterop(ScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});
cssInterop(SafeAreaView, { className: 'style' });
cssInterop(TextInput, { className: 'style' });
cssInterop(View, { className: 'style' });

type Props = NativeStackScreenProps<AppStackParamList, 'ProductDetail'>;

const temperatureOptions = [
  {
    id: 'medium-rare',
    title: strings.productOrder.mediumRare,
    body: strings.productOrder.mediumRareBody,
  },
  {
    id: 'medium',
    title: strings.productOrder.medium,
    body: strings.productOrder.mediumBody,
  },
  {
    id: 'medium-well',
    title: strings.productOrder.mediumWell,
    body: strings.productOrder.mediumWellBody,
  },
  {
    id: 'well-done',
    title: strings.productOrder.wellDone,
    body: strings.productOrder.wellDoneBody,
  },
] as const;

const sideOptions = [
  { id: 'truffle-wedges', title: strings.productOrder.truffleWedges },
  { id: 'jollof', title: strings.productOrder.jollof },
  { id: 'mashed-potatoes', title: strings.productOrder.mashedPotatoes },
  { id: 'vegetables', title: strings.productOrder.vegetables },
] as const;

const addonOptions = [
  { id: 'garlic-butter', title: strings.productOrder.garlicButter, price: 800 },
  { id: 'peppercorn-sauce', title: strings.productOrder.peppercornSauce, price: 1200 },
  { id: 'tiger-prawn', title: strings.productOrder.prawn, price: 3500 },
] as const;

const formatNaira = (amount: number) => `₦${amount.toLocaleString('en-US')}`;

export function ProductDetailScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [saved, setSaved] = useState(false);
  const [temperature, setTemperature] =
    useState<(typeof temperatureOptions)[number]['id']>('medium-rare');
  const [side, setSide] = useState<(typeof sideOptions)[number]['id']>('truffle-wedges');
  const [addons, setAddons] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [instructions, setInstructions] = useState('');

  const addonsTotal = useMemo(
    () =>
      addonOptions
        .filter(option => addons.includes(option.id))
        .reduce((sum, option) => sum + option.price, 0),
    [addons],
  );
  const total = (14000 + addonsTotal) * quantity;
  const selectedTemperature =
    temperatureOptions.find(option => option.id === temperature)?.title ?? '';
  const selectedSide = sideOptions.find(option => option.id === side)?.title ?? '';

  const handleShare = useCallback(() => {
    Share.share({ message: 'https://vemtap.com/orders/woodfire-aged-ribeye' }).catch(
      () => undefined,
    );
  }, []);

  const handleAddToOrder = useCallback(() => {
    navigation.navigate('OrderCheckout', {
      draft: {
        quantity,
        temperature: selectedTemperature,
        side: selectedSide,
        addons,
        instructions,
        unitPrice: 14000 + addonsTotal,
        total,
      },
    });
  }, [
    addons,
    addonsTotal,
    instructions,
    navigation,
    quantity,
    selectedSide,
    selectedTemperature,
    total,
  ]);

  const toggleAddon = useCallback((id: string) => {
    setAddons(current =>
      current.includes(id) ? current.filter(item => item !== id) : [...current, id],
    );
  }, []);

  return (
    <View className="flex-1 bg-surface">
      <SafeAreaView edges={['top']} className="bg-surface">
        <RegistrationHeader
          title={strings.productOrder.dealDetail}
          onBack={navigation.goBack}
          showShareAction
          onShare={handleShare}
        />
      </SafeAreaView>

      <ScrollView
        className="flex-1 bg-surface"
        contentContainerClassName="pb-40"
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full max-w-screen self-center">
          <View className="relative aspect-[4/3] overflow-hidden bg-surface-container-low">
            <Image
              source={{ uri: orderImages.steak }}
              className="h-full w-full"
              resizeMode="cover"
            />
            <View style={styles.heroScrim} />
            <View className="absolute inset-x-4 top-4 flex-row items-center justify-between">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={strings.productOrder.back}
                onPress={navigation.goBack}
                className="h-10 w-10 items-center justify-center rounded-full bg-surface shadow-md active:scale-90"
              >
                <Icon name="back" size={20} color={colors.text} />
              </Pressable>
              <View className="flex-row gap-2">
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={strings.productOrder.share}
                  onPress={handleShare}
                  className="h-10 w-10 items-center justify-center rounded-full bg-surface shadow-md"
                >
                  <Icon name="share" size={20} color={colors.text} />
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={strings.productOrder.save}
                  accessibilityState={{ selected: saved }}
                  onPress={() => setSaved(value => !value)}
                  className="h-10 w-10 items-center justify-center rounded-full bg-surface shadow-md"
                >
                  <Icon
                    name={saved ? 'favoriteFilled' : 'favorite'}
                    size={20}
                    color={saved ? colors.tertiaryContainer : colors.text}
                  />
                </Pressable>
              </View>
            </View>
            <View className="absolute inset-x-4 bottom-4 flex-row items-end justify-between gap-3">
              <View className="flex-row flex-wrap gap-2">
                <View className="flex-row items-center gap-1 rounded-full bg-success-container px-2.5 py-1 shadow-sm">
                  <Icon name="localOffer" size={14} color={colors.badgeDiscountText} />
                  <VemtapText
                    variant="caption"
                    className="font-sans-semibold text-success"
                  >
                    {strings.productOrder.voucher}
                  </VemtapText>
                </View>
                <View className="flex-row items-center gap-1 rounded-full bg-tertiary-container px-2.5 py-1 shadow-sm">
                  <Icon name="fire" size={14} color={colors.surface} />
                  <VemtapText variant="caption" tone="inverse">
                    {strings.productOrder.bestSeller}
                  </VemtapText>
                </View>
              </View>
              <View className="rounded-full bg-inverse-surface/80 px-2.5 py-1">
                <VemtapText variant="caption" tone="inverse">
                  {strings.productOrder.imageCount}
                </VemtapText>
              </View>
            </View>
          </View>

          <View className="px-6 pt-4">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${strings.productOrder.merchant}, ${strings.productOrder.merchantLocation}`}
              className="inline-flex max-w-full flex-row items-center gap-1.5 self-start rounded-full bg-surface-container-high px-3 py-1.5 active:bg-secondary-fixed"
            >
              <Icon name="storefront" size={16} color={colors.primary} />
              <VemtapText variant="labelMd" className="shrink font-sans-medium text-text">
                {strings.productOrder.merchant}
              </VemtapText>
              <VemtapText variant="labelSm" tone="secondary">
                •
              </VemtapText>
              <VemtapText
                variant="labelSm"
                tone="secondary"
                className="min-w-0 flex-1"
                numberOfLines={1}
              >
                {strings.productOrder.merchantLocation}
              </VemtapText>
              <Icon name="forward" size={16} color={colors.textTertiary} />
            </Pressable>

            <VemtapText
              accessibilityRole="header"
              variant="headingXl"
              className="mt-4 text-heading-xl text-text"
            >
              {strings.productOrder.title}
            </VemtapText>
            <View className="mt-1 flex-row flex-wrap items-center gap-2">
              <View className="flex-row items-center gap-1">
                <Icon name="star" size={18} color={colors.tertiaryContainer} />
                <VemtapText variant="labelMd" className="font-sans-semibold text-text">
                  {strings.productOrder.rating}
                </VemtapText>
              </View>
              <VemtapText tone="tertiary">•</VemtapText>
              <VemtapText variant="labelSm" tone="secondary">
                {strings.productOrder.reviews}
              </VemtapText>
              <VemtapText tone="tertiary">•</VemtapText>
              <View className="flex-row items-center gap-1">
                <Icon name="thumbUp" size={15} color={colors.badgeDiscountText} />
                <VemtapText variant="labelSm" className="text-success">
                  {strings.productOrder.recommend}
                </VemtapText>
              </View>
            </View>

            <View className="mt-3 flex-row flex-wrap items-baseline gap-2">
              <VemtapText className="font-sans-bold text-display-mobile text-text">
                {strings.productOrder.price}
              </VemtapText>
              <VemtapText variant="headingSm" tone="tertiary" className="line-through">
                {strings.productOrder.originalPrice}
              </VemtapText>
              <View className="rounded-full bg-success-container px-2.5 py-0.5">
                <VemtapText variant="labelSm" className="font-sans-bold text-success">
                  {strings.productOrder.savings}
                </VemtapText>
              </View>
            </View>

            <View className="mt-3 flex-row flex-wrap items-center gap-2 rounded-field bg-surface-container-low px-3 py-2">
              <View className="h-2.5 w-2.5 rounded-full bg-success" />
              <VemtapText variant="labelSm" className="font-sans-medium text-text">
                {strings.productOrder.available}
              </VemtapText>
              <VemtapText tone="tertiary">•</VemtapText>
              <View className="flex-row items-center gap-1">
                <Icon name="schedule" size={15} color={colors.textSecondary} />
                <VemtapText variant="labelSm" tone="secondary">
                  {strings.productOrder.preparation}
                </VemtapText>
              </View>
            </View>

            <View className="mt-4 flex-row items-start gap-3 rounded-card bg-surface-tint p-4 shadow-sm">
              <View className="h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-container">
                <Icon name="verified" size={18} color={colors.surface} />
              </View>
              <View className="min-w-0 flex-1">
                <VemtapText variant="labelMd" className="font-sans-semibold text-text">
                  {strings.productOrder.dealApplied}
                </VemtapText>
                <VemtapText
                  variant="caption"
                  tone="secondary"
                  className="mt-0.5 leading-relaxed"
                >
                  {strings.productOrder.dealAppliedBody}
                </VemtapText>
              </View>
            </View>

            <View className="mt-4 gap-2">
              <VemtapText variant="headingSm" className="text-text">
                {strings.productOrder.descriptionTitle}
              </VemtapText>
              <VemtapText variant="bodyMd" tone="secondary" className="leading-relaxed">
                {strings.productOrder.description}
              </VemtapText>
            </View>

            <View className="mt-4 gap-3 rounded-card bg-surface p-4 shadow-sm">
              <View className="flex-row items-center gap-2">
                <Icon name="info" size={20} color={colors.primary} />
                <VemtapText variant="labelMd" className="font-sans-semibold text-text">
                  {strings.productOrder.prepTitle}
                </VemtapText>
              </View>
              <View className="flex-row flex-wrap gap-2">
                {[strings.productOrder.halal, strings.productOrder.glutenFree].map(
                  item => (
                    <View
                      key={item}
                      className="min-w-[45%] flex-row items-center gap-1.5"
                    >
                      <Icon
                        name="checkCircle"
                        size={16}
                        color={colors.badgeDiscountText}
                      />
                      <VemtapText variant="caption" tone="secondary">
                        {item}
                      </VemtapText>
                    </View>
                  ),
                )}
                <View className="w-full flex-row items-center gap-1.5">
                  <Icon name="info" size={16} color={colors.tertiaryContainer} />
                  <VemtapText variant="caption" tone="secondary">
                    {strings.productOrder.dairy}
                  </VemtapText>
                </View>
              </View>
            </View>

            <View className="mt-5 gap-2">
              <View className="flex-row items-center justify-between">
                <VemtapText variant="headingSm" className="text-text">
                  {strings.productOrder.temperatureTitle}
                </VemtapText>
                <View className="rounded-full bg-secondary-fixed px-2 py-0.5">
                  <VemtapText
                    variant="caption"
                    className="text-on-secondary-fixed font-sans-semibold uppercase"
                  >
                    {strings.productOrder.required}
                  </VemtapText>
                </View>
              </View>
              {temperatureOptions.map(option => (
                <SelectionRow
                  key={option.id}
                  title={option.title}
                  description={option.body}
                  selected={temperature === option.id}
                  onPress={() => setTemperature(option.id)}
                />
              ))}
            </View>

            <View className="mt-5 gap-2">
              <View className="flex-row items-center justify-between gap-3">
                <VemtapText variant="headingSm" className="text-text">
                  {strings.productOrder.sideTitle}
                </VemtapText>
                <VemtapText variant="caption" tone="secondary">
                  {strings.productOrder.included}
                </VemtapText>
              </View>
              {sideOptions.map(option => (
                <SelectionRow
                  key={option.id}
                  title={option.title}
                  selected={side === option.id}
                  onPress={() => setSide(option.id)}
                />
              ))}
            </View>

            <View className="mt-5 gap-2">
              <View className="flex-row items-center justify-between">
                <VemtapText variant="headingSm" className="min-w-0 flex-1 text-text">
                  {strings.productOrder.toppingsTitle}
                </VemtapText>
                <VemtapText variant="caption" tone="secondary">
                  {strings.productOrder.optional}
                </VemtapText>
              </View>
              {addonOptions.map(option => (
                <SelectionRow
                  key={option.id}
                  title={option.title}
                  value={`+${formatNaira(option.price)}`}
                  selected={addons.includes(option.id)}
                  multiple
                  onPress={() => toggleAddon(option.id)}
                />
              ))}
            </View>

            <View className="mt-5 gap-2">
              <VemtapText variant="headingSm" className="text-text">
                {strings.productOrder.instructionsTitle}
              </VemtapText>
              <View className="rounded-card bg-surface p-3 shadow-sm">
                <TextInput
                  accessibilityLabel={strings.productOrder.instructionsTitle}
                  value={instructions}
                  onChangeText={setInstructions}
                  placeholder={strings.productOrder.instructionsPlaceholder}
                  placeholderTextColor={colors.textTertiary}
                  multiline
                  className="min-h-[88px] p-0 text-body-md text-text"
                />
              </View>
            </View>

            <View className="mt-4 flex-row items-center justify-between gap-3 rounded-card bg-surface p-4 shadow-sm">
              <VemtapText variant="labelMd" className="font-sans-semibold text-text">
                {strings.productOrder.quantity}
              </VemtapText>
              <QuantityStepper value={quantity} onChange={setQuantity} />
            </View>
          </View>
        </View>
      </ScrollView>

      <View
        className="bg-surface px-6 pt-3 shadow-xl"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
      >
        <View className="mx-auto w-full max-w-screen flex-row items-center gap-3">
          <View className="shrink-0">
            <VemtapText variant="caption" tone="secondary">
              {strings.productOrder.totalPrice}
            </VemtapText>
            <VemtapText variant="headingMd" className="font-sans-bold text-text">
              {formatNaira(total)}
            </VemtapText>
          </View>
          <View className="min-w-0 flex-1">
            <Button
              label={strings.productOrder.addToOrder(formatNaira(total))}
              leftIcon={<Icon name="shoppingBag" size={20} color={colors.surface} />}
              onPress={handleAddToOrder}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  heroScrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(17, 24, 39, 0.10)',
  },
});

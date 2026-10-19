import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, TextInput, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RegistrationHeader } from '@components/auth/RegistrationHeader';
import { ErrorState } from '@components/shared/ErrorState';
import { LoadingState } from '@components/shared/LoadingState';
import { HeroImageGallery } from '@components/shared/HeroImageGallery';
import { LikeButton } from '@components/shared/LikeButton';
import { useCatalogueItemLike } from '@features/order/hooks/useCatalogueItemLike';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { formatCurrency } from '@utils/formatters';
import type { AppStackParamList } from '@navigation/types';
import { useAuthStore } from '@store/authStore';
import { QuantityStepper } from '@features/order/components/OrderComponents';
import { ProductCommentsSheet } from '@features/order/components/ProductCommentsSheet';
import { useProductItem } from '@features/order/hooks/useProductItem';
import { useProductComments } from '@features/order/hooks/useProductComments';
import {
  toProductCommentView,
  toProductDetailView,
  toProductRatingView,
} from '@features/order/utils/productDetailMapper';

cssInterop(Pressable, { className: 'style' });
cssInterop(ScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});
cssInterop(SafeAreaView, { className: 'style' });
cssInterop(TextInput, { className: 'style' });
cssInterop(View, { className: 'style' });

type Props = NativeStackScreenProps<AppStackParamList, 'ProductDetail'>;

const copy = strings.productDetail;

const STOCK_DOT = {
  success: 'bg-success',
  warning: 'bg-warning',
  error: 'bg-error',
} as const;

/**
 * One catalogue product (`GET /public/catalogue/items/:id`, priced for the
 * branch when the route carries one), with its comments and rating from
 * `GET /public/catalogue/items/:id/comments`.
 */
export function ProductDetailScreen({ navigation, route }: Props) {
  const { productId, branchId, businessName, branchName } = route.params;
  const insets = useSafeAreaInsets();
  const signedIn = useAuthStore(state => state.status === 'authenticated');
  const item = useProductItem(productId, branchId);
  const comments = useProductComments(productId);
  const like = useCatalogueItemLike(productId);
  const [quantity, setQuantity] = useState(1);
  const [instructions, setInstructions] = useState('');
  const [commentsOpen, setCommentsOpen] = useState(false);

  const view = useMemo(
    () => (item.data ? toProductDetailView(item.data) : null),
    [item.data],
  );
  const rating = toProductRatingView(comments.data);
  const preview = (comments.data?.comments ?? []).slice(0, 2).map(toProductCommentView);
  const total = (view?.unitPrice ?? 0) * quantity;
  const merchantLine = [businessName, branchName].filter(Boolean).join(' • ');

  const handleShare = useCallback(() => {
    if (!view) return;
    Share.share({ message: copy.shareMessage(view.name, businessName ?? '') }).catch(
      () => undefined,
    );
  }, [businessName, view]);

  /**
   * The branch the order goes to: the one the route came from, else the
   * item's main (or first active) branch — Home opens products with no branch.
   */
  const orderBranch = useMemo(() => {
    const branches = (item.data?.branches ?? []).filter(b => b.isActive !== false);
    const fromRoute = branchId ? branches.find(b => b.id === branchId) : undefined;
    if (branchId) return { id: branchId, name: fromRoute?.name ?? branchName };
    const fallback = branches.find(b => b.isMainBranch) ?? branches[0];
    return fallback ? { id: fallback.id, name: fallback.name ?? undefined } : null;
  }, [branchId, branchName, item.data?.branches]);

  const handleAddToOrder = useCallback(() => {
    if (!view || !orderBranch) return;
    navigation.navigate('OrderCheckout', {
      draft: {
        branchId: orderBranch.id,
        businessName,
        branchName: orderBranch.name ?? undefined,
        items: [
          {
            itemId: view.id,
            name: view.name,
            image: view.images[0] ?? null,
            unitPrice: view.unitPrice,
            quantity,
          },
        ],
        instructions,
      },
    });
  }, [businessName, instructions, navigation, orderBranch, quantity, view]);

  if (!view) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-surface">
        <RegistrationHeader title={copy.headerTitle} onBack={navigation.goBack} />
        {item.isError ? (
          <ErrorState
            title={copy.error.title}
            description={copy.error.body}
            onRetry={() => item.refetch()}
          />
        ) : (
          <LoadingState label={copy.loading} />
        )}
      </SafeAreaView>
    );
  }

  const galleryImages = view.images.map(uri => ({ uri }));

  return (
    <View className="flex-1 bg-surface">
      <SafeAreaView edges={['top']} className="bg-surface">
        <RegistrationHeader
          title={copy.headerTitle}
          onBack={navigation.goBack}
          showShareAction
          onShare={handleShare}
        />
      </SafeAreaView>

      <ScrollView
        className="flex-1 bg-surface"
        contentContainerClassName="pb-40"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="w-full max-w-screen self-center">
          <View className="relative aspect-[4/3] overflow-hidden bg-surface-container-low">
            {view.images.length > 0 ? (
              // One photo stays a plain image; several swipe, with dots.
              <HeroImageGallery
                images={galleryImages}
                accessibilityLabel={view.name}
                onDoubleTap={like.like}
                testID="product-hero-gallery"
              />
            ) : (
              <View className="h-full w-full items-center justify-center">
                <Icon name="shoppingBag" size={48} color={colors.textTertiary} />
              </View>
            )}
            <View pointerEvents="none" style={styles.heroScrim} />
            <View
              pointerEvents="box-none"
              className="absolute inset-x-4 bottom-4 flex-row items-end justify-between gap-3"
            >
              {view.discountLabel ? (
                <View className="flex-row items-center gap-1 rounded-full bg-success-container px-2.5 py-1 shadow-sm">
                  <Icon name="localOffer" size={14} color={colors.badgeDiscountText} />
                  <VemtapText
                    variant="caption"
                    className="font-sans-semibold text-success"
                  >
                    {view.discountLabel}
                  </VemtapText>
                </View>
              ) : (
                <View />
              )}
            </View>
          </View>

          <View className="px-6 pt-4">
            {merchantLine ? (
              <View className="max-w-full flex-row items-center gap-1.5 self-start rounded-full bg-surface-container-high px-3 py-1.5">
                <Icon name="storefront" size={16} color={colors.primary} />
                <VemtapText
                  variant="labelMd"
                  className="shrink font-sans-medium text-text"
                  numberOfLines={1}
                >
                  {merchantLine}
                </VemtapText>
              </View>
            ) : null}

            <VemtapText
              accessibilityRole="header"
              variant="headingXl"
              className="mt-4 text-heading-xl text-text"
            >
              {view.name}
            </VemtapText>

            <View className="mt-1 flex-row flex-wrap items-center gap-4">
              <LikeButton
                liked={like.liked}
                likesCount={like.likesCount}
                onToggle={like.toggle}
                accessibilityLabel={view.name}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${rating.ratingLabel}, ${rating.commentLabel}`}
                onPress={() => setCommentsOpen(true)}
                className="flex-row flex-wrap items-center gap-2 self-start"
              >
                <View className="flex-row items-center gap-1">
                  <Icon name="star" size={18} color={colors.tertiaryContainer} />
                  <VemtapText variant="labelMd" className="font-sans-semibold text-text">
                    {rating.score ?? rating.ratingLabel}
                  </VemtapText>
                </View>
                {rating.score ? (
                  <>
                    <VemtapText tone="tertiary">•</VemtapText>
                    <VemtapText variant="labelSm" tone="secondary">
                      {rating.ratingLabel}
                    </VemtapText>
                  </>
                ) : null}
                <VemtapText tone="tertiary">•</VemtapText>
                <VemtapText variant="labelSm" tone="brand">
                  {rating.commentLabel}
                </VemtapText>
              </Pressable>
            </View>

            <View className="mt-3 flex-row flex-wrap items-baseline gap-2">
              <VemtapText className="font-sans-bold text-display-mobile text-text">
                {view.price}
              </VemtapText>
              {view.wasPrice ? (
                <VemtapText variant="headingSm" tone="tertiary" className="line-through">
                  {view.wasPrice}
                </VemtapText>
              ) : null}
            </View>

            <View className="mt-3 flex-row flex-wrap items-center gap-2 self-start rounded-field bg-surface-container-low px-3 py-2">
              <View
                className={`h-2.5 w-2.5 rounded-full ${STOCK_DOT[view.stock.tone]}`}
              />
              <VemtapText variant="labelSm" className="font-sans-medium text-text">
                {view.stock.label}
              </VemtapText>
              {view.category ? (
                <>
                  <VemtapText tone="tertiary">•</VemtapText>
                  <VemtapText variant="labelSm" tone="secondary">
                    {view.category}
                  </VemtapText>
                </>
              ) : null}
            </View>

            <View className="mt-4 gap-2">
              <VemtapText variant="headingSm" className="text-text">
                {copy.descriptionTitle}
              </VemtapText>
              <VemtapText variant="bodyMd" tone="secondary" className="leading-relaxed">
                {view.description}
              </VemtapText>
            </View>

            <View className="mt-5 gap-3 rounded-card bg-surface p-4 shadow-sm">
              <View className="flex-row items-center justify-between gap-2">
                <VemtapText variant="headingSm" className="text-text">
                  {copy.commentsTitle}
                </VemtapText>
                <VemtapText variant="caption" tone="secondary">
                  {rating.commentLabel}
                </VemtapText>
              </View>
              {preview.map(comment => (
                <View key={comment.id} className="gap-0.5">
                  <VemtapText
                    variant="labelSm"
                    className="font-sans-semibold text-text"
                    numberOfLines={1}
                  >
                    {comment.author}
                  </VemtapText>
                  <VemtapText variant="caption" tone="secondary" numberOfLines={2}>
                    {comment.body}
                  </VemtapText>
                </View>
              ))}
              <Button
                label={preview.length ? copy.seeAllComments : copy.addComment}
                variant="secondary"
                leftIcon={<Icon name="rateReview" size={18} color={colors.primary} />}
                onPress={() => setCommentsOpen(true)}
              />
            </View>

            <View className="mt-5 gap-2">
              <VemtapText variant="headingSm" className="text-text">
                {copy.instructionsTitle}
              </VemtapText>
              <View className="rounded-card bg-surface p-3 shadow-sm">
                <TextInput
                  accessibilityLabel={copy.instructionsTitle}
                  value={instructions}
                  onChangeText={setInstructions}
                  placeholder={copy.instructionsPlaceholder}
                  placeholderTextColor={colors.textTertiary}
                  multiline
                  className="min-h-[88px] p-0 text-body-md text-text"
                />
              </View>
            </View>

            <View className="mt-4 flex-row items-center justify-between gap-3 rounded-card bg-surface p-4 shadow-sm">
              <VemtapText variant="labelMd" className="font-sans-semibold text-text">
                {copy.quantity}
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
              {copy.totalPrice}
            </VemtapText>
            <VemtapText variant="headingMd" className="font-sans-bold text-text">
              {formatCurrency(total)}
            </VemtapText>
          </View>
          <View className="min-w-0 flex-1">
            <Button
              label={
                view.canOrder ? copy.addToOrder(formatCurrency(total)) : copy.outOfStock
              }
              leftIcon={<Icon name="shoppingBag" size={20} color={colors.surface} />}
              disabled={!view.canOrder || !orderBranch}
              onPress={handleAddToOrder}
            />
          </View>
        </View>
      </View>

      <ProductCommentsSheet
        visible={commentsOpen}
        onClose={() => setCommentsOpen(false)}
        itemId={view.id}
        productName={view.name}
        businessName={businessName}
        canComment={signedIn}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  heroScrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(17, 24, 39, 0.10)',
  },
});

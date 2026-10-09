import React, { useCallback, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Avatar } from '@components/ui/Avatar';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { Button } from '@components/ui/Button';
import {
  DealShareSheet,
  DealTermsRow,
  DealTermsSection,
} from '@features/dealDetail/components';
import { colors } from '@theme/colors';
import { navbarBottomShadow, tabBarTopShadow } from '@theme/shadows';
import { strings } from '@constants/strings';
import { dealsGrid } from '@features/deals/data/dealsFeed';
import type { AppStackParamList } from '@navigation/types';

cssInterop(View, { className: 'style' });
cssInterop(Pressable, { className: 'style' });
cssInterop(ScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});
cssInterop(SafeAreaView, { className: 'style' });

type Props = NativeStackScreenProps<AppStackParamList, 'DealTermsConditions'>;

export function DealTermsConditionsScreen({ route, navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [faqOpen, setFaqOpen] = useState(false);
  const [shareVisible, setShareVisible] = useState(false);
  const deal = dealsGrid.find(item => item.id === route.params.dealId) ?? dealsGrid[0];

  const handleClaim = useCallback(() => {
    navigation.navigate('HowToClaim', { dealId: deal.id });
  }, [deal.id, navigation]);

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView edges={['top']} className="bg-surface">
        <View
          className="h-14 flex-row items-center justify-between px-6"
          style={navbarBottomShadow}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={strings.dealTerms.back}
            onPress={() => navigation.goBack()}
            className="-ml-2 h-11 w-11 items-center justify-center rounded-full active:bg-surface-container-high"
          >
            <Icon name="back" size={24} color={colors.text} />
          </Pressable>
          <VemtapText
            accessibilityRole="header"
            variant="headingSm"
            className="min-w-0 flex-1 px-2 text-center text-text"
            numberOfLines={1}
          >
            {strings.dealTerms.title}
          </VemtapText>
          <View className="flex-row items-center justify-end gap-2">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={strings.dealTerms.share}
              onPress={() => setShareVisible(true)}
              className="h-11 w-11 items-center justify-center rounded-full active:bg-surface-container-high"
            >
              <Icon name="share" size={22} color={colors.textSecondary} />
            </Pressable>
            <Avatar name={strings.dealTerms.merchant} size="sm" tone="brand" />
          </View>
        </View>
      </SafeAreaView>

      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-36"
        showsVerticalScrollIndicator={false}
      >
        <View className="mt-4 px-6">
          <View className="flex-row items-center gap-3 rounded-xl bg-surface-canvas p-3 shadow-sm">
            <View className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-surface-container">
              <Image source={deal.image} className="h-full w-full" resizeMode="cover" />
              <View className="absolute left-1 top-1 flex-row items-center gap-0.5 rounded-full bg-badge-discount-bg px-1.5 py-0.5 shadow-sm">
                <Icon name="bolt" size={11} color={colors.badgeDiscountText} />
                <VemtapText className="font-sans-semibold text-caption text-badge-discount-text">
                  {strings.dealTerms.discount}
                </VemtapText>
              </View>
            </View>
            <View className="min-w-0 flex-1">
              <View className="flex-row items-center gap-1 text-text-tertiary">
                <Icon name="storefront" size={14} color={colors.textTertiary} />
                <VemtapText className="text-caption text-text-tertiary" numberOfLines={1}>
                  {strings.dealTerms.merchant}
                </VemtapText>
              </View>
              <VemtapText
                variant="headingSm"
                className="mt-0.5 text-text"
                numberOfLines={1}
              >
                {strings.dealTerms.dealTitle}
              </VemtapText>
              <View className="mt-1 flex-row flex-wrap items-baseline gap-x-1.5">
                <VemtapText className="font-sans-bold text-heading-sm text-primary">
                  {strings.dealTerms.price}
                </VemtapText>
                <VemtapText className="text-caption text-text-tertiary line-through">
                  {strings.dealTerms.priceWas}
                </VemtapText>
                <View className="ml-auto flex-row items-center gap-1 rounded-full bg-surface-tint-blue px-2 py-0.5">
                  <Icon name="verified" size={12} color={colors.primary} />
                  <VemtapText className="text-caption text-primary">
                    {strings.dealTerms.vetted}
                  </VemtapText>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View className="mx-6 mt-4 flex-row items-center justify-between rounded-xl bg-surface-container-low p-3">
          <View className="min-w-0 flex-row items-center gap-2">
            <View className="h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary-container">
              <Icon name="verifiedUser" size={18} color={colors.onSecondaryContainer} />
            </View>
            <View className="min-w-0">
              <VemtapText className="text-label-md text-text">
                {strings.dealTerms.policyTitle}
              </VemtapText>
              <VemtapText className="text-caption text-text-secondary">
                {strings.dealTerms.policyBody}
              </VemtapText>
            </View>
          </View>
          <View className="ml-2 shrink-0 rounded-full bg-surface-container-highest px-2.5 py-1">
            <VemtapText className="text-caption text-secondary">
              {strings.dealTerms.readTime}
            </VemtapText>
          </View>
        </View>

        <DealTermsSection icon="schedule" title={strings.dealTerms.validityTitle} compact>
          <DealTermsRow
            icon="eventAvailable"
            supportingText={strings.dealTerms.validitySecondary}
          >
            {strings.dealTerms.validityPrefix}
            <VemtapText className="font-sans-medium text-label-md text-primary">
              {strings.dealTerms.validityDate}
            </VemtapText>
            {strings.dealTerms.validitySuffix}
          </DealTermsRow>
          <DealTermsRow icon="schedule" supportingText={strings.dealTerms.kitchenCutoff}>
            {strings.dealTerms.redeemablePrefix}
            <VemtapText className="font-sans-medium text-label-md text-text">
              {strings.dealTerms.redeemableWindow}
            </VemtapText>
            {strings.dealTerms.redeemableDays}
          </DealTermsRow>
        </DealTermsSection>

        <DealTermsSection icon="rule" title={strings.dealTerms.redemptionTitle}>
          <DealTermsRow icon="person">{strings.dealTerms.redemptionOne}</DealTermsRow>
          <DealTermsRow
            icon="locationOn"
            supportingText={strings.dealTerms.redemptionLocationNote}
          >
            {strings.dealTerms.locationPrefix}
            <VemtapText className="font-sans-medium text-label-md text-text">
              {strings.dealTerms.merchantName}
            </VemtapText>
            {strings.dealTerms.locationSuffix}
          </DealTermsRow>
          <DealTermsRow icon="qrScan">
            {strings.dealTerms.confirmationPrefix}
            <VemtapText className="font-sans-medium text-label-md text-text">
              {strings.dealTerms.confirmationEmphasis}
            </VemtapText>
            {strings.dealTerms.confirmationSuffix}
          </DealTermsRow>
          <DealTermsRow icon="roomService">
            {strings.dealTerms.fulfilmentPrefix}
            <VemtapText className="font-sans-medium text-label-md text-text">
              {strings.dealTerms.fulfilmentEmphasis}
            </VemtapText>
            {strings.dealTerms.fulfilmentSuffix}
          </DealTermsRow>
        </DealTermsSection>

        <DealTermsSection icon="block" title={strings.dealTerms.exclusionsTitle}>
          <DealTermsRow icon="doNotDisturb">
            {strings.dealTerms.exclusionsOne}
          </DealTermsRow>
          <DealTermsRow icon="inventory">{strings.dealTerms.exclusionsTwo}</DealTermsRow>
        </DealTermsSection>

        <View className="mt-6 px-6">
          <View className="rounded-xl bg-surface-container-low p-4">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={strings.dealTerms.faqQuestion}
              accessibilityState={{ expanded: faqOpen }}
              onPress={() => setFaqOpen(value => !value)}
              className="min-h-6 flex-row items-center justify-between"
            >
              <View className="min-w-0 flex-row items-center gap-2">
                <Icon name="help" size={20} color={colors.secondary} />
                <VemtapText className="min-w-0 flex-1 text-label-md text-text">
                  {strings.dealTerms.faqQuestion}
                </VemtapText>
              </View>
              <Icon
                name="expandMore"
                size={20}
                color={colors.textTertiary}
                style={faqOpen ? styles.chevronOpen : undefined}
              />
            </Pressable>
            {faqOpen ? (
              <VemtapText className="pt-2 text-body-md text-text-secondary">
                {strings.dealTerms.faqAnswer}
              </VemtapText>
            ) : null}
          </View>
        </View>

        <View className="mx-6 mb-6 mt-4 flex-row items-center gap-3 rounded-lg bg-surface-canvas p-3 shadow-sm">
          <View className="h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary-fixed">
            <Icon name="shield" size={20} color={colors.onSecondaryFixed} />
          </View>
          <VemtapText className="min-w-0 flex-1 text-caption text-text-secondary">
            {strings.dealTerms.assurancePrefix}
            <VemtapText className="font-sans-semibold text-label-sm text-text">
              {strings.dealTerms.merchantName}
            </VemtapText>
            {strings.dealTerms.assuranceSuffix}
          </VemtapText>
        </View>
      </ScrollView>

      <View
        style={[
          styles.claimBar,
          tabBarTopShadow,
          { paddingBottom: Math.max(insets.bottom, 12) },
        ]}
      >
        <View className="mb-2 flex-row items-center justify-between px-1">
          <View className="flex-row items-center gap-1">
            <Icon name="checkCircle" size={15} color={colors.badgeDiscountText} />
            <VemtapText className="text-caption text-text-tertiary">
              {strings.dealTerms.instantActivation}
            </VemtapText>
          </View>
          <VemtapText className="text-caption text-text-secondary">
            {strings.dealTerms.total}
            <VemtapText className="font-sans-medium text-label-md text-text">
              {strings.dealTerms.price}
            </VemtapText>
          </VemtapText>
        </View>
        <Button
          label={strings.dealTerms.claim}
          leftIcon={<Icon name="shoppingBag" size={20} color={colors.surface} />}
          onPress={handleClaim}
          className="h-[54px]"
        />
      </View>

      <DealShareSheet
        visible={shareVisible}
        onClose={() => setShareVisible(false)}
        deal={deal}
        shareUrl={`https://vemtap.com/deals/${deal.id}`}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  claimBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  chevronOpen: { transform: [{ rotate: '180deg' }] },
});

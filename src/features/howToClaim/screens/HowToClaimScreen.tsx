import React, { useCallback } from 'react';
import { Pressable, ScrollView, Share, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RegistrationHeader } from '@components/auth/RegistrationHeader';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { dealsGrid } from '@features/deals/data/dealsFeed';
import type { AppStackParamList } from '@navigation/types';
import { HowToClaimStepCard } from '../components/HowToClaimStepCard';

cssInterop(Pressable, { className: 'style' });
cssInterop(ScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});
cssInterop(SafeAreaView, { className: 'style' });
cssInterop(View, { className: 'style' });

type Props = NativeStackScreenProps<AppStackParamList, 'HowToClaim'>;

export function HowToClaimScreen({ route, navigation }: Props) {
  const insets = useSafeAreaInsets();
  const deal = dealsGrid.find(item => item.id === route.params.dealId) ?? dealsGrid[0];
  const merchant = deal.merchant.split(' • ')[0];
  const area = deal.merchant.split(' • ')[1] ?? strings.deals.location;

  const handleClaim = useCallback(() => {
    navigation.navigate('DealClaimedSuccess', { dealId: deal.id });
  }, [deal.id, navigation]);

  const handleShare = useCallback(() => {
    Share.share({
      message: `https://vemtap.com/deals/${deal.id}`,
    }).catch(() => undefined);
  }, [deal.id]);

  return (
    <View className="flex-1 bg-surface">
      <SafeAreaView edges={['top']} className="bg-surface">
        <RegistrationHeader
          title={strings.howToClaim.headerTitle}
          onBack={navigation.goBack}
          showShareAction
          onShare={handleShare}
        />
      </SafeAreaView>

      <ScrollView
        className="flex-1 bg-surface"
        contentContainerClassName="px-6 pb-6"
        showsVerticalScrollIndicator={false}
      >
        <View className="pb-1 pt-4">
          <View className="mb-1 inline-flex flex-row items-center gap-1 self-start rounded-full bg-badge-discount-bg px-3 py-1 shadow-sm">
            <Icon name="bolt" size={14} color={colors.badgeDiscountText} />
            <VemtapText
              variant="caption"
              className="font-sans-semibold text-badge-discount-text"
            >
              {strings.howToClaim.badge}
            </VemtapText>
          </View>
          <VemtapText
            accessibilityRole="header"
            variant="headingXl"
            className="text-heading-xl text-text"
          >
            {strings.howToClaim.title}
          </VemtapText>
          <VemtapText variant="bodyMd" tone="secondary" className="mt-1 leading-relaxed">
            {strings.howToClaim.subtitle}
          </VemtapText>
        </View>

        <View className="gap-3 py-3">
          <HowToClaimStepCard
            step={1}
            title={strings.howToClaim.stepOneTitle}
            description={strings.howToClaim.stepOneBody}
            icon="touchApp"
            showDecoration
          >
            <View className="inline-flex flex-row items-center gap-1.5 self-start rounded-lg bg-surface-container-low px-2 py-1">
              <Icon name="verifiedUser" size={15} color={colors.primary} />
              <VemtapText variant="labelSm" tone="secondary">
                {strings.howToClaim.reservation}
              </VemtapText>
            </View>
          </HowToClaimStepCard>

          <HowToClaimStepCard
            step={2}
            title={strings.howToClaim.stepTwoTitle}
            description={strings.howToClaim.stepTwoBody(merchant, area)}
            icon="nearMe"
          >
            <View className="flex-row items-center justify-between gap-2 rounded-lg bg-surface-container-low p-2">
              <View className="min-w-0 flex-1 flex-row items-center gap-1">
                <Icon name="locationOn" size={18} color={colors.tertiaryContainer} />
                <VemtapText
                  variant="caption"
                  className="min-w-0 flex-1 truncate text-text"
                >
                  {strings.howToClaim.address}
                </VemtapText>
              </View>
              <VemtapText
                variant="labelSm"
                className="shrink-0 font-sans-medium text-primary"
              >
                {deal.distance}
              </VemtapText>
            </View>
          </HowToClaimStepCard>

          <HowToClaimStepCard
            step={3}
            title={strings.howToClaim.stepThreeTitle}
            description={strings.howToClaim.stepThreeBody}
            icon="qrCodeScanner"
          >
            <View className="flex-row items-center gap-2 rounded-lg bg-surface-container-high/60 p-2">
              <Icon name="schedule" size={16} color={colors.primary} />
              <VemtapText variant="caption" className="text-text-secondary">
                {strings.howToClaim.billingInstant}
              </VemtapText>
            </View>
          </HowToClaimStepCard>
        </View>

        <View className="mb-6 rounded-xl bg-surface-container-low p-4 shadow-sm">
          <View className="flex-row items-start gap-2">
            <Icon name="info" size={20} color={colors.secondary} />
            <View className="min-w-0 flex-1">
              <VemtapText variant="bodyMd" tone="secondary">
                {strings.howToClaim.cancelBody}
              </VemtapText>
              <Pressable
                accessibilityRole="link"
                className="mt-2 inline-flex flex-row items-center gap-1 self-start"
                onPress={navigation.goBack}
              >
                <VemtapText variant="labelMd" className="font-sans-semibold text-primary">
                  {strings.howToClaim.viewTerms}
                </VemtapText>
                <Icon name="arrowForward" size={16} color={colors.primary} />
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>

      <View
        className="bg-surface px-6 pt-3 shadow-lg"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
      >
        <Button
          label={strings.deals.claimDeal}
          leftIcon={<Icon name="localActivity" size={20} color={colors.surface} />}
          onPress={handleClaim}
        />
      </View>
    </View>
  );
}

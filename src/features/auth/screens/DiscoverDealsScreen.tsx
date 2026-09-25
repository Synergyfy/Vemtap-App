import React from 'react';
import { Image, View, ScrollView } from 'react-native';
import { cssInterop } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { VemtapText } from '@components/ui/Text';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { OnboardingHeader } from '@components/onboarding/OnboardingHeader';
import { DealCard, type Deal } from '@components/onboarding/DealCard';
import { colors } from '@theme/colors';
import type { AuthStackParamList } from '@navigation/types';
import { strings } from '@constants/strings';
import urbanBurger from '../../../../assets/images/deal-bistro-burger.jpg';
import glowSalon from '../../../../assets/images/deal-glow-salon.jpg';
import soleDistrict from '../../../../assets/images/deal-sole-district.jpg';
import artisanCafe from '../../../../assets/images/deal-artisan-cafe.jpg';

cssInterop(View, { className: 'style' });
cssInterop(Image, { className: 'style' });
cssInterop(ScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});
cssInterop(SafeAreaView, { className: 'style' });

type Nav = NativeStackNavigationProp<AuthStackParamList, 'DiscoverDeals'>;

const deals: Deal[] = [
  {
    id: 'bistro-24',
    category: 'Food & Dining',
    categoryTone: 'primary',
    title: 'Bistro 24 / Urban Grill',
    dealTitle: '20% Off Lunch Menu',
    badgeLabel: '20% OFF',
    badgeKind: 'discount',
    tag: { kind: 'hot', label: 'Hot Deal' },
    distance: '0.4 km away',
    rating: 4.9,
    ratingCount: 184,
    imageSource: urbanBurger,
  },
  {
    id: 'glow-studio',
    category: 'Beauty & Spa',
    categoryTone: 'muted',
    title: 'Glow Studio',
    dealTitle: 'Weekend Beauty Deal',
    badgeLabel: '30% OFF',
    badgeKind: 'discount',
    tag: { kind: 'trending', label: 'Trending' },
    distance: '1.2 km away',
    rating: 4.8,
    ratingCount: 92,
    imageSource: glowSalon,
  },
  {
    id: 'sole-district',
    category: 'Retail & Fashion',
    categoryTone: 'muted',
    title: 'Sole District',
    dealTitle: 'Fresh Sneakers & Streetwear',
    badgeLabel: 'SPECIAL',
    badgeKind: 'special',
    tag: { kind: 'exclusive', label: 'Exclusive Offer' },
    distance: '0.8 km away',
    rating: 5.0,
    ratingCount: 310,
    imageSource: soleDistrict,
  },
];

export function DiscoverDealsScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <View className="px-6 pt-2">
        <OnboardingHeader
          showBack
          onBack={() => navigation.goBack()}
          showSkip
          onSkip={() => navigation.navigate('StartVemtap')}
          center="vemtapPill"
        />
        <ProgressDotsInline activeIndex={1} />
      </View>

      <ScrollView
        contentContainerClassName="flex-grow px-6 pb-6"
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-5 mt-1 flex-col items-center px-2 text-center">
          <VemtapText
            variant="displayMobile"
            accessibilityRole="header"
            className="text-center text-heading-xl tracking-tight"
          >
            {strings.onboarding.discoverHeadline}
          </VemtapText>
          <VemtapText
            variant="bodyMd"
            tone="secondary"
            className="mx-auto mt-2 max-w-[320px] text-center"
          >
            {strings.onboarding.discoverSubtitle}
          </VemtapText>
        </View>

        <View className="w-full flex-col gap-3 py-1">
          {deals.map(deal => (
            <DealCard key={deal.id} deal={deal} />
          ))}

          {/* Peek card */}
          <View className="w-full scale-[0.98] rounded-xl bg-surface-container-lowest/90 p-3 opacity-90 shadow-onboard-sm">
            <View className="flex-row items-center gap-3">
              <View className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-surface-container">
                <Image
                  source={artisanCafe}
                  resizeMode="cover"
                  accessibilityLabel={strings.onboarding.discoverPeekImageAlt}
                  className="h-full w-full"
                />
              </View>
              <View className="min-w-0 flex-1">
                <View className="flex-row items-center justify-between gap-2">
                  <VemtapText className="text-heading-sm text-text" numberOfLines={1}>
                    Artisan Cafe
                  </VemtapText>
                  <View className="rounded-full bg-badge-discount-bg px-2 py-0.5">
                    <VemtapText className="font-sans-bold text-caption text-badge-discount-text">
                      BOGO FREE
                    </VemtapText>
                  </View>
                </View>
                <VemtapText
                  className="mt-0.5 text-caption text-text-secondary"
                  numberOfLines={1}
                >
                  Coffee & Pastries • 500m away
                </VemtapText>
              </View>
            </View>
          </View>
        </View>

        {/* Discovery tip */}
        <View className="mb-2 mt-4 flex-row items-center justify-center gap-2">
          <Icon name="bolt" size={17} color={colors.primary} />
          <VemtapText className="font-sans-medium text-caption text-text-secondary">
            {strings.onboarding.discoverTip}
          </VemtapText>
        </View>
      </ScrollView>

      <View className="border-t border-border bg-surface px-6 pb-4 pt-3">
        <Button
          label={strings.common.next}
          size="lg"
          className="rounded-2xl bg-primary"
          rightIcon={<Icon name="forward" size={19} color="#FFFFFF" />}
          onPress={() => navigation.navigate('StartVemtap')}
          accessibilityHint="Continues to the final onboarding step"
        />
      </View>
    </SafeAreaView>
  );
}

function ProgressDotsInline({ activeIndex }: { activeIndex: number }) {
  return (
    <View
      className="mb-3 mt-3 flex-row items-center justify-center gap-2"
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={`Onboarding step ${activeIndex + 1} of 3`}
    >
      {[0, 1, 2].map(i => (
        <View
          key={i}
          className={
            i === activeIndex
              ? 'h-1.5 w-6 rounded-full bg-primary shadow-onboard-sm'
              : 'h-1.5 w-1.5 rounded-full bg-surface-container-highest'
          }
        />
      ))}
    </View>
  );
}

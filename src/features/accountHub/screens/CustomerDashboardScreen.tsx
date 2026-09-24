import React from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  HubBottomBar,
  MetricTile,
  QuickAction,
  SectionLink,
} from '@features/accountHub/components/HubPrimitives';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';

cssInterop(View, { className: 'style' });
cssInterop(Pressable, { className: 'style' });
cssInterop(ScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});
cssInterop(SafeAreaView, { className: 'style' });

const copy = strings.customerDashboard;
const images = {
  hero: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCgCwLd5w58QXLgV11MHD52EEti1eL21CVWe5XjaydFi7gB0n_HlN0ZRXV3yob4ZVn5VXviRWWZGYsv1AaFBYmLz5MGyZoBIQR2PaZJDI_Hy-6Q8Q2qX_UNm3TBcOS5Clrs17aHV0AbIlu45JooU-HWsPtb3bHzQbC2hp0eLB-F0K_mX7KOrm8At7tLg-OaWWH65X7PtLDGbNibqkIdLveIrO70jZrzaDghvLUUoFza5ZW1bMN8Ce0DQw',
  burger:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCKUS0WwZYhFtl0KRQ8cL8Hr770L0Ls4JAHNUXCVRDplZ9ou9wSYBgO_j_kIOloOjjEEcnB1-3pwPxRYDmFguixph8sTmC3ix2crAreunKt8kxZmmJ2-MTt99BHKZGGUOTaQPFtYaNOrjKiOOvDDFh9FiBELRLLUsp7Is1PkB94raBEKxQrtZLHBHYhA2sd18QY2vVcn5opY7jym0RXQtI_pUdHhMvtm_R32Bo0CjoRtfAlGA7qfZPp5w',
  spa: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAUht6A5A8VJ2HVlciOxmOfSNjrxImixN6H4ySSvfeIstmp4yModG1rl0m4ECsbrxVAV8pTA38yVQ8e2us9V0WqpxW9ApXdSL7mq3OZRdaY6o0S4LIcXDDtbHQMWJEL2Sy5nylvEMstB6f0RmvU5bDO1WyOQeSqrvRpAV3nvIpFumqvEsCGt1kwrVPQ5vpREyevCJrPxEitPQF-pjFYRAGrKYxjwVhamRnG5lIlaXpHwoUcODTXMFjgJQ',
  bakery:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBQA9EUANK-qSWLc0YDbdaY7FBQTZMqGaJgfFAg6jdO2ZYEMjGP3nW-9BS4AE72LDZu_HKJ1fK300URqAnhtBqtb3rbJpKTy5gRvie_6Agz1LUsNvBrHp5XSpKFsM6k9UpmFRhScPALBdM44BCq7FpqkVzk_xeJg_VopE1LSJN6_oZOUXdkApMCUNwKd3N0EzBzGE5AbSkQt5ccJkn7Pxpz3FgY48x137irv2I-7lq7RLAetVnPqZCIXw',
  lounge:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAeAtQWLIyjDZGAe_fGVP6-PK-Lk91gGmK43js0O1SG0JI8juksx-Y5XG-gKRg-1EgZYzOc3jX33vXfe-mpI7w313488dgKy5JIV8SMnK7-0Ei5EH5KRDURZq289Tt4LG6hhlrwFy8dhbVG9Ber29ljbzVK0Ov5hUoyRSnPB_WMxFJ-yqeKTY_VwxLq02F9hmq2X8WqN3nBgucmRXuu4h8ytG-Jrb1Ncfl-FAvp74kGc9Pmoc6FG8ywBA',
};

export interface CustomerDashboardScreenProps {
  onLocation?: () => void;
  onCart?: () => void;
  onNotifications?: () => void;
  onOpenAccount?: () => void;
  onOpenDeal?: (dealId: string) => void;
  onOpenRewards?: () => void;
  onNavigate?: (destination: string) => void;
}

export function CustomerDashboardScreen({
  onLocation,
  onCart,
  onNotifications,
  onOpenAccount,
  onOpenDeal,
  onOpenRewards,
  onNavigate,
}: CustomerDashboardScreenProps) {
  const metricIcons = ['voucher', 'star', 'wallet'] as const;
  const quickIcons = ['explore', 'badge', 'qrCodeScanner', 'history'] as const;

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-background">
      <View className="flex-row items-center justify-between bg-surface px-4 py-2">
        <View className="min-w-0 flex-1">
          <VemtapText
            accessibilityRole="header"
            variant="headingXl"
            className="text-heading-xl"
            numberOfLines={1}
          >
            {copy.greeting}
          </VemtapText>
          <Pressable
            accessibilityRole="button"
            onPress={onLocation}
            className="mt-0.5 flex-row items-center gap-1"
          >
            <Icon name="locationOn" size={17} color={colors.primary} />
            <VemtapText variant="labelMd" tone="secondary">
              {copy.location}
            </VemtapText>
            <Icon name="expandMore" size={15} color={colors.textTertiary} />
          </Pressable>
        </View>
        <View className="flex-row items-center gap-2">
          <HubIconButton icon="bag" label={copy.cart} badge="2" onPress={onCart} />
          <HubIconButton
            icon="notifications"
            label={copy.notifications}
            badge="3"
            onPress={onNotifications}
            error
          />
          <Pressable
            accessibilityRole="button"
            onPress={onOpenAccount}
            className="relative h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-surface-container-highest"
          >
            <Icon name="person" size={22} color={colors.secondary} />
            <View className="absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full border-2 border-surface bg-badge-discount-text" />
          </Pressable>
        </View>
      </View>
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-5 pb-5"
        showsVerticalScrollIndicator={false}
      >
        <View className="relative mx-4 h-48 overflow-hidden rounded-card shadow-sm">
          <Image
            source={{ uri: images.hero }}
            className="h-full w-full"
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', colors.surfaceDark]}
            locations={[0.25, 1]}
            className="absolute inset-0 p-4"
          >
            <View className="flex-row justify-between">
              <View className="flex-row items-center gap-1 rounded-full bg-surface px-2 py-1">
                <Icon name="fire" size={14} color={colors.tertiaryContainer} />
                <VemtapText variant="caption" className="font-sans-semibold">
                  {copy.campaign}
                </VemtapText>
              </View>
              <View className="rounded-full bg-surface px-2 py-0.5">
                <VemtapText variant="caption">{copy.weekend}</VemtapText>
              </View>
            </View>
            <View className="mt-auto">
              <VemtapText variant="headingLg" className="text-heading-lg text-surface">
                {copy.campaignTitle}
              </VemtapText>
              <VemtapText
                variant="bodyMd"
                className="text-surface-container-highest"
                numberOfLines={1}
              >
                {copy.campaignBody}
              </VemtapText>
              <View className="mt-2 flex-row items-center justify-between">
                <Button
                  label={copy.exploreDeals}
                  size="sm"
                  onPress={() => onOpenDeal?.('weekend-deals')}
                  rightIcon={
                    <Icon name="arrowForward" size={16} color={colors.surface} />
                  }
                />
                <View className="flex-row gap-1">
                  <View className="h-1.5 w-5 rounded-full bg-surface" />
                  <View className="h-1.5 w-1.5 rounded-full bg-surface opacity-50" />
                  <View className="h-1.5 w-1.5 rounded-full bg-surface opacity-50" />
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>
        <View className="gap-2 px-4">
          <View className="flex-row justify-between">
            <VemtapText variant="headingSm">{copy.activity}</VemtapText>
            <VemtapText variant="caption" tone="tertiary">
              {copy.sync}
            </VemtapText>
          </View>
          <View className="flex-row gap-2">
            {copy.metrics.map((metric, index) => (
              <MetricTile
                key={metric[1]}
                value={metric[0]}
                label={metric[1]}
                icon={metricIcons[index]}
                tone={index === 0 ? 'primary' : index === 1 ? 'tertiary' : 'success'}
              />
            ))}
          </View>
        </View>
        <View className="gap-2 px-4">
          <VemtapText
            variant="labelMd"
            className="font-sans-semibold uppercase tracking-wider text-text-secondary"
          >
            {copy.quickActions}
          </VemtapText>
          <View className="flex-row gap-2">
            {copy.actions.map((label, index) => (
              <QuickAction
                key={label}
                icon={quickIcons[index]}
                label={label}
                onPress={
                  index === 1
                    ? onOpenRewards
                    : index === 0
                      ? () => onOpenDeal?.('explore')
                      : undefined
                }
              />
            ))}
          </View>
        </View>
        <View className="gap-3 px-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <VemtapText variant="headingSm">{copy.activeDeals}</VemtapText>
              <View className="h-5 w-5 items-center justify-center rounded-full bg-primary">
                <VemtapText variant="micro" className="text-surface">
                  {copy.activeTwo}
                </VemtapText>
              </View>
            </View>
            <SectionLink
              label={copy.viewAllDeals}
              onPress={() => onOpenDeal?.('my-deals')}
            />
          </View>
          <ActiveDeal
            image={images.burger}
            business="Urban Grill & Bistro"
            deal="20% Off Prime Lunch Combo"
            meta="Expires in 2 days"
            status={copy.ready}
            code="VT-48F261"
            action={copy.showQr}
            onPress={() => onOpenDeal?.('urban-grill-lunch')}
          />
          <ActiveDeal
            image={images.spa}
            business="Glow & Serenity Spa"
            deal="Deep Hydration Facial & Manicure"
            meta="Thu, Oct 17 • 1:15 PM"
            status={copy.confirmed}
            slot={copy.slotReserved}
            action={copy.viewPass}
            onPress={() => onOpenDeal?.('glow-booking')}
          />
        </View>
        <RewardsCard onOpen={onOpenRewards} />
        <ActivityLedger />
        <View className="gap-3 px-4">
          <View className="flex-row items-center justify-between">
            <VemtapText variant="headingSm">{copy.mayLike}</VemtapText>
            <Icon name="autoAwesome" size={20} color={colors.primary} />
          </View>
          <VemtapText variant="caption" tone="secondary">
            {copy.mayLikeBody}
          </VemtapText>
          <View className="flex-row gap-2">
            <Recommendation
              image={images.bakery}
              discount="15% OFF"
              distance="0.5 km away"
              business="Artisan Bakery & Cafe"
              title="Sourdough & Pastries Combo"
              price="₦4,500"
              old="₦5,300"
              onPress={() => onOpenDeal?.('bakery-pastries')}
            />
            <Recommendation
              image={images.lounge}
              discount="BOGO FREE"
              distance="1.2 km away"
              business="The Sky Lounge"
              title="Cocktails & Small Plates"
              price="₦8,000"
              old="₦16,000"
              onPress={() => onOpenDeal?.('sky-cocktails')}
            />
          </View>
          <Button
            label={copy.exploreApo}
            variant="secondary"
            rightIcon={<Icon name="arrowForward" size={18} color={colors.primary} />}
            onPress={() => onOpenDeal?.('deals-apo')}
          />
        </View>
        <View className="items-center">
          <View className="flex-row items-center gap-1">
            <Icon name="verifiedUser" size={14} color={colors.primary} />
            <VemtapText variant="caption" tone="tertiary">
              {copy.guarantee}
            </VemtapText>
          </View>
          <VemtapText variant="micro" className="text-text-tertiary">
            {strings.app.tagline}
          </VemtapText>
        </View>
      </ScrollView>
      <HubBottomBar active="home" mode="dashboard" onNavigate={onNavigate} />
    </SafeAreaView>
  );
}

function HubIconButton({
  icon,
  label,
  badge,
  onPress,
  error = false,
}: {
  icon: 'bag' | 'notifications';
  label: string;
  badge: string;
  onPress?: () => void;
  error?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      className="relative h-10 w-10 items-center justify-center rounded-full bg-surface-subtle shadow-sm"
    >
      <Icon name={icon} size={20} color={colors.surfaceDark} />
      <View
        className={`absolute right-0 top-0 h-4 min-w-4 items-center justify-center rounded-full px-1 ${error ? 'bg-error' : 'bg-primary'}`}
      >
        <VemtapText variant="micro" className="text-surface">
          {badge}
        </VemtapText>
      </View>
    </Pressable>
  );
}

function ActiveDeal({
  image,
  business,
  deal,
  meta,
  status,
  code,
  slot,
  action,
  onPress,
}: {
  image: string;
  business: string;
  deal: string;
  meta: string;
  status: string;
  code?: string;
  slot?: string;
  action: string;
  onPress?: () => void;
}) {
  return (
    <View className="gap-3 rounded-card bg-surface p-4 shadow-sm">
      <View className="flex-row gap-3">
        <View className="relative h-14 w-14 shrink-0 overflow-hidden rounded-field">
          <Image source={{ uri: image }} className="h-full w-full" resizeMode="cover" />
        </View>
        <View className="min-w-0 flex-1">
          <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
            {business}
          </VemtapText>
          <VemtapText variant="labelMd" className="font-sans-semibold" numberOfLines={1}>
            {deal}
          </VemtapText>
          <VemtapText variant="caption" tone="tertiary">
            {meta}
          </VemtapText>
        </View>
        <View className="shrink-0 self-start rounded-full bg-badge-discount-bg px-2 py-0.5">
          <VemtapText variant="micro" className="text-badge-discount-text">
            {status}
          </VemtapText>
        </View>
      </View>
      <View className="flex-row items-center justify-between gap-2 rounded-lg bg-surface-subtle p-2">
        {code ? (
          <View>
            <VemtapText variant="micro" tone="tertiary">
              PASS CODE
            </VemtapText>
            <VemtapText variant="labelMd" className="font-sans-bold">
              {code}
            </VemtapText>
          </View>
        ) : (
          <View className="flex-row items-center gap-1">
            <Icon name="checkCircle" size={17} color={colors.badgeDiscountText} />
            <VemtapText variant="caption" tone="secondary">
              {slot}
            </VemtapText>
          </View>
        )}
        <Button
          label={action}
          size="sm"
          fullWidth={false}
          leftIcon={
            code ? (
              <Icon name="qrCode" size={17} color={colors.surface} />
            ) : (
              <Icon name="forward" size={16} color={colors.primary} />
            )
          }
          onPress={onPress}
        />
      </View>
    </View>
  );
}

function RewardsCard({ onOpen }: { onOpen?: () => void }) {
  return (
    <View className="mx-4 gap-3 rounded-card bg-surface p-4 shadow-sm">
      <View className="flex-row justify-between">
        <View className="flex-row items-center gap-2">
          <Icon name="loyalty" size={20} color={colors.tertiaryContainer} />
          <VemtapText variant="headingSm">{copy.rewards}</VemtapText>
        </View>
        <SectionLink label={copy.viewRewards} onPress={onOpen} />
      </View>
      <View className="flex-row justify-between rounded-card bg-surface-subtle p-3">
        <View>
          <VemtapText variant="caption" tone="tertiary">
            {copy.tierStatus}
          </VemtapText>
          <VemtapText variant="labelMd" className="font-sans-semibold">
            {copy.gold}
          </VemtapText>
        </View>
        <View className="items-end">
          <VemtapText variant="caption" tone="tertiary">
            {copy.balance}
          </VemtapText>
          <VemtapText variant="headingSm" className="text-tertiary">
            {copy.progressValue}
          </VemtapText>
        </View>
      </View>
      <View className="gap-1.5">
        <View className="flex-row justify-between">
          <VemtapText variant="caption" tone="secondary">
            {copy.progress}
          </VemtapText>
          <VemtapText variant="caption" className="font-sans-semibold">
            {copy.progressValue}
          </VemtapText>
        </View>
        <View className="h-2 overflow-hidden rounded-full bg-surface-container">
          <View className="h-full w-[81%] rounded-full bg-primary" />
        </View>
      </View>
      <View className="flex-row justify-between">
        <VemtapText variant="caption" className="min-w-0 flex-1 text-badge-discount-text">
          {copy.rewardsAvailable}
        </VemtapText>
        <Pressable accessibilityRole="button" onPress={onOpen}>
          <VemtapText variant="labelSm" tone="brand">
            {copy.claim}
          </VemtapText>
        </Pressable>
      </View>
    </View>
  );
}

function ActivityLedger() {
  const icons = ['localActivity', 'qrCode', 'message'] as const;
  return (
    <View className="gap-3 px-4">
      <View className="flex-row justify-between">
        <VemtapText variant="headingSm">{copy.recent}</VemtapText>
        <SectionLink label={copy.viewActivity} />
      </View>
      <View className="overflow-hidden rounded-card bg-surface shadow-sm">
        {copy.activityRows.map((row, index) => (
          <View
            key={row[0]}
            className="flex-row items-center justify-between gap-3 border-b border-border p-3 last:border-b-0"
          >
            <View className="min-w-0 flex-1 flex-row items-center gap-3">
              <View className="h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-tint-blue">
                <Icon name={icons[index]} size={20} color={colors.primary} />
              </View>
              <View className="min-w-0">
                <VemtapText
                  variant="labelMd"
                  className="font-sans-semibold"
                  numberOfLines={1}
                >
                  {row[0]}
                </VemtapText>
                <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                  {row[1]}
                </VemtapText>
              </View>
            </View>
            <VemtapText variant="labelSm" className="shrink-0 text-badge-discount-text">
              {row[2]}
            </VemtapText>
          </View>
        ))}
      </View>
    </View>
  );
}

function Recommendation({
  image,
  discount,
  distance,
  business,
  title,
  price,
  old,
  onPress,
}: {
  image: string;
  discount: string;
  distance: string;
  business: string;
  title: string;
  price: string;
  old: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="min-w-0 flex-1 overflow-hidden rounded-card bg-surface shadow-sm"
    >
      <View className="relative h-28">
        <Image source={{ uri: image }} className="h-full w-full" resizeMode="cover" />
        <View className="absolute left-2 top-2 rounded-full bg-badge-discount-bg px-2 py-0.5">
          <VemtapText variant="micro" className="font-sans-bold text-badge-discount-text">
            {discount}
          </VemtapText>
        </View>
      </View>
      <View className="gap-1 p-2">
        <VemtapText variant="micro" tone="tertiary">
          {distance}
        </VemtapText>
        <VemtapText variant="labelMd" className="font-sans-semibold" numberOfLines={1}>
          {business}
        </VemtapText>
        <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
          {title}
        </VemtapText>
        <View className="flex-row items-baseline gap-1">
          <VemtapText variant="labelMd" className="font-sans-semibold">
            {price}
          </VemtapText>
          <VemtapText variant="micro" tone="tertiary" className="line-through">
            {old}
          </VemtapText>
          <Icon name="plus" size={16} color={colors.primary} />
        </View>
      </View>
    </Pressable>
  );
}

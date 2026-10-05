import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '@components/ui/Button';
import { Icon, type IconName } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { useCurrentUserDisplay } from '@hooks/useCurrentUserDisplay';
import { colors } from '@theme/colors';
import { navbarBottomShadow } from '@theme/shadows';

cssInterop(View, { className: 'style' });
cssInterop(Pressable, { className: 'style' });
cssInterop(ScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});
cssInterop(SafeAreaView, { className: 'style' });

const copy = strings.accountHome;

function AccountRow({
  icon,
  title,
  meta,
  badge,
  badgeTone = 'neutral',
  onPress,
}: {
  icon: IconName;
  title: string;
  meta?: string;
  badge?: string;
  badgeTone?: 'neutral' | 'success' | 'brand';
  onPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      className="min-h-16 flex-row items-center gap-3 border-b border-border px-4 py-3 last:border-b-0 active:bg-surface-container-low"
    >
      <View className="h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-tint-blue">
        <Icon name={icon} size={21} color={colors.primary} />
      </View>
      <View className="min-w-0 flex-1">
        <VemtapText variant="labelMd" className="font-sans-medium" numberOfLines={1}>
          {title}
        </VemtapText>
        {meta ? (
          <VemtapText variant="caption" tone="tertiary" numberOfLines={1}>
            {meta}
          </VemtapText>
        ) : null}
      </View>
      {badge ? (
        <View
          className={`shrink-0 rounded-full px-2 py-0.5 ${
            badgeTone === 'success'
              ? 'bg-badge-discount-bg'
              : badgeTone === 'brand'
                ? 'bg-surface-tint-blue'
                : 'bg-surface-container'
          }`}
        >
          <VemtapText
            variant="caption"
            numberOfLines={1}
            className={
              badgeTone === 'success'
                ? 'font-sans-semibold text-badge-discount-text'
                : badgeTone === 'brand'
                  ? 'font-sans-semibold text-primary'
                  : 'text-text-secondary'
            }
          >
            {badge}
          </VemtapText>
        </View>
      ) : null}
      <Icon name="forward" size={18} color={colors.textTertiary} />
    </Pressable>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <VemtapText
      variant="labelSm"
      tone="secondary"
      className="px-1 uppercase tracking-wider"
    >
      {children}
    </VemtapText>
  );
}

export interface AccountHomeScreenProps {
  onOpenNotifications?: () => void;
  onOpenHelp?: () => void;
  onOpenAccountMenu?: () => void;
  onEditProfile?: () => void;
  onOpenCustomerDashboard?: () => void;
  onOpenDeals?: () => void;
  onOpenOrders?: () => void;
  onOpenSavings?: () => void;
  onOpenSaved?: () => void;
  onOpenPrivacy?: () => void;
  onOpenDelivery?: () => void;
  onOpenAppPreferences?: () => void;
  onOpenHelpCentre?: () => void;
  onOpenContactSupport?: () => void;
  onOpenTerms?: () => void;
  onOpenBusinessSetup?: () => void;
  onSignOut?: () => void;
}

export function AccountHomeScreen({
  onOpenNotifications,
  onOpenHelp,
  onOpenAccountMenu,
  onEditProfile,
  onOpenCustomerDashboard,
  onOpenDeals,
  onOpenOrders,
  onOpenSavings,
  onOpenSaved,
  onOpenPrivacy,
  onOpenDelivery,
  onOpenAppPreferences,
  onOpenHelpCentre,
  onOpenContactSupport,
  onOpenTerms,
  onOpenBusinessSetup,
  onSignOut,
}: AccountHomeScreenProps) {
  const me = useCurrentUserDisplay();
  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-background">
      <View
        className="flex-row items-center justify-between bg-surface px-4 pb-3 pt-2"
        style={navbarBottomShadow}
      >
        <View className="min-w-0 flex-1 flex-row items-center gap-2">
          <VemtapText
            variant="labelMd"
            className="shrink-0 font-sans-bold text-primary"
            numberOfLines={1}
          >
            VEMTAP
          </VemtapText>
          <VemtapText variant="labelSm" tone="tertiary" className="shrink-0">
            /
          </VemtapText>
          <VemtapText
            accessibilityRole="header"
            variant="labelMd"
            className="min-w-0 flex-1 font-sans-semibold"
            numberOfLines={1}
          >
            {copy.title}
          </VemtapText>
        </View>
        <View className="shrink-0 flex-row items-center gap-1">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.notificationsLabel}
            onPress={onOpenNotifications}
            hitSlop={6}
            className="h-10 w-10 items-center justify-center rounded-full"
          >
            <Icon name="notifications" size={21} color={colors.text} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.helpCentre}
            onPress={onOpenHelp}
            hitSlop={6}
            className="h-10 w-10 items-center justify-center rounded-full"
          >
            <Icon name="help" size={21} color={colors.text} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.accountLabel}
            onPress={onOpenAccountMenu}
            className="h-9 w-9 items-center justify-center rounded-full bg-primary"
          >
            <Icon name="person" size={18} color={colors.surface} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-4 px-4 pb-8 pt-3"
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-4 rounded-card border border-border bg-surface p-4 shadow-md">
          <View className="flex-row items-center gap-3">
            <View className="relative h-14 w-14 shrink-0 items-center justify-center rounded-full bg-surface-container-high">
              <VemtapText variant="labelMd" tone="brand" className="font-sans-bold">
                {me.initials}
              </VemtapText>
              <View className="absolute -bottom-0.5 -right-0.5 h-5 w-5 items-center justify-center rounded-full border-2 border-surface bg-success">
                <Icon name="check" size={12} color={colors.surface} />
              </View>
            </View>
            <View className="min-w-0 flex-1">
              <VemtapText
                variant="labelMd"
                className="font-sans-semibold"
                numberOfLines={1}
              >
                {me.fullName}
              </VemtapText>
              <VemtapText variant="caption" numberOfLines={1}>
                {me.phone}
              </VemtapText>
              <VemtapText variant="caption" tone="tertiary" numberOfLines={1}>
                {me.email}
              </VemtapText>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={copy.edit}
              onPress={onEditProfile}
              className="h-9 shrink-0 flex-row items-center gap-1 rounded-lg bg-surface-tint-blue px-2.5"
            >
              <VemtapText variant="labelSm" tone="brand" className="font-sans-semibold">
                {copy.edit}
              </VemtapText>
              <Icon name="edit" size={15} color={colors.primary} />
            </Pressable>
          </View>
          <View className="flex-row gap-3">
            <View className="min-w-0 flex-1 flex-row items-center gap-2.5 rounded-card bg-surface-container-low p-3">
              <Icon name="wallet" size={21} color={colors.text} />
              <View className="min-w-0 flex-1">
                <VemtapText variant="caption" tone="tertiary" numberOfLines={1}>
                  {copy.totalSaved}
                </VemtapText>
                <VemtapText
                  variant="labelMd"
                  className="font-sans-bold text-badge-discount-text"
                  numberOfLines={1}
                >
                  {copy.totalSavedValue}
                </VemtapText>
              </View>
            </View>
            <View className="min-w-0 flex-1 flex-row items-center gap-2.5 rounded-card bg-surface-container-low p-3">
              <Icon name="voucher" size={21} color={colors.primary} />
              <View className="min-w-0 flex-1">
                <VemtapText variant="caption" tone="tertiary" numberOfLines={1}>
                  {copy.activeDeals}
                </VemtapText>
                <VemtapText
                  variant="labelMd"
                  className="font-sans-bold"
                  numberOfLines={1}
                >
                  {copy.activeDealsValue}
                </VemtapText>
              </View>
            </View>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.goToDashboard}
          onPress={onOpenCustomerDashboard}
          className="w-full overflow-hidden rounded-card shadow-md active:scale-[0.99]"
        >
          <LinearGradient
            colors={[colors.primaryContainer, colors.primaryContainer, colors.navy]}
            locations={[0, 0.3, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="p-4"
          >
            <View className="flex-row items-start justify-between gap-2">
              <View className="min-w-0 flex-row items-center gap-2">
                <View className="flex-row items-center gap-1.5 rounded-full bg-surface/20 px-2 py-1">
                  <View className="h-1.5 w-1.5 rounded-full bg-surface" />
                  <VemtapText
                    variant="caption"
                    className="font-sans-semibold text-surface"
                    numberOfLines={1}
                  >
                    {copy.liveHub}
                  </VemtapText>
                </View>
                <VemtapText variant="caption" className="text-surface" numberOfLines={1}>
                  {copy.goToDashboardShort}
                </VemtapText>
              </View>
              <View className="h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface/20">
                <Icon name="arrowForward" size={18} color={colors.surface} />
              </View>
            </View>
            <View className="mt-3 flex-row items-center gap-4">
              <View className="h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface/20">
                <Icon name="dashboardCustomize" size={28} color={colors.surface} />
              </View>
              <View className="min-w-0 flex-1">
                <VemtapText
                  variant="headingSm"
                  className="font-sans-bold text-surface"
                  numberOfLines={1}
                >
                  {copy.goToDashboard}
                </VemtapText>
                <VemtapText
                  variant="caption"
                  className="mt-0.5 text-surface"
                  numberOfLines={2}
                >
                  {copy.goToDashboardBody}
                </VemtapText>
              </View>
            </View>
          </LinearGradient>
        </Pressable>

        <View className="gap-2">
          <SectionLabel>{copy.activitySection}</SectionLabel>
          <View className="overflow-hidden rounded-card border border-border bg-surface shadow-md">
            <AccountRow
              icon="localOffer"
              title={copy.myDeals}
              badge={copy.myDealsBadge}
              badgeTone="success"
              onPress={onOpenDeals}
            />
            <AccountRow
              icon="receipt"
              title={copy.ordersBookings}
              badge={copy.ordersBookingsBadge}
              badgeTone="brand"
              onPress={onOpenOrders}
            />
            <AccountRow
              icon="savings"
              title={copy.savingsHistory}
              badge={copy.savingsHistoryBadge}
              onPress={onOpenSavings}
            />
            <AccountRow
              icon="bookmark"
              title={copy.savedItems}
              badge={copy.savedItemsBadge}
              onPress={onOpenSaved}
            />
          </View>
        </View>

        <View className="gap-2">
          <SectionLabel>{copy.preferencesSection}</SectionLabel>
          <View className="overflow-hidden rounded-card border border-border bg-surface shadow-md">
            <AccountRow
              icon="notifications"
              title={copy.notifications}
              meta={copy.notificationsMeta}
              onPress={onOpenNotifications}
            />
            <AccountRow
              icon="shieldPerson"
              title={copy.privacy}
              meta={copy.privacyMeta}
              onPress={onOpenPrivacy}
            />
            <AccountRow
              icon="locationOn"
              title={copy.delivery}
              meta={copy.deliveryMeta}
              onPress={onOpenDelivery}
            />
            <AccountRow
              icon="tune"
              title={copy.appPreferences}
              meta={copy.appPreferencesMeta}
              onPress={onOpenAppPreferences}
            />
          </View>
        </View>

        <View className="gap-2">
          <SectionLabel>{copy.supportSection}</SectionLabel>
          <View className="overflow-hidden rounded-card border border-border bg-surface shadow-md">
            <AccountRow icon="help" title={copy.helpCentre} onPress={onOpenHelpCentre} />
            <AccountRow
              icon="support"
              title={copy.contactSupport}
              onPress={onOpenContactSupport}
            />
            <AccountRow icon="policy" title={copy.terms} onPress={onOpenTerms} />
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.setUpBusiness}
          onPress={onOpenBusinessSetup}
          className="items-center gap-1 py-2"
        >
          <View className="flex-row items-center gap-1.5">
            <Icon name="storefront" size={17} color={colors.textSecondary} />
            <VemtapText variant="labelSm" tone="secondary">
              {copy.ownBusiness}
            </VemtapText>
          </View>
          <View className="flex-row items-center gap-1.5">
            <VemtapText variant="labelSm" tone="brand" className="font-sans-semibold">
              {copy.setUpBusiness}
            </VemtapText>
            <Icon name="arrowForward" size={15} color={colors.primary} />
          </View>
        </Pressable>

        <Button
          label={copy.signOut}
          variant="ghost"
          labelVariant="labelMd"
          labelClassName="text-error"
          leftIcon={<Icon name="logout" size={18} color={colors.error} />}
          onPress={onSignOut}
        />

        <VemtapText variant="caption" tone="tertiary" className="text-center">
          {copy.version}
        </VemtapText>
      </ScrollView>
    </SafeAreaView>
  );
}

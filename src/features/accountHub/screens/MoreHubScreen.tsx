import React from 'react';
import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  AccountHeader,
  AccountMenuRow,
  AccountSection,
  PageScroll,
  StatCard,
} from '@features/accountHub/components/AccountScreensPrimitives';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { useCurrentUserDisplay } from '@hooks/useCurrentUserDisplay';
import {
  useLoyaltyAnalytics,
  useLoyaltyBalance,
  useLoyaltyTier,
} from '@features/accountHub/hooks/useLoyalty';
import { useSavedTotals } from '@features/accountHub/hooks/useSavedHub';
import { useUnreadNotificationsCount } from '@features/accountHub/hooks/useNotifications';
import { formatCurrency } from '@utils/formatters';

const copy = strings.accountScreens.moreHub;

export interface MoreHubScreenProps {
  onBack?: () => void;
  onOpenRewards?: () => void;
  onOpenSavings?: () => void;
  onOpenActivity?: () => void;
  onOpenSaved?: () => void;
  onOpenNotifications?: () => void;
  onOpenSettings?: () => void;
  onOpenOrders?: () => void;
  onOpenEditProfile?: () => void;
  onOpenHelpCentre?: () => void;
  onSignOut?: () => void;
}

export function MoreHubScreen({
  onBack,
  onOpenRewards,
  onOpenSavings,
  onOpenActivity,
  onOpenSaved,
  onOpenNotifications,
  onOpenSettings,
  onOpenOrders,
  onOpenEditProfile,
  onOpenHelpCentre,
  onSignOut,
}: MoreHubScreenProps) {
  const me = useCurrentUserDisplay();
  const balance = useLoyaltyBalance(null);
  const tier = useLoyaltyTier();
  const analytics = useLoyaltyAnalytics('allTime');
  const saved = useSavedTotals();
  const unread = useUnreadNotificationsCount();
  const points = Number(balance.data ?? 0).toLocaleString('en-NG');
  const memberSince = me.createdAt
    ? new Date(me.createdAt).toLocaleDateString('en-NG', {
        month: 'short',
        year: 'numeric',
      })
    : null;
  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-background">
      <AccountHeader
        title={copy.title}
        onBack={onBack}
        onAction={onOpenSettings}
        actionIcon="tune"
      />
      <PageScroll>
        <VemtapText variant="labelSm" tone="tertiary" className="self-end">
          {copy.settings}
        </VemtapText>
        <View className="gap-3 rounded-card bg-surface p-4 shadow-md">
          <View className="flex-row items-center gap-3">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-surface-container-high">
              <VemtapText variant="headingMd" tone="brand">
                {me.initials}
              </VemtapText>
              <View className="absolute bottom-0 right-0 h-6 w-6 items-center justify-center rounded-full bg-primary-container">
                <VemtapText variant="micro" className="text-primary-foreground">
                  ✓
                </VemtapText>
              </View>
            </View>
            <View className="min-w-0 flex-1">
              <View className="flex-row items-center gap-2">
                <VemtapText variant="headingSm">{me.fullName}</VemtapText>
                {tier.data?.tier ? (
                  <View className="rounded-full bg-surface-tint px-2 py-0.5">
                    <VemtapText variant="labelSm" tone="brand">
                      {tier.data.tier}
                    </VemtapText>
                  </View>
                ) : null}
              </View>
              {memberSince ? (
                <VemtapText variant="caption" tone="secondary">
                  {copy.memberSince(memberSince)}
                </VemtapText>
              ) : null}
              <VemtapText variant="caption" tone="tertiary" numberOfLines={1}>
                {me.email}
              </VemtapText>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={copy.edit}
              onPress={onOpenEditProfile}
              className="shrink-0"
            >
              <VemtapText variant="labelSm" tone="brand">
                {copy.edit} →
              </VemtapText>
            </Pressable>
          </View>
          <View className="flex-row items-center justify-between">
            <VemtapText variant="labelSm" tone="secondary">
              {me.phone}
            </VemtapText>
            <View className="shrink-0 rounded-full bg-badge-discount-bg px-2 py-1">
              <VemtapText variant="micro" tone="success" numberOfLines={1}>
                ✓ {copy.verified}
              </VemtapText>
            </View>
          </View>
        </View>
        <View className="flex-row gap-3">
          <StatCard icon="loyalty" value={points} label={copy.points} tone="tertiary" />
          <StatCard
            icon="savings"
            value={formatCurrency(analytics.data?.totals?.netSavings ?? 0)}
            label={copy.savings}
            tone="success"
            onPress={onOpenSavings}
          />
        </View>
        <AccountSection title={copy.rewards}>
          <AccountMenuRow
            icon="loyalty"
            title={copy.rewardsTitle}
            subtitle={copy.rewardsSubtitle(points)}
            onPress={onOpenRewards}
          />
          <AccountMenuRow
            icon="receipt"
            title={copy.savingsTitle}
            subtitle={copy.savingsSubtitle}
            onPress={onOpenSavings}
          />
        </AccountSection>
        <AccountSection title={copy.activity}>
          <AccountMenuRow
            icon="history"
            title={copy.activityTitle}
            subtitle={copy.activitySubtitle}
            onPress={onOpenActivity}
          />
          <AccountMenuRow
            icon="bookmark"
            title={copy.savedTitle}
            subtitle={copy.savedSubtitle(saved.deals ?? 0, saved.businesses ?? 0)}
            badge={saved.isSuccess ? copy.total(saved.all ?? 0) : undefined}
            onPress={onOpenSaved}
          />
        </AccountSection>
        <AccountSection title={copy.ordersSection}>
          <AccountMenuRow
            icon="shoppingBag"
            title={copy.ordersTitle}
            subtitle={copy.ordersSubtitle}
            onPress={onOpenOrders}
          />
        </AccountSection>
        <AccountSection title={copy.communications}>
          <AccountMenuRow
            icon="notifications"
            title={copy.notifications}
            subtitle={copy.notificationsSubtitle}
            badge={unread.data ? copy.unread(unread.data) : undefined}
            onPress={onOpenNotifications}
          />
        </AccountSection>
        <AccountSection title={copy.support}>
          <AccountMenuRow
            icon="help"
            title={copy.help}
            subtitle={copy.helpSubtitle}
            onPress={onOpenHelpCentre}
          />
          <AccountMenuRow
            icon="shield"
            title={copy.terms}
            subtitle={copy.termsSubtitle}
          />
          <AccountMenuRow
            icon="close"
            title={copy.signOut}
            subtitle={copy.signOutSubtitle}
            onPress={onSignOut}
          />
        </AccountSection>
      </PageScroll>
    </SafeAreaView>
  );
}

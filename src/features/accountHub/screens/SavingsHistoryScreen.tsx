import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  AccountHeader,
  PageScroll,
  TransactionRow,
} from '@features/accountHub/components/AccountScreensPrimitives';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';

const copy = strings.accountScreens.savings;

export interface SavingsHistoryScreenProps {
  onBack?: () => void;
  onShare?: () => void;
  onSeeAll?: () => void;
}

export function SavingsHistoryScreen({
  onBack,
  onShare,
  onSeeAll,
}: SavingsHistoryScreenProps) {
  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-background">
      <AccountHeader
        title={copy.title}
        onBack={onBack}
        actionIcon="share"
        onAction={onShare}
      />
      <PageScroll>
        <View className="flex-row items-center justify-between gap-2">
          <View className="min-w-0 flex-row items-center gap-2">
            <View className="h-2 w-2 shrink-0 rounded-full bg-badge-discount-text" />
            <VemtapText variant="labelSm" tone="success" numberOfLines={1}>
              {copy.activeSaver}
            </VemtapText>
            <VemtapText variant="caption" tone="tertiary" numberOfLines={1}>
              {copy.synced}
            </VemtapText>
          </View>
          <Button
            label={copy.shareImpact}
            variant="secondary"
            size="sm"
            fullWidth={false}
            onPress={onShare}
            leftIcon={<Icon name="share" size={16} color={colors.primary} />}
          />
        </View>
        <View className="gap-4 rounded-card bg-primary p-5 shadow-lg">
          <View className="flex-row items-center justify-between">
            <VemtapText variant="labelMd" className="text-primary-foreground">
              {copy.verifiedImpact}
            </VemtapText>
            <View className="rounded-full bg-white/15 px-2 py-1">
              <VemtapText variant="labelSm" className="text-primary-foreground">
                ★ {copy.tierStatus}
              </VemtapText>
            </View>
          </View>
          <VemtapText
            variant="displayMobile"
            className="text-heading-xl text-primary-foreground"
          >
            {copy.value}
          </VemtapText>
          <VemtapText variant="bodyMd" className="text-primary-foreground">
            {copy.lifetime}
          </VemtapText>
          <View className="gap-2 rounded-card bg-white/10 p-3">
            <View className="flex-row justify-between">
              <VemtapText variant="headingSm" className="text-primary-foreground">
                ★ {copy.goldSaver}
              </VemtapText>
              <VemtapText variant="caption" className="text-primary-foreground">
                {copy.lvl}
              </VemtapText>
            </View>
            <View className="h-2 overflow-hidden rounded-full bg-white/20">
              <View className="h-full w-[81%] rounded-full bg-success" />
            </View>
            <View className="flex-row justify-between gap-2">
              <VemtapText
                variant="caption"
                className="min-w-0 flex-1 text-primary-foreground"
                numberOfLines={1}
              >
                {copy.reached}
              </VemtapText>
              <VemtapText
                variant="caption"
                className="shrink-0 text-primary-foreground"
                numberOfLines={1}
              >
                {copy.remaining}
              </VemtapText>
            </View>
          </View>
        </View>
        <View className="gap-3">
          <View className="flex-row justify-between">
            <VemtapText variant="headingSm">{copy.category}</VemtapText>
            <VemtapText variant="labelSm" tone="brand">
              {copy.redeemed}
            </VemtapText>
          </View>
          <View className="gap-3 rounded-card bg-surface p-4 shadow-sm">
            <View className="h-3 flex-row overflow-hidden rounded-full bg-surface-container">
              <View className="w-[51%] bg-primary" />
              <View className="w-[31%] bg-tertiary" />
              <View className="w-[18%] bg-secondary" />
            </View>
            {[
              [copy.dining, copy.diningMeta, copy.diningValue, 'restaurant'],
              [copy.beauty, copy.beautyMeta, copy.beautyValue, 'spa'],
              [copy.retail, copy.retailMeta, copy.retailValue, 'shoppingBag'],
            ].map(([name, meta, value, icon]) => (
              <View
                key={name}
                className="flex-row items-center justify-between rounded-field bg-surface-container-low p-3"
              >
                <View className="min-w-0 flex-row items-center gap-3">
                  <View className="h-9 w-9 items-center justify-center rounded-lg bg-surface-tint">
                    <Icon name={icon as 'restaurant'} size={20} color={colors.primary} />
                  </View>
                  <View className="min-w-0">
                    <VemtapText variant="labelMd" className="font-sans-semibold">
                      {name}
                    </VemtapText>
                    <VemtapText variant="caption" tone="secondary">
                      {meta}
                    </VemtapText>
                  </View>
                </View>
                <VemtapText variant="labelMd" className="font-sans-bold text-primary">
                  {value}
                </VemtapText>
              </View>
            ))}
          </View>
        </View>
        <View className="gap-3">
          <View className="flex-row justify-between">
            <VemtapText variant="headingSm">{copy.monthly}</VemtapText>
            <VemtapText variant="caption" tone="success">
              {copy.mom}
            </VemtapText>
          </View>
          <View className="gap-4 rounded-card bg-surface p-4 shadow-sm">
            <View className="h-36 flex-row items-end gap-4 px-2">
              {copy.monthValues.map((value, index) => (
                <View
                  key={copy.months[index]}
                  className="min-w-0 flex-1 items-center justify-end gap-2"
                >
                  <VemtapText
                    variant="caption"
                    tone={index === 2 ? 'brand' : 'secondary'}
                  >
                    {value}
                  </VemtapText>
                  <View
                    className={`w-full max-w-12 rounded-t-lg ${index === 2 ? 'h-32 bg-primary' : index === 1 ? 'h-24 bg-secondary-fixed' : 'h-14 bg-secondary-fixed'}`}
                  />
                  <VemtapText
                    variant="labelSm"
                    tone={index === 2 ? 'brand' : 'secondary'}
                  >
                    {copy.months[index]}
                  </VemtapText>
                </View>
              ))}
            </View>
            <View className="flex-row gap-2 rounded-field bg-surface-subtle p-3">
              <Icon name="trendingUp" size={20} color={colors.badgeDiscountText} />
              <VemtapText variant="caption" tone="secondary">
                {copy.trend}
              </VemtapText>
            </View>
          </View>
        </View>
        <View className="gap-3">
          <View className="flex-row justify-between">
            <VemtapText variant="headingSm">{copy.milestones}</VemtapText>
            <VemtapText variant="caption" tone="secondary">
              {copy.claimed}
            </VemtapText>
          </View>
          <View className="gap-2">
            {[
              [copy.firstTap, copy.firstTapBody, 'Unlocked'],
              [copy.foodie, copy.foodieBody, 'Unlocked'],
              [copy.smart, copy.smartBody, 'Unlocked'],
              [copy.vip, copy.vipBody, copy.left],
            ].map(([name, body, status]) => (
              <View
                key={name}
                className="flex-row items-center gap-3 rounded-card bg-surface p-3 shadow-sm"
              >
                <View className="h-10 w-10 items-center justify-center rounded-xl bg-surface-tint">
                  <Icon
                    name={status === 'Unlocked' ? 'verified' : 'lock'}
                    size={22}
                    color={colors.primary}
                  />
                </View>
                <View className="min-w-0 flex-1">
                  <VemtapText variant="labelMd" className="font-sans-semibold">
                    {name}
                  </VemtapText>
                  <VemtapText variant="caption" tone="secondary">
                    {body}
                  </VemtapText>
                </View>
                <VemtapText variant="caption" tone="success">
                  {status}
                </VemtapText>
              </View>
            ))}
          </View>
        </View>
        <View className="gap-3">
          <View className="flex-row justify-between">
            <VemtapText variant="headingSm">{copy.ledger}</VemtapText>
            <Button
              label={copy.seeAll}
              variant="ghost"
              size="sm"
              fullWidth={false}
              onPress={onSeeAll}
            />
          </View>
          <View className="overflow-hidden rounded-card bg-surface shadow-sm">
            <TransactionRow
              title="Urban Grill & Bistro"
              subtitle="Oct 15, 2024 • Prime Lunch"
              amount="₦4,200"
              positive
              icon="restaurant"
            />
            <TransactionRow
              title="Glow & Serenity Spa"
              subtitle="Oct 12, 2024 • Wellness facial"
              amount="₦5,000"
              positive
              icon="spa"
            />
            <TransactionRow
              title="Sole District Apparel"
              subtitle="Oct 08, 2024 • Sneakers"
              amount="₦4,400"
              positive
              icon="fashion"
            />
          </View>
        </View>
      </PageScroll>
    </SafeAreaView>
  );
}

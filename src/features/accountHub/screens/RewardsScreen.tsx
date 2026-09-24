import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
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

const copy = strings.accountScreens.rewards;

export interface RewardsScreenProps {
  onBack?: () => void;
  onHowToEarn?: () => void;
  onRedeem?: (reward: string) => void;
}

export function RewardsScreen({ onBack, onHowToEarn, onRedeem }: RewardsScreenProps) {
  const [tab, setTab] = useState(0);
  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-background">
      <AccountHeader
        title={copy.title}
        onBack={onBack}
        actionIcon="lightbulb"
        onAction={onHowToEarn}
      />
      <PageScroll>
        <View className="gap-4 rounded-card bg-primary p-5 shadow-lg">
          <View className="flex-row items-center gap-2">
            <Icon name="loyalty" size={20} color={colors.surface} />
            <VemtapText variant="labelSm" className="text-primary-foreground">
              {copy.balance.toUpperCase()}
            </VemtapText>
          </View>
          <View className="flex-row items-baseline gap-2">
            <VemtapText
              variant="displayMobile"
              className="text-heading-xl text-primary-foreground"
            >
              {copy.points}
            </VemtapText>
            <VemtapText variant="headingSm" className="text-primary-foreground">
              {copy.unit}
            </VemtapText>
          </View>
          <VemtapText variant="caption" className="text-primary-foreground">
            {copy.equivalent}{' '}
            <VemtapText
              variant="labelSm"
              className="font-sans-semibold text-primary-foreground"
            >
              {copy.credit}
            </VemtapText>
          </VemtapText>
          <Button
            label={copy.earn}
            variant="secondary"
            onPress={onHowToEarn}
            leftIcon={<Icon name="info" size={18} color={colors.primary} />}
          />
        </View>
        <View className="flex-row rounded-xl bg-surface-container-high p-1">
          {copy.tabs.map((label, index) => (
            <Pressable
              key={label}
              accessibilityRole="tab"
              accessibilityState={{ selected: tab === index }}
              onPress={() => setTab(index)}
              className={`min-h-10 flex-1 items-center justify-center rounded-lg px-1 ${tab === index ? 'bg-surface shadow-sm' : ''}`}
            >
              <VemtapText
                variant="labelSm"
                tone={tab === index ? 'brand' : 'secondary'}
                className="text-center"
              >
                {label}
              </VemtapText>
            </Pressable>
          ))}
        </View>
        {tab === 0 ? (
          <View className="gap-3">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <VemtapText variant="headingSm">{copy.redeemYourPoints}</VemtapText>
                <View className="rounded-full bg-surface-container px-2 py-0.5">
                  <VemtapText variant="caption">{copy.ready}</VemtapText>
                </View>
              </View>
              <VemtapText variant="caption" tone="tertiary">
                {copy.tap}
              </VemtapText>
            </View>
            {[
              [
                copy.dining,
                copy.diningPartner,
                copy.diningMeta,
                copy.diningPoints,
                copy.diningBalance,
                'restaurant',
              ],
              [
                copy.wellness,
                copy.wellnessPartner,
                copy.wellnessMeta,
                copy.wellnessPoints,
                copy.wellnessBalance,
                'spa',
              ],
              [
                copy.fashion,
                copy.fashionPartner,
                copy.fashionMeta,
                copy.fashionPoints,
                copy.fashionBalance,
                'fashion',
              ],
            ].map(([title, partner, meta, points, balance, icon]) => (
              <View key={title} className="gap-3 rounded-card bg-surface p-4 shadow-sm">
                <View className="flex-row gap-3">
                  <View className="h-20 w-20 items-center justify-center rounded-field bg-surface-container">
                    <Icon name={icon as 'restaurant'} size={28} color={colors.primary} />
                  </View>
                  <View className="min-w-0 flex-1 gap-1">
                    <View className="flex-row items-center gap-1">
                      <Icon name="storefront" size={14} color={colors.textSecondary} />
                      <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                        {partner}
                      </VemtapText>
                    </View>
                    <VemtapText variant="headingSm" numberOfLines={1}>
                      {title}
                    </VemtapText>
                    <VemtapText variant="caption" tone="secondary">
                      {meta}
                    </VemtapText>
                    <VemtapText variant="labelSm" tone="brand">
                      {points}
                    </VemtapText>
                  </View>
                </View>
                <View className="flex-row items-center justify-between gap-2">
                  <VemtapText variant="caption" tone="tertiary">
                    {balance}
                  </VemtapText>
                  <Button
                    label="Redeem Now"
                    size="sm"
                    fullWidth={false}
                    onPress={() => onRedeem?.(title)}
                  />
                </View>
              </View>
            ))}
            <View className="flex-row gap-3 rounded-card bg-surface-container-low p-4 opacity-80">
              <Icon name="lock" size={24} color={colors.textSecondary} />
              <View className="min-w-0 flex-1">
                <VemtapText variant="headingSm">{copy.locked}</VemtapText>
                <VemtapText variant="caption" tone="secondary">
                  {copy.lockedPartner} • {copy.lockedMeta}
                </VemtapText>
                <VemtapText variant="labelSm" tone="secondary">
                  {copy.lockedPoints} • {copy.need}
                </VemtapText>
              </View>
              <VemtapText variant="labelSm" tone="tertiary">
                {copy.lockedAction}
              </VemtapText>
            </View>
          </View>
        ) : tab === 1 ? (
          <View className="gap-3">
            <View className="flex-row justify-between">
              <VemtapText variant="headingSm">{copy.redeemedTitle}</VemtapText>
              <VemtapText variant="caption" tone="brand">
                {copy.activeVoucher}
              </VemtapText>
            </View>
            <View className="gap-3 rounded-card bg-surface p-4 shadow-sm">
              <View className="flex-row justify-between">
                <View>
                  <VemtapText variant="headingSm">{copy.voucher}</VemtapText>
                  <VemtapText variant="caption" tone="secondary">
                    {copy.redeemedOn}
                  </VemtapText>
                </View>
                <VemtapText variant="caption" tone="success">
                  {copy.active}
                </VemtapText>
              </View>
              <View className="flex-row justify-between rounded-field bg-surface-subtle p-3">
                <View>
                  <VemtapText variant="caption" tone="tertiary">
                    {copy.passcode}
                  </VemtapText>
                  <VemtapText variant="headingSm" className="font-sans-bold">
                    {copy.passcodeValue}
                  </VemtapText>
                </View>
                <Button
                  label={copy.copy}
                  variant="secondary"
                  size="sm"
                  fullWidth={false}
                  onPress={() => undefined}
                  leftIcon={<Icon name="copy" size={16} color={colors.primary} />}
                />
              </View>
              <VemtapText variant="caption" tone="secondary">
                ⏱ {copy.expires}
              </VemtapText>
            </View>
          </View>
        ) : (
          <View className="overflow-hidden rounded-card bg-surface shadow-sm">
            <TransactionRow
              title="Urban Grill & Bistro"
              subtitle="Oct 15, 2024"
              amount="+100 pts"
              positive
              icon="localOffer"
            />
            <TransactionRow
              title="Sole District Boutique"
              subtitle="Oct 12, 2024"
              amount="+75 pts"
              positive
              icon="localOffer"
            />
            <TransactionRow
              title="Cafe Neo Artisan"
              subtitle="Oct 08, 2024"
              amount="+50 pts"
              positive
              icon="localOffer"
            />
          </View>
        )}
      </PageScroll>
    </SafeAreaView>
  );
}

import React, { useState } from 'react';
import { Image, Pressable, View } from 'react-native';
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
import { rewardImages } from '@features/accountHub/data/accountHubImages';

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
              variant="headingLg"
              className="text-heading-lg text-primary-foreground"
            >
              {copy.points}
            </VemtapText>
            <VemtapText variant="labelMd" className="text-primary-foreground">
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
            labelVariant="labelMd"
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
            <View className="flex-row items-center justify-between gap-2">
              <View className="min-w-0 flex-1 flex-row items-center gap-2">
                <VemtapText
                  variant="labelMd"
                  className="font-sans-semibold"
                  numberOfLines={1}
                >
                  {copy.redeemYourPoints}
                </VemtapText>
                <View className="shrink-0 rounded-full bg-surface-container px-2 py-0.5">
                  <VemtapText variant="caption">{copy.ready}</VemtapText>
                </View>
              </View>
              <VemtapText variant="caption" tone="tertiary" className="shrink-0">
                {copy.tap}
              </VemtapText>
            </View>
            {[
              {
                title: copy.dining,
                partner: copy.diningPartner,
                meta: copy.diningMeta,
                points: copy.diningPoints,
                balance: copy.diningBalance,
                image: rewardImages.dining,
              },
              {
                title: copy.wellness,
                partner: copy.wellnessPartner,
                meta: copy.wellnessMeta,
                points: copy.wellnessPoints,
                balance: copy.wellnessBalance,
                image: rewardImages.wellness,
              },
              {
                title: copy.fashion,
                partner: copy.fashionPartner,
                meta: copy.fashionMeta,
                points: copy.fashionPoints,
                balance: copy.fashionBalance,
                image: rewardImages.fashion,
              },
            ].map(({ title, partner, meta, points, balance, image }) => (
              <View key={title} className="gap-3 rounded-card bg-surface p-4 shadow-sm">
                <View className="flex-row gap-3">
                  <Image
                    source={{ uri: image.uri }}
                    accessibilityLabel={image.alt}
                    className="h-20 w-20 shrink-0 rounded-field bg-surface-container"
                    resizeMode="cover"
                  />
                  <View className="min-w-0 flex-1 gap-1">
                    <View className="flex-row items-center gap-1">
                      <Icon name="storefront" size={14} color={colors.textSecondary} />
                      <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                        {partner}
                      </VemtapText>
                    </View>
                    <VemtapText
                      variant="bodyMd"
                      className="font-sans-semibold"
                      numberOfLines={1}
                    >
                      {title}
                    </VemtapText>
                    <VemtapText variant="caption" tone="secondary">
                      {meta}
                    </VemtapText>
                    <VemtapText variant="caption" tone="brand">
                      {points}
                    </VemtapText>
                  </View>
                </View>
                <View className="flex-row items-center justify-between gap-2">
                  <VemtapText
                    variant="caption"
                    tone="tertiary"
                    className="min-w-0 flex-1"
                  >
                    {balance}
                  </VemtapText>
                  <Button
                    label="Redeem Now"
                    size="sm"
                    fullWidth={false}
                    labelVariant="labelSm"
                    labelClassName="text-primary-foreground"
                    rightIcon={
                      <Icon name="arrowForward" size={15} color={colors.surface} />
                    }
                    onPress={() => onRedeem?.(title)}
                  />
                </View>
              </View>
            ))}
            <View className="gap-3 rounded-card bg-surface p-4 opacity-80 shadow-sm">
              <View className="flex-row gap-3">
                <View className="relative h-20 w-20 shrink-0 overflow-hidden rounded-field bg-surface-container-highest">
                  <Image
                    source={{ uri: rewardImages.vip.uri }}
                    accessibilityLabel={rewardImages.vip.alt}
                    className="h-full w-full"
                    resizeMode="cover"
                  />
                  <View className="absolute inset-0 items-center justify-center bg-inverse-surface/40">
                    <Icon name="lock" size={24} color={colors.surface} />
                  </View>
                </View>
                <View className="min-w-0 flex-1 justify-between">
                  <View>
                    <View className="flex-row items-center gap-1">
                      <Icon name="restaurant" size={14} color={colors.textSecondary} />
                      <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                        {copy.lockedPartner}
                      </VemtapText>
                    </View>
                    <VemtapText
                      variant="bodyMd"
                      className="mt-0.5 font-sans-semibold"
                      numberOfLines={1}
                    >
                      {copy.locked}
                    </VemtapText>
                    <VemtapText variant="caption" tone="secondary" numberOfLines={2}>
                      {copy.lockedMeta}
                    </VemtapText>
                  </View>
                  <View className="mt-1 flex-row items-center gap-1">
                    <Icon name="loyalty" size={16} color={colors.textSecondary} />
                    <VemtapText variant="labelSm" className="font-sans-semibold">
                      {copy.lockedPoints}
                    </VemtapText>
                  </View>
                </View>
              </View>
              <View className="flex-row items-center justify-between gap-2">
                <View className="shrink-0 flex-row items-center gap-1 rounded-full bg-surface-container px-2.5 py-1">
                  <Icon name="lock" size={14} color={colors.textTertiary} />
                  <VemtapText variant="caption" tone="tertiary" numberOfLines={1}>
                    {copy.need}
                  </VemtapText>
                </View>
                <Button
                  label={copy.lockedAction}
                  variant="secondary"
                  size="sm"
                  fullWidth={false}
                  disabled
                  labelVariant="labelSm"
                  onPress={() => undefined}
                />
              </View>
            </View>
          </View>
        ) : tab === 1 ? (
          <View className="gap-3">
            <View className="flex-row justify-between gap-2">
              <VemtapText
                variant="labelMd"
                className="min-w-0 flex-1 font-sans-semibold"
                numberOfLines={2}
              >
                {copy.redeemedTitle}
              </VemtapText>
              <VemtapText variant="caption" tone="brand" className="shrink-0">
                {copy.activeVoucher}
              </VemtapText>
            </View>
            <View className="gap-3 rounded-card bg-surface p-4 shadow-sm">
              <View className="flex-row justify-between">
                <View>
                  <VemtapText
                    variant="labelMd"
                    className="font-sans-semibold"
                    numberOfLines={1}
                  >
                    {copy.voucher}
                  </VemtapText>
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
                  <VemtapText variant="labelMd" className="font-sans-bold">
                    {copy.passcodeValue}
                  </VemtapText>
                </View>
                <Button
                  label={copy.copy}
                  labelVariant="labelSm"
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

        <View className="gap-3">
          <View className="flex-row items-center justify-between gap-2">
            <View className="min-w-0 flex-1 flex-row items-center gap-2">
              <Icon name="receipt" size={20} color={colors.secondary} />
              <VemtapText variant="bodyMd" className="flex-1 font-sans-semibold">
                {copy.recentPointsTitle}
              </VemtapText>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={copy.viewAll}
              onPress={() => setTab(2)}
              className="shrink-0"
            >
              <VemtapText variant="labelSm" tone="brand" className="font-sans-semibold">
                {copy.viewAll}
              </VemtapText>
            </Pressable>
          </View>
          <View className="gap-1 rounded-card bg-surface p-2 shadow-sm">
            {copy.ledger.slice(0, 3).map(row => (
              <View
                key={row.title}
                className="flex-row items-center justify-between gap-3 rounded-field p-2"
              >
                <View className="min-w-0 flex-1 flex-row items-center gap-3">
                  <View
                    className={`h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                      row.amount.startsWith('-')
                        ? 'bg-error-container'
                        : 'bg-badge-discount-bg'
                    }`}
                  >
                    <Icon
                      name={row.icon}
                      size={20}
                      color={
                        row.amount.startsWith('-')
                          ? colors.error
                          : colors.badgeDiscountText
                      }
                    />
                  </View>
                  <View className="min-w-0 flex-1">
                    <VemtapText
                      variant="labelMd"
                      className="min-w-0 font-sans-semibold"
                      numberOfLines={1}
                    >
                      {row.title}
                    </VemtapText>
                    <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                      {row.meta}
                    </VemtapText>
                  </View>
                </View>
                <View className="shrink-0 items-end pl-2">
                  <VemtapText
                    variant="labelMd"
                    className={
                      row.amount.startsWith('-')
                        ? 'font-sans-bold text-error'
                        : 'font-sans-bold text-badge-discount-text'
                    }
                    numberOfLines={1}
                  >
                    {row.amount}
                  </VemtapText>
                  <VemtapText variant="caption" tone="tertiary" numberOfLines={1}>
                    {row.note}
                  </VemtapText>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View className="flex-row items-start gap-3 rounded-card bg-surface-container-low p-4">
          <Icon name="info" size={20} color={colors.secondary} />
          <View className="min-w-0 flex-1">
            <VemtapText variant="labelSm" className="font-sans-semibold">
              {copy.policyTitle}
            </VemtapText>
            <VemtapText variant="caption" tone="secondary" className="mt-0.5">
              {copy.policyBody}
            </VemtapText>
          </View>
        </View>
      </PageScroll>
    </SafeAreaView>
  );
}

import React, { useMemo, useState } from 'react';
import { Alert, Clipboard, Image, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  AccountHeader,
  PageScroll,
  TransactionRow,
} from '@features/accountHub/components/AccountScreensPrimitives';
import { EmptyState } from '@components/shared/EmptyState';
import { ErrorState } from '@components/shared/ErrorState';
import { LoadingState } from '@components/shared/LoadingState';
import { showToast } from '@components/shared/toast';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { formatWhen } from '@utils/formatters';
import type { Reward } from '@api/loyaltyApi';
import {
  useLoyaltyBalance,
  useLoyaltyLogs,
  useLoyaltyTier,
  useLoyaltyWallet,
  useMyRedemptions,
  useRedeemReward,
  useRewards,
} from '@features/accountHub/hooks/useLoyalty';

const copy = strings.accountScreens.rewards;
const pts = (n: number) => n.toLocaleString('en-NG');

export interface RewardsScreenProps {
  onBack?: () => void;
  onHowToEarn?: () => void;
}

function RewardCard({
  reward,
  available,
  busy,
  onRedeem,
}: {
  reward: Reward;
  /** The customer's points at the reward's business. */
  available: number;
  busy: boolean;
  onRedeem: () => void;
}) {
  const short = Math.max(0, reward.pointsRequired - available);
  const business = reward.business?.name || copy.unknownBusiness;
  return (
    <View className="gap-3 rounded-card bg-surface p-4 shadow-sm">
      <View className="flex-row gap-3">
        {reward.coverImage ? (
          <Image
            source={{ uri: reward.coverImage }}
            accessibilityLabel={reward.name}
            className="h-20 w-20 shrink-0 rounded-field bg-surface-container"
            resizeMode="cover"
          />
        ) : (
          <View className="h-20 w-20 shrink-0 items-center justify-center rounded-field bg-surface-container">
            <Icon name="loyalty" size={28} color={colors.primary} />
          </View>
        )}
        <View className="min-w-0 flex-1 gap-1">
          <View className="flex-row items-center gap-1">
            <Icon name="storefront" size={14} color={colors.textSecondary} />
            <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
              {business}
            </VemtapText>
          </View>
          <VemtapText variant="bodyMd" className="font-sans-semibold" numberOfLines={2}>
            {reward.name}
          </VemtapText>
          {reward.description ? (
            <VemtapText variant="caption" tone="secondary" numberOfLines={2}>
              {reward.description}
            </VemtapText>
          ) : null}
          <VemtapText variant="caption" tone="brand">
            {copy.rewardPoints(pts(reward.pointsRequired))}
          </VemtapText>
        </View>
      </View>
      <View className="flex-row items-center justify-between gap-2">
        <VemtapText variant="caption" tone="tertiary" className="min-w-0 flex-1">
          {short > 0 ? copy.needMore(pts(short)) : copy.canRedeem}
        </VemtapText>
        <Button
          label={copy.redeem}
          size="sm"
          fullWidth={false}
          labelVariant="labelSm"
          disabled={short > 0 || busy}
          loading={busy}
          onPress={onRedeem}
        />
      </View>
    </View>
  );
}

/**
 * Points, tier and rewards, all from the loyalty API: the global balance and
 * tier, each business's balance (`/loyalty/me/wallet`) to say what the
 * customer can afford, the platform's rewards, the codes already redeemed and
 * the points ledger.
 */
export function RewardsScreen({ onBack, onHowToEarn }: RewardsScreenProps) {
  const [tab, setTab] = useState(0);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const balance = useLoyaltyBalance(null);
  const tier = useLoyaltyTier();
  const wallet = useLoyaltyWallet();
  const rewards = useRewards({});
  const redemptions = useMyRedemptions();
  const logs = useLoyaltyLogs(null, 1, 20);
  const redeem = useRedeemReward();

  const pointsByBusiness = useMemo(
    () => new Map((wallet.data ?? []).map(entry => [entry.businessId, entry.points])),
    [wallet.data],
  );

  const confirmRedeem = (reward: Reward) => {
    const business = reward.business?.name || copy.unknownBusiness;
    Alert.alert(copy.redeemTitle, copy.redeemBody(pts(reward.pointsRequired), business), [
      { text: copy.cancel, style: 'cancel' },
      {
        text: copy.redeemConfirm,
        onPress: () =>
          redeem.mutate(reward.id, {
            onSuccess: result => {
              showToast(copy.redeemed(result.redemptionCode ?? ''), 'success');
              setTab(1);
            },
            onError: error =>
              showToast(
                error instanceof Error ? error.message : copy.redeemFailed,
                'error',
              ),
          }),
      },
    ]);
  };

  const copyCode = (code: string) => {
    Clipboard.setString(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const state = (query: {
    isLoading: boolean;
    isError: boolean;
    refetch: () => unknown;
  }) =>
    query.isLoading ? (
      <LoadingState label={copy.loading} />
    ) : query.isError ? (
      <ErrorState
        title={copy.error.title}
        description={copy.error.body}
        onRetry={() => query.refetch()}
      />
    ) : null;

  const tierData = tier.data;

  return (
    <SafeAreaView edges={[]} className="flex-1 bg-background">
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
              {pts(Number(balance.data ?? 0))}
            </VemtapText>
            <VemtapText variant="labelMd" className="text-primary-foreground">
              {copy.unit}
            </VemtapText>
          </View>
          {tierData?.tier ? (
            <VemtapText variant="caption" className="text-primary-foreground">
              {copy.tier(tierData.tier)}
              {tierData.nextTier && tierData.pointsToNext != null
                ? ` • ${copy.nextTier(pts(tierData.pointsToNext), tierData.nextTier)}`
                : ''}
            </VemtapText>
          ) : null}
          {onHowToEarn ? (
            <Button
              label={copy.earn}
              labelVariant="labelMd"
              variant="secondary"
              onPress={onHowToEarn}
              leftIcon={<Icon name="info" size={18} color={colors.primary} />}
            />
          ) : null}
        </View>

        <View className="flex-row rounded-xl bg-surface-container-high p-1">
          {copy.tabs.map((label, index) => (
            <Pressable
              key={label}
              accessibilityRole="tab"
              accessibilityLabel={label}
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

        {tab === 0
          ? (state(rewards) ??
            ((rewards.data ?? []).length === 0 ? (
              <EmptyState
                icon="loyalty"
                title={copy.emptyRewards.title}
                description={copy.emptyRewards.body}
              />
            ) : (
              <View className="gap-3">
                {(wallet.data ?? []).slice(0, 3).map(entry => (
                  <VemtapText key={entry.businessId} variant="caption" tone="secondary">
                    {copy.pointsAt(
                      pts(entry.points),
                      entry.businessName || copy.unknownBusiness,
                    )}
                  </VemtapText>
                ))}
                {(rewards.data ?? []).map(reward => (
                  <RewardCard
                    key={reward.id}
                    reward={reward}
                    available={pointsByBusiness.get(reward.businessId ?? '') ?? 0}
                    busy={redeem.isPending && redeem.variables === reward.id}
                    onRedeem={() => confirmRedeem(reward)}
                  />
                ))}
              </View>
            )))
          : tab === 1
            ? (state(redemptions) ??
              ((redemptions.data ?? []).length === 0 ? (
                <EmptyState
                  icon="voucher"
                  title={copy.emptyRedeemed.title}
                  description={copy.emptyRedeemed.body}
                />
              ) : (
                <View className="gap-3">
                  {(redemptions.data ?? []).map(item => (
                    <View
                      key={item.code}
                      className="gap-3 rounded-card bg-surface p-4 shadow-sm"
                    >
                      <View>
                        <VemtapText
                          variant="labelMd"
                          className="font-sans-semibold"
                          numberOfLines={1}
                        >
                          {item.rewardName}
                        </VemtapText>
                        <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                          {[item.businessName, item.branchName]
                            .filter(Boolean)
                            .join(' • ')}
                        </VemtapText>
                        {item.redeemedAt ? (
                          <VemtapText variant="caption" tone="tertiary">
                            {copy.redeemedOn(formatWhen(item.redeemedAt))}
                          </VemtapText>
                        ) : null}
                      </View>
                      <View className="flex-row items-center justify-between rounded-field bg-surface-subtle p-3">
                        <View>
                          <VemtapText variant="caption" tone="tertiary">
                            {copy.code}
                          </VemtapText>
                          <VemtapText variant="labelMd" className="font-sans-bold">
                            {item.code}
                          </VemtapText>
                        </View>
                        <Button
                          label={copiedCode === item.code ? copy.copied : copy.copy}
                          labelVariant="labelSm"
                          variant="secondary"
                          size="sm"
                          fullWidth={false}
                          onPress={() => copyCode(item.code)}
                          leftIcon={<Icon name="copy" size={16} color={colors.primary} />}
                        />
                      </View>
                      {item.expiresAt ? (
                        <VemtapText variant="caption" tone="secondary">
                          {copy.expiresOn(formatWhen(item.expiresAt))}
                        </VemtapText>
                      ) : null}
                    </View>
                  ))}
                </View>
              )))
            : (state(logs) ??
              ((logs.data?.data ?? []).length === 0 ? (
                <EmptyState
                  icon="receipt"
                  title={copy.emptyLog.title}
                  description={copy.emptyLog.body}
                />
              ) : (
                <View className="overflow-hidden rounded-card bg-surface shadow-sm">
                  {(logs.data?.data ?? []).map(row => {
                    const debit = row.type === 'spent' || row.type === 'expired';
                    return (
                      <TransactionRow
                        key={row.id}
                        title={row.reason || (debit ? copy.logSpent : copy.logEarned)}
                        subtitle={[formatWhen(row.createdAt), row.branchName]
                          .filter(Boolean)
                          .join(' • ')}
                        amount={copy.logDelta(pts(row.points), debit)}
                        positive={!debit}
                        icon={debit ? 'voucher' : 'localOffer'}
                      />
                    );
                  })}
                </View>
              )))}

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

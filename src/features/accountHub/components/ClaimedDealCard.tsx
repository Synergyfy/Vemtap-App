import React from 'react';
import { Image, Pressable, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { savedImages } from '@features/accountHub/data/accountHubImages';
import { formatCurrency, formatWhen } from '@utils/formatters';
import { countdownLabel } from '@features/deals/utils/offerMapper';
import type { MyClaim } from '@api/claimApi';

cssInterop(Image, { className: 'style' });
cssInterop(Pressable, { className: 'style' });
cssInterop(View, { className: 'style' });

const copy = strings.myDealsHub;

type StatusTone = 'success' | 'urgent' | 'neutral';

/**
 * A claimed deal pass card, shared by the customer dashboard's Active Deals
 * section and the My Deals hub.
 *
 * Everything renders from the `GET /me/claims` row: the badge follows the
 * server's *effective* `status` (never a local `expiresAt` comparison), the
 * countdown is presentational only, and the claim code is only shown while the
 * pass is active — after redemption or expiry the code is no longer redeemable.
 */
export interface ClaimedDealCardProps {
  claim: MyClaim;
  onOpen?: () => void;
  onCopyCode?: () => void;
}

function statusMeta(claim: MyClaim): {
  label: string;
  tone: StatusTone;
  meta?: string;
} {
  switch (claim.status) {
    case 'ACTIVE':
      return {
        label: copy.statusActive,
        tone: 'success',
        meta:
          countdownLabel(claim.expiresAt, Date.now(), {
            days: copy.expiresInDays,
            hours: copy.expiresInHours,
            minutes: copy.expiresInMinutes,
          }) ?? undefined,
      };
    case 'REDEEMED':
      return {
        label: copy.statusRedeemed,
        tone: 'neutral',
        meta: claim.redeemedAt
          ? copy.redeemedOnValue(formatWhen(claim.redeemedAt))
          : undefined,
      };
    case 'EXPIRED':
      return { label: copy.statusExpired, tone: 'urgent' };
  }
}

export function ClaimedDealCard({ claim, onOpen, onCopyCode }: ClaimedDealCardProps) {
  const { offer } = claim;
  const status = statusMeta(claim);
  const isActive = claim.status === 'ACTIVE';

  const price = formatCurrency(offer.calculatedPrice);
  const old =
    offer.originalPrice > offer.calculatedPrice
      ? formatCurrency(offer.originalPrice)
      : undefined;
  const saved = offer.originalPrice - offer.calculatedPrice;
  const save = saved > 0 ? strings.deals.saveN(formatCurrency(saved)) : undefined;

  const location = [offer.branchName, offer.branchAddress].filter(Boolean).join(' • ');

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onOpen}
      className="gap-3 rounded-card bg-surface p-4 shadow-sm"
    >
      <View className="flex-row items-start gap-3">
        <View className="relative h-24 w-24 shrink-0 overflow-hidden rounded-field bg-surface-container-high">
          <Image
            source={{ uri: offer.mainImage ?? savedImages.burger.uri }}
            accessibilityLabel={offer.name}
            className="h-full w-full"
            resizeMode="cover"
          />
          {(offer.discountPercent ?? 0) > 0 ? (
            <View className="absolute left-1 top-1 rounded bg-badge-discount-bg px-1.5 py-0.5">
              <VemtapText
                variant="micro"
                className="font-sans-bold text-badge-discount-text"
              >
                {strings.deals.percentOff(offer.discountPercent)}
              </VemtapText>
            </View>
          ) : null}
        </View>
        <View className="min-w-0 flex-1">
          <View className="mb-1 flex-row items-center justify-between gap-2">
            <View
              className={`min-w-0 flex-row items-center gap-1 rounded-full px-2 py-0.5 ${
                status.tone === 'urgent'
                  ? 'bg-tertiary-fixed'
                  : status.tone === 'neutral'
                    ? 'bg-surface-container-high'
                    : 'bg-badge-discount-bg'
              }`}
            >
              <View
                className={`h-1.5 w-1.5 rounded-full ${
                  status.tone === 'urgent'
                    ? 'bg-tertiary'
                    : status.tone === 'neutral'
                      ? 'bg-text-secondary'
                      : 'bg-badge-discount-text'
                }`}
              />
              <VemtapText
                variant="micro"
                numberOfLines={1}
                className={
                  status.tone === 'urgent'
                    ? 'text-tertiary'
                    : status.tone === 'neutral'
                      ? 'text-text-secondary'
                      : 'text-badge-discount-text'
                }
              >
                {status.label}
              </VemtapText>
            </View>
            {status.meta ? (
              <VemtapText variant="micro" className="shrink-0 text-tertiary-container">
                {status.meta}
              </VemtapText>
            ) : (
              <Icon name="more" size={18} color={colors.textTertiary} />
            )}
          </View>
          <VemtapText variant="bodyMd" className="font-sans-semibold" numberOfLines={1}>
            {offer.businessName}
          </VemtapText>
          {location ? (
            <View className="flex-row items-center gap-1">
              <Icon name="locationOn" size={14} color={colors.primary} />
              <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                {location}
              </VemtapText>
            </View>
          ) : null}
          <VemtapText variant="labelSm" className="font-sans-medium" numberOfLines={1}>
            {offer.name}
          </VemtapText>
          <View className="mt-1 flex-row flex-wrap items-center gap-2">
            <VemtapText variant="labelSm" className="font-sans-bold">
              {price}
            </VemtapText>
            {old ? (
              <VemtapText variant="caption" tone="tertiary" className="line-through">
                {old}
              </VemtapText>
            ) : null}
            {save && isActive ? (
              <VemtapText variant="labelSm" className="text-badge-discount-text">
                {save}
              </VemtapText>
            ) : null}
          </View>
        </View>
      </View>
      <View className="flex-row items-center justify-between gap-2 rounded-lg bg-surface-subtle p-2">
        <View className="min-w-0 flex-row flex-wrap items-center gap-2">
          <VemtapText variant="labelSm" className="font-sans-bold">
            {price}
          </VemtapText>
          {old ? (
            <VemtapText variant="caption" tone="tertiary" className="line-through">
              {old}
            </VemtapText>
          ) : null}
          {save ? (
            <VemtapText variant="labelSm" className="text-badge-discount-text">
              {save}
            </VemtapText>
          ) : null}
        </View>
        {isActive ? (
          <VemtapText variant="labelSm" className="shrink-0 text-tertiary">
            {status.meta}
          </VemtapText>
        ) : null}
      </View>
      {isActive ? (
        <View className="flex-row items-center justify-between rounded-lg bg-surface-container-low px-3 py-2">
          <View className="min-w-0 flex-row items-center gap-2">
            <VemtapText variant="caption" tone="secondary">
              {copy.code}
            </VemtapText>
            <VemtapText variant="labelMd" className="font-sans-bold">
              {claim.claimCode}
            </VemtapText>
          </View>
          {onCopyCode ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${copy.copy} ${claim.claimCode}`}
              onPress={onCopyCode}
              hitSlop={6}
              className="shrink-0 flex-row items-center gap-1"
            >
              <Icon name="copy" size={15} color={colors.primary} />
              <VemtapText variant="labelSm" tone="brand">
                {copy.copy}
              </VemtapText>
            </Pressable>
          ) : null}
        </View>
      ) : null}
      {isActive ? (
        <View className="flex-row items-center gap-1 px-1">
          <Icon name="info" size={15} color={colors.primary} />
          <VemtapText variant="caption" tone="secondary">
            {copy.showServer}
          </VemtapText>
        </View>
      ) : null}
      <View className="flex-row flex-wrap gap-2">
        {isActive ? (
          <Button
            label={copy.useDeal}
            size="sm"
            fullWidth={false}
            className="min-w-0 flex-1"
            labelVariant="labelSm"
            labelClassName="text-primary-foreground"
            leftIcon={<Icon name="qrCode" size={17} color={colors.surface} />}
            onPress={onOpen}
          />
        ) : null}
        <Button
          label={copy.viewPass}
          variant={isActive ? 'secondary' : 'primary'}
          size="sm"
          fullWidth={false}
          className="min-w-0 flex-1"
          labelVariant="labelSm"
          labelClassName={isActive ? undefined : 'text-primary-foreground'}
          leftIcon={
            <Icon
              name="voucher"
              size={17}
              color={isActive ? colors.primary : colors.surface}
            />
          }
          onPress={onOpen}
        />
      </View>
    </Pressable>
  );
}

import React from 'react';
import { View } from 'react-native';
import { cssInterop } from 'nativewind';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { formatCurrency, formatWhen } from '@utils/formatters';
import type { MyGift, MyGiftStatus } from '@api/giftApi';

cssInterop(View, { className: 'style' });

const copy = strings.myDealsHub.giftedCard;

type StatusTone = 'success' | 'neutral' | 'urgent';

/**
 * One row of the My Deals "Gifted" tab: a deal the customer sent to someone
 * else.
 *
 * Rendered entirely from the `GET /me/gifts` row. The status pill is the
 * recipient's outcome, not the sender's — and `rejected` is a real outcome
 * rather than an anomaly, because the server keeps declined gifts for the
 * sender's own history while hiding them from the branch dashboard.
 *
 * Unlike `ClaimedDealCard` there is no code, countdown or action: this is a
 * record of something sent, and a gift the recipient has not claimed yet still
 * belongs to the recipient to claim.
 */
export interface GiftedDealCardProps {
  gift: MyGift;
}

function statusMeta(gift: MyGift): { label: string; tone: StatusTone; meta?: string } {
  switch (gift.status as MyGiftStatus) {
    case 'accepted':
      return {
        label: copy.statusAccepted,
        tone: 'success',
        meta: gift.acceptedAt ? copy.acceptedOn(formatWhen(gift.acceptedAt)) : undefined,
      };
    case 'rejected':
      return {
        label: copy.statusRejected,
        tone: 'urgent',
        // The recipient's reason, when they left one — the server stores a
        // default when they did not.
        meta: gift.rejectionReason ?? undefined,
      };
    case 'pending':
      return { label: copy.statusPending, tone: 'neutral' };
  }
}

export function GiftedDealCard({ gift }: GiftedDealCardProps) {
  const status = statusMeta(gift);
  const recipient = gift.recipientName?.trim() || gift.recipientEmail;

  return (
    <View className="gap-3 rounded-card bg-surface p-4 shadow-sm">
      <View className="flex-row items-start gap-3">
        <View className="h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary-fixed">
          <Icon name="gift" size={20} color={colors.primary} />
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
            <VemtapText variant="micro" className="shrink-0 text-tertiary-container">
              {copy.sentOn(formatWhen(gift.createdAt))}
            </VemtapText>
          </View>

          <VemtapText variant="bodyMd" className="font-sans-semibold" numberOfLines={1}>
            {recipient}
          </VemtapText>
          {gift.recipientName?.trim() ? (
            <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
              {gift.recipientEmail}
            </VemtapText>
          ) : null}

          <VemtapText
            variant="labelMd"
            className="mt-1 font-sans-medium"
            numberOfLines={1}
          >
            {gift.offer.name || copy.offerUnavailable}
          </VemtapText>
          <View className="mt-0.5 flex-row items-center gap-2">
            <VemtapText variant="labelMd" tone="brand" className="font-sans-semibold">
              {formatCurrency(gift.offer.calculatedPrice)}
            </VemtapText>
            {gift.offer.originalPrice != null &&
            gift.offer.originalPrice > gift.offer.calculatedPrice ? (
              <VemtapText variant="caption" tone="tertiary" className="line-through">
                {formatCurrency(gift.offer.originalPrice)}
              </VemtapText>
            ) : null}
            {gift.businessName ? (
              <VemtapText
                variant="caption"
                tone="secondary"
                numberOfLines={1}
                className="flex-1 text-right"
              >
                {gift.businessName}
              </VemtapText>
            ) : null}
          </View>

          {gift.note?.trim() ? (
            <VemtapText
              variant="caption"
              tone="secondary"
              numberOfLines={2}
              className="mt-1"
            >
              {copy.note(gift.note.trim())}
            </VemtapText>
          ) : null}

          {status.meta ? (
            <VemtapText
              variant="micro"
              className="mt-1 text-tertiary-container"
              numberOfLines={2}
            >
              {status.meta}
            </VemtapText>
          ) : null}
        </View>
      </View>
    </View>
  );
}

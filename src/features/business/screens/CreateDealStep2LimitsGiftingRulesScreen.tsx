import React, { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';
import { cn } from '@utils/cn';
import {
  BusinessActionDock,
  BusinessCheckRow,
  BusinessProductImage,
  BusinessProgress,
  BusinessScreenLayout,
  BusinessSectionHeading,
  BusinessStatusPill,
  BusinessStepper,
  BusinessSwitchRow,
  SetupCard,
} from '@features/business/components/BusinessPrimitives';
import { businessMedia } from '@features/business/data/businessSetupData';

export type CreateDealLimitsValue = {
  totalVouchers: number;
  autoPauseWhenSoldOut: boolean;
  claimFrequency: 'once' | 'multiple';
  maxClaimsPerMonth: number;
  acceptGifting: boolean;
  requireRecipientVerification: boolean;
  allowSocialSharingBonus: boolean;
  acceptDineInWalkIns: boolean;
  acceptTakeoutPickup: boolean;
  advanceReservationRequired: boolean;
};

export interface CreateDealStep2LimitsGiftingRulesScreenProps {
  onBack: () => void;
  onContinue?: (value: CreateDealLimitsValue) => void;
  onSave?: (value: CreateDealLimitsValue) => void;
}

export function CreateDealStep2LimitsGiftingRulesScreen({
  onBack,
  onContinue,
  onSave,
}: CreateDealStep2LimitsGiftingRulesScreenProps) {
  const [vouchers, setVouchers] = useState(50);
  const [autoPause, setAutoPause] = useState(true);
  const [claimFrequency, setClaimFrequency] = useState<'once' | 'multiple'>('once');
  const [maxClaims, setMaxClaims] = useState(2);
  const [acceptGifting, setAcceptGifting] = useState(true);
  const [recipientVerification, setRecipientVerification] = useState(true);
  const [socialSharing, setSocialSharing] = useState(true);
  const [dineInWalkIns, setDineInWalkIns] = useState(true);
  const [takeoutPickup, setTakeoutPickup] = useState(true);
  const [reservationRequired, setReservationRequired] = useState(true);
  const value = useMemo(
    () => ({
      totalVouchers: vouchers,
      autoPauseWhenSoldOut: autoPause,
      claimFrequency,
      maxClaimsPerMonth: maxClaims,
      acceptGifting,
      requireRecipientVerification: recipientVerification,
      allowSocialSharingBonus: socialSharing,
      acceptDineInWalkIns: dineInWalkIns,
      acceptTakeoutPickup: takeoutPickup,
      advanceReservationRequired: reservationRequired,
    }),
    [
      acceptGifting,
      autoPause,
      claimFrequency,
      dineInWalkIns,
      maxClaims,
      recipientVerification,
      reservationRequired,
      socialSharing,
      takeoutPickup,
      vouchers,
    ],
  );

  return (
    <BusinessScreenLayout
      header={{
        title: 'Media & Creative',
        eyebrow: 'VEMTAP Merchant',
        onBack,
        actionLabel: 'Save',
        onAction: () => onSave?.(value),
      }}
      contentContainerClassName="pb-6"
      footer={
        <BusinessActionDock>
          <View className="flex-row gap-3">
            <Button
              label="Back to Step 1"
              variant="outline"
              fullWidth={false}
              className="min-h-[52px] min-w-[124px] px-4"
              onPress={onBack}
            />
            <Button
              label="Continue to Branch Availability"
              labelNumberOfLines={2}
              className="min-h-[52px] flex-1 py-2 shadow-lg"
              rightIcon={<Icon name="arrowForward" size={20} color={colors.surface} />}
              onPress={() => onContinue?.(value)}
            />
          </View>
        </BusinessActionDock>
      }
    >
      <BusinessProgress
        label="Step 2 of 4: Limits & Customer Rules"
        percent={50}
        completionLabel="50% Complete"
      />
      <VemtapText tone="secondary" className="mt-1">
        Define voucher availability, claim restrictions, and customer gifting options.
      </VemtapText>

      <View className="mt-4 gap-6">
        <SetupCard>
          <BusinessSectionHeading
            title="Voucher Scarcity & Allocation"
            subtitle="Inventory controls and urgency indicators"
            icon="confirmation"
          />
          <View className="mt-1 gap-2 rounded-lg bg-surface-subtle p-3">
            <BusinessStepper
              label="Total Available Vouchers"
              value={vouchers}
              onDecrease={() => setVouchers(current => Math.max(5, current - 5))}
              onIncrease={() => setVouchers(current => Math.min(500, current + 5))}
              decreaseLabel="Decrease vouchers"
              increaseLabel="Increase vouchers"
              minimumReached={vouchers <= 5}
              maximumReached={vouchers >= 500}
            />
            <View className="flex-row items-start gap-1.5 text-success">
              <Icon name="bolt" size={16} color={colors.badgeDiscountText} />
              <VemtapText variant="caption" className="min-w-0 flex-1 text-success">
                Vouchers will automatically show ‘Almost Gone’ badge at 80% claimed.
              </VemtapText>
            </View>
          </View>
          <BusinessSwitchRow
            title="Auto-pause when sold out"
            subtitle="Prevent overbooking during peak dining hours"
            value={autoPause}
            onValueChange={setAutoPause}
          />
        </SetupCard>

        <SetupCard>
          <BusinessSectionHeading
            title="Customer Claim Restrictions"
            subtitle="Redemption eligibility and frequency"
            icon="verifiedUser"
          />
          <View className="mt-1 gap-2">
            <BusinessCheckRow
              type="radio"
              title="Only Once per Customer"
              subtitle="Prevents single customers from exhausting your promotional budget; recommended for new customer acquisition."
              badge="Recommended"
              selected={claimFrequency === 'once'}
              onPress={() => setClaimFrequency('once')}
            />
            <View
              className={cn(
                'gap-2 rounded-lg bg-surface-subtle p-3',
                claimFrequency === 'multiple' && 'bg-surface-tint',
              )}
            >
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ selected: claimFrequency === 'multiple' }}
                accessibilityLabel="Allow Multiple Claims (Reusable)"
                className="flex-row items-center gap-2"
                onPress={() => setClaimFrequency('multiple')}
              >
                <View
                  className={cn(
                    'h-4 w-4 items-center justify-center rounded-full border',
                    claimFrequency === 'multiple'
                      ? 'border-primary'
                      : 'border-outline-variant bg-surface',
                  )}
                >
                  {claimFrequency === 'multiple' ? (
                    <View className="h-2 w-2 rounded-full bg-primary" />
                  ) : null}
                </View>
                <VemtapText variant="labelMd" className="font-sans-semibold">
                  Allow Multiple Claims (Reusable)
                </VemtapText>
              </Pressable>
              <View className="ml-6 flex-row flex-wrap items-center justify-between gap-2">
                <VemtapText variant="caption" tone="secondary" className="min-w-0 flex-1">
                  Max claims per patron
                </VemtapText>
                <View className="shrink-0 flex-row items-center rounded-lg bg-surface p-1 shadow-sm">
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Decrease claims"
                    className="h-7 w-7 items-center justify-center rounded-md"
                    onPress={() => setMaxClaims(current => Math.max(1, current - 1))}
                  >
                    <Icon name="remove" size={16} color={colors.text} />
                  </Pressable>
                  <VemtapText variant="caption" className="px-2 font-sans-semibold">
                    {maxClaims} / month
                  </VemtapText>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Increase claims"
                    className="h-7 w-7 items-center justify-center rounded-md"
                    onPress={() => setMaxClaims(current => Math.min(20, current + 1))}
                  >
                    <Icon name="plus" size={16} color={colors.text} />
                  </Pressable>
                </View>
              </View>
            </View>
          </View>
        </SetupCard>

        <SetupCard>
          <BusinessSectionHeading
            title="Gifting & Social Sharing"
            subtitle="Viral referral triggers and guest-to-guest transfer"
            icon="share"
          />
          <View className="mt-1 gap-2 rounded-lg bg-surface-subtle p-3">
            <BusinessSwitchRow
              title="Accept Gifting to Friends & Family"
              value={acceptGifting}
              onValueChange={setAcceptGifting}
              icon="gifting"
            />
            <VemtapText variant="caption" tone="secondary" className="pl-7">
              Allows verified diners to gift this voucher code to friends via WhatsApp or
              SMS. Recipient claims in their own name.
            </VemtapText>
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: recipientVerification }}
              accessibilityLabel="Require recipient email/phone verification before claim"
              className="ml-7 flex-row items-start gap-2 py-1"
              onPress={() => setRecipientVerification(current => !current)}
            >
              <View
                className={cn(
                  'mt-0.5 h-4 w-4 items-center justify-center rounded',
                  recipientVerification
                    ? 'bg-primary'
                    : 'border border-border bg-surface',
                )}
              >
                {recipientVerification ? (
                  <Icon name="check" size={12} color={colors.surface} />
                ) : null}
              </View>
              <VemtapText variant="caption" className="min-w-0 flex-1">
                Require recipient email/phone verification before claim
              </VemtapText>
            </Pressable>
          </View>
          <View className="rounded-lg bg-surface-subtle p-3">
            <BusinessSwitchRow
              title="Allow Social Sharing Bonus"
              subtitle="Enables native share sheet with tracked referral link"
              value={socialSharing}
              onValueChange={setSocialSharing}
              icon="campaign"
            />
          </View>
        </SetupCard>

        <SetupCard>
          <BusinessSectionHeading
            title="Other Accept / Reject Factors"
            subtitle="Order channel fulfillment guidelines"
            icon="rules"
          />
          <View className="mt-1 gap-2">
            <FactorRow
              icon="dining"
              title="Accept Dine-In Walk-Ins"
              active={dineInWalkIns}
              onPress={() => setDineInWalkIns(current => !current)}
            />
            <FactorRow
              icon="shoppingBag"
              title="Accept Takeout / Pickup"
              active={takeoutPickup}
              onPress={() => setTakeoutPickup(current => !current)}
            />
            <View className="flex-row items-center justify-between gap-3 rounded-lg bg-surface-container-low p-3 opacity-75">
              <View className="min-w-0 flex-1 flex-row items-center gap-2">
                <Icon name="courier" size={20} color={colors.textTertiary} />
                <View className="min-w-0 flex-1">
                  <VemtapText variant="labelMd" tone="secondary">
                    Third-Party Courier Deliveries
                  </VemtapText>
                  <VemtapText variant="caption" className="text-error">
                    Rejected (Dine-In & Pickup Only)
                  </VemtapText>
                </View>
              </View>
              <View className="h-6 w-10 shrink-0 items-center justify-start rounded-full bg-surface-container-highest p-0.5">
                <View className="h-5 w-5 rounded-full bg-outline" />
              </View>
            </View>
            <View className="gap-2 rounded-lg bg-surface-subtle p-3">
              <BusinessSwitchRow
                icon="reservation"
                title="Advance Reservation Required"
                value={reservationRequired}
                onValueChange={setReservationRequired}
              />
              {reservationRequired ? (
                <VemtapText variant="caption" tone="secondary" className="pl-7">
                  Guests must call or book at least 1 hour prior to arrival.
                </VemtapText>
              ) : null}
            </View>
          </View>
        </SetupCard>

        <SetupCard>
          <View className="flex-row items-center justify-between gap-2">
            <VemtapText
              variant="labelSm"
              tone="secondary"
              className="min-w-0 flex-1 font-sans-semibold uppercase tracking-wider"
            >
              Live Customer Badge Preview
            </VemtapText>
            <View className="shrink-0">
              <Icon name="visibility" size={18} color={colors.primary} />
            </View>
          </View>
          <View className="flex-row items-center gap-3 overflow-hidden rounded-lg bg-surface-container p-3">
            <BusinessProductImage
              source={businessMedia.jollofPreview}
              alt="Nigerian party jollof rice with grilled chicken"
              className="h-16 w-16 shrink-0 rounded-lg shadow-sm"
            />
            <View className="min-w-0 flex-1">
              <View className="flex-row flex-wrap items-center gap-1.5">
                <BusinessStatusPill label="50 Left" tone="success" />
                <View className="rounded-full bg-surface px-2 py-0.5 shadow-sm">
                  <VemtapText variant="caption" className="font-sans-medium text-primary">
                    1 Per Diner
                  </VemtapText>
                </View>
              </View>
              <VemtapText variant="headingSm" className="mt-1" numberOfLines={1}>
                20% Off Weekend Dining
              </VemtapText>
              <VemtapText variant="caption" tone="secondary">
                Min spend ₦5,000 • Dine-in & Pickup
              </VemtapText>
            </View>
          </View>
        </SetupCard>
      </View>
    </BusinessScreenLayout>
  );
}

function FactorRow({
  icon,
  title,
  active,
  onPress,
}: {
  icon: 'dining' | 'shoppingBag';
  title: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: active }}
      accessibilityLabel={title}
      className="flex-row items-center justify-between gap-3 rounded-lg bg-surface-subtle p-3"
      onPress={onPress}
    >
      <View className="min-w-0 flex-1 flex-row items-center gap-2">
        <Icon name={icon} size={20} color={colors.textSecondary} />
        <VemtapText variant="labelMd" className="min-w-0 font-sans-semibold">
          {title}
        </VemtapText>
      </View>
      <View className="shrink-0 flex-row items-center gap-2">
        <VemtapText variant="caption" className="font-sans-semibold text-success">
          {active ? 'Active' : 'Inactive'}
        </VemtapText>
        <View
          className={cn(
            'h-4 w-4 items-center justify-center rounded',
            active ? 'bg-primary' : 'border border-border bg-surface',
          )}
        >
          {active ? <Icon name="check" size={12} color={colors.surface} /> : null}
        </View>
      </View>
    </Pressable>
  );
}

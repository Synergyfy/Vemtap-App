import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { EmptyState } from '@components/shared/EmptyState';
import {
  BusinessActionDock,
  BusinessScreenLayout,
  BusinessStatusPill,
} from '@features/business/components/BusinessPrimitives';
import {
  BusinessIconWell,
  BusinessPanel,
} from '@features/business/components/BusinessOpsPrimitives';
import {
  posBranches,
  posTills,
  tillStatusLabel,
  tillStatusTone,
} from '@features/business/data/businessPosFlowData';

const copy = strings.posBranchTillSwitcher;

export interface PosBranchTillSwitcherScreenProps {
  onBack?: () => void;
  onOpenProfile?: () => void;
  onSelectTill?: (tillId: string) => void;
  onSwitchBranch?: (branchId: string) => void;
  onConfirmSwitch?: () => void;
  onCancel?: () => void;
}

/**
 * POS routing: the current branch and register context, the tills available on
 * it, remote branches, and the security notice that precedes a branch switch.
 */
export function PosBranchTillSwitcherScreen({
  onBack,
  onOpenProfile,
  onSelectTill,
  onSwitchBranch,
  onConfirmSwitch,
  onCancel,
}: PosBranchTillSwitcherScreenProps) {
  const [pendingBranch, setPendingBranch] = useState<string | null>(null);

  return (
    <BusinessScreenLayout
      header={{
        title: copy.headerTitle,
        onBack,
        actions: [
          { icon: 'accountCircle', label: copy.headerTitle, onPress: onOpenProfile },
        ],
      }}
      contentContainerClassName="pb-8"
      footer={
        <BusinessActionDock>
          <Button
            label={copy.confirmCta}
            labelVariant="labelMd"
            onPress={onConfirmSwitch}
            leftIcon={<Icon name="swapHoriz" size={18} color={colors.surface} />}
          />
          <Button
            label={copy.cancelCta}
            labelVariant="labelSm"
            variant="secondary"
            onPress={onCancel}
          />
        </BusinessActionDock>
      }
    >
      <View className="gap-1">
        <VemtapText variant="headingLg" className="text-heading-lg" numberOfLines={2}>
          {copy.headerSubtitle}
        </VemtapText>
        <VemtapText variant="caption" tone="secondary" numberOfLines={2}>
          {copy.routingSub}
        </VemtapText>
      </View>

      <View className="mt-3 gap-2 rounded-card bg-surface p-3 shadow-sm">
        <View className="flex-row items-center gap-2.5">
          <BusinessIconWell icon="storefront" tone="brand" />
          <View className="min-w-0 flex-1">
            <VemtapText variant="caption" tone="tertiary" numberOfLines={1}>
              {copy.currentBranchLabel}
            </VemtapText>
            <VemtapText
              variant="labelMd"
              className="font-sans-semibold"
              numberOfLines={1}
            >
              {copy.currentBranch}
            </VemtapText>
          </View>
          <BusinessStatusPill label="Active" tone="success" />
        </View>
        <View className="flex-row items-center gap-1.5">
          <Icon name="pointOfSale" size={14} color={colors.badgeDiscountText} />
          <VemtapText
            variant="caption"
            className="min-w-0 flex-1 text-badge-discount-text"
            numberOfLines={1}
          >
            {copy.currentBranchStatus}
          </VemtapText>
        </View>
        <View className="flex-row items-center gap-2.5 border-t border-border pt-2">
          <BusinessIconWell icon="verifiedUser" tone="neutral" size="sm" />
          <View className="min-w-0 flex-1">
            <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
              {copy.loggedStaffLabel}
            </VemtapText>
            <VemtapText
              variant="caption"
              className="font-sans-semibold"
              numberOfLines={1}
            >
              {copy.loggedStaff}
            </VemtapText>
          </View>
        </View>
        <View className="flex-row items-center gap-2.5">
          <BusinessIconWell icon="devices" tone="neutral" size="sm" />
          <View className="min-w-0 flex-1">
            <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
              {copy.registerLabel}
            </VemtapText>
            <VemtapText
              variant="caption"
              className="font-sans-semibold"
              numberOfLines={1}
            >
              {copy.register}
            </VemtapText>
          </View>
        </View>
      </View>

      <BusinessPanel
        className="mt-3"
        title={copy.tillsTitle}
        icon="cashRegister"
        badge={copy.tillsBadge}
        badgeTone="brand"
      >
        <View className="gap-2">
          {posTills.map(till => (
            <Pressable
              key={till.id}
              accessibilityRole="button"
              accessibilityLabel={till.name}
              onPress={() => onSelectTill?.(till.id)}
              className="flex-row items-center gap-2.5 rounded-field bg-surface-subtle p-2.5 active:bg-surface-container"
            >
              <View className="min-w-0 flex-1">
                <VemtapText
                  variant="labelMd"
                  className="font-sans-semibold"
                  numberOfLines={2}
                >
                  {till.name}
                </VemtapText>
                <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                  {till.meta}
                </VemtapText>
              </View>
              <View className="shrink-0 items-end gap-1">
                <BusinessStatusPill
                  label={tillStatusLabel[till.status]}
                  tone={tillStatusTone[till.status]}
                />
                <VemtapText
                  variant="labelSm"
                  className="font-sans-semibold"
                  numberOfLines={1}
                >
                  {till.amount}
                </VemtapText>
              </View>
            </Pressable>
          ))}
        </View>
      </BusinessPanel>

      <BusinessPanel
        className="mt-3"
        title={copy.remoteTitle}
        icon="locationOn"
        badge={copy.remoteSub}
        badgeTone="success"
      >
        <View className="gap-2">
          {posBranches.map(branch => {
            const selected = pendingBranch === branch.id;
            return (
              <Pressable
                key={branch.id}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={branch.name}
                onPress={() => {
                  setPendingBranch(branch.id);
                  onSwitchBranch?.(branch.id);
                }}
                className={`gap-1.5 rounded-field p-3 active:scale-[0.99] ${
                  selected ? 'bg-surface-tint' : 'bg-surface-subtle'
                }`}
              >
                <View className="flex-row items-center gap-2.5">
                  <BusinessIconWell
                    icon={branch.current ? 'storefront' : 'storeMallDirectory'}
                    tone={selected ? 'brand' : 'neutral'}
                    size="sm"
                  />
                  <View className="min-w-0 flex-1">
                    <VemtapText
                      variant="labelMd"
                      className={`min-w-0 font-sans-semibold ${selected ? 'text-primary' : ''}`}
                      numberOfLines={1}
                    >
                      {branch.name}
                    </VemtapText>
                    <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                      {branch.address}
                    </VemtapText>
                  </View>
                  <VemtapText
                    variant="labelSm"
                    tone="tertiary"
                    className="shrink-0"
                    numberOfLines={1}
                  >
                    {branch.distance}
                  </VemtapText>
                </View>
                <VemtapText variant="micro" tone="tertiary" numberOfLines={2}>
                  {branch.meta}
                </VemtapText>
                {!branch.current ? (
                  <View className="flex-row items-center gap-1.5 self-start">
                    <VemtapText
                      variant="labelSm"
                      className="font-sans-semibold text-primary"
                      numberOfLines={1}
                    >
                      {`Switch to ${branch.name.replace(' Branch', '')} Branch`}
                    </VemtapText>
                    <Icon name="arrowForward" size={14} color={colors.primary} />
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </BusinessPanel>

      {posTills.length === 0 ? (
        <EmptyState
          icon="cashRegister"
          variant="contained"
          title={copy.empty.title}
          description={copy.empty.body}
        />
      ) : null}

      <View className="mt-3 flex-row items-start gap-2 rounded-field bg-surface-subtle p-2.5">
        <Icon name="verifiedUser" size={14} color={colors.textTertiary} />
        <View className="min-w-0 flex-1">
          <VemtapText variant="caption" className="font-sans-semibold" numberOfLines={1}>
            {copy.securityTitle}
          </VemtapText>
          <VemtapText
            variant="micro"
            tone="tertiary"
            className="mt-0.5"
            numberOfLines={3}
          >
            {copy.securityBody}
          </VemtapText>
        </View>
      </View>
    </BusinessScreenLayout>
  );
}

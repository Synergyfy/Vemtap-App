import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { Input } from '@components/ui/Input';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { EmptyState } from '@components/shared/EmptyState';
import { ErrorState } from '@components/shared/ErrorState';
import { LoadingState } from '@components/shared/LoadingState';
import {
  BusinessActionDock,
  BusinessScreenLayout,
  BusinessStatusPill,
} from '@features/business/components/BusinessPrimitives';
import {
  BusinessIconWell,
  BusinessPanel,
} from '@features/business/components/BusinessOpsPrimitives';

const copy = strings.posBranchTillSwitcher;

export type PosTillStatus = 'active' | 'idle' | 'offline' | 'disabled';

const tillStatusTone: Record<PosTillStatus, 'success' | 'brand' | 'neutral' | 'warning'> =
  {
    active: 'success',
    idle: 'brand',
    offline: 'warning',
    disabled: 'neutral',
  };

export interface PosTillRow {
  id: string;
  name: string;
  /** `Ada Obi since 08:30 AM` or `Available`. */
  meta: string;
  status: PosTillStatus;
  amount: string;
  /** Another cashier's session holds it. */
  occupiedByOther: boolean;
}

export interface PosBranchRow {
  id: string;
  name: string;
  address: string;
  /** e.g. `2 tills · <today's takings> today`. */
  meta: string;
  current: boolean;
}

export interface PosBranchTillView {
  businessName: string;
  currentBranchName: string;
  /** `Till TILL-01 open since 08:30 AM` or the closed copy. */
  registerStatus: string;
  staffName: string;
  /** Till the caller's open session runs on, if any. */
  activeTillId: string | null;
  hasOpenSession: boolean;
  tills: PosTillRow[];
  tillsBadge: string;
  branches: PosBranchRow[];
}

export interface PosBranchTillSwitcherScreenProps {
  view?: PosBranchTillView;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  isSubmitting?: boolean;
  onBack?: () => void;
  onOpenProfile?: () => void;
  /** Confirm: switch branch and/or open a session on the chosen till. */
  onConfirm?: (selection: {
    branchId: string | null;
    tillId: string | null;
    openingCash: number;
  }) => void;
  onCancel?: () => void;
}

/**
 * POS routing: the current branch and register context, the tills available on
 * it, other branches, and the security notice that precedes a switch.
 */
export function PosBranchTillSwitcherScreen({
  view,
  isLoading,
  isError,
  onRetry,
  isSubmitting,
  onBack,
  onOpenProfile,
  onConfirm,
  onCancel,
}: PosBranchTillSwitcherScreenProps) {
  const [pendingBranch, setPendingBranch] = useState<string | null>(null);
  const [pendingTill, setPendingTill] = useState<string | null>(null);
  const [openingCash, setOpeningCash] = useState('');

  const needsFloat = Boolean(pendingTill) && !view?.hasOpenSession;
  const canConfirm = Boolean(pendingBranch || needsFloat);

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
        view ? (
          <BusinessActionDock>
            <Button
              label={copy.confirmCta}
              labelVariant="labelMd"
              disabled={!canConfirm}
              loading={isSubmitting}
              onPress={() =>
                onConfirm?.({
                  branchId: pendingBranch,
                  tillId: needsFloat ? pendingTill : null,
                  openingCash: Number(openingCash.replace(/[^\d.]/g, '')) || 0,
                })
              }
              leftIcon={<Icon name="swapHoriz" size={18} color={colors.surface} />}
            />
            <Button
              label={copy.cancelCta}
              labelVariant="labelSm"
              variant="secondary"
              onPress={onCancel}
            />
          </BusinessActionDock>
        ) : undefined
      }
    >
      {!view ? (
        isError ? (
          <ErrorState
            title={copy.error.title}
            description={copy.error.body}
            onRetry={onRetry}
          />
        ) : (
          <LoadingState label={isLoading ? copy.loading : undefined} />
        )
      ) : (
        <>
          <View className="gap-1">
            <VemtapText variant="headingLg" className="text-heading-lg" numberOfLines={2}>
              {copy.headerSubtitle}
            </VemtapText>
            <VemtapText variant="caption" tone="secondary" numberOfLines={2}>
              {copy.routingSub(view.businessName)}
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
                  {view.currentBranchName}
                </VemtapText>
              </View>
              <BusinessStatusPill label={copy.activeLabel} tone="success" />
            </View>
            <View className="flex-row items-center gap-1.5">
              <Icon name="pointOfSale" size={14} color={colors.badgeDiscountText} />
              <VemtapText
                variant="caption"
                className="min-w-0 flex-1 text-badge-discount-text"
                numberOfLines={1}
              >
                {view.registerStatus}
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
                  {view.staffName}
                </VemtapText>
              </View>
            </View>
          </View>

          <BusinessPanel
            className="mt-3"
            title={copy.tillsTitle(view.currentBranchName)}
            icon="cashRegister"
            badge={view.tillsBadge}
            badgeTone="brand"
          >
            {view.tills.length === 0 ? (
              <EmptyState
                icon="cashRegister"
                variant="contained"
                title={copy.empty.title}
                description={copy.empty.body}
              />
            ) : (
              <View className="gap-2">
                {view.tills.map(till => {
                  const selected =
                    pendingTill === till.id || view.activeTillId === till.id;
                  const blocked = till.occupiedByOther || till.status === 'disabled';
                  return (
                    <Pressable
                      key={till.id}
                      accessibilityRole="button"
                      accessibilityState={{ selected, disabled: blocked }}
                      accessibilityLabel={till.name}
                      disabled={blocked}
                      onPress={() => setPendingTill(till.id)}
                      className={`flex-row items-center gap-2.5 rounded-field p-2.5 active:bg-surface-container ${
                        selected ? 'bg-surface-tint' : 'bg-surface-subtle'
                      }`}
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
                          label={copy.tillStatus[till.status]}
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
                  );
                })}
              </View>
            )}
            {needsFloat ? (
              <Input
                containerClassName="mt-3"
                label={copy.openingFloatLabel}
                keyboardType="numeric"
                value={openingCash}
                onChangeText={setOpeningCash}
                placeholder="0"
              />
            ) : null}
          </BusinessPanel>

          {view.branches.length > 1 ? (
            <BusinessPanel
              className="mt-3"
              title={copy.remoteTitle}
              icon="locationOn"
              badge={copy.remoteSub}
              badgeTone="success"
            >
              <View className="gap-2">
                {view.branches.map(branch => {
                  const selected = pendingBranch === branch.id;
                  return (
                    <Pressable
                      key={branch.id}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      accessibilityLabel={branch.name}
                      disabled={branch.current}
                      onPress={() => setPendingBranch(branch.id)}
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
                          {branch.address ? (
                            <VemtapText
                              variant="caption"
                              tone="secondary"
                              numberOfLines={1}
                            >
                              {branch.address}
                            </VemtapText>
                          ) : null}
                        </View>
                        {branch.current ? (
                          <VemtapText
                            variant="labelSm"
                            tone="tertiary"
                            className="shrink-0"
                            numberOfLines={1}
                          >
                            {copy.currentLabel}
                          </VemtapText>
                        ) : null}
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
                            {copy.switchTo(branch.name)}
                          </VemtapText>
                          <Icon name="arrowForward" size={14} color={colors.primary} />
                        </View>
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>
            </BusinessPanel>
          ) : null}

          <View className="mt-3 flex-row items-start gap-2 rounded-field bg-surface-subtle p-2.5">
            <Icon name="verifiedUser" size={14} color={colors.textTertiary} />
            <View className="min-w-0 flex-1">
              <VemtapText
                variant="caption"
                className="font-sans-semibold"
                numberOfLines={1}
              >
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
        </>
      )}
    </BusinessScreenLayout>
  );
}

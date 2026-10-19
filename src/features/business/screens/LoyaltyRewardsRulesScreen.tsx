import React, { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { BottomSheet } from '@components/shared/BottomSheet';
import { EmptyState, ErrorState, LoadingState } from '@components/shared';
import { Button } from '@components/ui/Button';
import { Icon, type IconName } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import {
  BusinessActionTile,
  BusinessProductImage,
  BusinessScreenLayout,
  BusinessSelectionChip,
  BusinessStatusPill,
} from '@features/business/components/BusinessPrimitives';
import {
  BusinessPanel,
  BusinessSegmentTabs,
} from '@features/business/components/BusinessOpsPrimitives';
import { BusinessPointFeed } from '@features/business/components/LoyaltyPrimitives';
import { FieldInput } from '@features/business/components/BusinessSetupPrimitives';
import type { CreateRewardInput, UpdateRewardInput } from '@api/loyaltyApi';
import type {
  LoyaltyRewardsView,
  RewardCardView,
  RewardTabKey,
} from '@features/business/utils/loyaltyMappers';

cssInterop(Pressable, { className: 'style' });

const copy = strings.loyaltyRewards;

interface RewardForm {
  name: string;
  description: string;
  pointsRequired: string;
  totalQuantity: string;
  expiryDate: string;
  category: string;
  branchId: string;
}

/** Default shelf life for a new perk — one year out from today, in API form. */
function defaultExpiryDate(): string {
  return new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

const isValidDate = (value: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));

export interface LoyaltyRewardsRulesScreenProps {
  /** Live catalogue; while undefined the screen shows loading or the error. */
  view?: LoyaltyRewardsView;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  onBack?: () => void;
  onMoreActions?: () => void;
  /** Create — the route turns this into `POST /loyalty/rewards`. */
  onCreateReward?: (input: CreateRewardInput) => void;
  /** Constraint editor — points cost, stock cap and expiry for one reward. */
  onEditReward?: (rewardId: string, patch: UpdateRewardInput) => void;
  /** Pause/resume; the route writes it as `{ isActive: next }`. */
  onTogglePause?: (rewardId: string, next: boolean) => void;
  onDeleteReward?: (rewardId: string) => void;
}

/**
 * Loyalty rewards catalogue: the branch's rewards grouped into Active, Paused
 * and Expired by the mapper, their editor sheets, the global redemption
 * safeguards, and the recent member redemption feed. Every figure on a card —
 * cost, scope, stock, expiry — is read off the reward row itself.
 */
export function LoyaltyRewardsRulesScreen({
  view,
  isLoading,
  isError,
  onRetry,
  onBack,
  onMoreActions,
  onCreateReward,
  onEditReward,
  onTogglePause,
  onDeleteReward,
}: LoyaltyRewardsRulesScreenProps) {
  const [tab, setTab] = useState<RewardTabKey>('active');
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<RewardCardView | null>(null);
  const [options, setOptions] = useState<RewardCardView | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

  const emptyForm = (): RewardForm => ({
    name: '',
    description: '',
    pointsRequired: '',
    totalQuantity: '',
    expiryDate: defaultExpiryDate(),
    category: copy.categories[0].value,
    branchId: view?.activeBranchId ?? '',
  });
  const [createForm, setCreateForm] = useState<RewardForm>(emptyForm);
  const [editForm, setEditForm] = useState({
    pointsRequired: '',
    totalQuantity: '',
    expiryDate: '',
  });

  const openCreate = () => {
    setCreateForm(emptyForm());
    setCreateError(null);
    setCreateOpen(true);
  };

  const openEdit = (reward: RewardCardView) => {
    setEditForm({
      pointsRequired: String(reward.pointsRequired),
      totalQuantity: String(reward.totalQuantity ?? -1),
      expiryDate: reward.expiryDate
        ? reward.expiryDate.slice(0, 10)
        : defaultExpiryDate(),
    });
    setEditError(null);
    setEditing(reward);
  };

  const submitCreate = () => {
    const name = createForm.name.trim();
    const description = createForm.description.trim();
    const pointsRequired = Number(createForm.pointsRequired.trim());
    const totalQuantity = Number(createForm.totalQuantity.trim());

    if (!name) return setCreateError(copy.errors.name);
    if (!description) return setCreateError(copy.errors.description);
    if (!Number.isFinite(pointsRequired) || pointsRequired < 1) {
      return setCreateError(copy.errors.points);
    }
    if (!Number.isInteger(totalQuantity) || totalQuantity === 0 || totalQuantity < -1) {
      return setCreateError(copy.errors.stock);
    }
    if (!isValidDate(createForm.expiryDate)) {
      return setCreateError(copy.errors.expiry);
    }
    if (!createForm.branchId) return setCreateError(copy.errors.outlet);

    onCreateReward?.({
      name,
      description,
      pointsRequired,
      totalQuantity,
      expiryDate: createForm.expiryDate,
      category: createForm.category as CreateRewardInput['category'],
      branchId: createForm.branchId,
    });
    setCreateError(null);
    setCreateOpen(false);
  };

  const submitEdit = () => {
    if (!editing) return;
    const pointsRequired = Number(editForm.pointsRequired.trim());
    const totalQuantity = Number(editForm.totalQuantity.trim());

    if (!Number.isFinite(pointsRequired) || pointsRequired < 1) {
      return setEditError(copy.errors.points);
    }
    if (!Number.isInteger(totalQuantity) || totalQuantity === 0 || totalQuantity < -1) {
      return setEditError(copy.errors.stock);
    }
    if (!isValidDate(editForm.expiryDate)) return setEditError(copy.errors.expiry);

    onEditReward?.(editing.id, {
      pointsRequired,
      totalQuantity,
      expiryDate: editForm.expiryDate,
    });
    setEditError(null);
    setEditing(null);
  };

  const confirmDelete = (reward: RewardCardView) => {
    setOptions(null);
    Alert.alert(copy.removeTitle, copy.removeBody, [
      { text: copy.cancel, style: 'cancel' },
      {
        text: copy.removeConfirm,
        style: 'destructive',
        onPress: () => onDeleteReward?.(reward.id),
      },
    ]);
  };

  const cards = view?.cards[tab] ?? [];

  return (
    <BusinessScreenLayout
      header={{
        title: copy.headerTitle,
        onBack,
        titleVariant: 'headingSm',
        actions: [
          {
            icon: 'more',
            label: strings.businessShell.moreActionsLabel,
            onPress: onMoreActions,
          },
        ],
      }}
      contentContainerClassName="pb-8"
      footer={
        <View className="pb-2">
          <Button
            label={copy.createAnother}
            labelVariant="labelMd"
            onPress={openCreate}
            leftIcon={<Icon name="plusCircle" size={20} color={colors.surface} />}
          />
        </View>
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
          <View className="mt-1 flex-row items-start justify-between gap-3">
            <VemtapText
              variant="bodyMd"
              tone="secondary"
              className="min-w-0 flex-1 leading-snug"
            >
              {copy.intro}
            </VemtapText>
            <Button
              label={copy.newPerk}
              labelVariant="labelSm"
              size="sm"
              fullWidth={false}
              onPress={openCreate}
              leftIcon={<Icon name="plus" size={17} color={colors.surface} />}
            />
          </View>

          <BusinessSegmentTabs
            className="mt-3"
            accessibilityLabel={copy.catalogTitle}
            tabs={view.tabs}
            value={tab}
            onChange={key => setTab(key as RewardTabKey)}
          />

          <View className="mt-3 flex-row items-center justify-between gap-2">
            <VemtapText variant="labelMd" className="font-sans-semibold">
              {copy.catalogTitle}
            </VemtapText>
            <VemtapText variant="caption" tone="tertiary" numberOfLines={1}>
              {view.activeCountLabel}
            </VemtapText>
          </View>

          <View className="mt-2 gap-3">
            {cards.length ? (
              cards.map(reward => (
                <View
                  key={reward.id}
                  className="gap-3 rounded-card bg-surface p-3 shadow-sm"
                >
                  <View className="flex-row items-start gap-3">
                    <View className="h-16 w-16 shrink-0 overflow-hidden rounded-card bg-surface-container-high">
                      {reward.image ? (
                        <BusinessProductImage
                          source={reward.image}
                          alt={reward.image.alt}
                          className="h-full w-full"
                        />
                      ) : (
                        <View className="h-full w-full items-center justify-center">
                          <Icon name="loyalty" size={24} color={colors.textTertiary} />
                        </View>
                      )}
                    </View>
                    <View className="min-w-0 flex-1">
                      <View className="flex-row items-start justify-between gap-2">
                        <VemtapText
                          variant="labelMd"
                          className="min-w-0 flex-1 font-sans-semibold"
                          numberOfLines={2}
                        >
                          {reward.title}
                        </VemtapText>
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={`${reward.title} — ${copy.editRules}`}
                          hitSlop={8}
                          onPress={() => setOptions(reward)}
                        >
                          <Icon name="more" size={18} color={colors.textTertiary} />
                        </Pressable>
                      </View>
                      <View className="mt-1 flex-row flex-wrap items-center gap-1.5">
                        <View className="flex-row items-center gap-1 rounded-full bg-tertiary-fixed px-2 py-0.5">
                          <Icon name="starFilled" size={12} color={colors.tertiary} />
                          <VemtapText
                            variant="labelSm"
                            className="font-sans-semibold text-tertiary"
                          >
                            {reward.cost}
                          </VemtapText>
                        </View>
                        <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                          {reward.kind}
                        </VemtapText>
                      </View>
                    </View>
                  </View>

                  <View className="gap-1.5 rounded-field bg-surface-subtle p-2.5">
                    <View className="flex-row items-center justify-between gap-2">
                      <View className="min-w-0 flex-1 flex-row items-center gap-1.5">
                        <Icon name="storefront" size={14} color={colors.textSecondary} />
                        <VemtapText
                          variant="caption"
                          tone="secondary"
                          className="min-w-0 flex-1"
                          numberOfLines={1}
                        >
                          {reward.scope}
                        </VemtapText>
                      </View>
                      <VemtapText
                        variant="caption"
                        className="shrink-0 font-sans-semibold text-primary"
                        numberOfLines={1}
                      >
                        {reward.cap}
                      </VemtapText>
                    </View>
                    <View className="flex-row items-center gap-1.5">
                      <Icon name="insights" size={14} color={colors.textSecondary} />
                      <VemtapText
                        variant="caption"
                        tone="secondary"
                        className="min-w-0 flex-1"
                        numberOfLines={1}
                      >
                        {reward.metric}
                      </VemtapText>
                    </View>
                  </View>

                  <View className="flex-row items-center gap-2">
                    <BusinessActionTile
                      label={copy.editRules}
                      icon="tune"
                      tone="brand"
                      onPress={() => openEdit(reward)}
                    />
                    {reward.canToggle && onTogglePause ? (
                      <BusinessActionTile
                        label={reward.status === 'active' ? copy.pause : copy.resume}
                        icon={reward.status === 'active' ? 'hourglass' : 'bolt'}
                        onPress={() =>
                          onTogglePause(reward.id, reward.status !== 'active')
                        }
                      />
                    ) : null}
                    <BusinessStatusPill
                      label={reward.statusLabel}
                      tone={reward.statusTone}
                    />
                  </View>
                </View>
              ))
            ) : (
              <EmptyState
                variant="contained"
                title={copy.emptyTitle}
                description={copy.emptyBody}
              />
            )}
          </View>

          <BusinessPanel
            className="mt-4"
            tone="tint"
            title={copy.safeguardsTitle}
            subtitle={copy.safeguardsSubtitle}
            icon="shield"
          >
            <View className="flex-row items-center justify-between gap-2">
              <VemtapText variant="caption" tone="secondary" className="min-w-0 flex-1">
                {copy.safeguardsSubtitle}
              </VemtapText>
              <BusinessStatusPill label={copy.enforced} tone="success" />
            </View>
            <View className="gap-2">
              {copy.safeguards.map((rule, index) => (
                <View key={rule} className="flex-row items-start gap-2">
                  <Icon
                    name={copy.redemptionsIcons[index] as IconName}
                    size={17}
                    color={colors.primary}
                  />
                  <VemtapText variant="bodyMd" className="min-w-0 flex-1 leading-snug">
                    {rule}
                  </VemtapText>
                </View>
              ))}
            </View>
          </BusinessPanel>

          <BusinessPanel className="mt-4" title={copy.redemptionsTitle} icon="history">
            <View className="flex-row items-center justify-between gap-2">
              <VemtapText
                variant="caption"
                tone="secondary"
                className="min-w-0 flex-1"
                numberOfLines={1}
              >
                {copy.redemptionsSubtitle}
              </VemtapText>
              <View className="h-2.5 w-2.5 shrink-0 rounded-full bg-badge-discount-text" />
            </View>
            <BusinessPointFeed rows={view.feed} />
          </BusinessPanel>
        </>
      )}

      <BottomSheet
        visible={createOpen}
        onClose={() => setCreateOpen(false)}
        title={copy.sheetCreateTitle}
      >
        <View className="gap-3 px-6 pb-4">
          <FieldInput
            label={copy.fields.perkTitle}
            placeholder={copy.fields.perkTitlePlaceholder}
            value={createForm.name}
            onChangeText={value =>
              setCreateForm(current => ({ ...current, name: value }))
            }
          />
          <FieldInput
            label={copy.fields.description}
            placeholder={copy.fields.descriptionPlaceholder}
            value={createForm.description}
            onChangeText={value =>
              setCreateForm(current => ({ ...current, description: value }))
            }
            multiline
          />
          <View className="flex-row gap-2">
            <View className="min-w-0 flex-1">
              <FieldInput
                label={copy.fields.pointsCost}
                placeholder={copy.fields.pointsPlaceholder}
                value={createForm.pointsRequired}
                onChangeText={value =>
                  setCreateForm(current => ({ ...current, pointsRequired: value }))
                }
                keyboardType="numeric"
              />
            </View>
            <View className="min-w-0 flex-1">
              <FieldInput
                label={copy.fields.stockCap}
                placeholder={copy.fields.stockPlaceholder}
                value={createForm.totalQuantity}
                onChangeText={value =>
                  setCreateForm(current => ({ ...current, totalQuantity: value }))
                }
                keyboardType="numeric"
              />
            </View>
          </View>
          <FieldInput
            label={copy.fields.expiryDate}
            placeholder={copy.fields.expiryPlaceholder}
            value={createForm.expiryDate}
            onChangeText={value =>
              setCreateForm(current => ({ ...current, expiryDate: value }))
            }
            keyboardType="numbers-and-punctuation"
            autoCapitalize="none"
          />
          <View className="gap-1.5">
            <VemtapText variant="labelSm" className="font-sans-semibold">
              {copy.fields.perkCategory}
            </VemtapText>
            <View className="flex-row flex-wrap gap-2">
              {copy.categories.map(item => (
                <BusinessSelectionChip
                  key={item.value}
                  label={item.label}
                  selected={createForm.category === item.value}
                  onPress={() =>
                    setCreateForm(current => ({ ...current, category: item.value }))
                  }
                />
              ))}
            </View>
          </View>
          <View className="gap-1.5">
            <VemtapText variant="labelSm" className="font-sans-semibold">
              {copy.fields.applicableOutlets}
            </VemtapText>
            <View className="flex-row flex-wrap gap-2">
              {view?.branchOptions.map(branch => (
                <BusinessSelectionChip
                  key={branch.id}
                  label={branch.label}
                  selected={createForm.branchId === branch.id}
                  onPress={() =>
                    setCreateForm(current => ({ ...current, branchId: branch.id }))
                  }
                />
              ))}
            </View>
          </View>
          {createError ? (
            <VemtapText accessibilityRole="alert" variant="caption" tone="error">
              {createError}
            </VemtapText>
          ) : null}
          <View className="mt-1 flex-row gap-2">
            <Button
              label={copy.cancel}
              labelVariant="labelMd"
              variant="secondary"
              className="flex-1"
              onPress={() => setCreateOpen(false)}
            />
            <Button
              label={copy.publish}
              labelVariant="labelMd"
              className="flex-1"
              onPress={submitCreate}
            />
          </View>
        </View>
      </BottomSheet>

      <BottomSheet
        visible={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={copy.sheetEditTitle}
      >
        <View className="gap-3 px-6 pb-4">
          <FieldInput
            label={copy.fields.pointsCost}
            placeholder={copy.fields.pointsPlaceholder}
            value={editForm.pointsRequired}
            onChangeText={value =>
              setEditForm(current => ({ ...current, pointsRequired: value }))
            }
            keyboardType="numeric"
          />
          <FieldInput
            label={copy.fields.stockCap}
            placeholder={copy.fields.stockPlaceholder}
            value={editForm.totalQuantity}
            onChangeText={value =>
              setEditForm(current => ({ ...current, totalQuantity: value }))
            }
            keyboardType="numeric"
          />
          <FieldInput
            label={copy.fields.expiryDate}
            placeholder={copy.fields.expiryPlaceholder}
            value={editForm.expiryDate}
            onChangeText={value =>
              setEditForm(current => ({ ...current, expiryDate: value }))
            }
            keyboardType="numbers-and-punctuation"
            autoCapitalize="none"
          />
          {editError ? (
            <VemtapText accessibilityRole="alert" variant="caption" tone="error">
              {editError}
            </VemtapText>
          ) : null}
          <Button
            className="mt-1"
            label={copy.savePolicy}
            labelVariant="labelMd"
            onPress={submitEdit}
          />
        </View>
      </BottomSheet>

      <BottomSheet
        visible={Boolean(options)}
        onClose={() => setOptions(null)}
        title={options?.title ?? copy.sheetEditTitle}
      >
        <View className="gap-2 px-6 pb-4">
          <BusinessActionTile
            label={copy.optionEdit}
            icon="tune"
            tone="brand"
            onPress={() => {
              const reward = options;
              setOptions(null);
              if (reward) openEdit(reward);
            }}
          />
          <BusinessActionTile
            label={copy.optionDelete}
            icon="delete"
            tone="errorContainer"
            onPress={() => {
              const reward = options;
              if (reward) confirmDelete(reward);
            }}
          />
        </View>
      </BottomSheet>
    </BusinessScreenLayout>
  );
}

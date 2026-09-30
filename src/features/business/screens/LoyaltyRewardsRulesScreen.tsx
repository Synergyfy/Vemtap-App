import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { BottomSheet } from '@components/shared/BottomSheet';
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
  BusinessLinkRow,
  BusinessPanel,
  BusinessSegmentTabs,
  BusinessToastPill,
} from '@features/business/components/BusinessOpsPrimitives';
import { BusinessCheckLine } from '@features/business/components/BusinessLocationPrimitives';
import { businessOpsImageById } from '@features/business/data/businessOpsImages';

cssInterop(Pressable, { className: 'style' });

const copy = strings.loyaltyRewards;

const tabs = copy.tabs.map(tab => ({
  key: tab.key,
  label: tab.label,
  count: tab.count,
}));

const rewardTone: Record<string, 'brand' | 'success' | 'warning'> = {
  voucher: 'brand',
  dessert: 'warning',
  vip: 'brand',
};

export interface LoyaltyRewardsRulesScreenProps {
  onBack?: () => void;
  onMoreActions?: () => void;
  onEditRules?: (rewardId: string) => void;
  onTogglePause?: (rewardId: string) => void;
  onEditPolicies?: () => void;
  onViewLedger?: () => void;
}

/**
 * Loyalty rewards catalogue: live perks with their points cost, scope and caps,
 * the global redemption safeguards, and the recent member redemption feed.
 */
export function LoyaltyRewardsRulesScreen({
  onBack,
  onMoreActions,
  onEditRules,
  onTogglePause,
  onEditPolicies,
  onViewLedger,
}: LoyaltyRewardsRulesScreenProps) {
  const [tab, setTab] = useState('active');
  const [paused, setPaused] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [category, setCategory] = useState<string>(copy.categories[0]);
  const [constraints, setConstraints] = useState<Record<string, boolean>>({
    [copy.constraints[0]]: true,
    [copy.constraints[1]]: true,
    [copy.constraints[2]]: false,
  });

  return (
    <BusinessScreenLayout
      header={{
        title: copy.headerTitle,
        onBack,
        titleVariant: 'headingSm',
        actions: [{ icon: 'more', label: copy.headerTitle, onPress: onMoreActions }],
      }}
      contentContainerClassName="pb-8"
      footer={
        <View className="pb-2">
          <Button
            label={copy.createAnother}
            labelVariant="labelMd"
            onPress={() => setCreateOpen(true)}
            leftIcon={<Icon name="plusCircle" size={20} color={colors.surface} />}
          />
        </View>
      }
    >
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
          onPress={() => setCreateOpen(true)}
          leftIcon={<Icon name="plus" size={17} color={colors.surface} />}
        />
      </View>

      <BusinessSegmentTabs
        className="mt-3"
        accessibilityLabel={copy.catalogTitle}
        tabs={tabs}
        value={tab}
        onChange={setTab}
      />

      <View className="mt-3 flex-row items-center justify-between gap-2">
        <VemtapText variant="labelMd" className="font-sans-semibold">
          {copy.catalogTitle}
        </VemtapText>
        <VemtapText variant="caption" tone="tertiary" numberOfLines={1}>
          {copy.activePerks}
        </VemtapText>
      </View>

      <View className="mt-2 gap-3">
        {copy.rewards.map(reward => {
          const image = businessOpsImageById[reward.id];
          const isPaused = paused[reward.id] ?? false;
          return (
            <View key={reward.id} className="gap-3 rounded-card bg-surface p-3 shadow-sm">
              <View className="flex-row items-start gap-3">
                <View className="h-16 w-16 shrink-0 overflow-hidden rounded-card bg-surface-container-high">
                  {image ? (
                    <BusinessProductImage
                      source={image}
                      alt={image.alt}
                      className="h-full w-full"
                    />
                  ) : null}
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
                      accessibilityLabel={reward.title}
                      hitSlop={8}
                      onPress={() => setToast(copy.updatedToast)}
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
                  onPress={() => {
                    setEditOpen(true);
                    onEditRules?.(reward.id);
                  }}
                />
                <BusinessActionTile
                  label={isPaused ? copy.resume : copy.pause}
                  icon={isPaused ? 'bolt' : 'hourglass'}
                  onPress={() => {
                    setPaused(current => ({ ...current, [reward.id]: !isPaused }));
                    onTogglePause?.(reward.id);
                  }}
                />
                <BusinessStatusPill
                  label={reward.status}
                  tone={rewardTone[reward.id] ?? 'success'}
                />
              </View>
            </View>
          );
        })}
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
        <BusinessLinkRow label={copy.editPolicies} onPress={onEditPolicies} />
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
        {copy.redemptions.map(entry => (
          <View key={entry.initials} className="flex-row items-center gap-3 py-1">
            <View className="h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-container">
              <VemtapText variant="labelMd" className="font-sans-semibold">
                {entry.initials}
              </VemtapText>
            </View>
            <View className="min-w-0 flex-1">
              <VemtapText variant="labelMd" numberOfLines={1}>
                {entry.name}
              </VemtapText>
              <VemtapText
                variant="caption"
                tone={entry.positive ? 'brand' : 'secondary'}
                numberOfLines={1}
              >
                {entry.detail}
              </VemtapText>
            </View>
            <VemtapText variant="caption" tone="tertiary" className="shrink-0">
              {entry.when}
            </VemtapText>
          </View>
        ))}
        <BusinessLinkRow label={copy.viewLedger} onPress={onViewLedger} />
      </BusinessPanel>

      {toast ? <BusinessToastPill message={toast} /> : null}

      <BottomSheet
        visible={createOpen}
        onClose={() => setCreateOpen(false)}
        title={copy.sheetCreateTitle}
      >
        <View className="gap-3 px-6 pb-4">
          <View className="gap-1.5">
            <VemtapText variant="labelSm" className="font-sans-semibold">
              {copy.fields.perkTitle}
            </VemtapText>
            <View className="min-h-[48px] justify-center rounded-field bg-surface-subtle px-3">
              <VemtapText variant="bodyMd" tone="tertiary" numberOfLines={1}>
                {copy.fields.perkTitlePlaceholder}
              </VemtapText>
            </View>
          </View>
          <View className="flex-row gap-2">
            <View className="min-w-0 flex-1 gap-1.5">
              <VemtapText variant="labelSm" className="font-sans-semibold">
                {copy.fields.pointsCost}
              </VemtapText>
              <View className="min-h-[48px] justify-center rounded-field bg-surface-subtle px-3">
                <VemtapText variant="bodyMd" tone="tertiary">
                  {copy.fields.pointsPlaceholder}
                </VemtapText>
              </View>
            </View>
            <View className="min-w-0 flex-1 gap-1.5">
              <VemtapText variant="labelSm" className="font-sans-semibold">
                {copy.fields.stockCap}
              </VemtapText>
              <View className="min-h-[48px] justify-center rounded-field bg-surface-subtle px-3">
                <VemtapText variant="bodyMd" tone="tertiary" numberOfLines={1}>
                  {copy.fields.stockPlaceholder}
                </VemtapText>
              </View>
            </View>
          </View>
          <View className="gap-1.5">
            <VemtapText variant="labelSm" className="font-sans-semibold">
              {copy.fields.perkCategory}
            </VemtapText>
            <View className="flex-row flex-wrap gap-2">
              {copy.categories.map(item => (
                <BusinessSelectionChip
                  key={item}
                  label={item}
                  selected={category === item}
                  onPress={() => setCategory(item)}
                />
              ))}
            </View>
          </View>
          <View className="gap-1.5">
            <VemtapText variant="labelSm" className="font-sans-semibold">
              {copy.fields.applicableOutlets}
            </VemtapText>
            <View className="min-h-[48px] flex-row items-center justify-between gap-2 rounded-field bg-surface-subtle px-3">
              <VemtapText variant="bodyMd" className="min-w-0 flex-1" numberOfLines={1}>
                {copy.fields.outletsValue}
              </VemtapText>
              <Icon name="expandMore" size={18} color={colors.textTertiary} />
            </View>
          </View>
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
              onPress={() => {
                setCreateOpen(false);
                setToast(copy.updatedToast);
              }}
            />
          </View>
        </View>
      </BottomSheet>

      <BottomSheet
        visible={editOpen}
        onClose={() => setEditOpen(false)}
        title={copy.sheetEditTitle}
      >
        <View className="gap-2 px-6 pb-4">
          {copy.constraints.map(item => (
            <BusinessCheckLine
              key={item}
              label={item}
              checked={constraints[item]}
              tone={constraints[item] ? 'brand' : 'default'}
              onPress={() =>
                setConstraints(current => ({ ...current, [item]: !current[item] }))
              }
            />
          ))}
          <Button
            className="mt-1"
            label={copy.savePolicy}
            labelVariant="labelMd"
            onPress={() => {
              setEditOpen(false);
              setToast(copy.updatedToast);
            }}
          />
        </View>
      </BottomSheet>
    </BusinessScreenLayout>
  );
}

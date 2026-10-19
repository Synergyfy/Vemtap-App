import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { cssInterop } from 'nativewind';
import { BottomSheet } from '@components/shared/BottomSheet';
import { Button } from '@components/ui/Button';
import { Icon, type IconName } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { ErrorState, LoadingState } from '@components/shared';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import {
  BusinessScreenLayout,
  BusinessStatusPill,
  BusinessSwitchRow,
} from '@features/business/components/BusinessPrimitives';
import {
  BusinessLinkRow,
  BusinessPanel,
  BusinessScopePicker,
  BusinessSegmentTabs,
} from '@features/business/components/BusinessOpsPrimitives';
import { BusinessPointFeed } from '@features/business/components/LoyaltyPrimitives';
import { FieldInput } from '@features/business/components/BusinessSetupPrimitives';
import type { LoyaltyRuleFieldKey, UpdateLoyaltyRulesInput } from '@api/loyaltyApi';
import type {
  LoyaltyProgrammeView,
  LoyaltyRuleCardView,
} from '@features/business/utils/loyaltyMappers';

cssInterop(Pressable, { className: 'style' });
cssInterop(LinearGradient, { className: 'style' });

const copy = strings.loyaltyProgramme;

/**
 * `@Min` on `UpdateLoyaltyRuleDto`, per column: the spend rate cannot drop
 * below 1:1 or every purchase would earn nothing, and the bonuses cannot go
 * negative. The server rejects the same bounds — checking here just means the
 * sheet says which field is wrong instead of the generic body error.
 */
const ruleFieldMin: Record<LoyaltyRuleFieldKey, number> = {
  spendingBaseAmount: 1,
  spendingBasePoints: 1,
  visitPoints: 0,
  visitCooldownHours: 0,
  firstVisitBonus: 0,
  birthdayBonus: 0,
  referralBonus: 0,
};

export interface LoyaltyProgrammeConfigurationScreenProps {
  /** Live programme; while undefined the screen shows loading or the error. */
  view?: LoyaltyProgrammeView;
  /** Branch whose rules are on screen — owned by the route that fetches them. */
  scope?: string | null;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  onNotifications?: () => void;
  onChangeScope?: (branchId: string) => void;
  /** Master switch: writes the rules row's single `isActive`. */
  onToggleEnabled?: (enabled: boolean) => void;
  /** Editor save — the numbers the sheet changed, already validated here. */
  onSaveRules?: (patch: Partial<UpdateLoyaltyRulesInput>) => void;
  /** Only wired while the route can take the Rewards tab to a real screen. */
  onTabChange?: (key: string) => void;
  onViewPass?: () => void;
}

/**
 * Loyalty programme configuration: master switch, membership stats, points
 * earning rules, participating-branch scope and the recent-activity tab. Every
 * figure comes from `GET /loyalty/rules` / `business-stats` / `business-logs`;
 * the only thing the screen owns is the rule editor sheet it validates before
 * handing back to the route as a `PATCH`.
 */
export function LoyaltyProgrammeConfigurationScreen({
  view,
  scope,
  isLoading,
  isError,
  onRetry,
  onNotifications,
  onChangeScope,
  onToggleEnabled,
  onSaveRules,
  onTabChange,
  onViewPass,
}: LoyaltyProgrammeConfigurationScreenProps) {
  const [tab, setTab] = useState('programme');
  const [editing, setEditing] = useState<LoyaltyRuleCardView | null>(null);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [draftError, setDraftError] = useState<string | null>(null);

  const branches = view?.branches ?? [];
  const scopeValue = scope ?? branches[0]?.id ?? '';
  const scopeLabel =
    branches.find(branch => branch.id === scopeValue)?.label ?? copy.title;

  /**
   * The Rewards tab is offered only when the route says it goes somewhere; the
   * Activity tab is in-screen, so it selects. Anything else (a Rewards tap with
   * no handler) must not light up a tab whose content would never change.
   */
  const tabs = copy.tabs
    .filter(tabDef => tabDef.key !== 'rewards' || Boolean(onTabChange))
    .map(tabDef => ({
      key: tabDef.key,
      label: tabDef.label,
      count: tabDef.count,
      icon: tabDef.icon as IconName | undefined,
    }));

  const handleTab = (key: string) => {
    if (key === 'activity') {
      setTab('activity');
      return;
    }
    if (key === 'programme') {
      setTab('programme');
      return;
    }
    // Rewards: the route decides where the tab goes, so this screen never
    // lights up a tab it has no content for.
    onTabChange?.(key);
  };

  const openEditor = (card: LoyaltyRuleCardView) => {
    const next: Record<string, string> = {};
    for (const field of card.fields) {
      next[field] = String(view?.values[field] ?? '');
    }
    setDraft(next);
    setDraftError(null);
    setEditing(card);
  };

  const saveEditor = () => {
    if (!editing) return;

    const patch: Partial<UpdateLoyaltyRulesInput> = {};
    for (const field of editing.fields) {
      const raw = (draft[field] ?? '').trim();
      const parsed = Number(raw);
      const label = copy.ruleFields[field];
      if (raw === '' || !Number.isFinite(parsed)) {
        setDraftError(copy.ruleFieldNumber(label));
        return;
      }
      if (parsed < ruleFieldMin[field]) {
        setDraftError(copy.ruleFieldMin(label, ruleFieldMin[field]));
        return;
      }
      patch[field] = parsed;
    }

    setDraftError(null);
    setEditing(null);
    onSaveRules?.(patch);
  };

  return (
    <BusinessScreenLayout
      header={{
        title: copy.headerTitle,
        centerTitle: false,
        titleVariant: 'headingSm',
        actions: [
          {
            icon: 'notifications',
            label: strings.businessShell.notificationsLabel,
            onPress: onNotifications,
          },
        ],
      }}
      contentContainerClassName="pb-8"
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
            <View className="min-w-0 flex-1">
              <VemtapText
                accessibilityRole="header"
                variant="headingLg"
                className="text-heading-lg"
                numberOfLines={2}
              >
                {copy.title}
              </VemtapText>
              <VemtapText variant="bodyMd" tone="secondary" className="mt-0.5">
                {copy.subtitle}
              </VemtapText>
            </View>
            <View className="h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-container shadow-sm">
              <Icon name="trophy" size={20} color={colors.primary} />
            </View>
          </View>

          <BusinessScopePicker
            className="mt-3 self-start"
            label={scopeLabel}
            value={scopeValue}
            options={branches.map(branch => ({ label: branch.label, value: branch.id }))}
            onChange={value => onChangeScope?.(value)}
          />

          <BusinessSegmentTabs
            className="mt-3"
            accessibilityLabel={copy.title}
            tabs={tabs}
            value={tab}
            onChange={handleTab}
          />

          {tab === 'activity' ? (
            <BusinessPanel
              className="mt-3"
              title={copy.activityTitle}
              subtitle={copy.activitySubtitle}
              icon="history"
            >
              <BusinessPointFeed rows={view.activity} />
            </BusinessPanel>
          ) : (
            <>
              <BusinessPanel className="mt-3">
                <View className="flex-row items-start gap-3">
                  <View className="h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface-tint">
                    <Icon name="trophy" size={26} color={colors.primary} />
                  </View>
                  <View className="min-w-0 flex-1">
                    <VemtapText
                      variant="labelMd"
                      className="font-sans-semibold"
                      numberOfLines={2}
                    >
                      {view.name}
                    </VemtapText>
                    <View className="mt-1 flex-row items-center justify-between gap-2">
                      <BusinessStatusPill
                        label={view.statusLabel}
                        tone={view.statusTone}
                      />
                      {onToggleEnabled ? (
                        <View className="shrink-0">
                          <BusinessSwitchRow
                            title=""
                            accessibilityLabel={view.name}
                            value={view.enabled}
                            onValueChange={onToggleEnabled}
                          />
                        </View>
                      ) : null}
                    </View>
                  </View>
                </View>
                {view.stats.length ? (
                  <View className="flex-row gap-2">
                    {view.stats.map(stat => (
                      <View
                        key={stat.label}
                        className="min-w-0 flex-1 gap-0.5 rounded-field bg-surface-subtle p-2.5"
                      >
                        <VemtapText
                          variant="micro"
                          tone="tertiary"
                          className="font-sans-semibold uppercase tracking-wider"
                          numberOfLines={1}
                        >
                          {stat.label}
                        </VemtapText>
                        <VemtapText
                          variant="headingLg"
                          className="font-sans-bold"
                          numberOfLines={1}
                        >
                          {stat.value}
                        </VemtapText>
                        <View className="flex-row items-center gap-1">
                          <Icon
                            name={stat.trendUp ? 'trendingUp' : 'trendingDown'}
                            size={13}
                            color={
                              stat.trendUp
                                ? colors.badgeDiscountText
                                : colors.textTertiary
                            }
                          />
                          <VemtapText
                            variant="caption"
                            className={
                              stat.trendUp
                                ? 'text-badge-discount-text'
                                : 'text-text-tertiary'
                            }
                            numberOfLines={1}
                          >
                            {stat.delta}
                          </VemtapText>
                        </View>
                      </View>
                    ))}
                  </View>
                ) : null}
                <View className="flex-row items-center gap-1.5">
                  <Icon name="info" size={17} color={colors.primary} />
                  <VemtapText
                    variant="caption"
                    tone="secondary"
                    className="min-w-0 flex-1 leading-relaxed"
                  >
                    {copy.accrualNote}
                  </VemtapText>
                </View>
              </BusinessPanel>

              <BusinessPanel
                className="mt-3"
                title={copy.rulesTitle}
                subtitle={copy.rulesSubtitle}
                badge={view.badge}
                badgeTone={view.badgeTone}
              >
                {view.cards.map(card => (
                  <View
                    key={card.id}
                    className="gap-2 rounded-field bg-surface-subtle p-3"
                  >
                    <View className="flex-row items-center gap-2.5">
                      <View className="h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-container">
                        <Icon name={card.icon} size={19} color={colors.primary} />
                      </View>
                      <View className="min-w-0 flex-1">
                        <View className="flex-row flex-wrap items-center gap-1.5">
                          <VemtapText
                            variant="labelMd"
                            className="font-sans-semibold"
                            numberOfLines={1}
                          >
                            {card.title}
                          </VemtapText>
                          <View className="rounded bg-surface-tint px-1.5 py-0.5">
                            <VemtapText
                              variant="micro"
                              className="font-sans-semibold text-primary"
                            >
                              {card.tag}
                            </VemtapText>
                          </View>
                        </View>
                        <VemtapText variant="bodyMd" className="mt-0.5" numberOfLines={1}>
                          {card.value}
                        </VemtapText>
                      </View>
                    </View>
                    <View className="flex-row items-center justify-between gap-2">
                      <View className="min-w-0 flex-1 flex-row items-center gap-1.5">
                        <Icon
                          name={card.footnoteIcon}
                          size={14}
                          color={colors.badgeDiscountText}
                        />
                        <VemtapText
                          variant="caption"
                          tone="secondary"
                          className="min-w-0 flex-1"
                          numberOfLines={1}
                        >
                          {card.footnote}
                        </VemtapText>
                      </View>
                      <BusinessLinkRow
                        label={copy.editRule}
                        onPress={() => openEditor(card)}
                        className="min-h-8"
                      />
                    </View>
                  </View>
                ))}
              </BusinessPanel>

              <BusinessPanel
                className="mt-3"
                title={copy.branchesTitle}
                subtitle={copy.branchesSubtitle}
              >
                <View className="flex-row flex-wrap gap-2">
                  {branches.map(branch => (
                    <View
                      key={branch.id}
                      className={`flex-row items-center gap-1.5 rounded-full px-3 py-1.5 ${
                        branch.active
                          ? 'bg-surface-container'
                          : 'bg-surface-container-highest'
                      }`}
                    >
                      <Icon
                        name={branch.active ? 'checkCircle' : 'hourglass'}
                        size={15}
                        color={
                          branch.active ? colors.badgeDiscountText : colors.textTertiary
                        }
                      />
                      <VemtapText
                        variant="caption"
                        className={branch.active ? '' : 'text-text-tertiary'}
                        numberOfLines={1}
                      >
                        {branch.suffix
                          ? `${branch.label} (${branch.suffix})`
                          : branch.label}
                      </VemtapText>
                    </View>
                  ))}
                </View>
              </BusinessPanel>

              <LinearGradient
                colors={[colors.primary, colors.primaryContainer]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="mt-4 flex-row items-center justify-between gap-3 rounded-card p-4 shadow-sm"
              >
                <View className="min-w-0 flex-1">
                  <VemtapText
                    variant="labelMd"
                    className="font-sans-semibold text-surface"
                    numberOfLines={1}
                  >
                    {copy.previewTitle}
                  </VemtapText>
                  <VemtapText
                    variant="caption"
                    className="text-surface"
                    numberOfLines={2}
                  >
                    {copy.previewBody}
                  </VemtapText>
                </View>
                {onViewPass ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={copy.viewPass}
                    onPress={onViewPass}
                    className="min-h-10 shrink-0 flex-row items-center gap-1.5 rounded-field bg-surface px-3 py-2 active:scale-95"
                  >
                    <VemtapText
                      variant="labelSm"
                      className="font-sans-semibold text-primary"
                    >
                      {copy.viewPass}
                    </VemtapText>
                    <Icon name="arrowForward" size={15} color={colors.primary} />
                  </Pressable>
                ) : null}
              </LinearGradient>
            </>
          )}
        </>
      )}

      <BottomSheet
        visible={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={copy.editTitle}
      >
        <View className="gap-3 px-6 pb-4">
          {editing?.fields.map(field => (
            <FieldInput
              key={field}
              label={copy.ruleFields[field]}
              value={draft[field] ?? ''}
              onChangeText={value =>
                setDraft(current => ({ ...current, [field]: value }))
              }
              keyboardType="numeric"
              autoCapitalize="none"
              accessibilityLabel={copy.ruleFields[field]}
            />
          ))}
          {draftError ? (
            <VemtapText accessibilityRole="alert" variant="caption" tone="error">
              {draftError}
            </VemtapText>
          ) : null}
          <Button
            className="mt-1"
            label={copy.saveRule}
            labelVariant="labelMd"
            onPress={saveEditor}
          />
        </View>
      </BottomSheet>
    </BusinessScreenLayout>
  );
}

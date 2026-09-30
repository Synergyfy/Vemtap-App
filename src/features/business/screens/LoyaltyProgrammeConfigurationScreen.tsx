import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { cssInterop } from 'nativewind';
import { Button } from '@components/ui/Button';
import { Icon, type IconName } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
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
  BusinessScopeCard,
  BusinessScopePicker,
  BusinessSegmentTabs,
  BusinessToastPill,
} from '@features/business/components/BusinessOpsPrimitives';

cssInterop(Pressable, { className: 'style' });
cssInterop(LinearGradient, { className: 'style' });

const copy = strings.loyaltyProgramme;

const tabs = copy.tabs.map(tab => ({
  key: tab.key,
  label: tab.label,
  count: tab.count,
  icon: tab.icon as IconName | undefined,
}));

export interface LoyaltyProgrammeConfigurationScreenProps {
  onNotifications?: () => void;
  onChangeBranch?: (value: string) => void;
  onSave?: () => void;
  onPreviewPass?: () => void;
  onViewPass?: () => void;
  onAddRule?: () => void;
  onEditRule?: (ruleId: string) => void;
}

/**
 * Loyalty programme configuration: master switch, membership stats, points
 * earning rules, participating-branch scope and expiry/retention policy.
 */
export function LoyaltyProgrammeConfigurationScreen({
  onNotifications,
  onChangeBranch,
  onSave,
  onPreviewPass,
  onViewPass,
  onAddRule,
  onEditRule,
}: LoyaltyProgrammeConfigurationScreenProps) {
  const [tab, setTab] = useState('programme');
  const [master, setMaster] = useState(true);
  const [rules, setRules] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(copy.rules.map(rule => [rule.title, true])),
  );
  const [scope, setScope] = useState<'all' | 'selected'>('all');
  const [expiryNotice, setExpiryNotice] = useState(true);
  const [expiry, setExpiry] = useState<string>(copy.expiryValue);
  const [expiryOpen, setExpiryOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <BusinessScreenLayout
      header={{
        title: copy.headerTitle,
        centerTitle: false,
        titleVariant: 'headingSm',
        actions: [{ icon: 'notifications', label: copy.title, onPress: onNotifications }],
      }}
      contentContainerClassName="pb-8"
      footer={
        <View className="gap-2 pb-2">
          <Button
            label={copy.save}
            labelVariant="labelMd"
            onPress={() => {
              setSaved(true);
              onSave?.();
            }}
            leftIcon={<Icon name="save" size={19} color={colors.surface} />}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.previewCustomerPass}
            onPress={onPreviewPass}
            className="min-h-10 flex-row items-center justify-center gap-1.5"
          >
            <VemtapText variant="labelMd" tone="secondary" numberOfLines={1}>
              {copy.previewCustomerPass}
            </VemtapText>
            <Icon name="arrowForward" size={15} color={colors.textSecondary} />
          </Pressable>
        </View>
      }
    >
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
        label={copy.branch}
        value="wuse"
        options={copy.scopeBranches.map(option => ({
          label: option.label,
          value: option.value,
        }))}
        onChange={onChangeBranch ?? (() => undefined)}
      />

      <BusinessSegmentTabs
        className="mt-3"
        accessibilityLabel={copy.title}
        tabs={tabs}
        value={tab}
        onChange={setTab}
      />

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
              {copy.name}
            </VemtapText>
            <View className="mt-1 flex-row items-center justify-between gap-2">
              <BusinessStatusPill label={copy.status} tone="success" />
              <View className="shrink-0">
                <BusinessSwitchRow
                  title=""
                  accessibilityLabel={copy.name}
                  value={master}
                  onValueChange={setMaster}
                />
              </View>
            </View>
          </View>
        </View>
        <View className="flex-row gap-2">
          {copy.stats.map(stat => (
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
                <Icon name="trendingUp" size={13} color={colors.badgeDiscountText} />
                <VemtapText
                  variant="caption"
                  className="text-badge-discount-text"
                  numberOfLines={1}
                >
                  {stat.delta}
                </VemtapText>
              </View>
            </View>
          ))}
        </View>
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
        badge={copy.rulesActive}
        badgeTone="brand"
      >
        {copy.rules.map(rule => (
          <View key={rule.title} className="gap-2 rounded-field bg-surface-subtle p-3">
            <View className="flex-row items-center gap-2.5">
              <View className="h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-container">
                <Icon name={rule.icon as IconName} size={19} color={colors.primary} />
              </View>
              <View className="min-w-0 flex-1">
                <View className="flex-row flex-wrap items-center gap-1.5">
                  <VemtapText
                    variant="labelMd"
                    className="font-sans-semibold"
                    numberOfLines={1}
                  >
                    {rule.title}
                  </VemtapText>
                  <View className="rounded bg-surface-tint px-1.5 py-0.5">
                    <VemtapText
                      variant="micro"
                      className="font-sans-semibold text-primary"
                    >
                      {rule.tag}
                    </VemtapText>
                  </View>
                </View>
                <VemtapText variant="bodyMd" className="mt-0.5" numberOfLines={1}>
                  {rule.value}
                </VemtapText>
              </View>
              <View className="shrink-0">
                <BusinessSwitchRow
                  title=""
                  accessibilityLabel={rule.title}
                  value={rules[rule.title] ?? false}
                  onValueChange={value =>
                    setRules(current => ({ ...current, [rule.title]: value }))
                  }
                />
              </View>
            </View>
            <View className="flex-row items-center justify-between gap-2">
              <View className="min-w-0 flex-1 flex-row items-center gap-1.5">
                <Icon
                  name={rule.footnoteIcon as IconName}
                  size={14}
                  color={colors.badgeDiscountText}
                />
                <VemtapText
                  variant="caption"
                  tone="secondary"
                  className="min-w-0 flex-1"
                  numberOfLines={1}
                >
                  {rule.footnote}
                </VemtapText>
              </View>
              <BusinessLinkRow
                label={copy.editRule}
                onPress={() => onEditRule?.(rule.title)}
                className="min-h-8"
              />
            </View>
          </View>
        ))}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.addRule}
          onPress={onAddRule}
          className="min-h-12 flex-row items-center justify-center gap-2 rounded-field bg-surface-tint active:scale-[0.99]"
        >
          <Icon name="plusCircle" size={19} color={colors.primary} />
          <VemtapText
            variant="labelMd"
            className="font-sans-semibold text-primary"
            numberOfLines={1}
          >
            {copy.addRule}
          </VemtapText>
        </Pressable>
      </BusinessPanel>

      <BusinessPanel
        className="mt-3"
        title={copy.branchesTitle}
        subtitle={copy.branchesSubtitle}
      >
        <View className="gap-2">
          <BusinessScopeCard
            title={copy.scopeAll}
            body={copy.scopeAllBody}
            selected={scope === 'all'}
            onPress={() => setScope('all')}
          />
          <BusinessScopeCard
            title={copy.scopeSelected}
            body={copy.scopeSelectedBody}
            selected={scope === 'selected'}
            onPress={() => setScope('selected')}
          />
        </View>
        <View className="flex-row flex-wrap gap-2">
          {[
            {
              label: strings.locationsBranches.branches[0].name,
              suffix: copy.flagshipSuffix,
              active: true,
            },
            {
              label: strings.locationsBranches.branches[1].name,
              suffix: '',
              active: true,
            },
            {
              label: strings.locationsBranches.branches[2].name,
              suffix: copy.pausedSuffix,
              active: false,
            },
          ].map(branch => (
            <View
              key={branch.label}
              className={`flex-row items-center gap-1.5 rounded-full px-3 py-1.5 ${
                branch.active ? 'bg-surface-container' : 'bg-surface-container-highest'
              }`}
            >
              <Icon
                name={branch.active ? 'checkCircle' : 'hourglass'}
                size={15}
                color={branch.active ? colors.badgeDiscountText : colors.textTertiary}
              />
              <VemtapText
                variant="caption"
                className={branch.active ? '' : 'text-text-tertiary'}
                numberOfLines={1}
              >
                {branch.suffix ? `${branch.label} (${branch.suffix})` : branch.label}
              </VemtapText>
            </View>
          ))}
        </View>
      </BusinessPanel>

      <BusinessPanel
        className="mt-3"
        title={copy.expiryTitle}
        subtitle={copy.expirySubtitle}
        icon="shieldPerson"
      >
        <VemtapText variant="labelSm" tone="secondary">
          {copy.expiryLabel}
        </VemtapText>
        <View className="relative">
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ expanded: expiryOpen }}
            accessibilityLabel={copy.expiryLabel}
            onPress={() => setExpiryOpen(open => !open)}
            className="min-h-[52px] flex-row items-center justify-between gap-2 rounded-field bg-surface-subtle px-4"
          >
            <VemtapText variant="labelMd" className="min-w-0 flex-1" numberOfLines={1}>
              {expiry}
            </VemtapText>
            <Icon name="expandMore" size={18} color={colors.textTertiary} />
          </Pressable>
          {expiryOpen ? (
            <View className="absolute left-0 right-0 top-full z-20 mt-1 gap-1 rounded-xl bg-surface p-1.5 shadow-xl">
              {copy.expiryOptions.map(option => (
                <Pressable
                  key={option}
                  accessibilityRole="button"
                  accessibilityState={{ selected: option === expiry }}
                  accessibilityLabel={option}
                  onPress={() => {
                    setExpiry(option);
                    setExpiryOpen(false);
                  }}
                  className={`flex-row items-center justify-between gap-2 rounded-lg px-3 py-2 ${
                    option === expiry ? 'bg-surface-tint' : 'active:bg-surface-subtle'
                  }`}
                >
                  <VemtapText
                    variant="labelSm"
                    className={option === expiry ? 'font-sans-semibold text-primary' : ''}
                    numberOfLines={1}
                  >
                    {option}
                  </VemtapText>
                  {option === expiry ? (
                    <Icon name="check" size={15} color={colors.primary} />
                  ) : null}
                </Pressable>
              ))}
            </View>
          ) : null}
        </View>
        <View className="flex-row items-start gap-3 rounded-field bg-surface-subtle p-3">
          <Icon name="mailRead" size={19} color={colors.primary} />
          <View className="min-w-0 flex-1">
            <VemtapText variant="labelSm" className="font-sans-semibold">
              {copy.noticeTitle}
            </VemtapText>
            <VemtapText
              variant="caption"
              tone="secondary"
              className="mt-0.5 leading-snug"
            >
              {copy.noticeBody}
            </VemtapText>
          </View>
          <View className="shrink-0">
            <BusinessSwitchRow
              title=""
              accessibilityLabel={copy.noticeTitle}
              value={expiryNotice}
              onValueChange={setExpiryNotice}
            />
          </View>
        </View>
        <View className="flex-row items-center justify-between gap-3 rounded-field bg-surface-subtle p-3">
          <View className="min-w-0 flex-1">
            <VemtapText variant="labelSm" className="font-sans-medium">
              {copy.capLabel}
            </VemtapText>
            <VemtapText variant="caption" tone="secondary" className="mt-0.5">
              {copy.capBody}
            </VemtapText>
          </View>
          <View className="shrink-0 rounded-field bg-surface px-3 py-1.5 shadow-sm">
            <VemtapText variant="labelMd" className="font-sans-bold text-primary">
              {copy.capValue}
            </VemtapText>
          </View>
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
          <VemtapText variant="caption" className="text-surface" numberOfLines={2}>
            {copy.previewBody}
          </VemtapText>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.viewPass}
          onPress={onViewPass}
          className="min-h-10 shrink-0 flex-row items-center gap-1.5 rounded-field bg-surface px-3 py-2 active:scale-95"
        >
          <VemtapText variant="labelSm" className="font-sans-semibold text-primary">
            {copy.viewPass}
          </VemtapText>
          <Icon name="arrowForward" size={15} color={colors.primary} />
        </Pressable>
      </LinearGradient>

      {saved ? <BusinessToastPill message={copy.saved} /> : null}
    </BusinessScreenLayout>
  );
}

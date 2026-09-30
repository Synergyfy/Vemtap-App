import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { Icon, type IconName } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import {
  BusinessInlineAction,
  BusinessScreenLayout,
  BusinessStatusPill,
} from '@features/business/components/BusinessPrimitives';
import {
  BusinessMenuRow,
  type BusinessMenuAccent,
  type BusinessMenuMeta,
} from '@features/business/components/BusinessOpsPrimitives';
import {
  HorizontallyScrollableRow,
  SetupCallout,
} from '@features/business/components/BusinessSetupPrimitives';

cssInterop(Pressable, { className: 'style' });

const copy = strings.businessManagementHub;

export interface BusinessManagementHubScreenProps {
  onNotifications?: () => void;
  onHelp?: () => void;
  onChangeBranch?: (value: string) => void;
  onOpenModule?: (id: string) => void;
  onExploreArchitecture?: () => void;
}

/**
 * Business tab root: branch scope, a two-tile realtime mosaic and the seven
 * management modules that own every destination below this screen.
 */
export function BusinessManagementHubScreen({
  onNotifications,
  onHelp,
  onChangeBranch,
  onOpenModule,
  onExploreArchitecture,
}: BusinessManagementHubScreenProps) {
  const [branch, setBranch] = useState<string>(copy.branches[0].value);

  const selectBranch = (value: string, label: string) => {
    setBranch(value);
    onChangeBranch?.(value);
    return label;
  };

  const activeBranch =
    copy.branches.find(option => option.value === branch) ?? copy.branches[0];

  return (
    <BusinessScreenLayout
      header={{
        title: activeBranch.label,
        eyebrow: copy.eyebrow,
        centerTitle: false,
        titleVariant: 'headingSm',
        actions: [{ icon: 'notifications', label: copy.title, onPress: onNotifications }],
      }}
      contentContainerClassName="pb-8"
    >
      <View className="flex-row items-center justify-between gap-2">
        <BusinessStatusPill
          label={copy.verifiedBranches}
          tone="success"
          icon="verified"
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.help}
          onPress={onHelp}
          className="h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-container active:scale-95"
        >
          <Icon name="help" size={18} color={colors.primary} />
        </Pressable>
      </View>

      <View className="mt-3">
        <VemtapText
          accessibilityRole="header"
          variant="headingLg"
          className="text-heading-lg"
        >
          {copy.title}
        </VemtapText>
        <VemtapText variant="bodyMd" tone="secondary" className="mt-1">
          {copy.subtitle}
        </VemtapText>
      </View>

      <HorizontallyScrollableRow>
        {copy.branches.map(option => {
          const selected = option.value === branch;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={option.label}
              onPress={() => selectBranch(option.value, option.label)}
              className={`min-h-9 shrink-0 flex-row items-center gap-1.5 rounded-full px-3 py-1.5 ${
                selected ? 'bg-surface-tint shadow-sm' : 'bg-surface-container-low'
              }`}
            >
              {'icon' in option && option.icon ? (
                <Icon
                  name={option.icon as IconName}
                  size={15}
                  color={selected ? colors.primary : colors.textSecondary}
                />
              ) : null}
              <VemtapText
                variant="labelSm"
                className={
                  selected ? 'font-sans-semibold text-primary' : 'text-text-secondary'
                }
                numberOfLines={1}
              >
                {option.label}
              </VemtapText>
              {selected ? (
                <Icon name="expandMore" size={14} color={colors.primary} />
              ) : null}
            </Pressable>
          );
        })}
      </HorizontallyScrollableRow>

      <View className="mt-2 flex-row gap-2">
        {copy.quickStats.map(stat => (
          <View
            key={stat.label}
            className="min-w-0 flex-1 flex-row items-center gap-3 rounded-card bg-surface p-3 shadow-sm"
          >
            <View
              className={`h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                stat.accent === 'tertiary' ? 'bg-tertiary-fixed' : 'bg-surface-tint'
              }`}
            >
              <Icon
                name={stat.icon as IconName}
                size={20}
                color={
                  stat.accent === 'tertiary' ? colors.tertiaryContainer : colors.primary
                }
              />
            </View>
            <View className="min-w-0 flex-1">
              <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                {stat.label}
              </VemtapText>
              <View className="mt-0.5 flex-row items-center gap-1.5">
                {stat.live ? (
                  <View className="h-2 w-2 shrink-0 rounded-full bg-badge-discount-text" />
                ) : null}
                <VemtapText
                  variant="labelMd"
                  className="min-w-0 flex-1 font-sans-semibold"
                  numberOfLines={1}
                >
                  {stat.value}
                </VemtapText>
              </View>
            </View>
          </View>
        ))}
      </View>

      <View className="mt-3 gap-2">
        {copy.menu.map(item => (
          <BusinessMenuRow
            key={item.id}
            title={item.title}
            subtitle={item.subtitle}
            icon={item.icon as IconName}
            accent={item.accent as BusinessMenuAccent}
            meta={item.meta as unknown as BusinessMenuMeta[]}
            onPress={() => onOpenModule?.(item.id)}
          />
        ))}
      </View>

      <SetupCallout
        icon="hub"
        tone="tint"
        iconSurface="circlePrimary"
        iconSize={20}
        title={copy.ecosystemTitle}
        titleClassName="font-sans-semibold"
        body={copy.ecosystemBody}
        bodyVariant="bodyMd"
      >
        <BusinessInlineAction
          label={copy.ecosystemLink}
          icon="arrowForward"
          onPress={onExploreArchitecture}
        />
      </SetupCallout>
    </BusinessScreenLayout>
  );
}

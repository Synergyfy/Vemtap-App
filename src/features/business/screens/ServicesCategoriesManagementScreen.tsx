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
  BusinessProductImage,
  BusinessScreenLayout,
  BusinessSelectionChip,
  BusinessStatusPill,
} from '@features/business/components/BusinessPrimitives';
import {
  BusinessChipScroller,
  BusinessInfoStrip,
  BusinessPanel,
  BusinessScopePicker,
  BusinessSegmentTabs,
  BusinessSheetActionRow,
} from '@features/business/components/BusinessOpsPrimitives';
import { SetupCallout } from '@features/business/components/BusinessSetupPrimitives';
import { businessOpsImageById } from '@features/business/data/businessOpsImages';

cssInterop(Pressable, { className: 'style' });

const copy = strings.servicesCategories;

const tabs = copy.tabs.map(tab => ({ key: tab.key, label: tab.label, count: tab.count }));

const categoryAccent: Record<string, string> = {
  brand: 'bg-surface-tint',
  neutral: 'bg-surface-container',
  tertiary: 'bg-tertiary-fixed',
};

const categoryAccentIcon: Record<string, string> = {
  brand: colors.primary,
  neutral: colors.secondary,
  tertiary: colors.tertiaryContainer,
};

export interface ServicesCategoriesManagementScreenProps {
  onNotifications?: () => void;
  onAddService?: () => void;
  onAddCategory?: () => void;
  onEditService?: (serviceId: string) => void;
  onServiceAction?: (actionId: string, serviceId: string) => void;
  onEditCategory?: (categoryId: string) => void;
  onArchiveCategory?: (categoryId: string) => void;
  onReorderCategory?: (categoryId: string) => void;
}

/**
 * Services & categories management: appointment-based services with their
 * availability pills, and the reorderable catalogue category list that drives
 * the customer menu.
 */
export function ServicesCategoriesManagementScreen({
  onNotifications,
  onAddService,
  onAddCategory,
  onEditService,
  onServiceAction,
  onEditCategory,
  onArchiveCategory,
  onReorderCategory,
}: ServicesCategoriesManagementScreenProps) {
  const [tab, setTab] = useState('services');
  const [filter, setFilter] = useState('all');
  const [sheetService, setSheetService] = useState<string | null>(null);

  return (
    <BusinessScreenLayout
      header={{
        title: strings.centralCatalogue.servicesHeader,
        centerTitle: false,
        titleVariant: 'headingSm',
        actions: [
          { icon: 'notifications', label: copy.tabs[1].label, onPress: onNotifications },
        ],
      }}
      contentContainerClassName="pb-8"
    >
      <View className="mt-1 flex-row items-center justify-between gap-2">
        <BusinessScopePicker
          label={copy.tabs[1].label}
          value="all"
          options={copy.scopeBranches.map(option => ({
            label: option.label,
            value: option.value,
          }))}
          onChange={() => undefined}
        />
      </View>

      <View className="mt-3">
        <BusinessSegmentTabs
          tabs={tabs}
          value={tab}
          onChange={setTab}
          accessibilityLabel={strings.centralCatalogue.servicesHeader}
        />
      </View>

      <View className="mt-3">
        <BusinessChipScroller>
          {copy.filters.map(chip => (
            <BusinessSelectionChip
              key={chip.key}
              label={chip.label}
              selected={filter === chip.key}
              showCheck={false}
              onPress={() => setFilter(chip.key)}
            />
          ))}
        </BusinessChipScroller>
      </View>

      <View className="mt-4 flex-row items-start justify-between gap-3">
        <View className="min-w-0 flex-1">
          <View className="flex-row flex-wrap items-center gap-2">
            <VemtapText variant="labelMd" className="font-sans-semibold">
              {copy.servicesTitle}
            </VemtapText>
            <BusinessStatusPill label={copy.servicesLive} tone="success" />
          </View>
          <VemtapText variant="caption" tone="secondary" className="mt-0.5">
            {copy.servicesSubtitle}
          </VemtapText>
        </View>
        <Button
          label={copy.addService}
          labelVariant="labelSm"
          size="sm"
          fullWidth={false}
          onPress={onAddService}
          leftIcon={<Icon name="plus" size={16} color={colors.surface} />}
        />
      </View>

      <View className="mt-3 gap-3">
        {copy.services.map(service => {
          const image = businessOpsImageById[service.id];
          return (
            <View
              key={service.id}
              className="gap-3 overflow-hidden rounded-card bg-surface p-3 shadow-sm"
            >
              <View className="flex-row items-start gap-3">
                <View className="relative h-20 w-20 shrink-0 overflow-hidden rounded-card bg-surface-container">
                  {image ? (
                    <BusinessProductImage
                      source={image}
                      alt={image.alt}
                      className="h-full w-full"
                    />
                  ) : null}
                  <View className="absolute left-1 top-1 rounded bg-surface px-1.5 py-0.5">
                    <VemtapText
                      variant="micro"
                      className="font-sans-semibold text-primary"
                    >
                      {service.tag}
                    </VemtapText>
                  </View>
                </View>
                <View className="min-w-0 flex-1">
                  <View className="flex-row items-start justify-between gap-2">
                    <VemtapText
                      variant="micro"
                      tone="tertiary"
                      className="font-sans-medium uppercase tracking-wider"
                      numberOfLines={1}
                    >
                      {service.eyebrow}
                    </VemtapText>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={service.name}
                      hitSlop={8}
                      onPress={() => setSheetService(service.id)}
                    >
                      <Icon name="more" size={19} color={colors.textSecondary} />
                    </Pressable>
                  </View>
                  <VemtapText
                    variant="labelMd"
                    className="mt-1 font-sans-semibold"
                    numberOfLines={2}
                  >
                    {service.name}
                  </VemtapText>
                  <View className="mt-1 flex-row items-baseline gap-1.5">
                    <VemtapText
                      variant="labelSm"
                      className="font-sans-semibold text-primary"
                    >
                      {service.price}
                    </VemtapText>
                    {'priceSuffix' in service && service.priceSuffix ? (
                      <VemtapText variant="caption" tone="secondary">
                        {service.priceSuffix}
                      </VemtapText>
                    ) : null}
                    <Icon name="schedule" size={14} color={colors.textSecondary} />
                    <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                      {service.duration}
                    </VemtapText>
                  </View>
                </View>
              </View>
              <View className="flex-row flex-wrap items-center gap-2">
                <BusinessStatusPill label={service.status} tone="success" />
              </View>
              <View className="flex-row items-center gap-1.5 rounded-field bg-surface-subtle px-2.5 py-2">
                <Icon name="info" size={15} color={colors.textSecondary} />
                <VemtapText
                  variant="caption"
                  tone="secondary"
                  className="min-w-0 flex-1"
                  numberOfLines={2}
                >
                  {service.note}
                </VemtapText>
              </View>
            </View>
          );
        })}
      </View>

      <View className="mt-5 flex-row items-start justify-between gap-3">
        <View className="min-w-0 flex-1">
          <View className="flex-row items-center gap-2">
            <VemtapText variant="labelMd" className="font-sans-semibold">
              {copy.categoriesTitle}
            </VemtapText>
            <View className="h-2 w-2 rounded-full bg-primary" />
          </View>
          <VemtapText variant="caption" tone="secondary" className="mt-0.5">
            {copy.categoriesSubtitle}
          </VemtapText>
        </View>
        <Button
          label={copy.addCategory}
          labelVariant="labelSm"
          size="sm"
          variant="secondary"
          fullWidth={false}
          onPress={onAddCategory}
          leftIcon={<Icon name="folderStar" size={16} color={colors.primary} />}
        />
      </View>

      <View className="mt-3 gap-2">
        {copy.categories.map(category => (
          <View
            key={category.id}
            className="flex-row items-center gap-3 rounded-card bg-surface p-3 shadow-sm"
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${copy.reorderLabel} ${category.title}`}
              onPress={() => onReorderCategory?.(category.id)}
              hitSlop={6}
              className="shrink-0 rounded-lg p-1 active:bg-surface-subtle"
            >
              <Icon name="drag" size={19} color={colors.textTertiary} />
            </Pressable>
            <View
              className={`h-9 w-9 shrink-0 items-center justify-center rounded-lg ${categoryAccent[category.accent]}`}
            >
              <Icon
                name={category.icon as IconName}
                size={19}
                color={categoryAccentIcon[category.accent]}
              />
            </View>
            <View className="min-w-0 flex-1">
              <VemtapText
                variant="labelMd"
                className="font-sans-semibold"
                numberOfLines={1}
              >
                {category.title}
              </VemtapText>
              <View className="mt-0.5 flex-row items-center gap-1.5">
                <View className="rounded bg-surface-container px-1.5 py-0.5">
                  <VemtapText variant="micro" tone="secondary">
                    {category.count}
                  </VemtapText>
                </View>
                <VemtapText variant="caption" tone="tertiary">
                  •
                </VemtapText>
                <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                  {category.type}
                </VemtapText>
              </View>
            </View>
            <View className="shrink-0 flex-row items-center">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${copy.editLabel} ${category.title}`}
                hitSlop={8}
                onPress={() => onEditCategory?.(category.id)}
                className="min-h-9 justify-center px-2"
              >
                <VemtapText variant="labelSm" className="font-sans-medium text-primary">
                  {copy.editLabel}
                </VemtapText>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${copy.archiveLabel} ${category.title}`}
                hitSlop={8}
                onPress={() => onArchiveCategory?.(category.id)}
                className="min-h-9 justify-center px-2"
              >
                <VemtapText variant="labelSm" tone="secondary">
                  {copy.archiveLabel}
                </VemtapText>
              </Pressable>
            </View>
          </View>
        ))}
      </View>

      <BusinessPanel className="mt-4" tone="low">
        <SetupCallout
          icon="autoAwesome"
          tone="subtle"
          iconSurface="circle"
          iconSize={20}
          title={copy.syncTitle}
          titleClassName="font-sans-semibold"
          body={copy.syncBody}
        />
      </BusinessPanel>

      <BusinessInfoStrip
        className="mt-3"
        icon="support"
        body={strings.dealLocationAssignment.catalogCalloutBody}
      />

      <BottomSheet
        visible={Boolean(sheetService)}
        onClose={() => setSheetService(null)}
        title={copy.servicesTitle}
      >
        <View className="gap-1 px-6 pb-4">
          {copy.serviceActions.map(action => (
            <BusinessSheetActionRow
              key={action.title}
              icon={action.icon as IconName}
              title={action.title}
              tone={action.tone}
              onPress={() => {
                if (sheetService) onServiceAction?.(action.icon, sheetService);
                if (action.icon === 'edit' && sheetService) onEditService?.(sheetService);
                setSheetService(null);
              }}
            />
          ))}
        </View>
      </BottomSheet>
    </BusinessScreenLayout>
  );
}

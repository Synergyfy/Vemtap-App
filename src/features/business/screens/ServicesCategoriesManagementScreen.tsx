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
import {
  CatalogueCategoryRow,
  type CategoryManagementRow,
} from '@features/business/components/CatalogueCategoryRow';
import {
  CatalogueServiceCard,
  type ServicesManagementRow,
} from '@features/business/components/CatalogueServiceCard';

cssInterop(Pressable, { className: 'style' });

const copy = strings.servicesCategories;

const tabs = copy.tabs.map(tab => ({ key: tab.key, label: tab.label, count: tab.count }));

export type { ServicesManagementRow };

export type { CategoryManagementRow };

export interface ServicesCategoriesManagementScreenProps {
  onNotifications?: () => void;
  onAddService?: () => void;
  onAddCategory?: () => void;
  onEditService?: (serviceId: string) => void;
  onServiceAction?: (actionId: string, serviceId: string) => void;
  onEditCategory?: (categoryId: string) => void;
  onArchiveCategory?: (categoryId: string) => void;
  onReorderCategory?: (categoryId: string) => void;
  /** Optional live services. When provided, renders live data instead of prototype copy. */
  services?: ServicesManagementRow[];
  /** Optional live categories. When provided, renders live data instead of prototype copy. */
  categories?: CategoryManagementRow[];
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
  services,
  categories,
}: ServicesCategoriesManagementScreenProps) {
  const [tab, setTab] = useState('services');
  const [filter, setFilter] = useState('all');
  const [sheetService, setSheetService] = useState<string | null>(null);

  // Fall back to prototype copy when the navigator feeds no live data. The
  // copy arrays are `as const` (readonly), so map them into mutable rows.
  const shownServices: ServicesManagementRow[] = services
    ? [...services]
    : copy.services.map(service => ({ ...service }));
  const shownCategories: CategoryManagementRow[] = categories
    ? [...categories]
    : copy.categories.map(category => ({ ...category }));

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
      <View className="z-10 mt-1 flex-row items-center justify-between gap-2">
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
        {shownServices.map(service => (
          <CatalogueServiceCard
            key={service.id}
            service={service}
            onPressMenu={() => setSheetService(service.id)}
          />
        ))}
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
        {shownCategories.map(category => (
          <CatalogueCategoryRow
            key={category.id}
            category={category}
            onReorder={() => onReorderCategory?.(category.id)}
            onEdit={() => onEditCategory?.(category.id)}
            onArchive={() => onArchiveCategory?.(category.id)}
          />
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

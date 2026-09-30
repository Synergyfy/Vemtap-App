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
  BusinessActionDock,
  BusinessProductImage,
  BusinessScreenLayout,
  BusinessSelectionChip,
  BusinessStatusPill,
  BusinessSwitchRow,
} from '@features/business/components/BusinessPrimitives';
import { EmptyState } from '@components/shared/EmptyState';
import {
  BusinessChipScroller,
  BusinessScopePicker,
  BusinessSearchTrigger,
  BusinessSegmentTabs,
  BusinessSheetActionRow,
  BusinessToastPill,
} from '@features/business/components/BusinessOpsPrimitives';
import { businessOpsImageById } from '@features/business/data/businessOpsImages';

cssInterop(Pressable, { className: 'style' });

const copy = strings.centralCatalogue;

const catalogueTabs = copy.tabs.map(tab => ({
  key: tab.key,
  label: tab.label,
  count: tab.count,
}));

const businessHubTabs = [
  { key: 'products', label: copy.tabsBusiness[0].label },
  { key: 'services', label: copy.tabsBusiness[1].label },
  { key: 'categories', label: copy.tabsBusiness[2].label },
];

/** `directory` = catalogue tab with search + filter carousel, `businessHub` = compact business hub list. */
export type CentralCatalogueLayout = 'directory' | 'businessHub';

const statusTone: Record<string, 'success' | 'neutral' | 'warning'> = {
  'Deal Active • 20% OFF': 'success',
  'Standard Menu': 'neutral',
  'Low Stock': 'warning',
  'Draft / Paused': 'neutral',
};

export interface CentralCatalogueScreenProps {
  layout?: CentralCatalogueLayout;
  onNotifications?: () => void;
  onQuickSwitch?: () => void;
  onSearch?: () => void;
  onChangeScope?: (value: string) => void;
  onAddProduct?: () => void;
  onAddService?: () => void;
  onEditItem?: (itemId: string) => void;
  onToggleStock?: (itemId: string, value: boolean) => void;
  onSheetAction?: (actionId: string, itemId: string) => void;
}

function CatalogueRow({
  item,
  layout,
  inStock,
  onToggleStock,
  onPressMenu,
  onEdit,
}: {
  item: (typeof copy.items)[number];
  layout: CentralCatalogueLayout;
  inStock: boolean;
  onToggleStock: () => void;
  onPressMenu: () => void;
  onEdit: () => void;
}) {
  const image = businessOpsImageById[item.id];
  const draft = item.status === 'Draft / Paused';
  const isDeal = item.status === 'Deal Active • 20% OFF';

  return (
    <View
      className={`gap-3 overflow-hidden rounded-card bg-surface p-3 shadow-sm ${
        draft ? 'opacity-90' : ''
      }`}
    >
      {layout === 'businessHub' ? (
        <View className="flex-row items-center justify-between gap-2">
          <View className="min-w-0 flex-1 flex-row items-center gap-1.5">
            <VemtapText
              variant="caption"
              className="min-w-0 font-sans-medium"
              numberOfLines={1}
            >
              {item.category}
            </VemtapText>
            <VemtapText variant="caption" tone="tertiary">
              •
            </VemtapText>
            <VemtapText
              variant="caption"
              tone="tertiary"
              className="min-w-0 flex-1"
              numberOfLines={1}
            >
              {item.sku}
            </VemtapText>
          </View>
          <View className="flex-row items-center gap-1.5">
            <View
              className={`h-2 w-2 rounded-full ${draft ? 'bg-surface-container-highest' : 'bg-badge-discount-text'}`}
            />
            <VemtapText
              variant="caption"
              className={draft ? '' : 'text-badge-discount-text'}
              numberOfLines={1}
            >
              {draft ? item.status : copy.activePublished}
            </VemtapText>
          </View>
        </View>
      ) : null}

      <View className="flex-row items-start gap-3">
        <View className="relative h-20 w-20 shrink-0 overflow-hidden rounded-card bg-surface-container">
          {image ? (
            <BusinessProductImage
              source={image}
              alt={image.alt}
              className="h-full w-full"
            />
          ) : null}
          {isDeal ? (
            <View className="absolute bottom-1 right-1 rounded bg-surface px-1.5 py-0.5">
              <VemtapText variant="micro" className="font-sans-semibold text-primary">
                {copy.hotBadge}
              </VemtapText>
            </View>
          ) : null}
          {draft ? (
            <View className="absolute inset-0 items-center justify-center bg-surface-dim">
              <Icon name="hourglass" size={18} color={colors.textSecondary} />
            </View>
          ) : null}
        </View>
        <View className="min-w-0 flex-1 justify-between">
          <View className="flex-row items-start justify-between gap-2">
            <VemtapText
              variant="labelMd"
              className={`min-w-0 flex-1 font-sans-semibold ${draft ? 'text-text-secondary' : ''}`}
              numberOfLines={2}
            >
              {item.title}
            </VemtapText>
            {layout === 'directory' ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${item.title} options`}
                hitSlop={8}
                onPress={onPressMenu}
              >
                <Icon name="more" size={19} color={colors.textSecondary} />
              </Pressable>
            ) : null}
          </View>
          {layout === 'directory' ? (
            <VemtapText variant="caption" tone="tertiary" numberOfLines={1}>
              {`#${item.sku} · ${item.category}`}
            </VemtapText>
          ) : null}
          <View className="mt-1 flex-row items-baseline gap-2">
            <VemtapText
              variant="labelMd"
              className={`font-sans-bold ${draft ? 'text-text-secondary' : 'text-primary'}`}
              numberOfLines={1}
            >
              {item.price}
            </VemtapText>
            {'wasPrice' in item && item.wasPrice ? (
              <VemtapText variant="caption" tone="tertiary" className="line-through">
                {item.wasPrice}
              </VemtapText>
            ) : null}
          </View>
          <View className="mt-1">
            <BusinessStatusPill
              label={item.status}
              tone={statusTone[item.status] ?? 'neutral'}
            />
          </View>
        </View>
      </View>

      <View className="flex-row items-center gap-1.5 rounded-field bg-surface-container-low px-2.5 py-2">
        <Icon name="store" size={15} color={colors.primary} />
        <VemtapText
          variant="caption"
          tone="secondary"
          className="min-w-0 flex-1"
          numberOfLines={2}
        >
          {item.location}
        </VemtapText>
      </View>

      <View className="-mx-3 -mb-3 flex-row items-center justify-between gap-2 border-t border-border px-3 py-2.5">
        <View className="min-w-0 flex-1">
          <BusinessSwitchRow
            title={item.stock}
            accessibilityLabel={item.stock}
            value={inStock}
            onValueChange={onToggleStock}
          />
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={item.title}
          onPress={onEdit}
          className="min-h-9 shrink-0 flex-row items-center gap-1.5 rounded-field bg-surface px-3 py-1.5 active:scale-95"
        >
          <Icon name={draft ? 'restore' : 'edit'} size={15} color={colors.primary} />
          <VemtapText variant="labelSm" className="font-sans-semibold text-primary">
            {draft ? copy.publishAction : copy.editAction}
          </VemtapText>
        </Pressable>
      </View>
    </View>
  );
}

/**
 * Central products & services catalogue. `directory` renders the catalogue tab
 * with location scope, counts, search and the filter carousel; `businessHub`
 * renders the compact business-hub list with an inline Add-New split control.
 */
export function CentralCatalogueScreen({
  layout = 'directory',
  onNotifications,
  onQuickSwitch,
  onSearch,
  onChangeScope,
  onAddProduct,
  onAddService,
  onEditItem,
  onToggleStock,
  onSheetAction,
}: CentralCatalogueScreenProps) {
  const [tab, setTab] = useState('products');
  const [filter, setFilter] = useState('all');
  const [scope, setScope] = useState('all');
  const [stock, setStock] = useState<Record<string, boolean>>({
    ribeye: true,
    fries: true,
    cabernet: true,
    sourdough: false,
  });
  const [sheetItem, setSheetItem] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const isDirectory = layout === 'directory';

  // Only the "Drafts" chip empties the list; every other chip keeps all rows so
  // the empty state only appears for a genuinely empty result set.
  const visibleItems = filter === 'drafts' ? [] : copy.items;

  return (
    <BusinessScreenLayout
      header={{
        title: isDirectory ? copy.headerTitle : strings.businessHub.title,
        centerTitle: false,
        titleVariant: 'headingSm',
        titleAccessory: isDirectory ? undefined : (
          <Icon name="verified" size={16} color={colors.primary} />
        ),
        actions: [
          ...(isDirectory
            ? [
                {
                  icon: 'notifications' as IconName,
                  label: copy.headerTitle,
                  onPress: onNotifications,
                },
              ]
            : [
                {
                  icon: 'swapHoriz' as IconName,
                  label: strings.businessHub.title,
                  onPress: onQuickSwitch,
                },
              ]),
        ],
      }}
      contentContainerClassName="pb-8"
      footer={
        <BusinessActionDock>
          <View className="flex-row gap-2">
            <Button
              label={copy.addProduct}
              labelVariant="labelMd"
              onPress={onAddProduct}
              leftIcon={<Icon name="plus" size={18} color={colors.surface} />}
              className="flex-1"
            />
            <Button
              label={copy.addService}
              labelVariant="labelMd"
              variant="secondary"
              onPress={onAddService}
              leftIcon={<Icon name="autoAwesome" size={18} color={colors.primary} />}
            />
          </View>
        </BusinessActionDock>
      }
    >
      <View className="mt-1 flex-row items-center justify-between gap-2">
        <View className="min-w-0 flex-1">
          {isDirectory ? (
            <VemtapText
              variant="micro"
              tone="tertiary"
              className="font-sans-semibold uppercase tracking-wider"
            >
              {copy.eyebrow}
            </VemtapText>
          ) : null}
          <BusinessScopePicker
            className="mt-1 self-start"
            label={isDirectory ? copy.allLocations : copy.allLocationsTwo}
            value={scope}
            options={[
              {
                label: isDirectory ? copy.allLocations : copy.allLocationsTwo,
                value: 'all',
                meta: copy.scopeBranches[0].meta,
              },
              ...copy.scopeBranches.map(option => ({
                label: option.label,
                value: option.value,
                meta: option.meta,
              })),
            ]}
            onChange={value => {
              setScope(value);
              onChangeScope?.(value);
            }}
          />
        </View>
        <BusinessStatusPill label={copy.liveInPos} tone="success" icon="sync" />
      </View>

      <View className="mt-3">
        <BusinessSegmentTabs
          tabs={isDirectory ? catalogueTabs : businessHubTabs}
          value={tab}
          onChange={setTab}
          accessibilityLabel={copy.headerTitle}
          shape={isDirectory ? 'segmented' : 'rounded'}
        />
      </View>

      <BusinessSearchTrigger
        className="mt-3"
        placeholder={isDirectory ? copy.searchPlaceholder : copy.searchPlaceholderAlt}
        onPress={onSearch}
      />

      <View className="mt-3">
        <BusinessChipScroller>
          {(isDirectory ? copy.filters : copy.filtersAlt).map(chip => (
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

      <View className="mt-3 gap-3">
        {visibleItems.map(item => (
          <CatalogueRow
            key={item.id}
            item={item}
            layout={layout}
            inStock={stock[item.id] ?? false}
            onToggleStock={() => {
              setStock(current => ({ ...current, [item.id]: !current[item.id] }));
              setToast(item.stock);
              onToggleStock?.(item.id, !stock[item.id]);
            }}
            onPressMenu={() => setSheetItem(item.id)}
            onEdit={() => onEditItem?.(item.id)}
          />
        ))}
      </View>

      {visibleItems.length ? null : (
        <EmptyState
          title={copy.emptyTitle}
          description={copy.emptyBody}
          actionLabel={copy.resetFilters}
          onAction={() => setFilter('all')}
          className="px-0"
        />
      )}

      {toast ? <BusinessToastPill message={toast} /> : null}

      <BottomSheet
        visible={Boolean(sheetItem)}
        onClose={() => setSheetItem(null)}
        title={copy.sheetTitle}
      >
        <View className="gap-1 px-6 pb-4">
          {copy.sheetActions.map(action => (
            <BusinessSheetActionRow
              key={action.title}
              icon={action.icon as IconName}
              title={action.title}
              subtitle={action.subtitle}
              tone={action.tone}
              onPress={() => {
                if (sheetItem) onSheetAction?.(action.icon, sheetItem);
                setSheetItem(null);
              }}
            />
          ))}
        </View>
      </BottomSheet>
    </BusinessScreenLayout>
  );
}

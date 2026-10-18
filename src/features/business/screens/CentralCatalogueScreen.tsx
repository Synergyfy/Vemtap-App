import React, { useState } from 'react';
import { Pressable, useWindowDimensions, View } from 'react-native';
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
} from '@features/business/components/BusinessOpsPrimitives';
import {
  CatalogueCategoryRow,
  type CategoryManagementRow,
} from '@features/business/components/CatalogueCategoryRow';
import {
  CatalogueServiceCard,
  DRAFT_SERVICE_STATUS,
  type ServicesManagementRow,
} from '@features/business/components/CatalogueServiceCard';

cssInterop(Pressable, { className: 'style' });

const copy = strings.centralCatalogue;

type CatalogueTabKey = 'products' | 'services' | 'categories';

/** Below this width the secondary CTA uses the HTML's short "Service" label. */
const NARROW_FOOTER_WIDTH = 375;

const DRAFT_STATUS = 'Draft / Paused';
const DEAL_STATUS = 'Deal Active • 20% OFF';
const LOW_STOCK_STATUS = 'Low Stock';

/** Service rows only know live vs draft, so only those chips narrow them. */
function matchesServiceFilter(service: ServicesManagementRow, filter: string): boolean {
  if (filter === 'active') return service.status !== DRAFT_SERVICE_STATUS;
  if (filter === 'drafts') return service.status === DRAFT_SERVICE_STATUS;
  return true;
}

/** Status-chip predicate; chips with no matching data (e.g. dine-in) show all. */
function matchesFilter(item: CentralCatalogueItemRow, filter: string): boolean {
  switch (filter) {
    case 'active':
      return item.status !== DRAFT_STATUS;
    case 'deal':
    case 'deals':
      return item.status === DEAL_STATUS;
    case 'low':
      return item.status === LOW_STOCK_STATUS;
    case 'drafts':
      return item.status === DRAFT_STATUS;
    default:
      return true;
  }
}

/** `directory` = catalogue tab with search + filter carousel, `businessHub` = compact business hub list. */
export type CentralCatalogueLayout = 'directory' | 'businessHub';

/** Row shape the catalogue list renders, mapped from the live catalogue. */
export interface CentralCatalogueItemRow {
  id: string;
  /** Drives the Products / Services tabs; rows without a kind are products. */
  kind?: 'product' | 'service';
  title: string;
  sku: string;
  category: string;
  price: string;
  status: string;
  location: string;
  stock?: string;
  image?: { uri: string; alt: string };
  wasPrice?: string;
}

const statusTone: Record<string, 'success' | 'neutral' | 'warning'> = {
  [DEAL_STATUS]: 'success',
  'Standard Menu': 'neutral',
  [LOW_STOCK_STATUS]: 'warning',
  [DRAFT_STATUS]: 'neutral',
};

export interface CentralCatalogueScopeOption {
  label: string;
  value: string;
  meta?: string;
}

export interface CentralCatalogueScreenProps {
  layout?: CentralCatalogueLayout;
  onNotifications?: () => void;
  onQuickSwitch?: () => void;
  onSearch?: () => void;
  onChangeScope?: (value: string) => void;
  onAddProduct?: () => void;
  onAddService?: () => void;
  onEditItem?: (itemId: string) => void;
  /**
   * Publish switch (`true` = live). Return a promise to have a rejection flip
   * the switch back; the screen moves it optimistically.
   */
  onToggleStock?: (itemId: string, value: boolean) => void | Promise<unknown>;
  onSheetAction?: (actionId: string, itemId: string) => void;
  /** The live catalogue items; empty while they load. */
  items?: CentralCatalogueItemRow[];
  /** Optional live services for the Services tab. */
  services?: ServicesManagementRow[];
  /** Optional live categories for the Categories tab. */
  categories?: CategoryManagementRow[];
  /** Live location scope: `all` first, then one option per branch. */
  scopeOptions?: CentralCatalogueScopeOption[];
  /** Controlled scope value; omit to let the picker own it. */
  scope?: string;
}

function CatalogueRow({
  item,
  layout,
  published,
  onToggleStock,
  onPressMenu,
  onEdit,
}: {
  item: CentralCatalogueItemRow;
  layout: CentralCatalogueLayout;
  published: boolean;
  onToggleStock: () => void;
  onPressMenu: () => void;
  onEdit: () => void;
}) {
  const { image } = item;
  const draft = item.status === DRAFT_STATUS;
  const isDeal = item.status === DEAL_STATUS;

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
                {item.wasPrice as string}
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
          {item.location ?? ''}
        </VemtapText>
      </View>

      <View className="-mx-3 -mb-3 flex-row items-center justify-between gap-2 border-t border-border px-3 py-2.5">
        <View className="min-w-0 flex-1">
          <BusinessSwitchRow
            title={published ? copy.publishedToggle : copy.pausedToggle}
            subtitle={item.stock || undefined}
            accessibilityLabel={copy.publishToggleLabel(item.title)}
            value={published}
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
 * renders the compact business hub list with an inline Add-New split control.
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
  items,
  services,
  categories,
  scopeOptions,
  scope: controlledScope,
}: CentralCatalogueScreenProps) {
  const { width } = useWindowDimensions();
  const [tab, setTab] = useState<CatalogueTabKey>('products');
  const [filter, setFilter] = useState('all');
  const [ownScope, setOwnScope] = useState('all');
  const scope = controlledScope ?? ownScope;
  // Optimistic switch positions keyed by item id; absent = derive from status.
  const [publishOverride, setPublishOverride] = useState<Record<string, boolean>>({});
  const [sheetItem, setSheetItem] = useState<string | null>(null);

  const isDirectory = layout === 'directory';

  const sourceItems: CentralCatalogueItemRow[] = items ?? [];
  const products = sourceItems.filter(item => item.kind !== 'service');
  const shownServices: ServicesManagementRow[] = services ?? [];
  const shownCategories: CategoryManagementRow[] = categories ?? [];
  const isCategories = tab === 'categories';
  const isServices = tab === 'services';
  const visibleItems = products.filter(item => matchesFilter(item, filter));
  const visibleServices = shownServices.filter(service =>
    matchesServiceFilter(service, filter),
  );
  const visibleCount = isServices ? visibleServices.length : visibleItems.length;

  const tabCounts: Record<CatalogueTabKey, number> = {
    products: products.length,
    services: shownServices.length,
    categories: shownCategories.length,
  };
  const catalogueTabs = copy.tabs.map(entry => {
    if (isDirectory) {
      return {
        key: entry.key,
        label: entry.label,
        count: tabCounts[entry.key],
      };
    }
    return {
      key: entry.key,
      label: `${entry.label} (${tabCounts[entry.key]})`,
    };
  });

  const allScopeLabel = isDirectory ? copy.allLocations : copy.allLocationsTwo;
  const pickerOptions: CentralCatalogueScopeOption[] = scopeOptions ?? [
    { label: allScopeLabel, value: 'all' },
  ];
  const emptyTitle = isServices ? copy.emptyServicesTitle : copy.emptyTitle;
  const narrowFooter = width < NARROW_FOOTER_WIDTH;

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
          {/* Primary takes the slack, secondary sizes to its label (Stitch HTML).
              Both opt out of the Button's default w-full, which made the pair
              wider than the row and pushed Add Service off-screen. */}
          <View className="flex-row gap-2">
            <Button
              label={copy.addProduct}
              labelVariant="labelMd"
              labelNumberOfLines={1}
              fullWidth={false}
              onPress={onAddProduct}
              leftIcon={<Icon name="plus" size={18} color={colors.surface} />}
              className="min-w-0 flex-1 px-4"
            />
            <Button
              label={narrowFooter ? copy.addServiceShort : copy.addService}
              accessibilityLabel={copy.addService}
              labelVariant="labelMd"
              labelNumberOfLines={1}
              fullWidth={false}
              variant="secondary"
              onPress={onAddService}
              leftIcon={<Icon name="autoAwesome" size={18} color={colors.primary} />}
              className="shrink-0 px-4"
            />
          </View>
        </BusinessActionDock>
      }
    >
      <View className="z-10 mt-1 flex-row items-center justify-between gap-2">
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
            label={pickerOptions[0]?.label ?? allScopeLabel}
            value={scope}
            options={pickerOptions}
            onChange={value => {
              setOwnScope(value);
              onChangeScope?.(value);
            }}
          />
        </View>
        <BusinessStatusPill label={copy.liveInPos} tone="success" icon="sync" />
      </View>

      <View className="mt-3">
        <BusinessSegmentTabs
          tabs={catalogueTabs}
          value={tab}
          onChange={key => {
            setTab(key as CatalogueTabKey);
            setFilter('all');
          }}
          accessibilityLabel={copy.headerTitle}
          shape={isDirectory ? 'segmented' : 'rounded'}
        />
      </View>

      <BusinessSearchTrigger
        className="mt-3"
        placeholder={isDirectory ? copy.searchPlaceholder : copy.searchPlaceholderAlt}
        onPress={onSearch}
      />

      {isCategories ? (
        <>
          <View className="mt-3 gap-2">
            {shownCategories.map(category => (
              <CatalogueCategoryRow key={category.id} category={category} />
            ))}
          </View>
          {shownCategories.length ? null : (
            <EmptyState
              title={copy.emptyCategoriesTitle}
              description={copy.emptyCategoriesBody}
              className="px-0"
            />
          )}
        </>
      ) : (
        <>
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
            {isServices
              ? visibleServices.map(service => (
                  <CatalogueServiceCard
                    key={service.id}
                    service={service}
                    onPressMenu={() => setSheetItem(service.id)}
                  />
                ))
              : visibleItems.map(item => (
                  <CatalogueRow
                    key={item.id}
                    item={item}
                    layout={layout}
                    published={publishOverride[item.id] ?? item.status !== DRAFT_STATUS}
                    onToggleStock={() => {
                      const current =
                        publishOverride[item.id] ?? item.status !== DRAFT_STATUS;
                      const next = !current;
                      setPublishOverride(overrides => ({
                        ...overrides,
                        [item.id]: next,
                      }));
                      Promise.resolve(onToggleStock?.(item.id, next)).catch(() =>
                        setPublishOverride(overrides => ({
                          ...overrides,
                          [item.id]: current,
                        })),
                      );
                    }}
                    onPressMenu={() => setSheetItem(item.id)}
                    onEdit={() => onEditItem?.(item.id)}
                  />
                ))}
          </View>

          {visibleCount ? null : (
            <EmptyState
              title={emptyTitle}
              description={copy.emptyBody}
              actionLabel={copy.resetFilters}
              onAction={() => setFilter('all')}
              className="px-0"
            />
          )}
        </>
      )}

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
                if (sheetItem && action.icon) onSheetAction?.(action.icon, sheetItem);
                setSheetItem(null);
              }}
            />
          ))}
        </View>
      </BottomSheet>
    </BusinessScreenLayout>
  );
}

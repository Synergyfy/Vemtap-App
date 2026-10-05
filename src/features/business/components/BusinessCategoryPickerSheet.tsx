import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { cssInterop } from 'nativewind';
import type { Category, Subcategory } from '@api/categoriesApi';
import { BottomSheet } from '@components/shared/BottomSheet';
import { LoadingState } from '@components/shared/LoadingState';
import { EmptyState } from '@components/shared/EmptyState';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';
import { businessCategoryCopy as copy } from '@features/business/businessCopy';
import { useCategoryTaxonomy } from '@features/business/hooks/useCategoryTaxonomy';
import { SelectableChip } from '@features/business/components/BusinessSetupPrimitives';

cssInterop(View, { className: 'style' });
cssInterop(Pressable, { className: 'style' });
cssInterop(ScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});

const SPECIALTY_LIMIT = 2;

/**
 * Category and subcategory selection against the live taxonomy.
 *
 * Both halves of the screen read from one query, so picking a category always
 * offers the subcategories the API actually has for it — an invented pairing
 * could otherwise produce a `subcategoryId` the API rejects. Selecting a
 * category clears any subcategory that no longer belongs to it.
 *
 * The API's seeded taxonomy contains test rows (`test`, `Frank`, …), so anything
 * that looks like a placeholder is filtered out rather than offered as a real
 * choice.
 */
export function BusinessCategoryPickerSheet({
  categoryId,
  subcategoryId,
  onSelect,
  onClose,
}: {
  categoryId?: string;
  subcategoryId?: string;
  onSelect: (selection: {
    categoryId: string;
    categoryName: string;
    subcategoryId?: string;
    subcategoryName?: string;
    /** The second specialty, which the API can only accept as free text. */
    otherSubcategoryName?: string;
  }) => void;
  onClose: () => void;
}) {
  const { data: categories, isLoading, isError, refetch } = useCategoryTaxonomy();
  const [pendingCategoryId, setPendingCategoryId] = useState<string | undefined>(
    categoryId,
  );
  // Ordered, because the API takes one `subcategoryId` and then the second
  // choice as `otherSubcategoryName` — so which one is "first" matters.
  const [pendingSubcategoryIds, setPendingSubcategoryIds] = useState<string[]>(
    subcategoryId ? [subcategoryId] : [],
  );

  const availableCategories = useMemo(
    () => (categories ?? []).filter(isRealCategory),
    [categories],
  );
  const active = useMemo(
    () => availableCategories.find(item => item.id === pendingCategoryId),
    [availableCategories, pendingCategoryId],
  );
  const activeSubcategories = useMemo(
    () => (active?.subcategories ?? []).filter(sub => !isPlaceholderName(sub.name)),
    [active],
  );
  const chosen = useMemo(
    () =>
      pendingSubcategoryIds.map(id => activeSubcategories.find(item => item.id === id)),
    [activeSubcategories, pendingSubcategoryIds],
  );
  const primary = chosen[0];
  const secondary = chosen[1];

  const chooseCategory = useCallback(
    (category: Category) => {
      // Re-picking the same category must not drop the chosen subcategory.
      if (category.id === pendingCategoryId) return;
      setPendingCategoryId(category.id);
      setPendingSubcategoryIds([]);
    },
    [pendingCategoryId],
  );

  const toggleSubcategory = useCallback((id: string) => {
    setPendingSubcategoryIds(current => {
      if (current.includes(id)) return current.filter(item => item !== id);
      if (current.length < SPECIALTY_LIMIT) return [...current, id];
      // At the limit, tapping a new chip makes it the primary selection, which
      // is what someone reaching for a third option almost always means.
      return [id, current[1]];
    });
  }, []);

  const confirm = useCallback(() => {
    if (!active) return;
    onSelect({
      categoryId: active.id,
      categoryName: active.name.trim(),
      subcategoryId: primary?.id,
      subcategoryName: primary?.name,
      otherSubcategoryName: secondary?.name,
    });
  }, [active, onSelect, primary, secondary]);

  return (
    <BottomSheet visible onClose={onClose} title={copy.title}>
      {isLoading ? (
        <LoadingState label={copy.loading} />
      ) : isError ? (
        <EmptyState
          title={copy.errorTitle}
          description={copy.errorBody}
          actionLabel={copy.retry}
          onAction={() => refetch()}
        />
      ) : availableCategories.length === 0 ? (
        <EmptyState title={copy.emptyTitle} description={copy.emptyBody} />
      ) : (
        <ScrollView className="pb-2" contentContainerClassName="gap-5 px-6">
          <View className="gap-2">
            <VemtapText
              variant="labelSm"
              tone="tertiary"
              className="uppercase tracking-wider"
            >
              {copy.categoryLabel}
            </VemtapText>
            <View className="flex-row flex-wrap gap-2">
              {availableCategories.map((category: Category) => (
                <SelectableChip
                  key={category.id}
                  label={category.name.trim()}
                  selected={category.id === pendingCategoryId}
                  showCheck
                  onPress={() => chooseCategory(category)}
                />
              ))}
            </View>
          </View>

          <View className="gap-2">
            <View className="flex-row flex-wrap items-center justify-between gap-2">
              <VemtapText
                variant="labelSm"
                tone="tertiary"
                className="uppercase tracking-wider"
              >
                {copy.subcategoryLabel}
              </VemtapText>
              <VemtapText variant="caption" tone="secondary">
                {copy.limitHint(SPECIALTY_LIMIT)}
              </VemtapText>
            </View>
            {!active ? (
              <VemtapText variant="caption" tone="tertiary">
                {copy.pickCategoryFirst}
              </VemtapText>
            ) : activeSubcategories.length === 0 ? (
              <VemtapText variant="caption" tone="tertiary">
                {copy.noSubcategories}
              </VemtapText>
            ) : (
              <View className="flex-row flex-wrap gap-2">
                {activeSubcategories.map((sub: Subcategory) => (
                  <SelectableChip
                    key={sub.id}
                    label={sub.name.trim()}
                    selected={pendingSubcategoryIds.includes(sub.id)}
                    showCheck
                    onPress={() => toggleSubcategory(sub.id)}
                  />
                ))}
              </View>
            )}
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.confirm}
            disabled={!active}
            onPress={confirm}
            className="rounded-button min-h-[52px] items-center justify-center bg-primary px-6 active:opacity-90"
          >
            <VemtapText
              variant="labelMd"
              className={
                active
                  ? 'text-on-primary font-sans-semibold'
                  : 'text-on-primary opacity-50'
              }
            >
              {copy.confirm}
            </VemtapText>
          </Pressable>

          {active ? (
            <View className="flex-row items-center gap-2 rounded-field bg-surface-container-lowest p-3">
              <Icon name="verifiedUser" size={16} color={colors.textSecondary} />
              <VemtapText variant="caption" tone="secondary" className="min-w-0 flex-1">
                {copy.summary(
                  active.name.trim(),
                  chosen
                    .filter(Boolean)
                    .map(item => item!.name.trim())
                    .join(' • '),
                )}
              </VemtapText>
            </View>
          ) : null}
        </ScrollView>
      )}
    </BottomSheet>
  );
}

/** Test rows the seeded taxonomy carries; never a legitimate choice. */
function isPlaceholderName(name: string): boolean {
  const normalized = name.trim().toLowerCase();
  return ['test', 'testing', 'frank', 'zejab', 'txxhhh', 'others', 'other'].includes(
    normalized,
  );
}

function isRealCategory(category: Category): boolean {
  return !isPlaceholderName(category.name) && category.name.trim().length > 0;
}

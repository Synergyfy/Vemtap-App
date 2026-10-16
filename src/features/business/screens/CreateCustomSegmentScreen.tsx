import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import {
  BusinessActionDock,
  BusinessCheckRow,
  BusinessScreenLayout,
  BusinessSelectionChip,
} from '@features/business/components/BusinessPrimitives';
import {
  FieldInput,
  HorizontallyScrollableRow,
  SetupCallout,
  SetupSectionCard,
  SetupSectionHeading,
  TextActionButton,
} from '@features/business/components/BusinessSetupPrimitives';

const copy = strings.campaignWizard.customSegment;

const SIZING = { total: 184, push: 168, dm: 142 } as const;

/** One choice under a criterion (a deal, a dish, a branch…). */
export interface CriterionOption {
  id: string;
  label: string;
}

/** Live audience size for the current criteria. */
export interface CustomSegmentSizing {
  total: number;
  push: number;
  dm: number;
}

export interface CustomSegmentCriteriaSelection {
  criteria: string[];
  /** Option index picked per criterion (absent = the first option). */
  pickers: Record<string, number>;
}

export interface CreateCustomSegmentScreenProps {
  onClose: () => void;
  onSave?: (segment: CustomSegmentSelection) => void;
  onCancel?: () => void;
  /** Starting values; the design's sample segment when absent. */
  initialName?: string;
  initialMemo?: string;
  initialSelection?: CustomSegmentCriteriaSelection;
  /** Criteria to offer; every designed criterion when absent. */
  criterionIds?: readonly string[];
  /** Live picker options per criterion, replacing the design's samples. */
  pickerOptions?: Partial<Record<string, readonly CriterionOption[]>>;
  /**
   * Live wording per criterion: a body where the design describes data VEMTAP
   * does not hold, and a picker label for a criterion the design shows
   * without one (its options come from `pickerOptions`).
   */
  criterionOverrides?: Partial<Record<string, { body?: string; pickerLabel?: string }>>;
  /** Live sizing; the design's estimate when absent and not pending. */
  sizing?: CustomSegmentSizing;
  sizingPending?: boolean;
  sizingNote?: string;
  businessName?: string;
  onSelectionChange?: (selection: CustomSegmentCriteriaSelection) => void;
  isSaving?: boolean;
  error?: string;
}

export interface CustomSegmentSelection extends CustomSegmentCriteriaSelection {
  name: string;
  memo: string;
}

const categoryIconTone: Record<string, string> = {
  deals: 'text-primary',
  menu: 'text-badge-discount-text',
  location: 'text-text-secondary',
  recency: 'text-text-secondary',
};

/**
 * Create Custom Segment.
 * stitch_vemtap_mobile_app_design/create_custom_segment
 *
 * No scrim and no grabber in the source, so this is a full stack page (rule 16)
 * with a close affordance rather than a sheet. Sizing is derived from the active
 * criteria so the live count can never drift from the selection.
 */
export function CreateCustomSegmentScreen({
  onClose,
  onSave,
  onCancel,
  initialName = copy.nameValue,
  initialMemo = copy.memoValue,
  initialSelection,
  criterionIds,
  pickerOptions,
  criterionOverrides,
  sizing,
  sizingPending = false,
  sizingNote = copy.sizingNote,
  businessName = strings.campaignWizard.segmentActions.business,
  onSelectionChange,
  isSaving = false,
  error,
}: CreateCustomSegmentScreenProps) {
  const [name, setName] = useState<string>(initialName);
  const [memo, setMemo] = useState<string>(initialMemo);
  const [criteria, setCriteria] = useState<string[]>(
    initialSelection?.criteria ?? ['claimed', 'dishes', 'branch', 'dormant'],
  );
  const [pickers, setPickers] = useState<Record<string, number>>(
    initialSelection?.pickers ?? {},
  );

  useEffect(() => {
    onSelectionChange?.({ criteria, pickers });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- report selection changes only; the callback identity is the caller's concern.
  }, [criteria, pickers]);

  function toggle(id: string) {
    setCriteria(current =>
      current.includes(id) ? current.filter(item => item !== id) : [...current, id],
    );
  }

  function pick(criterionId: string, optionIndex: number) {
    setPickers(current => ({ ...current, [criterionId]: optionIndex }));
  }

  // Prototype only: every active criterion widens the pool by ~23% of base.
  const estimate = Math.min(400, Math.round(SIZING.total * (1 + criteria.length * 0.23)));
  const sized = sizing?.total ?? estimate;
  const pushSized = sizing?.push ?? Math.round(estimate * 0.91);
  const dmSized = sizing?.dm ?? Math.round(estimate * 0.77);
  const sizeLabel = sizingPending && !sizing ? '\u2026' : String(sized);
  const ratio = (part: number) => (sized > 0 ? Math.round((part / sized) * 100) : 0);
  const canSave = name.trim().length > 0 && !isSaving;

  return (
    <BusinessScreenLayout
      header={{
        title: copy.title,
        onBack: onClose,
        titleVariant: 'headingSm',
        showAvatar: true,
      }}
      contentContainerClassName="gap-4 pb-6"
      footer={
        <BusinessActionDock>
          <Button
            label={copy.saveCta.replace('{count}', sizeLabel)}
            labelVariant="button"
            size="md"
            accessibilityLabel={copy.saveCta.replace('{count}', sizeLabel)}
            className="min-h-[52px] rounded-xl"
            leftIcon={<Icon name="arrowForward" size={18} color={colors.surface} />}
            disabled={!canSave}
            loading={isSaving}
            onPress={() =>
              onSave?.({ name: name.trim(), memo: memo.trim(), criteria, pickers })
            }
          />
          <TextActionButton
            label={copy.cancel}
            icon="close"
            tone="secondary"
            onPress={onCancel ?? onClose}
          />
        </BusinessActionDock>
      }
    >
      <View className="flex-row items-center gap-1.5 self-start rounded-full bg-surface-container-high px-2.5 py-1">
        <Icon name="storefront" size={13} color={colors.textSecondary} />
        <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
          {businessName}
        </VemtapText>
      </View>

      <View className="gap-1">
        <VemtapText
          variant="headingLg"
          className="font-sans-semibold text-heading-lg"
          numberOfLines={2}
        >
          {copy.hero}
        </VemtapText>
        <VemtapText variant="bodyMd" tone="secondary">
          {copy.heroBody}
        </VemtapText>
      </View>

      <SetupSectionCard tone="low" className="gap-2.5 p-4">
        <View className="flex-row items-center gap-1.5">
          <View className="h-1.5 w-1.5 rounded-full bg-success" />
          <VemtapText
            variant="caption"
            className="font-sans-semibold text-success"
            numberOfLines={1}
          >
            {copy.sizingBadge}
          </VemtapText>
        </View>
        <View className="flex-row flex-wrap items-baseline gap-1.5">
          <VemtapText
            variant="displayMobile"
            className="font-sans-bold text-primary"
            numberOfLines={1}
          >
            {sizeLabel}
          </VemtapText>
          <VemtapText variant="bodyMd" tone="secondary">
            {copy.sizingUnit}
          </VemtapText>
        </View>
        <View className="flex-row gap-2">
          <View className="min-w-0 flex-1 gap-0.5 rounded-lg bg-surface p-2.5">
            <View className="flex-row items-center gap-1">
              <Icon name="notificationsActive" size={12} color={colors.textTertiary} />
              <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
                {copy.pushLabel}
              </VemtapText>
            </View>
            <VemtapText
              variant="labelMd"
              className="font-sans-semibold"
              numberOfLines={1}
            >
              {`${pushSized} (${ratio(pushSized)}%)`}
            </VemtapText>
          </View>
          <View className="min-w-0 flex-1 gap-0.5 rounded-lg bg-surface p-2.5">
            <View className="flex-row items-center gap-1">
              <Icon name="message" size={12} color={colors.textTertiary} />
              <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
                {copy.dmLabel}
              </VemtapText>
            </View>
            <VemtapText
              variant="labelMd"
              className="font-sans-semibold"
              numberOfLines={1}
            >
              {`${dmSized} (${ratio(dmSized)}%)`}
            </VemtapText>
          </View>
        </View>
        <View className="flex-row items-center gap-1.5">
          <Icon name="verified" size={12} color={colors.textTertiary} />
          <VemtapText variant="micro" tone="tertiary" className="min-w-0 flex-1">
            {sizingNote}
          </VemtapText>
        </View>
      </SetupSectionCard>

      <View className="gap-3">
        <SetupSectionHeading title={copy.sectionOne} />
        <FieldInput
          label={copy.nameLabel}
          value={name}
          onChangeText={setName}
          placeholder={copy.namePlaceholder}
          accessibilityLabel={copy.nameLabel}
        />
        <VemtapText variant="micro" className="-mt-1 text-error">
          {copy.nameRequired}
        </VemtapText>
        <FieldInput
          label={copy.memoLabel}
          value={memo}
          onChangeText={setMemo}
          placeholder={copy.memoPlaceholder}
          accessibilityLabel={copy.memoLabel}
          multiline
        />
      </View>

      <View className="gap-3">
        <View className="flex-row items-center justify-between gap-2">
          <SetupSectionHeading title={copy.sectionTwo} className="min-w-0 flex-1" />
          <TextActionButton
            label={copy.clearAll}
            icon="close"
            tone="brand"
            onPress={() => {
              setCriteria([]);
              setPickers({});
            }}
          />
        </View>

        {error ? (
          <VemtapText variant="caption" className="text-error" accessibilityRole="alert">
            {error}
          </VemtapText>
        ) : null}

        {copy.categories.map(category => {
          const rows = copy.criteria.filter(
            criterion =>
              criterion.category === category.id &&
              (!criterionIds || criterionIds.includes(criterion.id)),
          );
          if (rows.length === 0) return null;
          return (
            <SetupSectionCard
              key={category.id}
              tone="lowest"
              className="gap-2.5 p-4 shadow-sm"
            >
              <View className="flex-row items-center gap-2.5">
                <View className="h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-tint">
                  <Icon
                    name={category.icon}
                    size={18}
                    color={
                      category.id === 'menu' ? colors.badgeDiscountText : colors.primary
                    }
                  />
                </View>
                <View className="min-w-0 flex-1 gap-0.5">
                  <VemtapText
                    variant="labelMd"
                    className="font-sans-semibold"
                    numberOfLines={2}
                  >
                    {category.title}
                  </VemtapText>
                  <VemtapText variant="micro" tone="tertiary" numberOfLines={2}>
                    {category.meta}
                  </VemtapText>
                </View>
              </View>
              {rows.map(criterion => {
                const selected = criteria.includes(criterion.id);
                const override = criterionOverrides?.[criterion.id];
                const pickerLabel =
                  override?.pickerLabel ??
                  ('picker' in criterion ? criterion.pickerLabel : undefined);
                return (
                  <View key={criterion.id} className="gap-1.5">
                    <BusinessCheckRow
                      type="checkbox"
                      title={criterion.title}
                      subtitle={override?.body ?? criterion.body}
                      selected={selected}
                      onPress={() => toggle(criterion.id)}
                    />
                    {selected && pickerLabel ? (
                      <CriterionPicker
                        label={pickerLabel}
                        labelClassName={categoryIconTone[category.id]}
                        options={
                          pickerOptions?.[criterion.id] ??
                          ('picker' in criterion
                            ? criterion.picker.map(label => ({ id: label, label }))
                            : [])
                        }
                        selectedIndex={pickers[criterion.id] ?? 0}
                        onPick={index => pick(criterion.id, index)}
                      />
                    ) : null}
                  </View>
                );
              })}
            </SetupSectionCard>
          );
        })}

        <SetupCallout
          icon="verifiedUser"
          title={copy.guardTitle}
          body={copy.guardBody}
          tone="subtle"
          bodyVariant="caption"
        />
      </View>
    </BusinessScreenLayout>
  );
}

interface CriterionPickerProps {
  label: string;
  labelClassName?: string;
  options: readonly CriterionOption[];
  selectedIndex: number;
  onPick: (index: number) => void;
}

/** The option chips under a ticked criterion (a deal, a dish, a branch…). */
function CriterionPicker({
  label,
  labelClassName,
  options,
  selectedIndex,
  onPick,
}: CriterionPickerProps) {
  return (
    <View className="gap-1.5 pl-1">
      <VemtapText
        variant="micro"
        tone="tertiary"
        className={labelClassName}
        numberOfLines={1}
      >
        {label}
      </VemtapText>
      {options.length ? (
        <HorizontallyScrollableRow>
          {options.map((option, index) => (
            <BusinessSelectionChip
              key={option.id}
              label={option.label}
              selected={selectedIndex === index}
              onPress={() => onPick(index)}
            />
          ))}
        </HorizontallyScrollableRow>
      ) : (
        <VemtapText variant="caption" tone="tertiary">
          {strings.customerSegments.live.builder.noOptions}
        </VemtapText>
      )}
    </View>
  );
}

import React, { useState } from 'react';
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

export interface CreateCustomSegmentScreenProps {
  onClose: () => void;
  onSave?: (segment: CustomSegmentSelection) => void;
  onCancel?: () => void;
}

export interface CustomSegmentSelection {
  name: string;
  memo: string;
  criteria: string[];
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
}: CreateCustomSegmentScreenProps) {
  const [name, setName] = useState<string>(copy.nameValue);
  const [memo, setMemo] = useState<string>(copy.memoValue);
  const [criteria, setCriteria] = useState<string[]>([
    'claimed',
    'dishes',
    'branch',
    'dormant',
  ]);
  const [pickers, setPickers] = useState<Record<string, number>>({});

  function toggle(id: string) {
    setCriteria(current =>
      current.includes(id) ? current.filter(item => item !== id) : [...current, id],
    );
  }

  function pick(criterionId: string, optionIndex: number) {
    setPickers(current => ({ ...current, [criterionId]: optionIndex }));
  }

  // Every active criterion widens the reachable pool; each step is ~23% of base.
  const sized = Math.min(400, Math.round(SIZING.total * (1 + criteria.length * 0.23)));
  const pushSized = Math.round(sized * 0.91);
  const dmSized = Math.round(sized * 0.77);

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
            label={copy.saveCta.replace('{count}', String(sized))}
            labelVariant="button"
            size="md"
            accessibilityLabel={copy.saveCta.replace('{count}', String(sized))}
            className="min-h-[52px] rounded-xl"
            leftIcon={<Icon name="arrowForward" size={18} color={colors.surface} />}
            onPress={() => onSave?.({ name, memo, criteria })}
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
          {strings.campaignWizard.segmentActions.business}
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
            {String(sized)}
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
              {`${pushSized} (${Math.round((pushSized / sized) * 100)}%)`}
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
              {`${dmSized} (${Math.round((dmSized / sized) * 100)}%)`}
            </VemtapText>
          </View>
        </View>
        <View className="flex-row items-center gap-1.5">
          <Icon name="verified" size={12} color={colors.textTertiary} />
          <VemtapText variant="micro" tone="tertiary" className="min-w-0 flex-1">
            {copy.sizingNote}
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

        {copy.categories.map(category => {
          const rows = copy.criteria.filter(
            criterion => criterion.category === category.id,
          );
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
                return (
                  <View key={criterion.id} className="gap-1.5">
                    <BusinessCheckRow
                      type="checkbox"
                      title={criterion.title}
                      subtitle={criterion.body}
                      selected={selected}
                      onPress={() => toggle(criterion.id)}
                    />
                    {selected && 'picker' in criterion ? (
                      <View className="gap-1.5 pl-1">
                        <VemtapText
                          variant="micro"
                          tone="tertiary"
                          className={categoryIconTone[category.id]}
                          numberOfLines={1}
                        >
                          {`${criterion.pickerLabel}`}
                        </VemtapText>
                        <HorizontallyScrollableRow>
                          {criterion.picker.map((option, index) => (
                            <BusinessSelectionChip
                              key={option}
                              label={option}
                              selected={(pickers[criterion.id] ?? 0) === index}
                              onPress={() => pick(criterion.id, index)}
                            />
                          ))}
                        </HorizontallyScrollableRow>
                      </View>
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

import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { Input } from '@components/ui/Input';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';
import {
  BusinessCollapsibleCard,
  BusinessProgress,
  BusinessScreenLayout,
} from '@features/business/components/BusinessPrimitives';

export type ClaimStep = {
  id: string;
  value: string;
};

export type CreateDealScheduleTermsValue = {
  claimSteps: ClaimStep[];
  terms: string[];
};

export interface CreateDealStep3ParticipatingBranchesScheduleScreenProps {
  onBack: () => void;
  onSave?: (value: CreateDealScheduleTermsValue) => void;
  onAddClaimStep?: () => void;
  onAddTerm?: (term: string) => void;
}

const initialClaimSteps: ClaimStep[] = [
  {
    id: 'claim-1',
    value: 'Show your digital VEMTAP voucher to server before ordering',
  },
  {
    id: 'claim-2',
    value: 'Enjoy your meal with 20% discount applied automatically at counter',
  },
  {
    id: 'claim-3',
    value: 'Settle remaining balance directly with restaurant',
  },
];

const initialTerms = [
  'Show voucher code before placing order',
  'Dine-in and pickup only. Not combinable with other promotions',
  'Valid only during specified lunch hours (12:00 PM – 5:00 PM)',
];

const suggestedTerms = [
  'Valid ID required',
  'One per table',
  'Not valid on public holidays',
];

export function CreateDealStep3ParticipatingBranchesScheduleScreen({
  onBack,
  onSave,
  onAddClaimStep,
  onAddTerm,
}: CreateDealStep3ParticipatingBranchesScheduleScreenProps) {
  const [claimExpanded, setClaimExpanded] = useState(true);
  const [termsExpanded, setTermsExpanded] = useState(true);
  const [claimSteps, setClaimSteps] = useState(initialClaimSteps);
  const [terms, setTerms] = useState(initialTerms);
  const [newTerm, setNewTerm] = useState('');

  const addClaimStep = () => {
    setClaimSteps(current => [
      ...current,
      { id: `claim-${current.length + 1}`, value: '' },
    ]);
    onAddClaimStep?.();
  };
  const addTerm = () => {
    const term = newTerm.trim();
    if (!term) return;
    setTerms(current => [...current, term]);
    setNewTerm('');
    onAddTerm?.(term);
  };

  return (
    <BusinessScreenLayout
      header={{
        title: 'Schedule & Terms',
        eyebrow: 'VEMTAP Merchant',
        onBack,
        actionLabel: 'Save',
        onAction: () => onSave?.({ claimSteps, terms }),
      }}
      contentContainerClassName="gap-6 pb-10"
    >
      <View>
        <BusinessProgress
          label="Step 3 of 4: Branches & Schedule"
          percent={75}
          completionLabel="75% complete"
          compact
        />
        <VemtapText tone="secondary" className="mt-3">
          Select which branch locations honor this voucher and set eligible days and
          redemption hours.
        </VemtapText>
      </View>

      <BusinessCollapsibleCard
        title="How to Claim Steps"
        subtitle="Step-by-step voucher redemption flow shown to diners."
        badge="Customer Guide"
        trailingMeta="3 steps"
        toggleGlyph="plus"
        expanded={claimExpanded}
        onToggle={() => setClaimExpanded(current => !current)}
      >
        <View className="gap-2">
          {claimSteps.map((step, index) => (
            <View
              key={step.id}
              className="flex-row items-center gap-2 rounded-xl border border-border bg-surface-subtle p-3"
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Reorder claim step ${index + 1}`}
                className="shrink-0 p-1"
              >
                <Icon name="drag" size={20} color={colors.textTertiary} />
              </Pressable>
              <View className="h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary">
                <VemtapText
                  variant="labelSm"
                  className="font-sans-semibold text-primary-foreground"
                >
                  {index + 1}
                </VemtapText>
              </View>
              <Input
                value={step.value}
                onChangeText={value =>
                  setClaimSteps(current =>
                    current.map(item =>
                      item.id === step.id ? { ...item, value } : item,
                    ),
                  )
                }
                accessibilityLabel={`Claim step ${index + 1}`}
                containerClassName="min-w-0 flex-1 gap-0"
                className="min-h-10 border-0 bg-transparent px-0"
                fieldClassName="h-10 min-w-0 border-0 bg-transparent px-0"
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Delete claim step ${index + 1}`}
                className="shrink-0 p-1"
                onPress={() =>
                  setClaimSteps(current => current.filter(item => item.id !== step.id))
                }
              >
                <Icon name="delete" size={18} color={colors.textTertiary} />
              </Pressable>
            </View>
          ))}
        </View>
        <Button
          label="Add Claim Step"
          labelVariant="labelMd"
          variant="outline"
          className="min-h-11 border-dashed bg-surface"
          leftIcon={<Icon name="plusCircle" size={18} color={colors.primary} />}
          onPress={addClaimStep}
        />
      </BusinessCollapsibleCard>

      <BusinessCollapsibleCard
        title="Terms & Conditions Rules"
        subtitle="Clear redemption limits and restaurant policies."
        trailingMeta="Auto-formatted"
        toggleGlyph="plus"
        expanded={termsExpanded}
        onToggle={() => setTermsExpanded(current => !current)}
      >
        <View className="gap-2">
          {terms.map((term, index) => (
            <View
              key={term}
              className="flex-row items-start gap-2 rounded-xl border border-border bg-surface-subtle p-3"
            >
              <Icon name="checkCircle" size={18} color={colors.primary} />
              <VemtapText variant="bodyMd" className="min-w-0 flex-1">
                {term}
              </VemtapText>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Remove ${term}`}
                className="shrink-0 p-1"
                onPress={() =>
                  setTerms(current =>
                    current.filter((_, itemIndex) => itemIndex !== index),
                  )
                }
              >
                <Icon name="delete" size={18} color={colors.textTertiary} />
              </Pressable>
            </View>
          ))}
        </View>
        <View className="gap-1 pt-1">
          <VemtapText variant="caption" tone="tertiary" className="font-sans-medium">
            Quick-add suggested rules:
          </VemtapText>
          <View className="flex-row flex-wrap gap-1.5">
            {suggestedTerms.map(suggestion => (
              <Pressable
                key={suggestion}
                accessibilityRole="button"
                accessibilityLabel={`Add ${suggestion}`}
                className="flex-row items-center gap-1 rounded-full bg-surface-container px-2.5 py-1 active:bg-surface-tint"
                onPress={() => addSuggestedTerm(suggestion, setTerms, onAddTerm)}
              >
                <Icon name="plus" size={14} color={colors.textSecondary} />
                <VemtapText variant="caption" tone="secondary">
                  {suggestion}
                </VemtapText>
              </Pressable>
            ))}
          </View>
        </View>
        <View className="mt-1 flex-row items-center gap-2">
          <Input
            value={newTerm}
            onChangeText={setNewTerm}
            placeholder="Type a new term or policy note..."
            accessibilityLabel="New term or policy note"
            containerClassName="min-w-0 flex-1 gap-0"
            className="min-h-11 bg-surface"
            fieldClassName="min-h-11 bg-surface"
            leadingIcon={<Icon name="editNote" size={18} color={colors.textTertiary} />}
          />
          <Button
            label="Add"
            labelVariant="labelMd"
            variant="secondary"
            fullWidth={false}
            className="min-h-11 min-w-[84px] shrink-0 border-0 bg-surface-tint px-4"
            leftIcon={<Icon name="plus" size={18} color={colors.primary} />}
            onPress={addTerm}
          />
        </View>
      </BusinessCollapsibleCard>
    </BusinessScreenLayout>
  );
}

function addSuggestedTerm(
  term: string,
  setTerms: React.Dispatch<React.SetStateAction<string[]>>,
  onAddTerm?: (term: string) => void,
) {
  setTerms(current => [...current, term]);
  onAddTerm?.(term);
}

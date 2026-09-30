import React, { useState } from 'react';
import { View } from 'react-native';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { CampaignWizardStepLayout } from '@features/business/components/CampaignWizardStepLayout';
import { ServiceChoiceCard } from '@features/business/components/ServiceFlowPrimitives';
import {
  SetupCallout,
  SetupSectionCard,
} from '@features/business/components/BusinessSetupPrimitives';

const copy = strings.campaignWizard;
const step = copy.step1;

export interface CampaignStep1ObjectiveScreenProps {
  onBack: () => void;
  onContinue: (objectiveId: string) => void;
  onSaveDraft?: () => void;
  initialObjectiveId?: string;
}

/**
 * Create Campaign — Step 1: Objective.
 * stitch_vemtap_mobile_app_design/create_campaign_step_1_objective
 */
export function CampaignStep1ObjectiveScreen({
  onBack,
  onContinue,
  onSaveDraft,
  initialObjectiveId = step.objectives[0].id,
}: CampaignStep1ObjectiveScreenProps) {
  const [objective, setObjective] = useState<string>(initialObjectiveId);

  return (
    <CampaignWizardStepLayout
      step={1}
      title={step.title}
      hero={step.hero}
      heroBody={step.heroBody}
      onBack={onBack}
      onNext={() => onContinue(objective)}
      nextLabel={step.cta}
      backLabel={copy.saveDraftExit}
      onSaveDraft={onSaveDraft}
    >
      <View className="gap-3">
        {step.objectives.map(option => (
          <ServiceChoiceCard
            key={option.id}
            title={option.title}
            description={option.body}
            icon={option.icon}
            selected={option.id === objective}
            onPress={() => setObjective(option.id)}
          />
        ))}
      </View>

      {(() => {
        const active = step.objectives.find(option => option.id === objective);
        return active && 'badge' in active ? (
          <SetupSectionCard tone="container" className="flex-row items-center gap-2 p-3">
            <Icon name="checkCircle" size={16} color={colors.primary} />
            <VemtapText
              variant="caption"
              className="min-w-0 flex-1 font-sans-semibold text-primary"
            >
              {active.badge}
            </VemtapText>
          </SetupSectionCard>
        ) : null;
      })()}

      <SetupCallout icon="info" body={step.note} tone="tint" bodyVariant="caption" />
    </CampaignWizardStepLayout>
  );
}

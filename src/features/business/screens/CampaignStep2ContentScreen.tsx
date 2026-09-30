import React, { useState } from 'react';
import { View } from 'react-native';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { CampaignWizardStepLayout } from '@features/business/components/CampaignWizardStepLayout';
import { HorizontallyScrollableRow } from '@features/business/components/BusinessSetupPrimitives';
import { BusinessSelectionChip } from '@features/business/components/BusinessPrimitives';
import { BusinessScopeCard } from '@features/business/components/BusinessOpsPrimitives';

const copy = strings.campaignWizard;
const step = copy.step2;

export interface CampaignStep2ContentScreenProps {
  onBack: () => void;
  onContinue: (assetIds: string[]) => void;
  onSaveDraft?: () => void;
  initialAssetIds?: string[];
}

/**
 * Create Campaign — Step 2: Content.
 * stitch_vemtap_mobile_app_design/create_campaign_step_2_content
 */
export function CampaignStep2ContentScreen({
  onBack,
  onContinue,
  onSaveDraft,
  initialAssetIds = [step.items[0].id, step.items[1].id],
}: CampaignStep2ContentScreenProps) {
  const [filter, setFilter] = useState<string>('all');
  const [assets, setAssets] = useState<string[]>(initialAssetIds);

  const visible =
    filter === 'all' ? step.items : step.items.filter(item => item.group === filter);

  function toggle(id: string) {
    setAssets(current =>
      current.includes(id) ? current.filter(item => item !== id) : [...current, id],
    );
  }

  return (
    <CampaignWizardStepLayout
      step={2}
      title={step.title}
      hero={step.hero}
      heroBody={step.heroBody}
      onBack={onBack}
      onNext={() => onContinue(assets)}
      nextLabel={step.cta}
      backLabel={step.back}
      draftLabel={copy.saveDraft}
      onSaveDraft={onSaveDraft}
      footerExtra={
        <View className="flex-row items-center gap-1.5 self-center">
          <View className="h-1.5 w-1.5 rounded-full bg-primary" />
          <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
            {assets.length === 1
              ? step.selectedOne
              : step.selectedMany.replace('{count}', String(assets.length))}
          </VemtapText>
        </View>
      }
    >
      <HorizontallyScrollableRow>
        {step.filters.map(option => (
          <BusinessSelectionChip
            key={option.id}
            label={'count' in option ? `${option.label} ${option.count}` : option.label}
            selected={option.id === filter}
            onPress={() => setFilter(option.id)}
          />
        ))}
      </HorizontallyScrollableRow>

      <View className="gap-3">
        {visible.map(item => (
          <BusinessScopeCard
            key={item.id}
            type="checkbox"
            title={item.title}
            tag={item.eyebrow}
            selected={assets.includes(item.id)}
            onPress={() => toggle(item.id)}
            leading={
              <View className="h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-surface-subtle">
                <View className="max-w-full rounded-full bg-primary px-1.5 py-0.5">
                  <VemtapText
                    variant="micro"
                    className="font-sans-semibold text-primary-foreground"
                    numberOfLines={1}
                  >
                    {item.badge}
                  </VemtapText>
                </View>
              </View>
            }
          >
            <View className="mt-1.5 flex-row flex-wrap items-center gap-1.5">
              <VemtapText
                variant="caption"
                tone="secondary"
                className="min-w-0 flex-1"
                numberOfLines={2}
              >
                {item.body}
              </VemtapText>
              {item.price ? (
                <VemtapText
                  variant="labelSm"
                  className="font-sans-semibold"
                  numberOfLines={1}
                >
                  {item.price}
                </VemtapText>
              ) : null}
              {item.was ? (
                <VemtapText variant="caption" tone="tertiary" className="line-through">
                  {item.was}
                </VemtapText>
              ) : null}
            </View>
            {item.performance ? (
              <View className="mt-1 flex-row items-center gap-1">
                <Icon name={item.icon} size={12} color={colors.textSecondary} />
                <VemtapText
                  variant="micro"
                  tone="secondary"
                  className="min-w-0 flex-1"
                  numberOfLines={1}
                >
                  {item.performance}
                </VemtapText>
              </View>
            ) : null}
            <View className="mt-1 flex-row items-center gap-1">
              <Icon name="locationOn" size={12} color={colors.textTertiary} />
              <VemtapText
                variant="micro"
                tone="tertiary"
                className="min-w-0 flex-1"
                numberOfLines={1}
              >
                {item.location}
              </VemtapText>
            </View>
          </BusinessScopeCard>
        ))}
      </View>
    </CampaignWizardStepLayout>
  );
}

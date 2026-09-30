import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import {
  BusinessActionDock,
  BusinessScreenLayout,
  BusinessStatusPill,
} from '@features/business/components/BusinessPrimitives';
import {
  BusinessIconWell,
  BusinessPanel,
} from '@features/business/components/BusinessOpsPrimitives';
import { BusinessMetricGrid } from '@features/business/components/BusinessAnalyticsPrimitives';
import { BusinessFaqRow } from '@features/business/components/BusinessPosPrimitives';
import {
  fairNetworkRules,
  guideTiers,
  networkFaqs,
  networkPartners,
} from '@features/business/data/businessNetworkData';

const copy = strings.businessNetworkInfo;

const stepIcon: Record<string, import('@components/ui/Icon').IconName> = {
  share: 'qrCodeScan',
  verify: 'verifiedUser',
  pair: 'bolt',
};

export interface BusinessNetworkInfoScreenProps {
  onBack?: () => void;
  onOpenHelp?: () => void;
  onOpenProfile?: () => void;
  onOpenStep?: (stepId: string) => void;
  onGetLink?: () => void;
  onBackToNetwork?: () => void;
}

/**
 * The Business Network knowledge base: the community ethos with headline
 * figures, the three-step join flow, the milestone tier perks, the fairness
 * rules and the FAQ.
 */
export function BusinessNetworkInfoScreen({
  onBack,
  onOpenHelp,
  onOpenProfile,
  onOpenStep,
  onGetLink,
  onBackToNetwork,
}: BusinessNetworkInfoScreenProps) {
  const [openFaq, setOpenFaq] = useState<string | null>(networkFaqs[0].id);

  return (
    <BusinessScreenLayout
      header={{
        title: copy.headerTitle,
        onBack,
        actions: [
          { icon: 'help', label: copy.headerHelp, onPress: onOpenHelp },
          { icon: 'accountCircle', label: copy.headerTitle, onPress: onOpenProfile },
        ],
      }}
      contentContainerClassName="pb-8"
      footer={
        <BusinessActionDock>
          <Button
            label={copy.readyCta}
            labelVariant="labelMd"
            onPress={onGetLink}
            leftIcon={<Icon name="share" size={18} color={colors.surface} />}
          />
          <Button
            label={copy.backCta}
            labelVariant="labelSm"
            variant="secondary"
            onPress={onBackToNetwork}
          />
        </BusinessActionDock>
      }
    >
      <View className="gap-2 rounded-card bg-surface p-4 shadow-sm">
        <View className="flex-row items-center gap-2">
          <BusinessIconWell icon="hub" tone="brand" />
          <VemtapText
            variant="labelMd"
            className="min-w-0 flex-1 font-sans-semibold"
            numberOfLines={1}
          >
            {copy.title}
          </VemtapText>
        </View>
        <VemtapText variant="headingLg" className="text-heading-lg" numberOfLines={2}>
          {copy.hero}
        </VemtapText>
        <VemtapText
          variant="bodyMd"
          tone="secondary"
          className="leading-relaxed"
          numberOfLines={4}
        >
          {copy.body}
        </VemtapText>
      </View>

      <BusinessPanel className="mt-3" title={copy.ethosTitle} icon="handshake">
        <VemtapText variant="labelMd" className="font-sans-semibold" numberOfLines={2}>
          {copy.whyTitle}
        </VemtapText>
        <VemtapText
          variant="bodyMd"
          tone="secondary"
          className="leading-relaxed"
          numberOfLines={6}
        >
          {copy.ethosBody}
        </VemtapText>
        <BusinessMetricGrid
          cells={copy.stats.map(stat => ({ label: stat.label, value: stat.value }))}
          columns={3}
          variant="bare"
        />
        <View className="flex-row items-start gap-2.5 rounded-field bg-surface-tint p-3">
          <BusinessIconWell icon="groupNetwork" tone="brand" size="sm" />
          <View className="min-w-0 flex-1">
            <VemtapText
              variant="caption"
              className="font-sans-semibold text-primary"
              numberOfLines={1}
            >
              {copy.quoteTitle}
            </VemtapText>
            <VemtapText
              variant="caption"
              className="mt-0.5 text-primary"
              numberOfLines={3}
            >
              {copy.quote}
            </VemtapText>
          </View>
        </View>
      </BusinessPanel>

      <BusinessPanel
        className="mt-3"
        title={copy.howTitle}
        icon="timeline"
        badge={copy.howSubtitle}
        badgeTone="neutral"
      >
        <View className="gap-2">
          {copy.steps.map(step => (
            <Pressable
              key={step.id}
              accessibilityRole="button"
              accessibilityLabel={step.title}
              onPress={onOpenStep ? () => onOpenStep(step.id) : undefined}
              className="flex-row items-start gap-3 rounded-field bg-surface-subtle p-3 active:bg-surface-container"
            >
              <View className="h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface">
                <Icon name={stepIcon[step.id]} size={18} color={colors.primary} />
              </View>
              <View className="min-w-0 flex-1">
                <View className="flex-row items-center gap-1.5">
                  <View className="h-5 w-5 items-center justify-center rounded-full bg-primary">
                    <VemtapText
                      variant="micro"
                      className="font-sans-bold text-primary-foreground"
                      numberOfLines={1}
                    >
                      {step.step}
                    </VemtapText>
                  </View>
                  <VemtapText
                    variant="labelMd"
                    className="min-w-0 flex-1 font-sans-semibold"
                    numberOfLines={2}
                  >
                    {step.title}
                  </VemtapText>
                </View>
                <VemtapText
                  variant="caption"
                  tone="secondary"
                  className="mt-1 leading-relaxed"
                  numberOfLines={4}
                >
                  {step.body}
                </VemtapText>
              </View>
            </Pressable>
          ))}
        </View>
      </BusinessPanel>

      <BusinessPanel
        className="mt-3"
        title={copy.tiersTitle}
        icon="workspacePremium"
        badge={copy.tiersSubtitle}
        badgeTone="neutral"
      >
        <View className="gap-2">
          {guideTiers.map(tier => (
            <View key={tier.id} className="gap-2 rounded-field bg-surface-subtle p-3">
              <View className="flex-row items-center gap-2">
                <Icon name="trophy" size={17} color={colors.primary} />
                <VemtapText
                  variant="labelMd"
                  className="min-w-0 flex-1 font-sans-semibold"
                  numberOfLines={2}
                >
                  {tier.name}
                </VemtapText>
                <BusinessStatusPill label={tier.badge} tone={tier.badgeTone} />
              </View>
              <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
                {tier.threshold}
              </VemtapText>
              <View className="gap-1.5">
                {tier.perks.map(perk => (
                  <View key={perk} className="flex-row items-start gap-2">
                    <Icon name="checkCircle" size={14} color={colors.badgeDiscountText} />
                    <VemtapText
                      variant="caption"
                      tone="secondary"
                      className="min-w-0 flex-1"
                      numberOfLines={3}
                    >
                      {perk}
                    </VemtapText>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      </BusinessPanel>

      <BusinessPanel
        className="mt-3"
        title={copy.rulesTitle}
        icon="policy"
        badge={copy.rulesSubtitle}
        badgeTone="neutral"
      >
        <View className="gap-2">
          {fairNetworkRules.map(rule => (
            <View
              key={rule.id}
              className="flex-row items-start gap-2.5 rounded-field bg-surface-subtle p-2.5"
            >
              <BusinessIconWell icon={rule.icon} tone="brand" size="sm" />
              <View className="min-w-0 flex-1">
                <VemtapText
                  variant="labelMd"
                  className="font-sans-semibold"
                  numberOfLines={2}
                >
                  {rule.title}
                </VemtapText>
                <VemtapText
                  variant="caption"
                  tone="secondary"
                  className="mt-0.5"
                  numberOfLines={3}
                >
                  {rule.body}
                </VemtapText>
              </View>
            </View>
          ))}
        </View>
      </BusinessPanel>

      <BusinessPanel className="mt-3" title={copy.faqTitle} icon="help">
        <View className="gap-2">
          {networkFaqs.map(faq => (
            <BusinessFaqRow
              key={faq.id}
              question={faq.question}
              answer={faq.answer}
              defaultOpen={openFaq === faq.id}
              onPress={() => setOpenFaq(faq.id)}
            />
          ))}
        </View>
      </BusinessPanel>

      <View className="mt-3 flex-row items-center gap-1.5 rounded-field bg-surface-subtle p-2.5">
        <Icon name="verifiedUser" size={14} color={colors.textTertiary} />
        <VemtapText
          variant="micro"
          tone="tertiary"
          className="min-w-0 flex-1"
          numberOfLines={2}
        >
          {`${networkPartners.length} merchants already connected in your district.`}
        </VemtapText>
      </View>
    </BusinessScreenLayout>
  );
}

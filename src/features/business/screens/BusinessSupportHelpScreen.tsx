import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { Button } from '@components/ui/Button';
import {
  BusinessScreenLayout,
  BusinessStatusPill,
} from '@features/business/components/BusinessPrimitives';
import {
  BusinessIconWell,
  BusinessPanel,
} from '@features/business/components/BusinessOpsPrimitives';
import {
  BusinessChannelTile,
  BusinessFaqRow,
  BusinessInitialsAvatar,
} from '@features/business/components/BusinessPosPrimitives';
import {
  knowledgeBase,
  supportChannelIcon,
  supportFaqs,
  supportStatusUptime,
} from '@features/business/data/businessTrustSettingsData';

const copy = strings.businessSupportHelp;

export interface BusinessSupportHelpScreenProps {
  onBack?: () => void;
  onOpenProfile?: () => void;
  onOpenChannel?: (channelId: string) => void;
  onScheduleCall?: () => void;
  onStartChat?: () => void;
  onOpenCategory?: (categoryId: string) => void;
  onOpenArticle?: (articleTitle: string) => void;
  onBookTechnician?: () => void;
}

/**
 * Support & help: fast-track support channels, the assigned success partner,
 * an expandable knowledge base grouped by category, FAQs and the system status
 * strip.
 */
export function BusinessSupportHelpScreen({
  onBack,
  onOpenProfile,
  onOpenChannel,
  onScheduleCall,
  onStartChat,
  onOpenCategory,
  onOpenArticle,
  onBookTechnician,
}: BusinessSupportHelpScreenProps) {
  const [expanded, setExpanded] = useState<string[]>([]);

  return (
    <BusinessScreenLayout
      header={{
        title: copy.headerTitle,
        onBack,
        actions: [
          { icon: 'accountCircle', label: copy.headerTitle, onPress: onOpenProfile },
        ],
      }}
      contentContainerClassName="pb-8"
      footer={
        <Button
          label={copy.technicianCta}
          labelVariant="labelMd"
          onPress={onBookTechnician}
          leftIcon={<Icon name="calendarTask" size={18} color={colors.surface} />}
        />
      }
    >
      <View className="flex-row items-center justify-between gap-2">
        <View className="min-w-0 flex-1 flex-row items-center gap-2">
          <Icon name="contactSupport" size={18} color={colors.primary} />
          <VemtapText
            variant="labelMd"
            className="min-w-0 flex-1 font-sans-semibold"
            numberOfLines={1}
          >
            {copy.fastTrackTitle}
          </VemtapText>
        </View>
        <BusinessStatusPill label={copy.liveBadge} tone="success" />
      </View>

      <View className="mt-3 flex-row gap-2">
        {copy.channels.map(channel => (
          <BusinessChannelTile
            key={channel.id}
            label={channel.label}
            hint={channel.hint}
            icon={supportChannelIcon[channel.id]}
            tone={channel.id === 'whatsapp' ? 'success' : 'brand'}
            onPress={() => onOpenChannel?.(channel.id)}
          />
        ))}
      </View>

      <View className="mt-3 flex-row items-center gap-3 rounded-card bg-surface p-3 shadow-sm">
        <BusinessInitialsAvatar initials={copy.partnerInitials} size="lg" tone="brand" />
        <View className="min-w-0 flex-1">
          <VemtapText variant="labelMd" className="font-sans-semibold" numberOfLines={1}>
            {copy.partnerName}
          </VemtapText>
          <VemtapText variant="caption" tone="secondary" numberOfLines={2}>
            {copy.partnerRole}
          </VemtapText>
        </View>
        <View className="flex-col gap-1.5">
          {copy.partnerCtas.map(cta => (
            <Pressable
              key={cta}
              accessibilityRole="button"
              accessibilityLabel={cta}
              onPress={cta === copy.partnerCtas[0] ? onScheduleCall : onStartChat}
              className="min-h-9 flex-row items-center justify-center gap-1 rounded-full bg-surface-tint px-3 active:scale-95"
            >
              <Icon
                name={cta === copy.partnerCtas[0] ? 'calendarEdit' : 'message'}
                size={14}
                color={colors.primary}
              />
              <VemtapText
                variant="labelSm"
                className="font-sans-semibold text-primary"
                numberOfLines={1}
              >
                {cta}
              </VemtapText>
            </Pressable>
          ))}
        </View>
      </View>

      <BusinessPanel
        className="mt-3"
        title={copy.knowledgeTitle}
        icon="folderStar"
        badge={copy.knowledgeBadge}
        badgeTone="neutral"
      >
        <View className="gap-2">
          {knowledgeBase.map(category => {
            const open = expanded.includes(category.id);
            return (
              <View
                key={category.id}
                className="overflow-hidden rounded-field bg-surface-subtle"
              >
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ expanded: open }}
                  accessibilityLabel={category.title}
                  onPress={() => {
                    setExpanded(ids =>
                      ids.includes(category.id)
                        ? ids.filter(id => id !== category.id)
                        : [...ids, category.id],
                    );
                    onOpenCategory?.(category.id);
                  }}
                  className="flex-row items-center gap-3 p-3 active:bg-surface-container"
                >
                  <BusinessIconWell icon={category.icon} tone="brand" size="md" />
                  <View className="min-w-0 flex-1">
                    <VemtapText
                      variant="labelMd"
                      className="font-sans-semibold"
                      numberOfLines={2}
                    >
                      {category.title}
                    </VemtapText>
                    <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                      {category.count}
                    </VemtapText>
                  </View>
                  <View className="shrink-0">
                    <Icon
                      name="expandMore"
                      size={20}
                      color={colors.textTertiary}
                      style={open ? { transform: [{ rotate: '180deg' }] } : undefined}
                    />
                  </View>
                </Pressable>
                {open ? (
                  <View className="gap-1 px-3 pb-3">
                    {category.articles.map(article => (
                      <Pressable
                        key={article}
                        accessibilityRole="button"
                        accessibilityLabel={article}
                        onPress={() => onOpenArticle?.(article)}
                        className="min-h-10 flex-row items-center gap-2 rounded-field bg-surface px-2.5 active:bg-surface-container-low"
                      >
                        <VemtapText
                          variant="caption"
                          tone="secondary"
                          className="min-w-0 flex-1"
                          numberOfLines={2}
                        >
                          {article}
                        </VemtapText>
                        <View className="shrink-0">
                          <Icon name="forward" size={16} color={colors.textTertiary} />
                        </View>
                      </Pressable>
                    ))}
                  </View>
                ) : null}
              </View>
            );
          })}
        </View>
      </BusinessPanel>

      <BusinessPanel className="mt-3" title={copy.faqTitle} icon="help">
        <View className="gap-2">
          {supportFaqs.map(faq => (
            <BusinessFaqRow
              key={faq.id}
              question={faq.question}
              answer={faq.answer}
              defaultOpen={faq.id === supportFaqs[0].id}
            />
          ))}
        </View>
      </BusinessPanel>

      <View className="mt-3 gap-2 rounded-card bg-surface p-3 shadow-sm">
        <View className="flex-row items-center gap-2.5">
          <View className="h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-badge-discount-bg">
            <Icon name="cloudCheck" size={18} color={colors.badgeDiscountText} />
          </View>
          <VemtapText
            variant="labelMd"
            className="min-w-0 flex-1 font-sans-semibold"
            numberOfLines={2}
          >
            {copy.statusTitle}
          </VemtapText>
          <VemtapText
            variant="labelSm"
            className="shrink-0 font-sans-bold text-badge-discount-text"
            numberOfLines={1}
          >
            {supportStatusUptime}
          </VemtapText>
        </View>
      </View>
    </BusinessScreenLayout>
  );
}

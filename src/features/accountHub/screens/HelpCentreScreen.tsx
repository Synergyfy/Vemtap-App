import React, { useMemo, useState } from 'react';
import { Image, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cssInterop } from 'nativewind';
import { EmptyState } from '@components/shared/EmptyState';
import { TwoColumnGrid } from '@components/shared/TwoColumnGrid';
import { Button } from '@components/ui/Button';
import { Icon, type IconName } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';
import { strings } from '@constants/strings';
import {
  AccountHeader,
  PageScroll,
} from '@features/accountHub/components/AccountScreensPrimitives';
import { HubSearchField } from '@features/accountHub/components/HubPrimitives';
import { ContactOption } from '@features/claimedDeal/components/ContactBusinessOptionsSheet';
import { BusinessCollapsibleCard } from '@features/business/components/BusinessPrimitives';
import { cn } from '@utils/cn';

cssInterop(Pressable, { className: 'style' });
cssInterop(Image, { className: 'style' });

const copy = strings.accountScreens.helpCentre;
const BANNER_IMAGE_URI =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBIz7aEV8fSLe0tuwvk8Ze8MnxKxyyCNRrWo1fYfJBlP86XQ9TQWI91cj3xFqRr_pXNuw2CX7ItBWa_taCeRwx6UHzov6CAX4TF6Yf6lg9uDIihSao34AkbZqGSGTXlpZ19RkQPT3ygIv6narBAYm4AsLG2Fb3F3ViJ7jLKGJTgY7Vg_TjSmfJhw4bBQhXIzYDFWGTImoZzcNDX2mi8Pym9Hrn46faUYL-z7RUQ5eqG';

export interface HelpCentreScreenProps {
  onBack: () => void;
  onStartChat?: () => void;
  onOpenWhatsApp?: () => void;
  onEmailSupport?: () => void;
  onOwnBusiness?: () => void;
  onOpenAccount?: () => void;
}

export function HelpCentreScreen({
  onBack,
  onStartChat,
  onOpenWhatsApp,
  onEmailSupport,
  onOwnBusiness,
  onOpenAccount,
}: HelpCentreScreenProps) {
  const [query, setQuery] = useState('');
  const [topicFaqIds, setTopicFaqIds] = useState<readonly string[] | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const visibleFaqs = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (term) {
      return copy.faqs.filter(faq =>
        `${faq.question} ${faq.answer.join(' ')}`.toLowerCase().includes(term),
      );
    }
    if (topicFaqIds) {
      return copy.faqs.filter(faq => topicFaqIds.includes(faq.id));
    }
    return copy.faqs;
  }, [query, topicFaqIds]);

  const handleSearch = (text: string) => {
    setQuery(text);
    if (text.length > 0) setTopicFaqIds(null);
  };

  const handleTopic = (faqIds: readonly string[]) => {
    setQuery('');
    setTopicFaqIds(faqIds);
  };

  const allExpanded = copy.faqs.length > 0 && copy.faqs.every(faq => expanded[faq.id]);

  const toggleAll = () => {
    const next = !allExpanded;
    setExpanded(
      copy.faqs.reduce<Record<string, boolean>>((accumulator, faq) => {
        accumulator[faq.id] = next;
        return accumulator;
      }, {}),
    );
  };

  const toggleFaq = (id: string) => {
    setExpanded(current => ({ ...current, [id]: !current[id] }));
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-surface">
      <AccountHeader title={copy.title} onBack={onBack} onOpenAccount={onOpenAccount} />
      <View className="flex-1">
        <PageScroll>
          <View className="gap-1">
            <View className="mb-1 flex-row items-center gap-1.5">
              <View className="h-6 w-6 items-center justify-center rounded-full bg-badge-discount-bg">
                <Icon name="verifiedUser" size={16} color={colors.badgeDiscountText} />
              </View>
              <VemtapText variant="labelSm" tone="secondary" className="uppercase">
                {copy.concierge}
              </VemtapText>
            </View>
            <VemtapText
              accessibilityRole="header"
              variant="headingLg"
              className="text-heading-lg"
            >
              {copy.headline}
            </VemtapText>
            <VemtapText tone="secondary" className="mt-1">
              {copy.subtitle}
            </VemtapText>
          </View>

          <View className="mt-4">
            <HubSearchField
              value={query}
              onChangeText={handleSearch}
              placeholder={copy.searchPlaceholder}
            />
          </View>

          <View className="flex-row items-center gap-4 rounded-xl bg-surface-container-low p-4 shadow-sm">
            <View className="min-w-0 flex-1">
              <View className="mb-1 self-start rounded-full bg-surface-tint-blue px-2 py-0.5">
                <VemtapText variant="caption" className="text-primary">
                  {copy.bannerPill}
                </VemtapText>
              </View>
              <VemtapText variant="headingSm" className="text-heading-sm">
                {copy.bannerTitle}
              </VemtapText>
              <VemtapText variant="labelSm" tone="secondary" className="mt-0.5">
                {copy.bannerBody}
              </VemtapText>
            </View>
            <View className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-surface-container shadow-sm">
              <BannerImage />
            </View>
          </View>

          <View className="gap-2">
            <View className="flex-row items-center justify-between gap-3">
              <VemtapText variant="headingSm" className="text-heading-sm">
                {copy.topicsTitle}
              </VemtapText>
              <VemtapText variant="caption" tone="secondary">
                {copy.topicsCount}
              </VemtapText>
            </View>
            <TwoColumnGrid
              items={copy.topics}
              keyExtractor={topic => topic.id}
              renderItem={topic => (
                <TopicCard
                  icon={topic.icon}
                  title={topic.title}
                  subtitle={topic.subtitle}
                  onPress={() => handleTopic(topic.faqIds)}
                />
              )}
            />
          </View>

          <View className="gap-2">
            <View className="flex-row items-center justify-between gap-3">
              <VemtapText variant="headingSm" className="text-heading-sm">
                {copy.faqTitle}
              </VemtapText>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={allExpanded ? copy.collapseAll : copy.expandAll}
                onPress={toggleAll}
                hitSlop={8}
              >
                <VemtapText variant="caption" className="font-sans-medium text-primary">
                  {allExpanded ? copy.collapseAll : copy.expandAll}
                </VemtapText>
              </Pressable>
            </View>

            {visibleFaqs.length === 0 ? (
              <EmptyState
                title={copy.noResultsTitle}
                description={copy.noResultsBody}
                actionLabel={copy.topicsTitle}
                onAction={() => {
                  setQuery('');
                  setTopicFaqIds(null);
                }}
                className="px-0 py-8"
              />
            ) : (
              visibleFaqs.map(faq => (
                <BusinessCollapsibleCard
                  key={faq.id}
                  title={faq.question}
                  titleVariant="labelMd"
                  subtitle={expanded[faq.id] ? undefined : faq.answer[0]}
                  expanded={Boolean(expanded[faq.id])}
                  toggleGlyph="plus"
                  onToggle={() => toggleFaq(faq.id)}
                >
                  <View className="gap-1">
                    {faq.answer.map(paragraph => (
                      <VemtapText key={paragraph} variant="labelSm" tone="secondary">
                        {paragraph}
                      </VemtapText>
                    ))}
                  </View>
                </BusinessCollapsibleCard>
              ))
            )}
          </View>

          <View className="gap-4 rounded-xl bg-surface-container-lowest p-4 shadow-sm">
            <View className="flex-row items-center gap-2">
              <View className="h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary">
                <Icon name="contactSupport" size={22} color={colors.surface} />
              </View>
              <View className="min-w-0 flex-1">
                <VemtapText variant="headingSm" className="text-heading-sm">
                  {copy.supportTitle}
                </VemtapText>
                <VemtapText variant="caption" tone="secondary">
                  {copy.supportSubtitle}
                </VemtapText>
              </View>
            </View>

            <View className="flex-row items-center justify-between gap-3 rounded-lg bg-surface-container-low p-3">
              <View className="min-w-0 flex-1">
                <View className="flex-row items-center gap-1.5">
                  <View className="h-2 w-2 rounded-full bg-badge-discount-text" />
                  <VemtapText variant="labelMd" numberOfLines={1}>
                    {copy.chatTitle}
                  </VemtapText>
                </View>
                <VemtapText variant="caption" className="mt-0.5 text-badge-discount-text">
                  {copy.chatMeta}
                </VemtapText>
              </View>
              <Button
                label={copy.startChat}
                labelVariant="labelSm"
                size="sm"
                fullWidth={false}
                className="shrink-0"
                onPress={onStartChat}
              />
            </View>

            <ContactOption
              icon="whatsapp"
              title={copy.whatsappTitle}
              description={copy.whatsappSubtitle}
              onPress={() => onOpenWhatsApp?.()}
            />
            <ContactOption
              icon="mail"
              title={copy.emailTitle}
              description={copy.emailAddress}
              onPress={() => onEmailSupport?.()}
            />

            <View className="flex-row items-start gap-2 rounded-lg bg-surface-tint-blue p-3">
              <View className="pt-0.5">
                <Icon name="schedule" size={20} color={colors.primary} />
              </View>
              <VemtapText variant="labelSm" className="min-w-0 flex-1">
                {copy.hoursPrefix}{' '}
                <VemtapText variant="labelSm" className="font-sans-semibold text-primary">
                  {copy.hoursValue}
                </VemtapText>
              </VemtapText>
            </View>
          </View>

          <View className="items-center pb-2 pt-1">
            <Pressable
              accessibilityRole="link"
              accessibilityLabel={copy.ownBusinessLink}
              onPress={onOwnBusiness}
              className="min-h-9 w-full items-center justify-center py-1"
            >
              <VemtapText variant="labelMd" tone="secondary" className="text-center">
                {copy.ownBusiness}{' '}
                <VemtapText variant="labelMd" className="font-sans-semibold text-primary">
                  {copy.ownBusinessLink}
                </VemtapText>
                <Icon name="arrowForward" size={16} color={colors.primary} />
              </VemtapText>
            </Pressable>
          </View>
        </PageScroll>
      </View>
    </SafeAreaView>
  );
}

function TopicCard({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: IconName;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      className="items-start rounded-xl bg-surface-container-lowest p-4 shadow-sm active:scale-[0.98]"
    >
      <View
        className={cn(
          'mb-3 h-10 w-10 items-center justify-center rounded-lg',
          icon === 'verified' ? 'bg-badge-discount-bg' : 'bg-surface-tint-blue',
        )}
      >
        <Icon
          name={icon}
          size={22}
          color={icon === 'verified' ? colors.badgeDiscountText : colors.primary}
        />
      </View>
      <VemtapText variant="labelMd" className="font-sans-semibold">
        {title}
      </VemtapText>
      <VemtapText variant="caption" tone="secondary" className="mt-0.5">
        {subtitle}
      </VemtapText>
    </Pressable>
  );
}

function BannerImage() {
  return (
    <Image
      source={{ uri: BANNER_IMAGE_URI }}
      accessibilityLabel={copy.bannerImageAlt}
      className="h-full w-full"
      resizeMode="cover"
    />
  );
}

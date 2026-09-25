import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ConversationListCard } from '@features/merchantChat/components/ConversationListCard';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { navbarBottomShadow } from '@theme/shadows';

const images = [
  {
    uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCKMu2XcE9A0LLhyt8ySWsksbAMKerlqzWaYWhXC0PHbUiONPBhhTw_2x5LsDePbtFf4vAjHR7danXODLrET234adXqp2tTEVecjhvg__txa-y9ydNYJ20J4SI0CKolcnnUZJePISOR2kMwwqwQVIY-E_rqDCXI3t7J9bVWXHjNZlySW52bHRM3X1oIz8Mq42iLU7CUCb1NFkx53H1PNNnfuyDKDk_hSzR3p8frXAuZ3Y-9jLM5rN6yEQ',
  },
  {
    uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDOnZ1dbyBQVkPaQ5N5oZ1MSWxtMvWA3doQTxgN1Qh89xtsPur6tzfuZ_gUpJe_M6OKnF8FEP57UELuaBoF1ERRvxBLNlIJcCt2FFfIINMxXAfqzgvM-MmoekKQQRi_I4JerUMxEl-KYVucalj24ogEC5J_EGx3LPbVA-6btVUCn7rSEVzv7M5asqjV2y3sUgcCG4EcTO-PvRjJgQyWKTQdSxg8FKTj8Nuo2kH49ScT7DMdRoaU0VkceA',
  },
  {
    uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAsMgj3zSGfwuWFX81JoPQjExRoiMILTIZpBD6yadVrhZeI3ZBdb31Oa7_AdyAVBpIAj_5PWZkZzY0HP9PFM2HZOs49ypTETVHgc6M9ooJxyPhd2h2tewDxvdiH9nilLMEUpTij2wgyde6IDs3lxt3SnVnuW2RRXe-FOHC5HD-mPy6ftpZ1QkAxwi3_1K-K_UvF-a-UrbeDuQMm8D6Pzy2HhZM5eCq4UVeCh19nIkDLsVmXufpsGFSohg',
  },
  {
    uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAh0T_yaqdDTOZYfaGAAu-mm2nn4GPMlgyUdhvi_ULWcH-b-JY1IM4fo-2fH8r50gjhN_rIYLwMOIXGsk2zlLyvdUiiPq-AYQxkVaSQ4yi1VJ6cR_fLcnH3G5M-_9AODJlA6d-B6I0CEBQ70iyO9S0T_KlU1q9Y2WZ0LdTn1FtzP0e2cBFXhdw',
  },
  {
    uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCbwYURUo64814no3C6OA_76MzoX_3LMs97MQvhSTmISLlbwKts2otlTlZPCMjY7mzzchHqAVE8E-P5plmLIn41tuedMFWHOhl4_LXPGOcOAeH8ND3lPpdbN-A4NpHJpYC7PaELbvg_PtD9BY9o24dHj-HmIKMVbqhxmQHszWQv6fB_sVyzMY_FbC-6dG-DZPDFrYvVDsbCbe6_jmAelijahtrxSl6eKGe2U1FItc5K0YRSdRDbICuRfw',
  },
];

export interface MessagesScreenProps {
  onOpenConversation?: (merchant: string) => void;
  onCompose?: () => void;
  onSearch?: () => void;
  onFilter?: () => void;
}

export function MessagesScreen({
  onOpenConversation,
  onCompose,
  onSearch,
  onFilter,
}: MessagesScreenProps) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState(0);
  const entries = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return strings.messagesHub.entries.filter(entry => {
      const matchesSearch =
        !normalized ||
        `${entry.name} ${entry.message}`.toLowerCase().includes(normalized);
      const matchesFilter =
        activeFilter === 0 || (activeFilter === 1 && entry.unread > 0);
      return matchesSearch && matchesFilter;
    });
  }, [activeFilter, query]);

  return (
    <View className="flex-1 bg-background">
      <View
        className="flex-row items-center justify-between bg-surface px-6 pb-3 pt-2"
        style={[navbarBottomShadow, { paddingTop: Math.max(insets.top, 8) }]}
      >
        <View className="min-w-0 flex-1">
          <VemtapText
            accessibilityRole="header"
            variant="headingSm"
            className="text-heading-sm"
            numberOfLines={1}
          >
            {strings.messagesHub.title}
          </VemtapText>
        </View>
        <View className="shrink-0 flex-row items-center">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={strings.messagesHub.search}
            onPress={onSearch}
            className="h-11 w-11 items-center justify-center rounded-full active:bg-surface-container-low"
          >
            <Icon name="search" size={23} color={colors.textSecondary} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={strings.messagesHub.filter}
            onPress={onFilter}
            className="h-11 w-11 items-center justify-center rounded-full active:bg-surface-container-low"
          >
            <Icon name="tune" size={21} color={colors.textSecondary} />
          </Pressable>
          <View className="ml-1 h-8 w-8 items-center justify-center rounded-full bg-primary">
            <Icon name="person" size={17} color={colors.surface} />
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-3 px-6 pb-6 pt-4"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center justify-between">
          <View className="min-w-0 flex-1 flex-row items-center gap-2">
            <VemtapText variant="headingSm" className="text-heading-sm" numberOfLines={1}>
              {strings.messagesHub.title}
            </VemtapText>
            <VemtapText
              variant="labelSm"
              tone="brand"
              className="rounded-full bg-surface-tint px-2 py-0.5"
            >
              {strings.messagesHub.unread}
            </VemtapText>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={strings.messagesHub.compose}
            onPress={onCompose}
            className="h-10 w-10 items-center justify-center rounded-full bg-surface-container-high active:scale-95"
          >
            <Icon name="edit" size={20} color={colors.surfaceDark} />
          </Pressable>
        </View>
        <View className="h-11 flex-row items-center rounded-xl bg-surface-container-low px-4 shadow-sm">
          <Icon name="search" size={20} color={colors.textTertiary} />
          <TextInput
            accessibilityLabel={strings.messagesHub.searchPlaceholder}
            value={query}
            onChangeText={setQuery}
            placeholder={strings.messagesHub.searchPlaceholder}
            placeholderTextColor={colors.textTertiary}
            className="min-w-0 flex-1 px-3 font-sans text-body-md text-text"
          />
        </View>
        <View className="-mx-1 flex-row flex-wrap gap-2">
          {strings.messagesHub.filters.map((filter, index) => (
            <Pressable
              key={filter}
              accessibilityRole="button"
              accessibilityState={{ selected: activeFilter === index }}
              onPress={() => setActiveFilter(index)}
              className={`min-h-9 shrink-0 flex-row items-center rounded-full px-4 ${activeFilter === index ? 'bg-primary shadow-sm' : 'bg-surface-container-low'}`}
            >
              <VemtapText
                variant="labelMd"
                tone={activeFilter === index ? 'inverse' : 'secondary'}
                className={
                  activeFilter === index ? 'font-sans-semibold' : 'font-sans-medium'
                }
              >
                {filter}
              </VemtapText>
            </Pressable>
          ))}
        </View>
        {entries.map((entry, index) => (
          <ConversationListCard
            key={entry.name}
            image={images[strings.messagesHub.entries.indexOf(entry)] ?? images[index]}
            name={entry.name}
            time={entry.time}
            message={entry.message}
            context={entry.context}
            contextIcon={entry.contextIcon}
            unread={entry.unread}
            online={entry.online}
            verified={entry.verified}
            sender={entry.sender}
            onPress={() => onOpenConversation?.(entry.name)}
          />
        ))}
        <View className="mt-2 flex-row items-center gap-2 rounded-xl bg-surface-container-low px-3 py-3">
          <Icon name="lock" size={17} color={colors.primary} />
          <VemtapText variant="caption" tone="secondary" className="flex-1 text-center">
            {strings.messagesHub.trust}
          </VemtapText>
        </View>
      </ScrollView>
    </View>
  );
}

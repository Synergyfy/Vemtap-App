import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  TextInput,
  View,
  type ImageSourcePropType,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ConversationListCard } from '@features/merchantChat/components/ConversationListCard';
import { useCustomerThreads } from '@features/merchantChat/hooks/useCustomerMessaging';
import type { ConversationThread } from '@api/messagingApi';
import { LoadingState } from '@components/shared/LoadingState';
import { EmptyState } from '@components/shared/EmptyState';
import { Icon, type IconName } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { navbarBottomShadow } from '@theme/shadows';
import { formatWhen } from '@utils/formatters';

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
    uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAh0T_yaqdDTOZYfaGAAu-mm2nn4GPMlgyUdhvi_ULWcH-b-JY1IM4fo-2fH8r50gjhN_rIYLwMOIXGsk2zlLyvdUiiPq-AYQxkVaSQ4yiS1VJ6fCb-BX-yi2k_54WmDETPGfPsuJW3yx2AN99j1-jMKdZ9_X0y4m9jdUzmOop0AcB5SUqkr3mGYVCdrvfZjntHS99w2bM0xoAH4ajKdlUrVIofhliTqMJwuUEbRs7Qdty57dnwKigHgA',
  },
  {
    uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCbwYURUo64814no3C6OA_76MzoX_3LMs97MQvhSTmISLlbwKts2otlTlZPCMjY7mzzchHqAVE8E-P5plmLIn41tuedMFWHOhl4_LXPGOcOAeH8ND3lPpdbN-A4NpHJpYC7PaELbvg_PtD9BY9o24dHj-HmIKMVbqhxmQHszWQv6fB_sVyzMY_FbC-6dG-DZPDFrYvVDsbCbe6_jmAelijahtrxSl6eKGe2U1FItc5K0YRSdRDbICuRfw',
  },
];

export interface MessagesScreenProps {
  onBack?: () => void;
  onOpenConversation?: (merchant: string) => void;
  onCompose?: () => void;
  onSearch?: () => void;
  onFilter?: () => void;
}

interface ThreadEntry {
  key: string;
  image: ImageSourcePropType;
  name: string;
  time: string;
  message: string;
  context: string;
  contextIcon: IconName;
  unread: number;
  categories: string[];
}

// Design (`messages_2`) filters conversations by per-row `data-category`
// values (`unread`, `deals`, `bookings`). The API exposes no category field
// on `ConversationThread`, so topic categories are derived from the thread's
// latest message snippet; `unread` comes from `customerUnreadCount`.
const DEAL_CATEGORY_RE =
  /\b(deal|deals|offer|offers|voucher|vouchers|discount|discounts|promo|coupon|coupons|claim|claims|redeem|savings|% off)\b/i;
const BOOKING_CATEGORY_RE =
  /\b(book|books|booked|booking|bookings|reserve|reserved|reservation|reservations|table|appointment|appointments|schedule|scheduled|slot|slots|order|orders|ordered)\b/i;

// Design `data-filter` values for the four chips, in render order.
const FILTER_KEYS = ['all', 'unread', 'deals', 'bookings'];

/**
 * One API thread → one conversation card. Everything comes from
 * `GET /customer/messaging/threads`; nothing is invented when the payload is
 * missing a field (empty context hides the chip, blank time hides nothing).
 */
function toEntry(thread: ConversationThread, index: number): ThreadEntry {
  const name =
    thread.business?.name ?? thread.branch?.name ?? strings.messagesHub.entryNameFallback;
  const logo = thread.business?.logoUrl ?? thread.branch?.logoUrl ?? null;
  const message = thread.lastMessageContent ?? '';
  const unread = thread.customerUnreadCount ?? 0;
  return {
    key: thread.id,
    image: logo ? { uri: logo } : images[index % images.length],
    name,
    time: thread.lastActivityAt ? formatWhen(thread.lastActivityAt) : '',
    message,
    context: thread.branch?.address ?? '',
    contextIcon: 'locationOn',
    unread,
    categories: [
      ...(unread > 0 ? ['unread'] : []),
      ...(DEAL_CATEGORY_RE.test(message) ? ['deals'] : []),
      ...(BOOKING_CATEGORY_RE.test(message) ? ['bookings'] : []),
    ],
  };
}

export function MessagesScreen({
  onBack,
  onOpenConversation,
  onCompose,
  onSearch,
  onFilter,
}: MessagesScreenProps) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState(0);
  const threadsQuery = useCustomerThreads();
  const threads = threadsQuery.data;

  const unreadConversations = useMemo(
    () => (threads ?? []).filter(thread => (thread.customerUnreadCount ?? 0) > 0).length,
    [threads],
  );

  const entries = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return (threads ?? [])
      .map((thread, index) => toEntry(thread, index))
      .filter(entry => {
        const matchesSearch =
          !normalized ||
          `${entry.name} ${entry.message}`.toLowerCase().includes(normalized);
        const filterKey = FILTER_KEYS[activeFilter];
        const matchesFilter =
          activeFilter === 0 ||
          (filterKey !== undefined && entry.categories.includes(filterKey));
        return matchesSearch && matchesFilter;
      });
  }, [activeFilter, query, threads]);

  const hasConstraint = activeFilter !== 0 || query.trim().length > 0;
  const emptyCopy = hasConstraint
    ? strings.messagesHub.emptyFiltered
    : strings.messagesHub.empty;

  return (
    <View className="flex-1 bg-background">
      <View
        className="flex-row items-center justify-between bg-surface px-6 pb-3 pt-2"
        style={[navbarBottomShadow, { paddingTop: Math.max(insets.top, 8) }]}
      >
        <View className="min-w-0 flex-1 flex-row items-center gap-1">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={strings.common.goBack}
            hitSlop={8}
            onPress={onBack}
            className="-ml-2 h-11 w-11 shrink-0 items-center justify-center rounded-full active:bg-surface-container-low"
          >
            <Icon name="back" size={24} color={colors.surfaceDark} />
          </Pressable>
          <VemtapText
            accessibilityRole="header"
            variant="labelMd"
            className="min-w-0 flex-1 font-sans-semibold"
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
            <VemtapText
              variant="bodyMd"
              className="flex-1 font-sans-semibold"
              numberOfLines={1}
            >
              {strings.messagesHub.title}
            </VemtapText>
            {unreadConversations > 0 ? (
              <VemtapText
                variant="labelSm"
                tone="brand"
                className="rounded-full bg-surface-tint px-2 py-0.5"
              >
                {strings.messagesHub.unreadFor(unreadConversations)}
              </VemtapText>
            ) : null}
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
          {strings.messagesHub.filters.map((filter, index) => {
            const selected = activeFilter === index;
            return (
              <Pressable
                key={FILTER_KEYS[index]}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => setActiveFilter(index)}
                className={`min-h-9 shrink-0 flex-row items-center rounded-full px-4 ${selected ? 'bg-primary shadow-sm' : 'bg-surface-container-low'}`}
              >
                <View className="flex-row items-center gap-1">
                  <VemtapText
                    variant="labelMd"
                    tone={selected ? 'inverse' : 'secondary'}
                    className={selected ? 'font-sans-semibold' : 'font-sans-medium'}
                  >
                    {filter}
                  </VemtapText>
                  {index === 1 && unreadConversations > 0 ? (
                    <View
                      className={`h-5 min-w-5 items-center justify-center rounded-full px-1 ${selected ? 'bg-primary-foreground' : 'bg-primary'}`}
                    >
                      <VemtapText
                        variant="caption"
                        tone={selected ? 'brand' : 'inverse'}
                        className="font-sans-bold"
                      >
                        {unreadConversations}
                      </VemtapText>
                    </View>
                  ) : null}
                </View>
              </Pressable>
            );
          })}
        </View>
        {threadsQuery.isLoading ? (
          <LoadingState label={strings.common.loading} />
        ) : threadsQuery.isError ? (
          <EmptyState
            variant="contained"
            icon="cloudOff"
            title={strings.common.error}
            actionLabel={strings.common.retry}
            onAction={() => threadsQuery.refetch()}
          />
        ) : entries.length === 0 ? (
          <EmptyState
            variant="contained"
            icon="message"
            title={emptyCopy.title}
            description={emptyCopy.body}
          />
        ) : (
          entries.map(entry => (
            <ConversationListCard
              key={entry.key}
              image={entry.image}
              name={entry.name}
              time={entry.time}
              message={entry.message}
              context={entry.context}
              contextIcon={entry.contextIcon}
              unread={entry.unread}
              onPress={() => onOpenConversation?.(entry.name)}
            />
          ))
        )}
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

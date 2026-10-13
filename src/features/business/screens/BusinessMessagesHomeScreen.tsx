import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { Button } from '@components/ui/Button';
import { Icon, type IconName } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { EmptyState } from '@components/shared/EmptyState';
import { LoadingState } from '@components/shared/LoadingState';
import { strings } from '@constants/strings';
import { TypeDensityProvider } from '@theme/TypeDensityProvider';
import { colors } from '@theme/colors';
import { formatWhen } from '@utils/formatters';
import {
  BusinessScreenLayout,
  BusinessSelectionChip,
  BusinessStatusPill,
} from '@features/business/components/BusinessPrimitives';
import { BusinessInitialsAvatar } from '@features/business/components/BusinessPosPrimitives';
import { HubSearchField } from '@features/accountHub/components/HubPrimitives';
import { ConversationListCard } from '@features/merchantChat/components/ConversationListCard';
import type { ConversationThread } from '@api/messagingApi';

cssInterop(ScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});

const copy = strings.businessMessages;

type ContextTone = 'brand' | 'discount' | 'neutral';

export type BusinessMessageCategory = 'unread' | 'orders' | 'deals' | 'bookings';

/** One conversation row, fully derived from a `ConversationThread`. */
export interface BusinessMessageThreadView {
  id: string;
  name: string;
  initials: string;
  avatarUri?: string;
  preview: string;
  time: string;
  unread: number;
  context: string;
  contextIcon: IconName;
  contextTone: ContextTone;
  categories: BusinessMessageCategory[];
}

const SUBJECT_META: Record<string, { label: string; icon: IconName; tone: ContextTone }> =
  {
    GENERAL: { label: copy.context.general, icon: 'help', tone: 'neutral' },
    DEAL: { label: copy.context.deal, icon: 'localOffer', tone: 'discount' },
    CLAIM: { label: copy.context.claim, icon: 'localOffer', tone: 'discount' },
    ORDER: { label: copy.context.order, icon: 'receipt', tone: 'brand' },
    BOOKING: { label: copy.context.booking, icon: 'eventAvailable', tone: 'neutral' },
  };

export function initialsForName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1] ?? '') : '';
  const letters = `${first.charAt(0)}${last.charAt(0)}`;
  return (letters || '?').toUpperCase();
}

/** API thread → row view-model; nothing is invented when a field is missing. */
export function toBusinessMessageThreadView(
  thread: ConversationThread,
): BusinessMessageThreadView {
  const name =
    thread.customer?.name ||
    [thread.customer?.firstName, thread.customer?.lastName]
      .filter(Boolean)
      .join(' ')
      .trim() ||
    copy.customerFallback;
  const subject = (thread.subjectType ?? 'GENERAL').toUpperCase();
  const meta = SUBJECT_META[subject] ?? SUBJECT_META.GENERAL!;
  const unread = thread.branchUnreadCount ?? 0;
  const categories: BusinessMessageCategory[] = [];
  if (unread > 0) categories.push('unread');
  if (subject === 'ORDER') categories.push('orders');
  if (subject === 'DEAL' || subject === 'CLAIM') categories.push('deals');
  if (subject === 'BOOKING') categories.push('bookings');

  return {
    id: thread.id,
    name,
    initials: initialsForName(name),
    avatarUri: thread.customer?.avatar ?? undefined,
    preview: thread.lastMessageContent ?? '',
    time: thread.lastActivityAt ? formatWhen(thread.lastActivityAt) : '',
    unread,
    context: meta.label,
    contextIcon: meta.icon,
    contextTone: meta.tone,
    categories,
  };
}

const FILTER_KEYS: readonly ('all' | BusinessMessageCategory)[] = [
  'all',
  'unread',
  'orders',
  'deals',
  'bookings',
];

export interface BusinessMessagesHomeScreenProps {
  threads?: BusinessMessageThreadView[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  branchName?: string;
  onOpenBranchSwitcher?: () => void;
  onOpenThread?: (id: string) => void;
  onNewMessage?: () => void;
  onOpenSearch?: () => void;
  onOpenFilters?: () => void;
  onOpenMoreOptions?: () => void;
}

export function BusinessMessagesHomeScreen({
  threads,
  isLoading = false,
  isError = false,
  onRetry,
  branchName,
  onOpenBranchSwitcher,
  onOpenThread,
  onNewMessage,
  onOpenSearch,
  onOpenFilters,
  onOpenMoreOptions,
}: BusinessMessagesHomeScreenProps) {
  const [filter, setFilter] = useState(0);
  const [query, setQuery] = useState('');

  const filterCounts = useMemo(() => {
    const list = threads ?? [];
    return [
      list.length,
      list.filter(thread => thread.categories.includes('unread')).length,
      list.filter(thread => thread.categories.includes('orders')).length,
      list.filter(thread => thread.categories.includes('deals')).length,
      list.filter(thread => thread.categories.includes('bookings')).length,
    ];
  }, [threads]);

  const visibleThreads = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const activeKey = FILTER_KEYS[filter];
    return (threads ?? []).filter(thread => {
      const matchesSearch =
        !normalized ||
        `${thread.name} ${thread.preview}`.toLowerCase().includes(normalized);
      const matchesFilter =
        activeKey === 'all' ||
        activeKey === undefined ||
        thread.categories.includes(activeKey);
      return matchesSearch && matchesFilter;
    });
  }, [filter, query, threads]);

  const hasConstraint = filter !== 0 || query.trim().length > 0;
  const emptyTitle = hasConstraint ? copy.emptyFilteredTitle : copy.emptyTitle;
  const emptyBody = hasConstraint ? copy.emptyFilteredBody : copy.emptyBody;

  // Dense hub: many rows read at a glance, so the subtree (navbar included)
  // uses the compact type density rather than per-row size overrides.
  return (
    <TypeDensityProvider density="compact">
      <BusinessScreenLayout
        header={{
          title: copy.title,
          centerTitle: false,
          showAvatar: true,
          titleAccessory: (
            <BusinessStatusPill label={copy.online} tone="success" icon="checkCircle" />
          ),
          actions: [
            { icon: 'search', label: copy.searchLabel, onPress: onOpenSearch },
            { icon: 'more', label: copy.moreLabel, onPress: onOpenMoreOptions },
          ],
        }}
        contentContainerClassName="pb-24"
        footer={
          <View className="flex-row justify-end px-6 pb-3 pt-2">
            <Button
              label={copy.newMessage}
              labelVariant="labelMd"
              fullWidth={false}
              className="rounded-full px-4"
              leftIcon={<Icon name="message" size={20} color={colors.surface} />}
              onPress={onNewMessage}
            />
          </View>
        }
      >
        <HubSearchField
          value={query}
          onChangeText={setQuery}
          placeholder={copy.searchPlaceholder}
          filterLabel={copy.filterLabel}
          onFilter={onOpenFilters}
        />

        <View className="-mx-6">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="gap-2 px-6 py-1"
          >
            {copy.filters.map((chip, index) => (
              <BusinessSelectionChip
                key={chip.label}
                label={`${chip.label} (${filterCounts[index] ?? 0})`}
                selected={index === filter}
                onPress={() => setFilter(index)}
                tone="brand"
                leading={
                  <>
                    {chip.dot ? (
                      <View className="h-2 w-2 rounded-full bg-primary-container" />
                    ) : null}
                    {chip.icon ? (
                      <Icon
                        name={chip.icon}
                        size={16}
                        color={index === filter ? colors.primary : colors.textSecondary}
                      />
                    ) : null}
                  </>
                }
              />
            ))}
          </ScrollView>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.hubBranch}
          onPress={onOpenBranchSwitcher}
          className="flex-row items-center justify-between gap-2 rounded-lg bg-badge-discount-bg px-3 py-2 shadow-sm"
        >
          <View className="min-w-0 flex-1 flex-row items-center gap-2">
            <View className="h-2 w-2 shrink-0 rounded-full bg-badge-discount-text" />
            <VemtapText
              variant="caption"
              className="font-sans-semibold text-badge-discount-text"
            >
              {copy.connected}
            </VemtapText>
            <VemtapText
              variant="caption"
              className="min-w-0 flex-1 text-badge-discount-text"
              numberOfLines={1}
            >
              {`• ${copy.connectedMeta}`}
            </VemtapText>
          </View>
          <View className="shrink-0 flex-row items-center gap-1">
            <VemtapText
              variant="caption"
              className="font-sans-semibold text-badge-discount-text"
            >
              {branchName ?? copy.hubBranch}
            </VemtapText>
            <Icon name="expandMore" size={14} color={colors.badgeDiscountText} />
          </View>
        </Pressable>

        {isLoading ? (
          <LoadingState label={strings.common.loading} />
        ) : isError ? (
          <EmptyState
            variant="contained"
            icon="cloudOff"
            title={strings.common.error}
            actionLabel={strings.common.retry}
            onAction={onRetry}
          />
        ) : visibleThreads.length === 0 ? (
          <EmptyState
            variant="contained"
            icon="message"
            title={emptyTitle}
            description={emptyBody}
          />
        ) : (
          <View className="gap-1">
            {visibleThreads.map(thread => (
              <ConversationListCard
                key={thread.id}
                image={thread.avatarUri ? { uri: thread.avatarUri } : undefined}
                avatarFallback={
                  <BusinessInitialsAvatar
                    initials={thread.initials}
                    size="md"
                    className="h-[52px] w-[52px]"
                  />
                }
                name={thread.name}
                time={thread.time}
                message={thread.preview}
                context={thread.context}
                contextIcon={thread.contextIcon}
                contextTone={thread.contextTone}
                unread={thread.unread}
                onPress={() => onOpenThread?.(thread.id)}
              />
            ))}
          </View>
        )}
      </BusinessScreenLayout>
    </TypeDensityProvider>
  );
}

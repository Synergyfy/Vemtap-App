import React, { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ErrorBoundary } from '@components/shared/ErrorBoundary';
import { RegistrationHeader } from '@components/auth/RegistrationHeader';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import {
  notificationCategory,
  notificationStat,
  notificationText,
  type NotificationFilterKey,
} from '@api/notificationsApi';
import {
  NotificationRow,
  type NotificationCategory,
} from '@features/accountHub/components/NotificationRow';
import { StatusPillTabs } from '@features/accountHub/components/HubPrimitives';
import { LoadingState } from '@components/shared/LoadingState';
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from '@features/accountHub/hooks/useNotifications';
import { strings } from '@constants/strings';
import { formatWhen } from '@utils/formatters';
import { colors } from '@theme/colors';

const copy = strings.notificationsCenter;

/** Chip order; `all` leads so the unfiltered list is one press away. */
const FILTERS: NotificationFilterKey[] = [
  'all',
  'deals',
  'bookings',
  'rewards',
  'system',
];

/** Category → the art the row has always used for it. */
const CATEGORY_ART: Record<
  NotificationCategory,
  {
    icon: 'hourglass' | 'spa' | 'trophy' | 'announcement';
    iconBackground: 'amber' | 'blue' | 'green' | 'system';
  }
> = {
  deals: { icon: 'hourglass', iconBackground: 'amber' },
  bookings: { icon: 'spa', iconBackground: 'blue' },
  rewards: { icon: 'trophy', iconBackground: 'green' },
  system: { icon: 'announcement', iconBackground: 'system' },
};

interface NotificationEntry {
  id: string;
  category: NotificationCategory;
  icon: 'hourglass' | 'spa' | 'trophy' | 'announcement';
  iconBackground: 'amber' | 'blue' | 'green' | 'system';
  title: string;
  time: string;
  body: string;
  unread: boolean;
  unreadLabel?: string;
  unreadMeta?: string;
  unreadImage?: string;
  action?: string;
  actionTone?: 'primary' | 'secondary' | 'success';
  statBlock?: React.ReactNode;
  footnote?: React.ReactNode;
  cta?: React.ReactNode;
  /** Midnight of the day the row landed, for the today/earlier split. */
  dayStart: number | null;
}

/** A string out of the payload, or undefined when it is absent or blank. */
const plainText = (value: unknown): string | undefined =>
  typeof value === 'string' && value.trim() ? value : undefined;

const startOfDay = (value: string | null | undefined): number | null => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
};

/**
 * `action` text, read off the row rather than asserted per id.
 *
 * The button is the row's own call to action; with no CTA there is nothing to
 * press, so the row renders without it instead of inventing one.
 */
function toEntry(item: {
  id: string;
  title: string;
  message: string;
  type?: string | null;
  isRead?: boolean | null;
  createdAt?: string | null;
  metadata?: Record<string, unknown> | null | undefined;
}): NotificationEntry {
  const category = notificationCategory(item.type) as NotificationCategory;
  const art = CATEGORY_ART[category];
  const ctaValue = notificationText(item.metadata, 'cta');
  const footnoteValue = notificationText(item.metadata, 'footnote');
  const stat = notificationStat(item.metadata);

  // Blocks are omitted rather than rendered empty — a stat pill with nothing in
  // it is the design asserting a figure nobody sent.
  let statBlock = null;
  if (stat?.value) {
    statBlock = (
      <View className="flex-row flex-wrap items-baseline gap-1.5 rounded-field bg-surface-subtle p-2.5">
        {stat.label ? (
          <VemtapText variant="caption" tone="tertiary" numberOfLines={1}>
            {stat.label}
          </VemtapText>
        ) : null}
        <VemtapText variant="headingSm" className="font-sans-bold" numberOfLines={1}>
          {stat.value}
        </VemtapText>
        {stat.trend ? (
          <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
            {stat.trend}
          </VemtapText>
        ) : null}
      </View>
    );
  }

  let footnote = null;
  if (footnoteValue) {
    footnote = (
      <View className="flex-row items-center gap-1.5">
        <Icon name="info" size={12} color={colors.secondary} />
        <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
          {footnoteValue}
        </VemtapText>
      </View>
    );
  }

  let cta = null;
  if (ctaValue) {
    cta = (
      <View className="flex-row items-center justify-end gap-1">
        <VemtapText variant="labelSm" className="font-sans-semibold">
          {ctaValue}
        </VemtapText>
        <Icon name="forward" size={16} color={colors.primary} />
      </View>
    );
  }

  return {
    id: item.id,
    category,
    ...art,
    title: item.title,
    time: item.createdAt ? formatWhen(item.createdAt) || copy.recent : copy.recent,
    body: item.message,
    unread: !item.isRead,
    unreadLabel: plainText(item.metadata?.merchantName),
    unreadMeta: plainText(item.metadata?.merchantMeta),
    action: ctaValue,
    ...(statBlock && { statBlock }),
    ...(footnote && { footnote }),
    ...(cta && { cta }),
    dayStart: startOfDay(item.createdAt),
  };
}

export interface NotificationsCenterScreenProps {
  onBack?: () => void;
  onMore?: () => void;
  onManagePreferences?: () => void;
  onOpenNotification?: (id: string) => void;
  onNotificationAction?: (id: string) => void;
}

export function NotificationsCenterScreen({
  onBack,
  onMore,
  onManagePreferences,
  onOpenNotification,
  onNotificationAction,
}: NotificationsCenterScreenProps) {
  const notifications = useNotifications();
  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();

  const [filter, setFilter] = useState(0);

  const entries = useMemo<NotificationEntry[]>(
    () => (notifications.data ?? []).map(toEntry),
    [notifications.data],
  );

  const unread = entries.filter(item => item.unread).length;

  /**
   * Chip counts come off the rows in hand rather than a stored string, so a tab
   * can never claim a number the list does not contain. A zero is left off
   * entirely: an empty tab reads better as a bare label.
   */
  const filterLabels = useMemo(
    () =>
      FILTERS.map(key => {
        const label = key === 'all' ? copy.filters[0] : copy.filterLabels[key];
        if (key === 'all') {
          return entries.length ? `${label} ${entries.length}` : label;
        }
        const count = entries.filter(item => item.category === key).length;
        return count ? `${label} ${count}` : label;
      }),
    [entries],
  );

  // A stale index (the chip row shrank after a fetch) falls back to "all"
  // instead of blanking the list on an undefined category.
  const activeCategory = FILTERS[filter] ?? 'all';
  const visible = useMemo(
    () =>
      activeCategory === 'all'
        ? entries
        : entries.filter(item => item.category === activeCategory),
    [entries, activeCategory],
  );

  /**
   * Split on the day the row landed, not on whether it happens to be unread.
   *
   * Unread is not a date: a two-week-old unread row is "Earlier This Week" no
   * matter how loudly it is badged.
   */
  const todayStart = useMemo(() => startOfDay(new Date().toISOString()), []);
  const today = visible.filter(
    item => item.dayStart != null && item.dayStart === todayStart,
  );
  const earlier = visible.filter(item => !today.includes(item));

  const markAllRead = () => {
    markAllReadMutation.mutate();
  };

  const handleOpen = (id: string) => {
    markReadMutation.mutate(id);
    onOpenNotification?.(id);
  };

  return (
    // Screen-scoped recovery: a render crash inside this screen shows the
    // shared fallback in place instead of replacing the whole app shell.
    <ErrorBoundary>
      <SafeAreaView edges={['top']} className="flex-1 bg-background">
        <RegistrationHeader
          title={copy.title}
          onBack={() => onBack?.()}
          showMoreAction
          onMore={onMore}
        />
        <ScrollView
          className="flex-1"
          contentContainerClassName="gap-5 px-4 pb-8 pt-3"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-row items-center justify-between gap-2">
            <View className="min-w-0 flex-1 flex-row items-center gap-2">
              <VemtapText
                variant="headingMd"
                className="text-heading-md"
                numberOfLines={1}
              >
                {copy.inbox}
              </VemtapText>
              <View
                className={`shrink-0 rounded-full px-2 py-0.5 shadow-sm ${unread ? 'bg-primary' : 'bg-surface-container-highest'}`}
              >
                <VemtapText
                  variant="caption"
                  className={unread ? 'text-primary-foreground' : 'text-text-secondary'}
                >
                  {unread ? copy.unreadFor(unread) : copy.zeroNew}
                </VemtapText>
              </View>
            </View>
            <Button
              label={unread ? copy.allRead : copy.caughtUp}
              labelVariant="labelSm"
              variant="ghost"
              size="sm"
              fullWidth={false}
              disabled={!unread}
              leftIcon={
                <Icon
                  name={unread ? 'doneAll' : 'check'}
                  size={17}
                  color={unread ? colors.primary : colors.textTertiary}
                />
              }
              onPress={markAllRead}
            />
          </View>
          <View className="-mx-4">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="gap-2 px-4"
            >
              <StatusPillTabs
                labels={filterLabels}
                selected={filter}
                onSelect={setFilter}
              />
            </ScrollView>
          </View>
          {notifications.isLoading ? (
            <LoadingState label={strings.common.loading} />
          ) : notifications.isError ? (
            <View className="items-center px-4 py-12">
              <View className="h-16 w-16 items-center justify-center rounded-full bg-surface-container-high">
                <Icon name="cloudOff" size={32} color={colors.secondary} />
              </View>
              <VemtapText variant="headingSm" className="mt-3 text-center">
                {strings.common.error}
              </VemtapText>
              <View className="mt-4">
                <Button
                  label={strings.common.retry}
                  variant="secondary"
                  size="sm"
                  onPress={() => notifications.refetch()}
                />
              </View>
            </View>
          ) : visible.length === 0 ? (
            <View className="items-center px-4 py-12">
              <View className="h-16 w-16 items-center justify-center rounded-full bg-surface-container-high">
                <Icon name="doNotDisturb" size={32} color={colors.secondary} />
              </View>
              <VemtapText variant="headingSm" className="mt-3 text-center">
                {copy.caughtUpTitle}
              </VemtapText>
              <VemtapText tone="secondary" className="mt-1 text-center">
                {copy.caughtUpBody}
              </VemtapText>
            </View>
          ) : (
            <>
              {today.length ? (
                <NotificationSection
                  title={copy.today}
                  count={copy.updatesFor(today.length)}
                  entries={today}
                  onOpen={handleOpen}
                  onAction={onNotificationAction}
                />
              ) : null}
              {earlier.length ? (
                <NotificationSection
                  title={copy.earlier}
                  count={copy.updatesFor(earlier.length)}
                  entries={earlier}
                  onOpen={handleOpen}
                  onAction={onNotificationAction}
                />
              ) : null}
            </>
          )}
          <View className="gap-3 pt-3">
            <Button
              label={copy.preferences}
              labelVariant="labelMd"
              variant="secondary"
              onPress={onManagePreferences}
              leftIcon={<Icon name="tune" size={19} color={colors.secondary} />}
              rightIcon={<Icon name="forward" size={18} color={colors.textTertiary} />}
            />
            <VemtapText variant="caption" tone="tertiary" className="text-center">
              {copy.tailored}
            </VemtapText>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ErrorBoundary>
  );
}

function NotificationSection({
  title,
  count,
  entries,
  onOpen,
  onAction,
}: {
  title: string;
  count: string;
  entries: NotificationEntry[];
  onOpen?: (id: string) => void;
  onAction?: (id: string) => void;
}) {
  return (
    <View className="gap-2.5">
      <View className="flex-row items-center justify-between px-1">
        <VemtapText
          variant="labelSm"
          tone="tertiary"
          className="uppercase tracking-wider"
        >
          {title}
        </VemtapText>
        <VemtapText variant="caption" tone="tertiary">
          {count}
        </VemtapText>
      </View>
      {entries.map(item => (
        <NotificationRow
          key={item.id}
          icon={item.icon}
          iconBackground={item.iconBackground}
          title={item.title}
          time={item.time}
          body={item.body}
          unread={item.unread}
          merchantName={item.unreadLabel}
          merchantMeta={item.unreadMeta}
          action={item.action}
          actionTone={item.actionTone}
          onPress={() => onOpen?.(item.id)}
          onAction={() => onAction?.(item.id)}
        >
          {item.statBlock ?? item.footnote ?? item.cta ?? null}
        </NotificationRow>
      ))}
    </View>
  );
}

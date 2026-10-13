import React, { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Icon, type IconName } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { EmptyState } from '@components/shared/EmptyState';
import { colors } from '@theme/colors';
import { BusinessScreenLayout } from '@features/business/components/BusinessPrimitives';
import {
  BusinessChipScroller,
  BusinessCountChip,
  BusinessIconWell,
} from '@features/business/components/BusinessOpsPrimitives';
import {
  notificationCategoryIcon,
  notificationToneIcon,
  notificationToneTile,
  type NotificationCategoryId,
} from '@features/business/data/businessTrustSettingsData';
import {
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useBusinessNotifications,
} from '@features/accountHub/hooks/useNotifications';
import { notificationStat, notificationText } from '@api/notificationsApi';

const copy = strings.businessNotificationsCenter;

export interface BusinessNotificationsCenterScreenProps {
  onBack?: () => void;
  onOpenProfile?: () => void;
  onMarkAllRead?: () => void;
  onOpenCategory?: (categoryId: NotificationCategoryId) => void;
  onOpenNotification?: (notificationId: string) => void;
  onConfigureDispatch?: () => void;
}

/** One row of the venue feed, in the shape the design renders. */
interface BusinessNotificationRow {
  id: string;
  kind: keyof typeof strings.businessNotificationsCenter.kinds;
  icon: IconName;
  iconTone: 'brand' | 'success' | 'tertiary' | 'secondary';
  time: string;
  title: string;
  body: string;
  /** Value is optional because `metadata.stat` is only loosely typed. */
  stat?: { label?: string; value?: string; trend?: string };
  footnote?: string;
  cta: string;
  unread: boolean;
  categories: readonly NotificationCategoryId[];
}

/**
 * The backend's `type` is a free varchar, so these are substring matches rather
 * than an enum switch. Unknown types fall through to `info` instead of being
 * dropped: a notification nobody classified is still a notification the venue
 * needs to see.
 */
function rowKind(
  type: string | null | undefined,
): keyof typeof strings.businessNotificationsCenter.kinds {
  const value = (type ?? '').toLowerCase();
  if (value.includes('pos') || value.includes('shift')) return 'pos';
  if (value.includes('feedback') || value.includes('rating')) return 'feedback';
  if (value.includes('billing') || value.includes('subscription')) return 'billing';
  if (value.includes('deal') || value.includes('spike') || value.includes('offer'))
    return 'deal';
  if (value.includes('sync')) return 'sync';
  return 'system';
}

function rowIcon(type: string | null | undefined): IconName {
  switch (rowKind(type)) {
    case 'pos':
      return 'pointOfSale';
    case 'feedback':
      return 'rateReview';
    case 'billing':
      return 'creditCard';
    case 'deal':
      return 'fire';
    case 'sync':
      return 'cloudDone';
    default:
      return 'announcement';
  }
}

function rowTone(type: string | null | undefined): BusinessNotificationRow['iconTone'] {
  const kind = rowKind(type);
  if (kind === 'pos' || kind === 'sync') return 'success';
  if (kind === 'deal') return 'tertiary';
  if (kind === 'feedback') return 'secondary';
  return 'brand';
}

function rowCategories(type: string | null | undefined): NotificationCategoryId[] {
  const value = (type ?? '').toLowerCase();
  const categories: NotificationCategoryId[] = [];
  if (
    value.includes('pos') ||
    value.includes('order') ||
    value.includes('shift') ||
    value.includes('sync')
  ) {
    categories.push('orders');
  }
  if (value.includes('deal') || value.includes('spike') || value.includes('offer')) {
    categories.push('campaigns');
  }
  if (value.includes('billing') || value.includes('subscription')) {
    categories.push('system');
  }
  // Everything lands under "all"; an unmatched type still shows in the feed.
  return ['all', ...categories];
}

/** "2h ago", "Yesterday" — a feed reads as recent-or-not, not as a timestamp. */
function formatRelative(createdAt: string | null | undefined): string {
  if (!createdAt) return copy.recentTime;
  const then = new Date(createdAt).getTime();
  if (Number.isNaN(then)) return copy.recentTime;
  const minutes = Math.floor((Date.now() - then) / 60_000);
  if (minutes < 1) return copy.justNow;
  if (minutes < 60) return copy.minutesAgo.replace('%s', String(minutes));
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return copy.hoursAgo.replace('%s', String(hours));
  return copy.daysAgo.replace('%s', String(Math.floor(hours / 24)));
}

/**
 * Notification center: category chips with counts, then a feed of deal, POS,
 * feedback, billing and sync alerts. Each row keeps its kind, time, stat and
 * CTA, and unread rows carry a live dot.
 */
export function BusinessNotificationsCenterScreen({
  onBack,
  onOpenProfile,
  onMarkAllRead,
  onOpenCategory,
  onOpenNotification,
  onConfigureDispatch,
}: BusinessNotificationsCenterScreenProps) {
  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();
  const { data: feed } = useBusinessNotifications();

  const [category, setCategory] = useState<NotificationCategoryId>('all');
  const [readIds, setReadIds] = useState<string[]>([]);

  // The feed is the venue's real events, not a design list of them. The
  // fixture this screen was built against had a stat, a footnote and a CTA per
  // row; the API carries that in `metadata`, so the mapping reads it from there
  // and leaves the block out when a row has none — an empty container would be
  // the design claiming a figure nobody sent.
  const rows = useMemo<BusinessNotificationRow[]>(
    () =>
      (feed?.data ?? []).map(item => ({
        id: item.id,
        kind: rowKind(item.type),
        icon: rowIcon(item.type),
        iconTone: rowTone(item.type),
        time: formatRelative(item.createdAt),
        title: item.title,
        body: item.message,
        stat: notificationStat(item.metadata),
        footnote: notificationText(item.metadata, 'footnote'),
        cta: notificationText(item.metadata, 'cta') ?? copy.defaultCta,
        unread: !item.isRead,
        categories: rowCategories(item.type),
      })),
    [feed?.data],
  );

  const visible =
    category === 'all' ? rows : rows.filter(item => item.categories.includes(category));
  // Trust the server's count: it is the same read the bell already shows, and
  // deriving a second one here is how the badge and the list drift apart.
  const unread = feed?.unreadCount ?? 0;

  const categoryCounts = useMemo(() => {
    // "all" already holds the total, so it is counted once up front rather than
    // incremented per row below.
    const counts: Record<string, number> = { all: rows.length };
    for (const row of rows) {
      for (const id of row.categories) {
        if (id !== 'all') counts[id] = (counts[id] ?? 0) + 1;
      }
    }
    return counts;
  }, [rows]);

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
    >
      <View className="flex-row items-center justify-between gap-2">
        <View className="min-w-0 flex-1 flex-row items-center gap-2">
          <Icon name="notificationsActive" size={18} color={colors.primary} />
          <VemtapText
            variant="labelMd"
            className="min-w-0 flex-1 font-sans-semibold"
            numberOfLines={1}
          >
            {unread > 0 ? copy.unreadLabel.replace('2', String(unread)) : copy.emptyTitle}
          </VemtapText>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.markAllRead}
          onPress={() => {
            markAllReadMutation.mutate();
            setReadIds(rows.map(item => item.id));
            onMarkAllRead?.();
          }}
          className="min-h-9 shrink-0 flex-row items-center gap-1.5 rounded-full bg-surface-container px-3.5 py-1.5 active:scale-95"
        >
          <Icon name="tune" size={15} color={colors.textSecondary} />
          <VemtapText
            variant="labelSm"
            className="font-sans-semibold text-text-secondary"
            numberOfLines={1}
          >
            {copy.markAllRead}
          </VemtapText>
        </Pressable>
      </View>

      <BusinessChipScroller className="mt-3">
        {copy.categories.map(item => (
          <BusinessCountChip
            key={item.id}
            label={item.label}
            icon={notificationCategoryIcon[item.id]}
            count={String(categoryCounts[item.id] ?? 0)}
            selected={item.id === category}
            onPress={() => {
              setCategory(item.id);
              onOpenCategory?.(item.id);
            }}
          />
        ))}
      </BusinessChipScroller>

      <View className="mt-3 gap-2">
        {visible.map(item => {
          const isUnread = item.unread && !readIds.includes(item.id);
          return (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              accessibilityLabel={item.title}
              onPress={() => {
                markReadMutation.mutate(item.id);
                setReadIds(ids => (ids.includes(item.id) ? ids : [...ids, item.id]));
                onOpenNotification?.(item.id);
              }}
              className="gap-2 rounded-card bg-surface p-3 shadow-sm active:bg-surface-subtle"
            >
              <View className="flex-row items-center gap-2.5">
                <View
                  className={`h-9 w-9 shrink-0 items-center justify-center rounded-lg ${notificationToneTile[item.iconTone]}`}
                >
                  <Icon
                    name={item.icon}
                    size={18}
                    color={notificationToneIcon[item.iconTone]}
                  />
                </View>
                <View className="min-w-0 flex-1">
                  <VemtapText
                    variant="caption"
                    className="text-text-tertiary"
                    numberOfLines={1}
                  >
                    {`${copy.kinds[item.kind]} • ${item.time}`}
                  </VemtapText>
                  <VemtapText
                    variant="labelMd"
                    className="font-sans-semibold"
                    numberOfLines={2}
                  >
                    {item.title}
                  </VemtapText>
                </View>
                {isUnread ? (
                  <View className="h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
                ) : null}
              </View>

              <VemtapText
                variant="caption"
                tone="secondary"
                className="leading-relaxed"
                numberOfLines={3}
              >
                {item.body}
              </VemtapText>

              {item.stat ? (
                <View className="flex-row flex-wrap items-baseline gap-1.5 rounded-field bg-surface-subtle p-2.5">
                  {item.stat.label ? (
                    <VemtapText variant="caption" tone="tertiary" numberOfLines={1}>
                      {item.stat.label}
                    </VemtapText>
                  ) : null}
                  <VemtapText
                    variant="headingSm"
                    className="font-sans-bold text-primary"
                    numberOfLines={1}
                  >
                    {item.stat.value}
                  </VemtapText>
                  {item.stat.trend ? (
                    <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                      {item.stat.trend}
                    </VemtapText>
                  ) : null}
                </View>
              ) : null}

              {item.footnote ? (
                <View className="flex-row items-center gap-1.5">
                  <Icon name="checkCircle" size={14} color={colors.badgeDiscountText} />
                  <VemtapText
                    variant="caption"
                    className="min-w-0 flex-1 text-badge-discount-text"
                    numberOfLines={1}
                  >
                    {item.footnote}
                  </VemtapText>
                </View>
              ) : null}

              <View className="flex-row items-center justify-end gap-1">
                <VemtapText
                  variant="labelSm"
                  className="font-sans-semibold text-primary"
                  numberOfLines={1}
                >
                  {item.cta}
                </VemtapText>
                <Icon name="forward" size={16} color={colors.primary} />
              </View>
            </Pressable>
          );
        })}
      </View>

      {visible.length === 0 ? (
        <EmptyState
          icon="notificationsActive"
          variant="contained"
          title={copy.emptyTitle}
          description={copy.emptyBody}
        />
      ) : null}

      <View className="mt-3 gap-2 rounded-card bg-surface p-3 shadow-sm">
        <View className="flex-row items-center gap-2.5">
          <BusinessIconWell icon="notificationsActive" tone="brand" size="md" />
          <View className="min-w-0 flex-1">
            <VemtapText
              variant="labelMd"
              className="font-sans-semibold"
              numberOfLines={1}
            >
              {copy.dispatchTitle}
            </VemtapText>
            <VemtapText variant="caption" tone="secondary" numberOfLines={2}>
              {copy.dispatchBody}
            </VemtapText>
          </View>
        </View>
        <View className="flex-row items-center justify-between gap-2 rounded-field bg-surface-subtle p-2.5">
          <VemtapText
            variant="labelSm"
            className="min-w-0 flex-1 font-sans-semibold text-primary"
            numberOfLines={2}
          >
            {copy.dispatchCta}
          </VemtapText>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.dispatchCta}
            onPress={onConfigureDispatch}
            className="shrink-0"
          >
            <Icon name="forward" size={18} color={colors.primary} />
          </Pressable>
        </View>
        <VemtapText variant="micro" tone="tertiary" numberOfLines={2}>
          {copy.dispatchFooter}
        </VemtapText>
      </View>
    </BusinessScreenLayout>
  );
}

import { strings } from '@constants/strings';
import type {
  BusinessReview,
  BusinessReviewStatus,
  BusinessReviewsSummary,
} from '@api/dealsApi';
import type {
  BusinessProductComment,
  ProductCommentReplyFilter,
  ProductCommentsSummary,
} from '@api/productCommentsApi';
import type { BusinessPillTone } from '@features/business/components/BusinessPrimitives';
import { formatCount, relativeTime } from '@features/business/utils/datetime';

const copy = strings.businessReviewsReputation;

export type ReviewFilterKey = 'all' | BusinessReviewStatus | 'unreplied' | 'replied';

/** Which feedback the screen shows: deal reviews or product comments. */
export type ReviewSource = 'deals' | 'products';

export interface ReviewDistributionRowView {
  stars: 1 | 2 | 3 | 4 | 5;
  percent: number;
}

export interface ReviewCardView {
  id: string;
  initials: string;
  name: string;
  time: string;
  rating: number | null;
  offerName: string;
  body: string;
  /** Null hides the likes counter (product comments have none). */
  likes: number | null;
  status: BusinessReviewStatus | 'unknown';
  /** Null hides the moderation pill (product comments publish immediately). */
  statusPill: { label: string; tone: BusinessPillTone } | null;
  /** Pending rows are the ones the moderation queue can act on. */
  canApprove: boolean;
  canReject: boolean;
  canDelete: boolean;
  /** The business's public reply, if any. */
  reply: string | null;
  replyTime: string;
  canReply: boolean;
}

export interface ReviewsReputationView {
  /** One decimal, or an em dash when nothing has been rated yet. */
  score: string;
  /** Rounded for the star row — the summary only carries the average. */
  stars: number;
  totalLabel: string;
  /** Null when nothing is waiting, so the badge can disappear. */
  pendingLabel: string | null;
  /** Shown in place of the pending badge when nothing is waiting. */
  settledLabel: string;
  moderationTitle: string;
  moderationSubtitle: string;
  emptyTitle: string;
  emptyBody: string;
  deleteTitle: string;
  deleteBody: string;
  distribution: ReviewDistributionRowView[];
  filters: { key: ReviewFilterKey; label: string }[];
  reviews: ReviewCardView[];
}

const FILTER_LABELS: Record<ReviewFilterKey, string> = {
  all: copy.filters.all,
  pending: copy.filters.pending,
  approved: copy.filters.approved,
  rejected: copy.filters.rejected,
  unreplied: copy.productFilters.unreplied,
  replied: copy.productFilters.replied,
};

export const REVIEW_SOURCES: { key: ReviewSource; label: string }[] = [
  { key: 'deals', label: copy.sources.deals },
  { key: 'products', label: copy.sources.products },
];

const STATUS_LABELS: Record<BusinessReviewStatus, string> = {
  pending: copy.status.pending,
  approved: copy.status.approved,
  rejected: copy.status.rejected,
};

const STATUS_TONES: Record<BusinessReviewStatus, BusinessPillTone> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'neutral',
};

/** Statuses a row may be moved to from its current one; used by the card actions. */
export function reviewStatusLabel(status: BusinessReviewStatus | 'unknown'): string {
  return status === 'unknown' ? copy.status.pending : STATUS_LABELS[status];
}

export function reviewStatusTone(
  status: BusinessReviewStatus | 'unknown',
): BusinessPillTone {
  return status === 'unknown' ? 'warning' : STATUS_TONES[status];
}

export function presentBusinessReviews(input: {
  reviews: readonly BusinessReview[];
  summary?: BusinessReviewsSummary;
  filter: ReviewFilterKey;
}): ReviewsReputationView {
  const { summary } = input;

  const approvedTotal = summary?.totalReviews ?? 0;
  const average = summary?.averageRating ?? null;
  const distribution =
    summary?.ratingDistribution ?? ({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as const);
  const distributionTotal = Object.values(distribution).reduce((sum, n) => sum + n, 0);
  const divisor = distributionTotal > 0 ? distributionTotal : approvedTotal;

  // Only approved reviews carry a star, so the buckets add up to the approved
  // total when the endpoint has everything and to nothing when it is empty.
  const rows: ReviewDistributionRowView[] = ([5, 4, 3, 2, 1] as const).map(stars => ({
    stars,
    percent: divisor > 0 ? Math.round(((distribution[stars] ?? 0) / divisor) * 100) : 0,
  }));

  const reviews = input.reviews.map<ReviewCardView>(review => {
    const status = isReviewStatus(review.status) ? review.status : 'unknown';
    const name = review.reviewerName?.trim() || copy.reviewerFallback;
    return {
      id: review.id,
      initials: initialsOf(name),
      name,
      time: relativeTime(review.createdAt) || copy.timeFallback,
      rating: review.rating ?? null,
      offerName: review.offerName?.trim() || copy.offerFallback,
      body: review.comment?.trim() || '',
      likes: review.likesCount ?? 0,
      status,
      statusPill: { label: reviewStatusLabel(status), tone: reviewStatusTone(status) },
      canApprove: status === 'pending',
      canReject: status === 'pending',
      canDelete: status !== 'unknown',
      reply: review.merchantReply?.trim() || null,
      replyTime: review.repliedAt
        ? relativeTime(review.repliedAt) || copy.timeFallback
        : '',
      canReply: status !== 'unknown' && status !== 'rejected',
    };
  });

  return {
    score: average === null ? copy.scoreEmpty : average.toFixed(1),
    stars: Math.round(average ?? 0),
    totalLabel: copy.basedOn(formatCount(approvedTotal)),
    pendingLabel:
      (summary?.pendingReviews ?? 0) > 0
        ? copy.pendingBadge(formatCount(summary?.pendingReviews ?? 0))
        : null,
    settledLabel: copy.status.approved,
    moderationTitle: copy.moderationTitle,
    moderationSubtitle: copy.moderationSubtitle,
    emptyTitle: copy.empty.title,
    emptyBody: copy.empty.body,
    deleteTitle: copy.deleteTitle,
    deleteBody: copy.deleteBody,
    distribution: rows,
    filters: (['all', 'pending', 'approved', 'rejected'] as ReviewFilterKey[]).map(
      key => ({ key, label: FILTER_LABELS[key] }),
    ),
    reviews,
  };
}

function distributionRows(
  distribution: Record<1 | 2 | 3 | 4 | 5, number>,
): ReviewDistributionRowView[] {
  const total = Object.values(distribution).reduce((sum, n) => sum + n, 0);
  return ([5, 4, 3, 2, 1] as const).map(stars => ({
    stars,
    percent: total > 0 ? Math.round(((distribution[stars] ?? 0) / total) * 100) : 0,
  }));
}

/**
 * Product comments in the same view as deal reviews. They publish straight
 * away, so there is no moderation pill or approve/reject — only reply and
 * remove — and the header counts what still needs an answer.
 */
export function presentProductComments(input: {
  comments: readonly BusinessProductComment[];
  summary?: ProductCommentsSummary;
  filter: ProductCommentReplyFilter;
}): ReviewsReputationView {
  const { summary } = input;
  const average = summary?.averageRating ?? null;
  const unreplied = summary?.unreplied ?? 0;

  return {
    score: average === null ? copy.scoreEmpty : average.toFixed(1),
    stars: Math.round(average ?? 0),
    totalLabel: copy.productsBasedOn(formatCount(summary?.ratingCount ?? 0)),
    pendingLabel: unreplied > 0 ? copy.unrepliedBadge(formatCount(unreplied)) : null,
    settledLabel: copy.allReplied,
    moderationTitle: copy.productModerationTitle,
    moderationSubtitle: copy.productModerationSubtitle,
    emptyTitle: copy.productEmpty.title,
    emptyBody: copy.productEmpty.body,
    deleteTitle: copy.productDeleteTitle,
    deleteBody: copy.productDeleteBody,
    distribution: distributionRows(
      summary?.ratingDistribution ?? { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    ),
    filters: (['all', 'unreplied', 'replied'] as ReviewFilterKey[]).map(key => ({
      key,
      label: key === 'all' ? copy.productFilters.all : FILTER_LABELS[key],
    })),
    reviews: input.comments.map<ReviewCardView>(comment => {
      const name = comment.authorName.trim() || copy.reviewerFallback;
      return {
        id: comment.id,
        initials: initialsOf(name),
        name,
        time: relativeTime(comment.createdAt) || copy.timeFallback,
        rating: comment.rating ?? null,
        offerName: comment.itemName?.trim() || copy.productFallback,
        body: comment.comment.trim(),
        likes: null,
        status: 'approved',
        statusPill: null,
        canApprove: false,
        canReject: false,
        canDelete: true,
        reply: comment.merchantReply?.trim() || null,
        replyTime: comment.repliedAt
          ? relativeTime(comment.repliedAt) || copy.timeFallback
          : '',
        canReply: true,
      };
    }),
  };
}

function isReviewStatus(value: string | null | undefined): value is BusinessReviewStatus {
  return value === 'pending' || value === 'approved' || value === 'rejected';
}

function initialsOf(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  const first = parts[0]?.charAt(0) ?? '';
  const second = parts.length > 1 ? parts[parts.length - 1].charAt(0) : '';
  return `${first}${second}`.toUpperCase().slice(0, 2) || name.slice(0, 2).toUpperCase();
}

import { strings } from '@constants/strings';
import type {
  KnowledgeTree,
  SupportTicket,
  TicketDetail,
  TicketMessage,
  TicketPriority,
  TicketStatus,
} from '@api/supportApi';
import type { BusinessPillTone } from '@features/business/components/BusinessPrimitives';
import { relativeTime } from '@features/business/utils/datetime';

const copy = strings.businessSupportHelp;

// ---------------------------------------------------------------------------
// Knowledge base / FAQs
// ---------------------------------------------------------------------------

export interface KbArticleView {
  id: string;
  title: string;
  summary: string;
  /** The section it sits under, shown as the row's caption. */
  section: string;
}

export interface KbCategoryView {
  id: string;
  title: string;
  countLabel: string;
  articles: KbArticleView[];
}

export interface SupportTreeView {
  categories: KbCategoryView[];
  /** Panel badge: how many articles the business can read. */
  totalLabel: string;
}

/**
 * The help tree is category → section → page, so a category's "articles" are
 * its pages across every section, each carrying the section it came from as a
 * caption. Categories with no pages are dropped rather than rendered empty.
 */
export function presentSupportTree(input: {
  tree?: KnowledgeTree | null;
  search?: string;
}): SupportTreeView {
  const categories = (input.tree?.categories ?? [])
    .map(category => {
      const articles = (category.sections ?? []).flatMap(section =>
        (section.pages ?? []).map(page => ({
          id: page.id,
          title: page.title,
          summary: page.summary ?? '',
          section: section.title,
        })),
      );

      return {
        id: category.id,
        title: category.title,
        countLabel: copy.articleCount(articles.length),
        articles,
      };
    })
    .filter(category => category.articles.length > 0);

  const total = categories.reduce((sum, category) => sum + category.articles.length, 0);

  return {
    categories,
    totalLabel: copy.articleCount(total),
  };
}

// ---------------------------------------------------------------------------
// Tickets
// ---------------------------------------------------------------------------

export interface TicketRowView {
  id: string;
  subject: string;
  category: string;
  status: TicketStatus;
  statusTone: BusinessPillTone;
  priority: TicketPriority;
  time: string;
}

export const ticketStatusTone: Record<TicketStatus, BusinessPillTone> = {
  Pending: 'warning',
  'In Progress': 'brand',
  Resolved: 'success',
  Cancelled: 'neutral',
};

export function ticketTone(status: TicketStatus): BusinessPillTone {
  return ticketStatusTone[status] ?? 'neutral';
}

export function presentSupportTickets(
  tickets: readonly SupportTicket[] | null | undefined,
): TicketRowView[] {
  return (tickets ?? []).map(ticket => ({
    id: ticket.id,
    subject: ticket.subject || copy.ticketSubjectFallback,
    category: ticket.category || copy.ticketCategoryFallback,
    status: ticket.status,
    statusTone: ticketTone(ticket.status),
    priority: ticket.priority,
    time: relativeTime(ticket.createdAt) || copy.timeFallback,
  }));
}

// ---------------------------------------------------------------------------
// Ticket thread
// ---------------------------------------------------------------------------

export interface TicketMessageView {
  id: string;
  body: string;
  time: string;
  /** The merchant's own messages read as `CUSTOMER`; agent replies do not. */
  mine: boolean;
  role: TicketMessage['senderRole'];
}

export interface TicketThreadView {
  id: string;
  subject: string;
  status: TicketStatus;
  statusTone: BusinessPillTone;
  messages: TicketMessageView[];
}

export function presentTicketThread(
  detail: TicketDetail | null | undefined,
): TicketThreadView {
  const messages = (detail?.messages ?? []).map(message => ({
    id: message.id,
    body: message.message,
    time: relativeTime(message.createdAt) || copy.timeFallback,
    mine: message.senderRole === 'CUSTOMER',
    role: message.senderRole,
  }));

  const status = detail?.status ?? 'Pending';

  return {
    id: detail?.id ?? '',
    subject: detail?.subject || copy.ticketSubjectFallback,
    status,
    statusTone: ticketTone(status),
    messages,
  };
}

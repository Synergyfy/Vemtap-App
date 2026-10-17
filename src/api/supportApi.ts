import { z } from 'zod';
import { requestValidated } from '@api/client';
import type { ApiRequestOptions } from '@app-types/api';

/**
 * Support & help: the public knowledge base, the merchant's own tickets and the
 * support bot.
 *
 * Shapes come from `support-faq.controller.ts`, `support.controller.ts` and
 * `public-knowledge-base.controller.ts`:
 *
 *  - `/knowledge-base` and `/support/faqs` return the **same** category →
 *    section → page tree; the FAQ route just adds a `search` filter. There is no
 *    separate FAQ table.
 *  - `/support/tickets` is cursor-paginated (`data`, `cursor`, `meta.total`) and
 *    carries no messages — only `/support/tickets/:id` does.
 *  - Ticket enums are **Title case** (`Pending`, `In Progress`, …), unlike the
 *    review statuses.
 */

// ---------------------------------------------------------------------------
// Knowledge base
// ---------------------------------------------------------------------------

export const kbPageSchema = z.object({
  id: z.string(),
  title: z.string(),
  path: z.string().nullable().optional(),
  summary: z.string().nullable().optional(),
  thumbnail: z.string().nullable().optional(),
  order: z.number().nullable().optional(),
});
export type KbPage = z.infer<typeof kbPageSchema>;

export const kbSectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  order: z.number().nullable().optional(),
  pages: z.array(kbPageSchema).nullish().default([]),
});
export type KbSection = z.infer<typeof kbSectionSchema>;

export const kbCategorySchema = z.object({
  id: z.string(),
  title: z.string(),
  order: z.number().nullable().optional(),
  sections: z.array(kbSectionSchema).nullish().default([]),
});
export type KbCategory = z.infer<typeof kbCategorySchema>;

export const knowledgeTreeSchema = z.object({
  categories: z.array(kbCategorySchema).nullish().default([]),
});
export type KnowledgeTree = z.infer<typeof knowledgeTreeSchema>;

// ---------------------------------------------------------------------------
// Tickets
// ---------------------------------------------------------------------------

export const ticketStatusSchema = z.enum([
  'Pending',
  'In Progress',
  'Resolved',
  'Cancelled',
]);
export type TicketStatus = z.infer<typeof ticketStatusSchema>;

export const ticketPrioritySchema = z.enum(['Low', 'Normal', 'High', 'Urgent']);
export type TicketPriority = z.infer<typeof ticketPrioritySchema>;

export const supportTicketSchema = z.object({
  id: z.string(),
  subject: z.string().catch(''),
  category: z.string().catch(''),
  status: ticketStatusSchema.catch('Pending'),
  priority: ticketPrioritySchema.catch('Normal'),
  type: z.string().nullable().optional(),
  channel: z.string().nullable().optional(),
  userId: z.string().nullable().optional(),
  guestName: z.string().nullable().optional(),
  guestEmail: z.string().nullable().optional(),
  createdAt: z.string().nullable().optional(),
  updatedAt: z.string().nullable().optional(),
});
export type SupportTicket = z.infer<typeof supportTicketSchema>;

export const supportTicketsPageSchema = z.object({
  data: z.array(supportTicketSchema).nullish().default([]),
  cursor: z.string().nullable().optional(),
  nextCursor: z.string().nullable().optional(),
  prevCursor: z.string().nullable().optional(),
  hasNextPage: z.boolean().nullable().optional(),
  meta: z
    .object({
      total: z.number(),
      page: z.number().nullable().optional(),
      lastPage: z.number().nullable().optional(),
    })
    .nullish()
    .optional(),
});
export type SupportTicketsPage = z.infer<typeof supportTicketsPageSchema>;

export const ticketMessageSchema = z.object({
  id: z.string().catch(''),
  ticketId: z.string().nullable().optional(),
  message: z.string().catch(''),
  /** Who wrote it — the merchant's own messages are `CUSTOMER`. */
  senderRole: z.enum(['CUSTOMER', 'AGENT', 'BOT', 'SYSTEM']).catch('CUSTOMER'),
  senderId: z.string().nullable().optional(),
  attachments: z.array(z.unknown()).nullish(),
  createdAt: z.string().nullable().optional(),
});
export type TicketMessage = z.infer<typeof ticketMessageSchema>;

export const ticketDetailSchema = supportTicketSchema.extend({
  messages: z.array(ticketMessageSchema).nullish().default([]),
  activity: z.array(z.unknown()).nullish().default([]),
});
export type TicketDetail = z.infer<typeof ticketDetailSchema>;

export const createTicketSchema = z.object({
  subject: z.string().min(1).max(200),
  category: z.string().min(1).max(120),
  message: z.string().min(1).max(4000),
  priority: ticketPrioritySchema.optional(),
});
export type CreateTicketInput = z.infer<typeof createTicketSchema>;

// ---------------------------------------------------------------------------
// Support bot
// ---------------------------------------------------------------------------

export const botResponseSchema = z.object({
  id: z.string().catch(''),
  content: z.string().catch(''),
  /** Where the answer came from — surfaced so a fallback is not read as fact. */
  source: z.enum(['knowledge_base', 'ai', 'fallback']).catch('fallback'),
  confidence: z.number().catch(0),
  buttons: z
    .array(
      z.object({
        label: z.string(),
        action: z.string(),
        value: z.string(),
      }),
    )
    .nullish()
    .default([]),
  followUp: z.array(z.string()).nullish().default([]),
});
export type BotResponse = z.infer<typeof botResponseSchema>;

export const botQuerySchema = z.object({
  query: z.string().min(1).max(1000),
  context: z.string().optional(),
  sessionId: z.string().optional(),
});
export type BotQueryInput = z.infer<typeof botQuerySchema>;

export const supportApi = {
  /** `GET /knowledge-base` — the whole category/section/page tree. Public. */
  getKnowledgeTree(options: ApiRequestOptions = {}): Promise<KnowledgeTree> {
    return requestValidated<KnowledgeTree>(
      { method: 'GET', url: '/knowledge-base', ...options },
      knowledgeTreeSchema,
    );
  },

  /**
   * `GET /support/faqs` — the same tree, optionally filtered by `search`.
   * Public, and the route the help screen uses so a search box can narrow it.
   */
  getFaqs(search?: string, options: ApiRequestOptions = {}): Promise<KnowledgeTree> {
    return requestValidated<KnowledgeTree>(
      { method: 'GET', url: '/support/faqs', params: { search }, ...options },
      knowledgeTreeSchema,
    );
  },

  /** `GET /support/tickets` — the current user's tickets, newest first. */
  getTickets(
    query: { page?: number; limit?: number; cursor?: string } = {},
    options: ApiRequestOptions = {},
  ): Promise<SupportTicketsPage> {
    return requestValidated<SupportTicketsPage>(
      {
        method: 'GET',
        url: '/support/tickets',
        params: { page: query.page, limit: query.limit, cursor: query.cursor },
        ...options,
      },
      supportTicketsPageSchema,
    );
  },

  /** `GET /support/tickets/:id` — one ticket with its messages and activity. */
  getTicket(id: string, options: ApiRequestOptions = {}): Promise<TicketDetail> {
    return requestValidated<TicketDetail>(
      { method: 'GET', url: `/support/tickets/${id}`, ...options },
      ticketDetailSchema,
    );
  },

  /** `POST /support/tickets` — opens a ticket and posts its first message. */
  createTicket(
    input: CreateTicketInput,
    options: ApiRequestOptions = {},
  ): Promise<SupportTicket> {
    return requestValidated<SupportTicket>(
      { method: 'POST', url: '/support/tickets', data: input, ...options },
      supportTicketSchema,
    );
  },

  /** `POST /support/tickets/:id/message` — appends a message to a ticket. */
  replyToTicket(
    id: string,
    message: string,
    options: ApiRequestOptions = {},
  ): Promise<TicketMessage> {
    return requestValidated<TicketMessage>(
      {
        method: 'POST',
        url: `/support/tickets/${id}/message`,
        data: { message },
        ...options,
      },
      ticketMessageSchema,
    );
  },

  /** `POST /support/bot/query` — the automated assistant's answer. */
  askBot(input: BotQueryInput, options: ApiRequestOptions = {}): Promise<BotResponse> {
    return requestValidated<BotResponse>(
      { method: 'POST', url: '/support/bot/query', data: input, ...options },
      botResponseSchema,
    );
  },
};

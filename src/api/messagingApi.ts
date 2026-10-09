import { z } from 'zod';
import { requestValidated } from '@api/client';
import type { ApiRequestOptions } from '@app-types/api';

export const threadParticipantSchema = z.object({
  id: z.string().optional(),
  name: z.string().nullish(),
  firstName: z.string().nullish(),
  lastName: z.string().nullish(),
  logoUrl: z.string().nullable().optional(),
  avatarUrl: z.string().nullable().optional(),
  avatar: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
});

export const conversationThreadSchema = z.object({
  id: z.string(),
  createdAt: z.string().nullish(),
  updatedAt: z.string().nullish(),
  branchId: z.string().nullish(),
  branch: threadParticipantSchema.nullish(),
  businessId: z.string().nullish(),
  business: threadParticipantSchema.nullish(),
  customerId: z.string().nullish(),
  customer: threadParticipantSchema.nullish(),
  channel: z.string().nullish().default('IN_HOUSE'),
  lastActivityAt: z.string().nullish(),
  status: z.string().nullish().default('OPEN'),
  lastMessageContent: z.string().nullish().default(''),
  branchUnreadCount: z.number().nullish().default(0),
  customerUnreadCount: z.number().nullish().default(0),
  /** GENERAL | DEAL | CLAIM | ORDER | BOOKING — latest conversation context. */
  subjectType: z.string().nullish(),
  /** Links the thread to the claim or order it is about, when known. */
  claimId: z.string().nullish(),
  orderId: z.string().nullish(),
  /**
   * Server-side classification driving the filter chips: `unread`, `deals`,
   * `bookings`. Additive — a thread can be both `unread` and `deals`. Absent on
   * deployments that predate subject types, hence optional.
   */
  categories: z.array(z.string()).nullish(),
});
export type ConversationThread = z.infer<typeof conversationThreadSchema>;

export const threadListSchema = z.union([
  z.array(conversationThreadSchema),
  z
    .object({
      data: z.array(conversationThreadSchema),
    })
    .transform(res => res.data),
]);

export const messageSchema = z.object({
  id: z.string(),
  createdAt: z.string().nullish(),
  updatedAt: z.string().nullish(),
  branchId: z.string().nullish(),
  customerId: z.string().nullish(),
  threadId: z.string().nullish(),
  content: z.string(),
  channel: z.string().nullish().default('IN_HOUSE'),
  direction: z.enum(['INBOUND', 'OUTBOUND']).nullish().default('OUTBOUND'),
  status: z.string().nullish().default('SENT'),
  from: z.string().nullish(),
  to: z.string().nullish(),
  timestamp: z.string().nullish(),
  replyToId: z.string().nullable().optional(),
});
export type ChatMessage = z.infer<typeof messageSchema>;

export const messageListSchema = z.union([
  z.array(messageSchema),
  z
    .object({
      data: z.array(messageSchema),
    })
    .transform(res => res.data),
]);

export interface StartConversationPayload {
  branchId: string;
  content: string;
  /**
   * What the conversation is about, so the Messages filter chips can classify
   * it without guessing from the message text. Defaults to `GENERAL`.
   */
  subjectType?: 'GENERAL' | 'DEAL' | 'CLAIM' | 'ORDER' | 'BOOKING';
  /** Set alongside `CLAIM` to link the thread to a claimed deal pass. */
  claimId?: string;
  /** Set alongside `ORDER` to link the thread to an order. */
  orderId?: string;
}

export interface ReplyMessagePayload {
  content: string;
  replyToId?: string;
}

export const messagingApi = {
  // Customer Messaging
  /**
   * List customer conversation threads.
   */
  async getCustomerThreads(
    params?: { branchId?: string },
    options: ApiRequestOptions = {},
  ): Promise<ConversationThread[]> {
    return requestValidated<ConversationThread[]>(
      {
        method: 'GET',
        url: '/customer/messaging/threads',
        params,
        ...options,
      },
      threadListSchema,
    );
  },

  /**
   * Start a new customer conversation with a branch.
   */
  async startCustomerConversation(
    payload: StartConversationPayload,
    options: ApiRequestOptions = {},
  ): Promise<ChatMessage> {
    return requestValidated<ChatMessage>(
      {
        method: 'POST',
        url: '/customer/messaging/threads/start',
        data: payload,
        ...options,
      },
      messageSchema,
    );
  },

  /**
   * Get messages in a customer thread.
   */
  async getCustomerThreadMessages(
    threadId: string,
    options: ApiRequestOptions = {},
  ): Promise<ChatMessage[]> {
    return requestValidated<ChatMessage[]>(
      {
        method: 'GET',
        url: `/customer/messaging/threads/${threadId}`,
        ...options,
      },
      messageListSchema,
    );
  },

  /**
   * Send a reply in a customer thread.
   */
  async replyCustomerThread(
    threadId: string,
    payload: ReplyMessagePayload,
    options: ApiRequestOptions = {},
  ): Promise<ChatMessage> {
    return requestValidated<ChatMessage>(
      {
        method: 'POST',
        url: `/customer/messaging/threads/${threadId}/reply`,
        data: payload,
        ...options,
      },
      messageSchema,
    );
  },

  // Business Messaging
  /**
   * Business: list conversation threads for a branch and channel.
   */
  async getBusinessInboxThreads(
    branchId: string,
    channel = 'IN_HOUSE',
    options: ApiRequestOptions = {},
  ): Promise<ConversationThread[]> {
    return requestValidated<ConversationThread[]>(
      {
        method: 'GET',
        url: `/messaging/inbox/${channel}`,
        params: { branchId },
        ...options,
      },
      threadListSchema,
    );
  },

  /**
   * Business: get messages in a thread.
   */
  async getBusinessThreadMessages(
    threadId: string,
    branchId: string,
    options: ApiRequestOptions = {},
  ): Promise<ChatMessage[]> {
    return requestValidated<ChatMessage[]>(
      {
        method: 'GET',
        url: `/messaging/inbox/threads/${threadId}`,
        params: { branchId },
        ...options,
      },
      messageListSchema,
    );
  },

  /**
   * Business: send reply in a thread.
   */
  async replyBusinessThread(
    threadId: string,
    branchId: string,
    payload: ReplyMessagePayload,
    options: ApiRequestOptions = {},
  ): Promise<ChatMessage | null> {
    return requestValidated<ChatMessage | null>(
      {
        method: 'POST',
        url: `/messaging/inbox/threads/${threadId}/reply`,
        params: { branchId },
        data: payload,
        ...options,
      },
      messageSchema.nullable(),
    );
  },

  /**
   * Business: mark thread as read.
   */
  async markBusinessThreadRead(
    threadId: string,
    branchId: string,
    options: ApiRequestOptions = {},
  ): Promise<void> {
    await requestValidated<unknown>(
      {
        method: 'POST',
        url: `/messaging/inbox/threads/${threadId}/read`,
        params: { branchId },
        ...options,
      },
      z.unknown(),
    );
  },
};

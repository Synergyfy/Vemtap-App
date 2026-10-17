import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  supportApi,
  type CreateTicketInput,
  type KnowledgeTree,
  type SupportTicket,
  type TicketDetail,
  type TicketMessage,
} from '@api/supportApi';

/**
 * Support & help queries and the writes behind the screen.
 *
 * Two facts shape the keys: the ticket list carries no messages (only the
 * detail route does), and the FAQ route is the knowledge tree with an optional
 * search, so the search term is part of the key rather than a filter applied
 * after the fact.
 */
export const supportKeys = {
  all: ['support'] as const,
  tree: ['support', 'tree'] as const,
  faqs: (search?: string) => ['support', 'faqs', search ?? ''] as const,
  tickets: ['support', 'tickets'] as const,
  ticket: (id: string) => ['support', 'tickets', id] as const,
};

/** `GET /support/faqs` — public, so it can be read before the ticket list loads. */
export function useSupportFaqs(search?: string) {
  return useQuery<KnowledgeTree>({
    queryKey: supportKeys.faqs(search),
    queryFn: () => supportApi.getFaqs(search),
    staleTime: 120_000,
  });
}

/** `GET /support/tickets` — the merchant's own tickets, newest first. */
export function useSupportTickets() {
  return useQuery<SupportTicket[]>({
    queryKey: supportKeys.tickets,
    queryFn: async () => (await supportApi.getTickets({ limit: 50 })).data ?? [],
    staleTime: 30_000,
  });
}

/** `GET /support/tickets/:id` — only fetched for the ticket the user opened. */
export function useSupportTicket(id: string | null) {
  return useQuery<TicketDetail>({
    queryKey: supportKeys.ticket(id ?? ''),
    queryFn: () => supportApi.getTicket(id as string),
    enabled: Boolean(id),
    staleTime: 15_000,
  });
}

/** `POST /support/tickets` — a new ticket is a new row, so the list is refetched. */
export function useCreateSupportTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTicketInput) => supportApi.createTicket(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: supportKeys.all });
    },
  });
}

/** `POST /support/tickets/:id/message` — appended optimistically to the thread. */
export function useReplySupportTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { ticketId: string; message: string }) =>
      supportApi.replyToTicket(input.ticketId, input.message),
    onMutate: async ({ ticketId, message }) => {
      const key = supportKeys.ticket(ticketId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<TicketDetail>(key);
      if (previous) {
        const optimistic: TicketMessage = {
          id: `optimistic-${Date.now()}`,
          message,
          senderRole: 'CUSTOMER',
          attachments: [],
          createdAt: new Date().toISOString(),
        };
        queryClient.setQueryData<TicketDetail>(key, {
          ...previous,
          messages: [...(previous.messages ?? []), optimistic],
        });
      }
      return { previous };
    },
    onError: (_error, { ticketId }, context) => {
      if (context?.previous) {
        queryClient.setQueryData(supportKeys.ticket(ticketId), context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: supportKeys.all });
    },
  });
}

/**
 * `POST /support/bot/query` — imperative on purpose: the screen keeps the
 * question and answer as local state, so a mutation (not a query) is the right
 * tool.
 */
export function useAskSupportBot() {
  return useMutation({
    mutationFn: (input: { query: string }) => supportApi.askBot(input),
  });
}

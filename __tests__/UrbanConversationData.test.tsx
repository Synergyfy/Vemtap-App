import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { UrbanConversationScreen } from '@features/merchantChat/screens/UrbanConversationScreen';
import {
  useCustomerThreadMessages,
  useCustomerThreads,
  useSendCustomerReply,
} from '@features/merchantChat/hooks/useCustomerMessaging';
import { useClaimPass } from '@features/myDeals/hooks/useMyClaims';
import { strings } from '@constants/strings';
import type { ChatMessage, ConversationThread } from '@api/messagingApi';
import type { MyClaim } from '@api/claimApi';

jest.mock('@features/merchantChat/hooks/useCustomerMessaging', () => ({
  useCustomerThreads: jest.fn(),
  useCustomerThreadMessages: jest.fn(),
  useSendCustomerReply: jest.fn(),
  // Opening a conversation clears the unread state; a no-op keeps these suites
  // focused on rendering rather than read bookkeeping.
  markCustomerThreadReadLocally: jest.fn(),
}));

jest.mock('@features/myDeals/hooks/useMyClaims', () => ({
  useClaimPass: jest.fn(),
}));

const THREAD_ID = 'f7de9d67-6d7d-4701-9e84-e522131e8dbe';
const CLAIM_ID = 'c1a2b3d4-0000-4000-8000-000000000001';

const thread: ConversationThread = {
  id: THREAD_ID,
  branch: { name: 'Urban Grill & Bistro', logoUrl: null },
  branchId: 'de9abc24-fbe0-4b9b-8362-89663b6b4d1e',
  channel: 'IN_HOUSE',
  status: 'OPEN',
  lastMessageContent: 'Hi',
  branchUnreadCount: 0,
  customerUnreadCount: 0,
};

const linkedThread: ConversationThread = {
  ...thread,
  subjectType: 'CLAIM',
  claimId: CLAIM_ID,
};

const linkedClaim: MyClaim = {
  id: CLAIM_ID,
  claimCode: 'VT-48F261',
  status: 'ACTIVE',
  expiresAt: '2026-12-01T00:00:00.000Z',
  claimedAt: '2026-10-01T00:00:00.000Z',
  offer: {
    id: 'offer-1',
    name: '20% Off Prime Lunch Combo',
    mainImage: 'https://example.test/lunch.jpg',
    calculatedPrice: 9600,
    originalPrice: 12000,
    discountPercent: 20,
    businessId: 'biz-1',
    businessName: 'Urban Grill & Bistro',
    branchId: 'de9abc24-fbe0-4b9b-8362-89663b6b4d1e',
    endDate: '2026-12-01T00:00:00.000Z',
  },
};

function setThread(value: ConversationThread) {
  (useCustomerThreads as jest.Mock).mockReturnValue({
    data: [value],
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
  });
}

function setClaim(claim: MyClaim | undefined) {
  (useClaimPass as jest.Mock).mockReturnValue({ claim });
}

const merchantMessage: ChatMessage = {
  id: 'msg-1',
  content: 'Hi, thank you for reaching out.',
  createdAt: '2026-10-08T08:40:14.782Z',
  direction: 'OUTBOUND',
  threadId: THREAD_ID,
  channel: 'IN_HOUSE',
  status: 'SENT',
};

const customerMessage: ChatMessage = {
  id: 'msg-2',
  content: 'Great, see you soon!',
  createdAt: '2026-10-08T08:41:00.000Z',
  direction: 'INBOUND',
  threadId: THREAD_ID,
  channel: 'IN_HOUSE',
  status: 'SENT',
};

function setMessages(state: Record<string, unknown>) {
  (useCustomerThreadMessages as jest.Mock).mockReturnValue({
    refetch: jest.fn(),
    ...state,
  });
}

beforeEach(() => {
  setThread(thread);
  setClaim(undefined);
  (useSendCustomerReply as jest.Mock).mockReturnValue({
    mutate: jest.fn(),
    isPending: false,
  });
});

test('shows the loading state while messages are fetched', async () => {
  setMessages({ isLoading: true, isError: false, data: undefined });

  const screen = await render(<UrbanConversationScreen threadId={THREAD_ID} />);

  expect(screen.getByText(strings.common.loading)).toBeTruthy();
});

test('shows an error state that can retry', async () => {
  const refetch = jest.fn();
  setMessages({ isLoading: false, isError: true, data: undefined, refetch });

  const screen = await render(<UrbanConversationScreen threadId={THREAD_ID} />);

  fireEvent.press(screen.getByText(strings.common.retry));
  expect(refetch).toHaveBeenCalledTimes(1);
});

test('shows the empty state when the thread has no messages', async () => {
  setMessages({ isLoading: false, isError: false, data: [] });

  const screen = await render(<UrbanConversationScreen threadId={THREAD_ID} />);

  expect(screen.getByText(strings.common.empty)).toBeTruthy();
});

test('renders the thread branch name and both message directions', async () => {
  setMessages({
    isLoading: false,
    isError: false,
    data: [merchantMessage, customerMessage],
  });

  const screen = await render(<UrbanConversationScreen threadId={THREAD_ID} />);

  expect(screen.getByText('Urban Grill & Bistro')).toBeTruthy();
  expect(screen.getByText('Hi, thank you for reaching out.')).toBeTruthy();
  expect(screen.getByText('Great, see you soon!')).toBeTruthy();
});

test('sends a draft through the reply mutation', async () => {
  const mutate = jest.fn();
  (useSendCustomerReply as jest.Mock).mockReturnValue({ mutate, isPending: false });
  setMessages({ isLoading: false, isError: false, data: [merchantMessage] });

  const screen = await render(<UrbanConversationScreen threadId={THREAD_ID} />);

  await fireEvent.changeText(
    screen.getByPlaceholderText(strings.urbanConversation.placeholder),
    'Hello there',
  );
  await fireEvent.press(
    screen.getByRole('button', { name: strings.urbanConversation.send }),
  );

  expect(mutate).toHaveBeenCalledWith({
    threadId: THREAD_ID,
    payload: { content: 'Hello there' },
  });
});

test('does not send an empty draft', async () => {
  const mutate = jest.fn();
  (useSendCustomerReply as jest.Mock).mockReturnValue({ mutate, isPending: false });
  setMessages({ isLoading: false, isError: false, data: [merchantMessage] });

  const screen = await render(<UrbanConversationScreen threadId={THREAD_ID} />);

  await fireEvent.press(
    screen.getByRole('button', { name: strings.urbanConversation.send }),
  );

  expect(mutate).not.toHaveBeenCalled();
});

test('renders the linked deal card from the claim behind the thread', async () => {
  setThread(linkedThread);
  setClaim(linkedClaim);
  setMessages({ isLoading: false, isError: false, data: [merchantMessage] });

  const screen = await render(<UrbanConversationScreen threadId={THREAD_ID} />);

  expect(screen.getByText(strings.urbanConversation.activeDeal)).toBeTruthy();
  expect(screen.getByText('20% Off Prime Lunch Combo')).toBeTruthy();
  expect(screen.getByText('₦9,600')).toBeTruthy();
  expect(screen.getByText('₦12,000')).toBeTruthy();
  expect(
    screen.getByText(strings.urbanConversation.saveAmountFor('₦2,400')),
  ).toBeTruthy();
  expect(screen.getByText('VT-48F261')).toBeTruthy();
});

test('hides the deal card when the thread links no claim', async () => {
  setThread(thread);
  setClaim(undefined);
  setMessages({ isLoading: false, isError: false, data: [merchantMessage] });

  const screen = await render(<UrbanConversationScreen threadId={THREAD_ID} />);

  expect(screen.queryByText(strings.urbanConversation.activeDeal)).toBeNull();
});

test('only asks for a claim pass when the thread links one', async () => {
  setThread(thread);
  setClaim(undefined);
  setMessages({ isLoading: false, isError: false, data: [merchantMessage] });

  await render(<UrbanConversationScreen threadId={THREAD_ID} />);

  expect(useClaimPass).toHaveBeenCalledWith({ claimId: undefined, enabled: false });
});

test('the route claim is used before the cached thread catches up', async () => {
  setThread(thread);
  setClaim(linkedClaim);
  setMessages({ isLoading: false, isError: false, data: [merchantMessage] });

  await render(<UrbanConversationScreen threadId={THREAD_ID} claimId={CLAIM_ID} />);

  expect(useClaimPass).toHaveBeenCalledWith({ claimId: CLAIM_ID, enabled: true });
});

test('hands the claim id to the pass when viewing it', async () => {
  const onViewPass = jest.fn();
  setThread(linkedThread);
  setClaim(linkedClaim);
  setMessages({ isLoading: false, isError: false, data: [merchantMessage] });

  const screen = await render(
    <UrbanConversationScreen threadId={THREAD_ID} onViewPass={onViewPass} />,
  );

  fireEvent.press(screen.getByText(strings.urbanConversation.viewPass));

  expect(onViewPass).toHaveBeenCalledWith(CLAIM_ID);
});

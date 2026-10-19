import React from 'react';
import { Pressable } from 'react-native';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { UrbanConversationScreen } from '@features/merchantChat/screens/UrbanConversationScreen';
import { useOpenBusinessChat } from '@features/merchantChat/hooks/useOpenBusinessChat';
import { strings } from '@constants/strings';
import { queryClient } from '@store/queryClient';

const mockStart = jest.fn();
const mockGetThreads = jest.fn();

jest.mock('@api/messagingApi', () => ({
  messagingApi: {
    getCustomerThreads: (...args: unknown[]) => mockGetThreads(...args),
    uploadCustomerMedia: jest.fn(),
  },
}));

jest.mock('@features/merchantChat/hooks/useCustomerMessaging', () => ({
  customerMessagingKeys: {
    threads: (account?: string, branchId?: string) => [
      'cm',
      account,
      'threads',
      branchId,
    ],
  },
  useCustomerThreads: () => ({ data: [], isLoading: false, isError: false }),
  useCustomerThreadMessages: (threadId?: string) => ({
    data: threadId ? [] : undefined,
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
  }),
  useSendCustomerReply: () => ({ mutate: jest.fn() }),
  useStartCustomerConversation: () => ({ mutate: mockStart, isPending: false }),
  markCustomerThreadReadLocally: jest.fn(),
  useMarkCustomerThreadRead: () => ({ mutate: jest.fn() }),
}));

jest.mock('@features/myDeals/hooks/useMyClaims', () => ({
  useClaimPass: () => ({ claim: undefined }),
}));

const BRANCH = 'branch-1';
const copy = strings.urbanConversation;

beforeEach(() => {
  mockStart.mockReset();
  mockGetThreads.mockReset();
  queryClient.clear();
});

describe('In-App chat from a business profile', () => {
  function Probe({ onOpened }: { onOpened: jest.Mock }) {
    const { open } = useOpenBusinessChat(onOpened);
    // A plain button stands in for the profile's In-App action.
    return (
      <Pressable
        testID="in-app"
        onPress={() => open({ branchId: BRANCH, businessName: 'Aurora Grill' })}
      />
    );
  }

  it('reopens the existing chat with that branch', async () => {
    mockGetThreads.mockResolvedValue([{ id: 'thread-9', branchId: BRANCH }]);
    const onOpened = jest.fn();
    const view = await render(<Probe onOpened={onOpened} />);
    await act(async () => {
      fireEvent.press(view.getByTestId('in-app'));
    });
    await waitFor(() => expect(onOpened).toHaveBeenCalledWith({ threadId: 'thread-9' }));
    expect(mockGetThreads).toHaveBeenCalledWith({ branchId: BRANCH });
  });

  it('opens a new chat when the customer has never messaged the business', async () => {
    mockGetThreads.mockResolvedValue([]);
    const onOpened = jest.fn();
    const view = await render(<Probe onOpened={onOpened} />);
    await act(async () => {
      fireEvent.press(view.getByTestId('in-app'));
    });
    await waitFor(() =>
      expect(onOpened).toHaveBeenCalledWith({
        branchId: BRANCH,
        businessName: 'Aurora Grill',
      }),
    );
  });

  it('starts the thread with the first message, without sending anything first', async () => {
    const onThreadStarted = jest.fn();
    mockStart.mockImplementation(
      (_payload: unknown, handlers: { onSuccess: (m: { threadId: string }) => void }) =>
        handlers.onSuccess({ threadId: 'thread-new' }),
    );
    const view = await render(
      <UrbanConversationScreen
        newChat={{ branchId: BRANCH, businessName: 'Aurora Grill' }}
        onThreadStarted={onThreadStarted}
      />,
    );

    expect(view.getByText(copy.newChatTitle('Aurora Grill'))).toBeTruthy();
    expect(mockStart).not.toHaveBeenCalled();

    await act(async () => {
      fireEvent.changeText(
        view.getByLabelText(copy.inputLabel),
        'Hi, are you open today?',
      );
    });
    await act(async () => {
      fireEvent.press(view.getByLabelText(copy.send));
    });

    expect(mockStart).toHaveBeenCalledWith(
      { branchId: BRANCH, content: 'Hi, are you open today?', subjectType: 'GENERAL' },
      expect.any(Object),
    );
    expect(onThreadStarted).toHaveBeenCalledWith('thread-new');
    expect(view.queryByText(copy.newChatTitle('Aurora Grill'))).toBeNull();
  });
});

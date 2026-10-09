import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react-native';
import type { ChatMessage, ConversationThread } from '@api/messagingApi';
import { strings } from '@constants/strings';
import { BusinessTabNavigator } from '@navigation/BusinessTabNavigator';

afterEach(cleanup);

const { businessMessages: copy } = strings;
const { conversation } = copy;

const mockSendReplyMutate = jest.fn();

let mockThreads: ConversationThread[] = [];
let mockMessages: Record<string, ChatMessage[]> = {};

/**
 * The routes own the REST hooks; mocking them keeps this suite focused on
 * navigation and composition (one chat surface for every thread row).
 */
jest.mock('@features/business/hooks/useBusinessMessaging', () => ({
  ...jest.requireActual('@features/business/hooks/useBusinessMessaging'),
  useBusinessThreads: () => ({
    data: mockThreads,
    isSuccess: true,
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
  }),
  useBusinessThreadMessages: (threadId: string) => ({
    data: mockMessages[threadId] ?? [],
    isSuccess: true,
    isLoading: false,
  }),
  useSendBusinessReply: () => ({
    mutate: mockSendReplyMutate,
    isPending: false,
  }),
  useMarkBusinessThreadRead: () => ({ mutate: jest.fn() }),
}));

function message(
  id: string,
  threadId: string,
  content: string,
  direction: 'INBOUND' | 'OUTBOUND',
): ChatMessage {
  return {
    id,
    threadId,
    content,
    direction,
    status: 'SENT',
    channel: 'IN_HOUSE',
  } as ChatMessage;
}

function thread(id: string, firstName: string, preview: string): ConversationThread {
  return {
    id,
    customer: { id: `c-${id}`, firstName, lastName: 'Test' },
    lastMessageContent: preview,
    lastActivityAt: new Date().toISOString(),
    branchUnreadCount: 1,
    subjectType: 'GENERAL',
  } as ConversationThread;
}

beforeEach(() => {
  mockSendReplyMutate.mockClear();
  mockThreads = [
    thread('thread-sarah', 'Sarah', 'Hi, is the lunch combo still available?'),
    thread('thread-michael', 'Michael', 'Your order is ready for pickup.'),
  ];
  mockMessages = {
    'thread-sarah': [
      message('sarah-1', 'thread-sarah', 'Is the lunch combo available?', 'INBOUND'),
      message('sarah-2', 'thread-sarah', 'Yes, four vouchers remain today.', 'OUTBOUND'),
    ],
    'thread-michael': [
      message('michael-1', 'thread-michael', 'Where is my order?', 'INBOUND'),
    ],
  };
});

/**
 * Every thread row on the business Messages hub must land on ONE chat screen —
 * not a per-customer screen and not a dead tap. The thread id travels in route
 * params and selects the transcript, so every row shares a single surface.
 */
async function mountShell() {
  const warnings: string[] = [];
  const originalError = console.error;
  console.error = (...args: unknown[]) => {
    const text = args.map(a => (a instanceof Error ? a.message : String(a))).join(' ');
    if (text.includes('was not handled by any navigator')) warnings.push(text);
    originalError(...args);
  };

  // Mirror the real hierarchy: the shell is a `BusinessTabs` route of a parent.
  const Root = createNativeStackNavigator();
  await render(
    <NavigationContainer>
      <Root.Navigator screenOptions={{ headerShown: false }}>
        <Root.Screen name="BusinessTabs" component={BusinessTabNavigator} />
      </Root.Navigator>
    </NavigationContainer>,
  );

  return {
    warnings,
    restore: () => {
      console.error = originalError;
    },
  };
}

/** The Overview screen also has a "Messages" tile, so target the tab bar. */
async function openMessagesTab() {
  const matches = screen.getAllByLabelText(strings.businessShell.tabs.messages);
  await act(async () => {
    fireEvent.press(matches[matches.length - 1]);
  });
}

describe('business Messages hub opens a single conversation screen', () => {
  it('reaches the hub with live threads', async () => {
    const { restore } = await mountShell();
    try {
      await openMessagesTab();
      expect(screen.getAllByText(copy.title).length).toBeGreaterThan(0);
      expect(screen.getByText('Sarah Test')).toBeTruthy();
      expect(screen.getByText('Michael Test')).toBeTruthy();
    } finally {
      restore();
    }
  });

  it('opens the chat for the tapped thread with its header and messages', async () => {
    const { warnings, restore } = await mountShell();
    try {
      await openMessagesTab();

      await act(async () => {
        fireEvent.press(screen.getByLabelText('Sarah Test'));
      });

      expect(screen.getByText('Sarah Test')).toBeTruthy();
      expect(screen.getByText('Is the lunch combo available?')).toBeTruthy();
      expect(screen.getByText('Yes, four vouchers remain today.')).toBeTruthy();
      expect(warnings).toEqual([]);
    } finally {
      restore();
    }
  });

  it('keeps threads separate — each row loads its own transcript', async () => {
    const { restore } = await mountShell();
    try {
      await openMessagesTab();

      await act(async () => {
        fireEvent.press(screen.getByLabelText('Michael Test'));
      });

      expect(screen.getByText('Where is my order?')).toBeTruthy();
      expect(screen.queryByText('Is the lunch combo available?')).toBeNull();
    } finally {
      restore();
    }
  });

  it('sends a typed reply through the API hook and clears the composer', async () => {
    const { restore } = await mountShell();
    try {
      await openMessagesTab();
      await act(async () => {
        fireEvent.press(screen.getByLabelText('Sarah Test'));
      });

      await act(async () => {
        fireEvent.changeText(
          screen.getByLabelText(conversation.composerPlaceholder),
          'Table confirmed, see you at 7pm.',
        );
      });
      expect(screen.getByDisplayValue('Table confirmed, see you at 7pm.')).toBeTruthy();

      await act(async () => {
        fireEvent.press(screen.getByLabelText(conversation.sendHint));
      });

      expect(mockSendReplyMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          threadId: 'thread-sarah',
          payload: { content: 'Table confirmed, see you at 7pm.' },
        }),
      );
      expect(screen.queryByDisplayValue('Table confirmed, see you at 7pm.')).toBeNull();
    } finally {
      restore();
    }
  });

  it('quick replies fill the composer rather than sending on tap', async () => {
    const { restore } = await mountShell();
    try {
      await openMessagesTab();
      await act(async () => {
        fireEvent.press(screen.getByLabelText('Sarah Test'));
      });

      await act(async () => {
        fireEvent.press(screen.getByLabelText(conversation.quickReplies[0]));
      });
      expect(screen.getByDisplayValue(conversation.quickReplies[0])).toBeTruthy();
      expect(mockSendReplyMutate).not.toHaveBeenCalled();
    } finally {
      restore();
    }
  });

  it('returns to the Messages hub via the back control', async () => {
    const { warnings, restore } = await mountShell();
    try {
      await openMessagesTab();
      await act(async () => {
        fireEvent.press(screen.getByLabelText('Sarah Test'));
      });
      expect(screen.getByLabelText(conversation.transcriptLabel)).toBeTruthy();

      await act(async () => {
        fireEvent.press(screen.getByLabelText(strings.common.goBack));
      });
      expect(screen.getAllByText(copy.title).length).toBeGreaterThan(0);
      expect(screen.getByLabelText('Sarah Test')).toBeTruthy();
      expect(warnings).toEqual([]);
    } finally {
      restore();
    }
  });

  it('exposes a transcript label and composer for screen readers', async () => {
    const { restore } = await mountShell();
    try {
      await openMessagesTab();
      await act(async () => {
        fireEvent.press(screen.getByLabelText('Sarah Test'));
      });
      expect(screen.getByLabelText(conversation.transcriptLabel)).toBeTruthy();
      expect(screen.getByLabelText(conversation.composerPlaceholder)).toBeTruthy();
      expect(screen.getByText(conversation.quickRepliesLabel)).toBeTruthy();
    } finally {
      restore();
    }
  });
});

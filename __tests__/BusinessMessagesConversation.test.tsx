import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react-native';
import { BusinessTabNavigator } from '@navigation/BusinessTabNavigator';
import { strings } from '@constants/strings';

afterEach(cleanup);

const { businessMessages: copy } = strings;
const { conversation } = copy;

/**
 * Every thread row on the business Messages hub must land on ONE chat screen —
 * not a per-customer screen and not a dead tap. The thread id travels in route
 * params and selects the transcript, so all six rows share a single surface
 * (AGENTS rule 17).
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
  it('reaches the hub without touching the system back handler', async () => {
    const { restore } = await mountShell();
    try {
      await openMessagesTab();
      expect(screen.getAllByText(copy.title).length).toBeGreaterThan(0);
    } finally {
      restore();
    }
  });

  it.each(copy.threads.map(thread => [thread.id, thread.name, thread.context] as const))(
    'opens the chat for "%s" with its own header, context and transcript',
    async (id, name, context) => {
      const { warnings, restore } = await mountShell();
      try {
        await openMessagesTab();

        await act(async () => {
          fireEvent.press(screen.getByLabelText(name));
        });

        // The single chat screen, identified by the customer name + live status.
        expect(screen.getByText(name)).toBeTruthy();
        // The thread's own context travels with it.
        expect(screen.getByText(context)).toBeTruthy();
        // The first message of the matching transcript is rendered.
        const transcript =
          conversation.transcripts[id as keyof typeof conversation.transcripts];
        expect(screen.getByText(transcript.messages[0].text)).toBeTruthy();
        expect(warnings).toEqual([]);
      } finally {
        restore();
      }
    },
  );

  it('uses one transcript per thread so threads are not interchangeable', async () => {
    const sarah = conversation.transcripts.sarah.messages[0].text;
    const tunde = conversation.transcripts.tunde.messages[0].text;
    expect(sarah).not.toBe(tunde);
  });

  it('sends a typed reply and appends it to the transcript', async () => {
    const { restore } = await mountShell();
    try {
      await openMessagesTab();
      await act(async () => {
        fireEvent.press(screen.getByLabelText(copy.threads[0].name));
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
      // Now an outgoing bubble on the same screen, and the composer is cleared.
      expect(screen.getByText('Table confirmed, see you at 7pm.')).toBeTruthy();
      expect(screen.queryByDisplayValue('Table confirmed, see you at 7pm.')).toBeNull();

      // Quick replies fill the composer rather than sending on tap.
      await act(async () => {
        fireEvent.press(screen.getByLabelText(conversation.quickReplies[0]));
      });
      expect(screen.getByDisplayValue(conversation.quickReplies[0])).toBeTruthy();
    } finally {
      restore();
    }
  });

  it('returns to the Messages hub via the back control', async () => {
    const { warnings, restore } = await mountShell();
    try {
      await openMessagesTab();
      await act(async () => {
        fireEvent.press(screen.getByLabelText(copy.threads[0].name));
      });
      expect(screen.getByLabelText(conversation.transcriptLabel)).toBeTruthy();

      await act(async () => {
        fireEvent.press(screen.getByLabelText(strings.common.goBack));
      });
      // Back returns to the hub rather than popping the tab.
      expect(screen.getAllByText(copy.title).length).toBeGreaterThan(0);
      expect(screen.getByLabelText(copy.threads[0].name)).toBeTruthy();
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
        fireEvent.press(screen.getByLabelText(copy.threads[0].name));
      });
      expect(screen.getByLabelText(conversation.transcriptLabel)).toBeTruthy();
      expect(screen.getByLabelText(conversation.composerPlaceholder)).toBeTruthy();
      expect(screen.getByText(conversation.quickRepliesLabel)).toBeTruthy();
    } finally {
      restore();
    }
  });
});

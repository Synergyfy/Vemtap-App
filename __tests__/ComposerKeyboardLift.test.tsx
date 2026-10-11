import React from 'react';
import { DeviceEventEmitter } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';
import { ChatComposer } from '@features/merchantChat/components/ChatComposer';
import {
  COMPOSER_INNER_PADDING,
  composerLift,
  composerPaddingBottom,
  useKeyboardInset,
} from '@features/merchantChat/hooks/useKeyboardInset';

/**
 * The composer must sit above the keyboard while it is up, and must return to
 * the bottom the moment it closes.
 *
 * The reset is the part worth pinning: an earlier version measured the bar and
 * corrected itself from a deferred frame, which could be reapplied *after* the
 * keyboard had closed and leave the composer parked mid-screen. The lift is now
 * derived only from the keyboard height, so both halves zero together.
 */

const KEYBOARD_HEIGHT = 300;

function showKeyboard() {
  DeviceEventEmitter.emit('keyboardWillShow', {
    endCoordinates: { height: KEYBOARD_HEIGHT, screenY: 500 },
  });
}

function hideKeyboard() {
  DeviceEventEmitter.emit('keyboardWillHide', { endCoordinates: { height: 0 } });
}

type ComposerStyle = { marginBottom?: number; paddingBottom?: number };

/** Flatten the root's style array down to the values the tests assert on. */
const composerStyle = (element: { props: { style?: unknown } }): ComposerStyle => {
  const flat = Array.isArray(element.props.style)
    ? element.props.style.reduce(
        (acc: Record<string, unknown>, entry) => ({ ...acc, ...entry }),
        {},
      )
    : (element.props.style as Record<string, unknown>);
  return flat as ComposerStyle;
};

describe('composerPaddingBottom', () => {
  test('keeps only the inner padding while the keyboard is up', () => {
    // The home indicator is behind the keyboard, so it is not cleared twice.
    expect(composerPaddingBottom(true, 34)).toBe(COMPOSER_INNER_PADDING);
  });

  test('clears the home indicator at rest, never below the inner padding', () => {
    expect(composerPaddingBottom(false, 34)).toBe(34);
    expect(composerPaddingBottom(false, 0)).toBe(COMPOSER_INNER_PADDING);
  });
});

describe('composerLift', () => {
  test('is nothing while the keyboard is down', () => {
    expect(composerLift(0)).toBe(0);
  });

  test('is exactly the keyboard height, so the card meets it', () => {
    expect(composerLift(KEYBOARD_HEIGHT)).toBe(KEYBOARD_HEIGHT);
  });

  test('is exactly zero when the keyboard is down', () => {
    expect(composerLift(0)).toBe(0);
  });
});

/** Wires the real hook into the real composer, as both chat screens do. */
const TextField = ({
  keyboardInset,
  onKeyboardDismiss,
}: {
  keyboardInset: number;
  onKeyboardDismiss: () => void;
}) => (
  <ChatComposer
    testID="composer"
    value=""
    onChangeText={jest.fn()}
    onSend={jest.fn()}
    quickReplies={[]}
    onQuickReply={jest.fn()}
    placeholder="Message"
    inputAccessibilityLabel="Message"
    sendAccessibilityLabel="Send"
    attachAccessibilityLabel="Attach"
    cameraAccessibilityLabel="Camera"
    emojiAccessibilityLabel="Emoji"
    bottomInset={34}
    keyboardInset={keyboardInset}
    onKeyboardDismiss={onKeyboardDismiss}
  />
);

const Composer = ({ keyboardInset }: { keyboardInset: number }) => (
  <ChatComposer
    testID="composer"
    value=""
    onChangeText={jest.fn()}
    onSend={jest.fn()}
    quickReplies={[]}
    onQuickReply={jest.fn()}
    placeholder="Message"
    inputAccessibilityLabel="Message"
    sendAccessibilityLabel="Send"
    attachAccessibilityLabel="Attach"
    cameraAccessibilityLabel="Camera"
    emojiAccessibilityLabel="Emoji"
    bottomInset={34}
    keyboardInset={keyboardInset}
  />
);

describe('the composer through a keyboard session', () => {
  test('rests on the home indicator with no margin at all', async () => {
    const view = await render(<Composer keyboardInset={0} />);
    const style = () => composerStyle(view.getByTestId('composer'));

    expect(style().marginBottom).toBeUndefined();
    expect(style().paddingBottom).toBe(34);
  });

  test('lifts while the keyboard is up', async () => {
    const view = await render(<Composer keyboardInset={KEYBOARD_HEIGHT} />);
    const style = () => composerStyle(view.getByTestId('composer'));

    // The card's bottom edge sits directly on the keyboard.
    expect(style().marginBottom).toBe(KEYBOARD_HEIGHT);
    // The daylight is now inside the card, above that edge.
    expect(style().paddingBottom).toBe(COMPOSER_INNER_PADDING);
  });

  test('returns to the bottom when the keyboard closes', async () => {
    // Driven through the real hook, as on a device: the bug was that the lift
    // survived the keyboard closing.
    function Probe() {
      const { keyboardInset } = useKeyboardInset();
      return <Composer keyboardInset={keyboardInset} />;
    }

    const view = await render(<Probe />);
    const margin = () =>
      view.getByTestId('composer').props.style.at(-1).marginBottom;
    const padding = () =>
      view.getByTestId('composer').props.style.at(-1).paddingBottom;

    expect(margin()).toBeUndefined();
    await act(async () => showKeyboard());
    expect(margin()).toBe(KEYBOARD_HEIGHT);

    await act(async () => hideKeyboard());

    // Back at the bottom of the screen, on the home-indicator inset.
    expect(margin()).toBeUndefined();
    expect(padding()).toBe(34);
  });

  test('goes back up on a second keyboard session', async () => {
    function Probe() {
      const { keyboardInset } = useKeyboardInset();
      return (
        <ChatComposer
          testID="composer"
          value=""
          onChangeText={jest.fn()}
          onSend={jest.fn()}
          quickReplies={[]}
          onQuickReply={jest.fn()}
          placeholder="Message"
          inputAccessibilityLabel="Message"
          sendAccessibilityLabel="Send"
          attachAccessibilityLabel="Attach"
          cameraAccessibilityLabel="Camera"
          emojiAccessibilityLabel="Emoji"
          bottomInset={34}
          keyboardInset={keyboardInset}
        />
      );
    }

    const view = await render(<Probe />);
    const margin = () =>
      view.getByTestId('composer').props.style.at(-1).marginBottom;

    expect(margin()).toBeUndefined();
    await act(async () => showKeyboard());
    expect(margin()).toBe(KEYBOARD_HEIGHT);
    await act(async () => hideKeyboard());
    expect(margin()).toBeUndefined();
    await act(async () => showKeyboard());
    expect(margin()).toBe(KEYBOARD_HEIGHT);
  });
});

test('clears the lift when the input loses focus, without a keyboard event', async () => {
  // The iOS failure this guards: a gesture-dismissed keyboard can take it away
  // without emitting `keyboardWillHide`, so the only thing left to reset the
  // lift is the field losing focus.
  function Probe() {
    const { keyboardInset, dismissKeyboard } = useKeyboardInset();
    return <TextField keyboardInset={keyboardInset} onKeyboardDismiss={dismissKeyboard} />;
  }

  const view = await render(<Probe />);
  await act(async () => showKeyboard());
  expect(view.getByTestId('composer').props.style.at(-1).marginBottom).toBe(
    KEYBOARD_HEIGHT,
  );

  // No keyboardWillHide: just the blur a tap outside the field produces.
  await act(async () => {
    fireEvent(view.getByLabelText('Message'), 'blur');
  });

  expect(view.getByTestId('composer').props.style.at(-1).marginBottom).toBeUndefined();
});

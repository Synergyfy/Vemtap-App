import React from 'react';
import { DeviceEventEmitter, Dimensions, StyleSheet, Text } from 'react-native';
import { act, render } from '@testing-library/react-native';
import { ChatComposer } from '@features/merchantChat/components/ChatComposer';
import { COMPOSER_INNER_PADDING, useKeyboardInset } from '@features/merchantChat/hooks/useKeyboardInset';

/**
 * The composer is lifted by a measured inset rather than a
 * `KeyboardAvoidingView`, because the OS cannot be relied on to make room:
 * iOS never resizes the window, and Android only resizes it in a real build —
 * under Expo Go the window stays full height and the bar sits behind the
 * keyboard. These cover both outcomes, plus the case where the OS *has* already
 * resized and lifting again would open a gap.
 */

function Probe() {
  const { keyboardInset, isKeyboardVisible } = useKeyboardInset();
  return <Text testID="probe">{`${keyboardInset}|${isKeyboardVisible}`}</Text>;
}

const RESTING_HEIGHT = 800;
const KEYBOARD_HEIGHT = 320;

function keyboard(height: number) {
  DeviceEventEmitter.emit(
    'keyboardWillShow',
    // `endCoordinates.screenY` is what a real frame carries; the hook only
    // reads `height`, so the rest is filler for realism.
    { endCoordinates: { height, screenY: RESTING_HEIGHT - height } },
  );
}

afterEach(() => {
  jest.restoreAllMocks();
});

describe('useKeyboardInset', () => {
  it('lifts the composer by the keyboard height when the window does not resize', async () => {
    // The iOS / Expo Go case: the window is the same height with and without.
    jest.spyOn(Dimensions, 'get').mockReturnValue({ height: RESTING_HEIGHT } as never);

    const view = await render(<Probe />);
    expect(view.getByTestId('probe').props.children).toBe('0|false');

    await act(async () => keyboard(KEYBOARD_HEIGHT));
    expect(view.getByTestId('probe').props.children).toBe(`${KEYBOARD_HEIGHT}|true`);

    await act(async () => {
      DeviceEventEmitter.emit('keyboardWillHide', { endCoordinates: { height: 0 } });
    });
    expect(view.getByTestId('probe').props.children).toBe('0|false');
  });

  it('stands down when the window has already resized for the keyboard', async () => {
    // The standalone Android build case: `adjustResize` shrank the window, so
    // the layout reflowed on its own and lifting would double it.
    let windowHeight = RESTING_HEIGHT;
    jest.spyOn(Dimensions, 'get').mockImplementation(
      () => ({ height: windowHeight }) as never,
    );

    const view = await render(<Probe />);

    windowHeight = RESTING_HEIGHT - KEYBOARD_HEIGHT;
    await act(async () => keyboard(KEYBOARD_HEIGHT));

    expect(view.getByTestId('probe').props.children).toBe('0|true');
  });
});

describe('ChatComposer lift', () => {
  function composer(keyboardInset?: number) {
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

  const lifted = (view: Awaited<ReturnType<typeof render>>) =>
    StyleSheet.flatten(view.getByTestId('composer').props.style) as {
      marginBottom?: number;
      paddingBottom?: number;
    };

  it('rests on the home-indicator inset when no keyboard is up', async () => {
    const view = await render(composer());
    const style = lifted(view);

    expect(style.marginBottom).toBeUndefined();
    expect(style.paddingBottom).toBe(34);
  });

  it('is lifted by the inset and drops that inset once the keyboard is up', async () => {
    const view = await render(composer(KEYBOARD_HEIGHT));
    const style = lifted(view);

    // Lifted by exactly the keyboard's height, so the card's bottom edge sits
    // directly on top of the keyboard — no gap underneath.
    expect(style.marginBottom).toBe(KEYBOARD_HEIGHT);
    // The daylight is inside the card, above the keyboard. The home indicator
    // is behind the keyboard, so we clear it there instead.
    expect(style.paddingBottom).toBe(COMPOSER_INNER_PADDING);
  });
});
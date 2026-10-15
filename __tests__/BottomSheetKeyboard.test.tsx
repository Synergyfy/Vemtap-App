import React from 'react';
import { DeviceEventEmitter, Dimensions, Text, View } from 'react-native';
import { act, render } from '@testing-library/react-native';
import { BottomSheet } from '@components/shared/BottomSheet';

/**
 * The sheet lifts by the measured keyboard inset rather than through a
 * `KeyboardAvoidingView`, for the reasons documented in `useKeyboardInset`:
 * iOS never resizes the window, and Android only resizes it in a real build.
 *
 * These assert the two halves that matter — the sheet is *lifted* so its fields
 * clear the keys, and its height is *capped* so lifting it does not push the
 * header off the top of the window. A lift without the cap is the subtle half,
 * because it looks correct on a short prompt and clips on a tall one.
 */

const RESTING_HEIGHT = 800;
const KEYBOARD_HEIGHT = 320;

function keyboard(height: number) {
  DeviceEventEmitter.emit('keyboardWillShow', {
    endCoordinates: { height, screenY: RESTING_HEIGHT - height },
  });
}

afterEach(() => {
  jest.restoreAllMocks();
});

/** Depth-first search for the first node carrying `prop` in its style. */
function styleWithProp(node: unknown, prop: string): Record<string, unknown> | null {
  if (!node || typeof node !== 'object') return null;
  const record = node as { props?: { style?: unknown }; children?: unknown[] };
  // `toJSON()` nests everything under `props`, style included.
  const style = record.props?.style;
  const entries = Array.isArray(style) ? style.flat(20) : style ? [style] : [];
  for (const entry of entries) {
    if (entry && typeof entry === 'object' && prop in (entry as object)) {
      return entry as Record<string, unknown>;
    }
  }
  if (Array.isArray(record.children)) {
    for (const child of record.children) {
      const found = styleWithProp(child, prop);
      if (found) return found;
    }
  }
  return null;
}

/** The `translateY` the sheet is currently offset by, summed across its terms. */
function liftOf(node: unknown): number {
  const style = styleWithProp(node, 'transform') as
    { transform?: { translateY?: number }[] } | undefined;
  const transform = style?.transform ?? [];
  return transform.reduce((total, entry) => total + (entry?.translateY ?? 0), 0);
}

function renderSheet() {
  return (
    <BottomSheet visible onClose={() => undefined} title="Edit Location">
      <View>
        <Text>Location name</Text>
      </View>
    </BottomSheet>
  );
}

describe('BottomSheet keyboard avoidance', () => {
  it('rests at the bottom using a share of the window', async () => {
    jest.spyOn(Dimensions, 'get').mockReturnValue({ height: RESTING_HEIGHT } as never);

    const view = await render(renderSheet());
    expect(styleWithProp(view.toJSON(), 'maxHeight')?.maxHeight).toBe(
      RESTING_HEIGHT * 0.88,
    );
  });

  it('lifts by the keyboard height when the window does not resize', async () => {
    // The iOS / Expo Go case. Compared as a delta because the sheet also
    // carries its entry offset in the same transform, and that animation is not
    // what is under test here.
    jest.spyOn(Dimensions, 'get').mockReturnValue({ height: RESTING_HEIGHT } as never);

    const view = await render(renderSheet());
    const resting = liftOf(view.toJSON());
    await act(async () => keyboard(KEYBOARD_HEIGHT));

    expect(liftOf(view.toJSON()) - resting).toBe(-KEYBOARD_HEIGHT);
  });

  it('caps the height to what is left above the keyboard', async () => {
    jest.spyOn(Dimensions, 'get').mockReturnValue({ height: RESTING_HEIGHT } as never);

    const view = await render(renderSheet());
    await act(async () => keyboard(KEYBOARD_HEIGHT));

    // 800 - 320 leaves 480; without the cap the sheet would still be allowed
    // 704 and its header would sit 224px above the top of the window.
    expect(styleWithProp(view.toJSON(), 'maxHeight')?.maxHeight).toBe(
      RESTING_HEIGHT - KEYBOARD_HEIGHT,
    );
  });

  it('does not lift when the OS has already resized the window', async () => {
    // Android in a real build: the window shrinks, so lifting again would open
    // a gap between the sheet and the keyboard.
    const restingSpy = jest
      .spyOn(Dimensions, 'get')
      .mockReturnValue({ height: RESTING_HEIGHT } as never);
    const view = await render(renderSheet());
    const resting = liftOf(view.toJSON());

    restingSpy.mockReturnValue({ height: RESTING_HEIGHT - KEYBOARD_HEIGHT } as never);
    await act(async () => keyboard(KEYBOARD_HEIGHT));

    expect(liftOf(view.toJSON()) - resting).toBe(0);
  });

  it('drops the home-indicator inset while the keyboard is up', async () => {
    jest.spyOn(Dimensions, 'get').mockReturnValue({ height: RESTING_HEIGHT } as never);

    const view = await render(renderSheet());
    const resting = styleWithProp(view.toJSON(), 'paddingBottom')?.paddingBottom;
    await act(async () => keyboard(KEYBOARD_HEIGHT));
    const lifted = styleWithProp(view.toJSON(), 'paddingBottom')?.paddingBottom;

    // The inset is hidden behind the keyboard, so keeping it would only make
    // the sheet taller for no reason.
    expect(resting).toBeGreaterThanOrEqual(16);
    expect(lifted).toBe(16);
  });
});

/**
 * The regression these guard is iOS-specific and was reported in the field: a
 * swipe-down dismissal emits no `keyboardWillHide`, so the lift had nothing to
 * retract it and the sheet hung in mid-screen. The three cases below are the
 * three independent ways a dismissal can reach us.
 */
describe('BottomSheet survives a dismissal that emits no hide event', () => {
  it('returns to the bottom when only keyboardDidHide arrives', async () => {
    jest.spyOn(Dimensions, 'get').mockReturnValue({ height: RESTING_HEIGHT } as never);

    const view = await render(renderSheet());
    const resting = liftOf(view.toJSON());
    await act(async () => keyboard(KEYBOARD_HEIGHT));
    await act(async () =>
      DeviceEventEmitter.emit('keyboardDidHide', { endCoordinates: { height: 0 } }),
    );

    expect(liftOf(view.toJSON()) - resting).toBe(0);
  });

  it('returns to the bottom when iOS reports a non-zero height while hiding', async () => {
    // The dismissing frame can report the keyboard's own height; trusting it
    // would keep the lift applied.
    jest.spyOn(Dimensions, 'get').mockReturnValue({ height: RESTING_HEIGHT } as never);

    const view = await render(renderSheet());
    const resting = liftOf(view.toJSON());
    await act(async () => keyboard(KEYBOARD_HEIGHT));
    await act(async () =>
      DeviceEventEmitter.emit('keyboardWillHide', {
        endCoordinates: { height: KEYBOARD_HEIGHT },
      }),
    );

    expect(liftOf(view.toJSON()) - resting).toBe(0);
  });

  it('returns to the bottom when the keyboard is swiped away, emitting no hide event at all', async () => {
    jest.spyOn(Dimensions, 'get').mockReturnValue({ height: RESTING_HEIGHT } as never);

    const view = await render(renderSheet());
    const resting = liftOf(view.toJSON());
    await act(async () => keyboard(KEYBOARD_HEIGHT));
    // No hide event — only the settled frame the swipe produces.
    await act(async () =>
      DeviceEventEmitter.emit('keyboardDidChangeFrame', {
        endCoordinates: { height: 0 },
      }),
    );

    expect(liftOf(view.toJSON()) - resting).toBe(0);
    expect(styleWithProp(view.toJSON(), 'maxHeight')?.maxHeight).toBe(
      RESTING_HEIGHT * 0.88,
    );
  });
});

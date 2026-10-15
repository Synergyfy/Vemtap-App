import { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, Keyboard } from 'react-native';

export interface KeyboardInset {
  /**
   * How far a pinned composer must be lifted so the keyboard cannot cover it.
   * `0` when the OS has already made room by resizing the window.
   */
  keyboardInset: number;
  isKeyboardVisible: boolean;
  /**
   * Clears the lift from a signal other than a keyboard event.
   *
   * The input losing focus is the reliable one: iOS can dismiss the keyboard
   * *without* emitting `keyboardWillHide` when the dismissal is driven by a
   * gesture, which left the composer stuck mid-screen with a lift it had no
   * event to take back.
   */
  dismissKeyboard: () => void;
}

/** Sub-pixel slack so a resized window is not mistaken for a still one. */
const SHRINK_TOLERANCE_PX = 1;

/**
 * Breathing room inside the composer, between the input and the bar's bottom
 * edge. The bar is lifted so its bottom edge meets the keyboard exactly, so
 * this — not a gap underneath — is what keeps the field off the keys.
 */
export const COMPOSER_INNER_PADDING = 12;

/**
 * @param enabled Subscribe to keyboard events. Pass `false` for surfaces that
 *   are mounted but not on screen — a hidden bottom sheet has nothing to lift,
 *   and subscribing anyway meant every such sheet carried five listeners and
 *   re-rendered on every keyboard event it could not affect.
 */
export function useKeyboardInset(enabled = true): KeyboardInset {
  const [keyboardInset, setKeyboardInset] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  /**
   * Captured while the keyboard is *hidden*, never at show-time: on a resizing
   * Android build the window is already shorter by the time `keyboardDidShow`
   * fires, so anchoring there would compare the shrunk height against itself and
   * apply an inset that is already covered.
   */
  const restingHeight = useRef<number>(Dimensions.get('window').height);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const reset = () => {
      restingHeight.current = Dimensions.get('window').height;
      setIsKeyboardVisible(false);
      setKeyboardInset(0);
    };

    const handleFrame = (event: { endCoordinates?: { height?: number } }) => {
      const keyboardHeight = event.endCoordinates?.height ?? 0;
      if (keyboardHeight <= 0) {
        reset();
        return;
      }

      const windowHeight = Dimensions.get('window').height;
      const windowAlreadyResized =
        windowHeight < restingHeight.current - SHRINK_TOLERANCE_PX;

      setIsKeyboardVisible(true);
      setKeyboardInset(windowAlreadyResized ? 0 : keyboardHeight);
    };

    /**
     * Every hide signal resets outright rather than reading its reported
     * height. Two reasons: iOS may report a non-zero height on the dismissing
     * frame, and reading it would leave the lift applied; and a dismissal driven
     * by a gesture emits no `keyboardWillHide` at all, which is what used to
     * strand a pinned bar mid-screen with a lift nothing could take back.
     * Listening for both the `Will` and `Did` variants means a missed one is
     * covered by the other, and `DidChangeFrame` catches the interactive
     * dismissal that emits neither.
     */
    const subs = [
      Keyboard.addListener('keyboardWillShow', handleFrame),
      Keyboard.addListener('keyboardDidShow', handleFrame),
      Keyboard.addListener('keyboardWillHide', reset),
      Keyboard.addListener('keyboardDidHide', reset),
      // Settled frames only — `WillChangeFrame` fires mid-animation and would
      // report a partial height, making the lift flicker.
      Keyboard.addListener('keyboardDidChangeFrame', handleFrame),
    ];

    return () => {
      subs.forEach(sub => sub.remove());
    };
  }, [enabled]);

  const dismissKeyboard = useCallback(() => {
    setIsKeyboardVisible(false);
    setKeyboardInset(0);
  }, []);

  return { keyboardInset, isKeyboardVisible, dismissKeyboard };
}

/**
 * The bottom margin a composer carries while the keyboard is up — exactly the
 * keyboard's height, so the bar's bottom edge rests directly on top of it.
 *
 * All three chat surfaces go through this, and — critically — it is zeroed the
 * moment the keyboard closes, so the bar always returns to the bottom of the
 * screen.
 */
export function composerLift(keyboardInset: number): number {
  return keyboardInset > 0 ? keyboardInset : 0;
}

/**
 * Padding *inside* the composer's card.
 *
 * With the keyboard up the home indicator is behind it, so only the inner
 * padding applies; at rest the bar has to clear the home indicator instead.
 */
export function composerPaddingBottom(
  keyboardOpen: boolean,
  bottomInset: number,
): number {
  return keyboardOpen
    ? COMPOSER_INNER_PADDING
    : Math.max(bottomInset, COMPOSER_INNER_PADDING);
}

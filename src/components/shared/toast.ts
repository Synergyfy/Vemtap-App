import Toast from 'react-native-toast-message';
import { colors } from '@theme/colors';

/**
 * The app's popup surface, in one place.
 *
 * This used to be `uiStore.showToast` + a hand-rolled `ToastHost`, which had a
 * real bug behind it: nothing ever called the matching `hideToast`, so every
 * message stayed on screen for the life of the app. The library owns the
 * dismissal now, so a caller cannot forget it.
 *
 * Import from here rather than reaching for the library directly, so the tones,
 * the duration and the position stay consistent and can be changed in one edit.
 */

/** Matches the app's existing vocabulary — the old ToastHost accepted these. */
export type ToastKind = 'info' | 'success' | 'error';

/** Long enough to read a sentence, short enough not to block the screen. */
const VISIBILITY_MS = 3_000;

/**
 * Above the tab bar and the home indicator, and lifted when the keyboard is up
 * so a confirmation never hides behind the composer or covers what it is
 * confirming.
 */
const BOTTOM_OFFSET = 96;
const KEYBOARD_OFFSET = 16;

export interface ShowToastOptions {
  kind?: ToastKind;
  /** Overrides the default 3s for messages that need longer to read. */
  visibilityTime?: number;
}

/**
 * Map the app's tones onto the library's defaults, so a success/error/info
 * toast keeps the colour it always had instead of adopting the package's.
 */
const toneFor = (kind: ToastKind) => {
  switch (kind) {
    case 'success':
      return { backgroundColor: colors.success, textColor: colors.surface };
    case 'error':
      return { backgroundColor: colors.error, textColor: colors.surface };
    default:
      return { backgroundColor: colors.surfaceDark, textColor: colors.surface };
  }
};

export function showToast(message: string, kind: ToastKind = 'info'): void {
  const { backgroundColor, textColor } = toneFor(kind);
  Toast.show({
    type: kind,
    text1: message,
    position: 'bottom',
    visibilityTime: VISIBILITY_MS,
    bottomOffset: BOTTOM_OFFSET,
    keyboardOffset: KEYBOARD_OFFSET,
    props: { backgroundColor, textColor },
  });
}

export function showSuccess(message: string): void {
  showToast(message, 'success');
}

export function showError(message: string): void {
  showToast(message, 'error');
}

export function showInfo(message: string): void {
  showToast(message, 'info');
}

/** Dismiss early — e.g. when navigating away from whatever raised it. */
export function hideToast(): void {
  Toast.hide();
}

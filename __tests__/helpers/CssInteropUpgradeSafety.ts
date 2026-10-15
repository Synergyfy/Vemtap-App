import { fireEvent, render } from '@testing-library/react-native';

/**
 * The value `render()` resolves to. RNTL 14 types it inline and exports no
 * public alias, so it is derived here once.
 */
export type RenderedResult = Awaited<ReturnType<typeof render>>;

/**
 * Guards against the css-interop "upgrade" remount that closed the app when an
 * ID option was tapped on Verify Your Identity.
 *
 * `react-native-css-interop` derives its upgrade state from the *parsed rule
 * set* of a component's `className` (`native-interop.js:121` →
 * `render-component.js:38`): when a rule the first render did not have — an
 * `active:`/`hover:`/`focus:` pseudo-class, an `animation`, a `variables` entry
 * or a container — appears later, a `View` is swapped for a `Pressable`. React
 * sees a different element type and remounts the whole subtree, and in dev the
 * accompanying upgrade-warning serializer runs over that subtree's props.
 *
 * The way to make that unreachable is to stop changing `className` when state
 * changes: a `className` that is byte-identical in every state can never gain a
 * rule after the first render. State-dependent visuals therefore belong in the
 * plain `style` prop, which css-interop never re-parses.
 *
 * These helpers let a test assert exactly that invariant, so a regression fails
 * in CI instead of on a device.
 */

const CLASSNAME_KEY = 'className';

/** The NativeWind className of the component carrying `accessibilityLabel`. */
export function classNameOf(view: RenderedResult, label: string): string {
  const element = view.getByLabelText(label);
  return String(element.props[CLASSNAME_KEY] ?? '');
}

/** Flattens an RN style prop (array / nested / falsey) into one lookup object. */
export function flattenStyle(style: unknown): Record<string, unknown> {
  if (!style) return {};
  if (Array.isArray(style)) {
    return style.reduce<Record<string, unknown>>(
      (acc, entry) => ({ ...acc, ...flattenStyle(entry) }),
      {},
    );
  }
  return { ...(style as Record<string, unknown>) };
}

/**
 * Presses the component carrying `label`. `fireEvent.press` already wraps in
 * `act` in RNTL 14, so it is awaited directly rather than nested in another
 * `act` (which would trigger an "overlapping act() calls" warning).
 */
export async function press(view: RenderedResult, label: string): Promise<void> {
  await fireEvent.press(view.getByLabelText(label));
}

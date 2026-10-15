import React from 'react';
import { render } from '@testing-library/react-native';
import { SelectableRadioCard } from '@features/business/components/VerificationPrimitives';
import {
  classNameOf,
  flattenStyle,
  type RenderedResult,
} from '../../../../../__tests__/helpers/CssInteropUpgradeSafety';

/**
 * Guards the invariant that keeps the ID pickers on Verify Your Identity from
 * killing the app: `SelectableRadioCard`'s className must be byte-identical in
 * every state, with the state-dependent visuals (background, shadow, opacity)
 * carried in the plain `style` prop instead.
 *
 * A className that only gains a utility after the first render changes the
 * css-interop rule set, which makes it swap the element type and remount the
 * component — and in dev the accompanying upgrade-warning serializer runs over
 * the subtree's props. See `__tests__/helpers/CssInteropUpgradeSafety.ts`.
 *
 * Each card is exercised as *one mounted instance* being re-rendered across
 * states, because that transition is what actually crashed, not a fresh mount
 * per state.
 */
type Layout = 'inline' | 'grid' | 'stacked';

/** Re-renders a single card as `selected` flips, collecting every className seen. */
async function classNamesWhileFlipping(layout: Layout): Promise<Set<string>> {
  const build = (selected: boolean) => (
    <SelectableRadioCard
      layout={layout}
      icon="badge"
      title="Option"
      selected={selected}
      onPress={() => undefined}
    />
  );

  const view = await render(build(false));
  const seen = new Set<string>([classNameOf(view, 'Option')]);

  for (const next of [true, false, true]) {
    // Rerenders the *same* instance: the crash came from a re-render crossing
    // the css-interop rule-set boundary, not from a fresh mount per state.
    // eslint-disable-next-line no-await-in-loop -- rerender must settle between flips
    await view.rerender(build(next));
    seen.add(classNameOf(view, 'Option'));
  }

  return seen;
}

function styleOf(view: RenderedResult, label: string) {
  return flattenStyle(view.getByLabelText(label).props.style);
}

describe('SelectableRadioCard keeps a constant className across every state', () => {
  for (const layout of ['inline', 'grid', 'stacked'] as const) {
    it(`${layout} layout: toggling selection never changes the className`, async () => {
      const classNames = await classNamesWhileFlipping(layout);
      expect(classNames.size).toBe(1);
    });

    it(`${layout} layout: disabled is a style change, not a className change`, async () => {
      const build = (disabled: boolean) => (
        <SelectableRadioCard
          layout={layout}
          icon="badge"
          title="Option"
          selected={false}
          disabled={disabled}
          onPress={() => undefined}
        />
      );

      const enabled = await render(build(false));
      const disabled = await render(build(true));

      expect(classNameOf(enabled, 'Option')).toBe(classNameOf(disabled, 'Option'));
      expect(styleOf(disabled, 'Option')).toMatchObject({ opacity: 0.6 });
      expect(styleOf(enabled, 'Option').opacity).toBeUndefined();
    });
  }

  it('moves the selection surface into style rather than className', async () => {
    const build = (selected: boolean) => (
      <SelectableRadioCard
        layout="inline"
        icon="badge"
        title="Option"
        selected={selected}
        onPress={() => undefined}
      />
    );

    const selected = await render(build(true));
    const unselected = await render(build(false));

    // No state-bearing utility survives in the class string.
    for (const view of [selected, unselected]) {
      expect(classNameOf(view, 'Option')).not.toMatch(/(^|\s)(bg|shadow)-/);
    }

    // …and the two surfaces really are different at render time, so the
    // stability asserted above is not vacuous.
    expect(styleOf(selected, 'Option').backgroundColor).toBe('#F1F3FF');
    expect(styleOf(unselected, 'Option').backgroundColor).toBe('#FFFFFF');
  });
});

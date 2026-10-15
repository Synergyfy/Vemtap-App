import React from 'react';
import { render } from '@testing-library/react-native';
import { colors, shadowTokens } from '@theme/colors';
import { BusinessSegmentTabs } from '@features/business/components/BusinessOpsPrimitives';
import { BusinessSelectionChip } from '@features/business/components/BusinessPrimitives';
import {
  classNameOf,
  flattenStyle,
  type RenderedResult,
} from '../../../../../__tests__/helpers/CssInteropUpgradeSafety';

/**
 * Tapping a tab on Products And Services did nothing on device: selection
 * swapped `shadow-sm` / `active:` utilities through className, which makes
 * css-interop swap the Pressable's element type and remount it, losing the
 * press. Jest cannot see that (className does not resolve under this preset),
 * so these tests pin the invariant instead: className is identical in every
 * state, and selection lives in the plain `style` prop. See
 * `__tests__/helpers/CssInteropUpgradeSafety.ts`.
 */

const tabs = [
  { key: 'products', label: 'Products', count: 3 },
  { key: 'services', label: 'Services', count: 1 },
];

const styleOf = (view: RenderedResult, label: string) =>
  flattenStyle(view.getByLabelText(label).props.style);

describe('BusinessSegmentTabs keeps a constant className', () => {
  it('never changes a tab className as the selection moves', async () => {
    const build = (value: string) => (
      <BusinessSegmentTabs
        tabs={tabs}
        value={value}
        onChange={() => undefined}
        accessibilityLabel="Catalogue"
      />
    );
    const view = await render(build('products'));
    const products = new Set([classNameOf(view, 'Products')]);
    const services = new Set([classNameOf(view, 'Services')]);

    for (const next of ['services', 'products', 'services']) {
      // eslint-disable-next-line no-await-in-loop -- rerender must settle between flips
      await view.rerender(build(next));
      products.add(classNameOf(view, 'Products'));
      services.add(classNameOf(view, 'Services'));
    }

    expect(products.size).toBe(1);
    expect(services.size).toBe(1);
    expect(classNameOf(view, 'Services')).toBe(classNameOf(view, 'Products'));
  });

  it('carries the selected surface and shadow in style', async () => {
    const view = await render(
      <BusinessSegmentTabs
        tabs={tabs}
        value="services"
        onChange={() => undefined}
        accessibilityLabel="Catalogue"
      />,
    );
    expect(styleOf(view, 'Services')).toMatchObject({
      backgroundColor: colors.surface,
      shadowOpacity: shadowTokens.sm.shadowOpacity,
    });
    expect(styleOf(view, 'Products')).toMatchObject({
      backgroundColor: 'transparent',
      shadowOpacity: 0,
    });
  });
});

describe('BusinessSelectionChip keeps a constant className', () => {
  for (const tone of ['brand', 'neutral'] as const) {
    it(`${tone}: toggling selection never changes the className`, async () => {
      const build = (selected: boolean) => (
        <BusinessSelectionChip
          label="Drafts"
          tone={tone}
          selected={selected}
          onPress={() => undefined}
        />
      );
      const view = await render(build(false));
      const seen = new Set([classNameOf(view, 'Drafts')]);
      for (const next of [true, false, true]) {
        // eslint-disable-next-line no-await-in-loop -- rerender must settle between flips
        await view.rerender(build(next));
        seen.add(classNameOf(view, 'Drafts'));
      }
      expect(seen.size).toBe(1);
      expect(styleOf(view, 'Drafts').backgroundColor).toBe(
        tone === 'brand' ? colors.surfaceTint : colors.primary,
      );
    });
  }
});

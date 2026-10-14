import React from 'react';
import { render } from '@testing-library/react-native';
import { SelectableRadioCard } from '@features/business/components/VerificationPrimitives';

/**
 * A class that only appears after the first render (a shadow or opacity
 * utility gained on selection) makes css-interop upgrade the component, which
 * crashed the app on device when an ID option was tapped on Verify Your
 * Identity. Every state must therefore carry both utilities, so toggling
 * `selected` never crosses that boundary. See CssInteropUpgradeWarningSafety.
 */
const SHADOW = /(^|\s)shadow-(none|sm|md|lg)(\s|$)/;
const OPACITY = /(^|\s)opacity-\d+(\s|$)/;

function classesOf(element: { props: { className?: unknown } }): string {
  return String(element.props.className ?? '');
}

describe('SelectableRadioCard keeps shadow/opacity utilities in every state', () => {
  for (const layout of ['inline', 'grid', 'stacked'] as const) {
    for (const selected of [true, false]) {
      it(`${layout} layout, ${selected ? 'selected' : 'unselected'}`, async () => {
        const view = await render(
          <SelectableRadioCard
            layout={layout}
            icon="badge"
            title="Option"
            selected={selected}
            onPress={() => undefined}
          />,
        );
        const card = view.getByLabelText('Option');
        expect(classesOf(card)).toMatch(SHADOW);
        expect(classesOf(card)).toMatch(OPACITY);
      });
    }
  }
});

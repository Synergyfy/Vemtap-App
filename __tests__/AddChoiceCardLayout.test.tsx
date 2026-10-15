import React from 'react';
import { render } from '@testing-library/react-native';
import { AddChoiceCard } from '@features/business/components/BusinessSetupCards';

/**
 * A long "Create Product" / "Create Service" label must stay inside its card.
 *
 * The card itself has always carried `min-w-0 flex-1`, but that only constrains
 * the card — not what is laid out inside it. The title sat in a `flex-row` with
 * neither `min-w-0` nor a line limit, so that row measured the string at its full
 * natural width and the label spilled past the card's rounded edge.
 *
 * The line limit is the observable guard: without it React Native measures the
 * title at its natural width and the row overflows the card.
 */

const longTitle = 'Create A Really Long Localised Product Label';

describe('AddChoiceCard', () => {
  it('wraps a long title to two lines instead of widening the card', async () => {
    const view = await render(
      <AddChoiceCard icon="shoppingBag" title={longTitle} body="Body" tone="brand" />,
    );

    // Still fully labelled for a11y even though it is visually clipped.
    expect(view.getByLabelText(longTitle)).toBeTruthy();

    const title = view.getByText(longTitle);
    expect(title.props.numberOfLines).toBe(2);
  });

  it('caps the body copy so a long description cannot grow the card', async () => {
    const view = await render(
      <AddChoiceCard
        icon="shoppingBag"
        title="Create Product"
        body={longTitle}
        tone="brand"
      />,
    );
    expect(view.getByText(longTitle).props.numberOfLines).toBe(3);
  });

  it('accepts a caller className so callers can constrain it', async () => {
    const view = await render(
      <AddChoiceCard
        icon="autoAwesome"
        title="Create Service"
        body="Body"
        tone="tertiary"
        className="w-full"
      />,
    );
    expect(view.getByLabelText('Create Service').props.className).toContain('w-full');
  });
});

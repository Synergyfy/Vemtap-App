import React from 'react';
import { fireEvent, render, within } from '@testing-library/react-native';
import { AddServiceBasicsMediaScreen } from '@features/business/screens/AddServiceBasicsMediaScreen';
import { AddServiceDurationPricingScreen } from '@features/business/screens/AddServiceDurationPricingScreen';

type Rendered = Awaited<ReturnType<typeof render>>;
type Instance = Parameters<typeof within>[0];

function footerColumnFor(view: Rendered, transparentLabel: string): Instance {
  const transparent = view.getByText(transparentLabel);
  const { parent } = transparent;
  const column = parent?.parent;
  if (!column) throw new Error('Footer column not found');
  return column as Instance;
}

test('step 1 stacks the primary button above the transparent action', async () => {
  const onNext = jest.fn();
  const onSaveDraft = jest.fn();
  const view = await render(
    <AddServiceBasicsMediaScreen
      onBack={jest.fn()}
      onNext={onNext}
      onSaveDraft={onSaveDraft}
    />,
  );

  const column = footerColumnFor(view, 'Save as Draft & Exit');
  const { children } = column;

  expect(children).toHaveLength(2);
  expect(
    within(children[0] as Instance).getByText('Continue to Duration & Pricing'),
  ).toBeTruthy();
  expect(within(children[1] as Instance).getByText('Save as Draft & Exit')).toBeTruthy();
  expect(column.props.className).toContain('pb-3');

  await fireEvent.press(view.getByText('Continue to Duration & Pricing'));
  await fireEvent.press(view.getByText('Save as Draft & Exit'));
  expect(onNext).toHaveBeenCalledTimes(1);
  expect(onSaveDraft).toHaveBeenCalledTimes(1);
});

test('step 2 stacks the back button below the primary button', async () => {
  const onBack = jest.fn();
  const onNext = jest.fn();
  const view = await render(
    <AddServiceDurationPricingScreen onBack={onBack} onNext={onNext} />,
  );

  const column = footerColumnFor(view, 'Back to Step 1');
  const { children } = column;

  expect(children).toHaveLength(2);
  expect(
    within(children[0] as Instance).getByText('Continue to Branch Availability'),
  ).toBeTruthy();
  expect(within(children[1] as Instance).getByText('Back to Step 1')).toBeTruthy();

  await fireEvent.press(view.getByText('Back to Step 1'));
  expect(onBack).toHaveBeenCalled();
});

import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import { GiftDetailsSheet } from '@features/dealDetail/components/ClaimFlowSheets';
import { strings } from '@constants/strings';

const copy = strings.deals.claimFlow;
const deal = {
  title: 'Prime Lunch Combo',
  merchant: 'Aurora Grill',
  image: { uri: 'https://example.test/lunch.jpg' },
} as never;

async function renderSheet(onContinue = jest.fn()) {
  const view = await render(
    <GiftDetailsSheet visible onClose={jest.fn()} onContinue={onContinue} deal={deal} />,
  );
  return { view, onContinue };
}

async function fill(
  view: Awaited<ReturnType<typeof renderSheet>>['view'],
  values: Record<string, string>,
) {
  for (const [label, value] of Object.entries(values)) {
    // eslint-disable-next-line no-await-in-loop -- each change must settle in order
    await act(async () => {
      fireEvent.changeText(view.getByLabelText(label), value);
    });
  }
}

describe('Claim as a gift: recipient details are required', () => {
  it('blocks Continue with every field empty and says what is missing', async () => {
    const { view, onContinue } = await renderSheet();
    await act(async () => {
      fireEvent.press(view.getByText(copy.continue));
    });
    expect(onContinue).not.toHaveBeenCalled();
    expect(view.getByText(copy.firstNameRequired)).toBeTruthy();
    expect(view.getByText(copy.lastNameRequired)).toBeTruthy();
    expect(view.getByText(copy.emailRequired)).toBeTruthy();
    expect(view.getByText(copy.phoneRequired)).toBeTruthy();
  });

  it('rejects a malformed email and phone', async () => {
    const { view, onContinue } = await renderSheet();
    await fill(view, {
      [copy.firstName]: 'Amara',
      [copy.lastName]: 'Okafor',
      [copy.email]: 'amara@',
      [copy.phone]: '12',
    });
    await act(async () => {
      fireEvent.press(view.getByText(copy.continue));
    });
    expect(onContinue).not.toHaveBeenCalled();
    expect(view.getByText(copy.emailInvalid)).toBeTruthy();
    expect(view.getByText(copy.phoneInvalid)).toBeTruthy();
  });

  it('continues with trimmed details once everything is valid; the message stays optional', async () => {
    const { view, onContinue } = await renderSheet();
    await fill(view, {
      [copy.firstName]: ' Amara ',
      [copy.lastName]: 'Okafor',
      [copy.email]: 'amara@example.test ',
      [copy.phone]: '0801 234 5678',
    });
    await act(async () => {
      fireEvent.press(view.getByText(copy.continue));
    });
    expect(onContinue).toHaveBeenCalledWith({
      firstName: 'Amara',
      lastName: 'Okafor',
      email: 'amara@example.test',
      phone: '0801 234 5678',
      message: '',
    });
  });
});

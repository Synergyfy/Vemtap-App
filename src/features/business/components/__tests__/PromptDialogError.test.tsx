import React from 'react';
import { cleanup, fireEvent, render } from '@testing-library/react-native';
import { PromptDialog } from '@features/business/components/PromptDialog';

/**
 * The reason this exists: `PromptDialog` renders inside a `Modal`, and a toast
 * does not reliably paint above one. A rejected save therefore looked like it
 * had done nothing at all — the user saw the sheet unchanged and no message.
 * These pin the fix: the failure has to be visible *inside* the sheet.
 */

afterEach(cleanup);

const MESSAGE = 'Adding locations is not part of your current plan.';

const fields = [
  { key: 'name', label: 'Location name', value: '' },
  { key: 'address', label: 'Address', value: '' },
];

// `render` is awaited throughout this repo's suites — the returned queries are
// not present on the un-awaited value.
async function renderDialog(
  props: Partial<React.ComponentProps<typeof PromptDialog>> = {},
) {
  return render(
    <PromptDialog
      visible
      title="Add Location"
      fields={fields}
      confirmLabel="Create"
      onCancel={() => undefined}
      onConfirm={() => undefined}
      {...props}
    />,
  );
}

describe('PromptDialog inline error', () => {
  it('shows no banner until there is an error', async () => {
    const view = await renderDialog();

    expect(view.queryByText(MESSAGE)).toBeNull();
  });

  it('renders the failure inside the sheet, where the user is looking', async () => {
    const view = await renderDialog({ error: MESSAGE });

    expect(view.getByText(MESSAGE)).toBeTruthy();
    // Announced as an alert rather than merely coloured text, so it reaches a
    // screen reader too.
    expect(view.getByLabelText(MESSAGE)).toBeTruthy();
  });

  it('keeps the typed values when a save is rejected', async () => {
    // The reason the sheet stays open rather than closing: a rejected name must
    // not be thrown away.
    const view = await renderDialog({
      error: 'Could not add this location.',
      fields: [{ key: 'name', label: 'Location name', value: 'Maitama' }],
    });

    expect(view.getByLabelText('Location name').props.value).toBe('Maitama');
  });

  it('reports an edit so a stale error is cleared', async () => {
    const onChangeField = jest.fn();
    const view = await renderDialog({
      error: 'Could not add this location.',
      onChangeField,
    });

    fireEvent.changeText(view.getByLabelText('Location name'), 'Maitama');
    expect(onChangeField).toHaveBeenCalledWith('name');
  });

  it('still confirms and cancels while showing an error', async () => {
    // An error must not disable the actions — cancelling is the escape hatch,
    // and the merchant may simply want to fix the name and retry.
    const onConfirm = jest.fn();
    const onCancel = jest.fn();
    const view = await renderDialog({
      error: 'Could not add this location.',
      onConfirm,
      onCancel,
    });

    fireEvent.press(view.getByText('Create'));
    expect(onConfirm).toHaveBeenCalledTimes(1);

    fireEvent.press(view.getByText('Cancel'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});

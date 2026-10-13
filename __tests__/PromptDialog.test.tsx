import React, { useState } from 'react';
import { Pressable } from 'react-native';
import { cleanup, fireEvent, render, screen } from '@testing-library/react-native';
import { PromptDialog } from '@features/business/components/PromptDialog';

afterEach(cleanup);

describe('PromptDialog', () => {
  test('renders prefilled field values', async () => {
    await render(
      <PromptDialog
        visible
        title="Rename category"
        fields={[{ key: 'name', label: 'Name', value: 'Grills' }]}
        confirmLabel="Save"
        onCancel={jest.fn()}
        onConfirm={jest.fn()}
      />,
    );

    expect(screen.getByText('Rename category')).toBeTruthy();
    expect(screen.getByDisplayValue('Grills')).toBeTruthy();
  });

  test('confirm fires with the edited values', async () => {
    const onConfirm = jest.fn();
    await render(
      <PromptDialog
        visible
        title="Edit item"
        fields={[
          { key: 'name', label: 'Name', value: 'Ribeye' },
          {
            key: 'price',
            label: 'Price (₦)',
            value: '9600',
            keyboardType: 'decimal-pad',
          },
        ]}
        confirmLabel="Save"
        onCancel={jest.fn()}
        onConfirm={onConfirm}
      />,
    );

    await fireEvent.changeText(screen.getByLabelText('Name'), 'Ribeye Steak');
    await fireEvent.press(screen.getByText('Save'));

    expect(onConfirm).toHaveBeenCalledWith({
      name: 'Ribeye Steak',
      price: '9600',
    });
  });

  test('cancel fires onCancel without confirming', async () => {
    const onCancel = jest.fn();
    const onConfirm = jest.fn();
    await render(
      <PromptDialog
        visible
        title="Rename category"
        fields={[{ key: 'name', label: 'Name', value: 'Grills' }]}
        confirmLabel="Save"
        onCancel={onCancel}
        onConfirm={onConfirm}
      />,
    );

    await fireEvent.press(screen.getByText('Cancel'));
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  test('values reset when the dialog reopens for another row', async () => {
    function Harness() {
      const [open, setOpen] = useState(true);
      const [name, setName] = useState('Grills');
      return (
        <>
          <PromptDialog
            visible={open}
            title="Rename category"
            fields={[{ key: 'name', label: 'Name', value: name }]}
            confirmLabel="Save"
            onCancel={() => setOpen(false)}
            onConfirm={jest.fn()}
          />
          <Pressable
            testID="reopen-for-sides"
            onPress={() => {
              setName('Sides');
              setOpen(true);
            }}
          />
        </>
      );
    }
    await render(<Harness />);

    await fireEvent.changeText(screen.getByLabelText('Name'), 'Edited');
    await fireEvent.press(screen.getByText('Cancel'));
    await fireEvent.press(screen.getByTestId('reopen-for-sides'));

    expect(screen.getByDisplayValue('Sides')).toBeTruthy();
  });
});

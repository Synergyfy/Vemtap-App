import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { CategoryReorderSheet } from '@features/business/components/CategoryReorderSheet';

const mockCategories = [
  { id: 'cat-1', name: 'Food' },
  { id: 'cat-2', name: 'Drinks' },
  { id: 'cat-3', name: 'Desserts' },
];

async function renderSheet(props = {}) {
  return render(
    <CategoryReorderSheet
      visible={true}
      categories={mockCategories}
      onClose={jest.fn()}
      onSubmit={jest.fn()}
      {...props}
    />,
  );
}

describe('CategoryReorderSheet', () => {
  test('renders all categories with move buttons', async () => {
    await renderSheet();
    expect(screen.getByText('Food')).toBeTruthy();
    expect(screen.getByText('Drinks')).toBeTruthy();
    expect(screen.getByText('Desserts')).toBeTruthy();
    expect(screen.getByTestId('moveUp:cat-1')).toBeTruthy();
    expect(screen.getByTestId('moveDown:cat-1')).toBeTruthy();
    expect(screen.getByTestId('moveUp:cat-3')).toBeTruthy();
    expect(screen.getByTestId('moveDown:cat-3')).toBeTruthy();
  });

  test('moveUp is disabled for first item and moveDown for last', async () => {
    await renderSheet();
    expect(screen.getByTestId('moveUp:cat-1')).toBeDisabled();
    expect(screen.getByTestId('moveDown:cat-3')).toBeDisabled();
  });

  test('pressing moveDown swaps order and calls onSubmit', async () => {
    const onSubmit = jest.fn();
    await renderSheet({ onSubmit });
    await fireEvent.press(screen.getByTestId('moveDown:cat-1'));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(['cat-2', 'cat-1', 'cat-3']),
    );
  });

  test('onClose is called when Cancel or Done is pressed', async () => {
    const onClose = jest.fn();
    const { getByText } = await renderSheet({ onClose });
    await fireEvent.press(getByText('Cancel'));
    expect(onClose).toHaveBeenCalled();
    await fireEvent.press(getByText('Done'));
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});

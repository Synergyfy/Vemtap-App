import React, { useState } from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import { SearchClearButton } from '@components/ui/SearchClearButton';

const Host = () => {
  const [show, setShow] = useState(true);
  if (!show) return null;
  return <SearchClearButton onClear={() => setShow(false)} />;
};

test('clear button disappears when pressed', async () => {
  await render(<Host />);
  expect(screen.getByLabelText('Clear search input')).toBeTruthy();

  await act(async () => {
    await fireEvent.press(screen.getByLabelText('Clear search input'));
  });

  expect(screen.queryByLabelText('Clear search input')).toBeNull();
});

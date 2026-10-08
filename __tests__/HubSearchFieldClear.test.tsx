import React, { useState } from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import { HubSearchField } from '@features/accountHub/components/HubPrimitives';
import { strings } from '@constants/strings';

const HubFieldHost = () => {
  const [value, setValue] = useState('');
  return (
    <HubSearchField
      value={value}
      onChangeText={setValue}
      placeholder={strings.savedHub.searchPlaceholder}
      filterLabel={strings.home.filter}
      onFilter={jest.fn()}
    />
  );
};

test('clear button works in HubSearchField', async () => {
  await render(<HubFieldHost />);
  await act(async () => {
    await fireEvent.changeText(
      screen.getByLabelText(strings.savedHub.searchPlaceholder),
      'glow',
    );
  });
  expect(screen.getByLabelText('Clear search input')).toBeTruthy();

  await act(async () => {
    await fireEvent.press(screen.getByLabelText('Clear search input'));
  });

  expect(screen.queryByLabelText('Clear search input')).toBeNull();
});

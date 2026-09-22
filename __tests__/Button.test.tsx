import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Button } from '@components/ui/Button';

describe('Button', () => {
  it('renders the label', async () => {
    await render(<Button label="Continue" />);
    expect(screen.getByText('Continue')).toBeTruthy();
  });

  it('calls onPress when tapped', async () => {
    const onPress = jest.fn();
    await render(<Button label="Tap me" onPress={onPress} />);
    fireEvent.press(screen.getByText('Tap me'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', async () => {
    const onPress = jest.fn();
    await render(<Button label="Disabled" onPress={onPress} disabled />);
    fireEvent.press(screen.getByText('Disabled'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('shows a spinner and blocks press while loading', async () => {
    const onPress = jest.fn();
    await render(<Button label="Busy" onPress={onPress} loading />);
    expect(screen.getByLabelText('Loading')).toBeTruthy();
    fireEvent.press(screen.getByLabelText('Loading'));
    expect(onPress).not.toHaveBeenCalled();
  });
});

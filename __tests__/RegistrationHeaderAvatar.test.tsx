import React from 'react';
import { render } from '@testing-library/react-native';
import { RegistrationHeader } from '@components/auth/RegistrationHeader';
import { useAuthStore } from '@store/authStore';

describe('auth header avatar', () => {
  afterEach(() =>
    useAuthStore.setState({ status: 'unauthenticated', user: null } as never),
  );

  it('shows no "VM" circle on sign-in and sign-up screens', async () => {
    useAuthStore.setState({ status: 'unauthenticated', user: null } as never);
    const view = await render(<RegistrationHeader title="Sign in" onBack={jest.fn()} />);
    expect(view.queryByText('VM')).toBeNull();
  });

  it('still shows the signed-in user’s initials', async () => {
    useAuthStore.setState({
      status: 'authenticated',
      user: { firstName: 'Ada', lastName: 'Obi' },
    } as never);
    const view = await render(<RegistrationHeader title="Profile" onBack={jest.fn()} />);
    expect(view.getByText('AO')).toBeTruthy();
  });
});

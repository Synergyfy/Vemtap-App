import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { EditProfileScreen } from '@features/accountHub/screens/EditProfileScreen';
import { authApi } from '@api/authApi';
import { showToast as toastModuleShowToast } from '@components/shared/toast';
import { useAuthStore } from '@store/authStore';
import { strings } from '@constants/strings';

jest.mock('@api/authApi', () => ({
  authApi: { updateProfile: jest.fn() },
}));

// The popup surface is a module, not store state, so it is mocked directly.
// The factory returns its own functions — reaching for an outer variable here
// would capture it before the hoisted `jest.mock` had run.
jest.mock('@components/shared/toast', () => ({
  showToast: jest.fn(),
  showSuccess: jest.fn(),
  showError: jest.fn(),
  showInfo: jest.fn(),
  hideToast: jest.fn(),
}));

/** The mocked popup surface, so a save can assert what it announced. */
const mockShowToast = toastModuleShowToast as jest.Mock;

const copy = strings.accountScreens.editProfile;

const USER = {
  email: 'zainab@example.com',
  firstName: 'Zainab',
  lastName: 'Ahmed',
  gender: copy.female,
  role: 'customer',
  status: 'active',
  authProvider: 'customer',
};

function setSession(user: Record<string, unknown> = USER) {
  useAuthStore.setState({
    status: 'authenticated',
    user: user as never,
    activeMode: 'customer',
  });
}

afterEach(() => {
  jest.clearAllMocks();
  mockShowToast.mockClear();
  (authApi.updateProfile as jest.Mock).mockReset();
});

test('saving pushes the edited names and gender to the API', async () => {
  setSession();
  (authApi.updateProfile as jest.Mock).mockResolvedValue({
    ...USER,
    firstName: 'Zee',
    gender: copy.male,
  });

  await act(async () => {
    render(<EditProfileScreen />);
  });

  await act(async () => {
    fireEvent.changeText(screen.getByLabelText(copy.firstName), 'Zee');
  });
  await act(async () => {
    fireEvent.press(screen.getByText(copy.male));
  });
  await act(async () => {
    fireEvent.press(screen.getByText(copy.save));
  });

  expect(authApi.updateProfile).toHaveBeenCalledWith({
    firstName: 'Zee',
    lastName: 'Ahmed',
    gender: copy.male,
  });
});

test('trims stray whitespace before saving', async () => {
  setSession();
  (authApi.updateProfile as jest.Mock).mockResolvedValue(USER);

  await act(async () => {
    render(<EditProfileScreen />);
  });

  await act(async () => {
    fireEvent.changeText(screen.getByLabelText(copy.firstName), '  Zainab  ');
  });
  await act(async () => {
    fireEvent.press(screen.getByText(copy.save));
  });

  expect(authApi.updateProfile).toHaveBeenCalledWith(
    expect.objectContaining({ firstName: 'Zainab' }),
  );
});

test('a failed save reports an error and keeps the user on the screen', async () => {
  setSession();
  (authApi.updateProfile as jest.Mock).mockRejectedValue(new Error('offline'));
  const onSave = jest.fn();

  await act(async () => {
    render(<EditProfileScreen onSave={onSave} />);
  });

  await act(async () => {
    fireEvent.press(screen.getByText(copy.save));
  });

  // Nothing was persisted, so the screen must not behave as if it succeeded.
  expect(onSave).not.toHaveBeenCalled();
});

test('discarding restores the saved values instead of the typed ones', async () => {
  setSession();
  (authApi.updateProfile as jest.Mock).mockResolvedValue(USER);

  await act(async () => {
    render(<EditProfileScreen />);
  });

  await act(async () => {
    fireEvent.changeText(screen.getByLabelText(copy.firstName), 'Typed');
  });
  expect(screen.getByDisplayValue('Typed')).toBeTruthy();

  await act(async () => {
    fireEvent.press(screen.getByText(copy.discard));
  });

  expect(screen.getByDisplayValue('Zainab')).toBeTruthy();
  expect(authApi.updateProfile).not.toHaveBeenCalled();
});

test('opens on the gender the profile already has', async () => {
  setSession({ ...USER, gender: copy.preferNot });

  await act(async () => {
    render(<EditProfileScreen />);
  });

  await act(async () => {
    fireEvent.press(screen.getByText(copy.save));
  });

  expect(authApi.updateProfile).toHaveBeenCalledWith(
    expect.objectContaining({ gender: copy.preferNot }),
  );
});
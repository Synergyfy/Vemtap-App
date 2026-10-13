import { act, renderHook } from '@testing-library/react-native';
import { useAuthStore } from '@store/authStore';
import { useSwitchRole } from '@features/auth/hooks/useSwitchRole';
import { useOpenBusinessSetup } from '@features/business/hooks/useOpenBusinessSetup';

const mockNavigation = { navigate: jest.fn() };
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
}));

const mockMutate = jest.fn();
jest.mock('@features/auth/hooks/useSwitchRole', () => ({
  useSwitchRole: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
  (useSwitchRole as jest.Mock).mockReturnValue({ mutate: mockMutate });
  useAuthStore.setState({ ownerAccount: false });
});

test('opens the business setup wizard for accounts with no owner side', async () => {
  const { result } = await renderHook(() => useOpenBusinessSetup());

  await act(async () => {
    result.current();
  });

  expect(mockNavigation.navigate).toHaveBeenCalledWith('BusinessSetup');
  expect(mockMutate).not.toHaveBeenCalled();
});

test('switches to the business side for dual-role owners', async () => {
  useAuthStore.setState({ ownerAccount: true });
  mockMutate.mockImplementation((_mode: string, options: { onSuccess: () => void }) =>
    options.onSuccess(),
  );
  const { result } = await renderHook(() => useOpenBusinessSetup());

  await act(async () => {
    result.current();
  });

  expect(mockMutate).toHaveBeenCalledWith(
    'business',
    expect.objectContaining({ onSuccess: expect.any(Function) }),
  );
  expect(mockNavigation.navigate).toHaveBeenCalledWith('BusinessTabs', {
    screen: 'BusinessOverview',
  });
});

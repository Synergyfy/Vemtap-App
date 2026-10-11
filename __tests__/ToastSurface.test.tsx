import Toast from 'react-native-toast-message';
import { showToast, showError, showSuccess, hideToast } from '@components/shared/toast';
import { colors } from '@theme/colors';

jest.mock('react-native-toast-message', () => ({
  __esModule: true,
  default: { show: jest.fn(), hide: jest.fn() },
}));

const show = Toast.show as jest.Mock;
const hide = Toast.hide as jest.Mock;

beforeEach(() => {
  show.mockClear();
  hide.mockClear();
});

test('passes the duration and position the app expects', () => {
  showToast('Profile updated');

  // The bug this replaced: the old surface had no dismissal at all, so the
  // message stayed for the life of the session. The duration is what makes the
  // library clear it.
  expect(show).toHaveBeenCalledWith(
    expect.objectContaining({
      text1: 'Profile updated',
      position: 'bottom',
      visibilityTime: 3_000,
    }),
  );
});

test('keeps the app tone for each kind', () => {
  showSuccess('Saved');
  showError('Could not save');

  expect(show).toHaveBeenNthCalledWith(
    1,
    expect.objectContaining({
      type: 'success',
      props: expect.objectContaining({ backgroundColor: colors.success }),
    }),
  );
  expect(show).toHaveBeenNthCalledWith(
    2,
    expect.objectContaining({
      type: 'error',
      props: expect.objectContaining({ backgroundColor: colors.error }),
    }),
  );
});

test('can be dismissed early', () => {
  hideToast();
  expect(hide).toHaveBeenCalledTimes(1);
});
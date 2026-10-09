import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import { BusinessAccountCredentialsScreen } from '@features/business/screens/BusinessAccountCredentialsScreen';
import { businessProfileCopy as copy } from '@features/business/businessCopy';

/** The password field's visibility toggle shares its accessibility label. */
const passwordInput = (screen: Awaited<ReturnType<typeof render>>, label: string) =>
  screen.getAllByLabelText(label)[0];

test('create mode submits the typed email and matching strong password', async () => {
  const onContinue = jest.fn();
  const screen = await render(
    <BusinessAccountCredentialsScreen
      initialEmail="owner@urbangrill.ng"
      onContinue={onContinue}
    />,
  );

  await act(async () => {
    fireEvent.changeText(
      passwordInput(screen, copy.accountSetup.create.passwordLabel),
      'SecurePass1!',
    );
  });
  await act(async () => {
    fireEvent.changeText(
      screen.getByLabelText(copy.accountSetup.create.confirmLabel),
      'SecurePass1!',
    );
  });
  await act(async () => {
    fireEvent.press(screen.getByText(copy.accountSetup.create.continue));
  });

  expect(onContinue).toHaveBeenCalledWith({
    email: 'owner@urbangrill.ng',
    password: 'SecurePass1!',
  });
});

test('create mode refuses mismatched passwords before calling the API', async () => {
  const onContinue = jest.fn();
  const screen = await render(
    <BusinessAccountCredentialsScreen
      initialEmail="owner@urbangrill.ng"
      onContinue={onContinue}
    />,
  );

  await act(async () => {
    fireEvent.changeText(
      passwordInput(screen, copy.accountSetup.create.passwordLabel),
      'SecurePass1!',
    );
  });
  await act(async () => {
    fireEvent.changeText(
      screen.getByLabelText(copy.accountSetup.create.confirmLabel),
      'SecurePass2!',
    );
  });
  await act(async () => {
    fireEvent.press(screen.getByText(copy.accountSetup.create.continue));
  });

  expect(onContinue).not.toHaveBeenCalled();
  expect(screen.getByText(copy.accountSetup.create.errors.passwordMismatch)).toBeTruthy();
});

test('create mode refuses a weak password', async () => {
  const onContinue = jest.fn();
  const screen = await render(
    <BusinessAccountCredentialsScreen
      initialEmail="owner@urbangrill.ng"
      onContinue={onContinue}
    />,
  );

  await act(async () => {
    fireEvent.changeText(
      passwordInput(screen, copy.accountSetup.create.passwordLabel),
      'weak',
    );
  });
  await act(async () => {
    fireEvent.press(screen.getByText(copy.accountSetup.create.continue));
  });

  expect(onContinue).not.toHaveBeenCalled();
  expect(screen.getByText(copy.accountSetup.create.errors.passwordWeak)).toBeTruthy();
});

test('confirm mode asks only for the existing password', async () => {
  const onContinue = jest.fn();
  const screen = await render(
    <BusinessAccountCredentialsScreen
      mode="confirm"
      initialEmail="customer@example.com"
      onContinue={onContinue}
    />,
  );

  expect(screen.queryByLabelText(copy.accountSetup.create.confirmLabel)).toBeNull();

  await act(async () => {
    fireEvent.press(screen.getByText(copy.accountSetup.confirm.continue));
  });
  expect(
    screen.getByText(copy.accountSetup.confirm.errors.passwordRequired),
  ).toBeTruthy();
  expect(onContinue).not.toHaveBeenCalled();

  await act(async () => {
    fireEvent.changeText(
      passwordInput(screen, copy.accountSetup.confirm.passwordLabel),
      'MyPassword1!',
    );
  });
  await act(async () => {
    fireEvent.press(screen.getByText(copy.accountSetup.confirm.continue));
  });

  expect(onContinue).toHaveBeenCalledWith({
    email: 'customer@example.com',
    password: 'MyPassword1!',
  });
});

test('confirm mode labels the credential as password / PIN', async () => {
  const screen = await render(
    <BusinessAccountCredentialsScreen
      mode="confirm"
      initialEmail="customer@example.com"
    />,
  );

  expect(screen.getByText(copy.accountSetup.confirm.passwordLabel)).toBeTruthy();
});

test('passwordless (Google) confirm mode skips the password entirely', async () => {
  const onContinue = jest.fn();
  const screen = await render(
    <BusinessAccountCredentialsScreen
      mode="confirm"
      initialEmail="glow@gmail.com"
      passwordlessAccount
      onContinue={onContinue}
    />,
  );

  expect(screen.queryByLabelText(copy.accountSetup.confirm.passwordLabel)).toBeNull();
  expect(screen.queryByText(copy.accountSetup.confirm.forgotPassword)).toBeNull();
  expect(screen.getByText(copy.accountSetup.confirm.googleHint)).toBeTruthy();

  await act(async () => {
    fireEvent.press(screen.getByText(copy.accountSetup.confirm.continueGoogle));
  });

  expect(onContinue).toHaveBeenCalledWith({
    email: 'glow@gmail.com',
    password: '',
  });
});

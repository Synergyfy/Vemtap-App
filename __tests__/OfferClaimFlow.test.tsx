import React from 'react';
import { Text } from 'react-native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { useOfferClaim } from '@features/dealDetail/hooks/useOfferClaim';
import { claimApi } from '@api/claimApi';
import { ApiError } from '@api/ApiError';

/**
 * Claiming a real offer.
 *
 * The behaviour these lock in: a claim only becomes real once the API has
 * verified the emailed code and issued a claim code. The screen used to set
 * `claimed` locally and jump to a success page for any offer, so a user could
 * "claim" a promotion that was never issued.
 */

jest.mock('@api/claimApi', () => ({
  claimApi: {
    requestClaimOtp: jest.fn(),
    verifyClaim: jest.fn(),
  },
}));

jest.mock('@utils/logger', () => ({
  logger: { warn: jest.fn(), info: jest.fn(), error: jest.fn(), debug: jest.fn() },
}));

const OFFER = 'aa90831c-4837-4fdd-bbc4-4445ba041284';
const IDENTITY = {
  firstName: 'Ada',
  lastName: 'Nwosu',
  email: 'ada@example.test',
  phone: '+2348012345678',
};

function Probe({ offerId = OFFER }: { offerId?: string }) {
  const { status, requestCode, submitCode } = useOfferClaim(offerId);
  return (
    <>
      <Text testID="phase">{status.phase}</Text>
      <Text testID="claimCode">{status.phase === 'claimed' ? status.claimCode : ''}</Text>
      <Text testID="message">{status.phase === 'error' ? status.message : ''}</Text>
      <Text testID="request" onPress={() => void requestCode(IDENTITY)}>
        request
      </Text>
      <Text testID="submit" onPress={() => void submitCode('1234')}>
        submit
      </Text>
    </>
  );
}

const press = async (testID: string) => {
  await fireEvent.press(screen.getByTestId(testID));
};

let screen: Awaited<ReturnType<typeof render>>;

beforeEach(() => {
  jest.clearAllMocks();
  (claimApi.requestClaimOtp as jest.Mock).mockResolvedValue(undefined);
  (claimApi.verifyClaim as jest.Mock).mockResolvedValue({
    message: 'Claim created',
    claim: {
      id: 'claim-1',
      claimCode: 'VT-4F2G1',
      expiresAt: '2026-11-01T00:00:00.000Z',
      status: 'active',
    },
  });
});

describe('useOfferClaim', () => {
  test('a claim is only real after the server verifies the code', async () => {
    screen = await render(<Probe />);

    await press('request');
    await waitFor(() =>
      expect(screen.getByTestId('phase').props.children).toBe('awaitingCode'),
    );
    expect(claimApi.requestClaimOtp).toHaveBeenCalledWith({
      offerId: OFFER,
      ...IDENTITY,
    });

    await press('submit');
    await waitFor(() =>
      expect(screen.getByTestId('phase').props.children).toBe('claimed'),
    );

    // The claim code is the server's, not a local placeholder.
    expect(screen.getByTestId('claimCode').props.children).toBe('VT-4F2G1');
    expect(claimApi.verifyClaim).toHaveBeenCalledWith({
      email: IDENTITY.email,
      offerId: OFFER,
      code: '1234',
    });
  });

  test('never claims when the code is rejected', async () => {
    (claimApi.verifyClaim as jest.Mock).mockRejectedValue(
      new ApiError('Invalid OTP', { status: 400 }),
    );

    screen = await render(<Probe />);
    await press('request');
    await waitFor(() =>
      expect(screen.getByTestId('phase').props.children).toBe('awaitingCode'),
    );

    await press('submit');
    await waitFor(() => expect(screen.getByTestId('phase').props.children).toBe('error'));

    expect(screen.getByTestId('claimCode').props.children).toBe('');
  });

  test('surfaces the server wording for a rejected code', async () => {
    (claimApi.verifyClaim as jest.Mock).mockRejectedValue(
      new ApiError('Invalid OTP', { status: 400 }),
    );

    screen = await render(<Probe />);
    await press('request');
    await waitFor(() =>
      expect(screen.getByTestId('phase').props.children).toBe('awaitingCode'),
    );

    await press('submit');
    await waitFor(() =>
      expect(screen.getByTestId('message').props.children).toBe('Invalid OTP'),
    );
  });

  test('a server fault does not leak its internals to the user', async () => {
    (claimApi.requestClaimOtp as jest.Mock).mockRejectedValue(
      new ApiError('Internal server error: pool exhausted at db:5432', { status: 500 }),
    );

    screen = await render(<Probe />);
    await press('request');
    await waitFor(() => expect(screen.getByTestId('phase').props.children).toBe('error'));

    // A 500's internals must never reach the user.
    expect(screen.getByTestId('message').props.children).not.toMatch(/pool exhausted/);
  });

  test('cannot submit a code before one was requested', async () => {
    screen = await render(<Probe />);

    await press('submit');

    expect(claimApi.verifyClaim).not.toHaveBeenCalled();
    expect(screen.getByTestId('phase').props.children).toBe('error');
  });
});

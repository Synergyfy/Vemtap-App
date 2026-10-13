import React from 'react';
import { Pressable, View } from 'react-native';
import { render, screen, waitFor, fireEvent } from '@testing-library/react-native';
import { VemtapText } from '@components/ui/Text';
import { useSendGift } from '@features/dealDetail/hooks/useSendGift';
import { giftApi } from '@api/giftApi';
import { ApiError } from '@api/ApiError';

jest.mock('@api/giftApi');
jest.mock('@utils/logger', () => ({
  logger: { warn: jest.fn(), info: jest.fn(), error: jest.fn(), debug: jest.fn() },
}));

/**
 * The gift flow used to navigate straight to its success screen without calling
 * the API, so a user could be told their gift was sent when nothing had been
 * dispatched. `POST /catalogue/offers/claim/gift` deletes its row and throws
 * when the recipient email cannot be sent, so `send` resolving false is the only
 * signal there is that nothing happened.
 */
describe('useSendGift', () => {
  const identity = {
    offerId: 'offer-1',
    recipientEmail: 'friend@example.com',
    recipientName: 'Sam Taylor',
    note: 'Enjoy lunch on me!',
  };

  /** Renders the hook behind a button, and surfaces the phase for assertions. */
  function Harness() {
    const { status, send } = useSendGift();
    return (
      <View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="send gift"
          onPress={() => void send(identity)}
        />
        <View testID="phase" data-phase={status.phase} />
        {status.phase === 'error' ? (
          <VemtapText testID="message">{status.message}</VemtapText>
        ) : null}
      </View>
    );
  }

  const phaseOf = () => screen.getByTestId('phase').props['data-phase'];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sends the recipient, note and offer the flow collected', async () => {
    (giftApi.sendDealGift as jest.Mock).mockResolvedValue({ success: true });

    await render(<Harness />);
    fireEvent.press(screen.getByLabelText('send gift'));

    await waitFor(() => expect(phaseOf()).toBe('sent'));
    expect(giftApi.sendDealGift).toHaveBeenCalledWith({
      offerId: 'offer-1',
      recipientEmail: 'friend@example.com',
      recipientName: 'Sam Taylor',
      note: 'Enjoy lunch on me!',
      branchId: undefined,
    });
  });

  it('shows the server’s own wording for a rejected send', async () => {
    // The API answers 400 with this message when the recipient email cannot be
    // dispatched, and it is specific enough to be worth showing.
    (giftApi.sendDealGift as jest.Mock).mockRejectedValue(
      new ApiError('Failed to dispatch deal gift email. Please try again.', {
        status: 400,
      }),
    );

    await render(<Harness />);
    fireEvent.press(screen.getByLabelText('send gift'));

    // `sent` is the only thing that lets the caller show its success screen, so
    // a failure must never reach it.
    await waitFor(() => expect(phaseOf()).toBe('error'));
    expect(screen.getByTestId('message').props.children).toBe(
      'Failed to dispatch deal gift email. Please try again.',
    );
  });

  it('replaces an internal server error with a calm message', async () => {
    const error = Object.assign(new Error('ECONNREFUSED 10.0.0.1'), { status: 500 });
    (giftApi.sendDealGift as jest.Mock).mockRejectedValue(error);

    await render(<Harness />);
    fireEvent.press(screen.getByLabelText('send gift'));

    await waitFor(() => expect(phaseOf()).toBe('error'));
    // The raw failure string is not something to show a user.
    expect(screen.getByTestId('message').props.children).toBe(
      'We could not send that gift. Try again in a moment.',
    );
  });
});

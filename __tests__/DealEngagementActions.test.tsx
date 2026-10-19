import React from 'react';
import { Pressable, Text } from 'react-native';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  engagementKeys,
  useDealReaction,
  useDealSave,
} from '@features/deals/hooks/useDealEngagementActions';

const mockSetReaction = jest.fn();
const mockToggleSave = jest.fn();
const mockReactionStatus = jest.fn();
const mockSaveStatus = jest.fn();

jest.mock('@api/dealsApi', () => ({
  dealsApi: {
    setReaction: (...args: unknown[]) => mockSetReaction(...args),
    toggleSave: (...args: unknown[]) => mockToggleSave(...args),
    getReactionStatus: (...args: unknown[]) => mockReactionStatus(...args),
    getSaveStatus: (...args: unknown[]) => mockSaveStatus(...args),
    getEngagement: jest.fn(),
  },
}));

/** A server that really toggles, like `deal-engagement.service.setReaction`. */
function toggleServer(initial: { liked: boolean; likesCount: number }) {
  const state = { ...initial };
  mockSetReaction.mockImplementation(async () => {
    state.liked = !state.liked;
    state.likesCount += state.liked ? 1 : -1;
    return { type: state.liked ? 'like' : null, likesCount: state.likesCount };
  });
  return state;
}

let mockStatus = 'authenticated';

jest.mock('@store/authStore', () => ({
  useAuthStore: (selector: (state: { status: string }) => unknown) =>
    selector({ status: mockStatus }),
}));

jest.mock('@utils/logger', () => ({
  logger: { warn: jest.fn(), info: jest.fn(), error: jest.fn(), debug: jest.fn() },
}));

const OFFER = 'offer-1';

function Probe({ offerId = OFFER }: { offerId?: string }) {
  const reaction = useDealReaction(offerId);
  const save = useDealSave(offerId);
  return (
    <>
      <Text testID="liked">{String(reaction.liked)}</Text>
      <Text testID="needsAuth">{String(reaction.needsAuth)}</Text>
      <Text testID="saved">{String(save.saved)}</Text>
      <Pressable testID="like" onPress={reaction.toggle} />
      <Pressable testID="save" onPress={save.toggle} />
    </>
  );
}

const clients: QueryClient[] = [];

async function renderProbe(offerId = OFFER) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  clients.push(client);
  client.setQueryData(engagementKeys.counts(offerId), { likesCount: 5 });

  const screen = await render(
    <QueryClientProvider client={client}>
      <Probe offerId={offerId} />
    </QueryClientProvider>,
  );
  return { screen, client };
}

/** Let the mutation's async onMutate settle, then flush the optimistic write. */
async function flush() {
  await act(async () => {});
}

afterEach(() => {
  // Tear the clients down so their cache timers do not outlive the suite.
  while (clients.length) clients.pop()?.clear();
});

beforeEach(() => {
  mockSetReaction.mockReset();
  mockToggleSave.mockReset();
  mockReactionStatus.mockReset();
  mockSaveStatus.mockReset();
  // Held open by default so a status fetch never races the taps under test.
  mockReactionStatus.mockReturnValue(new Promise(() => {}));
  mockSaveStatus.mockReturnValue(new Promise(() => {}));
  mockStatus = 'authenticated';
});

test('calls the reaction endpoint with the deal id and a like type', async () => {
  toggleServer({ liked: false, likesCount: 5 });
  const { screen } = await renderProbe();

  await fireEvent.press(screen.getByTestId('like'));

  await waitFor(() => expect(mockSetReaction).toHaveBeenCalledWith(OFFER, 'like'));
});

test('flips the liked flag while the request is still in flight', async () => {
  // Held open on purpose: if the flag only moved after the request settled,
  // this waitFor would time out rather than pass.
  let release: () => void = () => {};
  mockSetReaction.mockReturnValue(
    new Promise<void>(resolve => {
      release = resolve;
    }),
  );
  const { screen } = await renderProbe();

  expect(screen.getByTestId('liked')).toHaveTextContent('false');

  await fireEvent.press(screen.getByTestId('like'));

  await waitFor(() => expect(screen.getByTestId('liked')).toHaveTextContent('true'));

  await act(async () => {
    release();
  });
});

test('moves the cached like count up on like and back down on unlike', async () => {
  toggleServer({ liked: false, likesCount: 5 });
  const { screen, client } = await renderProbe();

  await fireEvent.press(screen.getByTestId('like'));
  await waitFor(() =>
    expect(client.getQueryData(engagementKeys.counts(OFFER))).toMatchObject({
      likesCount: 6,
    }),
  );

  await fireEvent.press(screen.getByTestId('like'));
  await waitFor(() =>
    expect(client.getQueryData(engagementKeys.counts(OFFER))).toMatchObject({
      likesCount: 5,
    }),
  );
});

test('never drives the cached like count below zero', async () => {
  mockSetReaction.mockReturnValue(new Promise(() => {}));
  const { screen, client } = await renderProbe();
  client.setQueryData(engagementKeys.counts(OFFER), { likesCount: 0 });

  await fireEvent.press(screen.getByTestId('like'));
  await flush();
  await fireEvent.press(screen.getByTestId('like'));
  await flush();

  expect(client.getQueryData(engagementKeys.counts(OFFER))).toMatchObject({
    likesCount: 0,
  });
});

test('rolls the flag and the count back when the request fails', async () => {
  mockSetReaction.mockRejectedValue(new Error('Unauthorized'));
  const { screen, client } = await renderProbe();

  await fireEvent.press(screen.getByTestId('like'));

  await waitFor(() => expect(screen.getByTestId('liked')).toHaveTextContent('false'));
  expect(client.getQueryData(engagementKeys.counts(OFFER))).toMatchObject({
    likesCount: 5,
  });
});

test('does not fire when signed out, and reports that auth is needed', async () => {
  mockStatus = 'unauthenticated';
  mockSetReaction.mockResolvedValue(undefined);
  const { screen } = await renderProbe();

  await fireEvent.press(screen.getByTestId('like'));
  await flush();

  expect(mockSetReaction).not.toHaveBeenCalled();
  expect(screen.getByTestId('needsAuth')).toHaveTextContent('true');
  expect(screen.getByTestId('liked')).toHaveTextContent('false');
});

test('toggles save through its own endpoint and cache slot', async () => {
  mockToggleSave.mockResolvedValue({ saved: true });
  const { screen, client } = await renderProbe();

  await fireEvent.press(screen.getByTestId('save'));

  await waitFor(() => expect(mockToggleSave).toHaveBeenCalledWith(OFFER));
  await waitFor(() => expect(screen.getByTestId('saved')).toHaveTextContent('true'));
  expect(client.getQueryData(engagementKeys.saved(OFFER))).toEqual({ saved: true });
});

test('save state is scoped to its own deal', async () => {
  mockToggleSave.mockResolvedValue({ saved: true });
  const { screen } = await renderProbe(OFFER);

  await fireEvent.press(screen.getByTestId('save'));
  await waitFor(() => expect(screen.getByTestId('saved')).toHaveTextContent('true'));

  await act(async () =>
    screen.rerender(
      <QueryClientProvider
        client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
      >
        <Probe offerId="offer-2" />
      </QueryClientProvider>,
    ),
  );

  expect(screen.getByTestId('saved')).toHaveTextContent('false');
});

test('shows a deal the viewer already liked as liked, and the next tap unlikes it', async () => {
  mockReactionStatus.mockResolvedValue({ type: 'like', likesCount: 5 });
  toggleServer({ liked: true, likesCount: 5 });
  const { screen, client } = await renderProbe();

  await waitFor(() => expect(screen.getByTestId('liked')).toHaveTextContent('true'));

  await fireEvent.press(screen.getByTestId('like'));
  await waitFor(() => expect(screen.getByTestId('liked')).toHaveTextContent('false'));
  await waitFor(() =>
    expect(client.getQueryData(engagementKeys.counts(OFFER))).toMatchObject({
      likesCount: 4,
    }),
  );
  expect(mockSetReaction).toHaveBeenCalledTimes(1);
});

test('rapid like-unlike-like ends liked, with the server in step', async () => {
  const server = toggleServer({ liked: false, likesCount: 5 });
  const { screen, client } = await renderProbe();

  await fireEvent.press(screen.getByTestId('like'));
  await fireEvent.press(screen.getByTestId('like'));
  await fireEvent.press(screen.getByTestId('like'));

  await waitFor(() => expect(mockSetReaction).toHaveBeenCalled());
  await waitFor(() => {
    expect(server.liked).toBe(true);
    expect(screen.getByTestId('liked')).toHaveTextContent('true');
    expect(client.getQueryData(engagementKeys.counts(OFFER))).toMatchObject({
      likesCount: 6,
    });
  });
});

test('shows a deal the viewer already saved as saved', async () => {
  mockSaveStatus.mockResolvedValue({ isSaved: true });
  const { screen } = await renderProbe();
  await waitFor(() => expect(screen.getByTestId('saved')).toHaveTextContent('true'));
});

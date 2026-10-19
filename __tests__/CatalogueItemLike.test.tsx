import React from 'react';
import { Pressable, Text } from 'react-native';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCatalogueItemLike } from '@features/order/hooks/useCatalogueItemLike';
import { DoubleTapLike } from '@components/shared/DoubleTapLike';
import { LikeButton } from '@components/shared/LikeButton';
import { strings } from '@constants/strings';

const mockGetLikeStatus = jest.fn();
const mockSetLiked = jest.fn();

jest.mock('@api/productCommentsApi', () => ({
  productCommentsApi: {
    getLikeStatus: (...args: unknown[]) => mockGetLikeStatus(...args),
    setLiked: (...args: unknown[]) => mockSetLiked(...args),
  },
}));

let mockStatus = 'authenticated';
jest.mock('@store/authStore', () => ({
  useAuthStore: (selector: (state: { status: string }) => unknown) =>
    selector({ status: mockStatus }),
}));

jest.mock('@utils/logger', () => ({
  logger: { warn: jest.fn(), info: jest.fn(), error: jest.fn(), debug: jest.fn() },
}));

function Probe() {
  const like = useCatalogueItemLike('item-1');
  return (
    <>
      <LikeButton
        liked={like.liked}
        likesCount={like.likesCount}
        onToggle={like.toggle}
        accessibilityLabel="Jollof bowl"
      />
      <DoubleTapLike onDoubleTap={like.like}>
        <Text>photo</Text>
      </DoubleTapLike>
      <Pressable testID="double" onPress={like.like} />
    </>
  );
}

const clients: QueryClient[] = [];

async function renderProbe() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  clients.push(client);
  return render(
    <QueryClientProvider client={client}>
      <Probe />
    </QueryClientProvider>,
  );
}

const likeLabel = `${strings.likes.likeLabel} Jollof bowl`;

beforeEach(() => {
  mockGetLikeStatus.mockReset();
  mockSetLiked.mockReset();
  mockStatus = 'authenticated';
  mockSetLiked.mockImplementation(async (_id: string, liked: boolean) => ({
    liked,
    likesCount: liked ? 4 : 3,
  }));
});

afterEach(() => {
  while (clients.length) clients.pop()?.clear();
});

test('loads the count and the viewer’s like, then unlikes with an explicit request', async () => {
  mockGetLikeStatus.mockResolvedValue({ liked: true, likesCount: 4 });
  const screen = await renderProbe();

  await waitFor(() => expect(screen.getByText(strings.likes.count(4))).toBeTruthy());
  expect(screen.getByLabelText(likeLabel).props.accessibilityState).toMatchObject({
    selected: true,
  });

  await fireEvent.press(screen.getByLabelText(likeLabel));
  await waitFor(() => expect(mockSetLiked).toHaveBeenCalledWith('item-1', false));
  await waitFor(() => expect(screen.getByText(strings.likes.count(3))).toBeTruthy());
});

test('shows the count to signed-out viewers but does not like', async () => {
  mockStatus = 'unauthenticated';
  mockGetLikeStatus.mockResolvedValue({ liked: false, likesCount: 7 });
  const screen = await renderProbe();

  await waitFor(() => expect(screen.getByText(strings.likes.count(7))).toBeTruthy());
  await fireEvent.press(screen.getByLabelText(likeLabel));
  await act(async () => {});
  expect(mockSetLiked).not.toHaveBeenCalled();
});

test('double-tap likes and never unlikes', async () => {
  mockGetLikeStatus.mockResolvedValue({ liked: false, likesCount: 3 });
  const screen = await renderProbe();
  await waitFor(() => expect(screen.getByText(strings.likes.count(3))).toBeTruthy());

  await fireEvent.press(screen.getByTestId('double'));
  await waitFor(() => expect(screen.getByText(strings.likes.count(4))).toBeTruthy());
  await fireEvent.press(screen.getByTestId('double'));
  await act(async () => {});

  expect(mockSetLiked).toHaveBeenCalledTimes(1);
  expect(mockSetLiked).toHaveBeenCalledWith('item-1', true);
});

test('two quick taps on a photo fire the double-tap like', async () => {
  const onDoubleTap = jest.fn();
  const screen = await render(
    <DoubleTapLike onDoubleTap={onDoubleTap}>
      <Text>photo</Text>
    </DoubleTapLike>,
  );
  await fireEvent.press(screen.getByText('photo'));
  await fireEvent.press(screen.getByText('photo'));
  expect(onDoubleTap).toHaveBeenCalledTimes(1);
});

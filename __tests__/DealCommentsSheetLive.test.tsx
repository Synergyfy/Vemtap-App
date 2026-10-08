import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { DealCommentsSheet } from '@features/dealDetail/components/DealCommentsSheet';
import { strings } from '@constants/strings';

/**
 * The comments sheet has two modes: live reviews for a real offer UUID, and
 * the designed demo conversation for fictional seed deals. These lock in the
 * branch and the author-only affordances (`isAuthor` drives edit/delete).
 */

const mockList = jest.fn();
const mockDetail = jest.fn();
const mockCreateMutate = jest.fn();
const mockCreate = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();

jest.mock('@features/dealDetail/hooks/useDealReviews', () => ({
  useDealReviews: () => mockList(),
  useDealReviewDetail: () => mockDetail(),
  useCreateDealReview: () => mockCreate(),
  useUpdateDealReview: () => mockUpdate(),
  useDeleteDealReview: () => mockDelete(),
}));

const review = {
  id: 'review-1',
  reviewerName: 'Chidi O.',
  comment: 'Great deal!',
  rating: 4,
  likesCount: 2,
  createdAt: '2026-10-08T10:00:00.000Z',
};

const detail = {
  ...review,
  offerId: 'offer-1',
  status: 'approved',
  isAuthor: true,
  updatedAt: '2026-10-08T10:00:00.000Z',
};

beforeEach(() => {
  jest.clearAllMocks();
  mockList.mockReturnValue({
    isLoading: false,
    isError: false,
    data: { reviews: [review], total: 1, page: 1 },
    refetch: jest.fn(),
  });
  mockDetail.mockReturnValue({
    isLoading: false,
    isError: false,
    data: detail,
    refetch: jest.fn(),
  });
  mockCreate.mockReturnValue({
    mutate: mockCreateMutate,
    isPending: false,
    isError: false,
  });
  mockUpdate.mockReturnValue({ mutate: jest.fn(), isPending: false, isError: false });
  mockDelete.mockReturnValue({ mutate: jest.fn(), isPending: false });
});

test('renders live reviews for a real offer', async () => {
  const screen = await render(
    <DealCommentsSheet
      visible
      onClose={jest.fn()}
      dealTitle="Apo Lunch Combo"
      merchant="Patrick Ventures"
      commentCount={1}
      offerId="offer-1"
    />,
  );

  expect(screen.getByText('Chidi O.')).toBeTruthy();
  expect(screen.getByText('Great deal!')).toBeTruthy();
});

test('opens review detail with edit and delete for the author', async () => {
  const screen = await render(
    <DealCommentsSheet
      visible
      onClose={jest.fn()}
      dealTitle="Apo Lunch Combo"
      merchant="Patrick Ventures"
      commentCount={1}
      offerId="offer-1"
    />,
  );

  await fireEvent.press(screen.getByText('Great deal!'));

  expect(screen.getByText(strings.deals.yourReview)).toBeTruthy();
  expect(screen.getByText(strings.deals.editReview)).toBeTruthy();
  expect(screen.getByText(strings.deals.deleteReview)).toBeTruthy();
});

test('posts a new review with the typed comment', async () => {
  const screen = await render(
    <DealCommentsSheet
      visible
      onClose={jest.fn()}
      dealTitle="Apo Lunch Combo"
      merchant="Patrick Ventures"
      commentCount={0}
      offerId="offer-1"
    />,
  );

  await fireEvent.changeText(
    screen.getByLabelText(strings.deals.addCommentPlaceholder),
    'Lovely spot',
  );
  await fireEvent.press(screen.getByLabelText(strings.deals.post));

  expect(mockCreateMutate).toHaveBeenCalledWith(
    { comment: 'Lovely spot', rating: undefined },
    expect.anything(),
  );
});

test('keeps the designed demo conversation for fictional seed deals', async () => {
  const screen = await render(
    <DealCommentsSheet
      visible
      onClose={jest.fn()}
      dealTitle="Prime Lunch Gourmet Combo"
      merchant="Urban Grill & Bistro"
      commentCount={32}
    />,
  );

  expect(screen.getByText('Samuel A.')).toBeTruthy();
  expect(mockList).not.toHaveBeenCalled();
});

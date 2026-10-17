import React from 'react';
import { View } from 'react-native';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { CatalogueItem } from '@api/catalogueApi';
import {
  productCommentsApi,
  type BusinessProductComment,
  type ProductCommentsPage,
} from '@api/productCommentsApi';
import { ApiError } from '@api/ApiError';
import { strings } from '@constants/strings';
import { ProductCommentsSheet } from '@features/order/components/ProductCommentsSheet';
import {
  discountedPrice,
  toProductCommentView,
  toProductDetailView,
  toProductRatingView,
} from '@features/order/utils/productDetailMapper';
import { presentProductComments } from '@features/business/utils/reviewMappers';
import { BusinessReviewsReputationScreen } from '@features/business/screens/BusinessReviewsReputationScreen';

const MockReact = React;
const MockView = View;

jest.mock('@components/shared/BottomSheet', () => ({
  BottomSheet: ({
    visible,
    children,
  }: {
    visible: boolean;
    children: React.ReactNode;
  }) => (visible ? MockReact.createElement(MockView, {}, children) : null),
}));

const copy = strings.productComments;

const item = (overrides: Partial<CatalogueItem> = {}) =>
  ({
    id: 'item-1',
    name: 'Smoked Chicken Wrap',
    price: 5000,
    description: '  ',
    shortDescription: 'Chicken wrap',
    mainImage: 'https://img.test/a.jpg',
    galleryImages: ['https://img.test/a.jpg', 'https://img.test/b.jpg'],
    status: 'active',
    itemType: 'product',
    discountType: 'none',
    discountValue: null,
    stockQuantity: null,
    isSuspended: false,
    ...overrides,
  }) as unknown as CatalogueItem;

const page = (overrides: Partial<ProductCommentsPage> = {}): ProductCommentsPage => ({
  comments: [],
  total: 0,
  page: 1,
  limit: 20,
  averageRating: null,
  ratingCount: 0,
  ...overrides,
});

function renderWithClient(ui: React.ReactElement) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

afterEach(() => {
  jest.restoreAllMocks();
});

describe('product detail mapping', () => {
  it('applies percentage and fixed discounts without going negative', () => {
    expect(
      discountedPrice(item({ discountType: 'percentage', discountValue: 10 })),
    ).toEqual({ unit: 4500, list: 5000, label: '10% off' });
    expect(
      discountedPrice(item({ discountType: 'percentage', discountValue: 150 })).unit,
    ).toBe(0);
    expect(
      discountedPrice(item({ discountType: 'fixed', discountValue: 9000 })).unit,
    ).toBe(0);
    expect(discountedPrice(item()).label).toBeNull();
  });

  it('dedupes images, falls back to the short description and reads stock', () => {
    const view = toProductDetailView(item({ stockQuantity: 3 }));
    expect(view.images).toEqual(['https://img.test/a.jpg', 'https://img.test/b.jpg']);
    expect(view.description).toBe('Chicken wrap');
    expect(view.stock.label).toBe(strings.productDetail.lowStock(3));
    expect(view.canOrder).toBe(true);

    const gone = toProductDetailView(item({ stockQuantity: 0 }));
    expect(gone.canOrder).toBe(false);
    expect(gone.stock.label).toBe(strings.productDetail.outOfStock);
  });

  it('summarises the rating, and invites the first comment when there is none', () => {
    expect(toProductRatingView(page())).toEqual({
      score: null,
      stars: 0,
      ratingLabel: strings.productDetail.noRating,
      commentLabel: strings.productDetail.beFirst,
    });
    const rated = toProductRatingView(
      page({ total: 3, averageRating: 4.25, ratingCount: 2 }),
    );
    expect(rated.score).toBe('4.3');
    expect(rated.commentLabel).toBe(strings.productDetail.commentCount(3));
  });

  it('marks the reader’s own comment and keeps the business reply', () => {
    const view = toProductCommentView({
      id: 'c1',
      authorName: 'Ada O.',
      comment: 'Great',
      rating: 5,
      merchantReply: ' Thanks! ',
      repliedAt: '2026-10-17T10:00:00Z',
      createdAt: '2026-10-17T09:00:00Z',
      isMine: true,
    });
    expect(view.author).toBe(`Ada O. (${copy.you})`);
    expect(view.initials).toBe('AO');
    expect(view.reply).toBe('Thanks!');
  });
});

describe('product comments sheet', () => {
  it('posts a comment with the chosen stars', async () => {
    jest.spyOn(productCommentsApi, 'list').mockResolvedValue(page());
    const create = jest.spyOn(productCommentsApi, 'create').mockResolvedValue({
      id: 'c1',
      authorName: 'Ada O.',
      comment: 'Lovely',
      rating: 4,
      createdAt: '2026-10-17T09:00:00Z',
      isMine: true,
    });

    const view = await renderWithClient(
      <ProductCommentsSheet
        visible
        onClose={jest.fn()}
        itemId="item-1"
        productName="Wrap"
        canComment
      />,
    );

    await waitFor(() => expect(view.getByText(copy.empty.title)).toBeTruthy());
    await act(async () => {
      fireEvent.press(view.getByLabelText(copy.starLabel(4)));
    });
    await act(async () => {
      fireEvent.changeText(view.getByLabelText(copy.placeholder), '  Lovely  ');
    });
    await act(async () => {
      fireEvent.press(view.getByLabelText(copy.post));
    });

    await waitFor(() =>
      expect(create).toHaveBeenCalledWith('item-1', { comment: 'Lovely', rating: 4 }),
    );
  });

  it('explains a second comment instead of failing silently', async () => {
    jest.spyOn(productCommentsApi, 'list').mockResolvedValue(page());
    jest
      .spyOn(productCommentsApi, 'create')
      .mockRejectedValue(new ApiError('conflict', { status: 409 }));

    const view = await renderWithClient(
      <ProductCommentsSheet
        visible
        onClose={jest.fn()}
        itemId="item-1"
        productName="Wrap"
        canComment
      />,
    );

    await waitFor(() => expect(view.getByText(copy.empty.title)).toBeTruthy());
    await act(async () => {
      fireEvent.changeText(view.getByLabelText(copy.placeholder), 'Again');
    });
    await act(async () => {
      fireEvent.press(view.getByLabelText(copy.post));
    });

    await waitFor(() => expect(view.getByText(copy.alreadyCommented)).toBeTruthy());
  });

  it('offers edit on the reader’s own comment and hides the composer', async () => {
    jest.spyOn(productCommentsApi, 'list').mockResolvedValue(
      page({
        total: 1,
        comments: [
          {
            id: 'c1',
            authorName: 'Ada O.',
            comment: 'Fresh',
            rating: 5,
            merchantReply: 'Thank you!',
            createdAt: '2026-10-17T09:00:00Z',
            isMine: true,
          },
        ],
      }),
    );
    const update = jest.spyOn(productCommentsApi, 'update').mockResolvedValue({
      id: 'c1',
      authorName: 'Ada O.',
      comment: 'Fresh and hot',
      createdAt: '2026-10-17T09:00:00Z',
      isMine: true,
    });

    const view = await renderWithClient(
      <ProductCommentsSheet
        visible
        onClose={jest.fn()}
        itemId="item-1"
        productName="Wrap"
        businessName="Aurora Grill"
        canComment
      />,
    );

    await waitFor(() => expect(view.getByText('Thank you!')).toBeTruthy());
    expect(view.queryByLabelText(copy.post)).toBeNull();

    await act(async () => {
      fireEvent.press(view.getByLabelText(copy.edit));
    });
    await act(async () => {
      fireEvent.changeText(view.getByLabelText(copy.placeholder), 'Fresh and hot');
    });
    await act(async () => {
      fireEvent.press(view.getByLabelText(copy.save));
    });

    await waitFor(() =>
      expect(update).toHaveBeenCalledWith('item-1', 'c1', {
        comment: 'Fresh and hot',
        rating: 5,
      }),
    );
  });

  it('asks a signed-out reader to sign in instead of showing the composer', async () => {
    jest.spyOn(productCommentsApi, 'list').mockResolvedValue(page());

    const view = await renderWithClient(
      <ProductCommentsSheet
        visible
        onClose={jest.fn()}
        itemId="item-1"
        productName="Wrap"
        canComment={false}
      />,
    );

    await waitFor(() => expect(view.getByText(copy.signInToComment)).toBeTruthy());
    expect(view.queryByLabelText(copy.placeholder)).toBeNull();
  });
});

describe('business view of product comments', () => {
  const reviewsCopy = strings.businessReviewsReputation;
  const comment: BusinessProductComment = {
    id: 'c1',
    authorName: 'Ada O.',
    comment: 'Fresh',
    rating: 4,
    merchantReply: null,
    createdAt: '2026-10-17T09:00:00Z',
    isMine: false,
    itemId: 'item-1',
    itemName: 'Smoked Chicken Wrap',
  };
  const summary = {
    total: 3,
    unreplied: 2,
    averageRating: 4.5,
    ratingCount: 2,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 1, 5: 1 },
  };

  it('maps comments to reply-and-remove rows with no moderation pill', () => {
    const view = presentProductComments({ comments: [comment], summary, filter: 'all' });

    expect(view.score).toBe('4.5');
    expect(view.pendingLabel).toBe(reviewsCopy.unrepliedBadge('2'));
    expect(view.filters.map(f => f.key)).toEqual(['all', 'unreplied', 'replied']);
    expect(view.distribution.find(row => row.stars === 4)?.percent).toBe(50);
    expect(view.reviews[0]).toEqual(
      expect.objectContaining({
        offerName: 'Smoked Chicken Wrap',
        likes: null,
        statusPill: null,
        canApprove: false,
        canDelete: true,
        canReply: true,
      }),
    );
  });

  it('switches source and replies to a product comment', async () => {
    const onChangeSource = jest.fn();
    const onReply = jest.fn();
    const view = await render(
      <BusinessReviewsReputationScreen
        view={presentProductComments({ comments: [comment], summary, filter: 'all' })}
        sources={[
          { key: 'deals', label: reviewsCopy.sources.deals },
          { key: 'products', label: reviewsCopy.sources.products },
        ]}
        source="products"
        onChangeSource={onChangeSource}
        filter="all"
        onChangeFilter={jest.fn()}
        onReply={onReply}
        onModerate={jest.fn()}
      />,
    );

    expect(view.getByText(reviewsCopy.productModerationTitle)).toBeTruthy();
    expect(view.queryByText(reviewsCopy.approve)).toBeNull();

    await act(async () => {
      fireEvent.press(view.getByLabelText(reviewsCopy.sources.deals));
    });
    expect(onChangeSource).toHaveBeenCalledWith('deals');

    await act(async () => {
      fireEvent.press(view.getByLabelText(reviewsCopy.reply));
    });
    await act(async () => {
      fireEvent.changeText(view.getByLabelText(reviewsCopy.replyTitle), 'Thanks Ada');
    });
    await act(async () => {
      fireEvent.press(view.getByLabelText(reviewsCopy.replySave));
    });
    expect(onReply).toHaveBeenCalledWith('c1', 'Thanks Ada');
  });
});

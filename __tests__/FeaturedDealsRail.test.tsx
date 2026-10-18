import React from 'react';
import { AccessibilityInfo } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { FeaturedDealsRail } from '@components/home/FeaturedDealsRail';
import type { FeaturedDeal } from '@features/home/types/feed';

jest.mock('@features/deals/hooks/usePublicOffers', () =>
  jest.requireActual('./helpers/mockOffersFeed').mockOffersFeedModule(),
);
jest.mock('@features/deals/hooks/useDealEngagementActions', () =>
  jest.requireActual('./helpers/mockOffersFeed').mockDealEngagementActionsModule(),
);

function featuredDeal(index: number): FeaturedDeal {
  return {
    id: `offer-${index}`,
    image: { uri: `https://example.test/${index}.jpg` },
    badge: `${20 + index}% OFF`,
    endsLabel: 'Ends tonight',
    merchant: `Merchant ${index}`,
    status: { kind: 'verified', label: 'Verified' },
    title: `Deal number ${index}`,
    price: '₦4,000',
    priceWas: '₦5,000',
    distance: '1.2 km away',
    likes: 10,
    comments: 2,
  };
}

const DEALS = [featuredDeal(1), featuredDeal(2), featuredDeal(3)];

/**
 * Fires the root's onLayout so the rail has a definite page width, the way a
 * real device reports it after mount.
 */
async function measureRail(width: number) {
  await act(async () => {
    screen.getByTestId('featured-deals-rail-root').props.onLayout({
      nativeEvent: { layout: { width, height: 400, x: 0, y: 0 } },
    });
  });
  await act(async () => {});
}

function activePill() {
  return screen
    .getAllByRole('button', { name: /^Go to deal / })
    .find(pill => pill.props.accessibilityState?.selected);
}

describe('FeaturedDealsRail', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('shows one deal per page and one dot per deal', async () => {
    await act(async () => {
      render(<FeaturedDealsRail deals={DEALS} />);
    });

    expect(screen.getByText('Deal number 1')).toBeTruthy();
    expect(screen.getByText('Deal number 2')).toBeTruthy();
    expect(screen.getByText('Deal number 3')).toBeTruthy();

    const pills = screen.getAllByRole('button', { name: /^Go to deal / });
    expect(pills).toHaveLength(DEALS.length);
    expect(activePill()?.props.accessibilityLabel).toBe('Go to deal 1');
  });

  it('pins every card to a definite width rather than the list content', async () => {
    // The regression this guards: the card is `w-full`, and inside a horizontal
    // list a percentage width resolves against the content flow, so the card
    // used to take its max-content width and drag its aspect-video image (and
    // therefore its height) far past the screen.
    await act(async () => {
      render(<FeaturedDealsRail deals={DEALS} />);
    });
    await measureRail(342);

    const cardWidths = screen
      .getAllByTestId('featured-deals-page')
      .map(page => (page.props.style as { width: number }).width);

    expect(cardWidths).toHaveLength(DEALS.length);
    expect(cardWidths.every(width => width === 342)).toBe(true);
    expect(cardWidths.every(width => width <= 390)).toBe(true);
  });

  it('hides the dots for a single deal', async () => {
    await act(async () => {
      render(<FeaturedDealsRail deals={[DEALS[0]]} />);
    });

    expect(screen.queryAllByRole('button', { name: /^Go to deal / })).toHaveLength(0);
  });

  it('auto-slides to the next deal on the interval', async () => {
    await act(async () => {
      render(<FeaturedDealsRail deals={DEALS} />);
    });
    await act(async () => {});

    expect(activePill()?.props.accessibilityLabel).toBe('Go to deal 1');

    await act(async () => {
      jest.advanceTimersByTime(4500);
    });
    expect(activePill()?.props.accessibilityLabel).toBe('Go to deal 2');

    // Wraps rather than running off the end.
    await act(async () => {
      jest.advanceTimersByTime(4500);
    });
    expect(activePill()?.props.accessibilityLabel).toBe('Go to deal 3');

    await act(async () => {
      jest.advanceTimersByTime(4500);
    });
    expect(activePill()?.props.accessibilityLabel).toBe('Go to deal 1');
  });

  it('pauses autoplay while dragging and resumes when the scroll settles', async () => {
    await act(async () => {
      render(<FeaturedDealsRail deals={DEALS} />);
    });
    await act(async () => {});

    await measureRail(342);
    // Fired from a card, which bubbles to the list that owns the handlers.
    const card = screen.getByLabelText('View Deal number 2');

    // Drag in progress: autoplay stands down so it cannot fight the finger.
    await act(async () => {
      fireEvent(card, 'scrollBeginDrag');
    });
    await act(async () => {
      jest.advanceTimersByTime(20000);
    });
    expect(activePill()?.props.accessibilityLabel).toBe('Go to deal 1');

    // Scroll settles on page two — exactly one card width across.
    await act(async () => {
      fireEvent(card, 'momentumScrollEnd', {
        nativeEvent: { contentOffset: { x: 342, y: 0 } },
      });
    });
    expect(activePill()?.props.accessibilityLabel).toBe('Go to deal 2');
  });

  it('resumes autoplay even when a drag never flings', async () => {
    await act(async () => {
      render(<FeaturedDealsRail deals={DEALS} />);
    });
    await act(async () => {});

    const card = screen.getByLabelText('View Deal number 2');
    await act(async () => {
      fireEvent(card, 'scrollBeginDrag');
    });
    await act(async () => {
      jest.advanceTimersByTime(20000);
    });
    expect(activePill()?.props.accessibilityLabel).toBe('Go to deal 1');

    // Released with too little travel to produce momentum: no momentum event
    // ever fires, yet the rail must not stay paused.
    await act(async () => {
      fireEvent(card, 'scrollEndDrag', {
        nativeEvent: {
          contentOffset: { x: 0, y: 0 },
          contentSize: { width: 1170, height: 300 },
          layoutMeasurement: { width: 390, height: 300 },
          zoomScale: 1,
        },
      });
    });
    await act(async () => {
      jest.advanceTimersByTime(4500);
    });
    expect(activePill()?.props.accessibilityLabel).toBe('Go to deal 2');
  });

  it('jumps to a deal when its dot is pressed', async () => {
    await act(async () => {
      render(<FeaturedDealsRail deals={DEALS} />);
    });

    await act(async () => {
      fireEvent.press(screen.getByLabelText('Go to deal 3'));
    });

    expect(activePill()?.props.accessibilityLabel).toBe('Go to deal 3');
  });

  it('opens the deal a card belongs to', async () => {
    const onOpenDetail = jest.fn();
    await act(async () => {
      render(<FeaturedDealsRail deals={DEALS} onOpenDetail={onOpenDetail} />);
    });

    await act(async () => {
      fireEvent.press(screen.getByLabelText('View Deal number 2'));
    });

    expect(onOpenDetail).toHaveBeenCalledWith('offer-2');
  });
});

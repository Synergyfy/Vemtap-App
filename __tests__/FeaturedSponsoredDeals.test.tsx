import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react-native';
import { strings } from '@constants/strings';
import { FeaturedDealsScreen } from '@features/home/screens/FeaturedDealsScreen';
import { sponsoredTracker } from '@services/sponsoredTracker';

jest.mock('@features/deals/hooks/usePublicOffers', () =>
  jest.requireActual('./helpers/mockOffersFeed').mockOffersFeedModule(),
);
jest.mock('@features/deals/hooks/useDealEngagementActions', () =>
  jest.requireActual('./helpers/mockOffersFeed').mockDealEngagementActionsModule(),
);
jest.mock('@features/accountHub/hooks/useSavedHub', () =>
  jest.requireActual('./helpers/mockCustomerHub').mockSavedHubModule(),
);

const { MOCK_OFFERS } = jest.requireActual('./helpers/mockOffersFeed') as {
  MOCK_OFFERS: { id: string; name: string }[];
};

// The boosted deal is the feed's last offer, so it must move to the top and
// appear only once.
const promotedOffer = MOCK_OFFERS[2];
jest.mock('@features/deals/hooks/useSponsoredOffers', () => ({
  useSponsoredOffers: () => [
    {
      campaignId: 'c-feed',
      offer: jest.requireActual('./helpers/mockOffersFeed').MOCK_OFFERS[2],
    },
  ],
}));

const fd = strings.featuredDeals;
const impression = {
  campaignId: 'c-feed',
  offerId: promotedOffer.id,
  type: 'impression',
};

async function layout(testID: string, y: number, height: number) {
  await fireEvent(screen.getByTestId(testID), 'layout', {
    nativeEvent: { layout: { x: 0, y, width: 360, height } },
  });
}

describe('promoted deals on the Featured Deals page', () => {
  let track: jest.SpyInstance;

  beforeEach(() => {
    track = jest.spyOn(sponsoredTracker, 'track').mockImplementation(() => undefined);
  });
  afterEach(() => {
    track.mockRestore();
    cleanup();
  });

  it('lists the boosted deal first, badged, and only once', async () => {
    await render(<FeaturedDealsScreen onBack={jest.fn()} />);

    expect(screen.getAllByText(fd.promoted)).toHaveLength(1);
    expect(screen.getAllByText(promotedOffer.name)).toHaveLength(1);
    const [first] = screen.getAllByTestId(/^featured-listing-/);
    expect(first.props.testID).toBe(`featured-listing-${promotedOffer.id}`);
  });

  it('keeps the boosted deal on top whatever the sort', async () => {
    await render(<FeaturedDealsScreen onBack={jest.fn()} />);
    await fireEvent.press(screen.getByText(fd.sortEnding));
    const [first] = screen.getAllByTestId(/^featured-listing-/);
    expect(first.props.testID).toBe(`featured-listing-${promotedOffer.id}`);
  });

  it('records a view only once the promoted card scrolls into the viewport', async () => {
    await render(<FeaturedDealsScreen onBack={jest.fn()} />);
    await layout('featured-deals-scroll', 0, 600);
    await layout(`featured-listing-${promotedOffer.id}`, 0, 300);
    // The list starts below the fold: the card is laid out but not on screen.
    await layout('featured-deals-list', 900, 1200);
    expect(track).not.toHaveBeenCalledWith(impression);

    await fireEvent.scroll(screen.getByTestId('featured-deals-scroll'), {
      nativeEvent: {
        contentOffset: { x: 0, y: 500 },
        contentSize: { width: 360, height: 2400 },
        layoutMeasurement: { width: 360, height: 600 },
      },
    });
    expect(track).toHaveBeenCalledWith(impression);
    // Organic cards never report.
    expect(track.mock.calls.every(([event]) => event.campaignId === 'c-feed')).toBe(true);
  });

  it('records a tap when the promoted card opens the deal', async () => {
    const onOpenDeal = jest.fn();
    await render(<FeaturedDealsScreen onBack={jest.fn()} onOpenDeal={onOpenDeal} />);

    await fireEvent.press(screen.getAllByLabelText(fd.viewDeal)[0]);
    expect(onOpenDeal).toHaveBeenCalledWith(promotedOffer.id);
    expect(track).toHaveBeenCalledWith({
      campaignId: 'c-feed',
      offerId: promotedOffer.id,
      type: 'tap',
    });

    track.mockClear();
    const organic = screen.getAllByLabelText(fd.viewDeal);
    await fireEvent.press(organic[organic.length - 1]);
    expect(track).not.toHaveBeenCalled();
  });
});

import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { HomeScreen } from '@features/home/screens/HomeScreen';
import { useHomeDeals } from '@features/home/hooks/useHomeDeals';
import { sponsoredTracker } from '@services/sponsoredTracker';

jest.mock('@features/deals/hooks/usePublicOffers', () =>
  jest.requireActual('./helpers/mockOffersFeed').mockOffersFeedModule(),
);
jest.mock('@features/deals/hooks/useDealEngagementActions', () =>
  jest.requireActual('./helpers/mockOffersFeed').mockDealEngagementActionsModule(),
);
jest.mock('@features/home/hooks/useNearbyBusinesses', () =>
  jest.requireActual('./helpers/mockHomeBusinesses').mockHomeBusinessesModule(),
);
jest.mock('@features/home/hooks/useNearbyProducts', () =>
  jest.requireActual('./helpers/mockHomeProducts').mockHomeProductsModule(),
);
jest.mock('@hooks/useNetworkStatus', () => ({ useIsOnline: () => true }));

const { MOCK_OFFERS } = jest.requireActual('./helpers/mockOffersFeed') as {
  MOCK_OFFERS: { id: string; name: string }[];
};

// The boosted deal is the feed's third offer, so it must move to the front and
// leave the other sections.
const promotedOffer = MOCK_OFFERS[2];
jest.mock('@features/deals/hooks/useSponsoredOffers', () => ({
  useSponsoredOffers: () => [
    {
      campaignId: 'c-boost',
      offer: jest.requireActual('./helpers/mockOffersFeed').MOCK_OFFERS[2],
    },
  ],
}));

const probes: ReturnType<typeof useHomeDeals>[] = [];
function Probe() {
  probes.push(useHomeDeals());
  return null;
}

describe('promoted deals on Home', () => {
  let track: jest.SpyInstance;

  beforeEach(() => {
    track = jest.spyOn(sponsoredTracker, 'track').mockImplementation(() => undefined);
  });
  afterEach(() => jest.restoreAllMocks());

  it('leads the featured rail with the boosted deal and shows it once', async () => {
    probes.length = 0;
    await render(<Probe />);
    await waitFor(() => expect(probes.length).toBeGreaterThan(0));
    const result = probes[probes.length - 1];

    expect(result.featured[0]).toMatchObject({
      id: promotedOffer.id,
      campaignId: 'c-boost',
    });
    expect(result.featured).toHaveLength(3);
    // Organic featured cards carry no campaign.
    expect(result.featured.slice(1).every(deal => !deal.campaignId)).toBe(true);
    const elsewhere = [...result.nearby, ...result.trending].map(deal => deal.id);
    expect(elsewhere).not.toContain(promotedOffer.id);
  });

  it('records a view when the promoted card is on screen, and a tap when opened', async () => {
    const openDeal = jest.fn();
    await render(<HomeScreen onOpenDeal={openDeal} />);

    await waitFor(() =>
      expect(track).toHaveBeenCalledWith({
        campaignId: 'c-boost',
        offerId: promotedOffer.id,
        type: 'impression',
      }),
    );

    const [featuredCard] = await screen.findAllByLabelText(/^View /);
    await fireEvent.press(featuredCard);
    expect(openDeal).toHaveBeenCalledWith(promotedOffer.id);
    expect(track).toHaveBeenCalledWith({
      campaignId: 'c-boost',
      offerId: promotedOffer.id,
      type: 'tap',
    });
  });
});

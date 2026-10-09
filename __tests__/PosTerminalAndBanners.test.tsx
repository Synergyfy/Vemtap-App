import React from 'react';
import { act, render } from '@testing-library/react-native';
import {
  BusinessPosOrdersViewScreen,
  presentPosTerminal,
} from '@features/business/screens/BusinessPosOrdersViewScreen';
import { campaignBannerListSchema } from '@api/campaignsApi';
import { strings } from '@constants/strings';

const copy = strings.businessPos;

describe('presentPosTerminal', () => {
  it('formats live revenue, transaction count and held sales', () => {
    const view = presentPosTerminal({
      revenue: 142500,
      transactionCount: 12,
      heldSalesCount: 2,
    });

    expect(view.volumeValue).toBe('₦142.5k');
    expect(view.volumeMeta).toBe('/ 12 transactions');
    expect(view.heldSalesCount).toBe(2);
  });

  it('coerces the string counts looseCount also accepts', () => {
    const view = presentPosTerminal({
      revenue: '9600',
      transactionCount: '1',
      heldSalesCount: null,
    });

    expect(view.volumeValue).toBe('₦9.6k');
    expect(view.volumeMeta).toBe('/ 1 transaction');
    expect(view.heldSalesCount).toBe(0);
  });

  it('keeps the designed figures until the payload lands', () => {
    expect(presentPosTerminal()).toEqual({
      volumeValue: copy.volumeValue,
      volumeMeta: copy.volumeMeta,
      heldSalesCount: 0,
    });
  });
});

describe('campaign banner payload', () => {
  it('parses the banners-table shape and strips the bookkeeping columns', () => {
    const banners = campaignBannerListSchema.parse([
      {
        id: 'banner-1',
        createdAt: '2026-10-09T10:31:31.516Z',
        updatedAt: '2026-10-09T10:31:31.516Z',
        deletedAt: null,
        title: 'Weekend Deals Are Here',
        description: 'Explore curated flash discounts.',
        iconName: 'Megaphone',
        actionLabel: 'Explore Deals',
        actionUrl: 'https://testapi.vemtap.com/deals',
        color: 'bg-gradient-to-r from-emerald-600 to-teal-500',
        sortOrder: 0,
        isActive: true,
        placement: 'customer',
        targetType: 'custom',
      },
    ]);

    expect(banners[0].title).toBe('Weekend Deals Are Here');
    expect(banners[0].actionUrl).toBe('https://testapi.vemtap.com/deals');
    // A banner has no artwork: nothing image-shaped survives the parse.
    expect(Object.keys(banners[0]).some(key => /image/i.test(key))).toBe(false);
  });

  it('tolerates a banner without a CTA', () => {
    const [banner] = campaignBannerListSchema.parse([
      { id: 'banner-2', title: 'Heads up', description: 'Copy only' },
    ]);

    // Absent optional keys come back undefined, which the hero treats as
    // "fall back to the designed copy/button".
    expect(banner.actionLabel).toBeUndefined();
    expect(banner.actionUrl).toBeUndefined();
  });
});

describe('POS terminal row', () => {
  it('renders live volume and hides the held-sales badge at zero', async () => {
    const screen = await render(
      <BusinessPosOrdersViewScreen
        onBack={jest.fn()}
        pos={{ revenue: 142500, transactionCount: 12, heldSalesCount: 0 }}
      />,
    );

    expect(screen.getByText('₦142.5k')).toBeTruthy();
    expect(screen.getByText('/ 12 transactions')).toBeTruthy();
    expect(screen.queryByText(copy.heldSalesFor(0))).toBeNull();
  });

  it('shows the held-sales badge only when sales are stuck', async () => {
    const screen = await render(
      <BusinessPosOrdersViewScreen
        onBack={jest.fn()}
        pos={{ revenue: 5000, transactionCount: 2, heldSalesCount: 3 }}
      />,
    );

    expect(screen.getByText(copy.heldSalesFor(3))).toBeTruthy();
    expect(screen.queryByText(copy.volumeValue)).toBeNull();
  });

  it('falls back to the designed copy with no payload', async () => {
    const screen = await render(<BusinessPosOrdersViewScreen onBack={jest.fn()} />);

    expect(screen.getByText(copy.volumeValue)).toBeTruthy();
    expect(screen.getByText(copy.volumeMeta)).toBeTruthy();
    await act(async () => undefined);
  });
});

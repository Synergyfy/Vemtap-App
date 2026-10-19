import React from 'react';
import { render } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { toDiscoverBusiness } from '@features/discover/hooks/useDiscoverBusinesses';
import { BusinessDiscoveryCard } from '@components/discover/BusinessDiscoveryCard';

jest.mock('@store/authStore', () => ({
  useAuthStore: (selector: (state: { status: string }) => unknown) =>
    selector({ status: 'unauthenticated' }),
}));

const listed = {
  id: 'biz-1',
  name: 'Aurora Grill',
  uniqueCode: 'BIZ123XYZ',
  logoUrl: 'https://cdn.test/logo.png',
  coverImage: 'https://cdn.test/cover.png',
  isVerified: true,
  slug: 'aurora-main',
  branchCode: 'BR123ABC',
};

describe('business banner on the Business tab', () => {
  it('opens the profile by the business code, not the branch slug', () => {
    // The by-code lookup 404s on a branch slug, which left the profile on the
    // card's data, without the banner.
    expect(toDiscoverBusiness(listed).branchCode).toBe('BIZ123XYZ');
    expect(toDiscoverBusiness({ ...listed, uniqueCode: null }).branchCode).toBe(
      'aurora-main',
    );
  });

  it('shows the banner on the card, and the logo only without one', async () => {
    const client = new QueryClient();
    const card = (business: typeof listed) => (
      <QueryClientProvider client={client}>
        <BusinessDiscoveryCard
          business={toDiscoverBusiness(business)}
          onOpen={jest.fn()}
        />
      </QueryClientProvider>
    );
    const withBanner = await render(card(listed));
    const alt = toDiscoverBusiness(listed).imageAlt;
    const image = () => withBanner.getByLabelText(alt).props.source.uri;
    expect(image()).toBe('https://cdn.test/cover.png');

    await withBanner.rerender(card({ ...listed, coverImage: null as never }));
    expect(image()).toBe('https://cdn.test/logo.png');
    client.clear();
  });
});

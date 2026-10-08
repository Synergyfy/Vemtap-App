import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TabNavigator } from '@navigation/TabNavigator';
import { UrbanGrillProfileScreen } from '@features/discover/screens/UrbanGrillProfileScreen';
import { UrbanGrillProductsCatalogueScreen } from '@features/discover/screens/UrbanGrillProductsCatalogueScreen';
import { UrbanGrillMenuScreen } from '@features/discover/screens/UrbanGrillMenuScreen';
import { UrbanGrillAllDealsScreen } from '@features/discover/screens/UrbanGrillAllDealsScreen';
import { GlowSerenityProfileScreen } from '@features/discover/screens/GlowSerenityProfileScreen';
import { GlowSerenityServicesScreen } from '@features/discover/screens/GlowSerenityServicesScreen';

// Home reads the live offers feed through React Query, so any test that mounts
// the real shell needs the feed double (and its neutral engagement hooks).
jest.mock('@features/deals/hooks/usePublicOffers', () =>
  jest.requireActual('./helpers/mockOffersFeed').mockOffersFeedModule(),
);
jest.mock('@features/deals/hooks/useDealEngagementActions', () =>
  jest.requireActual('./helpers/mockOffersFeed').mockDealEngagementActionsModule(),
);
jest.mock('@features/discover/hooks/useDiscoverBusinesses', () => ({
  useDiscoverBusinesses: jest.fn(() => ({
    data: [
      {
        id: 'urban-grill',
        image: { uri: 'https://example.test/logo.png' },
        name: 'Urban Grill & Bistro',
        category: 'Food & Dining',
        categoryFilter: 'Food & Dining',
        imageAlt: 'Urban Grill & Bistro',
        rating: '',
        reviews: 0,
        distance: '',
        location: 'Apo Boulevard, Abuja',
        activeDealLabel: '',
        status: { label: 'Verified Partner', icon: 'verified' },
        branchCode: 'URBANGRLL',
      },
      {
        id: 'glow-serenity',
        image: { uri: 'https://example.test/logo.png' },
        name: 'Glow & Serenity Spa',
        category: 'Beauty & Wellness',
        categoryFilter: 'Beauty & Wellness',
        imageAlt: 'Glow & Serenity Spa',
        rating: '',
        reviews: 0,
        distance: '',
        location: 'Maitama Heights',
        activeDealLabel: '',
        status: { label: 'Verified Partner', icon: 'verified' },
        branchCode: 'GLOWSERE',
      },
      {
        id: 'sole-district',
        image: { uri: 'https://example.test/logo.png' },
        name: 'Sole District Boutique',
        category: 'Fashion & Apparel',
        categoryFilter: 'Fashion & Apparel',
        imageAlt: 'Sole District Boutique',
        rating: '',
        reviews: 0,
        distance: '',
        location: 'Area 11 Arcade',
        activeDealLabel: '',
        status: { label: 'VEMTAP Exclusive', icon: 'exclusive' },
        branchCode: 'SOLEDIST',
      },
      {
        id: 'sky-lounge',
        image: { uri: 'https://example.test/logo.png' },
        name: 'The Sky Lounge & Grill',
        category: 'Food & Dining',
        categoryFilter: 'Food & Dining',
        imageAlt: 'The Sky Lounge & Grill',
        rating: '',
        reviews: 0,
        distance: '',
        location: 'Maitama Heights, Abuja',
        activeDealLabel: '',
        status: { label: 'Verified Partner', icon: 'verified' },
        branchCode: 'SKYLOUNG',
      },
      {
        id: 'cafe-neo',
        image: { uri: 'https://example.test/logo.png' },
        name: 'Cafe Neo Artisanal',
        category: 'Food & Dining',
        categoryFilter: 'Food & Dining',
        imageAlt: 'Cafe Neo Artisanal',
        rating: '',
        reviews: 0,
        distance: '',
        location: 'Wuse II',
        activeDealLabel: '',
        status: { label: 'Verified Partner', icon: 'verified' },
        branchCode: 'CAFENEO',
      },
    ],
    isLoading: false,
    isError: false,
  })),
}));

jest.mock('@api/publicBusinessApi', () => ({
  publicBusinessApi: {
    getByCode: jest.fn(async (code: string) => {
      const businesses: Record<string, any> = {
        URBANGRLL: {
          id: 'urban-grill',
          name: 'Urban Grill & Bistro',
          category: 'Food & Dining',
          categoryFilter: 'Food & Dining',
          imageUri: 'https://example.test/logo.png',
          imageAlt: 'Urban Grill & Bistro',
          rating: '4.8',
          reviews: 142,
          distance: '0.8 km away',
          location: 'Apo Boulevard, Abuja',
          activeDealLabel: '3 Active Deals (Save up to ₦2,400)',
          status: { label: 'Verified Partner', icon: 'verified' },
          latitude: 9.0765,
          longitude: 7.5186,
          description: 'Modern restaurant with open grill kitchen',
          phone: '+234 800 123 4567',
          whatsappNumber: '+234 800 123 4567',
          website: 'https://urban-grill.example',
          openingHours: { monday: { from: '09:00', to: '22:00', isClosed: false } },
          isVerified: true,
        },
        GLOWSERE: {
          id: 'glow-serenity',
          name: 'Glow & Serenity Spa',
          category: 'Beauty & Wellness',
          categoryFilter: 'Beauty & Wellness',
          imageUri: 'https://example.test/logo.png',
          imageAlt: 'Glow & Serenity Spa',
          rating: '4.9',
          reviews: 96,
          distance: '1.4 km away',
          location: 'Maitama Heights',
          activeDealLabel: '2 Active Deals (Save up to ₦6,500)',
          status: { label: 'Verified Partner', icon: 'verified' },
          latitude: 9.0567,
          longitude: 7.4969,
          description: 'Luxury spa and wellness clinic',
          phone: '+234 800 987 6543',
          whatsappNumber: '+234 800 987 6543',
          website: 'https://glow-serenity.example',
          openingHours: { monday: { from: '09:00', to: '20:00', isClosed: false } },
          isVerified: true,
        },
      };
      const business = businesses[code];
      if (!business) {
        throw new Error('Not found');
      }
      return business;
    }),
  },
  publicBusinessKeys: {
    byCode: (code: string) => ['business', 'public', code],
  },
}));

const navigation = {
  goBack: jest.fn(),
  navigate: jest.fn(),
};

/**
 * The shell, mounted the way the app mounts it.
 *
 * The QueryClientProvider is not incidental: the Discover profile screen reads
 * the public business endpoint through React Query, and `useQuery` requires that
 * context even when the fetch is disabled (a bundled profile passes no code).
 */
async function renderShell() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const screen = await render(
    <QueryClientProvider client={client}>
      <NavigationContainer>
        <TabNavigator />
      </NavigationContainer>
    </QueryClientProvider>,
  );
  client.clear();
  return screen;
}

beforeEach(() => {
  jest.clearAllMocks();
});

test('opens businesses feed inside Discover tab', async () => {
  const screen = await renderShell();

  await fireEvent.press(await screen.findByLabelText(/Discover, tab/i));
  expect(await screen.findByText('Businesses Near You')).toBeTruthy();
  expect(screen.getByLabelText(/Home, tab/i).props.accessibilityState).toMatchObject({
    selected: false,
  });
  expect(screen.getByLabelText(/Discover, tab/i).props.accessibilityState).toMatchObject({
    selected: true,
  });
  expect(screen.getByLabelText(/Deals, tab/i)).toBeTruthy();
  expect(screen.getByLabelText(/Saved, tab/i)).toBeTruthy();
  expect(screen.getByLabelText(/Account, tab/i)).toBeTruthy();
});

test('keeps Discover active when Urban Grill profile is pushed', async () => {
  const screen = await renderShell();

  await fireEvent.press(await screen.findByLabelText(/Discover, tab/i));
  await fireEvent.press(await screen.findByLabelText('View Urban Grill & Bistro'));

  expect((await screen.findAllByText('Urban Grill & Bistro')).length).toBeGreaterThan(0);
  expect(screen.getByLabelText(/Discover, tab/i).props.accessibilityState).toMatchObject({
    selected: true,
  });
  expect(screen.getByLabelText(/Home, tab/i)).toBeTruthy();
  expect(screen.getByLabelText(/Account, tab/i)).toBeTruthy();
});

test('opens Glow profile while Discover remains selected', async () => {
  const screen = await renderShell();

  await fireEvent.press(await screen.findByLabelText(/Discover, tab/i));
  await fireEvent.press(await screen.findByLabelText('View Glow & Serenity Spa'));

  expect((await screen.findAllByText('Glow & Serenity Spa')).length).toBeGreaterThan(0);
  expect(screen.getByLabelText(/Discover, tab/i).props.accessibilityState).toMatchObject({
    selected: true,
  });
});

test('renders Urban Grill profile', async () => {
  const screen = await render(
    <UrbanGrillProfileScreen
      onBack={navigation.goBack}
      onOpenCatalogue={navigation.navigate}
      onOpenMenu={navigation.navigate}
      onOpenAllDeals={navigation.navigate}
      onOpenDeal={navigation.navigate}
    />,
  );
  expect(screen.getByText('Popular Menu')).toBeTruthy();
});

test('renders Urban Grill products catalogue', async () => {
  const screen = await render(
    <UrbanGrillProductsCatalogueScreen onBack={navigation.goBack} />,
  );
  expect(screen.getByText('Kitchen Open Now')).toBeTruthy();
  expect(screen.getByText('Woodfire Aged Ribeye Steak (400g)')).toBeTruthy();
});

test('renders Urban Grill menu', async () => {
  const screen = await render(
    <UrbanGrillMenuScreen
      onBack={navigation.goBack}
      onOpenAllDeals={navigation.navigate}
    />,
  );
  expect(screen.getByText(/Your Table Order/)).toBeTruthy();
  expect(screen.getByText('Woodfire Grilled Ribeye')).toBeTruthy();
});

test('renders Urban Grill all deals', async () => {
  const screen = await render(
    <UrbanGrillAllDealsScreen
      onBack={navigation.goBack}
      onOpenDeal={navigation.navigate}
    />,
  );
  expect(screen.getByText('Current Deals')).toBeTruthy();
  expect(screen.getAllByText('Claim Deal')).toHaveLength(3);
  expect(screen.getByText("Chef's Signature Dinner Platter for Two")).toBeTruthy();
  expect(screen.getByText('Gourmet Wagyu Burger & Truffle Fries')).toBeTruthy();
  expect(screen.getByText('Explore Neighborhood')).toBeTruthy();
  expect(screen.getByTestId('urban-deal-featured-card').props.className).toContain(
    'w-full',
  );
  expect(screen.getByTestId('urban-deal-card-dinner-platter').props.className).toContain(
    'self-center',
  );
});

test('renders Glow profile', async () => {
  const screen = await render(
    <GlowSerenityProfileScreen
      onBack={navigation.goBack}
      onOpenServices={navigation.navigate}
      onOpenDeal={navigation.navigate}
    />,
  );
  expect(screen.getByText('Popular Services')).toBeTruthy();
  expect(screen.getByText('Connect with Salon')).toBeTruthy();
});

test('renders Glow service catalogue', async () => {
  const screen = await render(<GlowSerenityServicesScreen onBack={navigation.goBack} />);
  expect(screen.getByText('2 Services Selected')).toBeTruthy();
  expect(screen.getByText('Signature Executive Cut & Scalp Wash')).toBeTruthy();
});

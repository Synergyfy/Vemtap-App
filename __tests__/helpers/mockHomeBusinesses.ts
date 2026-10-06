/**
 * Home now reads businesses through React Query as well as offers, so a bare
 * `render(<HomeScreen />)` needs the client the app supplies at the root.
 */
export const mockHomeBusinessesModule = () => ({
  useNearbyBusinesses: jest.fn(() => ({
    data: [
      {
        id: 'business-1',
        image: { uri: 'https://example.test/logo.png' },
        name: 'Cafe Aroma',
        category: 'Cafe',
        distance: '',
        rating: '',
        ratingCount: '',
        meta: 'Verified',
      },
    ],
  })),
});

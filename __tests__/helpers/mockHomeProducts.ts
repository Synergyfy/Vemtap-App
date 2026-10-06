/**
 * Products live on the same public catalogue as the businesses section. The API
 * returns no products today, so the double mirrors that rather than inventing
 * rows the real endpoint would never send.
 */
export const mockHomeProductsModule = () => ({
  useNearbyProducts: jest.fn(() => ({ data: [] })),
});

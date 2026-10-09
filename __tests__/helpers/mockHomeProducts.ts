/**
 * Products come from the public catalogue (`GET /products`), which is a real
 * catalogue-item feed now. This double deliberately returns no rows so Home's
 * empty-state tests stay deterministic — it does not claim the endpoint is
 * empty (the live contract suite asserts real rows).
 */
export const mockHomeProductsModule = () => ({
  useNearbyProducts: jest.fn(() => ({ data: [] })),
});

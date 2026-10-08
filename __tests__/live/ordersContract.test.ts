/**
 * Live contract test for the customer orders API.
 *
 * The Orders tab in the personal hub reads `GET /catalogue/orders/my-orders`.
 * The OpenAPI spec declares an empty 200 block for it, so the response envelope
 * is not knowable from the spec — this test proves it against the real server
 * instead, and proves our Zod union (`customerOrdersSchema`) accepts whatever
 * comes back rather than throwing a validation error in the app.
 *
 * It signs in through `authApi.login` and stores the token with `setTokenPair`,
 * so the request travels the same path the app uses: token into secure storage,
 * read back by the client's auth interceptor. That path only works because the
 * `expo-secure-store` stub in `jest.setup.js` round-trips values.
 *
 * What it can and cannot prove:
 *  - Proved: the envelope is a bare array our client parses, the endpoint is
 *    bearer-protected, and role separation holds (a customer cannot read the
 *    admin list).
 *  - Not proved: the per-item field shape. That needs an account that has
 *    actually placed an order; a freshly registered customer returns an empty
 *    array, which validates but exercises no item fields.
 *
 * Opt in with LIVE_API_TESTS=1 and LIVE_TEST_IDENTIFIER / LIVE_TEST_PASSWORD;
 * skipped by default so `npm run verify` stays hermetic and offline.
 */
import { authApi } from '@api/authApi';
import { ordersApi, customerOrdersSchema } from '@api/ordersApi';
import { request } from '@api/client';
import { ApiError } from '@api/ApiError';
import { setTokenPair, removeSecureItem } from '@utils/secureStorage';

const LIVE = process.env.LIVE_API_TESTS === '1';
const identifier = process.env.LIVE_TEST_IDENTIFIER;
const password = process.env.LIVE_TEST_PASSWORD;
const hasCreds = Boolean(identifier && password);
const describeLive = LIVE && hasCreds ? describe : describe.skip;

/** Signs in and persists the session exactly as the app does. */
async function signIn() {
  const session = await authApi.login({ identifier, password });
  await setTokenPair({ accessToken: session.access_token });
}

describeLive('customer orders — live contract', () => {
  jest.setTimeout(30_000);

  /**
   * Secure storage round-trips within a file, so a token minted by one test
   * would still be attached to the next request. Each test signs in for
   * itself; starting signed out keeps the unauthenticated assertion honest.
   */
  beforeEach(async () => {
    await removeSecureItem('accessToken');
  });

  it('returns a bare array that customerOrdersSchema accepts', async () => {
    await signIn();

    const orders = await ordersApi.getMyOrders();

    expect(Array.isArray(orders)).toBe(true);
    // Empty is a valid, healthy answer for a customer with no orders — the
    // point is that the call resolves instead of rejecting on the envelope.
    for (const order of orders) {
      expect(typeof order.id).toBe('string');
      expect(order.items).toEqual(expect.any(Array));
    }

    // With an order on the account, the transform must recover the display
    // fields the wire shape does not carry: the label lives in the nested
    // `item` and the price in `priceAtOrder`, neither of which is spelled the
    // way the UI reads them.
    const line = orders.flatMap(order => order.items ?? [])[0];
    if (line) {
      expect(line.name).toBeTruthy();
      expect(line.unitPrice).not.toBeNull();
      expect(line.totalPrice).toEqual(
        typeof line.unitPrice === 'number'
          ? line.unitPrice * line.quantity
          : expect.any(Number),
      );
    }
  });

  it('parses the raw payload through the same schema the client uses', async () => {
    await signIn();

    const raw = (await request<unknown>({
      method: 'GET',
      url: '/catalogue/orders/my-orders',
    })) as unknown;

    expect(Array.isArray(raw)).toBe(true);
    expect(customerOrdersSchema.safeParse(raw).success).toBe(true);
  });

  it('refuses an unauthenticated request', async () => {
    const error = await ordersApi.getMyOrders().catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(401);
  });

  it('keeps a customer away from the admin order list', async () => {
    await signIn();

    const error = await request<unknown>({
      method: 'GET',
      url: '/catalogue/orders',
      params: { page: 1, limit: 1 },
    }).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(403);
  });
});

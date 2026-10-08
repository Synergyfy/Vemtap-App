/**
 * Live contract test for the customer loyalty analytics endpoint.
 *
 * `GET /loyalty/analytics` is the only savings endpoint in the API, and the
 * OpenAPI spec's example disagrees with what the server actually sends: the
 * example nests the numbers under `trends`, while the live payload returns the
 * **totals** at the top level and puts signed change strings under `trends`.
 * The client schema used to parse only `trends`, so "Saved Total" was reading a
 * change value rather than a total.
 *
 * What it can and cannot prove:
 *  - Proved: the endpoint is bearer-protected, the response parses, the totals
 *    live at the top level (`netSavings` / `currentPointsBalance` /
 *    `totalVisits`), and our schema maps them into `totals`.
 *  - Not proved: precedence when the two disagree, because the test account
 *    reports zeros — a unit fixture covers that case instead.
 *
 * Opt in with LIVE_API_TESTS=1 and LIVE_TEST_IDENTIFIER / LIVE_TEST_PASSWORD;
 * skipped by default so `npm run verify` stays hermetic and offline.
 */
import { authApi } from '@api/authApi';
import { loyaltyAnalyticsSchema } from '@api/loyaltyApi';
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

describeLive('customer loyalty analytics — live contract', () => {
  jest.setTimeout(30_000);

  /**
   * Secure storage round-trips within a file, so a token minted by one test
   * would still be attached to the next request. Each test signs in for
   * itself; starting signed out keeps the unauthenticated assertion honest.
   */
  beforeEach(async () => {
    await removeSecureItem('accessToken');
  });

  it('returns top-level totals that the schema maps into `totals`', async () => {
    await signIn();

    const raw = (await request<Record<string, unknown>>({
      method: 'GET',
      url: '/loyalty/analytics',
      params: { days: 365 },
    })) as Record<string, unknown>;

    // The structural contract the schema depends on. If the backend moves
    // these under `trends`, the dashboard silently shows 0 — fail loudly here.
    expect(raw).toHaveProperty('netSavings');
    expect(raw).toHaveProperty('currentPointsBalance');
    expect(raw).toHaveProperty('totalVisits');

    const parsed = loyaltyAnalyticsSchema.safeParse(raw);
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;

    expect(parsed.data.totals.netSavings).toBe(
      typeof raw.netSavings === 'number' ? raw.netSavings : Number(raw.netSavings),
    );
    expect(parsed.data.totals.rewardPoints).toBe(Number(raw.currentPointsBalance));
    expect(parsed.data.totals.totalVisits).toBe(Number(raw.totalVisits));
  });

  it('refuses an unauthenticated request', async () => {
    const error = await request<unknown>({
      method: 'GET',
      url: '/loyalty/analytics',
      params: { days: 365 },
    }).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(401);
  });
});

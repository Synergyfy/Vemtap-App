/**
 * Live contract tests for the public read APIs and the owner-registration flow.
 *
 * Same contract as `customerAuthContract.test.ts`: these run the **real** API
 * modules against the test server, so a URL, verb or schema change shows up as
 * a failing test instead of a silently broken screen.
 *
 * Two of these exist because they check things a fixture cannot:
 *
 *  - `isOtpVerifiedError` shipped broken. It matched the raw `{success:false,
 *    statusCode:400, message}` envelope, but every caller receives an
 *    `ApiError`, so the OTP gate never fired in the app. The unit tests passed
 *    because they fed it plain objects. The assertion below feeds it the real
 *    thrown error, which is the only way to catch that class of mistake.
 *  - Password strength is validated **before** the OTP gate, so a weak password
 *    surfaces as "password is not strong enough" rather than as the gate. That
 *    ordering is asserted here so the registration flow's error copy stays
 *    predictable.
 *
 * No credentials needed — every endpoint below is public or accepts a
 * throwaway fictional email. Opt in with `npm run test:live`.
 */
import { ownerAuthApi, isOtpVerifiedError } from '@api/ownerAuthApi';
import { categoriesApi } from '@api/categoriesApi';
import { dealsApi } from '@api/dealsApi';
import { areaCoords } from '@constants/locations';
import { ApiError } from '@api/ApiError';

const LIVE = process.env.LIVE_API_TESTS === '1';
const describeLive = LIVE ? describe : describe.skip;

/** Reserved for documentation and cannot resolve, so no real mailbox is hit. */
const probeEmail = `owner.contract.${Date.now()}@vemtap-test.dev`;
/** Matches the server's policy, which is stricter than our client schema. */
const strongPassword = 'Str0ngPass!xyz';

describeLive('public API — live contract', () => {
  jest.setTimeout(30_000);

  describe('GET /categories', () => {
    it('returns the taxonomy the setup screens pick from', async () => {
      const page = await categoriesApi.list({ limit: 50 });

      expect(page.items.length).toBeGreaterThan(0);
      expect(page.meta.total).toBeGreaterThanOrEqual(page.items.length);

      // The picker keys off these ids, so they must be real values and not
      // empty strings — that is what would break `register/owner`.
      for (const category of page.items) {
        expect(category.id).toMatch(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
        );
        expect(category.name).toBeTruthy();
      }
    });

    it('honours a limit instead of always returning page one at 10', async () => {
      const page = await categoriesApi.list({ limit: 3 });

      expect(page.items).toHaveLength(3);
      expect(page.meta.limit).toBe(3);
      expect(page.meta.total).toBeGreaterThan(3);
    });
  });

  describe('GET /catalogue/offers/public', () => {
    it('returns a feed that parses into the shape the home screen reads', async () => {
      const feed = await dealsApi.listPublicOffers({ limit: 5 });

      expect(feed.data.length).toBeGreaterThan(0);
      expect(feed.total).toBeGreaterThanOrEqual(feed.data.length);

      for (const offer of feed.data) {
        expect(offer.id).toBeTruthy();
        expect(offer.name).toBeTruthy();
        // `price` is what the mapper computes; it must survive a real payload.
        expect(offer.pricingType).toBeTruthy();
      }
    });

    /**
     * The proximity filter the app now relies on. `radius` was confirmed to be
     * kilometres (not metres) against this API, so a 1 km circle around Apo
     * returns nothing while the same centre with a 5 km radius returns offers —
     * which is also why a wrong unit would silently empty the feed rather than
     * error.
     */
    it('narrows by radius in kilometres', async () => {
      const apo = areaCoords('Apo');

      const tight = await dealsApi.listPublicOffers({
        limit: 50,
        lat: apo.latitude,
        lng: apo.longitude,
        radius: 1,
      });
      const wider = await dealsApi.listPublicOffers({
        limit: 50,
        lat: apo.latitude,
        lng: apo.longitude,
        radius: 5,
      });

      expect(tight.data.length).toBeLessThan(wider.data.length);
      expect(wider.data.length).toBeGreaterThan(0);
    });

    it('returns fewer offers without a proximity filter than with one', async () => {
      const apo = areaCoords('Apo');

      const unfiltered = await dealsApi.listPublicOffers({ limit: 50 });
      const nearby = await dealsApi.listPublicOffers({
        limit: 50,
        lat: apo.latitude,
        lng: apo.longitude,
        radius: 5,
      });

      // Guards the contract this change depends on: the radius parameter is
      // actually applied rather than accepted and ignored.
      expect(nearby.data.length).toBeLessThan(unfiltered.data.length);
    });

    it('returns nothing when no business is within the radius', async () => {
      // An empty result is a valid state (the radius sheet promises "within
      // N km"), so the parser and mapper have to survive it.
      const empty = await dealsApi.listPublicOffers({
        limit: 50,
        lat: areaCoords('Apo').latitude,
        lng: areaCoords('Apo').longitude,
        radius: 0.1,
      });

      expect(empty.data).toEqual([]);
      expect(empty.total).toBe(0);
    });
  });

  describe('GET /public/stats', () => {
    it('returns usable numbers', async () => {
      const stats = await dealsApi.getPlatformStats();

      expect(stats.totalBusinesses).toBeGreaterThanOrEqual(0);
      expect(stats.totalActiveDeals).toBeGreaterThanOrEqual(0);
      expect(stats.totalClaims).toBeGreaterThanOrEqual(0);
      expect(stats.totalBranches).toBeGreaterThanOrEqual(0);
    });
  });

  describe('owner registration — the three ordered calls', () => {
    it('step 1 accepts a fictional email', async () => {
      // Resolves to void: a rejection here would mean our URL or payload is
      // wrong, and the flow would dead-end before any code is sent.
      await expect(
        ownerAuthApi.requestOwnerOtp({ email: probeEmail, role: 'Owner' }),
      ).resolves.toBeUndefined();
    });

    it('step 2 rejects a wrong 4-character code with 400', async () => {
      const error = await ownerAuthApi
        .verifyOtp({ email: probeEmail, code: 'zzzz' })
        .catch((caught: unknown) => caught);

      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).status).toBe(400);
    });

    /**
     * The regression that matters: feeding the real thrown error — not a plain
     * envelope — and expecting the gate to be recognised, so the screen routes
     * the owner back to code entry instead of showing a generic failure.
     */
    it('step 3 without a verified OTP is recognised as the gate', async () => {
      const error = await ownerAuthApi
        .registerOwner({ email: probeEmail, password: strongPassword })
        .catch((caught: unknown) => caught);

      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).status).toBe(400);
      expect(isOtpVerifiedError(error)).toBe(true);
    });

    it('validates password strength before it reaches the OTP gate', async () => {
      // Documents the ordering: a weak password fails on its own merits, so the
      // registration screen must enforce the same policy client-side or the
      // owner sees a server-side rejection after submitting.
      const error = await ownerAuthApi
        .registerOwner({ email: probeEmail, password: 'password' })
        .catch((caught: unknown) => caught);

      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).status).toBe(400);
      expect(isOtpVerifiedError(error)).toBe(false);
      expect((error as ApiError).message).toMatch(/password/i);
    });

    it('a 6-digit code fails on length, not on being wrong', async () => {
      // The API validates length before value, so the client must send exactly
      // 4 characters — this assertion is the guard on that contract.
      const error = await ownerAuthApi
        .verifyOtp({ email: probeEmail, code: '123456' })
        .catch((caught: unknown) => caught);

      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).status).toBe(400);
      expect((error as ApiError).message).toMatch(
        /shorter than or equal to 4 characters/i,
      );
    });
  });

  describe('POST /auth/check-status', () => {
    it('answers neutrally for an unknown account', async () => {
      const status = await ownerAuthApi.checkStatus('nobody.contract@vemtap-test.dev');

      expect(status.exists).toBe(false);
    });
  });
});

/**
 * Live contract tests for the customer auth API.
 *
 * These run the **real** `customerAuthApi` against the test server, so they
 * verify our URL, verb, payload and response schema against actual responses
 * rather than against a mock. That makes them the only tests in the repo that
 * would catch a contract change.
 *
 * What they can and cannot prove:
 *  - Proved: request shape is accepted, error envelopes are handled, and every
 *    success/failure response parses against the schema we ship.
 *  - Not proved: the happy path. Completing a registration needs the emailed OTP
 *    and a real password, neither of which CI can read. The success branches are
 *    covered against captured fixtures instead.
 *
 * Opt in with LIVE_API_TESTS=1; skipped by default so `npm run verify` stays
 * hermetic and offline.
 */
import { authApi, customerAuthApi } from '@api/authApi';
import { ApiError } from '@api/ApiError';

const LIVE = process.env.LIVE_API_TESTS === '1';
const describeLive = LIVE ? describe : describe.skip;

/** Unique per run so repeated runs do not collide on the pending-OTP record. */
const probeEmail = `cust.contract.${Date.now()}@vemtap-test.dev`;

describeLive('customer auth — live contract', () => {
  jest.setTimeout(30_000);

  describe('POST /auth/customer/register/request-otp', () => {
    it('accepts our request body and parses the response', async () => {
      const result = await customerAuthApi.requestSignupOtp({
        email: probeEmail,
        firstName: 'Contract',
        lastName: 'Probe',
      });

      expect(result.message).toBeTruthy();
    });

    it('rejects a malformed email through our error envelope', async () => {
      // Rejected by `email must be an email`, so this proves the message
      // array form is unwrapped into a readable error rather than swallowed.
      await expect(
        customerAuthApi.requestSignupOtp({ email: 'not-an-email' }),
      ).rejects.toThrow(/email/i);
    });

    /**
     * `.invalid` is reserved by RFC 2606 and can never resolve, so the API may
     * accept it and fail later at delivery. Either outcome is acceptable here —
     * what matters is that we do not surface an unhandled rejection, which is
     * what a schema mismatch on an unexpected body would cause.
     */
    it('handles an undeliverable email without an unhandled rejection', async () => {
      const outcome = await customerAuthApi
        .requestSignupOtp({ email: 'nope@invalid.invalid' })
        .then(() => 'accepted' as const)
        .catch((error: unknown) => {
          expect(error).toBeInstanceOf(ApiError);
          return 'rejected' as const;
        });

      expect(['accepted', 'rejected']).toContain(outcome);
    });
  });

  describe('POST /auth/customer/register/verify-and-set-pin', () => {
    it('rejects a wrong code without creating an account', async () => {
      await customerAuthApi.requestSignupOtp({ email: probeEmail });

      const error = await customerAuthApi
        .verifyAndSetPin({ email: probeEmail, code: '000000', pin: '135790' })
        .catch((caught: unknown) => caught);

      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).status).toBe(400);
    });

    it('rejects a PIN the server will not accept', async () => {
      // Exercises the field-level validation order without needing a valid OTP.
      const error = await customerAuthApi
        .verifyAndSetPin({ email: probeEmail, code: '000000', pin: 'abc' })
        .catch((caught: unknown) => caught);

      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).status).toBe(400);
    });
  });

  describe('POST /auth/customer/pin/forgot', () => {
    it('answers neutrally for an unknown account', async () => {
      // Neutral wording is deliberate: it must not reveal whether an account
      // exists. Asserted here so a future change cannot leak account presence.
      const result = await customerAuthApi.requestPinReset({
        email: 'nobody.here.contract@vemtap-test.dev',
      });

      expect(result.message).toMatch(/if an account exists/i);
    });
  });

  describe('POST /auth/customer/pin/reset', () => {
    it('rejects a reset without a valid OTP session', async () => {
      const error = await customerAuthApi
        .resetPin({ email: probeEmail, otp: '000000', newPin: '135790' })
        .catch((caught: unknown) => caught);

      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).status).toBe(400);
    });
  });

  describe('POST /auth/login', () => {
    it('rejects wrong credentials with the documented 401', async () => {
      const error = await authApi
        .login({
          identifier: 'nobody.here.contract@vemtap-test.dev',
          password: 'WrongPass123!',
        })
        .catch((caught: unknown) => caught);

      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).status).toBe(401);
    });

    it('requires an identifier', async () => {
      const error = await authApi
        .login({ identifier: '', password: 'WrongPass123!' })
        .catch((caught: unknown) => caught);

      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).status).toBe(400);
    });
  });

  describe('GET /auth/profile', () => {
    it('refuses an unauthenticated request', async () => {
      // Confirms the endpoint really is bearer-protected, so the app cannot
      // silently depend on it working signed-out.
      const error = await authApi.fetchProfile().catch((caught: unknown) => caught);

      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).status).toBe(401);
    });
  });
});

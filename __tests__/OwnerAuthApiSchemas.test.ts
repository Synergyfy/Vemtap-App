import { messageResponseSchema } from '@api/authApi';
import {
  accountStatusSchema,
  isOtpVerifiedError,
  ownerOtpRequestSchema,
  ownerOtpVerifySchema,
  ownerRegistrationSchema,
} from '@api/ownerAuthApi';
import otpVerify from './fixtures/owner-otp-verify.json';
import requestOtp from './fixtures/owner-request-otp.json';
import checkStatus from './fixtures/owner-check-status.json';
import checkStatusMissing from './fixtures/owner-check-status-missing.json';

describe('owner OTP step', () => {
  test('request-otp returns a plain message', () => {
    expect(messageResponseSchema.safeParse(requestOtp).success).toBe(true);
  });

  test('request-otp requires a valid email', () => {
    expect(ownerOtpRequestSchema.safeParse({ email: 'not-an-email' }).success).toBe(
      false,
    );
    expect(ownerOtpRequestSchema.safeParse({ email: 'owner@vemtap.dev' }).success).toBe(
      true,
    );
  });

  test('verify returns a plain message', () => {
    expect(messageResponseSchema.safeParse(otpVerify).success).toBe(true);
  });

  /**
   * Live finding: the API validates code length before value, so a 6-digit code
   * is rejected with "code must be shorter than or equal to 4 characters" rather
   * than "Invalid OTP". Enforcing 4 client-side surfaces the mistake before the
   * request rather than after it.
   */
  test('the code is exactly 4 characters', () => {
    expect(
      ownerOtpVerifySchema.safeParse({ email: 'a@b.com', code: '1234' }).success,
    ).toBe(true);
    expect(
      ownerOtpVerifySchema.safeParse({ email: 'a@b.com', code: '123' }).success,
    ).toBe(false);
    expect(
      ownerOtpVerifySchema.safeParse({ email: 'a@b.com', code: '123456' }).success,
    ).toBe(false);
    expect(
      ownerOtpVerifySchema.safeParse({ email: 'a@b.com', code: 'abcd' }).success,
    ).toBe(true);
  });
});

describe('owner registration payload', () => {
  test('accepts a full business profile in one payload', () => {
    const parsed = ownerRegistrationSchema.safeParse({
      email: 'owner@vemtap.dev',
      password: 'SecurePass123!',
      firstName: 'Probe',
      lastName: 'Owner',
      businessName: 'Probe Test Store',
      categoryId: 'aa310aad-8ea2-46fe-8952-d62df47df045',
      visitors: '501-2000',
      goals: ['Capture Leads'],
      whatsappNumber: '08011112222',
      businessAddress: '1 Probe Way, Abuja',
      state: 'Federal Capital Territory',
      city: 'Abuja',
      latitude: 9.0567,
      longitude: 7.4969,
      isRegistered: false,
    });

    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(parsed.data.businessName).toBe('Probe Test Store');
    expect(parsed.data.goals).toEqual(['Capture Leads']);
    expect(parsed.data.latitude).toBeCloseTo(9.0567);
  });

  test('credentials alone are enough — profile fields are optional', () => {
    expect(
      ownerRegistrationSchema.safeParse({ email: 'o@v.dev', password: 'p' }).success,
    ).toBe(true);
  });

  test('requires a valid email and a password', () => {
    expect(ownerRegistrationSchema.safeParse({ password: 'p' }).success).toBe(false);
    expect(
      ownerRegistrationSchema.safeParse({ email: 'bad', password: 'p' }).success,
    ).toBe(false);
    expect(ownerRegistrationSchema.safeParse({ email: 'o@v.dev' }).success).toBe(false);
  });

  test('goals is a list of strings, not a single string', () => {
    const parsed = ownerRegistrationSchema.safeParse({
      email: 'o@v.dev',
      password: 'p',
      goals: 'Capture Leads',
    });
    expect(parsed.success).toBe(false);
  });
});

describe('account status', () => {
  test('carries the role and email for an account that exists', () => {
    const parsed = accountStatusSchema.safeParse(checkStatus);
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    // These are what let a returning owner be routed to sign-in, not signup.
    expect(parsed.data.exists).toBe(true);
    expect(parsed.data.role).toBe('Owner');
    expect(parsed.data.email).toBeTruthy();
    expect(parsed.data.hasRealEmail).toBe(true);
  });

  test('an unknown account returns only exists', () => {
    const parsed = accountStatusSchema.safeParse(checkStatusMissing);
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(parsed.data.exists).toBe(false);
    expect(parsed.data.role).toBeUndefined();
  });

  test('an empty body is not acceptable', () => {
    expect(accountStatusSchema.safeParse({}).success).toBe(false);
  });
});

describe('isOtpVerifiedError', () => {
  const gate = {
    success: false,
    statusCode: 400,
    timestamp: '2026-10-05T10:24:47.111Z',
    path: '/api/v1/auth/register/owner',
    method: 'POST',
    error: 'Bad Request',
    message: 'OTP must be verified before completing registration',
  };

  test('recognises the registration OTP gate', () => {
    expect(isOtpVerifiedError(gate)).toBe(true);
  });

  test('ignores unrelated failures', () => {
    expect(isOtpVerifiedError({ ...gate, message: 'Invalid OTP' })).toBe(false);
    expect(isOtpVerifiedError({ ...gate, message: ['code must be shorter'] })).toBe(
      false,
    );
    expect(isOtpVerifiedError(new Error('network down'))).toBe(false);
    expect(isOtpVerifiedError(undefined)).toBe(false);
  });

  test('tolerates a validated error with extra fields', () => {
    expect(isOtpVerifiedError({ ...gate, extra: 'ignored' })).toBe(true);
  });
});

/**
 * Live contract tests for the dual-role owner lifecycle.
 *
 * Same contract as `publicApiContract.test.ts`: these run the **real** API
 * modules against a real server, so a URL, verb, payload or schema change shows
 * up as a failing test rather than a silently broken screen.
 *
 * Coverage:
 *  - Auth enforcement for the three routes the business wizard depends on:
 *    `POST /auth/upgrade-to-owner`, `POST /auth/switch-role` and the
 *    authenticated `PATCH /businesses/my-business`.
 *  - Local happy paths (opt-in, see below): create owner → persist address →
 *    switch Customer ↔ Owner, and create customer → upgrade to owner → keep
 *    both sides.
 *
 * The happy paths need the OTP that would normally be emailed. Against a local
 * API the code is read straight from the dev database (`otps` table) via
 * `docker exec`. Against a remote host (e.g. testapi) that is impossible, so
 * only the auth-enforcement block runs there.
 *
 * Note: the local happy paths create real users/businesses in `vemtap_dev` on
 * every run. Emails are stamped with `Date.now()`, so runs never collide.
 *
 * Opt in with LIVE_API_TESTS=1:
 *
 *   LIVE_API_TESTS=1 EXPO_PUBLIC_API_BASE_URL=http://localhost:3002/api \
 *     EXPO_PUBLIC_API_VERSION=v1 npx jest __tests__/live/ownerLifecycleContract.test.ts
 */
import { API_BASE_URL_ORIGIN } from '@constants/config';
import { authApi, customerAuthApi } from '@api/authApi';
import { ownerAuthApi } from '@api/ownerAuthApi';
import { businessDashboardApi } from '@api/businessDashboardApi';
import { removeSecureItem, setTokenPair } from '@utils/secureStorage';

declare const require: (id: string) => unknown;
const { execFileSync } = require('child_process') as {
  execFileSync: (file: string, args: string[]) => { toString(): string };
};

const LIVE = process.env.LIVE_API_TESTS === '1';
const describeLive = LIVE ? describe : describe.skip;

/** The dev database is reached the same way `docker-compose.yml` exposes it. */
const isLocalTarget = /localhost|127\.0\.0\.1|10\.0\.2\.2/.test(API_BASE_URL_ORIGIN);

function localOtpReadable(): boolean {
  try {
    execFileSync('docker', [
      'exec',
      'vemtap-postgis',
      'psql',
      '-U',
      'postgres',
      '-d',
      'vemtap_dev',
      '-tAc',
      'select 1',
    ]);
    return true;
  } catch {
    return false;
  }
}

const canReadOtp = isLocalTarget && localOtpReadable();
const describeHappyPath = LIVE && canReadOtp ? describe : describe.skip;

/** Latest OTP the API just wrote for this address (request → insert is awaited). */
function readOtp(email: string): string {
  const code = execFileSync('docker', [
    'exec',
    'vemtap-postgis',
    'psql',
    '-U',
    'postgres',
    '-d',
    'vemtap_dev',
    '-tAc',
    `select code from otps where email='${email}' order by "createdAt" desc limit 1`,
  ])
    .toString()
    .trim();
  return code;
}

describeLive('owner lifecycle — auth enforcement', () => {
  jest.setTimeout(30_000);

  // A token from an earlier test would make the unauthenticated assertions lie.
  beforeEach(async () => {
    await removeSecureItem('accessToken');
  });

  it('POST /auth/upgrade-to-owner rejects an unauthenticated caller', async () => {
    await expect(ownerAuthApi.upgradeToOwner({ businessName: 'Probe' })).rejects.toThrow(
      /unauthorized/i,
    );
  });

  it('POST /auth/switch-role rejects an unauthenticated caller', async () => {
    await expect(authApi.switchRole({ role: 'Customer' })).rejects.toThrow(
      /unauthorized/i,
    );
  });

  it('PATCH /businesses/my-business rejects an unauthenticated caller', async () => {
    await expect(
      businessDashboardApi.updateMyBusiness({ address: 'Probe' }),
    ).rejects.toThrow(/unauthorized/i);
  });
});

describeHappyPath('owner lifecycle — happy path (local API + local DB OTP)', () => {
  jest.setTimeout(60_000);

  beforeEach(async () => {
    await removeSecureItem('accessToken');
  });

  it('registers an owner, persists the address, and switches both ways', async () => {
    const stamp = Date.now();
    const email = `owner.live.${stamp}@vemtap-test.dev`;
    const password = 'LiveProbe1!';
    const businessName = `Live Probe ${stamp}`;

    await ownerAuthApi.requestOwnerOtp({ email, role: 'Owner' });
    const code = readOtp(email);
    expect(code).toMatch(/^\d{4}$/);

    await ownerAuthApi.verifyOtp({ email, code });

    const session = await ownerAuthApi.registerOwner({
      email,
      password,
      firstName: 'Live',
      lastName: 'Probe',
      businessName,
    });
    expect(session.access_token).toBeTruthy();
    expect(session.user.role.toLowerCase()).toBe('owner');
    expect(session.user.businessId).toBeTruthy();
    await setTokenPair({ accessToken: session.access_token });

    // The location step's PATCH — the first authenticated write after signup.
    const address = `${stamp} Live Probe Way, Apo`;
    await businessDashboardApi.updateMyBusiness({
      address,
      city: 'Abuja',
      state: 'FCT',
    });
    const myBusiness = await businessDashboardApi.getMyBusiness();
    expect(myBusiness.address).toBe(address);

    const customer = await authApi.switchRole({ role: 'Customer' });
    await setTokenPair({ accessToken: customer.access_token });
    expect(customer.user.role.toLowerCase()).toBe('customer');
    // `nullableText` coerces the API's explicit null to '', so assert on absence
    // rather than identity: a customer-scoped token carries no business.
    expect(customer.user.businessId || null).toBeNull();

    const owner = await authApi.switchRole({ role: 'Owner' });
    await setTokenPair({ accessToken: owner.access_token });
    expect(owner.user.role.toLowerCase()).toBe('owner');
    expect(owner.user.businessId).toBe(session.user.businessId);
  });

  it('upgrades an existing customer to an owner and keeps both sides', async () => {
    const stamp = Date.now();
    const email = `customer.live.${stamp}@vemtap-test.dev`;
    const pin = '246810';
    const businessName = `Upgrade Probe ${stamp}`;

    await customerAuthApi.requestSignupOtp({
      email,
      firstName: 'Live',
      lastName: 'Customer',
    });
    const code = readOtp(email);
    expect(code).toMatch(/^\d{6}$/);

    const customerSession = await customerAuthApi.verifyAndSetPin({
      email,
      code,
      pin,
      firstName: 'Live',
      lastName: 'Customer',
    });
    await setTokenPair({ accessToken: customerSession.access_token });
    expect(customerSession.user.role.toLowerCase()).toBe('customer');

    // The customer's PIN is stored as their password hash, so the upgrade's
    // confirmation re-uses it.
    const upgraded = await ownerAuthApi.upgradeToOwner({
      businessName,
      password: pin,
      businessAddress: `${stamp} Upgrade Lane, Wuse`,
      city: 'Abuja',
      state: 'FCT',
    });
    await setTokenPair({ accessToken: upgraded.access_token });
    expect(upgraded.user.role.toLowerCase()).toBe('owner');
    expect(upgraded.user.businessId).toBeTruthy();

    // Both sides stay reachable.
    const backToCustomer = await authApi.switchRole({ role: 'Customer' });
    expect(backToCustomer.user.role.toLowerCase()).toBe('customer');

    const backToOwner = await authApi.switchRole({ role: 'Owner' });
    expect(backToOwner.user.role.toLowerCase()).toBe('owner');
    expect(backToOwner.user.businessId).toBe(upgraded.user.businessId);
  });
});

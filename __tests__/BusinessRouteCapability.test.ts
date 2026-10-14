import {
  BUSINESS_ROUTE_CAPABILITIES,
  capabilityForRoute,
} from '@features/business/routesCapability';

/**
 * The navigator is the single source of truth for which screens exist, so the
 * map is checked against the file itself rather than against a second hand-kept
 * list that could drift. The navigator is read at test time; the app's own
 * typecheck config intentionally omits node globals, so `fs` and `__dirname`
 * are declared here rather than loosened project-wide.
 */
declare const __dirname: string;
// eslint-disable-next-line global-require
const { readFileSync } = require('fs') as {
  readFileSync: (p: string, enc: string) => string;
};

const BUSINESS_SETUP_ROUTE_NAMES: string[] = (
  readFileSync(`${__dirname}/../src/navigation/BusinessSetupNavigator.tsx`, 'utf8').match(
    /name="[A-Za-z0-9]+"/g,
  ) ?? []
).map((match: string) => match.replace(/name="|"/g, ''));

describe('business route capability map', () => {
  const allMapped = BUSINESS_ROUTE_CAPABILITIES.flatMap(entry => entry.routes);

  test('covers every route in the business setup navigator', () => {
    const missing = BUSINESS_SETUP_ROUTE_NAMES.filter(name => !allMapped.includes(name));

    expect(missing).toEqual([]);
  });

  test('does not claim routes that do not exist', () => {
    const unknown = allMapped.filter(name => !BUSINESS_SETUP_ROUTE_NAMES.includes(name));

    expect(unknown).toEqual([]);
  });

  test('lists no duplicate route across entries', () => {
    const seen = new Set<string>();
    const dupes = allMapped.filter(name => {
      if (seen.has(name)) return true;
      seen.add(name);
      return false;
    });

    expect(dupes).toEqual([]);
  });

  test('every entry cites an endpoint or explains why it has none', () => {
    for (const entry of BUSINESS_ROUTE_CAPABILITIES) {
      if (entry.capability === 'no-endpoint') {
        expect(entry.note ?? '').not.toBe('');
      } else {
        expect(entry.endpoints.length).toBeGreaterThan(0);
      }
    }
  });

  /**
   * Verification now submits to bytID through the backend; this guards that the
   * map keeps pointing the screens at the verification endpoints rather than the
   * old "collect locally" note.
   */
  test('verification screens use the verification endpoints', () => {
    for (const route of [
      'VerifyYourIdentity',
      'IdVerification',
      'CacVerification',
      'UnregisteredBusiness',
      'BusinessVerificationStatusCenter',
    ]) {
      const entry = capabilityForRoute(route);
      expect(entry?.capability).toBe('available');
      expect(entry?.endpoints).toContain('GET /verification/status');
    }
    expect(capabilityForRoute('IdVerification')?.endpoints).toContain(
      'POST /verification/identity',
    );
    expect(capabilityForRoute('CacVerification')?.endpoints).toContain(
      'POST /verification/business',
    );
  });

  test('trial screens use the cardless trial endpoint', () => {
    expect(capabilityForRoute('FreeTrialConfirmation')?.endpoints).toContain(
      'POST /subscriptions/trial',
    );
  });
});

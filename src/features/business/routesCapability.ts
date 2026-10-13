/**
 * What the VEMTAP API can actually do for a business owner, mapped against the
 * routes in `BusinessSetupNavigator`.
 *
 * Read this before wiring a screen. Several routes look like they have a
 * backend but do not, and one whole section of the flow has no endpoint at all
 * — knowing which is which here is faster than searching the 693-path spec.
 *
 * `ownerAuthApi` covers registration only; everything below is a map, not code.
 */

/** Wired: a verified endpoint exists and the flow is implemented against it. */
export type RouteCapability =
  | 'wired'
  /** A read-only status exists, but nothing can be submitted from the app. */
  | 'status-only'
  /** No endpoint exists. The screen cannot talk to a backend. */
  | 'no-endpoint'
  /** Endpoint exists in the spec; not yet wired. */
  | 'available';

export interface BusinessRouteCapability {
  routes: string[];
  capability: RouteCapability;
  endpoints: string[];
  note?: string;
}

/**
 * Registration itself is three requests, and it happens *before* any of these
 * screens conceptually — the profile data they collect is batched into the same
 * `register/owner` payload, because the API has no separate "create profile
 * once signed in" call for a brand-new owner.
 */
export const REGISTRATION_FLOW: BusinessRouteCapability = {
  routes: ['BusinessProfileBasicInfo'],
  capability: 'available',
  endpoints: [
    'POST /auth/register/owner/request-otp',
    'POST /auth/otp/verify',
    'POST /auth/register/owner',
  ],
  note: 'Profile fields are pre-signup collection batched into register/owner.',
};

export const BUSINESS_ROUTE_CAPABILITIES: BusinessRouteCapability[] = [
  {
    routes: ['BusinessIntroduction'],
    capability: 'no-endpoint',
    endpoints: [],
    note: 'Onboarding splash. Local only by nature.',
  },
  {
    routes: [
      'BusinessAccountCredentials',
      'BusinessAccountOtp',
      'BusinessAccountResetPin',
    ],
    capability: 'available',
    endpoints: [
      'POST /auth/register/owner/request-otp',
      'POST /auth/otp/verify',
      'POST /auth/register/owner',
      'POST /auth/upgrade-to-owner',
      'POST /auth/customer/pin/forgot',
      'POST /auth/customer/pin/reset',
    ],
    note:
      'Account creation sits between the profile screens and the location ' +
      'screens so the rest of the wizard runs authenticated. A brand-new owner ' +
      'registers with a 4-character email code; an existing customer confirms ' +
      'their password (or continues one-tap with Google) and keeps both sides. ' +
      'The reset route is the signed-in PIN recovery reached from that confirm step.',
  },
  {
    routes: [
      'BusinessProfileBasicInfo',
      'BusinessProfileBranding',
      'BusinessProfileContactChannels',
    ],
    capability: 'available',
    endpoints: ['POST /auth/register/owner', 'PATCH /businesses/my-business'],
    note: 'Create goes in register/owner; later edits via my-business.',
  },
  {
    routes: ['BusinessLocation', 'BusinessLocations'],
    capability: 'available',
    endpoints: ['PATCH /businesses/my-business', 'GET /businesses/my-business'],
    note: 'Address, state, city, lat/lng all live on the business record.',
  },
  {
    routes: ['AddBranchLocation'],
    capability: 'available',
    endpoints: ['POST /branches', 'GET /branches/check-username/{username}'],
    note: 'Registration creates the first branch; extra branches need POST /branches.',
  },
  {
    routes: [
      'AddProductsOrServices',
      'AddServiceBasics',
      'AddServiceDurationPricing',
      'AddServiceAvailabilityRules',
      'ReviewServiceSummary',
      'ServicePublished',
      'AddProductLocationPricing',
      'AddProductBasics',
      'AddProductPricingVariants',
      'AddProductBranchAvailability',
      'ReviewProductSummary',
      'ProductPublished',
    ],
    capability: 'available',
    endpoints: [
      'POST /catalogue/items',
      'POST /catalogue/items/bulk',
      'PATCH /catalogue/items/{id}',
      'DELETE /catalogue/items/{id}',
    ],
    note: 'The many catalogue screens collapse into one item payload plus variants.',
  },
  {
    routes: [
      'ProductMakeDeal',
      'CreateDealAutoImported',
      'CreateDealStep1',
      'CreateDealStep2',
      'CreateDealStep3',
      'CreateDealStep4',
    ],
    capability: 'available',
    endpoints: ['POST /catalogue/offers'],
    note: 'Offer creation is admin-only per the spec summary — flag if owner creation 403s.',
  },
  {
    routes: ['BusinessQrReady'],
    capability: 'available',
    endpoints: [
      'GET /qr-thrive/branches/{branchId}/main-qr',
      'POST /qr-thrive/branches/{branchId}/main-qr/recreate',
      'POST /qr-thrive/branches/{branchId}/qr-codes',
    ],
  },
  {
    routes: [
      'VerifyYourBusiness',
      'VerifyYourIdentity',
      'IdVerification',
      'IdVerificationSuccess',
      'IdVerificationNeedsReview',
      'BusinessRegistration',
      'CacVerification',
      'UnregisteredBusiness',
      'CacVerificationSuccess',
      'VerificationInProgress',
      'YouReVerified',
    ],
    capability: 'no-endpoint',
    endpoints: [],
    note:
      'There is no document, CAC, NIN or upload endpoint anywhere in the API. ' +
      'These screens collect locally and never submit. Approval is admin-side ' +
      '(`/businesses/admin/pending-verification` → `/approve` | `/reject`).',
  },
  {
    routes: ['BusinessVerificationStatusCenter'],
    capability: 'status-only',
    endpoints: ['POST /auth/check-status', 'GET /businesses/my-business'],
    note: 'The only backend truth for verification is the business status.',
  },
  {
    routes: [
      'FreeTrialConfirmation',
      'BusinessPlanTrialOverview',
      'TrialActiveStatus',
      'SubscribeNowPayment',
      'PaymentSuccessVemtapGrowth',
      'TrialEndingRenewGrowth',
      'TrialExpiredReactivate',
    ],
    capability: 'available',
    endpoints: [
      'GET /subscriptions/active',
      'GET /subscriptions/price-preview',
      'GET /subscriptions/capabilities',
      'POST /subscriptions/subscribe',
      'POST /subscriptions/initialize-payment',
      'POST /subscriptions/cancel',
      'GET /payments/verify/{reference}',
    ],
    note: 'Paystack-backed. Owner cancelling a subscription is business-scoped.',
  },
  {
    routes: ['VemtapAddOns'],
    capability: 'available',
    endpoints: [
      'GET /addons',
      'GET /addons/my',
      'GET /addons/my/active',
      'POST /addons/purchase',
      'DELETE /addons/{businessAddonId}/cancel',
    ],
  },
];

export function capabilityForRoute(route: string): BusinessRouteCapability | undefined {
  return BUSINESS_ROUTE_CAPABILITIES.find(entry => entry.routes.includes(route));
}

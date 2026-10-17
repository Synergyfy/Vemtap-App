/**
 * Params that open the live claimed-deal pass for an offer from anywhere in the
 * customer app. The pass lives in the personal hub, nested under the Account
 * tab, and is reached through the hub overview's deep link so Back returns to
 * the hub rather than leaving the stack empty.
 */
export function claimPassParams(dealId: string) {
  return {
    screen: 'Account' as const,
    params: {
      screen: 'PersonalHub' as const,
      params: {
        screen: 'PersonalHome' as const,
        params: { deepLink: { screen: 'PersonalClaimedDealPass' as const, dealId } },
      },
    },
  };
}

import { strings } from '@constants/strings';
import {
  displayLink,
  toDiscoveryView,
  toGrowthSummary,
  toMilestoneCards,
  toNetworkHubView,
  toReferralDetailView,
  toReferralRow,
  toReferralsView,
} from '@features/business/utils/networkMappers';
import {
  abcCard,
  discoveryFixture,
  referralDetailFixture,
  referralsFixture,
  summaryFixture,
  xyzCard,
} from './helpers/networkFixtures';

describe('network view models', () => {
  it('strips the scheme from the referral link', () => {
    expect(displayLink('https://vemtap.com/get-started?ref=X')).toBe(
      'vemtap.com/get-started?ref=X',
    );
  });

  it('builds milestone cards with notes only where they apply', () => {
    const cards = toMilestoneCards(summaryFixture);
    expect(cards.map(card => card.state)).toEqual([
      'unlocked',
      'active',
      'locked',
      'locked',
    ]);
    expect(cards[1].tierNote).toBe(strings.networkMilestones.activeNote(5, 5));
    expect(cards[2]).toMatchObject({
      percent: 50,
      progressNote: strings.networkMilestones.remainingNote(5),
    });
    expect(cards[0].tierNote).toBeUndefined();
  });

  it('summarises growth, including the top of the ladder', () => {
    expect(toGrowthSummary(summaryFixture)).toMatchObject({
      tierName: 'Network Partner',
      nextTierName: 'Community Network Partner',
      remaining: '5',
      remainingTotal: '10',
      percent: 50,
    });
    const top = toGrowthSummary({ ...summaryFixture, next: null });
    expect(top.nextMilestoneBody).toBe(strings.myBusinessNetwork.topTierBody);
    expect(top.percent).toBe(100);
  });

  it('describes referrals by status', () => {
    expect(toReferralRow(abcCard)).toMatchObject({
      initials: 'AE',
      status: strings.myReferrals.statusLabel.verified,
      tone: 'success',
      icon: 'checkCircle',
    });
    expect(toReferralRow(xyzCard).meta.startsWith('Joined ')).toBe(true);
  });

  it('builds the hub with nearby merchants in km', () => {
    const hub = toNetworkHubView(summaryFixture);
    expect(hub.nearby[0].distance).toBe(strings.businessNetworkIntroHub.distance('0.2'));
    expect(hub.nearbyKm).toBe('10');
    expect(hub.milestoneBody).toBe(strings.businessNetworkIntroHub.milestoneBody(5));
  });

  it('builds the referral directory with counts and conversion', () => {
    const view = toReferralsView(referralsFixture, summaryFixture);
    expect(view.filters.find(f => f.key === 'verified')?.count).toBe('5');
    expect(view.conversion).toBe(
      strings.myReferrals.growthConversion.replace('{percent}', '71'),
    );
  });

  it('builds the referral detail timeline', () => {
    const view = toReferralDetailView(referralDetailFixture);
    expect(view.timeline.filter(step => step.done)).toHaveLength(4);
    expect(view.timeline[4].when).toBe(strings.referralDetail.timelinePendingStep);
    expect(view.verified).toBe(true);
  });

  it('builds the discovery view', () => {
    const view = toDiscoveryView(discoveryFixture);
    expect(view.health).toMatchObject({
      score: '80',
      badge: strings.businessDiscoveryFeed.healthExcellent,
    });
    expect(view.health.missing).toEqual(['cover photo', 'opening hours']);
    expect(view.controls.find(c => c.id === 'allowPromotions')?.enabled).toBe(false);
    expect(view.card.deal).toBe(strings.businessIntelligence.deals.percentOff('20'));
    expect(view.stats[0].note).toBe(strings.businessIntelligence.vsPrevious('+20%'));
  });
});

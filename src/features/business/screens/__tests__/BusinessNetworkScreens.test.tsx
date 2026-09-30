import React from 'react';
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { BusinessTabNavigator } from '@navigation/BusinessTabNavigator';
import { strings } from '@constants/strings';
import { BusinessNetworkIntroHubScreen } from '@features/business/screens/BusinessNetworkIntroHubScreen';
import { MyBusinessNetworkScreen } from '@features/business/screens/MyBusinessNetworkScreen';
import { NetworkMilestonesScreen } from '@features/business/screens/NetworkMilestonesScreen';
import { BusinessNetworkInfoScreen } from '@features/business/screens/BusinessNetworkInfoScreen';
import { MyReferralsScreen } from '@features/business/screens/MyReferralsScreen';
import { ReferralDetailScreen } from '@features/business/screens/ReferralDetailScreen';
import { BusinessNetworkActiveDashboardScreen } from '@features/business/screens/BusinessNetworkActiveDashboardScreen';
import { InviteABusinessSheet } from '@features/business/screens/InviteABusinessSheet';
import {
  dashboardConnections,
  fairNetworkRules,
  guideTiers,
  networkBadges,
  networkGrowth,
  networkMilestones,
  networkPartners,
  referralTimeline,
  referrals,
} from '@features/business/data/businessNetworkData';

afterEach(cleanup);

/**
 * Press a control and let its resulting render settle before the next
 * interaction. Two back-to-back presses with no flush in between leave React's
 * act queue unbalanced, which poisons every later test in the run — so
 * consecutive interactions go through here.
 */
/** Press the first match, for labels that repeat across sibling controls. */
async function pressFirst(view: Awaited<ReturnType<typeof render>>, label: string) {
  fireEvent.press(view.getAllByLabelText(label)[0]);
  await waitFor(() => expect(view.getAllByLabelText(label).length).toBeGreaterThan(0));
}

async function pressAndSettle(view: Awaited<ReturnType<typeof render>>, label: string) {
  fireEvent.press(view.getByLabelText(label));
  await waitFor(() => expect(view.getByLabelText(label)).toBeTruthy());
}

describe('business network intro hub', () => {
  const copy = strings.businessNetworkIntroHub;

  it('renders the hero, join count, benefits, tier perks and nearby merchants', async () => {
    const view = await render(<BusinessNetworkIntroHubScreen />);

    expect(view.getByText(copy.headerTitle)).toBeTruthy();
    expect(view.getByText(copy.hero)).toBeTruthy();
    expect(view.getByText(copy.betaBadge)).toBeTruthy();
    expect(view.getByText(copy.joinedValue)).toBeTruthy();
    expect(view.getByText(copy.milestoneHighlight)).toBeTruthy();
    copy.benefits.forEach(benefit => {
      expect(view.getAllByText(benefit.step).length).toBeGreaterThan(0);
      expect(view.getAllByText(benefit.title).length).toBeGreaterThan(0);
    });
    copy.tierPerks.forEach(perk => {
      expect(view.getAllByText(perk.perk).length).toBeGreaterThan(0);
    });
  });

  it('opens the referral link, the guide and a sub-tab', async () => {
    const onGetReferralLink = jest.fn();
    const onReadMore = jest.fn();
    const onOpenSubTab = jest.fn();
    const view = await render(
      <BusinessNetworkIntroHubScreen
        onGetReferralLink={onGetReferralLink}
        onReadMore={onReadMore}
        onOpenSubTab={onOpenSubTab}
      />,
    );

    await pressAndSettle(view, copy.getLinkCta);
    expect(onGetReferralLink).toHaveBeenCalledTimes(1);

    await pressAndSettle(view, copy.readMoreCta);
    expect(onReadMore).toHaveBeenCalledTimes(1);

    await pressAndSettle(view, 'Boost');
    expect(onOpenSubTab).toHaveBeenCalledWith('Boost');
  });
});

describe('my business network', () => {
  const copy = strings.myBusinessNetwork;

  it('renders the link, share channels, growth summary and connected partners', async () => {
    const view = await render(<MyBusinessNetworkScreen />);

    expect(view.getByText(copy.headerTitle)).toBeTruthy();
    expect(view.getAllByText(copy.referralLink).length).toBeGreaterThan(0);
    copy.shareChannels.forEach(channel => {
      expect(view.getByText(channel.label)).toBeTruthy();
    });
    expect(view.getByText(networkGrowth.currentTierName)).toBeTruthy();
    networkPartners.forEach(partner => {
      expect(view.getAllByText(partner.name).length).toBeGreaterThan(0);
    });
  });

  it('copies, shares, opens milestones and a partner', async () => {
    const onCopyLink = jest.fn();
    const onShareLink = jest.fn();
    const onOpenMilestones = jest.fn();
    const onOpenPartner = jest.fn();
    const view = await render(
      <MyBusinessNetworkScreen
        onCopyLink={onCopyLink}
        onShareLink={onShareLink}
        onOpenMilestones={onOpenMilestones}
        onOpenPartner={onOpenPartner}
      />,
    );

    // "Copy Link" labels both the docked CTA and the link row.
    await pressFirst(view, copy.copyLinkCta);
    expect(onCopyLink).toHaveBeenCalledTimes(1);

    // "Share Link" labels both the docked CTA and the link row.
    await pressFirst(view, copy.shareLinkCta);
    expect(onShareLink).toHaveBeenCalledTimes(1);

    await pressAndSettle(view, copy.milestonesCta);
    expect(onOpenMilestones).toHaveBeenCalledTimes(1);

    await pressAndSettle(view, networkPartners[0].name);
    expect(onOpenPartner).toHaveBeenCalledWith(networkPartners[0].id);
  });
});

describe('network milestones', () => {
  const copy = strings.networkMilestones;

  it('renders the ladder and every milestone tier with its state', async () => {
    const view = await render(<NetworkMilestonesScreen />);

    expect(view.getByText(copy.headerTitle)).toBeTruthy();
    expect(view.getByText(copy.ladderTitle)).toBeTruthy();
    // The status card and the active tier card both read "Network Partner".
    expect(view.getAllByText(copy.currentStatusValue).length).toBeGreaterThan(0);
    networkMilestones.forEach(milestone => {
      expect(view.getAllByText(milestone.name).length).toBeGreaterThan(0);
      expect(view.getAllByText(milestone.threshold).length).toBeGreaterThan(0);
    });
    // The active tier surfaces its progress caption. "Network Partner" also
    // heads the status card, so match the caption itself.
    expect(
      view.getAllByText(networkMilestones[2].verifiedCaption!).length,
    ).toBeGreaterThan(0);
  });

  it('opens a milestone and the info guide', async () => {
    const onOpenMilestone = jest.fn();
    const onOpenInfo = jest.fn();
    const view = await render(
      <NetworkMilestonesScreen
        onOpenMilestone={onOpenMilestone}
        onOpenInfo={onOpenInfo}
      />,
    );

    await pressAndSettle(view, copy.headerInfo);
    expect(onOpenInfo).toHaveBeenCalledTimes(1);

    await pressAndSettle(view, networkMilestones[0].name);
    expect(onOpenMilestone).toHaveBeenCalledWith(networkMilestones[0].id);
  });
});

describe('business network info guide', () => {
  const copy = strings.businessNetworkInfo;

  it('renders the ethos, figures, steps, tier perks, rules and FAQs', async () => {
    const view = await render(<BusinessNetworkInfoScreen />);

    expect(view.getByText(copy.hero)).toBeTruthy();
    copy.stats.forEach(stat => {
      expect(view.getByText(stat.value)).toBeTruthy();
    });
    copy.steps.forEach(step => {
      expect(view.getAllByText(step.title).length).toBeGreaterThan(0);
    });
    guideTiers.forEach(tier => {
      expect(view.getAllByText(tier.name).length).toBeGreaterThan(0);
    });
    fairNetworkRules.forEach(rule => {
      expect(view.getAllByText(rule.title).length).toBeGreaterThan(0);
    });
  });

  it('gets the link and returns to the network', async () => {
    const onGetLink = jest.fn();
    const onBackToNetwork = jest.fn();
    const view = await render(
      <BusinessNetworkInfoScreen
        onGetLink={onGetLink}
        onBackToNetwork={onBackToNetwork}
      />,
    );

    await pressAndSettle(view, copy.readyCta);
    expect(onGetLink).toHaveBeenCalledTimes(1);

    await pressAndSettle(view, copy.backCta);
    expect(onBackToNetwork).toHaveBeenCalledTimes(1);
  });
});

describe('my referrals', () => {
  const copy = strings.myReferrals;

  it('renders growth, tier status, filters and the referral list', async () => {
    const view = await render(<MyReferralsScreen />);

    expect(view.getByText(copy.headerTitle)).toBeTruthy();
    expect(view.getAllByText(copy.growthValue).length).toBeGreaterThan(0);
    expect(view.getByText(copy.tierBadge)).toBeTruthy();
    referrals.forEach(referral => {
      expect(view.getAllByText(referral.name).length).toBeGreaterThan(0);
    });
    expect(view.getByText(copy.ledgerTitle)).toBeTruthy();
  });

  it('filters the directory to verified referrals only', async () => {
    const onApplyFilter = jest.fn();
    const view = await render(<MyReferralsScreen onApplyFilter={onApplyFilter} />);

    await pressAndSettle(view, copy.filters.verified);
    expect(onApplyFilter).toHaveBeenCalledWith('verified');

    const verifiedCount = referrals.filter(item => item.status === 'verified').length;
    expect(
      view.getByText(copy.resultsLabel.replace('{count}', String(verifiedCount))),
    ).toBeTruthy();
  });

  it('opens a referral and invites another business', async () => {
    const onOpenReferral = jest.fn();
    const onInvite = jest.fn();
    const view = await render(
      <MyReferralsScreen onOpenReferral={onOpenReferral} onInvite={onInvite} />,
    );

    await pressAndSettle(view, `${referrals[0].name} ${referrals[0].refId}`);
    expect(onOpenReferral).toHaveBeenCalledWith(referrals[0].id);

    await pressAndSettle(view, copy.inviteCta);
    expect(onInvite).toHaveBeenCalledTimes(1);
  });
});

describe('referral detail', () => {
  const copy = strings.referralDetail;

  it('renders the business identity, overview, timeline and perks', async () => {
    const view = await render(<ReferralDetailScreen />);

    expect(view.getByText(copy.headerTitle)).toBeTruthy();
    expect(view.getAllByText(referrals[0].name).length).toBeGreaterThan(0);
    expect(view.getByText(copy.overviewTitle)).toBeTruthy();
    referralTimeline.forEach(step => {
      expect(view.getAllByText(step.title).length).toBeGreaterThan(0);
      // The timestamp shares a line with the link on the first step.
      expect(
        view.getAllByText(new RegExp(step.when.replace(/[,:]/g, '.'))).length,
      ).toBeGreaterThan(0);
    });
    copy.perks.forEach(perk => {
      expect(view.getAllByText(perk.title).length).toBeGreaterThan(0);
    });
  });

  it('renders the requested referral and routes message + view actions', async () => {
    const target = referrals[1];
    const onSendMessage = jest.fn();
    const onViewBusiness = jest.fn();
    const view = await render(
      <ReferralDetailScreen
        referralId={target.id}
        onSendMessage={onSendMessage}
        onViewBusiness={onViewBusiness}
      />,
    );

    expect(view.getAllByText(target.name).length).toBeGreaterThan(0);

    await pressAndSettle(view, copy.messageCta);
    expect(onSendMessage).toHaveBeenCalledWith(target.id);

    await pressAndSettle(view, copy.viewBusinessCta);
    expect(onViewBusiness).toHaveBeenCalledWith(target.id);
  });
});

describe('business network active dashboard', () => {
  const copy = strings.businessNetworkDashboard;

  it('renders the count, progress, badges, connections and route cards', async () => {
    const view = await render(<BusinessNetworkActiveDashboardScreen />);

    expect(view.getByText(copy.headerTitle)).toBeTruthy();
    expect(view.getByText(copy.statusBadge)).toBeTruthy();
    networkBadges.forEach(badge => {
      expect(view.getAllByText(badge.name).length).toBeGreaterThan(0);
    });
    dashboardConnections.forEach(connection => {
      expect(view.getAllByText(connection.name).length).toBeGreaterThan(0);
    });
    expect(view.getByText(copy.milestonesCardTitle)).toBeTruthy();
    expect(view.getByText(copy.footerNote)).toBeTruthy();
  });

  it('opens referrals, milestones and the guide from the route cards', async () => {
    const onViewAllReferrals = jest.fn();
    const onOpenMilestones = jest.fn();
    const onOpenHowItWorks = jest.fn();
    const view = await render(
      <BusinessNetworkActiveDashboardScreen
        onViewAllReferrals={onViewAllReferrals}
        onOpenMilestones={onOpenMilestones}
        onOpenHowItWorks={onOpenHowItWorks}
      />,
    );

    await pressAndSettle(view, copy.milestonesCardTitle);
    expect(onOpenMilestones).toHaveBeenCalledTimes(1);

    await pressAndSettle(view, copy.howCardTitle);
    expect(onOpenHowItWorks).toHaveBeenCalledTimes(1);

    await pressAndSettle(
      view,
      copy.referralCardTitle.replace('{count}', networkGrowth.verifiedCount),
    );
    expect(onViewAllReferrals).toHaveBeenCalledTimes(1);
  });
});

describe('invite a business sheet', () => {
  const copy = strings.inviteABusiness;

  it('renders the message preview, link, share channels and the note', async () => {
    const view = await render(<InviteABusinessSheet visible onClose={jest.fn()} />);

    expect(view.getByText(copy.title)).toBeTruthy();
    expect(view.getByText(copy.messagePreviewTitle)).toBeTruthy();
    expect(view.getAllByText(copy.linkLabel).length).toBeGreaterThan(0);
    copy.channels.forEach(channel => {
      expect(view.getAllByText(channel.label).length).toBeGreaterThan(0);
    });
    expect(view.getByText(copy.verificationNote)).toBeTruthy();
  });

  it('copies the message, the link and a share channel', async () => {
    const onCopyMessage = jest.fn();
    const onCopyLink = jest.fn();
    const onShareChannel = jest.fn();
    const view = await render(
      <InviteABusinessSheet
        visible
        onClose={jest.fn()}
        onCopyMessage={onCopyMessage}
        onCopyLink={onCopyLink}
        onShareChannel={onShareChannel}
      />,
    );

    await pressAndSettle(view, copy.copyMessageCta);
    expect(onCopyMessage).toHaveBeenCalledTimes(1);

    // "Copy Link" labels both the docked CTA and the link row.
    await pressFirst(view, copy.copyLinkCta);
    expect(onCopyLink).toHaveBeenCalledTimes(1);

    await pressAndSettle(view, copy.channels[0].label);
    expect(onShareChannel).toHaveBeenCalledWith(copy.channels[0].id);
  });
});

describe('business network navigation', () => {
  const shell = strings.businessShell;
  const more = strings.businessMore;

  function networkRow(): { label: string } {
    const rows: { id: string; label: string }[] = [];
    more.sections.forEach(section => {
      section.items.forEach(item => rows.push({ id: item.id, label: item.label }));
    });
    const found = rows.find(item => item.id === 'network');
    if (!found) throw new Error('No More-hub row with id "network"');
    return found;
  }

  afterEach(() => {
    cleanup();
  });

  async function openMoreTab() {
    await render(
      <NavigationContainer>
        <BusinessTabNavigator />
      </NavigationContainer>,
    );
    await act(async () => {
      fireEvent.press(screen.getByLabelText(shell.tabs.more));
    });
  }

  it('reaches every business network screen from the More hub', async () => {
    // Entry: the Business Network row.
    await openMoreTab();
    await act(async () => {
      fireEvent.press(screen.getByLabelText(networkRow().label));
    });
    expect(
      screen.getAllByText(strings.businessNetworkIntroHub.headerTitle).length,
    ).toBeGreaterThan(0);

    // Intro -> My Network -> Milestones.
    await act(async () => {
      fireEvent.press(screen.getByLabelText(strings.businessNetworkIntroHub.getLinkCta));
    });
    expect(
      screen.getAllByText(strings.myBusinessNetwork.headerTitle).length,
    ).toBeGreaterThan(0);

    await act(async () => {
      fireEvent.press(screen.getByLabelText(strings.myBusinessNetwork.milestonesCta));
    });
    expect(
      screen.getAllByText(strings.networkMilestones.headerTitle).length,
    ).toBeGreaterThan(0);
  });

  it('reaches the referral directory and a referral detail', async () => {
    await openMoreTab();
    await act(async () => {
      fireEvent.press(screen.getByLabelText(networkRow().label));
    });
    await act(async () => {
      fireEvent.press(screen.getByLabelText(strings.businessNetworkIntroHub.getLinkCta));
    });
    await act(async () => {
      fireEvent.press(screen.getByLabelText('Manage'));
    });
    expect(screen.getAllByText(strings.myReferrals.headerTitle).length).toBeGreaterThan(
      0,
    );

    await act(async () => {
      fireEvent.press(
        screen.getByLabelText(`${referrals[0].name} ${referrals[0].refId}`),
      );
    });
    expect(
      screen.getAllByText(strings.referralDetail.headerTitle).length,
    ).toBeGreaterThan(0);
  });

  it('reaches the info guide from the intro hub', async () => {
    await openMoreTab();
    await act(async () => {
      fireEvent.press(screen.getByLabelText(networkRow().label));
    });
    await act(async () => {
      fireEvent.press(screen.getByLabelText(strings.businessNetworkIntroHub.readMoreCta));
    });
    expect(
      screen.getAllByText(strings.businessNetworkInfo.headerTitle).length,
    ).toBeGreaterThan(0);
  });
});

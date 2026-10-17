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
  fairNetworkRules,
  guideTiers,
} from '@features/business/data/businessNetworkData';
import {
  toNetworkHubView,
  toReferralDetailView,
  toReferralsView,
} from '@features/business/utils/networkMappers';
import {
  mockNetworkApis,
  referralDetailFixture,
  referralsFixture,
  summaryFixture,
} from '../../../../../__tests__/helpers/networkFixtures';

afterEach(() => {
  cleanup();
  jest.restoreAllMocks();
});

/** Press the first match, for labels that repeat across sibling controls. */
async function pressFirst(view: Awaited<ReturnType<typeof render>>, label: string) {
  fireEvent.press(view.getAllByLabelText(label)[0]);
  await waitFor(() => expect(view.getAllByLabelText(label).length).toBeGreaterThan(0));
}

async function pressAndSettle(view: Awaited<ReturnType<typeof render>>, label: string) {
  fireEvent.press(view.getByLabelText(label));
  await waitFor(() => expect(view.getByLabelText(label)).toBeTruthy());
}

const hub = toNetworkHubView(summaryFixture);

describe('business network intro hub', () => {
  const copy = strings.businessNetworkIntroHub;

  it('renders the live network, the next milestone and nearby merchants', async () => {
    const view = await render(<BusinessNetworkIntroHubScreen view={hub} />);
    expect(view.getByText(copy.hero)).toBeTruthy();
    expect(view.getByText(copy.joinedValue('14'))).toBeTruthy();
    // The live count and the Network Partner threshold read the same.
    expect(view.getAllByText(copy.networkValue(5)).length).toBeGreaterThan(0);
    expect(view.getAllByText('Community Network Partner').length).toBeGreaterThan(0);
    expect(view.getByText('Artisan Bean Roastery')).toBeTruthy();
    expect(view.getByText('0.2 km away • Food & Beverage')).toBeTruthy();
  });

  it('shows loading and error states before the summary arrives', async () => {
    const view = await render(
      <BusinessNetworkIntroHubScreen isError onRetry={jest.fn()} />,
    );
    expect(view.getByText(copy.error.title)).toBeTruthy();
  });

  it('opens the referral link and the guide', async () => {
    const onGetReferralLink = jest.fn();
    const onReadMore = jest.fn();
    const view = await render(
      <BusinessNetworkIntroHubScreen
        view={hub}
        onGetReferralLink={onGetReferralLink}
        onReadMore={onReadMore}
      />,
    );
    await pressFirst(view, copy.getLinkCta);
    await pressFirst(view, copy.readMoreCta);
    expect(onGetReferralLink).toHaveBeenCalled();
    expect(onReadMore).toHaveBeenCalled();
  });
});

describe('my business network', () => {
  const copy = strings.myBusinessNetwork;

  it('renders the referral link, growth summary and recent referrals', async () => {
    const view = await render(<MyBusinessNetworkScreen view={hub} />);
    expect(view.getByText('vemtap.com/get-started?ref=URBAN0001')).toBeTruthy();
    expect(view.getAllByText('Network Partner').length).toBeGreaterThan(0);
    expect(
      view.getByText(copy.nextMilestoneBody(5, 'Community Network Partner')),
    ).toBeTruthy();
    expect(view.getByText('ABC Electronics')).toBeTruthy();
    expect(view.getByText('XYZ Phones')).toBeTruthy();
  });

  it('copies, shares, opens milestones and a referral', async () => {
    const onCopyLink = jest.fn();
    const onShareLink = jest.fn();
    const onOpenMilestones = jest.fn();
    const onOpenPartner = jest.fn();
    const view = await render(
      <MyBusinessNetworkScreen
        view={hub}
        onCopyLink={onCopyLink}
        onShareLink={onShareLink}
        onOpenMilestones={onOpenMilestones}
        onOpenPartner={onOpenPartner}
      />,
    );
    await pressFirst(view, copy.copyLinkCta);
    await pressFirst(view, copy.shareLinkCta);
    await pressFirst(view, copy.milestonesCta);
    await pressFirst(view, 'ABC Electronics');
    expect(onCopyLink).toHaveBeenCalled();
    expect(onShareLink).toHaveBeenCalled();
    expect(onOpenMilestones).toHaveBeenCalled();
    expect(onOpenPartner).toHaveBeenCalledWith('biz-abc');
  });
});

describe('network milestones', () => {
  const copy = strings.networkMilestones;
  const view = {
    currentTier: 'Network Partner',
    verified: hub.growth.verifiedCount,
    milestones: hub.milestones,
  };

  it('renders the ladder with each tier state and progress', async () => {
    const screenView = await render(<NetworkMilestonesScreen view={view} />);
    expect(screenView.getAllByText('Network Partner').length).toBeGreaterThan(0);
    expect(screenView.getByText(`5 ${copy.verifiedCountLabel}`)).toBeTruthy();
    expect(screenView.getByText(copy.activeNote(5, 5))).toBeTruthy();
    expect(screenView.getByText(copy.remainingNote(5))).toBeTruthy();
    expect(screenView.getByText(copy.verifiedCaption(5, 25))).toBeTruthy();
  });

  it('opens the info guide', async () => {
    const onOpenInfo = jest.fn();
    const screenView = await render(
      <NetworkMilestonesScreen view={view} onOpenInfo={onOpenInfo} />,
    );
    await pressAndSettle(screenView, copy.headerInfo);
    expect(onOpenInfo).toHaveBeenCalledTimes(1);
  });
});

describe('business network info guide', () => {
  const copy = strings.businessNetworkInfo;

  it('renders the ethos, figures, steps, tier perks, rules and FAQs', async () => {
    const view = await render(<BusinessNetworkInfoScreen connectedCount={5} />);

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
    expect(view.getByText(copy.connectedNote(5))).toBeTruthy();
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
  const referrals = toReferralsView(referralsFixture, summaryFixture);

  it('renders growth, tier status, filters and the referral list', async () => {
    const view = await render(<MyReferralsScreen view={referrals} />);
    expect(view.getAllByText('5').length).toBeGreaterThan(0);
    expect(view.getByText(copy.growthTotal.replace('{total}', '7'))).toBeTruthy();
    expect(
      view.getByText(copy.tierRemaining(5, 'Community Network Partner')),
    ).toBeTruthy();
    expect(view.getByText('ABC Electronics')).toBeTruthy();
    expect(view.getByText(copy.statusLabel.pending)).toBeTruthy();
  });

  it('reports filter, search, open and invite', async () => {
    const onApplyFilter = jest.fn();
    const onChangeSearch = jest.fn();
    const onOpenReferral = jest.fn();
    const onInvite = jest.fn();
    const view = await render(
      <MyReferralsScreen
        view={referrals}
        onApplyFilter={onApplyFilter}
        onChangeSearch={onChangeSearch}
        onOpenReferral={onOpenReferral}
        onInvite={onInvite}
      />,
    );
    await pressFirst(view, copy.filters.verified);
    await act(async () => {
      fireEvent.changeText(view.getByLabelText(copy.searchLabel), 'abc');
    });
    await pressAndSettle(view, 'ABC Electronics');
    await pressFirst(view, copy.inviteCta);
    expect(onApplyFilter).toHaveBeenCalledWith('verified');
    expect(onChangeSearch).toHaveBeenCalledWith('abc');
    expect(onOpenReferral).toHaveBeenCalledWith('biz-abc');
    expect(onInvite).toHaveBeenCalled();
  });

  it('shows the empty state when nothing matches', async () => {
    const view = await render(
      <MyReferralsScreen
        view={toReferralsView({ ...referralsFixture, data: [], total: 0 })}
      />,
    );
    expect(view.getByText(copy.empty.title)).toBeTruthy();
  });
});

describe('referral detail', () => {
  const copy = strings.referralDetail;
  const detail = toReferralDetailView(referralDetailFixture);

  it('renders the overview, verification and onboarding timeline', async () => {
    const view = await render(<ReferralDetailScreen view={detail} />);
    expect(view.getByText('ABC Electronics')).toBeTruthy();
    expect(view.getByText('#ABC123XYZ')).toBeTruthy();
    expect(view.getByText('Urban Grill')).toBeTruthy();
    expect(view.getByText(copy.milestoneYes)).toBeTruthy();
    expect(view.getByText(copy.verificationTitle)).toBeTruthy();
    expect(view.getByText(copy.timelineSteps.firstDeal)).toBeTruthy();
    expect(view.getByText(copy.timelineProgress(4, 5))).toBeTruthy();
  });

  it('routes the message and view actions', async () => {
    const onSendMessage = jest.fn();
    const onViewBusiness = jest.fn();
    const view = await render(
      <ReferralDetailScreen
        view={detail}
        onSendMessage={onSendMessage}
        onViewBusiness={onViewBusiness}
      />,
    );
    await pressAndSettle(view, copy.messageCta);
    await pressAndSettle(view, copy.viewBusinessCta);
    expect(onSendMessage).toHaveBeenCalledWith('biz-abc');
    expect(onViewBusiness).toHaveBeenCalledWith('biz-abc');
  });
});

describe('business network active dashboard', () => {
  const copy = strings.businessNetworkDashboard;

  it('renders the count, progress, earned badges and recent connections', async () => {
    const view = await render(<BusinessNetworkActiveDashboardScreen view={hub} />);
    expect(view.getAllByText('5').length).toBeGreaterThan(0);
    expect(view.getByText(copy.badgesCount.replace('{count}', '2'))).toBeTruthy();
    expect(view.getAllByText('Network Starter').length).toBeGreaterThan(0);
    expect(view.getByText('XYZ Phones')).toBeTruthy();
    expect(view.getByText(copy.connectionsAction.replace('{count}', '7'))).toBeTruthy();
  });

  it('opens referrals, milestones and the guide from the route cards', async () => {
    const onViewAllReferrals = jest.fn();
    const onOpenMilestones = jest.fn();
    const onOpenHowItWorks = jest.fn();
    const view = await render(
      <BusinessNetworkActiveDashboardScreen
        view={hub}
        onViewAllReferrals={onViewAllReferrals}
        onOpenMilestones={onOpenMilestones}
        onOpenHowItWorks={onOpenHowItWorks}
      />,
    );
    await pressAndSettle(view, copy.referralCardTitle.replace('{count}', '5'));
    await pressAndSettle(view, copy.milestonesCardTitle);
    await pressAndSettle(view, copy.howCardTitle);
    expect(onViewAllReferrals).toHaveBeenCalled();
    expect(onOpenMilestones).toHaveBeenCalled();
    expect(onOpenHowItWorks).toHaveBeenCalled();
  });
});

describe('invite a business sheet', () => {
  const copy = strings.inviteABusiness;
  const link = summaryFixture.referralLink;
  const message = strings.myBusinessNetwork.shareMessage(link);
  const stats = [{ id: 'referrals', label: copy.stats.referrals, value: '7' }];

  it('renders the live stats, message preview and link', async () => {
    const view = await render(
      <InviteABusinessSheet
        visible
        onClose={jest.fn()}
        referralLink={link}
        message={message}
        stats={stats}
      />,
    );
    expect(view.getByText(copy.stats.referrals)).toBeTruthy();
    expect(view.getByText(message)).toBeTruthy();
    expect(view.getByText(link)).toBeTruthy();
  });

  it('copies the message, the link and a share channel', async () => {
    const onCopyMessage = jest.fn();
    const onCopyLink = jest.fn();
    const onShareChannel = jest.fn();
    const view = await render(
      <InviteABusinessSheet
        visible
        onClose={jest.fn()}
        referralLink={link}
        message={message}
        stats={stats}
        onCopyMessage={onCopyMessage}
        onCopyLink={onCopyLink}
        onShareChannel={onShareChannel}
      />,
    );
    await pressAndSettle(view, copy.copyMessageCta);
    await pressAndSettle(view, copy.copyLinkCta);
    await pressAndSettle(view, copy.channels[0].label);
    expect(onCopyMessage).toHaveBeenCalled();
    expect(onCopyLink).toHaveBeenCalled();
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

  beforeEach(() => {
    mockNetworkApis();
  });

  async function settle() {
    await act(async () => {
      await new Promise<void>(resolve => {
        setTimeout(resolve, 50);
      });
    });
  }

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
    await settle();

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
    await settle();

    await act(async () => {
      fireEvent.press(screen.getByLabelText('ABC Electronics'));
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

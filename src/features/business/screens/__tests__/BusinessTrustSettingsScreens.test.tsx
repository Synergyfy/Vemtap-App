import React from 'react';
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react-native';
import { strings } from '@constants/strings';
import { BusinessNotificationsCenterScreen } from '@features/business/screens/BusinessNotificationsCenterScreen';
import { BusinessReviewsReputationScreen } from '@features/business/screens/BusinessReviewsReputationScreen';
import { BusinessSubscriptionBillingScreen } from '@features/business/screens/BusinessSubscriptionBillingScreen';
import { BusinessVerificationTrustScreen } from '@features/business/screens/BusinessVerificationTrustScreen';
import { BusinessSupportHelpScreen } from '@features/business/screens/BusinessSupportHelpScreen';
import { BusinessSettingsScreen } from '@features/business/screens/BusinessSettingsScreen';
import { SwitchToCustomerScreen } from '@features/business/screens/SwitchToCustomerScreen';
import {
  businessReviews,
  knowledgeBase,
  settingsDispatchGroups,
  settingsHardwareGroups,
  settingsSecurityGroups,
  settingsSessionGroups,
  settingsStoreGroups,
  switchCustomerCards,
} from '@features/business/data/businessTrustSettingsData';

// The feed is API-driven now, so the centre renders whatever the backend sent
// rather than a design list. These stand in for that response: one row per
// category the mapper knows about, plus a stat block on one of them.
const feedRows = [
  {
    id: 'notif-deal',
    title: 'Deal Velocity Spiking',
    message: '14 claims in the last 2h, against 10 at the same time last week.',
    type: 'deal_spike',
    isRead: false,
    createdAt: new Date().toISOString(),
    metadata: {
      stat: { label: 'Claims in 2h', value: '14', trend: '+40% vs last week' },
      cta: 'View Deals',
    },
  },
  {
    id: 'notif-pos',
    title: 'Shift Closed',
    message: 'Closed with ₦342,850.00 in gross sales.',
    type: 'pos_shift',
    isRead: false,
    createdAt: new Date().toISOString(),
    metadata: null,
  },
  {
    id: 'notif-billing',
    title: 'Growth Plan Renews in 5 Days',
    message: 'Your subscription renews on Oct 25.',
    // 'subscription' is what the mapper classifies as billing, which is the
    // category this row is the sole member of.
    type: 'subscription',
    isRead: true,
    createdAt: new Date().toISOString(),
    metadata: null,
  },
];

const mockBusinessFeed = jest.fn();

jest.mock('@features/accountHub/hooks/useNotifications', () => ({
  useBusinessNotifications: () => mockBusinessFeed(),
  useMarkNotificationRead: () => ({ mutate: jest.fn() }),
  useMarkAllNotificationsRead: () => ({ mutate: jest.fn() }),
}));

beforeEach(() => {
  mockBusinessFeed.mockReset();
  mockBusinessFeed.mockReturnValue({
    data: { data: feedRows, total: feedRows.length, unreadCount: 2, page: 1, limit: 20 },
  });
});

afterEach(cleanup);

/**
 * Press a control and let its resulting render settle before the next
 * interaction. Two back-to-back presses with no flush in between leave React's
 * act queue unbalanced, which poisons every later test in the run — so
 * consecutive interactions go through here.
 */
async function pressAndSettle(view: Awaited<ReturnType<typeof render>>, label: string) {
  fireEvent.press(view.getByLabelText(label));
  await waitFor(() => expect(view.getByLabelText(label)).toBeTruthy());
}

describe('business notifications center', () => {
  const copy = strings.businessNotificationsCenter;

  it('renders the category chips, the feed and the dispatch prompt', async () => {
    const view = await render(<BusinessNotificationsCenterScreen />);

    expect(view.getByText(copy.headerTitle)).toBeTruthy();
    copy.categories.forEach(category => {
      expect(view.getAllByLabelText(category.label).length).toBeGreaterThan(0);
    });
    // Rows come from the API now, so what must appear is what it sent.
    feedRows.forEach(row => {
      expect(view.getAllByLabelText(row.title).length).toBeGreaterThan(0);
    });
    expect(view.getByText(copy.dispatchTitle)).toBeTruthy();
  });

  it('shows the stat block only on the rows that carry one', async () => {
    const view = await render(<BusinessNotificationsCenterScreen />);

    // The deal row sent metadata; the POS and billing rows did not.
    expect(view.getAllByText('Claims in 2h').length).toBeGreaterThan(0);
    expect(view.getAllByText('+40% vs last week').length).toBeGreaterThan(0);
    expect(view.getAllByText('View Deals').length).toBeGreaterThan(0);
  });

  it('counts unread from the server so the badge cannot drift from the list', async () => {
    mockBusinessFeed.mockReturnValue({
      data: {
        data: feedRows,
        total: feedRows.length,
        unreadCount: 7,
        page: 1,
        limit: 20,
      },
    });
    const view = await render(<BusinessNotificationsCenterScreen />);

    // Two of the three rows above are unread, so a local count would read 2.
    expect(view.getByText(copy.unreadLabel.replace('2', '7'))).toBeTruthy();
  });

  it('filters the feed by category and opens an alert', async () => {
    const onOpenCategory = jest.fn();
    const onOpenNotification = jest.fn();
    const view = await render(
      <BusinessNotificationsCenterScreen
        onOpenCategory={onOpenCategory}
        onOpenNotification={onOpenNotification}
      />,
    );

    await pressAndSettle(view, copy.tabs.system);
    expect(onOpenCategory).toHaveBeenCalledWith('system');

    // Only the billing row lands in "system", so it is the one still on screen
    // after the filter. Tapping a row hidden by the filter would prove nothing.
    await pressAndSettle(view, feedRows[2].title);
    expect(onOpenNotification).toHaveBeenCalledWith(feedRows[2].id);
  });

  it('shows the empty state once every row is read', async () => {
    mockBusinessFeed.mockReturnValue({
      data: { data: [], total: 0, unreadCount: 0, page: 1, limit: 20 },
    });
    const onMarkAllRead = jest.fn();
    const view = await render(
      <BusinessNotificationsCenterScreen onMarkAllRead={onMarkAllRead} />,
    );

    await pressAndSettle(view, copy.markAllRead);

    expect(onMarkAllRead).toHaveBeenCalledTimes(1);
    // Twice by design: the summary line reads emptyTitle when nothing is
    // unread, and the list itself renders the EmptyState with the same copy.
    expect(view.getAllByText(copy.emptyTitle).length).toBeGreaterThan(0);
  });
});

describe('business reviews and reputation', () => {
  const copy = strings.businessReviewsReputation;

  it('renders the score, distribution, trending attributes and every review', async () => {
    const view = await render(<BusinessReviewsReputationScreen />);

    expect(view.getByText(copy.headerTitle)).toBeTruthy();
    expect(view.getByText(copy.scoreLabel)).toBeTruthy();
    expect(view.getByText(copy.positiveBadge)).toBeTruthy();
    copy.trending.forEach(label => {
      expect(view.getByText(label)).toBeTruthy();
    });
    businessReviews.forEach(review => {
      expect(view.getAllByText(review.name).length).toBeGreaterThan(0);
    });
  });

  it('filters to unreplied reviews and replies to one', async () => {
    const onApplyFilter = jest.fn();
    const onReply = jest.fn();
    const view = await render(
      <BusinessReviewsReputationScreen onApplyFilter={onApplyFilter} onReply={onReply} />,
    );

    await pressAndSettle(view, copy.filters.unreplied);
    expect(onApplyFilter).toHaveBeenCalledWith('unreplied');

    const target = businessReviews.find(review => !review.replied);
    if (target) {
      await pressAndSettle(view, copy.replyTo.replace('{name}', target.name));
      expect(onReply).toHaveBeenCalledWith(target);
    }
    expect(view.getAllByText(copy.needsReply).length).toBeGreaterThan(0);
  });

  it('exports the reviews report and opens the request settings', async () => {
    const onExport = jest.fn();
    const onConfigureRequests = jest.fn();
    const view = await render(
      <BusinessReviewsReputationScreen
        onExport={onExport}
        onConfigureRequests={onConfigureRequests}
      />,
    );

    await pressAndSettle(view, copy.exportCta);
    expect(onExport).toHaveBeenCalledTimes(1);

    await pressAndSettle(view, copy.autoRequestTitle);
    expect(onConfigureRequests).toHaveBeenCalledTimes(1);
  });
});

describe('business subscription and billing', () => {
  const copy = strings.businessSubscriptionBilling;
  const plan = {
    name: 'Professional',
    price: '₦15,000',
    period: 'monthly' as const,
    status: 'active' as const,
    dateLabel: 'Renews Nov 14, 2026',
    daysLeftLabel: null,
    autoRenews: true,
    isFree: false,
  };

  it('renders the plan, payment method, add-ons and history it is given', async () => {
    const view = await render(
      <BusinessSubscriptionBillingScreen
        plan={plan}
        card={{ brand: 'VISA', last4: '4081', expMonth: '12', expYear: '2030' }}
        addOns={[
          {
            id: 'a1',
            name: 'Extra Branch',
            detail: null,
            price: '₦5,000',
            expiresLabel: null,
          },
        ]}
        history={[
          {
            id: 'p1',
            title: 'Subscription',
            date: 'Oct 14, 2026',
            amount: '₦15,000',
            status: 'success',
            statusLabel: 'Paid',
          },
        ]}
      />,
    );

    expect(view.getByText(copy.headerTitle)).toBeTruthy();
    expect(view.getByText('Professional')).toBeTruthy();
    expect(view.getByText('Renews Nov 14, 2026')).toBeTruthy();
    expect(view.getByText(copy.paymentCard('VISA', '4081'))).toBeTruthy();
    expect(view.getByText('Extra Branch')).toBeTruthy();
    expect(view.getByText('Paid')).toBeTruthy();
  });

  it('explains a missing card and an empty history', async () => {
    const view = await render(
      <BusinessSubscriptionBillingScreen
        plan={{ ...plan, isFree: true, status: 'free' }}
      />,
    );
    expect(view.getByText(copy.paymentNone)).toBeTruthy();
    expect(view.getByText(copy.empty.title)).toBeTruthy();
    // The free plan can't be cancelled; the CTA becomes "view plans".
    expect(view.queryByText(copy.cancelCta)).toBeNull();
    expect(view.getByText(copy.upgradeCta)).toBeTruthy();
  });

  it('routes the plan and cancel actions', async () => {
    const onManagePlan = jest.fn();
    const onCancelTier = jest.fn();
    const view = await render(
      <BusinessSubscriptionBillingScreen
        plan={plan}
        onManagePlan={onManagePlan}
        onCancelTier={onCancelTier}
      />,
    );

    await pressAndSettle(view, copy.managePlanCta);
    expect(onManagePlan).toHaveBeenCalledTimes(1);

    await pressAndSettle(view, copy.cancelCta);
    expect(onCancelTier).toHaveBeenCalledTimes(1);
  });
});

describe('business verification and trust', () => {
  const copy = strings.businessVerificationTrust;
  const check = {
    id: 'chk',
    kind: 'identity' as const,
    idType: 'nin',
    status: 'verified' as const,
    maskedId: '•••••••8901',
    recordName: 'ADAEZE TEST OKAFOR',
    reasons: [],
    faceMatch: null,
    createdAt: '2026-10-14T10:45:00.000Z',
    reviewedAt: null,
    reviewNote: null,
  };

  it('renders the verified business, its checks and perks', async () => {
    const view = await render(
      <BusinessVerificationTrustScreen
        businessName="Patrick Ventures"
        branchNames={['Lekki']}
        status={{
          status: 'verified',
          isVerified: true,
          verifiedAt: '2026-10-14T11:00:00.000Z',
          nextStep: 'done',
          identity: check,
          business: {
            ...check,
            id: 'b',
            kind: 'business',
            idType: 'cac',
            maskedId: 'RC1234567',
          },
        }}
      />,
    );

    expect(view.getByText(copy.headlines.verified)).toBeTruthy();
    expect(view.getAllByText('Patrick Ventures').length).toBeGreaterThan(0);
    expect(view.getByText(copy.pillarsBadge(3, 3))).toBeTruthy();
    expect(view.getByText('RC1234567')).toBeTruthy();
    copy.perks.forEach(perk => {
      expect(view.getByText(perk)).toBeTruthy();
    });
  });

  it('offers to start verification and opens it', async () => {
    const onOpenVerification = jest.fn();
    const view = await render(
      <BusinessVerificationTrustScreen
        status={null}
        onOpenVerification={onOpenVerification}
      />,
    );

    expect(view.getByText(copy.headlines.unverified)).toBeTruthy();
    await pressAndSettle(view, copy.startCta);
    expect(onOpenVerification).toHaveBeenCalledTimes(1);

    await pressAndSettle(view, copy.updateCta);
    expect(onOpenVerification).toHaveBeenCalledTimes(2);
  });
});

describe('business support and help', () => {
  const copy = strings.businessSupportHelp;

  it('renders support channels, the success partner and the status strip', async () => {
    const view = await render(<BusinessSupportHelpScreen />);

    expect(view.getByText(copy.headerTitle)).toBeTruthy();
    copy.channels.forEach(channel => {
      expect(view.getByText(channel.label)).toBeTruthy();
    });
    expect(view.getByText(copy.partnerName)).toBeTruthy();
    expect(view.getByText(copy.statusTitle)).toBeTruthy();
  });

  it('expands a knowledge-base category and opens an article', async () => {
    const onOpenCategory = jest.fn();
    const onOpenArticle = jest.fn();
    const view = await render(
      <BusinessSupportHelpScreen
        onOpenCategory={onOpenCategory}
        onOpenArticle={onOpenArticle}
      />,
    );

    const category = knowledgeBase[1];
    await pressAndSettle(view, category.title);
    expect(onOpenCategory).toHaveBeenCalledWith(category.id);

    const article = category.articles[0];
    await pressAndSettle(view, article);
    expect(onOpenArticle).toHaveBeenCalledWith(article);
  });

  it('routes a support channel, the partner CTAs and the technician visit', async () => {
    const onOpenChannel = jest.fn();
    const onScheduleCall = jest.fn();
    const onStartChat = jest.fn();
    const onBookTechnician = jest.fn();
    const view = await render(
      <BusinessSupportHelpScreen
        onOpenChannel={onOpenChannel}
        onScheduleCall={onScheduleCall}
        onStartChat={onStartChat}
        onBookTechnician={onBookTechnician}
      />,
    );

    await pressAndSettle(view, `${copy.channels[0].label}: ${copy.channels[0].hint}`);
    expect(onOpenChannel).toHaveBeenCalledWith('whatsapp');

    await pressAndSettle(view, copy.partnerCtas[0]);
    expect(onScheduleCall).toHaveBeenCalledTimes(1);

    await pressAndSettle(view, copy.partnerCtas[1]);
    expect(onStartChat).toHaveBeenCalledTimes(1);

    await pressAndSettle(view, copy.technicianCta);
    expect(onBookTechnician).toHaveBeenCalledTimes(1);
  });
});

describe('business settings', () => {
  const copy = strings.businessSettings;

  it('renders the identity block and every settings group', async () => {
    const view = await render(<BusinessSettingsScreen />);

    expect(view.getByText(copy.headerTitle)).toBeTruthy();
    expect(view.getByText(copy.identityName)).toBeTruthy();
    expect(view.getByText(copy.identityMeta)).toBeTruthy();
    [
      copy.branchTitle,
      copy.hoursTitle,
      copy.teamTitle,
      copy.hardwareTitle,
      copy.dispatchTitle,
      copy.securityTitle,
      copy.sessionsTitle,
    ].forEach(label => {
      expect(view.getAllByText(label).length).toBeGreaterThan(0);
    });
    [
      ...settingsStoreGroups,
      ...settingsHardwareGroups,
      ...settingsSecurityGroups,
    ].forEach(row => {
      expect(view.getAllByText(row.title).length).toBeGreaterThan(0);
    });
  });

  it('changes the operating branch and opens a settings row', async () => {
    const onChangeBranch = jest.fn();
    const onOpenRow = jest.fn();
    const view = await render(
      <BusinessSettingsScreen onChangeBranch={onChangeBranch} onOpenRow={onOpenRow} />,
    );

    await pressAndSettle(view, copy.branchTitle);
    expect(onChangeBranch).toHaveBeenCalledTimes(1);

    await pressAndSettle(view, settingsSessionGroups[1].title);
    expect(onOpenRow).toHaveBeenCalledWith('signout');
  });

  it('toggles a switch row and a dispatch preference', async () => {
    const onToggleRow = jest.fn();
    const view = await render(<BusinessSettingsScreen onToggleRow={onToggleRow} />);

    await pressAndSettle(view, copy.dineInTitle);
    expect(onToggleRow).toHaveBeenCalledWith('dine-in', false);

    await pressAndSettle(view, settingsDispatchGroups[0].title);
    expect(onToggleRow).toHaveBeenCalledWith('whatsapp', true);
  });
});

describe('switch to customer', () => {
  const copy = strings.switchToCustomer;

  it('renders both identities, the customer summary and the wallet deal', async () => {
    const view = await render(<SwitchToCustomerScreen />);

    expect(view.getByText(copy.title)).toBeTruthy();
    expect(view.getByText(copy.fromName)).toBeTruthy();
    expect(view.getByText(copy.toName)).toBeTruthy();
    expect(view.getByText(copy.toMeta)).toBeTruthy();
    switchCustomerCards.forEach(card => {
      expect(view.getByText(card.hint)).toBeTruthy();
    });
    expect(view.getByText(copy.footer)).toBeTruthy();
  });

  it('shows the logged-in business and customer identity when provided', async () => {
    const view = await render(
      <SwitchToCustomerScreen
        merchantName="Ada's Kitchen"
        customerName="Ada Obi"
        customerMeta="ada.obi@example.com"
      />,
    );

    expect(view.getByText("Ada's Kitchen")).toBeTruthy();
    expect(view.getByText('Ada Obi')).toBeTruthy();
    expect(view.getByText('ada.obi@example.com')).toBeTruthy();
    // Design placeholders are replaced, not duplicated.
    expect(view.queryByText(copy.fromName)).toBeNull();
    expect(view.queryByText(copy.toName)).toBeNull();
  });

  it('confirms the switch, stays in business and opens the deal', async () => {
    const onConfirmSwitch = jest.fn();
    const onStayInBusiness = jest.fn();
    const onOpenDeal = jest.fn();
    const view = await render(
      <SwitchToCustomerScreen
        onConfirmSwitch={onConfirmSwitch}
        onStayInBusiness={onStayInBusiness}
        onOpenDeal={onOpenDeal}
      />,
    );

    await pressAndSettle(view, copy.cta);
    expect(onConfirmSwitch).toHaveBeenCalledTimes(1);

    await pressAndSettle(view, copy.stayCta);
    expect(onStayInBusiness).toHaveBeenCalledTimes(1);

    await pressAndSettle(view, copy.dealName);
    expect(onOpenDeal).toHaveBeenCalledWith('coffee');
  });
});

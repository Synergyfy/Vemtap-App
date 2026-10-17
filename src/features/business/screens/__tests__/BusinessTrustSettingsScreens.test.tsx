import React from 'react';
import { Alert } from 'react-native';
import { act, cleanup, fireEvent, render, waitFor } from '@testing-library/react-native';
import { strings } from '@constants/strings';
import { BusinessNotificationsCenterScreen } from '@features/business/screens/BusinessNotificationsCenterScreen';
import { BusinessReviewsReputationScreen } from '@features/business/screens/BusinessReviewsReputationScreen';
import { BusinessSubscriptionBillingScreen } from '@features/business/screens/BusinessSubscriptionBillingScreen';
import { BusinessVerificationTrustScreen } from '@features/business/screens/BusinessVerificationTrustScreen';
import { BusinessSupportHelpScreen } from '@features/business/screens/BusinessSupportHelpScreen';
import { BusinessSettingsScreen } from '@features/business/screens/BusinessSettingsScreen';
import { SwitchToCustomerScreen } from '@features/business/screens/SwitchToCustomerScreen';
import { switchCustomerCards } from '@features/business/data/businessTrustSettingsData';
import { toSettingsView } from '@features/business/utils/settingsMappers';
import type { MyBusiness } from '@api/businessDashboardApi';
import { presentBusinessReviews } from '@features/business/utils/reviewMappers';
import {
  presentSupportTickets,
  presentSupportTree,
  presentTicketThread,
} from '@features/business/utils/supportMappers';
import type { BusinessReview } from '@api/dealsApi';

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

/**
 * Type into a field and let the resulting render settle: a bare
 * `fireEvent.changeText` mutates the controlled input outside act, so the field
 * keeps rendering the value it had before the edit.
 */
async function typeText(
  view: Awaited<ReturnType<typeof render>>,
  label: string,
  text: string,
) {
  await act(async () => {
    fireEvent.changeText(view.getByLabelText(label), text);
  });
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

  const review = (overrides: Partial<BusinessReview> = {}): BusinessReview => ({
    id: 'rev-1',
    offerId: 'offer-1',
    offerName: 'Woodfire Ribeye Combo',
    reviewerName: 'Tunde Bakare',
    comment: 'Cooked to perfection, and the QR voucher saved us ₦2,400 at checkout.',
    rating: 5,
    likesCount: 21,
    status: 'pending',
    userId: 'u-1',
    ipHash: null,
    createdAt: new Date().toISOString(),
    ...overrides,
  });

  const reputationView = presentBusinessReviews({
    reviews: [
      review(),
      review({
        id: 'rev-2',
        reviewerName: 'Amina Bello',
        rating: 4,
        status: 'approved',
        comment: 'Loved the Passionfruit Mojito during happy hour.',
        likesCount: 9,
      }),
    ],
    summary: {
      totalReviews: 128,
      averageRating: 4.9,
      pendingReviews: 1,
      ratingDistribution: { 1: 0, 2: 0, 3: 2, 4: 6, 5: 120 },
    },
    filter: 'all',
  });

  it('renders the live score, distribution and review rows', async () => {
    const view = await render(
      <BusinessReviewsReputationScreen
        view={reputationView}
        filter="all"
        onChangeFilter={() => undefined}
      />,
    );

    expect(view.getByText(copy.headerTitle)).toBeTruthy();
    // Score and counts come from the summary endpoint.
    expect(view.getByText('4.9')).toBeTruthy();
    expect(view.getByText(copy.basedOn('128'))).toBeTruthy();
    expect(view.getByText(copy.pendingBadge('1'))).toBeTruthy();
    // Distribution bars are computed from the 1–5 bucket map.
    expect(view.getByText(copy.distributionTitle)).toBeTruthy();
    expect(view.getByText('94%')).toBeTruthy();
    // Rows carry the offer they were written against and their own rating.
    expect(view.getByText('Tunde Bakare')).toBeTruthy();
    expect(view.getByText('Amina Bello')).toBeTruthy();
    // Both rows were written against the same deal, so the line appears twice.
    expect(view.getAllByText('Woodfire Ribeye Combo • Just now').length).toBe(2);
    expect(view.getByText(copy.likesLabel(21))).toBeTruthy();
    // "Pending" is both the moderation badge and the row's own status pill.
    expect(view.getAllByText(copy.status.pending).length).toBeGreaterThan(0);
    expect(view.getAllByText(copy.status.approved).length).toBeGreaterThan(0);
  });

  it('reports the chip a merchant tapped so the route can requery', async () => {
    const onChangeFilter = jest.fn();
    const view = await render(
      <BusinessReviewsReputationScreen
        view={reputationView}
        filter="all"
        onChangeFilter={onChangeFilter}
      />,
    );

    await pressAndSettle(view, copy.filters.pending);
    expect(onChangeFilter).toHaveBeenCalledWith('pending');
  });

  it('only offers moderation on rows that are still pending', async () => {
    const onModerate = jest.fn();
    const view = await render(
      <BusinessReviewsReputationScreen
        view={reputationView}
        filter="all"
        onChangeFilter={() => undefined}
        onModerate={onModerate}
      />,
    );

    // Two rows, one pending: one approve action in the whole list.
    expect(view.getAllByLabelText(copy.approve).length).toBe(1);
    await pressAndSettle(view, copy.approve);
    expect(onModerate).toHaveBeenCalledWith('rev-1', 'approve');
  });

  it('deleting a review asks for confirmation first', async () => {
    const onModerate = jest.fn();
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    const view = await render(
      <BusinessReviewsReputationScreen
        view={reputationView}
        filter="all"
        onChangeFilter={() => undefined}
        onModerate={onModerate}
      />,
    );

    // Every row can be deleted, so the first one stands in for the confirm.
    fireEvent.press(view.getAllByLabelText(copy.delete)[0]);
    await waitFor(() => expect(alert).toHaveBeenCalled());
    const buttons = alert.mock.calls[0][2] as Array<{
      text: string;
      onPress?: () => void;
    }>;
    buttons.find(button => button.text === copy.deleteConfirm)?.onPress?.();
    expect(onModerate).toHaveBeenCalledWith('rev-1', 'delete');
    alert.mockRestore();
  });

  it('shows the business reply and posts a new one', async () => {
    const onReply = jest.fn();
    const withReply = presentBusinessReviews({
      reviews: [
        review({
          id: 'rev-3',
          status: 'approved',
          merchantReply: 'Thank you, see you soon!',
          repliedAt: new Date().toISOString(),
        }),
        review({ id: 'rev-4', reviewerName: 'Kemi', status: 'approved' }),
      ],
      summary: {
        totalReviews: 2,
        averageRating: 5,
        pendingReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 2 },
      },
      filter: 'all',
    });
    const view = await render(
      <BusinessReviewsReputationScreen
        view={withReply}
        filter="all"
        onChangeFilter={() => undefined}
        onReply={onReply}
      />,
    );

    expect(view.getByText('Thank you, see you soon!')).toBeTruthy();
    expect(view.getByLabelText(copy.editReply)).toBeTruthy();

    await act(async () => {
      fireEvent.press(view.getByLabelText(copy.reply));
    });
    await act(async () => {
      fireEvent.changeText(view.getByLabelText(copy.replyTitle), '  Thanks Kemi!  ');
    });
    await act(async () => {
      fireEvent.press(view.getByText(copy.replySave));
    });
    expect(onReply).toHaveBeenCalledWith('rev-4', 'Thanks Kemi!');
  });

  it('reports loading and failure instead of an empty reputation', async () => {
    const loading = await render(
      <BusinessReviewsReputationScreen
        filter="all"
        onChangeFilter={() => undefined}
        isLoading
      />,
    );
    expect(loading.getByText(copy.loading)).toBeTruthy();

    const failed = await render(
      <BusinessReviewsReputationScreen
        filter="all"
        onChangeFilter={() => undefined}
        isError
      />,
    );
    expect(failed.getByText(copy.error.title)).toBeTruthy();
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

  const tree = presentSupportTree({
    tree: {
      categories: [
        {
          id: 'cat-pos',
          title: 'POS Tills & Offline Buffer',
          order: 1,
          sections: [
            {
              id: 'sec-offline',
              title: 'Offline',
              order: 1,
              pages: [
                {
                  id: 'page-1',
                  title: 'How offline buffer works',
                  path: '/offline-buffer',
                  summary: 'Sales run locally and sync when the connection returns.',
                  thumbnail: null,
                  order: 1,
                },
              ],
            },
          ],
        },
        // No pages: the mapper drops it rather than rendering an empty card.
        { id: 'cat-deals', title: 'Deals & Campaign Boost', order: 2, sections: [] },
      ],
    },
  });

  const tickets = presentSupportTickets([
    {
      id: 't-1',
      subject: 'Till 04 will not print',
      category: 'POS & Tills',
      status: 'In Progress',
      priority: 'High',
      createdAt: new Date().toISOString(),
    },
    {
      id: 't-2',
      subject: 'Refund not received',
      category: 'Payouts',
      status: 'Pending',
      priority: 'Normal',
      createdAt: new Date().toISOString(),
    },
  ]);

  const thread = presentTicketThread({
    id: 't-1',
    subject: 'Till 04 will not print',
    category: 'POS & Tills',
    status: 'In Progress',
    priority: 'High',
    activity: [],
    messages: [
      {
        id: 'm-1',
        message: 'The kitchen chit comes out blank.',
        senderRole: 'CUSTOMER',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'm-2',
        message: 'We are pushing a firmware update to that till.',
        senderRole: 'AGENT',
        createdAt: new Date().toISOString(),
      },
    ],
  });

  it('renders the assistant, the live knowledge tree and the tickets', async () => {
    const view = await render(
      <BusinessSupportHelpScreen tree={tree} tickets={tickets} />,
    );

    expect(view.getByText(copy.headerTitle)).toBeTruthy();
    expect(view.getByText(copy.botTitle)).toBeTruthy();
    expect(view.getByText(copy.knowledgeTitle)).toBeTruthy();
    // One category has a page, the other has none — only the first is rendered.
    expect(view.getByText('POS Tills & Offline Buffer')).toBeTruthy();
    expect(view.queryByText('Deals & Campaign Boost')).toBeNull();
    // The panel badge and the category row both carry the count.
    expect(view.getAllByText(tree.totalLabel).length).toBeGreaterThan(0);
    // Tickets come from the list endpoint, with their status.
    expect(view.getByText('Till 04 will not print')).toBeTruthy();
    expect(view.getByText('Refund not received')).toBeTruthy();
    expect(view.getByText('In Progress')).toBeTruthy();
    expect(view.queryByText(copy.ticketsEmpty.title)).toBeNull();
  });

  it('asks the assistant and shows the answer it came back with', async () => {
    const onAskBot = jest.fn();
    const view = await render(
      <BusinessSupportHelpScreen
        tree={tree}
        tickets={tickets}
        onAskBot={onAskBot}
        botAnswer={{ body: 'Sales sync automatically.', source: 'knowledge_base' }}
      />,
    );

    await typeText(view, copy.botTitle, 'Why did my sales disappear?');
    await pressAndSettle(view, copy.botAsk);
    expect(onAskBot).toHaveBeenCalledWith('Why did my sales disappear?');
    expect(view.getByText('Sales sync automatically.')).toBeTruthy();
    expect(view.getByText(copy.botSourceKnowledge)).toBeTruthy();
  });

  it('reports a search so the route can refetch the tree', async () => {
    const onSearch = jest.fn();
    const view = await render(
      <BusinessSupportHelpScreen tree={tree} tickets={tickets} onSearch={onSearch} />,
    );

    await typeText(view, copy.searchLabel, 'offline');
    await pressAndSettle(view, copy.searchCta);
    expect(onSearch).toHaveBeenCalledWith('offline');
  });

  it('opens a ticket thread and replies to it', async () => {
    const onOpenTicket = jest.fn();
    const onReply = jest.fn();
    const view = await render(
      <BusinessSupportHelpScreen
        tree={tree}
        tickets={tickets}
        thread={thread}
        onOpenTicket={onOpenTicket}
        onReply={onReply}
      />,
    );

    await pressAndSettle(view, 'Till 04 will not print');
    expect(onOpenTicket).toHaveBeenCalledWith('t-1');

    // Both sides of the conversation are on screen, the merchant's marked.
    expect(view.getByText('The kitchen chit comes out blank.')).toBeTruthy();
    expect(view.getByText('We are pushing a firmware update to that till.')).toBeTruthy();
    expect(view.getAllByText(copy.youLabel).length).toBeGreaterThan(0);

    await typeText(view, copy.replyPlaceholder, 'Rebooted, still blank.');
    await pressAndSettle(view, copy.replyCta);
    expect(onReply).toHaveBeenCalledWith('t-1', 'Rebooted, still blank.');
  });

  it('validates the new-ticket form before handing it over', async () => {
    const onCreateTicket = jest.fn();
    const view = await render(
      <BusinessSupportHelpScreen
        tree={tree}
        tickets={tickets}
        onCreateTicket={onCreateTicket}
      />,
    );

    await pressAndSettle(view, copy.newTicketCta);
    await pressAndSettle(view, copy.submit);
    expect(view.getByText(copy.errors.subject)).toBeTruthy();
    expect(onCreateTicket).not.toHaveBeenCalled();

    await typeText(view, copy.fields.subject, 'Receipt printer offline');
    await typeText(view, copy.fields.category, 'POS & Tills');
    await typeText(view, copy.fields.message, 'It stopped after the power cut.');
    await pressAndSettle(view, copy.submit);

    expect(onCreateTicket).toHaveBeenCalledWith({
      subject: 'Receipt printer offline',
      category: 'POS & Tills',
      message: 'It stopped after the power cut.',
      priority: 'Normal',
    });
  });

  it('reports loading and failure instead of an empty help screen', async () => {
    const loading = await render(<BusinessSupportHelpScreen isLoading />);
    expect(loading.getByText(copy.loading)).toBeTruthy();

    const failed = await render(<BusinessSupportHelpScreen isError />);
    expect(failed.getByText(copy.error.title)).toBeTruthy();
  });
});

describe('business settings', () => {
  const copy = strings.businessSettings;
  const business = {
    id: 'biz-1',
    name: 'Aurora Grill',
    isVerified: true,
    verificationStatus: 'verified',
    isVisible: true,
    city: 'Lagos',
    category: { name: 'Restaurant' },
    amenities: [],
    branches: [],
  } as unknown as MyBusiness;
  const settingsView = (overrides: Partial<MyBusiness> = {}) =>
    toSettingsView({
      business: { ...business, ...overrides },
      branchName: 'Lekki',
      pos: {
        selfOrderingEnabled: true,
        printKitchenChits: false,
        permissions: { refundRequiresPin: true, voidRequiresPin: false },
      },
      discovery: { pushNotifications: true, emailSummary: false } as never,
      peripherals: [{ type: 'printer' }, { type: 'printer' }, { type: 'scanner' }],
      ownerEmail: 'owner@aurora.test',
      twoFactorEnabled: false,
    });

  it('maps the business identity, toggles and hardware counts', () => {
    const view = settingsView();
    expect(view.identity).toEqual({
      name: 'Aurora Grill',
      meta: copy.identityMeta('Restaurant', 'Lagos'),
      live: true,
      verification: copy.verification.verified,
    });
    expect(view.branchName).toBe('Lekki');
    expect(view.ordering.map(row => row.value)).toEqual([true, false]);
    expect(view.team.map(row => row.value)).toEqual([true, false]);
    expect(view.dispatch.map(row => row.value)).toEqual([true, false]);
    expect(view.hardware.map(row => row.value)).toEqual([
      copy.hardwareCount(2),
      copy.hardwareCount(0),
      copy.hardwareCount(1),
    ]);
    expect(settingsView({ isVisible: false }).live).toBe(false);
  });

  it('shows a loader before the view arrives', async () => {
    const view = await render(<BusinessSettingsScreen />);
    expect(view.getByText(copy.loading)).toBeTruthy();
  });

  it('shows an error state when settings fail to load', async () => {
    const view = await render(<BusinessSettingsScreen isError onRetry={jest.fn()} />);
    expect(view.getByText(copy.error.title)).toBeTruthy();
  });

  it('renders the identity block and toggles a row', async () => {
    const onToggle = jest.fn();
    const onChangeBranch = jest.fn();
    const view = await render(
      <BusinessSettingsScreen
        view={settingsView()}
        onToggle={onToggle}
        onChangeBranch={onChangeBranch}
      />,
    );

    expect(view.getByText('Aurora Grill')).toBeTruthy();
    expect(view.getByText(copy.identityLive)).toBeTruthy();
    expect(view.getByText('Lekki')).toBeTruthy();

    await pressAndSettle(view, copy.branchTitle);
    expect(onChangeBranch).toHaveBeenCalledTimes(1);

    await pressAndSettle(view, copy.kitchenChitsTitle);
    expect(onToggle).toHaveBeenCalledWith('printKitchenChits', true);
  });

  it('asks before pausing the storefront', async () => {
    const onSetLive = jest.fn();
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    const view = await render(
      <BusinessSettingsScreen view={settingsView()} onSetLive={onSetLive} />,
    );

    await pressAndSettle(view, copy.pauseTitle);
    expect(alert).toHaveBeenCalledWith(
      copy.pauseConfirmTitle,
      copy.pauseConfirmBody,
      expect.any(Array),
    );
    const buttons = alert.mock.calls[0][2] as { onPress?: () => void }[];
    buttons[1].onPress?.();
    expect(onSetLive).toHaveBeenCalledWith(false);
    alert.mockRestore();
  });

  it('is read-only for non-owners', async () => {
    const onToggle = jest.fn();
    const view = await render(
      <BusinessSettingsScreen
        view={settingsView()}
        canEdit={false}
        onToggle={onToggle}
      />,
    );

    expect(view.getByText(copy.ownerOnly)).toBeTruthy();
    await pressAndSettle(view, copy.kitchenChitsTitle);
    expect(onToggle).not.toHaveBeenCalled();
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

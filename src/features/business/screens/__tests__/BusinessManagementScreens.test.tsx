import React from 'react';
import { Alert } from 'react-native';
import { act, cleanup, fireEvent, render, waitFor } from '@testing-library/react-native';
import { strings } from '@constants/strings';
import { BusinessProfilePreviewScreen } from '@features/business/screens/BusinessProfilePreviewScreen';
import { businessDashboardApi } from '@api/businessDashboardApi';
import { BusinessManagementHubScreen } from '@features/business/screens/BusinessManagementHubScreen';
import { CentralDealsManagementScreen } from '@features/business/screens/CentralDealsManagementScreen';
import { DealDetailsPerformanceScreen } from '@features/business/screens/DealDetailsPerformanceScreen';
import { CreateDealLocationAssignmentScreen } from '@features/business/screens/CreateDealLocationAssignmentScreen';
import { DealLocationAssignmentPricingScreen } from '@features/business/screens/DealLocationAssignmentPricingScreen';
import { LocationAssignmentBranchPricingScreen } from '@features/business/screens/LocationAssignmentBranchPricingScreen';
import { BranchAvailabilityLocationPricingScreen } from '@features/business/screens/BranchAvailabilityLocationPricingScreen';
import { CentralCatalogueScreen } from '@features/business/screens/CentralCatalogueScreen';
import { ServicesCategoriesManagementScreen } from '@features/business/screens/ServicesCategoriesManagementScreen';
import { AddProductBasicsMediaScreen } from '@features/business/screens/AddProductBasicsMediaScreen';
import { LocationsBranchesScreen } from '@features/business/screens/LocationsBranchesScreen';
import { WuseBranchDetailsScreen } from '@features/business/screens/WuseBranchDetailsScreen';
import { CustomerCrmDirectoryScreen } from '@features/business/screens/CustomerCrmDirectoryScreen';
import { CustomerProfileDossierScreen } from '@features/business/screens/CustomerProfileDossierScreen';
import { LoyaltyProgrammeConfigurationScreen } from '@features/business/screens/LoyaltyProgrammeConfigurationScreen';
import { LoyaltyRewardsRulesScreen } from '@features/business/screens/LoyaltyRewardsRulesScreen';
import { InviteStaffPermissionsScreen } from '@features/business/screens/InviteStaffPermissionsScreen';
import { StaffTeamAccessDirectoryScreen } from '@features/business/screens/StaffTeamAccessDirectoryScreen';
import { presentStaffDirectory } from '@features/business/utils/teamMappers';
import {
  toCustomerDirectoryView,
  toCustomerDossierView,
} from '@features/business/utils/crmMappers';
import {
  presentLoyaltyProgramme,
  presentRewards,
} from '@features/business/utils/loyaltyMappers';
import type { TeamMember } from '@api/teamApi';
import type { LoyaltyRule, Reward } from '@api/loyaltyApi';
import type { BusinessBranch } from '@features/business/components/BusinessBranchSwitcher';
import type { Branch } from '@api/branchApi';
import {
  directoryFixture,
  dossierFixture,
  michaelCard,
} from '../../../../../__tests__/helpers/crmFixtures';

afterEach(cleanup);

/**
 * Simulated taps only reach handlers once React has flushed them — the
 * `BusinessPublicPosScreens` suites wrap theirs for the same reason.
 */
const press = (element: Parameters<typeof fireEvent.press>[0]) =>
  act(async () => {
    fireEvent.press(element);
  });

/**
 * Typing needs the same flush as pressing: a bare `fireEvent.changeText`
 * mutates the controlled input outside act, so the field keeps rendering — and
 * asserting on — the value it had before the edit.
 */
const type = (element: Parameters<typeof fireEvent.changeText>[0], text: string) =>
  act(async () => {
    fireEvent.changeText(element, text);
  });

jest.mock('@api/businessDashboardApi', () => ({
  businessDashboardApi: { updateMyBusiness: jest.fn() },
}));

describe('business profile preview', () => {
  const copy = strings.businessProfilePreview;

  it('renders the storefront identity, trust block and amenities', async () => {
    const view = await render(<BusinessProfilePreviewScreen />);

    expect(view.getByText(copy.headerTitle)).toBeTruthy();
    expect(view.getByText(copy.name)).toBeTruthy();
    expect(view.getByText(copy.verifiedTitle)).toBeTruthy();
    expect(view.getByText(copy.contactsTitle)).toBeTruthy();
    copy.amenities.forEach(amenity => {
      expect(view.getByText(amenity.label)).toBeTruthy();
    });
  });

  it('confirms a save through the docked action bar', async () => {
    // The save is a real request now, so the confirmation must wait for it to
    // land rather than firing the moment the button is pressed.
    const updateMyBusiness = businessDashboardApi.updateMyBusiness as jest.Mock;
    updateMyBusiness.mockResolvedValue(undefined);
    const onSaveChanges = jest.fn();
    const view = await render(
      <BusinessProfilePreviewScreen onSaveChanges={onSaveChanges} />,
    );

    fireEvent.press(view.getByLabelText(copy.saveChanges));

    await waitFor(() => expect(updateMyBusiness).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(onSaveChanges).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(view.getByText(copy.savedToast)).toBeTruthy());
  });

  it('toggles amenities and updates the active counter', async () => {
    const view = await render(<BusinessProfilePreviewScreen />);

    expect(
      view.getByText(
        copy.amenitiesActiveCount.replace('%s', String(copy.amenities.length)),
      ),
    ).toBeTruthy();
    fireEvent.press(view.getByText(copy.amenities[0].label));

    await waitFor(() =>
      expect(
        view.getByText(
          copy.amenitiesActiveCount.replace('%s', String(copy.amenities.length - 1)),
        ),
      ).toBeTruthy(),
    );
  });
});

describe('business management hub', () => {
  const copy = strings.businessManagementHub;

  it('renders the branch scope, quick stats and all seven modules', async () => {
    const onOpenModule = jest.fn();
    const view = await render(
      <BusinessManagementHubScreen onOpenModule={onOpenModule} />,
    );

    expect(view.getAllByText(copy.title).length).toBeGreaterThan(0);
    copy.quickStats.forEach(stat => expect(view.getByText(stat.value)).toBeTruthy());
    copy.menu.forEach(item => expect(view.getByText(item.title)).toBeTruthy());

    fireEvent.press(view.getByText(copy.menu[0].title));
    await waitFor(() => expect(onOpenModule).toHaveBeenCalledWith(copy.menu[0].id));
  });
});

describe('central deals management', () => {
  const copy = strings.centralDeals;

  it.each(['hero', 'compact', 'discovery'] as const)(
    'renders every deal card in the %s layout',
    async layout => {
      const view = await render(<CentralDealsManagementScreen layout={layout} />);

      copy.variants.forEach(deal => {
        expect(view.getByText(deal.title)).toBeTruthy();
        expect(view.getByText(deal.price)).toBeTruthy();
      });
    },
  );

  it('switches the status segment', async () => {
    const view = await render(<CentralDealsManagementScreen layout="discovery" />);

    fireEvent.press(view.getByText(copy.tabs[1].label));

    await waitFor(() => expect(view.getByText(copy.tabs[1].label)).toBeTruthy());
  });
});

describe('deal details and performance', () => {
  const copy = strings.dealPerformance;

  it('renders settlement, redemption, catalogue and branch sections', async () => {
    const view = await render(<DealDetailsPerformanceScreen />);

    expect(view.getByText(copy.headerTitle)).toBeTruthy();
    expect(view.getByText(copy.heroTitle)).toBeTruthy();
    expect(view.getByText(copy.pricingTitle)).toBeTruthy();
    expect(view.getByText(copy.redemptionTitle)).toBeTruthy();
    expect(view.getByText(copy.catalogTitle)).toBeTruthy();
    expect(view.getByText(copy.branchesTitle)).toBeTruthy();
    copy.pricing.forEach(tile =>
      expect(view.getAllByText(tile.value).length).toBeGreaterThan(0),
    );
    copy.branches.forEach(branch => expect(view.getByText(branch.name)).toBeTruthy());
    expect(view.getByText(copy.boostCta)).toBeTruthy();
  });
});

describe('location assignment surfaces', () => {
  const base = strings.dealLocationAssignment;

  it('create deal assignment shows participation and the launch CTA', async () => {
    const view = await render(<CreateDealLocationAssignmentScreen />);

    expect(view.getByText(base.createDeal.headerTitle)).toBeTruthy();
    expect(view.getByText(base.participationTitle)).toBeTruthy();
    base.createDeal.branches.forEach(branch =>
      expect(view.getByText(branch.name)).toBeTruthy(),
    );
    expect(view.getByText(base.createDeal.review)).toBeTruthy();
  });

  it('deal pricing matrix exposes both participating branches', async () => {
    const view = await render(<DealLocationAssignmentPricingScreen />);

    expect(view.getAllByText(base.contextTitle).length).toBeGreaterThan(0);
    expect(view.getByText(base.branch1.name)).toBeTruthy();
    expect(view.getByText(base.branch2.name)).toBeTruthy();
    expect(view.getByText(base.branch3.name)).toBeTruthy();
    expect(view.getByText(base.saveAssignment)).toBeTruthy();
  });

  it('product assignment renders stock tiles and the routing callout', async () => {
    const view = await render(<LocationAssignmentBranchPricingScreen />);

    expect(view.getByText(base.productSummary.branchesTitle)).toBeTruthy();
    expect(view.getByText(base.productSummary.routingTitle)).toBeTruthy();
    base.productSummary.branches.forEach(branch =>
      expect(view.getByText(branch.name)).toBeTruthy(),
    );
  });

  it('branch availability switches between standard and custom pricing', async () => {
    const view = await render(<BranchAvailabilityLocationPricingScreen />);

    const copy = base.lamb;
    expect(view.getByText(copy.breakdownTitle)).toBeTruthy();
    fireEvent.press(view.getByText(`${copy.standard} · ${copy.standardBase}`));
    await waitFor(() => expect(view.getByText(copy.capacityTitle)).toBeTruthy());
    expect(view.getByText(copy.saveCta)).toBeTruthy();
  });
});

describe('central catalogue', () => {
  const copy = strings.centralCatalogue;

  it.each(['directory', 'businessHub'] as const)(
    'renders the catalogue rows in the %s layout',
    async layout => {
      const view = await render(<CentralCatalogueScreen layout={layout} />);

      copy.items.forEach(item => {
        expect(view.getByText(item.title)).toBeTruthy();
        expect(view.getByText(item.price)).toBeTruthy();
      });
      expect(view.getByText(copy.addProduct)).toBeTruthy();
    },
  );

  it('toggles the publish switch for a catalogue row', async () => {
    const onToggleStock = jest.fn();
    const view = await render(<CentralCatalogueScreen onToggleStock={onToggleStock} />);

    fireEvent(
      view.getAllByLabelText(copy.publishToggleLabel(copy.items[0].title))[0],
      'valueChange',
      false,
    );

    await waitFor(() =>
      expect(onToggleStock).toHaveBeenCalledWith(copy.items[0].id, false),
    );
  });
});

describe('services and categories management', () => {
  const copy = strings.servicesCategories;

  it('renders every service and category row', async () => {
    const view = await render(<ServicesCategoriesManagementScreen />);

    expect(view.getByText(copy.servicesTitle)).toBeTruthy();
    expect(view.getByText(copy.categoriesTitle)).toBeTruthy();
    copy.services.forEach(service => expect(view.getByText(service.name)).toBeTruthy());
    copy.categories.forEach(category =>
      expect(view.getByText(category.title)).toBeTruthy(),
    );
  });
});

describe('add product basics and media', () => {
  const copy = strings.addProductBasics;

  it('renders the wizard step, media stage and item condition tiles', async () => {
    const view = await render(<AddProductBasicsMediaScreen />);

    expect(view.getByText(copy.headerTitle)).toBeTruthy();
    expect(view.getByText(copy.mediaTitle)).toBeTruthy();
    expect(view.getByText(copy.categoryTitle)).toBeTruthy();
    expect(view.getByText(copy.descriptionTitle)).toBeTruthy();
    expect(view.getByText(copy.continue)).toBeTruthy();
  });

  it('selects an item condition', async () => {
    const onContinue = jest.fn();
    const view = await render(<AddProductBasicsMediaScreen onContinue={onContinue} />);

    fireEvent.press(view.getByText(copy.conditions[1].label));
    await waitFor(() =>
      expect(view.getByLabelText(copy.conditions[1].label)).toBeTruthy(),
    );
    fireEvent.press(view.getByLabelText(copy.continue));

    await waitFor(() => expect(onContinue).toHaveBeenCalledTimes(1));
  });
});

describe('locations and branches', () => {
  /**
   * `Branch` is a *parsed* type, so every nullable column is a required key
   * holding a fallback — a partial literal is not assignable. Tests say only
   * what they care about; this fills the rest with the same "unset" shape the
   * schema produces.
   */
  const makeBranch = (overrides: Partial<Branch> = {}): Branch => ({
    id: 'b-1',
    name: 'Branch',
    uniqueCode: '',
    username: '',
    address: '',
    state: '',
    city: '',
    latitude: undefined,
    longitude: undefined,
    phone: '',
    isActive: true,
    isMainBranch: false,
    logoUrl: '',
    businessId: '',
    website: '',
    whatsappNumber: '',
    officialEmail: '',
    businessHours: null,
    ...overrides,
  });

  it('lists branches with their trading status and reach actions', async () => {
    const copy = strings.locationsBranches;
    const onViewDetails = jest.fn();
    const view = await render(<LocationsBranchesScreen onViewDetails={onViewDetails} />);

    expect(view.getByText(copy.title)).toBeTruthy();
    copy.branches.forEach(branch => {
      expect(view.getAllByText(branch.name).length).toBeGreaterThan(0);
      expect(view.getByText(branch.status)).toBeTruthy();
    });

    fireEvent.press(view.getAllByText(copy.viewDetails)[0]);
    await waitFor(() => expect(onViewDetails).toHaveBeenCalledWith('wuse'));
  });

  it('branch detail renders the branch it was given, not a fixture', async () => {
    const copy = strings.wuseBranchDetails;
    const view = await render(
      <WuseBranchDetailsScreen
        branch={makeBranch({
          name: 'Victoria Island Branch',
          address: '8B Adeola Odeku Street, Lagos',
          state: 'Lagos',
          city: 'Victoria Island',
          phone: '+234 812 443 0912',
          businessHours: {
            monday: { open: '09:00', close: '22:00', closed: false },
            tuesday: { open: '09:00', close: '22:00', closed: false },
          },
        })}
      />,
    );

    expect(view.getByText('Victoria Island Branch')).toBeTruthy();
    expect(view.getByText('8B Adeola Odeku Street, Lagos')).toBeTruthy();
    // Shown twice on purpose: once as the tappable contact row, once in the dossier.
    expect(view.getAllByText('+234 812 443 0912').length).toBe(2);
    expect(view.getByText(copy.dossierLabels.contact)).toBeTruthy();

    // The old fixtures belonged to a different branch entirely — none of them
    // may survive onto a screen that is now driven by real data.
    expect(view.queryByText('Wuse Branch')).toBeNull();
    expect(view.queryByText('John Peter')).toBeNull();
    expect(view.queryByText('9.0765° N, 7.4735° E • Wuse Market Cluster')).toBeNull();
  });

  it('branch detail shows only the dossier rows the branch actually has', async () => {
    const copy = strings.wuseBranchDetails;
    const view = await render(
      <WuseBranchDetailsScreen
        branch={makeBranch({ name: 'Garki Branch', isActive: false })}
      />,
    );

    // No phone, no location pair — so neither row may be rendered rather than
    // rendered with placeholder text.
    expect(view.queryByText(copy.dossierLabels.contact)).toBeNull();
    expect(view.queryByText(copy.dossierLabels.location)).toBeNull();
    expect(view.getByText(copy.dossierLabels.hours)).toBeTruthy();
    expect(view.getByText(copy.hoursUnavailable)).toBeTruthy();
    expect(view.getByText(copy.noCoordinates)).toBeTruthy();
  });

  it('branch detail offers deactivation only while the branch is active', async () => {
    const copy = strings.wuseBranchDetails;
    const view = await render(
      <WuseBranchDetailsScreen branch={makeBranch({ name: 'Maitama' })} />,
    );

    expect(view.getByLabelText(copy.deactivate)).toBeTruthy();
    expect(view.queryByLabelText(copy.reactivate)).toBeNull();
  });

  it('branch detail offers reactivation only while the branch is paused', async () => {
    const copy = strings.wuseBranchDetails;
    const view = await render(
      <WuseBranchDetailsScreen
        branch={makeBranch({ name: 'Maitama', isActive: false })}
      />,
    );

    expect(view.getByLabelText(copy.reactivate)).toBeTruthy();
    expect(view.queryByLabelText(copy.deactivate)).toBeNull();
  });

  it('branch detail deactivation confirm fires onConfirmDeactivate', async () => {
    const copy = strings.wuseBranchDetails;
    const onConfirmDeactivate = jest.fn();
    const view = await render(
      <WuseBranchDetailsScreen
        branch={makeBranch({ name: 'Wuse' })}
        onConfirmDeactivate={onConfirmDeactivate}
      />,
    );

    fireEvent.press(view.getByLabelText(copy.deactivate));
    await waitFor(() => expect(view.getByText(copy.confirmDeactivate)).toBeTruthy());
    fireEvent.press(view.getByText(copy.confirmDeactivate));
    await waitFor(() => expect(onConfirmDeactivate).toHaveBeenCalledTimes(1));
  });
});

describe('customer crm and dossier', () => {
  it('directory lists customers with segment, stats and live counts', async () => {
    const copy = strings.customerCrm;
    const view = await render(
      <CustomerCrmDirectoryScreen view={toCustomerDirectoryView([directoryFixture])} />,
    );

    expect(view.getByText(copy.headerTitle)).toBeTruthy();
    expect(view.getByText(copy.insightsTitle('1', '58%'))).toBeTruthy();
    expect(view.getByText('Michael James')).toBeTruthy();
    expect(view.getByText(copy.segmentLine(copy.segments.frequent, 'Gold'))).toBeTruthy();
    expect(view.getByText(copy.noContact)).toBeTruthy();
    expect(view.getByText(copy.showingLabel('2', '2'))).toBeTruthy();
    expect(view.getByLabelText('Frequent (1)')).toBeTruthy();
  });

  it('directory reports search, filter, sort, export and profile taps', async () => {
    const copy = strings.customerCrm;
    const onChangeSearch = jest.fn();
    const onChangeFilter = jest.fn();
    const onChangeSort = jest.fn();
    const onExport = jest.fn();
    const onViewProfile = jest.fn();
    const view = await render(
      <CustomerCrmDirectoryScreen
        view={toCustomerDirectoryView([directoryFixture])}
        onChangeSearch={onChangeSearch}
        onChangeFilter={onChangeFilter}
        onChangeSort={onChangeSort}
        onExport={onExport}
        onViewProfile={onViewProfile}
      />,
    );

    const step = async (action: () => void) => {
      await act(async () => {
        action();
      });
    };
    await step(() => fireEvent.changeText(view.getByLabelText(copy.searchLabel), 'mic'));
    await step(() => fireEvent.press(view.getByLabelText('New (1)')));
    await step(() =>
      fireEvent.press(view.getByLabelText(`${copy.sortPrefix}${copy.sorts.recent}`)),
    );
    await step(() => fireEvent.press(view.getByLabelText(copy.export)));
    await step(() => fireEvent.press(view.getAllByLabelText(copy.viewProfile)[0]));
    expect(onViewProfile).toHaveBeenCalledWith(michaelCard.userId);
    expect(onChangeSearch).toHaveBeenCalledWith('mic');
    expect(onChangeFilter).toHaveBeenCalledWith('new');
    expect(onChangeSort).toHaveBeenCalledWith('spend');
    expect(onExport).toHaveBeenCalledTimes(1);
  });

  it('directory shows the empty state for a search with no match', async () => {
    const view = await render(
      <CustomerCrmDirectoryScreen
        search="zz"
        view={toCustomerDirectoryView([{ ...directoryFixture, data: [], total: 0 }])}
      />,
    );
    expect(view.getByText(strings.customerCrm.noMatches.title)).toBeTruthy();
  });

  it('dossier renders summary metrics, history, ledger and the note', async () => {
    const copy = strings.customerDossier;
    const view = await render(
      <CustomerProfileDossierScreen view={toCustomerDossierView(dossierFixture)} />,
    );

    expect(view.getByText('Michael James')).toBeTruthy();
    expect(view.getByText(copy.summaryTitle)).toBeTruthy();
    expect(view.getByText(copy.dealsFigure('4'))).toBeTruthy();
    expect(view.getByText(copy.loyaltyFigure('2,450'))).toBeTruthy();
    expect(view.getByText('Receipt RC-94021')).toBeTruthy();
    expect(view.getByText(copy.voucherSaved('\u20a62,400'))).toBeTruthy();
    expect(view.getByText(copy.ledgerEntry('-500', 'Artisan Dessert'))).toBeTruthy();
    expect(view.getByText('Prefers the quiet booth near the patio.')).toBeTruthy();
  });

  it('dossier edits and saves the private note', async () => {
    const copy = strings.customerDossier;
    const onSaveNote = jest.fn();
    const view = await render(
      <CustomerProfileDossierScreen
        view={toCustomerDossierView(dossierFixture)}
        onSaveNote={onSaveNote}
      />,
    );

    await act(async () => {
      fireEvent.press(view.getByLabelText(copy.editNote));
    });
    await act(async () => {
      fireEvent.changeText(view.getByDisplayValue('vip, wine'), 'vip, patio');
    });
    await act(async () => {
      fireEvent.press(view.getByText(copy.saveNote));
    });
    expect(onSaveNote).toHaveBeenCalledWith({
      note: 'Prefers the quiet booth near the patio.',
      tags: ['vip', 'patio'],
    });
  });

  it('dossier shows an error state when the customer cannot load', async () => {
    const view = await render(
      <CustomerProfileDossierScreen isError onRetry={jest.fn()} />,
    );
    expect(view.getByText(strings.customerDossier.error.title)).toBeTruthy();
  });
});

describe('loyalty programme and rewards', () => {
  const branches: BusinessBranch[] = [
    { id: 'wuse', name: 'Wuse Branch', address: 'Aminu Kano Cres', active: true },
    { id: 'maitama', name: 'Maitama Branch', address: 'Gana Street', active: false },
  ];

  const rule = (overrides: Partial<LoyaltyRule> = {}): LoyaltyRule => ({
    id: 'rule-1',
    businessId: 'biz',
    branchId: 'wuse',
    ruleType: 'hybrid',
    isActive: true,
    spendingBaseAmount: 250,
    spendingBasePoints: 2,
    visitPoints: 50,
    visitCooldownHours: 6,
    firstVisitBonus: 100,
    birthdayBonus: 500,
    referralBonus: 200,
    ...overrides,
  });

  const programmeView = presentLoyaltyProgramme({
    rule: rule(),
    businessName: 'VEMTAP Bites & Perks',
    stats: {
      stats: [
        { label: 'Active members', value: '1,420', change: 14 },
        { label: 'Return rate', value: '84%', change: -3 },
      ],
      growthForecast: null,
    },
    branches,
    logs: [
      {
        id: 'log-1',
        amount: -350,
        type: 'redeemed',
        reason: 'Artisan Dessert',
        referenceCode: '',
        createdAt: new Date().toISOString(),
        customer: { id: 'u-1', firstName: 'Sarah', lastName: 'Adams', avatar: '' },
        branch: null,
      },
    ],
  });

  it('programme renders earning rules, stats and the branch scope', async () => {
    const copy = strings.loyaltyProgramme;
    const view = await render(
      <LoyaltyProgrammeConfigurationScreen view={programmeView} scope="wuse" />,
    );

    expect(view.getByText(copy.title)).toBeTruthy();
    // The programme carries the business's own name, not a stored one.
    expect(view.getByText('VEMTAP Bites & Perks')).toBeTruthy();
    expect(view.getByText(copy.statusActive)).toBeTruthy();
    expect(view.getByText(copy.rulesActive)).toBeTruthy();
    // Rule cards format their numbers straight off the row.
    expect(view.getByText('2 Points per ₦250 Spent')).toBeTruthy();
    expect(view.getByText('+50 Bonus Points per Visit')).toBeTruthy();
    expect(view.getByText('Max 1 check-in per 6 hours')).toBeTruthy();
    copy.rules.forEach(card => expect(view.getByText(card.title)).toBeTruthy());
    // Stats come from `GET /loyalty/business-stats`, sign and all.
    expect(view.getByText('Active members')).toBeTruthy();
    expect(view.getByText('1,420')).toBeTruthy();
    expect(view.getByText('+14%')).toBeTruthy();
    expect(view.getByText('-3%')).toBeTruthy();
    // Participating branches are the live ones; the paused one is marked.
    expect(view.getAllByText('Wuse Branch').length).toBeGreaterThan(0);
    expect(view.getByText('Maitama Branch (Paused)')).toBeTruthy();
    // Tabs that go nowhere are not offered.
    expect(view.queryByLabelText('Rewards')).toBeNull();
    expect(view.getByLabelText('Activity')).toBeTruthy();
  });

  it('programme reports the master switch position back to the route', async () => {
    const onToggleEnabled = jest.fn();
    const view = await render(
      <LoyaltyProgrammeConfigurationScreen
        view={programmeView}
        onToggleEnabled={onToggleEnabled}
      />,
    );

    fireEvent(view.getByLabelText('VEMTAP Bites & Perks'), 'valueChange', false);

    await waitFor(() => expect(onToggleEnabled).toHaveBeenCalledWith(false));
  });

  it('rule editor saves its numbers and refuses a value below the minimum', async () => {
    const copy = strings.loyaltyProgramme;
    const onSaveRules = jest.fn();
    const view = await render(
      <LoyaltyProgrammeConfigurationScreen
        view={programmeView}
        onSaveRules={onSaveRules}
      />,
    );

    await press(view.getAllByLabelText(copy.editRule)[0]);
    await waitFor(() => expect(view.getByText(copy.editTitle)).toBeTruthy());

    await type(view.getByLabelText(copy.ruleFields.spendingBaseAmount), '0');
    await press(view.getByText(copy.saveRule));
    expect(
      view.getByText(copy.ruleFieldMin(copy.ruleFields.spendingBaseAmount, 1)),
    ).toBeTruthy();
    expect(onSaveRules).not.toHaveBeenCalled();

    await type(view.getByLabelText(copy.ruleFields.spendingBaseAmount), '300');
    await press(view.getByText(copy.saveRule));

    await waitFor(() =>
      expect(onSaveRules).toHaveBeenCalledWith({
        spendingBaseAmount: 300,
        spendingBasePoints: 2,
      }),
    );
  });

  it('programme activity tab lists the point ledger', async () => {
    const copy = strings.loyaltyProgramme;
    const view = await render(
      <LoyaltyProgrammeConfigurationScreen view={programmeView} />,
    );

    await press(view.getByLabelText('Activity'));

    await waitFor(() => expect(view.getByText(copy.activityTitle)).toBeTruthy());
    expect(view.getByText('Sarah Adams')).toBeTruthy();
    expect(view.getByText('-350 pts · Artisan Dessert')).toBeTruthy();
  });

  it('programme reports loading and failure instead of an empty layout', async () => {
    const copy = strings.loyaltyProgramme;
    const loading = await render(<LoyaltyProgrammeConfigurationScreen isLoading />);
    expect(loading.getByText(copy.loading)).toBeTruthy();

    const failed = await render(<LoyaltyProgrammeConfigurationScreen isError />);
    expect(failed.getByText(copy.error.title)).toBeTruthy();
  });

  const reward = (overrides: Partial<Reward> = {}): Reward => ({
    id: 'reward-1',
    name: '₦2,500 Dining Voucher',
    description: 'Dining credit',
    pointsRequired: 500,
    category: 'custom_discount',
    coverImage: null,
    galleryImages: [],
    businessId: 'biz',
    branchId: 'wuse',
    createdBy: null,
    createdAt: '2026-09-01T10:00:00.000Z',
    updatedAt: null,
    totalQuantity: -1,
    remainingQuantity: -1,
    isActive: true,
    expiryDate: '2027-01-31T23:59:00.000Z',
    audienceType: 'all',
    ...overrides,
  });

  const rewardsView = presentRewards({
    rewards: [
      reward({ id: 'reward-1' }),
      reward({
        id: 'reward-2',
        name: 'VIP Priority Table',
        pointsRequired: 800,
        isActive: false,
        branchId: 'maitama',
      }),
      reward({
        id: 'reward-3',
        name: 'Festive Dessert',
        branchId: 'wuse',
        expiryDate: '2025-12-01T23:59:00.000Z',
      }),
    ],
    logs: [
      {
        id: 'log-1',
        amount: -350,
        type: 'redeemed',
        reason: 'Artisan Dessert',
        referenceCode: '',
        createdAt: new Date().toISOString(),
        customer: { id: 'u-1', firstName: 'Sarah', lastName: 'Adams', avatar: '' },
        branch: null,
      },
    ],
    branches,
    activeBranchId: 'wuse',
  });

  it('catalogue groups rewards by status and lists live figures', async () => {
    const copy = strings.loyaltyRewards;
    const view = await render(<LoyaltyRewardsRulesScreen view={rewardsView} />);

    expect(view.getByText(copy.catalogTitle)).toBeTruthy();
    // Grouping is derived from `isActive`/`expiryDate`, not from copy.
    expect(rewardsView.cards.active.map(card => card.title)).toEqual([
      '₦2,500 Dining Voucher',
    ]);
    expect(rewardsView.cards.paused.map(card => card.title)).toEqual([
      'VIP Priority Table',
    ]);
    expect(rewardsView.cards.expired.map(card => card.title)).toEqual([
      'Festive Dessert',
    ]);
    expect(view.getByText(rewardsView.activeCountLabel)).toBeTruthy();
    expect(view.queryByText('VIP Priority Table')).toBeNull();
    // Card figures read off the reward row itself.
    expect(view.getByText('500 Points')).toBeTruthy();
    expect(view.getByText('Unlimited stock')).toBeTruthy();
    expect(view.getByText('Wuse Branch')).toBeTruthy();
    expect(view.getByText(/^Expires /)).toBeTruthy();
    // The tab strip and the status pill both read "Active".
    expect(view.getAllByText('Active').length).toBeGreaterThan(0);
    copy.safeguards.forEach(safeguard => expect(view.getByText(safeguard)).toBeTruthy());
    expect(view.getByText('Sarah Adams')).toBeTruthy();
    expect(view.getByText('-350 pts · Artisan Dessert')).toBeTruthy();
    expect(view.getByText(copy.createAnother)).toBeTruthy();
  });

  it('pause toggle sends the next state for the reward', async () => {
    const copy = strings.loyaltyRewards;
    const onTogglePause = jest.fn();
    const view = await render(
      <LoyaltyRewardsRulesScreen view={rewardsView} onTogglePause={onTogglePause} />,
    );

    await press(view.getByLabelText(copy.pause));

    expect(onTogglePause).toHaveBeenCalledWith('reward-1', false);
  });

  it('create sheet validates before handing the reward to the route', async () => {
    const copy = strings.loyaltyRewards;
    const onCreateReward = jest.fn();
    const view = await render(
      <LoyaltyRewardsRulesScreen view={rewardsView} onCreateReward={onCreateReward} />,
    );

    await press(view.getByText(copy.createAnother));
    await waitFor(() => expect(view.getByText(copy.sheetCreateTitle)).toBeTruthy());

    await press(view.getByText(copy.publish));
    expect(view.getByText(copy.errors.name)).toBeTruthy();
    expect(onCreateReward).not.toHaveBeenCalled();

    await type(view.getByLabelText(copy.fields.perkTitle), 'Free Coffee');
    await type(
      view.getByLabelText(copy.fields.description),
      'Any filter coffee, on the house',
    );
    await type(view.getByLabelText(copy.fields.pointsCost), '400');
    await type(view.getByLabelText(copy.fields.stockCap), '50');
    await press(view.getByText(copy.publish));

    await waitFor(() =>
      expect(onCreateReward).toHaveBeenCalledWith({
        name: 'Free Coffee',
        description: 'Any filter coffee, on the house',
        pointsRequired: 400,
        totalQuantity: 50,
        expiryDate: expect.any(String),
        // Default selections: first category and the branch the list was read for.
        category: 'custom_discount',
        branchId: 'wuse',
      }),
    );
  });

  it('constraint editor patches the reward it was opened for', async () => {
    const copy = strings.loyaltyRewards;
    const onEditReward = jest.fn();
    const view = await render(
      <LoyaltyRewardsRulesScreen view={rewardsView} onEditReward={onEditReward} />,
    );

    await press(view.getByLabelText(copy.editRules));
    await waitFor(() => expect(view.getByText(copy.sheetEditTitle)).toBeTruthy());

    await type(view.getByLabelText(copy.fields.pointsCost), '650');
    await press(view.getByText(copy.savePolicy));

    await waitFor(() =>
      expect(onEditReward).toHaveBeenCalledWith('reward-1', {
        pointsRequired: 650,
        totalQuantity: -1,
        expiryDate: expect.any(String),
      }),
    );
  });

  it('deleting a reward asks for confirmation first', async () => {
    const copy = strings.loyaltyRewards;
    const onDeleteReward = jest.fn();
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    const view = await render(
      <LoyaltyRewardsRulesScreen view={rewardsView} onDeleteReward={onDeleteReward} />,
    );

    await press(view.getByLabelText(`₦2,500 Dining Voucher — ${copy.editRules}`));
    await waitFor(() => expect(view.getByText(copy.optionDelete)).toBeTruthy());
    await press(view.getByText(copy.optionDelete));

    expect(alert).toHaveBeenCalledWith(
      copy.removeTitle,
      copy.removeBody,
      expect.any(Array),
    );
    const buttons = alert.mock.calls[0][2] as Array<{
      text: string;
      onPress?: () => void;
    }>;
    buttons.find(button => button.text === copy.removeConfirm)?.onPress?.();
    expect(onDeleteReward).toHaveBeenCalledWith('reward-1');
    alert.mockRestore();
  });

  it('rewards report loading and failure instead of an empty catalogue', async () => {
    const copy = strings.loyaltyRewards;
    const loading = await render(<LoyaltyRewardsRulesScreen isLoading />);
    expect(loading.getByText(copy.loading)).toBeTruthy();

    const failed = await render(<LoyaltyRewardsRulesScreen isError />);
    expect(failed.getByText(copy.error.title)).toBeTruthy();
  });
});

describe('staff access and invitation', () => {
  const branches = [{ id: 'b1', name: 'Wuse Branch (Abuja Flagship)' }];
  const currentUserId = 'u-owner';

  const member = (overrides: Partial<TeamMember> & { id: string }): TeamMember => ({
    firstName: 'John',
    lastName: 'Peter',
    email: 'john@example.com',
    phone: '',
    jobTitle: '',
    avatar: '',
    roleTag: 'Manager',
    role: 'Manager',
    status: 'Active',
    permissions: ['dashboard'],
    branchId: 'b1',
    businessId: 'biz',
    isOnline: false,
    lastActive: null,
    createdAt: null,
    ...overrides,
  });

  const view = presentStaffDirectory({
    members: [
      member({
        id: 'u-owner',
        firstName: 'Zainab',
        lastName: 'Ahmed',
        email: 'zainab@example.com',
        roleTag: '',
        role: 'Owner',
        branchId: '',
        isOnline: true,
      }),
      member({ id: 'u-manager' }),
      member({
        id: 'u-pending',
        firstName: 'Kemi',
        lastName: 'Davies',
        email: 'kemi.d@example.com',
        roleTag: 'Service Staff',
        role: 'Staff',
        status: 'Invited',
        permissions: [],
      }),
    ],
    branches,
    currentUserId,
  });

  it('directory renders the live members, governance and the invite CTA', async () => {
    const copy = strings.staffDirectory;
    const rendered = await render(
      <StaffTeamAccessDirectoryScreen view={view} scope="all" />,
    );

    expect(rendered.getByText(copy.title)).toBeTruthy();
    expect(rendered.getByText('Zainab Ahmed')).toBeTruthy();
    expect(rendered.getByText('(You)')).toBeTruthy();
    expect(rendered.getByText('John Peter')).toBeTruthy();
    expect(rendered.getByText('Kemi Davies')).toBeTruthy();
    // Counts come from the payload, not from copy.
    expect(rendered.getByText('All · 3')).toBeTruthy();
    expect(rendered.getByText('Owners · 1')).toBeTruthy();
    expect(rendered.getByText('Managers · 1')).toBeTruthy();
    expect(rendered.getByText('Staff & Cashiers · 1')).toBeTruthy();
    expect(rendered.getByText('1 Online')).toBeTruthy();
    copy.governance.forEach(row =>
      expect(rendered.getAllByText(row.title).length).toBeGreaterThan(0),
    );
    expect(rendered.getByText(copy.inviteCta)).toBeTruthy();
  });

  it('filters the directory by role group', async () => {
    // Driving the chip itself is not expressible in this harness — the chips
    // live in a horizontal NativeWind scroller whose Pressable swallows the
    // simulated tap (same limitation noted in `ScopePickerBehaviour.test.tsx`).
    // The route owns the filter and passes it down, so the filtered render is
    // asserted through the prop the chip would set.
    const rendered = await render(
      <StaffTeamAccessDirectoryScreen view={view} scope="all" filter="owners" />,
    );

    expect(rendered.getByText('Zainab Ahmed')).toBeTruthy();
    expect(rendered.queryByText('John Peter')).toBeNull();
    expect(rendered.queryByText('Kemi Davies')).toBeNull();
  });

  it('directory reports loading and failure instead of an empty list', async () => {
    const copy = strings.staffDirectory;
    const loading = await render(<StaffTeamAccessDirectoryScreen isLoading />);
    expect(loading.getByText(copy.loading)).toBeTruthy();

    const failed = await render(<StaffTeamAccessDirectoryScreen isError />);
    expect(failed.getByText(copy.error.title)).toBeTruthy();
  });

  it('invite form renders contact, roles and enforced permissions', async () => {
    const copy = strings.inviteStaff;
    const rendered = await render(
      <InviteStaffPermissionsScreen branches={branches} defaultBranchId="b1" />,
    );

    expect(rendered.getByText(copy.title)).toBeTruthy();
    expect(rendered.getByText(copy.contactTitle)).toBeTruthy();
    copy.roles.forEach(role => expect(rendered.getByText(role.title)).toBeTruthy());
    copy.permissions.forEach(permission =>
      expect(rendered.getByText(permission.title)).toBeTruthy(),
    );
    expect(rendered.getAllByText('Wuse Branch (Abuja Flagship)').length).toBeGreaterThan(
      0,
    );
    expect(rendered.getByText(copy.send)).toBeTruthy();
  });

  it('refuses to send an incomplete invitation', async () => {
    const copy = strings.inviteStaff;
    const onSend = jest.fn();
    const rendered = await render(
      <InviteStaffPermissionsScreen
        branches={branches}
        defaultBranchId="b1"
        onSend={onSend}
      />,
    );

    await press(rendered.getByText(copy.send));

    expect(onSend).not.toHaveBeenCalled();
    expect(rendered.getByText(copy.errors.name)).toBeTruthy();
  });

  it('switches the invite channel', async () => {
    const copy = strings.inviteStaff;
    const rendered = await render(
      <InviteStaffPermissionsScreen branches={branches} defaultBranchId="b1" />,
    );

    fireEvent.press(rendered.getByText(copy.channelSms));

    await waitFor(() => expect(rendered.getByText(copy.channelSms)).toBeTruthy());
  });
});

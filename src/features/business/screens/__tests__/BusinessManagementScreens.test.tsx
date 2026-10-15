import React from 'react';
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react-native';
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
import type { Branch } from '@api/branchApi';

afterEach(cleanup);

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
  it('directory lists customers with segment and stats', async () => {
    const copy = strings.customerCrm;
    const view = await render(<CustomerCrmDirectoryScreen />);

    expect(view.getByText(copy.headerTitle)).toBeTruthy();
    expect(view.getByText(copy.insightsTitle)).toBeTruthy();
    copy.customers.forEach(customer => {
      expect(view.getByText(customer.name)).toBeTruthy();
      expect(view.getByText(customer.segment)).toBeTruthy();
    });
  });

  it('dossier renders summary metrics and transaction history', async () => {
    const copy = strings.customerDossier;
    const view = await render(<CustomerProfileDossierScreen />);

    expect(view.getByText(copy.name)).toBeTruthy();
    expect(view.getByText(copy.summaryTitle)).toBeTruthy();
    copy.metrics.forEach(metric => expect(view.getByText(metric.figure)).toBeTruthy());
    expect(view.getByText(copy.orderTitle)).toBeTruthy();
    expect(view.getByText(copy.notesTitle)).toBeTruthy();
  });
});

describe('loyalty programme and rewards', () => {
  it('programme configuration renders rules, scope and expiry policy', async () => {
    const copy = strings.loyaltyProgramme;
    const view = await render(<LoyaltyProgrammeConfigurationScreen />);

    expect(view.getByText(copy.title)).toBeTruthy();
    expect(view.getByText(copy.name)).toBeTruthy();
    copy.rules.forEach(rule => expect(view.getByText(rule.title)).toBeTruthy());
    expect(view.getByText(copy.expiryTitle)).toBeTruthy();
    expect(view.getByText(copy.save)).toBeTruthy();
  });

  it('rewards catalogue lists perks with safeguards and redemptions', async () => {
    const copy = strings.loyaltyRewards;
    const view = await render(<LoyaltyRewardsRulesScreen />);

    expect(view.getByText(copy.catalogTitle)).toBeTruthy();
    copy.rewards.forEach(reward => expect(view.getByText(reward.title)).toBeTruthy());
    expect(view.getByText(copy.safeguardsTitle)).toBeTruthy();
    expect(view.getByText(copy.createAnother)).toBeTruthy();
  });
});

describe('staff access and invitation', () => {
  it('directory renders members, governance and the invite CTA', async () => {
    const copy = strings.staffDirectory;
    const view = await render(<StaffTeamAccessDirectoryScreen />);

    expect(view.getByText(copy.title)).toBeTruthy();
    copy.members.forEach(member => expect(view.getByText(member.name)).toBeTruthy());
    copy.governance.forEach(row =>
      expect(view.getAllByText(row.title).length).toBeGreaterThan(0),
    );
    expect(view.getByText(copy.inviteCta)).toBeTruthy();
  });

  it('invite form renders contact, roles and enforced permissions', async () => {
    const copy = strings.inviteStaff;
    const view = await render(<InviteStaffPermissionsScreen />);

    expect(view.getByText(copy.title)).toBeTruthy();
    expect(view.getByText(copy.contactTitle)).toBeTruthy();
    copy.roles.forEach(role => expect(view.getByText(role.title)).toBeTruthy());
    copy.permissions.forEach(permission =>
      expect(view.getByText(permission.title)).toBeTruthy(),
    );
    expect(view.getByText(copy.send)).toBeTruthy();
  });

  it('switches the invite channel', async () => {
    const copy = strings.inviteStaff;
    const view = await render(<InviteStaffPermissionsScreen />);

    fireEvent.press(view.getByText(copy.channelSms));

    await waitFor(() => expect(view.getByText(copy.channelSms)).toBeTruthy());
  });
});

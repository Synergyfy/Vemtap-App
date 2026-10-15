import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react-native';
import { BusinessTabNavigator } from '@navigation/BusinessTabNavigator';
import { strings } from '@constants/strings';
import { catalogueApi } from '@api/catalogueApi';
import { useCatalogueDraftStore } from '@store/catalogueDraftStore';

const shell = strings.businessShell;
const hub = strings.businessHub;
const staff = strings.staffDirectory;

afterEach(() => {
  cleanup();
  jest.restoreAllMocks();
  useCatalogueDraftStore.getState().resetDeal();
});

/** Mount the shell and land on the Business hub tab. */
async function openBusinessTab() {
  await render(
    <NavigationContainer>
      <BusinessTabNavigator />
    </NavigationContainer>,
  );
  await act(async () => {
    fireEvent.press(screen.getByLabelText(shell.tabs.business));
  });
}

/**
 * Walks a chain of presses and asserts the final screen's heading is present.
 * `steps` are the accessible labels to press, in order.
 */
async function expectToReach(steps: readonly string[], heading: string) {
  await openBusinessTab();
  await steps.reduce(async (previous, label) => {
    await previous;
    await act(async () => {
      fireEvent.press(screen.getByLabelText(label));
    });
  }, Promise.resolve());
  expect(screen.getAllByText(heading).length).toBeGreaterThan(0);
}

describe('business management surfaces are reachable', () => {
  const module = (id: string) => hub.modules.find(entry => entry.id === id)!.title;

  it('reaches locations & branches, then the Wuse branch details', async () => {
    await expectToReach([module('locations')], strings.locationsBranches.title);

    // Every branch card carries the same CTA; target the first.
    await act(async () => {
      fireEvent.press(screen.getAllByLabelText(strings.locationsBranches.viewDetails)[0]);
    });
    expect(
      screen.getAllByText(strings.wuseBranchDetails.headerTitle).length,
    ).toBeGreaterThan(0);
  });

  it('reaches the product catalogue and services categories', async () => {
    await expectToReach([module('products')], strings.centralCatalogue.headerTitle);

    await openBusinessTab();
    await act(async () => {
      fireEvent.press(screen.getByLabelText(module('products')));
    });
    await act(async () => {
      fireEvent.press(screen.getByLabelText(strings.centralCatalogue.addService));
    });
    expect(
      screen.getAllByText(strings.servicesCategories.servicesTitle).length,
    ).toBeGreaterThan(0);
  });

  it('walks the product flow: basics & media -> location pricing -> branch availability', async () => {
    await expectToReach([module('products')], strings.centralCatalogue.headerTitle);

    // Step 1: add a product.
    await act(async () => {
      fireEvent.press(screen.getByLabelText(strings.centralCatalogue.addProduct));
    });
    expect(
      screen.getAllByText(strings.addProductBasics.headerTitle).length,
    ).toBeGreaterThan(0);

    // Step 2: location assignment (pricing + branch scope).
    await act(async () => {
      fireEvent.press(screen.getByLabelText(strings.addProductBasics.continue));
    });
    expect(
      screen.getAllByText(strings.dealLocationAssignment.productSummary.headerTitle)
        .length,
    ).toBeGreaterThan(0);

    // Step 3: saving scope lands on branch availability + location pricing.
    // The CTA embeds the active-branch count, so match on its stable prefix.
    await act(async () => {
      fireEvent.press(screen.getByLabelText(/^Save Location Assignment/));
    });
    expect(
      screen.getAllByText(strings.dealLocationAssignment.lamb.headerTitle).length,
    ).toBeGreaterThan(0);
  });

  it('reaches deals management, deal performance and location assignment pricing', async () => {
    jest.spyOn(catalogueApi, 'listBusinessItems').mockResolvedValue({
      data: [
        {
          id: 'item-1',
          name: 'Jollof Bowl',
          price: 6000,
          status: 'active',
          itemType: 'product',
          isSuspended: false,
        },
      ],
      total: 1,
      page: undefined,
      limit: undefined,
      totalPages: undefined,
      hasNextPage: false,
      hasPrevPage: false,
    } as never);
    await expectToReach([module('deals')], strings.centralDeals.headerTitle);

    // Deals management -> create a deal -> the four-step wizard (step 1).
    await act(async () => {
      fireEvent.press(screen.getByLabelText(strings.centralDeals.createDeal));
    });
    expect(
      screen.getAllByText(strings.businessCreateDeal.step1.headerTitle).length,
    ).toBeGreaterThan(0);

    // A new deal needs its item first; the picker opens on its own.
    await act(async () => {
      fireEvent.press(await screen.findByLabelText('Jollof Bowl'));
    });
    await act(async () => {
      fireEvent.press(screen.getByText(strings.dealItemPicker.confirm(1)));
    });

    // The wizard steps forward through the shared draft store.
    await act(async () => {
      fireEvent.press(screen.getByText(strings.businessCreateDeal.step1.continueLabel));
    });
    expect(screen.getAllByText('Media & Creative').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Step 2 of 4/).length).toBeGreaterThan(0);
  });

  it('opens a live deal in the edit wizard from Deals & Promotions', async () => {
    // Edit used to open the create flow with nothing loaded, so saving made a
    // duplicate deal. It now loads the deal and walks the wizard in edit mode.
    jest.spyOn(catalogueApi, 'listBusinessOffers').mockResolvedValue([
      {
        id: 'offer-1',
        dealGroupId: 'group-1',
        name: 'Lunch Combo',
        status: 'active',
        branchId: 'branch-1',
        pricingType: 'percentage_discount',
        discountValue: 20,
        calculatedPrice: 8000,
        originalPrice: 10000,
        items: [{ id: 'item-1', name: 'Jollof Bowl', price: 10000 }],
        branches: [],
      },
    ]);
    jest.spyOn(catalogueApi, 'getOffersSummary').mockResolvedValue({
      activeDeals: 1,
      activeOffers: 1,
      claimsToday: 0,
      redeemedToday: 0,
      netRevenue30d: 8000,
      discountGiven30d: 2000,
    });

    await expectToReach([module('deals')], strings.centralDeals.headerTitle);
    expect(await screen.findByText('Lunch Combo')).toBeTruthy();

    await act(async () => {
      fireEvent.press(screen.getAllByLabelText(strings.centralDeals.edit)[0]);
    });
    expect(
      screen.getAllByText(strings.businessCreateDeal.step1.headerTitle).length,
    ).toBeGreaterThan(0);
    expect(useCatalogueDraftStore.getState().deal.editingDealGroupId).toBe('group-1');
  });

  it('starts a new deal by choosing its items', async () => {
    // Create Deal used to open the wizard with no item, which the API rejects.
    jest.spyOn(catalogueApi, 'listBusinessOffers').mockResolvedValue([]);
    jest.spyOn(catalogueApi, 'listBusinessItems').mockResolvedValue({
      data: [
        {
          id: 'item-1',
          name: 'Jollof Bowl',
          price: '6000.00',
          status: 'active',
          itemType: 'product',
          isSuspended: false,
        },
        {
          id: 'item-2',
          name: 'Paused Wings',
          price: 4000,
          status: 'inactive',
          itemType: 'product',
          isSuspended: false,
        },
      ],
      total: 2,
      page: undefined,
      limit: undefined,
      totalPages: undefined,
      hasNextPage: false,
      hasPrevPage: false,
    } as never);

    await expectToReach([module('deals')], strings.centralDeals.headerTitle);
    await act(async () => {
      fireEvent.press(screen.getAllByLabelText(strings.centralDeals.createDeal)[0]);
    });

    // The picker opens on its own and offers only live items.
    expect(await screen.findByLabelText('Jollof Bowl')).toBeTruthy();
    expect(screen.queryByLabelText('Paused Wings')).toBeNull();

    await act(async () => {
      fireEvent.press(screen.getByLabelText('Jollof Bowl'));
    });
    await act(async () => {
      fireEvent.press(screen.getByText(strings.dealItemPicker.confirm(1)));
    });
    expect(useCatalogueDraftStore.getState().deal).toMatchObject({
      itemIds: ['item-1'],
      sourceProductId: 'item-1',
      name: 'Jollof Bowl deal',
      basePrice: 6000,
    });
  });

  it('reaches CRM directory, loyalty programme, staff directory and invite', async () => {
    await expectToReach([module('crm')], strings.customerCrm.headerTitle);

    await openBusinessTab();
    await act(async () => {
      fireEvent.press(screen.getByLabelText(module('loyalty')));
    });
    expect(
      screen.getAllByText(strings.loyaltyProgramme.headerTitle).length,
    ).toBeGreaterThan(0);

    await openBusinessTab();
    await act(async () => {
      fireEvent.press(screen.getByLabelText(module('staff')));
    });
    expect(
      screen.getAllByText(strings.staffDirectory.headerTitle).length,
    ).toBeGreaterThan(0);

    await act(async () => {
      fireEvent.press(screen.getByLabelText(staff.invite));
    });
    expect(screen.getAllByText(strings.inviteStaff.headerTitle).length).toBeGreaterThan(
      0,
    );
  });

  it('reaches every numbered deals-management design from the management hub', async () => {
    const cases: [string, string][] = [
      ['deals', strings.centralDeals.headerTitle],
      ['deals-flash', strings.centralDeals.flashAlert],
      ['deals-campaigns', strings.centralDeals.pulseTitle],
      // design 1 renders the campaign cards, not a pulse or alert banner.
    ];

    await cases.reduce(async (previous, [moduleId, heading]) => {
      await previous;
      await openBusinessTab();
      // Business hub -> management hub, then the module row.
      await act(async () => {
        fireEvent.press(screen.getByLabelText(hub.quickSwitchLabel));
      });
      await act(async () => {
        fireEvent.press(
          screen.getByLabelText(
            strings.businessManagementHub.menu.find(m => m.id === moduleId)!.title,
          ),
        );
      });
      expect(screen.getAllByText(heading).length).toBeGreaterThan(0);
    }, Promise.resolve());
  });

  it('reaches both numbered catalogue designs from the management hub', async () => {
    const cases: [string, string][] = [
      ['catalogue', strings.centralCatalogue.headerTitle],
      ['catalogue-hub', strings.centralCatalogue.tabsBusiness[0].label],
    ];

    await cases.reduce(async (previous, [moduleId, heading]) => {
      await previous;
      await openBusinessTab();
      await act(async () => {
        fireEvent.press(screen.getByLabelText(hub.quickSwitchLabel));
      });
      await act(async () => {
        fireEvent.press(
          screen.getByLabelText(
            strings.businessManagementHub.menu.find(m => m.id === moduleId)!.title,
          ),
        );
      });
      expect(screen.getAllByText(heading).length).toBeGreaterThan(0);
    }, Promise.resolve());
  });

  it('reaches the profile preview and the management hub', async () => {
    await expectToReach(
      [strings.businessProfilePreview.editProfile],
      strings.businessProfilePreview.headerTitle,
    );

    await openBusinessTab();
    await act(async () => {
      fireEvent.press(screen.getByLabelText(hub.quickSwitchLabel));
    });
    expect(
      screen.getAllByText(strings.businessManagementHub.title).length,
    ).toBeGreaterThan(0);
  });
});

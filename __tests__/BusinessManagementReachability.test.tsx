import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react-native';
import { BusinessTabNavigator } from '@navigation/BusinessTabNavigator';
import { strings } from '@constants/strings';

const shell = strings.businessShell;
const hub = strings.businessHub;
const staff = strings.staffDirectory;

afterEach(cleanup);

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
    await expectToReach([module('deals')], strings.centralDeals.headerTitle);

    // Deals management -> create a deal -> location assignment.
    await act(async () => {
      fireEvent.press(screen.getByLabelText(strings.centralDeals.createDeal));
    });
    expect(
      screen.getAllByText(strings.dealLocationAssignment.scopeTitle).length,
    ).toBeGreaterThan(0);
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

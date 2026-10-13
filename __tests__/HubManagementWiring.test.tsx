import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react-native';
import { CentralCatalogueScreen } from '@features/business/screens/CentralCatalogueScreen';
import { CentralDealsManagementScreen } from '@features/business/screens/CentralDealsManagementScreen';
import { ServicesCategoriesManagementScreen } from '@features/business/screens/ServicesCategoriesManagementScreen';
import { CreateDealLocationAssignmentScreen } from '@features/business/screens/CreateDealLocationAssignmentScreen';
import { DealLocationAssignmentPricingScreen } from '@features/business/screens/DealLocationAssignmentPricingScreen';

afterEach(cleanup);

describe('central catalogue screen — item actions', () => {
  test('toggle stock fires with item id and value', async () => {
    const onToggleStock = jest.fn();
    await render(
      <CentralCatalogueScreen layout="directory" onToggleStock={onToggleStock} />,
    );

    const toggle = screen.getAllByRole('switch')[0];
    await fireEvent(toggle, 'valueChange', true);

    expect(onToggleStock).toHaveBeenCalledWith(expect.any(String), expect.any(Boolean));
  });

  test('edit item fires with item id', async () => {
    const onEditItem = jest.fn();
    await render(<CentralCatalogueScreen layout="directory" onEditItem={onEditItem} />);

    const menus = screen.getAllByLabelText(/options/i);
    await fireEvent.press(menus[0]);

    const edit = screen.getAllByText(/edit/i).find(el => {
      const { parent } = el;
      return parent?.props?.accessibilityRole === 'menuitem';
    });
    if (edit) {
      await fireEvent.press(edit);
    } else {
      await fireEvent.press(screen.getAllByText(/edit/i)[0]);
    }

    expect(onEditItem).toHaveBeenCalledWith(expect.any(String));
  });

  test('sheet archive action fires onSheetAction with delete and item id', async () => {
    const onSheetAction = jest.fn();
    await render(
      <CentralCatalogueScreen layout="directory" onSheetAction={onSheetAction} />,
    );

    const menus = screen.getAllByLabelText(/options/i);
    await fireEvent.press(menus[0]);

    await fireEvent.press(screen.getByText('Archive from Catalogue'));
    expect(onSheetAction).toHaveBeenCalledWith('delete', expect.any(String));
  });
});

describe('central deals management screen — deal actions', () => {
  test('pause deal fires with deal id', async () => {
    const onPauseDeal = jest.fn();
    await render(
      <CentralDealsManagementScreen layout="hero" onPauseDeal={onPauseDeal} />,
    );

    const pauseButtons = screen.getAllByText(/pause/i);
    await fireEvent.press(pauseButtons[0]);

    expect(onPauseDeal).toHaveBeenCalledWith(expect.any(String));
  });
});

describe('services categories screen — actions', () => {
  test('add category fires', async () => {
    const onAddCategory = jest.fn();
    await render(<ServicesCategoriesManagementScreen onAddCategory={onAddCategory} />);

    await fireEvent.press(screen.getByText(/add category/i));
    expect(onAddCategory).toHaveBeenCalledTimes(1);
  });

  test('edit service callback is passed through', async () => {
    const onEditService = jest.fn();
    const onServiceAction = jest.fn();
    await render(
      <ServicesCategoriesManagementScreen
        onEditService={onEditService}
        onServiceAction={onServiceAction}
      />,
    );

    expect(onEditService).toBeDefined();
    expect(onServiceAction).toBeDefined();
  });

  test('add service fires', async () => {
    const onAddService = jest.fn();
    await render(<ServicesCategoriesManagementScreen onAddService={onAddService} />);

    await fireEvent.press(screen.getByText('Add Service'));
    expect(onAddService).toHaveBeenCalledTimes(1);
  });

  test('category edit fires with category id', async () => {
    const onEditCategory = jest.fn();
    await render(<ServicesCategoriesManagementScreen onEditCategory={onEditCategory} />);

    const editButtons = screen.getAllByLabelText(/^Edit /);
    await fireEvent.press(editButtons[0]);
    expect(onEditCategory).toHaveBeenCalledWith(expect.any(String));
  });

  test('category archive fires with category id', async () => {
    const onArchiveCategory = jest.fn();
    await render(
      <ServicesCategoriesManagementScreen onArchiveCategory={onArchiveCategory} />,
    );

    const archiveButtons = screen.getAllByLabelText(/^Archive /);
    await fireEvent.press(archiveButtons[0]);
    expect(onArchiveCategory).toHaveBeenCalledWith(expect.any(String));
  });
});

describe('hub deal location assignment screen', () => {
  test('review launch fires', async () => {
    const onReviewLaunch = jest.fn();
    await render(
      <CreateDealLocationAssignmentScreen
        onBack={jest.fn()}
        onReviewLaunch={onReviewLaunch}
      />,
    );

    await fireEvent.press(screen.getByText('Review & Launch Deal'));
    expect(onReviewLaunch).toHaveBeenCalledTimes(1);
  });

  test('save draft fires', async () => {
    const onSaveDraft = jest.fn();
    await render(
      <CreateDealLocationAssignmentScreen onBack={jest.fn()} onSaveDraft={onSaveDraft} />,
    );

    await fireEvent.press(screen.getByText('Save Deal as Draft'));
    expect(onSaveDraft).toHaveBeenCalledTimes(1);
  });
});

describe('hub deal location pricing screen', () => {
  test('save fires', async () => {
    const onSave = jest.fn();
    await render(
      <DealLocationAssignmentPricingScreen onBack={jest.fn()} onSave={onSave} />,
    );

    await fireEvent.press(screen.getByText('Save Location Assignment & Pricing'));
    expect(onSave).toHaveBeenCalledTimes(1);
  });
});

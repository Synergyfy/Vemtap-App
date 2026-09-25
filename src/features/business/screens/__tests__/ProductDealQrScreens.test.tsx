import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import { AddProductLocationPricingScreen } from '@features/business/screens/AddProductLocationPricingScreen';
import { AddProductBasicsCategoryScreen } from '@features/business/screens/AddProductBasicsCategoryScreen';
import { AddProductPricingVariantsScreen } from '@features/business/screens/AddProductPricingVariantsScreen';
import { AddProductBranchAvailabilityScreen } from '@features/business/screens/AddProductBranchAvailabilityScreen';
import { ReviewProductSummaryScreen } from '@features/business/screens/ReviewProductSummaryScreen';
import { ProductPublishedOrSavedAsDraftScreen } from '@features/business/screens/ProductPublishedOrSavedAsDraftScreen';
import { ProductPublishedMakeItADealScreen } from '@features/business/screens/ProductPublishedMakeItADealScreen';
import { CreateDealOfferAutoImportedScreen } from '@features/business/screens/CreateDealOfferAutoImportedScreen';
import { CreateDealStep2LimitsGiftingRulesScreen } from '@features/business/screens/CreateDealStep2LimitsGiftingRulesScreen';
import { CreateDealStep3ParticipatingBranchesScheduleScreen } from '@features/business/screens/CreateDealStep3ParticipatingBranchesScheduleScreen';
import { YourVemtapBusinessQrIsReadyScreen } from '@features/business/screens/YourVemtapBusinessQrIsReadyScreen';

const onBack = jest.fn();

describe('product, deal and QR setup screens', () => {
  it('renders product location details', async () => {
    const view = await render(<AddProductLocationPricingScreen onBack={onBack} />);
    expect(view.getByText('Location Details')).toBeTruthy();
    expect(view.getByText('Add Product')).toBeTruthy();
  });

  it('renders product basics', async () => {
    const view = await render(<AddProductBasicsCategoryScreen onBack={onBack} />);
    expect(view.getByText('Product Media')).toBeTruthy();
    expect(view.getByText('Category Placement')).toBeTruthy();
  });

  it('renders product pricing and variants', async () => {
    const view = await render(<AddProductPricingVariantsScreen onBack={onBack} />);
    expect(view.getByText('Price, Variants & Stock')).toBeTruthy();
    expect(view.getByText('Inventory & SKU')).toBeTruthy();
  });

  it('renders product branch availability', async () => {
    const view = await render(<AddProductBranchAvailabilityScreen onBack={onBack} />);
    expect(view.getByText('Where is this sold & fulfilled?')).toBeTruthy();
    expect(view.getByText('Handling & Prep Window')).toBeTruthy();
  });

  it('renders the product review summary', async () => {
    const view = await render(<ReviewProductSummaryScreen onBack={onBack} />);
    expect(view.getByText('Review Product Summary')).toBeTruthy();
    expect(view.getByText('Ready for customers')).toBeTruthy();
  });

  it('renders the published product state', async () => {
    const view = await render(<ProductPublishedOrSavedAsDraftScreen onBack={onBack} />);
    expect(view.getByText('Product is Live on Storefront!')).toBeTruthy();
    expect(view.getByText('Live Mode Enabled')).toBeTruthy();
  });

  it('opens the shared quick setup sheet and returns the deal selection', async () => {
    const onConvertToDeal = jest.fn();
    const view = await render(
      <ProductPublishedMakeItADealScreen
        onBack={onBack}
        onConvertToDeal={onConvertToDeal}
      />,
    );

    expect(view.getByText('Make this product a VEMTAP Deal?')).toBeTruthy();

    await act(async () => {
      fireEvent.press(view.getByText('Convert to Deal Offer (Auto-Imported)'));
    });

    expect(view.getByText('Quick Setup: Woodfire Ribeye')).toBeTruthy();
    await act(async () => {
      fireEvent.press(view.getByText('25% OFF'));
    });
    await act(async () => {
      fireEvent.press(view.getByText('Publish VEMTAP Radar Deal'));
    });
    expect(onConvertToDeal).toHaveBeenCalledWith({
      discountPercent: 25,
      memberPrice: '₦9,000',
      vouchersPerDay: 25,
    });
  });

  it('renders the imported deal offer', async () => {
    const view = await render(<CreateDealOfferAutoImportedScreen onBack={onBack} />);
    expect(view.getByText('Product Deal Preview')).toBeTruthy();
    expect(view.getByText('Discount Strategy')).toBeTruthy();
  });

  it('renders deal limits and gifting rules', async () => {
    const view = await render(
      <CreateDealStep2LimitsGiftingRulesScreen onBack={onBack} />,
    );
    expect(view.getByText('Voucher Scarcity & Allocation')).toBeTruthy();
    expect(view.getByText('Gifting & Social Sharing')).toBeTruthy();
  });

  it('renders deal schedule and terms', async () => {
    const view = await render(
      <CreateDealStep3ParticipatingBranchesScheduleScreen onBack={onBack} />,
    );
    expect(view.getByText('How to Claim Steps')).toBeTruthy();
    expect(view.getByText('Terms & Conditions Rules')).toBeTruthy();
  });

  it('renders and copies the business QR link', async () => {
    const view = await render(<YourVemtapBusinessQrIsReadyScreen onBack={onBack} />);
    expect(view.getByText('Your VEMTAP Business QR is ready')).toBeTruthy();
    expect(view.getByText('VEMTAP PASS')).toBeTruthy();

    await act(async () => {
      fireEvent.press(view.getByLabelText('Copy business QR link'));
    });
    expect(view.getByText('Link copied to clipboard!')).toBeTruthy();
  });
});

import React from 'react';
import { useCatalogueDraftStore } from '@store/catalogueDraftStore';
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
import { strings } from '@constants/strings';
import { YourVemtapBusinessQrIsReadyScreen } from '@features/business/screens/YourVemtapBusinessQrIsReadyScreen';
import { toQrReadyView } from '@features/business/utils/qrMappers';
import { qrSummaryFixture } from '../../../../../__tests__/helpers/qrFixtures';

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
    useCatalogueDraftStore.getState().resetProduct();
    const view = await render(
      <ReviewProductSummaryScreen
        onBack={onBack}
        draft={{ ...useCatalogueDraftStore.getState().product, name: 'Aurora Ribeye' }}
      />,
    );
    expect(view.getByText('Review Product Summary')).toBeTruthy();
    expect(view.getByText('Aurora Ribeye')).toBeTruthy();
    expect(view.queryByText(/Woodfire|Urban Grill|UG-RB/)).toBeNull();
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
        product={{
          name: 'Aurora Ribeye',
          priceMin: 12000,
          priceMax: 12000,
          stock: null,
          branchNames: ['Aurora Wuse'],
          inStock: true,
        }}
      />,
    );

    expect(view.getByText('Make this product a VEMTAP Deal?')).toBeTruthy();

    await act(async () => {
      fireEvent.press(view.getByText('Convert to Deal Offer (Auto-Imported)'));
    });

    expect(view.getByText('Quick Setup: Aurora Ribeye')).toBeTruthy();
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
    const onCopyLink = jest.fn();
    const view = await render(
      <YourVemtapBusinessQrIsReadyScreen
        onBack={onBack}
        view={toQrReadyView(qrSummaryFixture)}
        onCopyLink={onCopyLink}
      />,
    );
    expect(view.getByText('Your VEMTAP Business QR is ready')).toBeTruthy();
    expect(view.getByText('VEMTAP PASS')).toBeTruthy();
    expect(view.getAllByText('Urban Grill').length).toBeGreaterThan(0);
    expect(view.getByText('vemtap.com/b/BIZ8820')).toBeTruthy();

    await act(async () => {
      fireEvent.press(view.getByLabelText('Copy business QR link'));
    });
    expect(onCopyLink).toHaveBeenCalledWith('https://vemtap.com/b/BIZ8820');
  });

  it('waits for the QR, then offers a retry when it cannot load', async () => {
    const onRetry = jest.fn();
    const view = await render(
      <YourVemtapBusinessQrIsReadyScreen onBack={onBack} isError onRetry={onRetry} />,
    );
    expect(view.getByText(strings.businessQrReady.error)).toBeTruthy();
    await act(async () => {
      fireEvent.press(view.getByText(strings.businessQrReady.retry));
    });
    expect(onRetry).toHaveBeenCalled();
  });

  it('renders the setup badge and the referral perk from the revised design', async () => {
    const onOpenReferrals = jest.fn();
    const view = await render(
      <YourVemtapBusinessQrIsReadyScreen
        onBack={onBack}
        onOpenReferrals={onOpenReferrals}
      />,
    );

    expect(view.getByText(strings.businessQrReady.setupBadge)).toBeTruthy();
    expect(view.getByText(strings.businessQrReady.referralBadge)).toBeTruthy();
    expect(view.getByText(strings.businessQrReady.referralTitle)).toBeTruthy();
    expect(view.getByText(strings.businessQrReady.referralBody)).toBeTruthy();

    await act(async () => {
      fireEvent.press(view.getByLabelText(strings.businessQrReady.referralCta));
    });
    expect(onOpenReferrals).toHaveBeenCalledTimes(1);
  });
});

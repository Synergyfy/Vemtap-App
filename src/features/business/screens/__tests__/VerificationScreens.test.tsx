import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import { VerifyYourBusinessScreen } from '@features/business/screens/VerifyYourBusinessScreen';
import { VerifyYourIdentityScreen } from '@features/business/screens/VerifyYourIdentityScreen';
import { IdVerificationScreen } from '@features/business/screens/IdVerificationScreen';
import { IdVerificationNeedsReviewScreen } from '@features/business/screens/IdVerificationNeedsReviewScreen';
import { IdVerificationSuccessScreen } from '@features/business/screens/IdVerificationSuccessScreen';
import { BusinessRegistrationScreen } from '@features/business/screens/BusinessRegistrationScreen';
import { CacVerificationScreen } from '@features/business/screens/CacVerificationScreen';
import { CacVerificationSuccessScreen } from '@features/business/screens/CacVerificationSuccessScreen';
import { YouReVerifiedScreen } from '@features/business/screens/YouReVerifiedScreen';
import { VerificationInProgressScreen } from '@features/business/screens/VerificationInProgressScreen';
import { BusinessVerificationStatusCenterScreen } from '@features/business/screens/BusinessVerificationStatusCenterScreen';
import { UnregisteredBusinessScreen } from '@features/business/screens/UnregisteredBusinessScreen';
import { VemtapAddOnsScreen } from '@features/business/screens/VemtapAddOnsScreen';
import { BusinessPlanTrialOverviewScreen } from '@features/business/screens/BusinessPlanTrialOverviewScreen';
import { FreeTrialConfirmationScreen } from '@features/business/screens/FreeTrialConfirmationScreen';
import { TrialActiveStatusScreen } from '@features/business/screens/TrialActiveStatusScreen';
import { TrialEndingRenewGrowthScreen } from '@features/business/screens/TrialEndingRenewGrowthScreen';
import { TrialExpiredReactivateScreen } from '@features/business/screens/TrialExpiredReactivateScreen';
import { SubscribeNowPaymentScreen } from '@features/business/screens/SubscribeNowPaymentScreen';
import { PaymentSuccessVemtapGrowthScreen } from '@features/business/screens/PaymentSuccessVemtapGrowthScreen';
import {
  businessRegistrationCopy as registrationCopy,
  cacVerificationCopy as cacCopy,
  idVerificationCopy as idCopy,
  idVerificationSuccessCopy as idSuccessCopy,
  cacVerificationSuccessCopy as cacSuccessCopy,
  paymentSuccessCopy as successCopy,
  planTrialOverviewCopy as planCopy,
  verificationStatusCenterCopy as statusCopy,
  verifyBusinessCopy as verifyCopy,
  youReVerifiedCopy,
  verifyIdentityCopy as identityCopy,
} from '@features/business/verificationCopy';

describe('business verification entry and identity screens', () => {
  it('renders the verification entry screen and starts the flow', async () => {
    const onStart = jest.fn();
    const view = await render(<VerifyYourBusinessScreen onStart={onStart} />);

    expect(view.getByText(verifyCopy.title)).toBeTruthy();
    expect(view.getByText(verifyCopy.whyTitle)).toBeTruthy();
    expect(view.getByText(verifyCopy.valueUnlockTitle)).toBeTruthy();

    await act(async () => {
      fireEvent.press(view.getByText(verifyCopy.start));
    });
    expect(onStart).toHaveBeenCalledTimes(1);
  });

  it('selects a government ID and continues', async () => {
    const onContinue = jest.fn();
    const view = await render(<VerifyYourIdentityScreen onContinue={onContinue} />);

    expect(view.getByText(identityCopy.nin)).toBeTruthy();
    expect(view.getByText(identityCopy.passport)).toBeTruthy();

    await act(async () => {
      fireEvent.press(view.getByText(identityCopy.passport));
    });
    await act(async () => {
      fireEvent.press(view.getByText(identityCopy.continue));
    });
    expect(onContinue).toHaveBeenCalledWith('passport');
  });

  it('captures and removes the optional NIN slip', async () => {
    const onSubmit = jest.fn();
    const view = await render(<IdVerificationScreen onSubmit={onSubmit} />);

    expect(view.getByText(idCopy.title)).toBeTruthy();
    expect(view.getByText(idCopy.ninCounter)).toBeTruthy();

    await act(async () => {
      fireEvent.press(view.getByText(idCopy.uploadAction));
    });
    expect(view.getByText(idCopy.uploadFileName)).toBeTruthy();

    await act(async () => {
      fireEvent.press(view.getByText(idCopy.submit));
    });
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ slipFile: idCopy.uploadFileName }),
    );

    await act(async () => {
      fireEvent.press(view.getByLabelText(idCopy.removeFileLabel));
    });
    expect(view.queryByText(idCopy.uploadFileName)).toBeNull();
  });

  it('renders the needs-review reasons and recovery actions', async () => {
    const onTryAgain = jest.fn();
    const onManualReview = jest.fn();
    const view = await render(
      <IdVerificationNeedsReviewScreen
        onTryAgain={onTryAgain}
        onRequestManualReview={onManualReview}
      />,
    );

    expect(
      view.getByText('Official verification network is temporarily slow or unavailable'),
    ).toBeTruthy();

    await act(async () => {
      fireEvent.press(view.getByLabelText(/Request Manual Review/));
    });
    expect(onManualReview).toHaveBeenCalledTimes(1);

    await act(async () => {
      fireEvent.press(view.getByLabelText(/Try Again/));
    });
    expect(onTryAgain).toHaveBeenCalledTimes(1);
  });

  it('renders the verified identity record', async () => {
    const view = await render(<IdVerificationSuccessScreen />);
    expect(view.getByText(idSuccessCopy.personValue)).toBeTruthy();
    expect(view.getByText(idSuccessCopy.referenceValue)).toBeTruthy();
  });
});

describe('business registration and CAC screens', () => {
  it('switches the CAC registration answer', async () => {
    const onContinue = jest.fn();
    const view = await render(<BusinessRegistrationScreen onContinue={onContinue} />);

    expect(view.getByText(registrationCopy.registeredTitle)).toBeTruthy();
    expect(view.getByText(registrationCopy.unregisteredTitle)).toBeTruthy();

    await act(async () => {
      fireEvent.press(view.getByLabelText(registrationCopy.unregisteredTitle));
    });
    await act(async () => {
      fireEvent.press(view.getByText(registrationCopy.continue));
    });
    expect(onContinue).toHaveBeenCalledWith('unregistered');
  });

  it('picks a CAC entity type and attaches a certificate', async () => {
    const onSubmit = jest.fn();
    const view = await render(<CacVerificationScreen onSubmit={onSubmit} />);

    expect(view.getByText(cacCopy.registryTitle)).toBeTruthy();
    expect(view.getByText(cacCopy.numberValid)).toBeTruthy();

    await act(async () => {
      fireEvent.press(view.getByLabelText(cacCopy.entities[1].title));
    });
    await act(async () => {
      fireEvent.press(view.getByLabelText(cacCopy.uploadAction));
    });
    await act(async () => {
      fireEvent.press(view.getByLabelText(cacCopy.submit));
    });
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        entityType: cacCopy.entities[1].id,
        certificateFile: cacCopy.uploadFileName,
      }),
    );
  });

  it('renders the CAC success record and trust badge', async () => {
    const view = await render(<CacVerificationSuccessScreen />);
    expect(view.getByText(cacSuccessCopy.nameValue)).toBeTruthy();
    expect(view.getByText(cacSuccessCopy.operatorValue)).toBeTruthy();
  });
});

describe('verification status surfaces', () => {
  it('renders the completed verification breakdown', async () => {
    const view = await render(<YouReVerifiedScreen />);
    expect(view.getAllByText(youReVerifiedCopy.businessName).length).toBeGreaterThan(0);
    expect(view.getByText('Business Location')).toBeTruthy();
    expect(view.getByText(youReVerifiedCopy.confirmed)).toBeTruthy();
  });

  it('renders the in-progress review checklist', async () => {
    const view = await render(<VerificationInProgressScreen />);
    expect(
      view.getByText('Registry cross-reference under review by compliance team'),
    ).toBeTruthy();
    expect(view.getByText('Step 3 of 4')).toBeTruthy();
  });

  it('keeps the audit letter request disabled on the status center', async () => {
    const onUpdateVerification = jest.fn();
    const view = await render(
      <BusinessVerificationStatusCenterScreen
        onUpdateVerification={onUpdateVerification}
      />,
    );

    const auditLetter = view.getByLabelText(statusCopy.auditLetterDisabledLabel);
    expect(auditLetter.props.accessibilityState).toMatchObject({ disabled: true });

    await act(async () => {
      fireEvent.press(view.getByLabelText(statusCopy.updateAction));
    });
    expect(onUpdateVerification).toHaveBeenCalledTimes(1);
  });

  it('exits the verification flow to the business dashboard', async () => {
    const onOpenDashboard = jest.fn();
    const view = await render(
      <BusinessVerificationStatusCenterScreen onOpenDashboard={onOpenDashboard} />,
    );

    expect(view.getByText(statusCopy.dashboardAction)).toBeTruthy();
    expect(view.getByText(statusCopy.dashboardHint)).toBeTruthy();

    await act(async () => {
      fireEvent.press(view.getByLabelText(statusCopy.dashboardAction));
    });
    expect(onOpenDashboard).toHaveBeenCalledTimes(1);
  });

  it('opens the certificate bottom sheet from a credential', async () => {
    const view = await render(<BusinessVerificationStatusCenterScreen />);

    await act(async () => {
      fireEvent.press(view.getByLabelText(statusCopy.credentials[1].action ?? ''));
    });
    expect(view.getByText(statusCopy.sheetRegistrationValue)).toBeTruthy();
  });

  it('renders the unregistered business path', async () => {
    const onContinue = jest.fn();
    const view = await render(<UnregisteredBusinessScreen onContinue={onContinue} />);

    expect(view.getByText('Informal / Sole Trader')).toBeTruthy();
    expect(view.getByText('Set up your storefront & share instant QR code')).toBeTruthy();

    await act(async () => {
      fireEvent.press(view.getByLabelText('Continue'));
    });
    expect(onContinue).toHaveBeenCalledTimes(1);
  });
});

describe('trial and payment screens', () => {
  it('expands the full plan breakdown', async () => {
    const view = await render(<BusinessPlanTrialOverviewScreen />);

    expect(view.getByText(planCopy.breakdownToggle)).toBeTruthy();
    expect(view.queryByText(planCopy.breakdown[0].title)).toBeNull();

    await act(async () => {
      fireEvent.press(view.getByText(planCopy.breakdownToggle));
    });
    expect(view.getByText(planCopy.breakdown[0].title)).toBeTruthy();
  });

  it('renders the trial timeline and included features', async () => {
    const view = await render(<FreeTrialConfirmationScreen />);
    expect(view.getByText('Next 30 Days')).toBeTruthy();
    expect(view.getByText('Customer loyalty & rewards')).toBeTruthy();
  });

  it('renders the countdown tile on the active trial screen', async () => {
    const view = await render(<TrialActiveStatusScreen />);
    expect(view.getByText('23')).toBeTruthy();
    expect(view.getByText('Day 7 of 30 used')).toBeTruthy();
  });

  it('renders the trial ending notice and benefits', async () => {
    const view = await render(<TrialEndingRenewGrowthScreen />);
    expect(view.getByText('3 Days Left')).toBeTruthy();
    expect(view.getByText('Keep your deals visible to local shoppers')).toBeTruthy();
  });

  it('renders the expired trial reactivation assets', async () => {
    const view = await render(<TrialExpiredReactivateScreen />);
    expect(view.getByText('14 Items')).toBeTruthy();
    expect(view.getByText('2 Outlets')).toBeTruthy();
    expect(view.getByText('4.9 (128)')).toBeTruthy();
  });

  it('selects a payment method and pays', async () => {
    const onPay = jest.fn();
    const view = await render(<SubscribeNowPaymentScreen onPay={onPay} />);

    expect(view.getByText('Bank-grade Security')).toBeTruthy();

    await act(async () => {
      fireEvent.press(view.getByLabelText('Direct Bank Transfer'));
    });
    await act(async () => {
      fireEvent.press(view.getByLabelText('Pay ₦5,000 & Activate Growth'));
    });
    expect(onPay).toHaveBeenCalledWith('virtual_account');
  });

  it('renders the header-less payment success receipt', async () => {
    const view = await render(<PaymentSuccessVemtapGrowthScreen />);

    expect(view.getByText(successCopy.statusBadge)).toBeTruthy();
    expect(view.getByText(successCopy.transactionId)).toBeTruthy();
    expect(view.getByText(successCopy.nextBilling)).toBeTruthy();
  });

  it('lists every paid add-on with its price', async () => {
    const onSelectAddOn = jest.fn();
    const view = await render(<VemtapAddOnsScreen onSelectAddOn={onSelectAddOn} />);

    expect(view.getByText('Flexible Power-Ups')).toBeTruthy();
    expect(view.getByText('Boost a Deal')).toBeTruthy();
    expect(view.getByText('POS Terminal & Hardware')).toBeTruthy();
    expect(view.getByText('₦2,000')).toBeTruthy();
    expect(view.getByText('₦3,500')).toBeTruthy();
    expect(view.getByText('₦1,500')).toBeTruthy();
    expect(view.getByText('₦1,000')).toBeTruthy();

    await act(async () => {
      fireEvent.press(view.getByLabelText('Boost Deal'));
    });
    expect(onSelectAddOn).toHaveBeenCalledWith('Boost a Deal');
  });
});

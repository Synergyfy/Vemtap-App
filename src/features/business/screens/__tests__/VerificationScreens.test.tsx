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
  paymentSuccessCopy as successCopy,
  planTrialOverviewCopy as planCopy,
  verificationStatusCenterCopy as statusCopy,
  verifyBusinessCopy as verifyCopy,
  verifyIdentityCopy as identityCopy,
} from '@features/business/verificationCopy';
import type { VerificationCheck, VerificationStatus } from '@api/verificationApi';
import type { Plan, PricePreview } from '@api/subscriptionsApi';
import {
  classNameOf,
  press,
} from '../../../../../__tests__/helpers/CssInteropUpgradeSafety';

// The screens submit through the verification hooks; mocked so the tests assert
// each screen's contract (what it sends, what it reports back), not the network.
const mockStartLiveness = jest.fn();
const mockVerifyIdentity = jest.fn();
const mockVerifyBusiness = jest.fn();
jest.mock('@features/business/hooks/useVerification', () => ({
  useLivenessCheck: () => ({ mutateAsync: mockStartLiveness, isPending: false }),
  useVerifyIdentity: () => ({ mutateAsync: mockVerifyIdentity, isPending: false }),
  useVerifyBusiness: () => ({ mutateAsync: mockVerifyBusiness, isPending: false }),
}));
jest.mock('@features/business/utils/uploadBusinessMedia', () => ({
  uploadDocument: jest.fn(async () => 'https://res.cloudinary.com/vemtap/passport.jpg'),
}));

const identityCheck: VerificationCheck = {
  id: 'chk-identity',
  kind: 'identity',
  idType: 'nin',
  status: 'verified',
  maskedId: '•••••••8901',
  recordName: 'ADAEZE TEST OKAFOR',
  reasons: [],
  faceMatch: { status: 'matched', score: 95 },
  createdAt: '2026-10-14T10:45:00.000Z',
  reviewedAt: null,
  reviewNote: null,
};

const businessCheck: VerificationCheck = {
  ...identityCheck,
  id: 'chk-business',
  kind: 'business',
  idType: 'cac',
  maskedId: 'RC1234567',
  recordName: 'PATRICK VENTURES LIMITED',
  faceMatch: null,
};

const inProgress: VerificationStatus = {
  status: 'in_progress',
  isVerified: false,
  verifiedAt: null,
  nextStep: 'business',
  identity: identityCheck,
  business: null,
};

const verified: VerificationStatus = {
  ...inProgress,
  status: 'verified',
  isVerified: true,
  verifiedAt: '2026-10-14T11:00:00.000Z',
  nextStep: 'done',
  business: businessCheck,
};

const professional: Plan = {
  id: 'plan-pro',
  name: 'Professional',
  description: 'For growing businesses moving to the next level.',
  monthlyPrice: 15000,
  quarterlyPrice: 40500,
  yearlyPrice: 144000,
  currency: 'NGN',
  isFree: false,
  isActive: true,
  trialDurationDays: 30,
  permissionsConfiguredAt: '2026-10-01T00:00:00.000Z',
  isPopular: true,
  features: ['Unlimited Customers', '3 Branches'],
};

const ultimate: Plan = {
  ...professional,
  id: 'plan-ultimate',
  name: 'Ultimate',
  monthlyPrice: 45000,
  quarterlyPrice: 121500,
  yearlyPrice: 432000,
  isPopular: false,
  features: ['10 Branches'],
};

/** `fireEvent` is async in this RNTL version; unawaited it leaks into the next test. */
async function typeInto(
  view: ReturnType<typeof render> extends Promise<infer V> ? V : never,
  label: string,
  text: string,
) {
  await act(async () => {
    await fireEvent.changeText(view.getByLabelText(label), text);
  });
}

beforeEach(() => {
  mockStartLiveness.mockReset();
  mockVerifyIdentity.mockReset();
  mockVerifyBusiness.mockReset();
});

describe('business verification entry and identity screens', () => {
  it('renders the verification entry screen and starts the flow', async () => {
    const onStart = jest.fn();
    const view = await render(<VerifyYourBusinessScreen onStart={onStart} />);

    expect(view.getByText(verifyCopy.title)).toBeTruthy();
    expect(view.getByText(verifyCopy.whyTitle)).toBeTruthy();

    await act(async () => {
      fireEvent.press(view.getByText(verifyCopy.start));
    });
    expect(onStart).toHaveBeenCalledTimes(1);
  });

  it("offers every bytID document, including the voter's card", async () => {
    const onContinue = jest.fn();
    const view = await render(<VerifyYourIdentityScreen onContinue={onContinue} />);

    expect(view.getByText(identityCopy.nin)).toBeTruthy();
    expect(view.getByText(identityCopy.licence)).toBeTruthy();
    expect(view.getByText(identityCopy.passport)).toBeTruthy();

    await act(async () => {
      fireEvent.press(view.getByText(identityCopy.votersCard));
    });
    await act(async () => {
      fireEvent.press(view.getByText(identityCopy.continue));
    });
    expect(onContinue).toHaveBeenCalledWith('voters_card');
  });

  it('keeps every ID option className identical while the user picks one', async () => {
    const view = await render(<VerifyYourIdentityScreen onContinue={jest.fn()} />);

    const options = [
      identityCopy.nin,
      identityCopy.licence,
      identityCopy.votersCard,
      identityCopy.passport,
    ];

    // A className that changes while picking an option changes the css-interop
    // rule set, which remounts the card and (pre-patch) closed the app on
    // device. Tapping every option in turn is the exact reported action.
    const before = new Map(options.map(label => [label, classNameOf(view, label)]));

    // Tapping every option in turn is the exact reported action.
    for (const label of options) {
      // eslint-disable-next-line no-await-in-loop -- presses must run sequentially
      await press(view, label);
    }

    for (const label of options) {
      expect(classNameOf(view, label)).toBe(before.get(label));
    }

    // The taps really did select, so the stability above is not vacuous.
    const last = view.getByLabelText(identityCopy.passport);
    expect(last.props.accessibilityState.selected).toBe(true);
    expect(view.getByLabelText(identityCopy.nin).props.accessibilityState.selected).toBe(
      false,
    );
  });

  it('takes the selfie, then submits the NIN check and reports the result', async () => {
    mockStartLiveness.mockResolvedValue({ sessionId: 'liv_123', completed: true });
    mockVerifyIdentity.mockResolvedValue(identityCheck);
    const onResult = jest.fn();
    const view = await render(<IdVerificationScreen idType="nin" onResult={onResult} />);

    await typeInto(view, idCopy.numberLabels.nin, '12345678901');
    await typeInto(view, idCopy.firstNameLabel, 'Adaeze');
    await typeInto(view, idCopy.lastNameLabel, 'Okafor');

    await act(async () => {
      fireEvent.press(view.getByText(idCopy.selfieAction));
    });
    expect(view.getByText(idCopy.selfieDone)).toBeTruthy();

    await act(async () => {
      fireEvent.press(view.getByText(idCopy.submit));
    });
    expect(onResult).toHaveBeenCalledWith(identityCheck);
    expect(mockVerifyIdentity).toHaveBeenCalledWith({
      idType: 'nin',
      idNumber: '12345678901',
      firstName: 'Adaeze',
      lastName: 'Okafor',
      livenessSessionId: 'liv_123',
      documentUrl: undefined,
    });
  });

  it('does not submit before the selfie check', async () => {
    const onResult = jest.fn();
    const view = await render(<IdVerificationScreen idType="nin" onResult={onResult} />);

    await typeInto(view, idCopy.numberLabels.nin, '12345678901');
    await typeInto(view, idCopy.firstNameLabel, 'Adaeze');
    await typeInto(view, idCopy.lastNameLabel, 'Okafor');
    await act(async () => {
      fireEvent.press(view.getByText(idCopy.submit));
    });
    expect(mockVerifyIdentity).not.toHaveBeenCalled();
    expect(onResult).not.toHaveBeenCalled();
  });

  it('asks passports for the data page instead of a number', async () => {
    const view = await render(<IdVerificationScreen idType="passport" />);
    expect(view.queryByLabelText(idCopy.numberLabels.nin)).toBeNull();
    expect(view.getByText(idCopy.passportTitle)).toBeTruthy();
    expect(view.getByText(idCopy.pills.passport)).toBeTruthy();
  });

  it('shows the reasons from the check and requests a manual review', async () => {
    const onTryAgain = jest.fn();
    const onManualReview = jest.fn();
    const view = await render(
      <IdVerificationNeedsReviewScreen
        reasons={["Your selfie didn't match the photo on the ID."]}
        onTryAgain={onTryAgain}
        onRequestManualReview={onManualReview}
      />,
    );

    expect(view.getByText("Your selfie didn't match the photo on the ID.")).toBeTruthy();

    await act(async () => {
      fireEvent.press(view.getByLabelText(/Request Manual Review/));
    });
    expect(onManualReview).toHaveBeenCalledTimes(1);

    await act(async () => {
      fireEvent.press(view.getByLabelText(/Try Again/));
    });
    expect(onTryAgain).toHaveBeenCalledTimes(1);
  });

  it('hides the manual review action while the check is already in review', async () => {
    const view = await render(<IdVerificationNeedsReviewScreen inReview />);
    expect(view.queryByLabelText(/Request Manual Review/)).toBeNull();
  });

  it('renders the verified identity record', async () => {
    const view = await render(
      <IdVerificationSuccessScreen
        personName="Adaeze Test Okafor"
        documentType="National ID (NIN)"
        documentReference="•••••••8901"
        verifiedOn="Oct 14, 2026 at 10:45 AM"
      />,
    );
    expect(view.getByText('Adaeze Test Okafor')).toBeTruthy();
    expect(view.getByText('•••••••8901')).toBeTruthy();
  });
});

describe('business registration and CAC screens', () => {
  it('switches the CAC registration answer', async () => {
    const onContinue = jest.fn();
    const view = await render(<BusinessRegistrationScreen onContinue={onContinue} />);

    await act(async () => {
      fireEvent.press(view.getByLabelText(registrationCopy.unregisteredTitle));
    });
    await act(async () => {
      fireEvent.press(view.getByText(registrationCopy.continue));
    });
    expect(onContinue).toHaveBeenCalledWith('unregistered');
  });

  it('submits the entity prefix with the registration digits', async () => {
    mockVerifyBusiness.mockResolvedValue(businessCheck);
    const onResult = jest.fn();
    const view = await render(
      <CacVerificationScreen businessName="Patrick Ventures" onResult={onResult} />,
    );

    expect(view.getByText('Patrick Ventures')).toBeTruthy();
    expect(view.queryByText(cacCopy.numberValid)).toBeNull();

    await act(async () => {
      fireEvent.press(view.getByLabelText(cacCopy.entities[1].title));
    });
    await typeInto(view, cacCopy.numberLabel, 'RC-1234567');
    expect(view.getByText(cacCopy.numberValid)).toBeTruthy();

    await act(async () => {
      fireEvent.press(view.getByLabelText(cacCopy.submit));
    });
    expect(mockVerifyBusiness).toHaveBeenCalledWith('RC1234567');
    expect(onResult).toHaveBeenCalledWith(businessCheck);
  });

  it('renders the CAC success record', async () => {
    const view = await render(
      <CacVerificationSuccessScreen
        businessName="Patrick Ventures"
        recordName="Patrick Ventures Limited"
        registrationNumber="RC1234567"
        operatorName="Adaeze Test Okafor"
      />,
    );
    expect(view.getByText('Patrick Ventures Limited')).toBeTruthy();
    expect(view.getByText('Identity Verified (Adaeze Test Okafor)')).toBeTruthy();
  });
});

describe('verification status surfaces', () => {
  it('renders the verification breakdown it is given', async () => {
    const view = await render(
      <YouReVerifiedScreen
        businessName="Patrick Ventures"
        pillars={[
          {
            icon: 'badge',
            title: 'Identity',
            tag: 'Verified',
            body: 'Operator',
            done: true,
          },
          {
            icon: 'storefront',
            title: 'Business Location',
            tag: 'Added',
            body: '',
            done: false,
          },
        ]}
      />,
    );
    expect(view.getAllByText('Patrick Ventures').length).toBeGreaterThan(0);
    expect(view.getByText('Business Location')).toBeTruthy();
    expect(view.getByText('1 / 2 Confirmed')).toBeTruthy();
  });

  it('builds the review checklist from the status', async () => {
    const view = await render(<VerificationInProgressScreen status={inProgress} />);
    expect(view.getByText('Identity submitted')).toBeTruthy();
    expect(view.getByText('Business details not submitted yet')).toBeTruthy();
    expect(view.getByText('Step 2 of 4')).toBeTruthy();
  });

  it('keeps the audit letter request disabled on the status center', async () => {
    const onUpdateVerification = jest.fn();
    const view = await render(
      <BusinessVerificationStatusCenterScreen
        status={inProgress}
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

  it('offers to start verification when nothing was submitted', async () => {
    const view = await render(<BusinessVerificationStatusCenterScreen status={null} />);
    expect(view.getByLabelText(statusCopy.startAction)).toBeTruthy();
    expect(view.getByText(statusCopy.statusTitles.unverified)).toBeTruthy();
  });

  it('exits the verification flow to the business dashboard', async () => {
    const onOpenDashboard = jest.fn();
    const view = await render(
      <BusinessVerificationStatusCenterScreen onOpenDashboard={onOpenDashboard} />,
    );

    await act(async () => {
      fireEvent.press(view.getByLabelText(statusCopy.dashboardAction));
    });
    expect(onOpenDashboard).toHaveBeenCalledTimes(1);
  });

  it('opens the details sheet for a verified check', async () => {
    const view = await render(
      <BusinessVerificationStatusCenterScreen status={verified} businessName="Patrick" />,
    );
    expect(view.getAllByText(statusCopy.statusTitles.verified).length).toBeGreaterThan(0);

    await act(async () => {
      fireEvent.press(view.getAllByLabelText(statusCopy.viewDetails)[1]);
    });
    expect(view.getAllByText('RC1234567').length).toBeGreaterThan(0);
    expect(view.getAllByText('Patrick Ventures Limited').length).toBeGreaterThan(0);
  });

  it('renders the unregistered business path', async () => {
    const onContinue = jest.fn();
    const view = await render(
      <UnregisteredBusinessScreen
        identityName="Adaeze Test Okafor"
        identityStatus="verified"
        onContinue={onContinue}
      />,
    );

    expect(view.getByText('Adaeze Test Okafor')).toBeTruthy();
    expect(view.getByText('Informal / Sole Trader')).toBeTruthy();

    await act(async () => {
      fireEvent.press(view.getByLabelText('Submit for Review'));
    });
    expect(onContinue).toHaveBeenCalledTimes(1);
  });
});

describe('trial and payment screens', () => {
  it('lists the real plans and starts the trial on the chosen one', async () => {
    const onStartTrial = jest.fn();
    const onSelectPlan = jest.fn();
    const view = await render(
      <BusinessPlanTrialOverviewScreen
        plans={[professional, ultimate]}
        selectedPlanId="plan-ultimate"
        trialEligible
        onSelectPlan={onSelectPlan}
        onStartTrial={onStartTrial}
      />,
    );

    expect(view.getAllByText('Ultimate').length).toBeGreaterThan(0);
    expect(view.getByText('10 Branches')).toBeTruthy();

    await act(async () => {
      fireEvent.press(view.getByText('Professional'));
    });
    expect(onSelectPlan).toHaveBeenCalledWith('plan-pro');

    await act(async () => {
      fireEvent.press(view.getByText('Start 30-Day Free Trial'));
    });
    expect(onStartTrial).toHaveBeenCalledWith(ultimate);
  });

  it('only offers subscribing once the trial is used', async () => {
    const view = await render(
      <BusinessPlanTrialOverviewScreen plans={[professional]} trialEligible={false} />,
    );
    expect(view.queryByText('Start 30-Day Free Trial')).toBeNull();
    expect(view.getByText(planCopy.trialUsedTitle)).toBeTruthy();
  });

  it('explains when no plan can be bought yet', async () => {
    const view = await render(<BusinessPlanTrialOverviewScreen plans={[]} />);
    expect(view.getByText(planCopy.emptyTitle)).toBeTruthy();
  });

  it('renders the trial timeline for the plan', async () => {
    const view = await render(
      <FreeTrialConfirmationScreen
        planName="Professional"
        monthlyPrice="₦15,000"
        trialDays={14}
      />,
    );
    expect(view.getByText('Your 14-day trial starts now')).toBeTruthy();
    expect(view.getByText('Next 14 Days')).toBeTruthy();
  });

  it('renders the countdown from the trial progress', async () => {
    const view = await render(
      <TrialActiveStatusScreen
        planName="Professional"
        progress={{
          daysRemaining: 23,
          totalDays: 30,
          daysUsed: 7,
          percentElapsed: 23,
          startedOn: 'Oct 7, 2026',
          endsOn: 'Nov 6, 2026',
        }}
      />,
    );
    expect(view.getByText('23')).toBeTruthy();
    expect(view.getByText('Day 7 of 30 used')).toBeTruthy();
    expect(view.getByText('Professional Trial Active')).toBeTruthy();
  });

  it('renders the trial ending notice with the plan benefits', async () => {
    const view = await render(
      <TrialEndingRenewGrowthScreen
        planName="Professional"
        features={['3 Branches']}
        progress={{
          daysRemaining: 3,
          totalDays: 30,
          daysUsed: 27,
          percentElapsed: 90,
          startedOn: null,
          endsOn: 'Oct 17, 2026',
        }}
      />,
    );
    expect(view.getByText('3 days Left')).toBeTruthy();
    expect(view.getByText('3 Branches')).toBeTruthy();
  });

  it('renders the expired trial with saved business data', async () => {
    const view = await render(
      <TrialExpiredReactivateScreen planName="Professional" branchCount={2} />,
    );
    expect(view.getByText('2 Outlets')).toBeTruthy();
  });

  it('switches the billing period and pays the previewed total', async () => {
    const onPay = jest.fn();
    const onChangePeriod = jest.fn();
    const preview: PricePreview = {
      subtotal: 15000,
      taxAmount: 0,
      total: 15000,
      taxRule: { name: 'VAT', rate: 7.5, isEnabled: false },
    };
    const view = await render(
      <SubscribeNowPaymentScreen
        plan={professional}
        billingPeriod="monthly"
        preview={preview}
        onChangePeriod={onChangePeriod}
        onPay={onPay}
      />,
    );

    expect(view.getByText('Bank-grade Security')).toBeTruthy();

    await act(async () => {
      fireEvent.press(view.getByLabelText('Yearly'));
    });
    expect(onChangePeriod).toHaveBeenCalledWith('yearly');

    await act(async () => {
      fireEvent.press(view.getByLabelText('Pay ₦15,000 & Activate Professional'));
    });
    expect(onPay).toHaveBeenCalledTimes(1);
  });

  it('renders the payment receipt', async () => {
    const view = await render(
      <PaymentSuccessVemtapGrowthScreen
        planName="Professional"
        reference="SUB-123"
        nextBilling="Nov 14, 2026"
      />,
    );

    expect(view.getByText(successCopy.statusBadge)).toBeTruthy();
    expect(view.getByText('SUB-123')).toBeTruthy();
    expect(view.getByText('Nov 14, 2026')).toBeTruthy();
  });

  it('says the payment is still confirming when the webhook has not landed', async () => {
    const view = await render(<PaymentSuccessVemtapGrowthScreen pending />);
    expect(view.getByText(successCopy.pendingTitle)).toBeTruthy();
  });

  it('lists the paid add-ons catalogue and the plan add-ons', async () => {
    const onSelectAddOn = jest.fn();
    const view = await render(
      <VemtapAddOnsScreen
        currentPlanName="Professional"
        planAddOns={[
          {
            id: 'addon-1',
            name: 'Extra Branch',
            description: '',
            price: 5000,
            currency: 'NGN',
            durationDays: 30,
            isOneTime: false,
          },
        ]}
        onSelectAddOn={onSelectAddOn}
      />,
    );

    expect(view.getByText('Boost a Deal')).toBeTruthy();
    expect(view.getByText('Extra Branch')).toBeTruthy();
    expect(view.getByText('Professional')).toBeTruthy();

    await act(async () => {
      fireEvent.press(view.getByLabelText('Boost Deal'));
    });
    expect(onSelectAddOn).toHaveBeenCalledWith('Boost a Deal');
  });
});

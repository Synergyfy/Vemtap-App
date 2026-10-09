import React, { useCallback, useEffect, useRef } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  AddBranchLocationScreen,
  AddProductBasicsCategoryScreen,
  AddProductBranchAvailabilityScreen,
  AddProductLocationPricingScreen,
  AddProductPricingVariantsScreen,
  AddProductsOrServicesScreen,
  AddServiceAvailabilityRulesScreen,
  AddServiceBasicsMediaScreen,
  AddServiceDurationPricingScreen,
  BusinessAccountCredentialsScreen,
  BusinessAccountOtpScreen,
  BusinessIntroductionScreen,
  BusinessLocationsMultiBranchScreen,
  BusinessPlanTrialOverviewScreen,
  BusinessProfileBasicInfoScreen,
  BusinessProfileBrandingScreen,
  BusinessProfileContactChannelsScreen,
  BusinessRegistrationScreen,
  BusinessVerificationStatusCenterScreen,
  CacVerificationScreen,
  CacVerificationSuccessScreen,
  CreateDealOfferAutoImportedScreen,
  CreateDealStep1DiscountStrategyScreen,
  CreateDealStep2LimitsGiftingRulesScreen,
  CreateDealStep3ParticipatingBranchesScheduleScreen,
  CreateDealStep4ReviewLaunchScreen,
  FreeTrialConfirmationScreen,
  IdVerificationNeedsReviewScreen,
  IdVerificationScreen,
  IdVerificationSuccessScreen,
  PaymentSuccessVemtapGrowthScreen,
  ProductPublishedMakeItADealScreen,
  ProductPublishedOrSavedAsDraftScreen,
  ReviewProductSummaryScreen,
  ReviewServiceSummaryScreen,
  ServicePublishedStatusScreen,
  SubscribeNowPaymentScreen,
  TrialActiveStatusScreen,
  TrialEndingRenewGrowthScreen,
  TrialExpiredReactivateScreen,
  UnregisteredBusinessScreen,
  VemtapAddOnsScreen,
  VerificationInProgressScreen,
  VerifyYourBusinessScreen,
  VerifyYourIdentityScreen,
  WhereIsYourBusinessLocatedScreen,
  YouReVerifiedScreen,
  YourVemtapBusinessQrIsReadyScreen,
} from '@features/business';
import { useSubmitOwnerRegistration } from '@features/business/hooks/useSubmitOwnerRegistration';
import { useUpgradeOwnerRegistration } from '@features/business/hooks/useUpgradeOwnerRegistration';
import { ForgotPinScreen } from '@features/auth/screens/ForgotPinScreen';
import { TypeDensityProvider } from '@theme/TypeDensityProvider';
import { useBusinessOnboardingStore } from '@store/businessOnboardingStore';
import { useAuthStore, selectIsAuthenticated } from '@store/authStore';
import { businessDashboardApi } from '@api/businessDashboardApi';
import { mapLocationDraft } from '@features/business/utils/locationDraftMapper';
import { businessProfileCopy } from '@features/business/businessCopy';
import { logger } from '@utils/logger';
import type { BusinessSetupStackParamList, RootStackParamList } from '@navigation/types';

const Stack = createNativeStackNavigator<BusinessSetupStackParamList>();
type FlowNavigation = NativeStackNavigationProp<BusinessSetupStackParamList>;

function useFlowNavigation() {
  return useNavigation<FlowNavigation>();
}

/**
 * Entry into the business app shell.
 *
 * `BusinessSetup` and `BusinessTabs` are root-level siblings, so this hook can
 * navigate straight to the business shell. Do not route the exit through
 * `AppStack`: the onboarding flow is reachable while signed out (Sign In /
 * Register \u2192 "Set up your business"), and the root only registers `AppStack`
 * for authenticated sessions \u2014 navigating there throws "Do you have a screen
 * named 'AppStack'?".
 */
/** Nested params for the root `BusinessTabs` route: land on the Overview tab. */
export const businessDashboardEntry = {
  screen: 'BusinessOverview',
} as const;

/** The Business Network surfaces live in the business shell, not in setup. */
export const businessNetworkEntry = {
  screen: 'BusinessMore',
  params: { screen: 'BusinessNetworkIntroHub' },
} as const;

function useRootNavigation() {
  return useNavigation<NativeStackNavigationProp<RootStackParamList>>();
}

export function useBusinessDashboardEntry() {
  const navigation = useRootNavigation();
  return () => navigation.navigate('BusinessTabs', businessDashboardEntry);
}

/** Referral growth hand-off: drops the owner into the Business Network hub. */
export function useBusinessNetworkEntry() {
  const navigation = useRootNavigation();
  return () => navigation.navigate('BusinessTabs', businessNetworkEntry);
}

function BusinessIntroductionRoute() {
  const navigation = useFlowNavigation();
  return (
    <BusinessIntroductionScreen
      onBack={navigation.goBack}
      onSetUpBusiness={() => navigation.navigate('BusinessProfileBasicInfo')}
      onLearnMore={() => undefined}
    />
  );
}

function BusinessProfileBasicInfoRoute() {
  const navigation = useFlowNavigation();
  const basic = useBusinessOnboardingStore(state => state.profile.basic);
  const setBasicInfo = useBusinessOnboardingStore(state => state.setBasicInfo);
  return (
    <BusinessProfileBasicInfoScreen
      onBack={navigation.goBack}
      // Persist before navigating: the wizard's next push unmounts this screen,
      // so an unwritten value would be lost.
      onContinue={value => {
        setBasicInfo(value);
        navigation.navigate('BusinessProfileBranding');
      }}
      onSaveDraft={setBasicInfo}
      initialValue={basic}
    />
  );
}

function BusinessProfileBrandingRoute() {
  const navigation = useFlowNavigation();
  const basic = useBusinessOnboardingStore(state => state.profile.basic);
  const branding = useBusinessOnboardingStore(state => state.profile.branding);
  const setBranding = useBusinessOnboardingStore(state => state.setBranding);
  return (
    <BusinessProfileBrandingScreen
      onBack={navigation.goBack}
      // The live preview mirrors the draft: name/category from Basic Info and
      // any media already picked when the step is revisited.
      businessName={basic.name}
      categoryName={basic.category}
      specialties={basic.specialties}
      initialValue={branding}
      onContinue={value => {
        setBranding(value);
        navigation.navigate('BusinessProfileContactChannels');
      }}
      onSaveDraft={setBranding}
    />
  );
}

function BusinessProfileContactChannelsRoute() {
  const navigation = useFlowNavigation();
  const contact = useBusinessOnboardingStore(state => state.profile.contact);
  const setContactChannels = useBusinessOnboardingStore(
    state => state.setContactChannels,
  );
  return (
    <BusinessProfileContactChannelsScreen
      onBack={navigation.goBack}
      onComplete={value => {
        setContactChannels(value);
        navigation.navigate('BusinessAccountCredentials');
      }}
      onSaveDraft={setContactChannels}
      initialValue={contact}
    />
  );
}

/**
 * Persists the profile screens' draft for an owner who has no business yet.
 * `PATCH /businesses/my-business` auto-creates the business server-side, so
 * without this the Basic Info / Branding / Contact fields collected in this
 * wizard would be silently dropped when the account step is skipped.
 */
function syncOwnerDraftToBusiness(draft: {
  basic: {
    name: string;
    categoryId?: string;
    subcategoryId?: string;
    otherSubcategoryName?: string;
    description: string;
  };
  branding: { logoUrl?: string };
  contact: { email: string; website: string; whatsappNumber?: string; phone: string };
}): void {
  const updates: Record<string, unknown> = {};
  const { basic, branding, contact } = draft;

  if (basic.name?.trim()) updates.name = basic.name.trim();
  if (basic.categoryId) updates.categoryId = basic.categoryId;
  if (basic.subcategoryId) updates.subcategoryId = basic.subcategoryId;
  if (basic.otherSubcategoryName?.trim()) {
    updates.otherSubcategoryName = basic.otherSubcategoryName.trim();
  }
  if (basic.description?.trim()) updates.about = basic.description.trim();
  if (branding.logoUrl) updates.logoUrl = branding.logoUrl;

  if (contact.email?.trim()) updates.officialEmail = contact.email.trim();

  const whatsapp = (contact.whatsappNumber ?? contact.phone ?? '').replace(/\D/g, '');
  if (whatsapp) updates.whatsappNumber = whatsapp;

  const website = contact.website?.trim();
  if (website) {
    updates.website = /^https?:\/\//i.test(website) ? website : `https://${website}`;
  }

  if (Object.keys(updates).length === 0) return;

  businessDashboardApi.updateMyBusiness(updates).catch(error =>
    logger.warn('business', 'Failed to sync owner draft before location', {
      message: error instanceof Error ? error.message : String(error),
    }),
  );
}

/**
 * Credentials step. A signed-out user creates an account here (email +
 * password, then OTP). An authenticated customer confirms their password and
 * the same account gains an owner side, keeping the customer profile intact.
 */
function BusinessAccountCredentialsRoute() {
  const navigation = useFlowNavigation();
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const user = useAuthStore(state => state.user);
  const contact = useBusinessOnboardingStore(state => state.profile.contact);
  const setCredentials = useBusinessOnboardingStore(state => state.setCredentials);
  const upgrade = useUpgradeOwnerRegistration();
  const syncedOwnerDraft = useRef(false);

  const role = user?.role?.toLowerCase();
  const ownerRegistered = role === 'owner' && Boolean(user?.businessId);
  // An owner without a business (e.g. registered elsewhere) already has the
  // credentials this step would collect; sync the draft and continue.
  const ownerWithoutBusiness = isAuthenticated && role === 'owner' && !user?.businessId;
  const skipCredentials = ownerRegistered || ownerWithoutBusiness;

  const isGoogleAccount =
    String(user?.authProvider ?? '').toUpperCase() === 'GOOGLE' ||
    Boolean(user?.googleId);

  // Re-entering after registering (e.g. back from Location) — nothing to
  // collect, so skip straight back to where the wizard continues.
  useEffect(() => {
    if (!skipCredentials) return;

    if (ownerWithoutBusiness && !syncedOwnerDraft.current) {
      syncedOwnerDraft.current = true;
      const store = useBusinessOnboardingStore.getState();
      syncOwnerDraftToBusiness({
        basic: store.profile.basic,
        branding: store.profile.branding,
        contact: store.profile.contact,
      });
    }

    navigation.navigate('BusinessLocation');
  }, [ownerWithoutBusiness, skipCredentials, navigation]);

  if (skipCredentials) {
    return null;
  }

  if (isAuthenticated && role === 'customer') {
    return (
      <BusinessAccountCredentialsScreen
        mode="confirm"
        initialEmail={user?.email ?? ''}
        passwordlessAccount={isGoogleAccount}
        onBack={navigation.goBack}
        loading={upgrade.isPending}
        error={upgrade.error?.message ?? null}
        onForgotPassword={() => navigation.navigate('BusinessAccountResetPin')}
        onContinue={({ password }) =>
          upgrade.mutate(
            { password },
            { onSuccess: () => navigation.navigate('BusinessLocation') },
          )
        }
      />
    );
  }

  return (
    <BusinessAccountCredentialsScreen
      mode="create"
      initialEmail={contact.email}
      onBack={navigation.goBack}
      onContinue={({ email, password }) => {
        setCredentials({ email, password });
        navigation.navigate('BusinessAccountOtp');
      }}
    />
  );
}

/** Signed-in PIN/password reset, reached from the confirm step's forgot link. */
function BusinessAccountResetPinRoute() {
  const navigation = useFlowNavigation();
  const user = useAuthStore(state => state.user);
  return (
    <ForgotPinScreen
      initialEmail={user?.email}
      doneLabel={businessProfileCopy.accountSetup.confirm.resetDone}
      onDone={() => navigation.navigate('BusinessAccountCredentials')}
    />
  );
}

function BusinessAccountOtpRoute() {
  const navigation = useFlowNavigation();
  const credentials = useBusinessOnboardingStore(state => state.credentials);
  const submit = useSubmitOwnerRegistration();

  const handleVerified = useCallback(async () => {
    if (!credentials.email || !credentials.password) {
      throw new Error(
        'Your account details are missing. Go back and re-enter your email and password.',
      );
    }
    await submit.register({
      email: credentials.email,
      password: credentials.password,
    });
    navigation.navigate('BusinessLocation');
  }, [credentials.email, credentials.password, navigation, submit]);

  return (
    <BusinessAccountOtpScreen
      email={credentials.email ?? ''}
      onBack={navigation.goBack}
      onEditEmail={navigation.goBack}
      onVerified={handleVerified}
    />
  );
}

function BusinessLocationRoute() {
  const navigation = useFlowNavigation();
  const location = useBusinessOnboardingStore(state => state.profile.location);
  const setLocation = useBusinessOnboardingStore(state => state.setLocation);
  return (
    <WhereIsYourBusinessLocatedScreen
      onBack={navigation.goBack}
      onContinue={draft => {
        const mapped = mapLocationDraft(draft);
        setLocation(mapped);
        // Registration ran earlier in the wizard, so a session exists and the
        // address can finally be persisted (it is not part of the payload sent
        // to register/owner; the location screens come after). Best-effort: a
        // failed PATCH must not block the rest of setup.
        if (mapped.address) {
          businessDashboardApi
            .updateMyBusiness({ address: mapped.address })
            .catch(error =>
              logger.warn('business', 'Failed to save business address', {
                message: error instanceof Error ? error.message : String(error),
              }),
            );
        }
        navigation.navigate('BusinessLocations');
      }}
      onSaveDraft={draft => setLocation(mapLocationDraft(draft))}
      initialValue={{ search: location.address }}
    />
  );
}

function BusinessLocationsRoute() {
  const navigation = useFlowNavigation();
  const setBranches = useBusinessOnboardingStore(state => state.setBranches);
  return (
    <BusinessLocationsMultiBranchScreen
      onBack={navigation.goBack}
      onContinue={value => {
        setBranches(value);
        navigation.navigate('AddProductsOrServices');
      }}
      onAddBranch={() => navigation.navigate('AddBranchLocation')}
      onEditBranch={() => undefined}
      onManageHours={() => undefined}
      onContactConcierge={() => undefined}
    />
  );
}

function AddBranchLocationRoute() {
  const navigation = useFlowNavigation();
  return (
    <AddBranchLocationScreen
      onBack={navigation.goBack}
      onSave={() => navigation.goBack()}
    />
  );
}

function AddProductsOrServicesRoute() {
  const navigation = useFlowNavigation();
  return (
    <AddProductsOrServicesScreen
      onBack={navigation.goBack}
      onContinue={() => navigation.navigate('BusinessQrReady')}
      onSkip={() => navigation.navigate('BusinessQrReady')}
      onAddProduct={() => navigation.navigate('AddProductLocationPricing')}
      onAddService={() => navigation.navigate('AddServiceBasics')}
      onAddAnother={() => navigation.navigate('AddProductsOrServices')}
      onEditItem={() => undefined}
      onRemoveItem={() => undefined}
      onFilter={() => undefined}
    />
  );
}

function AddServiceBasicsRoute() {
  const navigation = useFlowNavigation();
  return (
    <AddServiceBasicsMediaScreen
      onBack={navigation.goBack}
      onNext={() => navigation.navigate('AddServiceDurationPricing')}
      onSaveDraft={() => undefined}
    />
  );
}

function AddServiceDurationPricingRoute() {
  const navigation = useFlowNavigation();
  return (
    <AddServiceDurationPricingScreen
      onBack={navigation.goBack}
      onNext={() => navigation.navigate('AddServiceAvailabilityRules')}
      onSaveDraft={() => undefined}
    />
  );
}

function AddServiceAvailabilityRulesRoute() {
  const navigation = useFlowNavigation();
  return (
    <AddServiceAvailabilityRulesScreen
      onBack={navigation.goBack}
      onNext={() => navigation.navigate('ReviewServiceSummary')}
      onSaveDraft={() => undefined}
    />
  );
}

function ReviewServiceSummaryRoute() {
  const navigation = useFlowNavigation();
  return (
    <ReviewServiceSummaryScreen
      onBack={navigation.goBack}
      onNext={() => navigation.navigate('ServicePublished')}
      onSaveDraft={() => undefined}
      onPreview={() => undefined}
    />
  );
}

function ServicePublishedRoute() {
  const navigation = useFlowNavigation();
  return (
    <ServicePublishedStatusScreen
      onBack={navigation.goBack}
      onNext={() => navigation.navigate('BusinessQrReady')}
      onSaveDraft={() => undefined}
      onAddAnother={() => navigation.navigate('AddServiceBasics')}
      onCreateDeal={() => navigation.navigate('CreateDealAutoImported')}
      onStatusChange={() => undefined}
    />
  );
}

function AddProductLocationPricingRoute() {
  const navigation = useFlowNavigation();
  return (
    <AddProductLocationPricingScreen
      onBack={navigation.goBack}
      onSave={() => navigation.navigate('AddProductBasics')}
      onDiscard={() => navigation.goBack()}
    />
  );
}

function AddProductBasicsRoute() {
  const navigation = useFlowNavigation();
  return (
    <AddProductBasicsCategoryScreen
      onBack={navigation.goBack}
      onContinue={() => navigation.navigate('AddProductPricingVariants')}
      onSaveDraft={() => undefined}
    />
  );
}

function AddProductPricingVariantsRoute() {
  const navigation = useFlowNavigation();
  return (
    <AddProductPricingVariantsScreen
      onBack={navigation.goBack}
      onContinue={() => navigation.navigate('AddProductBranchAvailability')}
      onSaveDraft={() => undefined}
    />
  );
}

function AddProductBranchAvailabilityRoute() {
  const navigation = useFlowNavigation();
  return (
    <AddProductBranchAvailabilityScreen
      onBack={navigation.goBack}
      onContinue={() => navigation.navigate('ReviewProductSummary')}
      onSaveDraft={() => undefined}
    />
  );
}

function ReviewProductSummaryRoute() {
  const navigation = useFlowNavigation();
  return (
    <ReviewProductSummaryScreen
      onBack={navigation.goBack}
      onPublish={() => navigation.navigate('ProductPublished')}
      onSaveDraft={() => undefined}
    />
  );
}

function ProductPublishedRoute() {
  const navigation = useFlowNavigation();
  return (
    <ProductPublishedOrSavedAsDraftScreen
      onBack={navigation.goBack}
      onMakeDeal={() => navigation.navigate('ProductMakeDeal')}
      onViewCatalog={() => navigation.navigate('BusinessQrReady')}
      onAddAnother={() => navigation.navigate('AddProductLocationPricing')}
      onStatusChange={() => undefined}
    />
  );
}

function ProductMakeDealRoute() {
  const navigation = useFlowNavigation();
  return (
    <ProductPublishedMakeItADealScreen
      onBack={navigation.goBack}
      onConvertToDeal={() => navigation.navigate('CreateDealAutoImported')}
      onQuickSetupOpen={() => undefined}
      onKeepRegularProduct={() => navigation.navigate('ProductPublished')}
    />
  );
}

function CreateDealAutoImportedRoute() {
  const navigation = useFlowNavigation();
  return (
    <CreateDealOfferAutoImportedScreen
      onBack={navigation.goBack}
      onPublish={() => navigation.navigate('CreateDealStep1')}
      onCancel={() => navigation.navigate('ProductPublished')}
      onSaveDraft={() => navigation.navigate('ProductPublished')}
    />
  );
}

function CreateDealStep1Route() {
  const navigation = useFlowNavigation();
  return (
    <CreateDealStep1DiscountStrategyScreen
      onBack={navigation.goBack}
      onChangeItem={() => navigation.navigate('ProductPublished')}
      onContinue={() => navigation.navigate('CreateDealStep2')}
      onSave={() => navigation.navigate('CreateDealStep2')}
    />
  );
}

function CreateDealStep2Route() {
  const navigation = useFlowNavigation();
  return (
    <CreateDealStep2LimitsGiftingRulesScreen
      onBack={navigation.goBack}
      onContinue={() => navigation.navigate('CreateDealStep3')}
      onSave={() => navigation.navigate('CreateDealStep3')}
    />
  );
}

function CreateDealStep3Route() {
  const navigation = useFlowNavigation();
  return (
    <CreateDealStep3ParticipatingBranchesScheduleScreen
      onBack={navigation.goBack}
      onSave={() => navigation.navigate('CreateDealStep4')}
    />
  );
}

function CreateDealStep4Route() {
  const navigation = useFlowNavigation();
  return (
    <CreateDealStep4ReviewLaunchScreen
      onBack={navigation.goBack}
      onEditOffer={() => navigation.navigate('CreateDealStep1')}
      onEditRules={() => navigation.navigate('CreateDealStep2')}
      onEditBranches={() => navigation.navigate('CreateDealStep3')}
      onLaunch={() => navigation.navigate('BusinessQrReady')}
      onSaveDraft={() => navigation.navigate('ProductPublished')}
      onSave={() => navigation.navigate('BusinessQrReady')}
    />
  );
}

function BusinessQrReadyRoute() {
  const navigation = useFlowNavigation();
  const openBusinessDashboard = useBusinessDashboardEntry();
  // The referral perk belongs to the business app, so it crosses to that shell
  // the same way the dashboard hand-off does.
  const openBusinessNetwork = useBusinessNetworkEntry();
  const handleContinue = useCallback(() => {
    // The setup wizard is done: promote the session out of `onboarding` and
    // make sure later launches restore the business side.
    useAuthStore.getState().setActiveMode('business');
    useAuthStore.getState().completeOnboarding();
    openBusinessDashboard();
  }, [openBusinessDashboard]);
  return (
    <YourVemtapBusinessQrIsReadyScreen
      onBack={navigation.goBack}
      onShare={() => undefined}
      onSupport={() => undefined}
      onOrderKits={() => undefined}
      onPresentFullscreen={() => undefined}
      onDownloadKit={() => undefined}
      onCopyLink={() => undefined}
      onOpenReferrals={openBusinessNetwork}
      onContinue={handleContinue}
    />
  );
}

function VerifyYourBusinessRoute() {
  const navigation = useFlowNavigation();
  const openBusinessDashboard = useBusinessDashboardEntry();
  return (
    <VerifyYourBusinessScreen
      onBack={navigation.goBack}
      onStart={() => navigation.navigate('VerifyYourIdentity')}
      // Skipping verification means "start operating": drop the user into the
      // business app instead of parking them on a status page.
      onLater={openBusinessDashboard}
    />
  );
}

function VerifyYourIdentityRoute() {
  const navigation = useFlowNavigation();
  return (
    <VerifyYourIdentityScreen
      onBack={navigation.goBack}
      onContinue={() => navigation.navigate('IdVerification')}
    />
  );
}

function IdVerificationRoute() {
  const navigation = useFlowNavigation();
  return (
    <IdVerificationScreen
      onBack={navigation.goBack}
      onSubmit={() => navigation.navigate('IdVerificationSuccess')}
      onCaptureSlip={() => undefined}
    />
  );
}

function IdVerificationSuccessRoute() {
  const navigation = useFlowNavigation();
  return (
    <IdVerificationSuccessScreen
      onBack={navigation.goBack}
      onContinue={() => navigation.navigate('BusinessRegistration')}
    />
  );
}

function IdVerificationNeedsReviewRoute() {
  const navigation = useFlowNavigation();
  return (
    <IdVerificationNeedsReviewScreen
      onBack={navigation.goBack}
      onTryAgain={() => navigation.navigate('IdVerification')}
      onUseAnotherId={() => navigation.navigate('VerifyYourIdentity')}
      onRequestManualReview={() => navigation.navigate('VerificationInProgress')}
    />
  );
}

function BusinessRegistrationRoute() {
  const navigation = useFlowNavigation();
  return (
    <BusinessRegistrationScreen
      onBack={navigation.goBack}
      onContinue={status =>
        status === 'registered'
          ? navigation.navigate('CacVerification')
          : navigation.navigate('UnregisteredBusiness')
      }
    />
  );
}

function CacVerificationRoute() {
  const navigation = useFlowNavigation();
  return (
    <CacVerificationScreen
      onBack={navigation.goBack}
      onSubmit={() => navigation.navigate('CacVerificationSuccess')}
      onAttachCertificate={() => undefined}
      onRegisterFirst={() => navigation.navigate('BusinessRegistration')}
    />
  );
}

function UnregisteredBusinessRoute() {
  const navigation = useFlowNavigation();
  return (
    <UnregisteredBusinessScreen
      onBack={navigation.goBack}
      onContinue={() => navigation.navigate('VerificationInProgress')}
      onLearnMore={() => navigation.navigate('VerifyYourBusiness')}
      onHelp={() => undefined}
    />
  );
}

function CacVerificationSuccessRoute() {
  const navigation = useFlowNavigation();
  return (
    <CacVerificationSuccessScreen
      onBack={navigation.goBack}
      onContinue={() => navigation.navigate('YouReVerified')}
    />
  );
}

function VerificationInProgressRoute() {
  const navigation = useFlowNavigation();
  return (
    <VerificationInProgressScreen
      onBack={navigation.goBack}
      onContinueSetup={() => navigation.navigate('YouReVerified')}
      onCheckLater={() => navigation.navigate('BusinessVerificationStatusCenter')}
      onContactSupport={() => undefined}
      onHelp={() => undefined}
    />
  );
}

function YouReVerifiedRoute() {
  const navigation = useFlowNavigation();
  return (
    <YouReVerifiedScreen
      onBack={navigation.goBack}
      onContinue={() => navigation.navigate('BusinessVerificationStatusCenter')}
      onPreviewStorefront={() => undefined}
      onHelp={() => undefined}
    />
  );
}

function BusinessVerificationStatusCenterRoute() {
  const navigation = useFlowNavigation();
  const openBusinessDashboard = useBusinessDashboardEntry();
  return (
    <BusinessVerificationStatusCenterScreen
      onBack={navigation.goBack}
      onOpenDashboard={openBusinessDashboard}
      onUpdateVerification={() => navigation.navigate('VerifyYourBusiness')}
      onManageLocations={() => navigation.navigate('BusinessLocations')}
      onViewCredential={() => navigation.navigate('IdVerificationNeedsReview')}
      onHelp={() => undefined}
    />
  );
}

function FreeTrialConfirmationRoute() {
  const navigation = useFlowNavigation();
  return (
    <FreeTrialConfirmationScreen
      onBack={navigation.goBack}
      onStartTrial={() => navigation.navigate('BusinessPlanTrialOverview')}
      onSubscribeInstead={() => navigation.navigate('SubscribeNowPayment')}
      onHelp={() => undefined}
    />
  );
}

function BusinessPlanTrialOverviewRoute() {
  const navigation = useFlowNavigation();
  return (
    <BusinessPlanTrialOverviewScreen
      onBack={navigation.goBack}
      onStartTrial={() => navigation.navigate('TrialActiveStatus')}
      onSubscribeNow={() => navigation.navigate('SubscribeNowPayment')}
      onViewAddOns={() => navigation.navigate('VemtapAddOns')}
      onHelp={() => undefined}
    />
  );
}

function TrialActiveStatusRoute() {
  const navigation = useFlowNavigation();
  return (
    <TrialActiveStatusScreen
      onBack={navigation.goBack}
      onExploreDashboard={() => navigation.navigate('BusinessQrReady')}
      onSubscribeNow={() => navigation.navigate('SubscribeNowPayment')}
      onHelp={() => undefined}
    />
  );
}

function SubscribeNowPaymentRoute() {
  const navigation = useFlowNavigation();
  return (
    <SubscribeNowPaymentScreen
      onBack={navigation.goBack}
      onPay={() => navigation.navigate('PaymentSuccessVemtapGrowth')}
      onViewTerms={() => undefined}
      onHelp={() => undefined}
    />
  );
}

function PaymentSuccessVemtapGrowthRoute() {
  const navigation = useFlowNavigation();
  return (
    <PaymentSuccessVemtapGrowthScreen
      onGoToDashboard={() => navigation.navigate('BusinessQrReady')}
      onExploreFeatures={() => navigation.navigate('VemtapAddOns')}
      onDownloadInvoice={() => undefined}
      onContactSupport={() => undefined}
    />
  );
}

function TrialEndingRenewGrowthRoute() {
  const navigation = useFlowNavigation();
  return (
    <TrialEndingRenewGrowthScreen
      onBack={navigation.goBack}
      onContinueGrowth={() => navigation.navigate('SubscribeNowPayment')}
      onReviewBusiness={() => navigation.navigate('BusinessQrReady')}
      onHelp={() => undefined}
    />
  );
}

function TrialExpiredReactivateRoute() {
  const navigation = useFlowNavigation();
  return (
    <TrialExpiredReactivateScreen
      onBack={navigation.goBack}
      onActivate={() => navigation.navigate('SubscribeNowPayment')}
      onViewBusiness={() => navigation.navigate('BusinessQrReady')}
      onContactSupport={() => undefined}
      onHelp={() => undefined}
    />
  );
}

function VemtapAddOnsRoute() {
  const navigation = useFlowNavigation();
  return (
    <VemtapAddOnsScreen
      onBack={navigation.goBack}
      onHelp={() => undefined}
      onSelectAddOn={() => undefined}
      onJoinPosWaitlist={() => undefined}
    />
  );
}

export function BusinessSetupNavigator() {
  return (
    <TypeDensityProvider density="compact">
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="BusinessIntroduction" component={BusinessIntroductionRoute} />
        <Stack.Screen
          name="BusinessProfileBasicInfo"
          component={BusinessProfileBasicInfoRoute}
        />
        <Stack.Screen
          name="BusinessProfileBranding"
          component={BusinessProfileBrandingRoute}
        />
        <Stack.Screen
          name="BusinessProfileContactChannels"
          component={BusinessProfileContactChannelsRoute}
        />
        <Stack.Screen
          name="BusinessAccountCredentials"
          component={BusinessAccountCredentialsRoute}
        />
        <Stack.Screen name="BusinessAccountOtp" component={BusinessAccountOtpRoute} />
        <Stack.Screen
          name="BusinessAccountResetPin"
          component={BusinessAccountResetPinRoute}
        />
        <Stack.Screen name="BusinessLocation" component={BusinessLocationRoute} />
        <Stack.Screen name="BusinessLocations" component={BusinessLocationsRoute} />
        <Stack.Screen name="AddBranchLocation" component={AddBranchLocationRoute} />
        <Stack.Screen
          name="AddProductsOrServices"
          component={AddProductsOrServicesRoute}
        />
        <Stack.Screen name="AddServiceBasics" component={AddServiceBasicsRoute} />
        <Stack.Screen
          name="AddServiceDurationPricing"
          component={AddServiceDurationPricingRoute}
        />
        <Stack.Screen
          name="AddServiceAvailabilityRules"
          component={AddServiceAvailabilityRulesRoute}
        />
        <Stack.Screen name="ReviewServiceSummary" component={ReviewServiceSummaryRoute} />
        <Stack.Screen name="ServicePublished" component={ServicePublishedRoute} />
        <Stack.Screen
          name="AddProductLocationPricing"
          component={AddProductLocationPricingRoute}
        />
        <Stack.Screen name="AddProductBasics" component={AddProductBasicsRoute} />
        <Stack.Screen
          name="AddProductPricingVariants"
          component={AddProductPricingVariantsRoute}
        />
        <Stack.Screen
          name="AddProductBranchAvailability"
          component={AddProductBranchAvailabilityRoute}
        />
        <Stack.Screen name="ReviewProductSummary" component={ReviewProductSummaryRoute} />
        <Stack.Screen name="ProductPublished" component={ProductPublishedRoute} />
        <Stack.Screen name="ProductMakeDeal" component={ProductMakeDealRoute} />
        <Stack.Screen
          name="CreateDealAutoImported"
          component={CreateDealAutoImportedRoute}
        />
        <Stack.Screen name="CreateDealStep1" component={CreateDealStep1Route} />
        <Stack.Screen name="CreateDealStep2" component={CreateDealStep2Route} />
        <Stack.Screen name="CreateDealStep3" component={CreateDealStep3Route} />
        <Stack.Screen name="CreateDealStep4" component={CreateDealStep4Route} />
        <Stack.Screen name="BusinessQrReady" component={BusinessQrReadyRoute} />
        <Stack.Screen name="VerifyYourBusiness" component={VerifyYourBusinessRoute} />
        <Stack.Screen name="VerifyYourIdentity" component={VerifyYourIdentityRoute} />
        <Stack.Screen name="IdVerification" component={IdVerificationRoute} />
        <Stack.Screen
          name="IdVerificationSuccess"
          component={IdVerificationSuccessRoute}
        />
        <Stack.Screen
          name="IdVerificationNeedsReview"
          component={IdVerificationNeedsReviewRoute}
        />
        <Stack.Screen name="BusinessRegistration" component={BusinessRegistrationRoute} />
        <Stack.Screen name="CacVerification" component={CacVerificationRoute} />
        <Stack.Screen name="UnregisteredBusiness" component={UnregisteredBusinessRoute} />
        <Stack.Screen
          name="CacVerificationSuccess"
          component={CacVerificationSuccessRoute}
        />
        <Stack.Screen
          name="VerificationInProgress"
          component={VerificationInProgressRoute}
        />
        <Stack.Screen name="YouReVerified" component={YouReVerifiedRoute} />
        <Stack.Screen
          name="BusinessVerificationStatusCenter"
          component={BusinessVerificationStatusCenterRoute}
        />
        <Stack.Screen
          name="FreeTrialConfirmation"
          component={FreeTrialConfirmationRoute}
        />
        <Stack.Screen
          name="BusinessPlanTrialOverview"
          component={BusinessPlanTrialOverviewRoute}
        />
        <Stack.Screen name="TrialActiveStatus" component={TrialActiveStatusRoute} />
        <Stack.Screen name="SubscribeNowPayment" component={SubscribeNowPaymentRoute} />
        <Stack.Screen
          name="PaymentSuccessVemtapGrowth"
          component={PaymentSuccessVemtapGrowthRoute}
        />
        <Stack.Screen
          name="TrialEndingRenewGrowth"
          component={TrialEndingRenewGrowthRoute}
        />
        <Stack.Screen
          name="TrialExpiredReactivate"
          component={TrialExpiredReactivateRoute}
        />
        <Stack.Screen name="VemtapAddOns" component={VemtapAddOnsRoute} />
      </Stack.Navigator>
    </TypeDensityProvider>
  );
}

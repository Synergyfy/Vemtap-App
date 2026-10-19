import { enterShell } from '@navigation/shellSwitch';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Linking } from 'react-native';
import { strings } from '@constants/strings';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  AddBranchLocationScreen,
  AddProductBasicsCategoryScreen,
  AddProductBranchAvailabilityScreen,
  AddProductLocationPricingScreen,
  AddProductPricingVariantsScreen,
  AddProductsOrServicesScreen,
  BusinessAccountCredentialsScreen,
  BusinessAccountOtpScreen,
  BusinessIntroductionScreen,
  BusinessLocationsMultiBranchScreen,
  BusinessPlanTrialOverviewScreen,
  BusinessProfileBasicInfoScreen,
  BusinessProfileBrandingScreen,
  BusinessProfileContactChannelsScreen,
  BusinessRegistrationScreen,
  BusinessSetupGateScreen,
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
import { useBusinessCatalogue } from '@features/business/hooks/useBusinessCatalogue';
import { catalogueItemToSetupCard } from '@features/business/utils/catalogueHubRowMappers';
import {
  businessCatalogCopy as copy,
  businessLocationCopy,
  businessProfileCopy,
} from '@features/business/businessCopy';
import { useUpgradeOwnerRegistration } from '@features/business/hooks/useUpgradeOwnerRegistration';
import {
  useRegisterOwnerAccount,
  useUpgradeToOwnerAccount,
} from '@features/business/hooks/useOwnerAccountSetup';
import { EmptyState } from '@components/shared/EmptyState';
import { SafeAreaView } from 'react-native-safe-area-context';
import { uploadBrandingMedia } from '@features/business/utils/uploadBusinessMedia';
import { ForgotPinScreen } from '@features/auth/screens/ForgotPinScreen';
import { TypeDensityProvider } from '@theme/TypeDensityProvider';
import { useBusinessOnboardingStore } from '@store/businessOnboardingStore';
import { useAuthStore, selectHasSession, selectIsAuthenticated } from '@store/authStore';
import { CreditBundleSheet } from '@features/business/components/CreditBundleSheet';
import {
  plansFor,
  useBuyCreditPlan,
  useCreditPlans,
  type CreditChannel,
} from '@features/business/hooks/useCreditPlans';
import type { CreditPlan } from '@api/creditPlansApi';
import { useSponsoredOptions } from '@features/business/hooks/useCampaigns';
import type { AddOnKey, AddOnPrice } from '@features/business/screens/VemtapAddOnsScreen';
import * as WebBrowser from 'expo-web-browser';
import { SUPPORT_EMAIL, TERMS_URL } from '@constants/webLinks';
import { useCatalogueDraftStore } from '@store/catalogueDraftStore';
import {
  useBusinessBranches,
  usePublishCatalogueItem,
  usePublishCatalogueOffer,
  useUpdateCatalogueItemStatus,
} from '@features/business/hooks/useCatalogueMutations';
import { useDealReviewLaunch } from '@features/business/hooks/useDealReviewLaunch';
import { useDealStep1 } from '@features/business/hooks/useDealStep1';
import { DealItemPickerSheet } from '@features/business/components/DealItemPickerSheet';
import { businessDashboardApi } from '@api/businessDashboardApi';
import { showError, showSuccess } from '@components/shared';
import { mapLocationDraft } from '@features/business/utils/locationDraftMapper';
import { logger } from '@utils/logger';
import {
  useRequestManualReview,
  useSubmitUnregisteredBusiness,
  useVerificationStatus,
  verificationKeys,
} from '@features/business/hooks/useVerification';
import { useMyBusiness } from '@features/business/hooks/useBusinessDashboardData';
import {
  useCreateBranch,
  useUpdateBranch,
} from '@features/business/hooks/useBranchMutations';
import { useInviteStaff } from '@features/business/hooks/useTeam';
import { requestCurrentLocation } from '@features/location/utils/currentLocation';
import type { ProfileBranch } from '@api/businessProfileApi';
import type { BranchSummary } from '@features/business/businessData';
import type { BranchDraft } from '@features/business/screens/AddBranchLocationScreen';
import { usePickBusinessImages } from '@features/business/hooks/usePickBusinessImages';
import { productSnapshot } from '@features/business/utils/productSnapshot';
import {
  reasonCopy,
  verificationApi,
  type IdentityIdType,
  type VerificationStatus,
} from '@api/verificationApi';
import type { MyBusiness } from '@api/businessDashboardApi';
import {
  displayName,
  formatDay,
  formatVerifiedAt,
  idTypeLabel,
} from '@features/business/verificationDisplay';
import { vemtapAddOnsCopy, youReVerifiedCopy } from '@features/business/verificationCopy';
import type { YouReVerifiedPillar } from '@features/business/screens/YouReVerifiedScreen';
import { useQueryClient } from '@tanstack/react-query';
import { useBusinessQrSummary } from '@features/business/hooks/useBusinessQr';
import { toQrReadyView } from '@features/business/utils/qrMappers';
import {
  planPrice,
  subscriptionsApi,
  type BillingPeriod,
  type Plan,
} from '@api/subscriptionsApi';
import {
  subscriptionKeys,
  trialStageOf,
  useActiveSubscription,
  useAddons,
  useCheckout,
  usePaymentMethod,
  usePlans,
  usePricePreview,
  useStartTrial,
} from '@features/business/hooks/useSubscriptions';
import { subscriptionRef, trialProgress } from '@features/business/subscriptionDisplay';
import { formatCurrency } from '@utils/formatters';
import type { BusinessSetupStackParamList, RootStackParamList } from '@navigation/types';
import { shareQrLink, useQrKitShare, useQrWindow } from './qrRoutes';
import {
  ServiceAvailabilityStep,
  ServiceBasicsStep,
  ServicePricingStep,
  ServiceReviewStep,
  type ServiceFlowNavigation,
} from './serviceFlowRoutes';

const Stack = createNativeStackNavigator<BusinessSetupStackParamList>();
type FlowNavigation = NativeStackNavigationProp<BusinessSetupStackParamList>;

function useFlowNavigation() {
  return useNavigation<FlowNavigation>();
}

/**
 * Persists the in-progress product draft to the backend as an `inactive` item
 * (the API has no server-side draft object; "draft" is the inactive status).
 * Only offered once a branch is chosen, since creation is branch-scoped.
 */
function useSaveProductDraft() {
  const navigation = useFlowNavigation();
  const publish = usePublishCatalogueItem();
  return () => {
    const { product } = useCatalogueDraftStore.getState();
    if (!product.branchIds.length) {
      showError('Pick a branch first so the draft has somewhere to live.');
      return;
    }
    publish.mutate(
      { kind: 'product', status: 'inactive' },
      {
        onSuccess: () => {
          showSuccess('Product saved as draft.');
          navigation.navigate('ProductPublished');
        },
        onError: error =>
          showError(error instanceof Error ? error.message : 'Could not save the draft.'),
      },
    );
  };
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

/**
 * Finishing setup lands in the business shell *instead of* setup and the
 * customer app, so back cannot return to either.
 */
export function useBusinessDashboardEntry() {
  const navigation = useRootNavigation();
  return () => {
    if (!enterShell('BusinessTabs', businessDashboardEntry)) {
      navigation.navigate('BusinessTabs', businessDashboardEntry);
    }
  };
}

/** Referral growth hand-off: drops the owner into the Business Network hub. */
export function useBusinessNetworkEntry() {
  const navigation = useRootNavigation();
  return () => {
    if (!enterShell('BusinessTabs', businessNetworkEntry)) {
      navigation.navigate('BusinessTabs', businessNetworkEntry);
    }
  };
}

type BusinessShellTab =
  'BusinessOverview' | 'BusinessOrders' | 'BusinessHub' | 'BusinessMore';

/** Business screens live in the business shell; setup reaches them from the root. */
function useOpenBusinessScreen() {
  const navigation = useRootNavigation();
  return useCallback(
    (tab: BusinessShellTab, screen: string) =>
      (navigation.navigate as (name: string, params: object) => void)('BusinessTabs', {
        screen: tab,
        params: { screen },
      }),
    [navigation],
  );
}

/**
 * Help and support from a setup screen: the business support hub once there
 * is a session, the support inbox before (setup runs signed out too).
 */
function useOpenSupport() {
  const hasSession = useAuthStore(selectHasSession);
  const openBusinessScreen = useOpenBusinessScreen();
  return useCallback(() => {
    if (hasSession) {
      openBusinessScreen('BusinessMore', 'BusinessSupportHelp');
      return;
    }
    Linking.openURL(`mailto:${SUPPORT_EMAIL}`).catch(() => undefined);
  }, [hasSession, openBusinessScreen]);
}

function openTerms() {
  WebBrowser.openBrowserAsync(TERMS_URL).catch(() => Linking.openURL(TERMS_URL));
}

function BusinessSetupGateRoute() {
  const navigation = useFlowNavigation();
  return <BusinessSetupGateScreen navigation={navigation} />;
}

/**
 * Finishing account setup from the gate starts the wizard clean: the
 * credentials / OTP screens are behind the owner now, so back must not return
 * to them.
 */
function useFinishAccountStep(fromGate: boolean) {
  const navigation = useFlowNavigation();
  return useCallback(() => {
    if (fromGate) {
      navigation.reset({ index: 0, routes: [{ name: 'BusinessIntroduction' }] });
    } else {
      navigation.navigate('BusinessLocation');
    }
  }, [fromGate, navigation]);
}

function BusinessIntroductionRoute() {
  const navigation = useFlowNavigation();
  const isAuthenticated = useAuthStore(selectHasSession);

  useEffect(() => {
    if (!isAuthenticated) {
      navigation.replace('BusinessSetupGate');
    }
  }, [isAuthenticated, navigation]);

  if (!isAuthenticated) {
    return null;
  }

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
async function syncOwnerDraftToBusiness(draft: {
  basic: {
    name: string;
    categoryId?: string;
    subcategoryId?: string;
    otherSubcategoryName?: string;
    description: string;
  };
  branding: {
    logoUrl?: string;
    logoUri?: string;
    coverUri?: string;
    galleryUris?: string[];
    logoRemoved?: boolean;
  };
  contact: { email: string; website: string; whatsappNumber?: string; phone: string };
}): Promise<void> {
  const updates: Record<string, unknown> = {};
  const { branding } = draft;

  // Upload branding media (logo, cover, gallery) if any local URIs are present
  const media = await uploadBrandingMedia({
    logoUri: branding.logoUri,
    coverUri: branding.coverUri,
    galleryUris: branding.galleryUris,
  });

  if (branding.logoRemoved) {
    updates.logoUrl = null;
  } else if (media.logoUrl) {
    updates.logoUrl = media.logoUrl;
  } else if (branding.logoUrl) {
    updates.logoUrl = branding.logoUrl;
  }

  if (media.coverImage) updates.coverImage = media.coverImage;
  if (media.gallery?.length) updates.gallery = media.gallery;

  const { basic: b, contact: c } = draft;

  if (b.name?.trim()) updates.name = b.name.trim();
  if (b.categoryId) updates.categoryId = b.categoryId;
  if (b.subcategoryId) updates.subcategoryId = b.subcategoryId;
  if (b.otherSubcategoryName?.trim()) {
    updates.otherSubcategoryName = b.otherSubcategoryName.trim();
  }
  if (b.description?.trim()) updates.about = b.description.trim();

  if (c.email?.trim()) updates.officialEmail = c.email.trim();

  const whatsapp = (c.whatsappNumber ?? c.phone ?? '').replace(/\D/g, '');
  if (whatsapp) updates.whatsappNumber = whatsapp;

  const website = c.website?.trim();
  if (website) {
    updates.website = /^https?:\/\//i.test(website) ? website : `https://${website}`;
  }

  if (Object.keys(updates).length === 0) return;

  // Not best-effort: this request is what creates the business. A failure is
  // surfaced by the caller rather than continuing to Location with nothing.
  await businessDashboardApi.updateMyBusiness(updates);
}

/**
 * Credentials step. A signed-out user creates an account here (email +
 * password, then OTP). An authenticated customer confirms their password and
 * the same account gains an owner side, keeping the customer profile intact.
 */
function BusinessAccountCredentialsRoute() {
  const navigation = useFlowNavigation();
  const route =
    useRoute<RouteProp<BusinessSetupStackParamList, 'BusinessAccountCredentials'>>();
  const fromGate = route.params?.fromGate === true;
  const isAuthenticated = useAuthStore(selectHasSession);
  const user = useAuthStore(state => state.user);
  const contact = useBusinessOnboardingStore(state => state.profile.contact);
  const setCredentials = useBusinessOnboardingStore(state => state.setCredentials);
  // At the gate the business details do not exist yet, so only the account is
  // upgraded; the business is created after Contact, from the full draft.
  const fullUpgrade = useUpgradeOwnerRegistration();
  const accountUpgrade = useUpgradeToOwnerAccount();
  const upgrade = fromGate ? accountUpgrade : fullUpgrade;
  const syncedOwnerDraft = useRef(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncAttempt, setSyncAttempt] = useState(0);

  const role = user?.role?.toLowerCase();
  const ownerRegistered = role === 'owner' && Boolean(user?.businessId);
  const ownerWithoutBusiness = isAuthenticated && role === 'owner' && !user?.businessId;
  const skipCredentials = ownerRegistered || ownerWithoutBusiness;

  const isGoogleAccount =
    String(user?.authProvider ?? '').toUpperCase() === 'GOOGLE' ||
    Boolean(user?.googleId);

  const finish = useFinishAccountStep(fromGate);

  useEffect(() => {
    if (!skipCredentials) return;

    let mounted = true;

    (async () => {
      if (ownerWithoutBusiness && !syncedOwnerDraft.current) {
        syncedOwnerDraft.current = true;
        const store = useBusinessOnboardingStore.getState();
        try {
          // Creates the business (PATCH my-business auto-creates for an owner
          // without one). Continuing without it would strand every later step.
          await syncOwnerDraftToBusiness({
            basic: store.profile.basic,
            branding: store.profile.branding,
            contact: store.profile.contact,
          });
        } catch (error) {
          syncedOwnerDraft.current = false;
          if (mounted) {
            const message = (error as { message?: unknown } | null)?.message;
            setSyncError(
              typeof message === 'string' && message
                ? message
                : businessProfileCopy.accountSetup.businessSyncFailed,
            );
          }
          return;
        }
      }

      if (mounted) {
        finish();
      }
    })();

    return () => {
      mounted = false;
    };
  }, [ownerWithoutBusiness, skipCredentials, finish, syncAttempt]);

  if (skipCredentials) {
    return syncError ? (
      <SafeAreaView edges={['top']} className="flex-1 bg-background">
        <EmptyState
          title={businessProfileCopy.accountSetup.businessSyncFailed}
          description={syncError}
          actionLabel={businessProfileCopy.accountSetup.businessSyncRetry}
          onAction={() => {
            setSyncError(null);
            setSyncAttempt(attempt => attempt + 1);
          }}
        />
      </SafeAreaView>
    ) : null;
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
        onContinue={({ password }) => upgrade.mutate({ password }, { onSuccess: finish })}
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
        navigation.navigate('BusinessAccountOtp', { fromGate });
      }}
    />
  );
}

/** Signed-in PIN/password reset, reached from the confirm step's forgot link. */
function BusinessAccountResetPinRoute() {
  const navigation = useFlowNavigation();
  const route =
    useRoute<RouteProp<BusinessSetupStackParamList, 'BusinessAccountResetPin'>>();
  const user = useAuthStore(state => state.user);
  return (
    <ForgotPinScreen
      initialEmail={user?.email}
      doneLabel={businessProfileCopy.accountSetup.confirm.resetDone}
      onDone={() =>
        navigation.navigate('BusinessAccountCredentials', {
          fromGate: route.params?.fromGate,
        })
      }
    />
  );
}

function BusinessAccountOtpRoute() {
  const navigation = useFlowNavigation();
  const route = useRoute<RouteProp<BusinessSetupStackParamList, 'BusinessAccountOtp'>>();
  const fromGate = route.params?.fromGate === true;
  const credentials = useBusinessOnboardingStore(state => state.credentials);
  const submit = useSubmitOwnerRegistration();
  // From the gate there is no business draft yet: create the account only;
  // the business follows after Contact, from the finished draft.
  const accountOnly = useRegisterOwnerAccount();
  const register = fromGate ? accountOnly.register : submit.register;

  const finish = useFinishAccountStep(fromGate);

  const handleVerified = useCallback(async () => {
    if (!credentials.email || !credentials.password) {
      throw new Error(
        'Your account details are missing. Go back and re-enter your email and password.',
      );
    }
    await register({
      email: credentials.email,
      password: credentials.password,
    });
    finish();
  }, [credentials.email, credentials.password, finish, register]);

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

/** A live branch as the setup card shows it. */
function toBranchSummary(
  branch: ProfileBranch,
  businessName: string | undefined,
): BranchSummary {
  return {
    id: branch.id,
    name: branch.name,
    businessLine: [businessName, branch.city].filter(Boolean).join(' \u2022 '),
    imageUri: branch.logoUrl ?? '',
    isPrimary: Boolean(branch.isMainBranch),
    address: branch.address ?? '',
    phone: branch.phone ?? '',
    openStatus: branch.isActive === false ? 'Paused' : 'Active',
    hours: '',
  };
}

function BusinessLocationsRoute() {
  const navigation = useFlowNavigation();
  const openSupport = useOpenSupport();
  const setBranches = useBusinessOnboardingStore(state => state.setBranches);
  const myBusiness = useMyBusiness();
  const branches = (myBusiness.data?.branches ?? []).map(branch =>
    toBranchSummary(branch, myBusiness.data?.name),
  );
  return (
    <BusinessLocationsMultiBranchScreen
      branches={branches}
      onBack={navigation.goBack}
      onContinue={value => {
        setBranches(value);
        navigation.navigate('AddProductsOrServices');
      }}
      onAddBranch={() => navigation.navigate('AddBranchLocation')}
      onEditBranch={branch =>
        navigation.navigate('AddBranchLocation', { branchId: branch.id })
      }
      onManageHours={branch =>
        navigation.navigate('AddBranchLocation', { branchId: branch.id })
      }
      onContactConcierge={openSupport}
    />
  );
}

function AddBranchLocationRoute() {
  const navigation = useFlowNavigation();
  const route = useRoute<RouteProp<BusinessSetupStackParamList, 'AddBranchLocation'>>();
  const branchId = route.params?.branchId;
  const myBusiness = useMyBusiness();
  const createBranch = useCreateBranch();
  const updateBranch = useUpdateBranch();
  const inviteStaff = useInviteStaff();
  const editing = branchId
    ? myBusiness.data?.branches?.find(branch => branch.id === branchId)
    : undefined;
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(
    null,
  );
  const [locating, setLocating] = useState(false);
  const [saving, setSaving] = useState(false);
  const addCopy = businessLocationCopy.addBranch;

  const pinned =
    coords ??
    (editing?.latitude != null && editing?.longitude != null
      ? { latitude: Number(editing.latitude), longitude: Number(editing.longitude) }
      : null);

  const pin = async () => {
    setLocating(true);
    const result = await requestCurrentLocation();
    setLocating(false);
    if (result.ok) {
      setCoords(result.coords);
      return;
    }
    showError(
      result.reason === 'denied' ? addCopy.locationDenied : addCopy.locationUnavailable,
    );
  };

  const save = async (draft: BranchDraft) => {
    const name = draft.name.trim();
    if (!name) {
      showError(addCopy.nameRequired);
      return;
    }
    const address = [draft.street, draft.landmark]
      .map(part => part.trim())
      .filter(Boolean);
    const fields = {
      name,
      ...(address.length ? { address: address.join(', ') } : {}),
      ...(draft.district.trim() ? { city: draft.district.trim() } : {}),
      ...(draft.phone.trim() ? { phone: draft.phone.trim() } : {}),
      ...(draft.email.trim() ? { officialEmail: draft.email.trim() } : {}),
    };
    setSaving(true);
    try {
      const saved = editing
        ? await updateBranch.mutateAsync({
            branchId: editing.id,
            ...fields,
            ...(coords ?? {}),
          })
        : await createBranch.mutateAsync(fields);
      const savedId = (saved as { id?: string } | undefined)?.id ?? editing?.id;
      // Creating takes no coordinates; the pin is saved straight after.
      if (!editing && coords && savedId) {
        await updateBranch.mutateAsync({ branchId: savedId, ...coords });
      }
      const [firstName, ...rest] = draft.leadName.trim().split(/\s+/);
      if (
        !editing &&
        draft.grantDashboardAccess &&
        savedId &&
        firstName &&
        draft.leadEmail.trim()
      ) {
        await inviteStaff
          .mutateAsync({
            firstName,
            lastName: rest.join(' ') || firstName,
            email: draft.leadEmail.trim(),
            ...(draft.leadPhone.trim() ? { phone: draft.leadPhone.trim() } : {}),
            role: draft.leadRole === 'Branch Manager' ? 'manager' : 'staff',
            jobTitle: draft.leadRole,
            branchId: savedId,
          })
          .catch(() => showError(addCopy.inviteFailed));
      }
      showSuccess(addCopy.saved);
      navigation.goBack();
    } catch (error) {
      showError(error instanceof Error ? error.message : addCopy.saveFailed);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AddBranchLocationScreen
      key={editing?.id ?? 'new'}
      initialValue={
        editing
          ? {
              name: editing.name,
              street: editing.address ?? '',
              district: editing.city ?? '',
              phone: editing.phone ?? '',
            }
          : undefined
      }
      coordinates={pinned}
      locating={locating}
      saving={saving}
      onBack={navigation.goBack}
      onChangeGps={pin}
      onSave={save}
    />
  );
}

function AddProductsOrServicesRoute() {
  const navigation = useFlowNavigation();
  // The screen used to render three hard-coded sample items here. It now shows
  // the owner's own catalogue, so setup reflects what they actually offer.
  const catalogue = useBusinessCatalogue();
  const items = (catalogue.data?.data ?? []).map(catalogueItemToSetupCard);
  return (
    <AddProductsOrServicesScreen
      items={items}
      isLoading={catalogue.isLoading}
      error={catalogue.isError ? copy.catalogueLoadFailed : undefined}
      onBack={navigation.goBack}
      onContinue={() => navigation.navigate('BusinessQrReady')}
      onSkip={() => navigation.navigate('BusinessQrReady')}
      onAddProduct={() => navigation.navigate('AddProductLocationPricing')}
      onAddService={() => {
        useCatalogueDraftStore.getState().resetService();
        navigation.navigate('AddServiceBasics');
      }}
      onAddAnother={() => navigation.navigate('AddProductsOrServices')}
      onEditItem={() => undefined}
      onRemoveItem={() => undefined}
      onFilter={() => undefined}
    />
  );
}

/** Add Service steps in setup: done → the published-status page. */
function useSetupServiceFlowNavigation(): ServiceFlowNavigation {
  const navigation = useFlowNavigation();
  return {
    goBack: navigation.goBack,
    next: step =>
      navigation.navigate(
        step === 'pricing'
          ? 'AddServiceDurationPricing'
          : step === 'availability'
            ? 'AddServiceAvailabilityRules'
            : 'ReviewServiceSummary',
      ),
    done: () => navigation.navigate('ServicePublished'),
  };
}

function AddServiceBasicsRoute() {
  return <ServiceBasicsStep nav={useSetupServiceFlowNavigation()} />;
}

function AddServiceDurationPricingRoute() {
  return <ServicePricingStep nav={useSetupServiceFlowNavigation()} />;
}

function AddServiceAvailabilityRulesRoute() {
  return <ServiceAvailabilityStep nav={useSetupServiceFlowNavigation()} />;
}

function ReviewServiceSummaryRoute() {
  return <ServiceReviewStep nav={useSetupServiceFlowNavigation()} />;
}

function ServicePublishedRoute() {
  const navigation = useFlowNavigation();
  const serviceId = useCatalogueDraftStore(state => state.service.publishedServiceId);
  const draft = useCatalogueDraftStore(state => state.service);
  const updateStatus = useUpdateCatalogueItemStatus();
  return (
    <ServicePublishedStatusScreen
      onBack={navigation.goBack}
      onNext={() => navigation.navigate('BusinessQrReady')}
      onSaveDraft={undefined}
      onAddAnother={() => {
        useCatalogueDraftStore.getState().resetService();
        navigation.navigate('AddServiceBasics');
      }}
      onCreateDeal={() => navigation.navigate('CreateDealAutoImported')}
      onStatusChange={status => {
        if (!serviceId) return;
        updateStatus.mutate(
          { itemId: serviceId, status: status === 'live' ? 'active' : 'inactive' },
          { onError: () => showError('Could not update the service status') },
        );
      }}
      draft={draft}
    />
  );
}

/** The product draft as the publish / deal screens summarise it. */
function useProductSnapshot() {
  const draft = useCatalogueDraftStore(state => state.product);
  const branches = useBusinessBranches();
  return productSnapshot(draft, branches.data ?? []);
}

/** Upload photos into the product draft (cover first). */
function useProductPhotos() {
  const setProduct = useCatalogueDraftStore(state => state.setProduct);
  const { pick, uploading } = usePickBusinessImages();
  const add = async () => {
    const urls = await pick();
    if (!urls.length) return;
    const { product } = useCatalogueDraftStore.getState();
    const gallery = [...product.galleryImages, ...urls];
    setProduct({ galleryImages: gallery, mainImage: product.mainImage ?? gallery[0] });
  };
  return { add, uploading };
}

function AddProductLocationPricingRoute() {
  const navigation = useFlowNavigation();
  const setProduct = useCatalogueDraftStore(state => state.setProduct);
  const resetProduct = useCatalogueDraftStore(state => state.resetProduct);
  const draft = useCatalogueDraftStore(state => state.product);
  const photos = useProductPhotos();
  return (
    <AddProductLocationPricingScreen
      initialValue={{
        productName: draft.name,
        category: draft.categoryName ?? '',
        description: draft.description,
        selectedBranchIds: draft.branchIds,
        pricingMode: draft.pricingMode === 'branch' ? 'branch' : 'uniform',
        inStock: draft.inStock,
      }}
      image={draft.mainImage}
      uploadingPhoto={photos.uploading}
      onChangePhoto={photos.add}
      onBack={navigation.goBack}
      onSave={value => {
        setProduct({
          name: value.productName,
          categoryName: value.category,
          description: value.description,
          branchIds: value.selectedBranchIds,
          pricingMode: value.pricingMode,
          inStock: value.inStock,
        });
        navigation.navigate('AddProductBasics');
      }}
      onDiscard={() => {
        resetProduct();
        navigation.goBack();
      }}
    />
  );
}

function AddProductBasicsRoute() {
  const navigation = useFlowNavigation();
  const setProduct = useCatalogueDraftStore(state => state.setProduct);
  const saveProductDraft = useSaveProductDraft();
  const draft = useCatalogueDraftStore(state => state.product);
  const photos = useProductPhotos();
  const images = [draft.mainImage, ...draft.galleryImages].filter(
    (uri, index, all): uri is string => Boolean(uri) && all.indexOf(uri) === index,
  );
  return (
    <AddProductBasicsCategoryScreen
      initialValue={{
        title: draft.name,
        brand: draft.brand,
        unbranded: draft.unbranded,
        description: draft.description,
        categoryPath: draft.categoryName ?? '',
        ...(draft.condition === 'Fresh / New' ||
        draft.condition === 'Packaged' ||
        draft.condition === 'Surplus'
          ? { condition: draft.condition }
          : {}),
      }}
      images={images}
      uploadingPhoto={photos.uploading}
      onChangePhoto={photos.add}
      onBack={navigation.goBack}
      onContinue={value => {
        setProduct({
          name: value.title,
          brand: value.brand,
          unbranded: value.unbranded,
          description: value.description,
          condition: value.condition,
          categoryName: value.categoryPath,
        });
        navigation.navigate('AddProductPricingVariants');
      }}
      onSaveDraft={saveProductDraft}
    />
  );
}

function AddProductPricingVariantsRoute() {
  const navigation = useFlowNavigation();
  const setProduct = useCatalogueDraftStore(state => state.setProduct);
  const saveProductDraft = useSaveProductDraft();
  const draft = useCatalogueDraftStore(state => state.product);
  return (
    <AddProductPricingVariantsScreen
      initialValue={{
        regularPrice: draft.regularPrice,
        compareAtPrice: draft.compareAtPrice,
        costPerItem: draft.costPrice,
        variants: draft.variants,
        sku: draft.sku,
        lowStockThreshold: draft.lowStockThreshold,
        continueWhenOutOfStock: draft.backorder,
      }}
      onBack={navigation.goBack}
      onContinue={value => {
        setProduct({
          regularPrice: value.regularPrice,
          compareAtPrice: value.compareAtPrice,
          costPrice: value.costPerItem,
          variants: value.variants,
          sku: value.sku,
          lowStockThreshold: value.lowStockThreshold,
          backorder: value.continueWhenOutOfStock,
        });
        navigation.navigate('AddProductBranchAvailability');
      }}
      onSaveDraft={saveProductDraft}
    />
  );
}

function AddProductBranchAvailabilityRoute() {
  const navigation = useFlowNavigation();
  const setProduct = useCatalogueDraftStore(state => state.setProduct);
  const saveProductDraft = useSaveProductDraft();
  const draft = useCatalogueDraftStore(state => state.product);
  return (
    <AddProductBranchAvailabilityScreen
      initialValue={{
        selectedBranchIds: draft.branchIds,
        ...(draft.pricingMode === 'unified' || draft.pricingMode === 'custom'
          ? { pricingMode: draft.pricingMode }
          : {}),
        fulfillment: draft.fulfillmentModes,
      }}
      onBack={navigation.goBack}
      onContinue={value => {
        setProduct({
          branchIds: value.selectedBranchIds,
          pricingMode: value.pricingMode,
          fulfillmentModes: value.fulfillment,
        });
        navigation.navigate('ReviewProductSummary');
      }}
      onSaveDraft={saveProductDraft}
    />
  );
}

function ReviewProductSummaryRoute() {
  const navigation = useFlowNavigation();
  const draft = useCatalogueDraftStore(state => state.product);
  const publish = usePublishCatalogueItem();

  const submit = (status: 'active' | 'inactive') => {
    publish.mutate(
      { kind: 'product', status },
      {
        onSuccess: () => navigation.navigate('ProductPublished'),
        onError: error =>
          showError(
            error instanceof Error ? error.message : 'Could not publish the product',
          ),
      },
    );
  };

  return (
    <ReviewProductSummaryScreen
      draft={draft}
      publishing={publish.isPending}
      onBack={navigation.goBack}
      onPublish={() => submit('active')}
      onSaveDraft={() => submit('inactive')}
    />
  );
}

function ProductPublishedRoute() {
  const navigation = useFlowNavigation();
  const itemId = useCatalogueDraftStore(state => state.product.publishedItemId);
  const updateStatus = useUpdateCatalogueItemStatus();
  const product = useProductSnapshot();
  return (
    <ProductPublishedOrSavedAsDraftScreen
      product={product}
      onBack={navigation.goBack}
      onMakeDeal={() => navigation.navigate('ProductMakeDeal')}
      onViewCatalog={() => navigation.navigate('BusinessQrReady')}
      onAddAnother={() => navigation.navigate('AddProductLocationPricing')}
      onStatusChange={status => {
        if (!itemId) return;
        updateStatus.mutate(
          { itemId, status: status === 'live' ? 'active' : 'inactive' },
          { onError: () => showError('Could not update the product status') },
        );
      }}
    />
  );
}

function ProductMakeDealRoute() {
  const navigation = useFlowNavigation();
  const setDeal = useCatalogueDraftStore(state => state.setDeal);
  const product = useCatalogueDraftStore(state => state.product);
  const snapshot = useProductSnapshot();
  return (
    <ProductPublishedMakeItADealScreen
      product={snapshot}
      onBack={navigation.goBack}
      onConvertToDeal={() => {
        setDeal({
          sourceProductId: product.publishedItemId,
          sourceProductName: product.name || undefined,
          itemIds: product.publishedItemId ? [product.publishedItemId] : [],
          name: product.name ? `${product.name} deal` : '',
          mainImage: product.mainImage,
        });
        navigation.navigate('CreateDealAutoImported');
      }}
      onQuickSetupOpen={() => undefined}
      onKeepRegularProduct={() => navigation.navigate('ProductPublished')}
    />
  );
}

function CreateDealAutoImportedRoute() {
  const navigation = useFlowNavigation();
  const setDeal = useCatalogueDraftStore(state => state.setDeal);
  const publish = usePublishCatalogueOffer();
  const branches = useBusinessBranches();
  const snapshot = useProductSnapshot();
  const productDraft = useCatalogueDraftStore(state => state.product);

  const submit = (status: 'active' | 'inactive') => {
    const { deal } = useCatalogueDraftStore.getState();
    const allBranchIds = (branches.data ?? []).map(branch => branch.id);
    publish.mutate(
      {
        status,
        itemIds: deal.itemIds.length ? deal.itemIds : undefined,
        branchId: deal.branchIds[0] ?? allBranchIds[0],
      },
      {
        onSuccess: () => {
          showSuccess(status === 'active' ? 'Deal launched.' : 'Deal saved as draft.');
          navigation.navigate('BusinessQrReady');
        },
        onError: error =>
          showError(error instanceof Error ? error.message : 'Could not launch the deal'),
      },
    );
  };

  return (
    <CreateDealOfferAutoImportedScreen
      product={snapshot}
      initialBranchIds={productDraft.branchIds}
      onBack={navigation.goBack}
      onPublish={value => {
        setDeal({
          strategy: value.discountMode === 'fixed' ? 'fixed' : 'percentage',
          discountRate: value.discountPercent,
          totalVouchers: String(value.totalVouchers),
          branchIds: value.selectedBranchIds,
          terms: value.terms ? [value.terms] : [],
        });
        submit('active');
      }}
      onCancel={() => navigation.navigate('ProductPublished')}
      onSaveDraft={value => {
        setDeal({
          strategy: value.discountMode === 'fixed' ? 'fixed' : 'percentage',
          discountRate: value.discountPercent,
          totalVouchers: String(value.totalVouchers),
          branchIds: value.selectedBranchIds,
          terms: value.terms ? [value.terms] : [],
        });
        submit('inactive');
      }}
    />
  );
}

function CreateDealStep1Route() {
  const navigation = useFlowNavigation();
  // Shared with the Business-hub wizard: item picker, real item preview and
  // the edit-safe discount commit.
  const step1 = useDealStep1(() => navigation.navigate('CreateDealStep2'));
  return (
    <>
      <CreateDealStep1DiscountStrategyScreen
        onBack={navigation.goBack}
        {...step1.screenProps}
      />
      <DealItemPickerSheet {...step1.pickerProps} />
    </>
  );
}

function CreateDealStep2Route() {
  const navigation = useFlowNavigation();
  const setDeal = useCatalogueDraftStore(state => state.setDeal);
  return (
    <CreateDealStep2LimitsGiftingRulesScreen
      onBack={navigation.goBack}
      onContinue={value => {
        setDeal({
          totalVouchers: String(value.totalVouchers),
          claimFrequency: value.claimFrequency,
          maxClaimsPerMonth: value.maxClaimsPerMonth,
          acceptGifting: value.acceptGifting,
        });
        navigation.navigate('CreateDealStep3');
      }}
      onSave={value => {
        setDeal({
          totalVouchers: String(value.totalVouchers),
          claimFrequency: value.claimFrequency,
          maxClaimsPerMonth: value.maxClaimsPerMonth,
          acceptGifting: value.acceptGifting,
        });
        navigation.navigate('CreateDealStep3');
      }}
    />
  );
}

function CreateDealStep3Route() {
  const navigation = useFlowNavigation();
  const setDeal = useCatalogueDraftStore(state => state.setDeal);
  return (
    <CreateDealStep3ParticipatingBranchesScheduleScreen
      onBack={navigation.goBack}
      onSave={value => {
        setDeal(value);
        navigation.navigate('CreateDealStep4');
      }}
    />
  );
}

function CreateDealStep4Route() {
  const navigation = useFlowNavigation();
  // Shared with the Business-hub wizard: live review, every-branch publish,
  // and a launch state that follows the real request.
  const launch = useDealReviewLaunch({
    onLaunched: () => navigation.navigate('BusinessQrReady'),
    onDrafted: () => navigation.navigate('BusinessQrReady'),
  });

  return (
    <CreateDealStep4ReviewLaunchScreen
      mode={launch.isEditing ? 'edit' : 'create'}
      review={launch.review}
      phase={launch.phase}
      isBusy={launch.isBusy}
      onBack={navigation.goBack}
      onEditOffer={() => navigation.navigate('CreateDealStep1')}
      onEditRules={() => navigation.navigate('CreateDealStep2')}
      onEditBranches={() => navigation.navigate('CreateDealStep3')}
      onLaunch={launch.launch}
      onSaveDraft={launch.saveDraft}
      onSave={() => navigation.navigate('BusinessQrReady')}
    />
  );
}

function BusinessQrReadyRoute() {
  const navigation = useFlowNavigation();
  const queryClient = useQueryClient();
  const openBusinessDashboard = useBusinessDashboardEntry();
  // The referral perk belongs to the business app, so it crosses to that shell
  // the same way the dashboard hand-off does.
  const openBusinessNetwork = useBusinessNetworkEntry();
  const qrWindow = useQrWindow();
  const qrSummary = useBusinessQrSummary(qrWindow);
  const qrView = useMemo(
    () => (qrSummary.data ? toQrReadyView(qrSummary.data) : undefined),
    [qrSummary.data],
  );
  const kit = useQrKitShare();
  const handleContinue = useCallback(() => {
    // The setup wizard is done: promote the session out of `onboarding` and
    // make sure later launches restore the business side.
    useAuthStore.getState().setActiveMode('business');
    useAuthStore.getState().completeOnboarding();
    // A business that hasn't started verification is offered it next (it can
    // skip to the trial offer from there); everyone else lands in the app.
    queryClient
      .fetchQuery({
        queryKey: verificationKeys.status(),
        queryFn: () => verificationApi.status(),
        staleTime: 30_000,
      })
      .then(
        status =>
          status.status === 'unverified'
            ? navigation.navigate('VerifyYourBusiness')
            : openBusinessDashboard(),
        () => openBusinessDashboard(),
      );
  }, [navigation, openBusinessDashboard, queryClient]);
  return (
    <YourVemtapBusinessQrIsReadyScreen
      view={qrView}
      isError={qrSummary.isError}
      onRetry={() => void qrSummary.refetch()}
      onBack={navigation.goBack}
      onShare={() => {
        if (qrView) void shareQrLink(qrView.businessName, qrView.url);
      }}
      onSupport={() =>
        void Linking.openURL(`mailto:${strings.businessQrReady.supportEmail}`)
      }
      onOrderKits={() => void kit.shareKit()}
      onDownloadKit={() => void kit.shareKit()}
      onOpenReferrals={openBusinessNetwork}
      onContinue={handleContinue}
    />
  );
}

function VerifyYourBusinessRoute() {
  const navigation = useFlowNavigation();
  const openActivation = useActivationEntry();
  return (
    <VerifyYourBusinessScreen
      onBack={navigation.goBack}
      onStart={() => navigation.navigate('VerifyYourIdentity')}
      // Skipping verification means "start operating": offer the trial, then
      // the business app, instead of parking them on a status page.
      onLater={openActivation}
    />
  );
}

function VerifyYourIdentityRoute() {
  const navigation = useFlowNavigation();
  return (
    <VerifyYourIdentityScreen
      onBack={navigation.goBack}
      onContinue={idType => navigation.navigate('IdVerification', { idType })}
    />
  );
}

/** Verification needs a signed-in owner; skip the query otherwise. */
function useSetupVerificationStatus() {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  return useVerificationStatus(isAuthenticated);
}

function useSetupBusiness() {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const query = useMyBusiness();
  return isAuthenticated ? query.data : undefined;
}

/** Where to go once a step is done, from `GET /verification/status`. */
function useNextVerificationStep() {
  const navigation = useFlowNavigation();
  return (status: VerificationStatus | undefined) => {
    if (status?.status === 'verified') navigation.navigate('YouReVerified');
    else if (status?.nextStep === 'business') navigation.navigate('BusinessRegistration');
    else if (status?.nextStep === 'identity') navigation.navigate('VerifyYourIdentity');
    else navigation.navigate('VerificationInProgress');
  };
}

function IdVerificationRoute() {
  const navigation = useFlowNavigation();
  const route = useRoute<RouteProp<BusinessSetupStackParamList, 'IdVerification'>>();
  return (
    <IdVerificationScreen
      idType={route.params?.idType ?? 'nin'}
      onBack={navigation.goBack}
      onResult={check =>
        check.status === 'verified'
          ? navigation.navigate('IdVerificationSuccess')
          : navigation.navigate('IdVerificationNeedsReview')
      }
    />
  );
}

function IdVerificationSuccessRoute() {
  const navigation = useFlowNavigation();
  const { data: status } = useSetupVerificationStatus();
  const goNext = useNextVerificationStep();
  const identity = status?.identity ?? null;
  return (
    <IdVerificationSuccessScreen
      personName={displayName(identity?.recordName)}
      documentType={identity ? idTypeLabel(identity.idType) : null}
      documentReference={identity?.maskedId}
      verifiedOn={formatVerifiedAt(identity?.reviewedAt ?? identity?.createdAt)}
      onBack={navigation.goBack}
      onContinue={() => goNext(status)}
    />
  );
}

function IdVerificationNeedsReviewRoute() {
  const navigation = useFlowNavigation();
  const { data: status } = useSetupVerificationStatus();
  const requestReview = useRequestManualReview();
  const identity = status?.identity ?? null;
  return (
    <IdVerificationNeedsReviewScreen
      reasons={identity ? reasonCopy(identity.reasons) : undefined}
      inReview={identity?.status === 'needs_review'}
      requestingReview={requestReview.isPending}
      onBack={navigation.goBack}
      onTryAgain={() =>
        navigation.navigate('IdVerification', {
          idType: (identity?.idType as IdentityIdType | undefined) ?? 'nin',
        })
      }
      onUseAnotherId={() => navigation.navigate('VerifyYourIdentity')}
      onRequestManualReview={() =>
        requestReview.mutate(
          { checkId: identity?.id },
          {
            onSuccess: () => navigation.navigate('VerificationInProgress'),
            onError: error =>
              showError(
                error instanceof Error ? error.message : 'Could not request a review.',
              ),
          },
        )
      }
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
  const business = useSetupBusiness();
  return (
    <CacVerificationScreen
      businessName={business?.name}
      onBack={navigation.goBack}
      onResult={check => {
        if (check.status === 'verified') {
          navigation.navigate('CacVerificationSuccess');
        } else if (check.status === 'needs_review') {
          navigation.navigate('VerificationInProgress');
        } else {
          // Not found / inactive: stay so the number can be corrected.
          showError(
            reasonCopy(check.reasons)[0] ?? "We couldn't verify that CAC number.",
          );
        }
      }}
      onRegisterFirst={() => navigation.navigate('UnregisteredBusiness')}
    />
  );
}

function UnregisteredBusinessRoute() {
  const openSupport = useOpenSupport();
  const navigation = useFlowNavigation();
  const { data: status } = useSetupVerificationStatus();
  const submit = useSubmitUnregisteredBusiness();
  const identity = status?.identity ?? null;
  return (
    <UnregisteredBusinessScreen
      identityName={displayName(identity?.recordName)}
      identityStatus={
        !identity ? 'missing' : identity.status === 'verified' ? 'verified' : 'pending'
      }
      submitting={submit.isPending}
      onBack={navigation.goBack}
      onContinue={() =>
        submit.mutate(
          {},
          {
            onSuccess: () => navigation.navigate('VerificationInProgress'),
            onError: error =>
              showError(
                error instanceof Error
                  ? error.message
                  : 'Could not submit your business.',
              ),
          },
        )
      }
      onLearnMore={() => navigation.navigate('VerifyYourBusiness')}
      onHelp={openSupport}
    />
  );
}

/** "Lagos • Restaurant" for the business preview cards. */
function businessMetaLine(business: MyBusiness | undefined): string | null {
  if (!business) return null;
  return [business.city, business.category?.name].filter(Boolean).join(' • ') || null;
}

function CacVerificationSuccessRoute() {
  const navigation = useFlowNavigation();
  const { data: status } = useSetupVerificationStatus();
  const business = useSetupBusiness();
  const goNext = useNextVerificationStep();
  return (
    <CacVerificationSuccessScreen
      businessName={business?.name}
      businessMeta={businessMetaLine(business)}
      logoUrl={business?.logoUrl}
      recordName={displayName(status?.business?.recordName)}
      registrationNumber={status?.business?.maskedId}
      operatorName={
        status?.identity?.status === 'verified'
          ? displayName(status.identity.recordName)
          : null
      }
      onBack={navigation.goBack}
      onContinue={() => goNext(status)}
    />
  );
}

function VerificationInProgressRoute() {
  const openSupport = useOpenSupport();
  const navigation = useFlowNavigation();
  const openActivation = useActivationEntry();
  const { data: status } = useSetupVerificationStatus();
  return (
    <VerificationInProgressScreen
      status={status}
      onBack={navigation.goBack}
      onContinueSetup={() =>
        status?.status === 'verified'
          ? navigation.navigate('YouReVerified')
          : openActivation()
      }
      onCheckLater={() => navigation.navigate('BusinessVerificationStatusCenter')}
      onContactSupport={openSupport}
      onHelp={openSupport}
    />
  );
}

function YouReVerifiedRoute() {
  const openSupport = useOpenSupport();
  const openBusinessScreen = useOpenBusinessScreen();
  const navigation = useFlowNavigation();
  const openActivation = useActivationEntry();
  const { data: status } = useSetupVerificationStatus();
  const business = useSetupBusiness();
  const pillars = useMemo(() => verifiedPillars(status, business), [business, status]);
  return (
    <YouReVerifiedScreen
      businessName={business?.name}
      logoUrl={business?.logoUrl}
      previewMeta={businessMetaLine(business)}
      pillars={pillars}
      onBack={navigation.goBack}
      onContinue={openActivation}
      onPreviewStorefront={() =>
        openBusinessScreen('BusinessHub', 'BusinessProfilePreview')
      }
      onHelp={openSupport}
    />
  );
}

function verifiedPillars(
  status: VerificationStatus | undefined,
  business: MyBusiness | undefined,
): YouReVerifiedPillar[] {
  const verifiedCopy = youReVerifiedCopy;
  const identity = status?.identity ?? null;
  const check = status?.business ?? null;
  const branches = business?.branches ?? [];
  const operator = displayName(identity?.recordName);
  return [
    {
      icon: 'badge',
      title: verifiedCopy.identityTitle,
      tag: verifiedCopy.identityTag,
      body: operator
        ? `${verifiedCopy.operatorLead}${operator}`
        : idTypeLabel(identity?.idType),
      done: identity?.status === 'verified',
    },
    {
      icon: 'domain',
      title: verifiedCopy.businessTitle,
      tag: check?.idType === 'cac' ? verifiedCopy.cacTag : verifiedCopy.reviewedTag,
      body:
        check?.idType === 'cac' && check.maskedId
          ? `${verifiedCopy.registryLead}${check.maskedId}`
          : verifiedCopy.reviewedBody,
      done: status?.status === 'verified',
    },
    {
      icon: 'storefront',
      title: verifiedCopy.locationTitle,
      tag: branches.length ? verifiedCopy.locationTag : verifiedCopy.locationMissingTag,
      body: branches.length
        ? `${branches.length}${
            branches.length === 1 ? verifiedCopy.branchesOne : verifiedCopy.branchesMany
          }`
        : '',
      done: branches.length > 0,
    },
    {
      icon: 'palette',
      title: verifiedCopy.profileTitle,
      tag: verifiedCopy.profileTag,
      body: verifiedCopy.profileBody,
      done: Boolean(business?.logoUrl),
    },
  ];
}

function BusinessVerificationStatusCenterRoute() {
  const openSupport = useOpenSupport();
  const navigation = useFlowNavigation();
  const openActivation = useActivationEntry();
  const { data: status } = useSetupVerificationStatus();
  const business = useSetupBusiness();
  const branches = business?.branches ?? [];
  return (
    <BusinessVerificationStatusCenterScreen
      status={status}
      businessName={business?.name}
      logoUrl={business?.logoUrl}
      branchCount={branches.length}
      branchSummary={
        branches.length ? branches.map(branch => branch.name).join(' & ') : null
      }
      onBack={navigation.goBack}
      onOpenDashboard={openActivation}
      onUpdateVerification={() => navigation.navigate('VerifyYourBusiness')}
      onManageLocations={() => navigation.navigate('BusinessLocations')}
      onHelp={openSupport}
    />
  );
}

/** "₦15,000" for a plan's monthly price. */
function monthlyPriceOf(plan: Plan | undefined): string | undefined {
  return plan ? formatCurrency(plan.monthlyPrice, plan.currency) : undefined;
}

/** The plan to recommend when none was chosen: the popular one, else the first. */
function defaultPlan(plans: Plan[] | undefined): Plan | undefined {
  return plans?.find(plan => plan.isPopular) ?? plans?.[0];
}

/**
 * End of setup: offer the free trial while the business can still take it,
 * otherwise go straight to the business app.
 */
function useActivationEntry() {
  const navigation = useFlowNavigation();
  const openBusinessDashboard = useBusinessDashboardEntry();
  const queryClient = useQueryClient();
  return async () => {
    const subscription = await queryClient
      .fetchQuery({
        queryKey: subscriptionKeys.active(),
        queryFn: () => subscriptionsApi.active(),
        staleTime: 30_000,
      })
      .catch(() => undefined);
    if (trialStageOf(subscription ?? undefined) === 'eligible') {
      navigation.navigate('BusinessPlanTrialOverview');
    } else {
      openBusinessDashboard();
    }
  };
}

function FreeTrialConfirmationRoute() {
  const openSupport = useOpenSupport();
  const navigation = useFlowNavigation();
  const route =
    useRoute<RouteProp<BusinessSetupStackParamList, 'FreeTrialConfirmation'>>();
  const { data: plans } = usePlans();
  const startTrial = useStartTrial();
  const plan =
    plans?.find(item => item.id === route.params?.planId) ?? defaultPlan(plans);
  return (
    <FreeTrialConfirmationScreen
      planName={plan?.name}
      monthlyPrice={monthlyPriceOf(plan)}
      trialDays={plan?.trialDurationDays || undefined}
      starting={startTrial.isPending}
      onBack={navigation.goBack}
      onStartTrial={() => {
        if (!plan) return;
        startTrial.mutate(
          { planId: plan.id },
          {
            onSuccess: () => navigation.replace('TrialActiveStatus'),
            onError: error =>
              showError(
                error instanceof Error ? error.message : 'Could not start your trial.',
              ),
          },
        );
      }}
      onSubscribeInstead={() =>
        navigation.navigate('SubscribeNowPayment', { planId: plan?.id })
      }
      onHelp={openSupport}
    />
  );
}

function BusinessPlanTrialOverviewRoute() {
  const openSupport = useOpenSupport();
  const navigation = useFlowNavigation();
  const plans = usePlans();
  const { data: subscription } = useActiveSubscription();
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  return (
    <BusinessPlanTrialOverviewScreen
      plans={plans.data}
      selectedPlanId={selectedPlanId ?? defaultPlan(plans.data)?.id}
      trialEligible={subscription?.trialEligible ?? false}
      loading={plans.isLoading}
      error={plans.isError}
      onRetry={plans.refetch}
      onSelectPlan={setSelectedPlanId}
      onBack={navigation.goBack}
      onStartTrial={plan =>
        navigation.navigate('FreeTrialConfirmation', { planId: plan.id })
      }
      onSubscribeNow={plan =>
        navigation.navigate('SubscribeNowPayment', { planId: plan.id })
      }
      onViewAddOns={() => navigation.navigate('VemtapAddOns')}
      onHelp={openSupport}
    />
  );
}

function TrialActiveStatusRoute() {
  const openSupport = useOpenSupport();
  const navigation = useFlowNavigation();
  const openBusinessDashboard = useBusinessDashboardEntry();
  const { data: subscription } = useActiveSubscription();
  const { data: plans } = usePlans();
  const plan = plans?.find(item => item.id === subscription?.planId);
  return (
    <TrialActiveStatusScreen
      planName={subscription?.plan?.name ?? plan?.name}
      monthlyPrice={monthlyPriceOf(plan)}
      reference={subscriptionRef(subscription?.id)}
      progress={trialProgress(subscription ?? undefined)}
      features={plan?.features}
      onBack={navigation.goBack}
      onExploreDashboard={openBusinessDashboard}
      onSubscribeNow={() =>
        navigation.navigate('SubscribeNowPayment', { planId: subscription?.planId })
      }
      onHelp={openSupport}
    />
  );
}

function SubscribeNowPaymentRoute() {
  const openSupport = useOpenSupport();
  const navigation = useFlowNavigation();
  const route = useRoute<RouteProp<BusinessSetupStackParamList, 'SubscribeNowPayment'>>();
  const { data: plans } = usePlans();
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly');
  const checkout = useCheckout();
  const plan =
    plans?.find(item => item.id === route.params?.planId) ?? defaultPlan(plans);
  const { data: preview } = usePricePreview(plan?.id, billingPeriod);
  return (
    <SubscribeNowPaymentScreen
      plan={plan}
      billingPeriod={billingPeriod}
      onChangePeriod={setBillingPeriod}
      preview={preview}
      processing={checkout.isPending}
      onBack={navigation.goBack}
      onPay={() => {
        if (!plan) return;
        checkout.mutate(
          { planId: plan.id, billingPeriod },
          {
            onSuccess: ({ outcome, reference }) => {
              if (outcome === 'cancelled') {
                showError('Payment was not completed.');
                return;
              }
              navigation.replace('PaymentSuccessVemtapGrowth', {
                planId: plan.id,
                billingPeriod,
                reference,
                pending: outcome === 'pending',
              });
            },
            onError: error =>
              showError(
                error instanceof Error ? error.message : 'Could not start the payment.',
              ),
          },
        );
      }}
      onViewTerms={openTerms}
      onHelp={openSupport}
    />
  );
}

function PaymentSuccessVemtapGrowthRoute() {
  const openSupport = useOpenSupport();
  const navigation = useFlowNavigation();
  const route =
    useRoute<RouteProp<BusinessSetupStackParamList, 'PaymentSuccessVemtapGrowth'>>();
  const openBusinessDashboard = useBusinessDashboardEntry();
  const { data: subscription } = useActiveSubscription();
  const { data: plans } = usePlans();
  const { data: paymentMethod } = usePaymentMethod();
  const business = useSetupBusiness();
  const { params } = route;
  const plan = plans?.find(item => item.id === (params?.planId ?? subscription?.planId));
  const billingPeriod = params?.billingPeriod ?? 'monthly';
  const active = subscription?.planId === plan?.id && subscription?.status === 'active';
  const card = paymentMethod?.card;
  return (
    <PaymentSuccessVemtapGrowthScreen
      pending={!active && (params?.pending ?? false)}
      planName={plan?.name ?? subscription?.plan?.name ?? ''}
      price={plan ? formatCurrency(planPrice(plan, billingPeriod), plan.currency) : null}
      billingPeriod={billingPeriod}
      reference={params?.reference}
      paidOn={active ? formatDay(subscription?.startDate) : null}
      nextBilling={active ? formatDay(subscription?.endDate) : null}
      cardLabel={
        card?.last4
          ? `${card.brand ? `${card.brand.toUpperCase()} ` : ''}•••• ${card.last4}`
          : null
      }
      features={plan?.features}
      businessName={business?.name}
      logoUrl={business?.logoUrl}
      branchNames={business?.branches?.map(branch => branch.name)}
      onGoToDashboard={openBusinessDashboard}
      onExploreFeatures={() => navigation.navigate('VemtapAddOns')}
      onContactSupport={openSupport}
    />
  );
}

function TrialEndingRenewGrowthRoute() {
  const openSupport = useOpenSupport();
  const navigation = useFlowNavigation();
  const openBusinessDashboard = useBusinessDashboardEntry();
  const { data: subscription } = useActiveSubscription();
  const { data: plans } = usePlans();
  const business = useSetupBusiness();
  const plan = plans?.find(item => item.id === subscription?.planId);
  return (
    <TrialEndingRenewGrowthScreen
      planName={subscription?.plan?.name ?? plan?.name}
      monthlyPrice={monthlyPriceOf(plan)}
      progress={trialProgress(subscription ?? undefined)}
      features={plan?.features}
      businessName={business?.name}
      logoUrl={business?.logoUrl}
      branchNames={business?.branches?.map(branch => branch.name)}
      onBack={navigation.goBack}
      onContinueGrowth={() =>
        navigation.navigate('SubscribeNowPayment', { planId: subscription?.planId })
      }
      onReviewBusiness={openBusinessDashboard}
      onHelp={openSupport}
    />
  );
}

function TrialExpiredReactivateRoute() {
  const openSupport = useOpenSupport();
  const navigation = useFlowNavigation();
  const openBusinessDashboard = useBusinessDashboardEntry();
  const { data: plans } = usePlans();
  const business = useSetupBusiness();
  const plan = defaultPlan(plans);
  return (
    <TrialExpiredReactivateScreen
      planName={plan?.name}
      monthlyPrice={monthlyPriceOf(plan)}
      features={plan?.features}
      branchCount={business?.branches?.length ?? 0}
      onBack={navigation.goBack}
      onActivate={() => navigation.navigate('SubscribeNowPayment', { planId: plan?.id })}
      onViewBusiness={openBusinessDashboard}
      onContactSupport={openSupport}
      onHelp={openSupport}
    />
  );
}

/** "from ₦2,000" for boosts/promotions, "₦1,500 / 250 SMS" for credit bundles. */
function addOnPrices(
  boostMin: number | undefined,
  promotionMin: number | undefined,
  smsPlans: CreditPlan[],
  aiPlans: CreditPlan[],
): Partial<Record<AddOnKey, AddOnPrice>> {
  const prices: Partial<Record<AddOnKey, AddOnPrice>> = {};
  if (boostMin) prices.boost = { price: formatCurrency(boostMin) };
  if (promotionMin) prices.promote = { price: formatCurrency(promotionMin) };
  const [sms] = smsPlans;
  if (sms) {
    prices.sms = {
      price: formatCurrency(sms.price, sms.currency ?? 'NGN'),
      suffix: vemtapAddOnsCopy.perSms(sms.smsAmount.toLocaleString('en-NG')),
    };
  }
  const [ai] = aiPlans;
  if (ai) {
    prices.ai = {
      price: formatCurrency(ai.price, ai.currency ?? 'NGN'),
      suffix: vemtapAddOnsCopy.perAi(ai.aiAmount.toLocaleString('en-NG')),
    };
  }
  return prices;
}

function VemtapAddOnsRoute() {
  const navigation = useFlowNavigation();
  const openSupport = useOpenSupport();
  const openBusinessScreen = useOpenBusinessScreen();
  const hasSession = useAuthStore(selectHasSession);
  const { data: addOns } = useAddons();
  const { data: subscription } = useActiveSubscription();
  const boostOptions = useSponsoredOptions('boost');
  const promotionOptions = useSponsoredOptions('promotion');
  const creditPlans = useCreditPlans(hasSession);
  const buy = useBuyCreditPlan();
  const [channel, setChannel] = useState<CreditChannel | null>(null);
  const [buyingId, setBuyingId] = useState<string | null>(null);

  const smsPlans = plansFor(creditPlans.data, 'sms');
  const aiPlans = plansFor(creditPlans.data, 'ai');
  const unavailable: AddOnKey[] = creditPlans.isSuccess
    ? [
        ...(smsPlans.length ? [] : (['sms'] as const)),
        ...(aiPlans.length ? [] : (['ai'] as const)),
      ]
    : ['sms', 'ai'];

  const select = (key: AddOnKey) => {
    switch (key) {
      case 'boost':
        openBusinessScreen('BusinessMore', 'BoostEngine');
        return;
      case 'promote':
        openBusinessScreen('BusinessMore', 'CampaignsHub');
        return;
      case 'pos':
        openBusinessScreen('BusinessOrders', 'PaymentHardwareSetup');
        return;
      case 'sms':
      case 'ai':
        setChannel(key);
    }
  };

  const buyPlan = (plan: CreditPlan) => {
    setBuyingId(plan.id);
    buy.mutate(plan.id, {
      onSuccess: outcome => {
        if (outcome === 'cancelled') return;
        setChannel(null);
        showSuccess(
          outcome === 'completed'
            ? vemtapAddOnsCopy.purchaseCompleted
            : vemtapAddOnsCopy.purchasePending,
        );
      },
      onError: error =>
        showError(
          error instanceof Error ? error.message : vemtapAddOnsCopy.purchaseFailed,
        ),
      onSettled: () => setBuyingId(null),
    });
  };

  return (
    <>
      <VemtapAddOnsScreen
        planAddOns={addOns}
        currentPlanName={subscription?.plan?.name}
        prices={addOnPrices(
          boostOptions.data?.minBudget,
          promotionOptions.data?.minBudget,
          smsPlans,
          aiPlans,
        )}
        unavailable={unavailable}
        onBack={navigation.goBack}
        onHelp={openSupport}
        onSelectAddOn={select}
      />
      <CreditBundleSheet
        channel={channel}
        plans={channel === 'sms' ? smsPlans : channel === 'ai' ? aiPlans : []}
        buyingId={buyingId}
        onBuy={buyPlan}
        onClose={() => setChannel(null)}
      />
    </>
  );
}

export function BusinessSetupNavigator() {
  return (
    <TypeDensityProvider density="compact">
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="BusinessSetupGate" component={BusinessSetupGateRoute} />
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

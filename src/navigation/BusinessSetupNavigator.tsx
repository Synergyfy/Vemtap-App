import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { useCatalogueDraftStore } from '@store/catalogueDraftStore';
import {
  useBusinessBranches,
  usePublishCatalogueItem,
  usePublishCatalogueOffer,
  useUpdateCatalogueItemStatus,
} from '@features/business/hooks/useCatalogueMutations';
import { businessDashboardApi } from '@api/businessDashboardApi';
import { showError, showSuccess } from '@components/shared';
import { mapLocationDraft } from '@features/business/utils/locationDraftMapper';
import { businessProfileCopy } from '@features/business/businessCopy';
import { logger } from '@utils/logger';
import {
  useRequestManualReview,
  useSubmitUnregisteredBusiness,
  useVerificationStatus,
  verificationKeys,
} from '@features/business/hooks/useVerification';
import { useMyBusiness } from '@features/business/hooks/useBusinessDashboardData';
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
import { youReVerifiedCopy } from '@features/business/verificationCopy';
import type { YouReVerifiedPillar } from '@features/business/screens/YouReVerifiedScreen';
import { useQueryClient } from '@tanstack/react-query';
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
  const { uploadBrandingMedia } =
    await import('@features/business/utils/uploadBusinessMedia');
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

  await businessDashboardApi.updateMyBusiness(updates).catch(error =>
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

    let mounted = true;

    (async () => {
      if (ownerWithoutBusiness && !syncedOwnerDraft.current) {
        syncedOwnerDraft.current = true;
        const store = useBusinessOnboardingStore.getState();
        await syncOwnerDraftToBusiness({
          basic: store.profile.basic,
          branding: store.profile.branding,
          contact: store.profile.contact,
        });
      }

      if (mounted) {
        navigation.navigate('BusinessLocation');
      }
    })();

    return () => {
      mounted = false;
    };
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
  const setService = useCatalogueDraftStore(state => state.setService);
  const publish = usePublishCatalogueItem();
  return (
    <AddServiceBasicsMediaScreen
      onBack={navigation.goBack}
      onNext={value => {
        setService({
          name: value.title,
          description: value.description,
          deliveryMode: value.delivery,
          highlights: value.highlights,
          audience: value.audience,
        });
        navigation.navigate('AddServiceDurationPricing');
      }}
      onSaveDraft={value => {
        setService({
          name: value.title,
          description: value.description,
          deliveryMode: value.delivery,
          highlights: value.highlights,
          audience: value.audience,
        });
        const { service } = useCatalogueDraftStore.getState();
        if (!service.branchIds.length) {
          showError('Select branches first, then save the draft.');
          return;
        }
        publish.mutate(
          { kind: 'service', status: 'inactive' },
          {
            onSuccess: () => {
              showSuccess('Service saved as draft.');
              navigation.navigate('ServicePublished');
            },
            onError: error =>
              showError(
                error instanceof Error ? error.message : 'Could not save the draft.',
              ),
          },
        );
      }}
    />
  );
}

function AddServiceDurationPricingRoute() {
  const navigation = useFlowNavigation();
  const setService = useCatalogueDraftStore(state => state.setService);
  const publish = usePublishCatalogueItem();
  return (
    <AddServiceDurationPricingScreen
      onBack={navigation.goBack}
      onNext={value => {
        setService({
          basePrice: value.basePrice,
          compareAtPrice: value.compareAtPrice,
          duration: value.duration,
          bookingEnabled: value.bookingEnabled,
        });
        navigation.navigate('AddServiceAvailabilityRules');
      }}
      onSaveDraft={value => {
        setService({
          basePrice: value.basePrice,
          compareAtPrice: value.compareAtPrice,
          duration: value.duration,
          bookingEnabled: value.bookingEnabled,
        });
        const { service } = useCatalogueDraftStore.getState();
        if (!service.branchIds.length) {
          showError('Select branches first, then save the draft.');
          return;
        }
        publish.mutate(
          { kind: 'service', status: 'inactive' },
          {
            onSuccess: () => {
              showSuccess('Service saved as draft.');
              navigation.navigate('ServicePublished');
            },
            onError: error =>
              showError(
                error instanceof Error ? error.message : 'Could not save the draft.',
              ),
          },
        );
      }}
    />
  );
}

function AddServiceAvailabilityRulesRoute() {
  const navigation = useFlowNavigation();
  const setService = useCatalogueDraftStore(state => state.setService);
  const publish = usePublishCatalogueItem();
  return (
    <AddServiceAvailabilityRulesScreen
      onBack={navigation.goBack}
      onNext={value => {
        setService({
          branchIds: value.branchIds,
          serviceMode: value.serviceMode,
          isBookable: value.isBookable,
        });
        navigation.navigate('ReviewServiceSummary');
      }}
      onSaveDraft={value => {
        setService({
          branchIds: value.branchIds,
          serviceMode: value.serviceMode,
          isBookable: value.isBookable,
        });
        const { service } = useCatalogueDraftStore.getState();
        if (!service.branchIds.length) {
          showError('Select branches first, then save the draft.');
          return;
        }
        publish.mutate(
          { kind: 'service', status: 'inactive' },
          {
            onSuccess: () => {
              showSuccess('Service saved as draft.');
              navigation.navigate('ServicePublished');
            },
            onError: error =>
              showError(
                error instanceof Error ? error.message : 'Could not save the draft.',
              ),
          },
        );
      }}
    />
  );
}

function ReviewServiceSummaryRoute() {
  const navigation = useFlowNavigation();
  const draft = useCatalogueDraftStore(state => state.service);
  const publish = usePublishCatalogueItem();

  const submit = (status: 'active' | 'inactive') => {
    publish.mutate(
      { kind: 'service', status },
      {
        onSuccess: () => navigation.navigate('ServicePublished'),
        onError: error =>
          showError(
            error instanceof Error ? error.message : 'Could not publish the service',
          ),
      },
    );
  };

  return (
    <ReviewServiceSummaryScreen
      draft={draft}
      publishing={publish.isPending}
      onBack={navigation.goBack}
      onPublish={() => submit('active')}
      onSaveDraft={() => submit('inactive')}
    />
  );
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
      onAddAnother={() => navigation.navigate('AddServiceBasics')}
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

function AddProductLocationPricingRoute() {
  const navigation = useFlowNavigation();
  const setProduct = useCatalogueDraftStore(state => state.setProduct);
  const resetProduct = useCatalogueDraftStore(state => state.resetProduct);
  return (
    <AddProductLocationPricingScreen
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
  return (
    <AddProductBasicsCategoryScreen
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
  return (
    <AddProductPricingVariantsScreen
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
  return (
    <AddProductBranchAvailabilityScreen
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
  return (
    <ProductPublishedOrSavedAsDraftScreen
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
  return (
    <ProductPublishedMakeItADealScreen
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
  const setDeal = useCatalogueDraftStore(state => state.setDeal);
  return (
    <CreateDealStep1DiscountStrategyScreen
      onBack={navigation.goBack}
      onChangeItem={() => navigation.navigate('ProductPublished')}
      onContinue={value => {
        setDeal({
          strategy: value.strategy,
          discountRate: value.discountRate,
        });
        navigation.navigate('CreateDealStep2');
      }}
      onSave={value => {
        setDeal({
          strategy: value.strategy,
          discountRate: value.discountRate,
        });
        navigation.navigate('CreateDealStep2');
      }}
    />
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
  const publish = usePublishCatalogueOffer();
  const branches = useBusinessBranches();

  const submit = (status: 'active' | 'inactive') => {
    const { deal } = useCatalogueDraftStore.getState();
    const allBranchIds = (branches.data ?? []).map(branch => branch.id);
    const branchId = deal.branchIds[0] ?? allBranchIds[0];
    if (!branchId) {
      showError('No branches available for this deal.');
      return;
    }
    publish.mutate(
      { status, branchId },
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
    <CreateDealStep4ReviewLaunchScreen
      onBack={navigation.goBack}
      onEditOffer={() => navigation.navigate('CreateDealStep1')}
      onEditRules={() => navigation.navigate('CreateDealStep2')}
      onEditBranches={() => navigation.navigate('CreateDealStep3')}
      onLaunch={() => submit('active')}
      onSaveDraft={() => submit('inactive')}
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
      onHelp={() => undefined}
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
      onContactSupport={() => undefined}
      onHelp={() => undefined}
    />
  );
}

function YouReVerifiedRoute() {
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
      onPreviewStorefront={() => undefined}
      onHelp={() => undefined}
    />
  );
}

function verifiedPillars(
  status: VerificationStatus | undefined,
  business: MyBusiness | undefined,
): YouReVerifiedPillar[] {
  const copy = youReVerifiedCopy;
  const identity = status?.identity ?? null;
  const check = status?.business ?? null;
  const branches = business?.branches ?? [];
  const operator = displayName(identity?.recordName);
  return [
    {
      icon: 'badge',
      title: copy.identityTitle,
      tag: copy.identityTag,
      body: operator ? `${copy.operatorLead}${operator}` : idTypeLabel(identity?.idType),
      done: identity?.status === 'verified',
    },
    {
      icon: 'domain',
      title: copy.businessTitle,
      tag: check?.idType === 'cac' ? copy.cacTag : copy.reviewedTag,
      body:
        check?.idType === 'cac' && check.maskedId
          ? `${copy.registryLead}${check.maskedId}`
          : copy.reviewedBody,
      done: status?.status === 'verified',
    },
    {
      icon: 'storefront',
      title: copy.locationTitle,
      tag: branches.length ? copy.locationTag : copy.locationMissingTag,
      body: branches.length
        ? `${branches.length}${branches.length === 1 ? copy.branchesOne : copy.branchesMany}`
        : '',
      done: branches.length > 0,
    },
    {
      icon: 'palette',
      title: copy.profileTitle,
      tag: copy.profileTag,
      body: copy.profileBody,
      done: Boolean(business?.logoUrl),
    },
  ];
}

function BusinessVerificationStatusCenterRoute() {
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
      onHelp={() => undefined}
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
      onHelp={() => undefined}
    />
  );
}

function BusinessPlanTrialOverviewRoute() {
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
      onHelp={() => undefined}
    />
  );
}

function TrialActiveStatusRoute() {
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
      onHelp={() => undefined}
    />
  );
}

function SubscribeNowPaymentRoute() {
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
      onViewTerms={() => undefined}
      onHelp={() => undefined}
    />
  );
}

function PaymentSuccessVemtapGrowthRoute() {
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
      onContactSupport={() => undefined}
    />
  );
}

function TrialEndingRenewGrowthRoute() {
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
      onHelp={() => undefined}
    />
  );
}

function TrialExpiredReactivateRoute() {
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
      onContactSupport={() => undefined}
      onHelp={() => undefined}
    />
  );
}

function VemtapAddOnsRoute() {
  const navigation = useFlowNavigation();
  const { data: addOns } = useAddons();
  const { data: subscription } = useActiveSubscription();
  return (
    <VemtapAddOnsScreen
      planAddOns={addOns}
      currentPlanName={subscription?.plan?.name}
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

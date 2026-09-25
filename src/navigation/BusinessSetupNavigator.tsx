import React from 'react';
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
  BusinessIntroductionScreen,
  BusinessLocationsMultiBranchScreen,
  BusinessProfileBasicInfoScreen,
  BusinessProfileBrandingScreen,
  BusinessProfileContactChannelsScreen,
  CreateDealOfferAutoImportedScreen,
  CreateDealStep2LimitsGiftingRulesScreen,
  CreateDealStep3ParticipatingBranchesScheduleScreen,
  ProductPublishedMakeItADealScreen,
  ProductPublishedOrSavedAsDraftScreen,
  ReviewProductSummaryScreen,
  ReviewServiceSummaryScreen,
  ServicePublishedStatusScreen,
  WhereIsYourBusinessLocatedScreen,
  YourVemtapBusinessQrIsReadyScreen,
} from '@features/business';
import type { BusinessSetupStackParamList } from '@navigation/types';

const Stack = createNativeStackNavigator<BusinessSetupStackParamList>();
type FlowNavigation = NativeStackNavigationProp<BusinessSetupStackParamList>;

function useFlowNavigation() {
  return useNavigation<FlowNavigation>();
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
  return (
    <BusinessProfileBasicInfoScreen
      onBack={navigation.goBack}
      onContinue={() => navigation.navigate('BusinessProfileBranding')}
      onSaveDraft={() => undefined}
    />
  );
}

function BusinessProfileBrandingRoute() {
  const navigation = useFlowNavigation();
  return (
    <BusinessProfileBrandingScreen
      onBack={navigation.goBack}
      onContinue={() => navigation.navigate('BusinessProfileContactChannels')}
      onSaveDraft={() => undefined}
    />
  );
}

function BusinessProfileContactChannelsRoute() {
  const navigation = useFlowNavigation();
  return (
    <BusinessProfileContactChannelsScreen
      onBack={navigation.goBack}
      onComplete={() => navigation.navigate('BusinessLocation')}
      onSaveDraft={() => undefined}
    />
  );
}

function BusinessLocationRoute() {
  const navigation = useFlowNavigation();
  return (
    <WhereIsYourBusinessLocatedScreen
      onBack={navigation.goBack}
      onContinue={() => navigation.navigate('BusinessLocations')}
      onSaveDraft={() => undefined}
    />
  );
}

function BusinessLocationsRoute() {
  const navigation = useFlowNavigation();
  return (
    <BusinessLocationsMultiBranchScreen
      onBack={navigation.goBack}
      onContinue={() => navigation.navigate('AddProductsOrServices')}
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
      onPublish={() => navigation.navigate('CreateDealStep2')}
      onCancel={() => navigation.navigate('ProductPublished')}
      onSaveDraft={() => navigation.navigate('ProductPublished')}
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
      onSave={() => navigation.navigate('BusinessQrReady')}
    />
  );
}

function BusinessQrReadyRoute() {
  const navigation = useFlowNavigation();
  return (
    <YourVemtapBusinessQrIsReadyScreen
      onBack={navigation.goBack}
      onShare={() => undefined}
      onSupport={() => undefined}
      onOrderKits={() => undefined}
      onPresentFullscreen={() => undefined}
      onDownloadKit={() => undefined}
      onCopyLink={() => undefined}
      onContinue={() => undefined}
    />
  );
}

export function BusinessSetupNavigator() {
  return (
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
      <Stack.Screen name="BusinessLocation" component={BusinessLocationRoute} />
      <Stack.Screen name="BusinessLocations" component={BusinessLocationsRoute} />
      <Stack.Screen name="AddBranchLocation" component={AddBranchLocationRoute} />
      <Stack.Screen name="AddProductsOrServices" component={AddProductsOrServicesRoute} />
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
      <Stack.Screen name="CreateDealStep2" component={CreateDealStep2Route} />
      <Stack.Screen name="CreateDealStep3" component={CreateDealStep3Route} />
      <Stack.Screen name="BusinessQrReady" component={BusinessQrReadyRoute} />
    </Stack.Navigator>
  );
}

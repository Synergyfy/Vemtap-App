import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { BusinessProfileDraft } from '@features/business/utils/ownerRegistrationMapper';
import type { BranchSummary } from '@features/business/businessData';
import type { BusinessBasicInfoValue } from '@features/business/screens/BusinessProfileBasicInfoScreen';
import type { BusinessBrandingValue } from '@features/business/screens/BusinessProfileBrandingScreen';
import type { BusinessContactChannelsValue } from '@features/business/screens/BusinessProfileContactChannelsScreen';
import type { BusinessLocationsValue } from '@features/business/screens/BusinessLocationsMultiBranchScreen';

/**
 * Business onboarding draft.
 *
 * The setup screens are a wizard driven entirely by `navigation.navigate`, so
 * before this store every screen's values died on the next push — which is why
 * `ownerAuthApi` and `useOwnerRegistration` were never called: there was nothing
 * left to submit. Screens still own their inputs (and their designs); this store
 * is the hand-off point the navigator writes to on each `onContinue`.
 *
 * Shape is kept deliberately compatible with `BusinessProfileDraft` so
 * `mapDraftToOwnerRegistration` can consume it unchanged.
 */

export type BusinessLocationDraft = BusinessProfileDraft['location'];

export interface BusinessOnboardingProfile {
  basic: BusinessBasicInfoValue;
  branding: BusinessBrandingValue & {
    /** Remote URL once uploaded; `register/owner` takes `businessLogo`. */
    logoUrl?: string;
    coverUri?: string;
  };
  contact: BusinessContactChannelsValue & {
    whatsappNumber?: string;
    socials?: Record<string, string>;
  };
  location: BusinessLocationDraft;
  branches: BranchSummary[];
  multiLocation: boolean;
}

export interface BusinessOnboardingCredentials {
  email?: string;
  password?: string;
  /** Email whose OTP the API has already accepted. */
  otpVerifiedFor?: string;
}

export interface BusinessOnboardingState {
  credentials: BusinessOnboardingCredentials;
  profile: BusinessOnboardingProfile;
  /** Incremented on every draft write; used to detect a stale rehydrate. */
  revision: number;

  setBasicInfo: (value: BusinessBasicInfoValue) => void;
  setBranding: (
    value: BusinessBrandingValue & { logoUrl?: string; coverUri?: string },
  ) => void;
  setContactChannels: (value: BusinessContactChannelsValue) => void;
  setLocation: (value: BusinessLocationDraft) => void;
  setBranches: (value: BusinessLocationsValue) => void;
  setCredentials: (value: Partial<BusinessOnboardingCredentials>) => void;
  markOtpVerified: (email: string) => void;

  /** Clears everything once registration has succeeded. */
  reset: () => void;
}

const emptyBasic: BusinessBasicInfoValue = {
  name: '',
  category: '',
  specialties: [],
  description: '',
};

const emptyContact: BusinessContactChannelsValue = {
  phone: '',
  email: '',
  website: '',
  presences: [],
  allowInAppChat: true,
  whatsappAlerts: true,
};

const emptyLocation: BusinessLocationDraft = {
  address: '',
  state: '',
  city: '',
  latitude: 0,
  longitude: 0,
};

const initialState = {
  credentials: {} as BusinessOnboardingCredentials,
  profile: {
    basic: emptyBasic,
    branding: {
      logoChanged: false,
      logoRemoved: false,
      coverReplaced: false,
      galleryUris: [],
    },
    contact: emptyContact,
    location: emptyLocation,
    branches: [] as BranchSummary[],
    multiLocation: false,
  } as BusinessOnboardingProfile,
  revision: 0,
};

export const useBusinessOnboardingStore = create<BusinessOnboardingState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setBasicInfo: value =>
        set(state => ({
          profile: { ...state.profile, basic: value },
          revision: state.revision + 1,
        })),

      setBranding: value =>
        set(state => ({
          profile: {
            ...state.profile,
            branding: { ...state.profile.branding, ...value },
          },
          revision: state.revision + 1,
        })),

      setContactChannels: value =>
        set(state => ({
          profile: { ...state.profile, contact: value },
          // The contact email is the one the owner signs up with, so keep the
          // credentials in step with it.
          credentials: state.credentials.email
            ? state.credentials
            : { ...state.credentials, email: value.email || undefined },
          revision: state.revision + 1,
        })),

      setLocation: value =>
        set(state => ({
          profile: { ...state.profile, location: value },
          revision: state.revision + 1,
        })),

      setBranches: value =>
        set(state => ({
          profile: {
            ...state.profile,
            branches: value.branches,
            multiLocation: value.multiLocation,
          },
          revision: state.revision + 1,
        })),

      setCredentials: value =>
        set(state => ({
          credentials: { ...state.credentials, ...value },
          revision: state.revision + 1,
        })),

      markOtpVerified: email =>
        set(state => ({
          credentials: { ...state.credentials, otpVerifiedFor: email },
          revision: state.revision + 1,
        })),

      reset: () => set({ ...initialState, revision: get().revision + 1 }),
    }),
    {
      name: 'vemtap-business-onboarding',
      storage: createJSONStorage(() => AsyncStorage),
      // Only the draft persists — `revision` is runtime bookkeeping.
      partialize: state => ({
        credentials: state.credentials,
        profile: state.profile,
        revision: state.revision,
      }),
      // A draft older than a week is a stale artefact, not a resumable signup.
      version: 1,
    },
  ),
);

/**
 * Adapts the stored profile to the shape `mapDraftToOwnerRegistration` expects,
 * so the mapper stays unaware of the store.
 */
export function selectRegistrationDraft(
  state: BusinessOnboardingState,
): BusinessProfileDraft {
  const { basic, branding, contact, location } = state.profile;
  const category =
    basic.categoryId && basic.category
      ? {
          categoryId: basic.categoryId,
          categoryName: basic.category,
          subcategoryId: basic.subcategoryId,
          subcategoryName: basic.specialties[0],
          otherSubcategoryName: basic.otherSubcategoryName,
        }
      : undefined;

  return {
    basic: {
      name: basic.name,
      category: basic.category,
      specialties: basic.specialties,
      description: basic.description,
    },
    branding: {
      logoUrl: branding.logoUrl,
      specialtyNames: basic.specialties,
    },
    contact: {
      email: contact.email,
      whatsappNumber: contact.whatsappNumber ?? contact.phone,
      website: contact.website,
      socials: contact.socials,
    },
    location,
    category,
  };
}

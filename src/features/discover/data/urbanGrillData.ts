import { strings } from '@constants/strings';
import { businesses } from '@features/discover/data/discoverData';

export type UrbanCategory = 'all' | 'grill' | 'burgers' | 'fusion' | 'drinks';

export interface UrbanProduct {
  id: string;
  name: string;
  menuName?: string;
  description: string;
  category: Exclude<UrbanCategory, 'all'>;
  price: number;
  originalPrice?: number;
  imageUri: string;
  imageAlt: string;
  rating?: string;
  reviewCount?: number;
  badge?: string;
  discount?: string;
}

export interface UrbanDeal {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice: number;
  imageUri: string;
  imageAlt: string;
  discount: string;
  badge: string;
  timing: string;
  save: string;
}

const coverUri = businesses[0].imageUri;
const coverAlt = strings.urbanProfile.coverImageAlt;
const steakUri =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAeuBPQ9PDF8HJFqZbU7ZYnHtjReICQYCqWxquCZyA0eA29B75GOQjW2BsIX0p8sRTtfDpLi2hdMoi1Q-PboaBSK8_kfNzQx_F8UZAlwQZlkA4eV28w2avSNLD6KbfgdY-QCDT1tBT_Qxh-3VGysgkxM6f4Wlw8yUhWzadnR09csO0qx6RussnGks0c08-DOMezCCZb1nnAYH3RSHZaVhB3v4hUf-B60k8CS4uaFPz27Fg5bk2UZNyc2Q';
const burgerUri =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAbQLg7pUC0q7pmZdwCiuxOAwH4HyQ0lVrpIS-biAhHk9By-zENlS6bScexTjgHqLZExsaQdvdJJ-hhegzvdTcUNKyd_U02YLNeHAzgqhsGee7XXkTEuKhnbLEowcdAHTmJrb3ATIAxCFo_AADwtAi0BtUGSXgNTNrDOwUcOlHJ05WvLpcFFFiF1XUuDGXw3AAuUG4jVqUpGXPqRP8sKGfnEAgKFNQV2bAqHvXj4O-V_RO_40CWF7idlw';
const ribsUri =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCfhTpIhWJUDxq5cVoxFpaGPEkQlKdC4Tqjj0smOij4ftrAa3vLFDOoLoNxEDibwSk6Nn5zUH6X58GuK-CmtPTEoE9255Bt-c2zFvQX6G0ARBhGuL3euNEoZrcTNatgkzKinwGf_v-G0V2zHwv0AcRS732xDajA-TQSucVAxQNRw0J5NuVBDmTqkRQNqrVKm2BzcAL_pV-eKOVLMOsyC89LWZqy4d_0hyuZIV0tqvgotWQA6RNfn20LjQ';
const suyaUri =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuA-ONaECl1Mo7tlAksq4ggHbFX-Cs8m5kw_KTjwO4mnWuPgGqyOJjgJWRJ_W1wPVOIKJgGkZeKSyIHwhaZ7BVnTP3mLVoX5G5p3F9E4w';
const jollofUri =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuD--ZrQ9BPR-v4wCL1Q7uE2AYVX8zeC94AyAbdZ5dJNB8wYutSK0oiFb7czFgChdfecIezofI-5oX7kM7etRYN7SDIeQARX5XfbL3AZTQZ6ZLwk3Rzt2Vazwgan4HaW7LbckOQ4m7ELh0dU3Meoi608Wqth34VcjQCTtXOZMAu9obryFseo4LHxj4OkEwHcYfrU3nD97UXttOSd-UtNtIReIvE01ATU6KfcUv5yYqtn1Z53JKncC2NxJw';
const wedgesUri =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBZBLI62hH7PvPzp7VpQGgwpg7LfdxmAi3qRvFrmVCxcHj8AvVUGqDXZvI7PviGqK-rLyerMNO6nPrR1aP1TuRZIUGkX0o2kZcBW-vr_62JdqiI2aF51a2vbrseOvdSIA6Rh-N3l1TxCpZxmxzJgwoAV4waad1cXYLz2aJ57hjcqXYpTRM7GiPw4r';
const zoboUri =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCSUhaEcxymfFmuB0GifzM_C9g0_L_zJHUWxkCvps48vopZC-LcKg68tojM6ZEC8lgym_UNs0MWz1UEP7MBFoz3mU3CK1qO_fHgbvpSZzj1Y6begDEaT_tu6H8EeOioVkXVVcH2WSEyxfzVjzOE-uu3dt5m0S83wo9Cou8gyxX1JDbW2ehOrgTPUW4dfVggbbCgcvtlEi0758iOY1HHlF_0LXV1U1zMHr1m4CgJoqqSbH2xqYRgYstdrA';
const chapmanUri =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBsU3SvD-Btxvj1DEhn03rh0KfnGRHZZr0bl7uK54A2wsa9n1nRxXp3PwbzEjYa0emOV5-a-ESYrqS4137Rjqgop_oxSWZoBAx-TxSslqPzjDouJrA48SfopnAz4ZWWSSh6P3Z6vd-6FVycagcwUCMNg6LT78zLSlVM-vBhu8oFXMeqdddMTcQLDnPi0YP2av4vI0M-KoNZxB9Ni9OBMGzLrJb4K5wYCBqBS-1Q9fHQnqtc3I3kDs0WLQ';

const productImages = [
  steakUri,
  burgerUri,
  ribsUri,
  suyaUri,
  jollofUri,
  wedgesUri,
  zoboUri,
  chapmanUri,
  burgerUri,
  jollofUri,
] as const;
export const urbanProducts: readonly UrbanProduct[] = strings.urbanProducts.items.map(
  (item, index) => ({
    ...item,
    menuName: strings.urbanMenu.productNames[index],
    imageUri: productImages[index],
  }),
);

export const urbanProfileDeals: readonly UrbanDeal[] =
  strings.urbanDeals.merchantDeals.map((deal, index) => ({
    ...deal,
    imageUri: [steakUri, ribsUri, burgerUri][index],
    timing: deal.timing ?? '',
    save: deal.save ?? '',
  }));
export const urbanNearbyDeals: readonly UrbanDeal[] = strings.urbanDeals.nearbyDeals.map(
  (deal, index) => ({
    ...deal,
    imageUri: [coverUri, steakUri, coverUri][index],
    timing: '',
    save: '',
  }),
);

export const urbanReviews = [
  {
    ...strings.urbanProfile.reviewers[0],
    meta: strings.urbanProfile.aminaMeta,
    review: strings.urbanProfile.aminaReview,
  },
  {
    ...strings.urbanProfile.reviewers[1],
    meta: strings.urbanProfile.chidiMeta,
    review: strings.urbanProfile.chidiReview,
  },
] as const;

export const urbanHours = [
  {
    day: strings.urbanProfile.mondayFriday,
    hours: strings.urbanProfile.mondayFridayHours,
  },
  {
    day: strings.urbanProfile.saturdaySunday,
    hours: strings.urbanProfile.saturdaySundayHours,
  },
] as const;

export const urbanCover = { uri: coverUri, alt: coverAlt };
export const urbanMapRegion = {
  latitude: 9.0765,
  longitude: 7.3986,
  latitudeDelta: 0.012,
  longitudeDelta: 0.012,
} as const;
export const formatNaira = (value: number): string => `₦${value.toLocaleString()}`;

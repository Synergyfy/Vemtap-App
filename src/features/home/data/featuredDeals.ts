import type { ImageSourcePropType } from 'react-native';

const imgUrbanGrill = require('../../../../assets/images/saved-urban-grill.jpg');
const imgSoleDistrict = require('../../../../assets/images/deal-sole-district.jpg');
const imgGlowSalon = require('../../../../assets/images/deal-glow-salon.jpg');
const imgBistroGrill = require('../../../../assets/images/deal-bistro-burger.jpg');
const imgArtisanCafe = require('../../../../assets/images/deal-artisan-cafe.jpg');

export type FeaturedUrgencyIcon = 'schedule' | 'bolt' | 'trendingUp' | 'timer' | 'bakery';

export type FeaturedListing = {
  id: string;
  /** Hero artwork — the design leads every card with a 176pt image. */
  image: ImageSourcePropType;
  /** Discount badge, e.g. `20% OFF`. */
  discount: string;
  /** Sponsorship label, e.g. `Promoted` / `Sponsored`. */
  promotion: string;
  distance: string;
  place: string;
  urgency: string;
  urgencyIcon: FeaturedUrgencyIcon;
  merchant: string;
  rating: string;
  title: string;
  body: string;
  priceWas: string;
  price: string;
  save: string;
};

/**
 * `stitch_vemtap_mobile_app_design/featured_deals/code.html` — the promoted
 * listing set shown by the "See All" target of the Home Featured Deals section.
 * Fictional merchants and imagery-free cards, per AGENTS rule 6.
 */
export const featuredListings: readonly FeaturedListing[] = [
  {
    id: 'prime-lunch-combo',
    image: imgUrbanGrill,
    discount: '20% OFF',
    promotion: 'Promoted',
    distance: '0.4 km',
    place: 'Apo Boulevard',
    urgency: 'Expires in 4h',
    urgencyIcon: 'schedule',
    merchant: 'Urban Grill & Bistro',
    rating: '4.9',
    title: '20% Off Prime Lunch Combo & Craft Beverage',
    body: 'Signature flame-grilled cut with seasoned sides, cold pressed house soda or craft iced tea.',
    priceWas: '\u20a612,000',
    price: '\u20a69,600',
    save: 'Save \u20a62,400',
  },
  {
    id: 'weekend-sneaker-drop',
    image: imgSoleDistrict,
    discount: '30% OFF',
    promotion: 'Sponsored',
    distance: '1.2 km',
    place: 'Area 11',
    urgency: 'Limited 15 Left',
    urgencyIcon: 'bolt',
    merchant: 'Sole District Boutique',
    rating: '4.8',
    title: 'Weekend Sneaker Drop & Urban Streetwear Pass',
    body: 'Valid across high-top designer sneakers, oversized graphic hoodies, and fresh cargo caps.',
    priceWas: '\u20a640,000',
    price: '\u20a628,000',
    save: 'Save \u20a612,000',
  },
  {
    id: 'weekend-glow-facial',
    image: imgGlowSalon,
    discount: '25% OFF',
    promotion: 'Promoted',
    distance: '1.4 km',
    place: 'Maitama Heights',
    urgency: 'Popular',
    urgencyIcon: 'trendingUp',
    merchant: 'Glow & Serenity Spa & Salon',
    rating: '5.0',
    title: 'Weekend Glow Facial & Sauna Therapy Pass',
    body: 'Full 75-minute hydration peel, deep facial mask, steam sauna, and complimentary herbal detox infusion.',
    priceWas: '\u20a625,000',
    price: '\u20a618,500',
    save: 'Save \u20a66,500',
  },
  {
    id: 'sunsets-tasting-menu',
    image: imgBistroGrill,
    discount: '50% OFF',
    promotion: 'Sponsored',
    distance: '2.1 km',
    place: 'Central District',
    urgency: 'Ends Tonight',
    urgencyIcon: 'timer',
    merchant: 'The Sky Lounge & Grill',
    rating: '4.9',
    title: "Chef's 5-Course Sunset Tasting Menu for Two",
    body: 'Handcrafted seasonal courses including braised beef short ribs, grilled king prawns, and chocolate souffle.',
    priceWas: '\u20a649,000',
    price: '\u20a624,500',
    save: 'Save \u20a624,500',
  },
  {
    id: 'sourdough-breakfast',
    image: imgArtisanCafe,
    discount: '30% OFF',
    promotion: 'Promoted',
    distance: '2.8 km',
    place: 'Garki II',
    urgency: 'Breakfast Only',
    urgencyIcon: 'bakery',
    merchant: 'Artisan Bakery & Cafe',
    rating: '4.7',
    title: 'Artisanal Sourdough & Specialty Breakfast Combo',
    body: 'Warm sourdough basket, avocado mash, poached free-range eggs, and double shot flat white.',
    priceWas: '\u20a66,500',
    price: '\u20a64,500',
    save: 'Save \u20a62,000',
  },
];

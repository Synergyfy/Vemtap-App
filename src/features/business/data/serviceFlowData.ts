export const serviceDeliveryOptions = [
  {
    id: 'in-salon',
    title: 'In-Salon / Studio',
    description: 'Client visits your physical location',
    icon: 'storefront',
  },
  {
    id: 'mobile',
    title: 'At-Home / Mobile',
    description: 'You or team travel directly to client',
    icon: 'mobileService',
  },
  {
    id: 'both',
    title: 'Both Options',
    description: 'Offer on-site and remote home services',
    icon: 'deliveryOptions',
  },
] as const;

export const serviceHighlightOptions = [
  'Sensitive Skin Safe',
  'Organic Botanicals',
  'Steam Extraction Included',
  'Aftercare Serum Sample',
] as const;

export const serviceDurations = [
  '30 mins',
  '45 mins',
  '60 mins',
  '90 mins',
  '120 mins',
] as const;

export const serviceWeekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

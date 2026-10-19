/**
 * The deal page's view model, built from a live offer by `liveDealMapper`.
 * Bundled demo deals are gone: every deal id is a real offer uuid.
 */
export type ResolvedDeal = {
  id: string;
  image: { uri: string };
  /** Every photo of the deal (main first); more than one makes the hero swipeable. */
  images: { uri: string }[];
  merchant: string;
  location: string;
  title: string;
  price: string;
  priceWas: string;
  save: string;
  badge: string;
  distance: string;
  description: string;
  address: string;
  likes: number;
  comments: number;

  /**
   * Countdown to the offer's real end date. Undefined means "unknown" and the
   * page omits the row — the screen used to render a hardcoded "Ends in 3 days"
   * for every offer, which is a claim the API never made.
   */
  endsIn?: string;
  /**
   * The merchant's 9-character code, which is how a real offer links to a real
   * business profile (`GET /public/businesses/code/:code`). Absent for the
   * fictional seed deals.
   */
  businessCode?: string;
  /** Whether the API reports the merchant verified. Undefined = not reported. */
  isVerifiedBusiness?: boolean;
  /**
   * The merchant's coordinates, when the payload reports them. Drives the
   * Location & Hours map; absent means the screen keeps its demo region
   * instead of placing a pin it cannot justify.
   */
  coordinates?: { latitude: number; longitude: number };
  /**
   * The merchant-authored terms (`offer.terms`). Absent when the offer has
   * none — never an empty claim rendered as content.
   */
  terms?: string[];
  /** The raw ISO end date, for screens that word their own validity copy. */
  endDate?: string;
  /** How many times one customer may claim it; absent when unlimited. */
  perCustomerLimit?: number;
};

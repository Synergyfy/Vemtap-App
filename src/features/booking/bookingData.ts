/**
 * The booking fixtures that used to live here — a hardcoded October 2024 date
 * strip, a fixed `1:15` grid, three addons and a specialist roster — were
 * deleted with the screens that rendered them.
 *
 * `CreateBookingDto` has no `addons` or `therapistId` field, so a picker over
 * them could only ever collect a choice the API silently drops, and no staff
 * endpoint exists to resolve a specialist anyway. Slots now come from
 * `GET /bookings/availability`, dates from `buildDateStrip`, and the service
 * from `GET /public/catalogue/items/:id`.
 */
export const formatBookingNaira = (amount: number) =>
  `₦${amount.toLocaleString('en-US')}`;

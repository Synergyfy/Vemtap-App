import type { OwnerRegistrationPayload } from '@features/business/utils/ownerRegistrationMapper';

/**
 * The setup wizard collects the profile before (and around) registration, so the
 * draft often carries untouched defaults — empty strings, zeroed placeholder
 * coordinates and scheme-less URLs. The API validates strictly
 * (`@IsEmail`, `@IsUrl`, `@IsUUID`), so prune before submitting.
 */
export function pruneRegistrationPayload(
  payload: OwnerRegistrationPayload,
): OwnerRegistrationPayload {
  const out: Record<string, unknown> = {};

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (typeof value === 'string' && value.trim() === '') return;
    out[key] = typeof value === 'string' ? value.trim() : value;
  });

  // Location is collected *after* registration in this flow; never ship the
  // zeroed placeholder coordinates or a partial address.
  if (!out.businessAddress) {
    delete out.state;
    delete out.city;
    delete out.latitude;
    delete out.longitude;
  }

  // `@IsUrl()` rejects "example.com"; normalise to a scheme-ful URL.
  const website = out.businessWebsite;
  if (typeof website === 'string' && !/^https?:\/\//i.test(website)) {
    out.businessWebsite = `https://${website}`;
  }

  return out as OwnerRegistrationPayload;
}

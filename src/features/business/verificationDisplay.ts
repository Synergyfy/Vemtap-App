import type { IdentityIdType, VerificationCheck } from '@api/verificationApi';

/** Labels for the identity documents bytID can check. */
export const ID_TYPE_LABELS: Record<IdentityIdType, string> = {
  nin: 'National ID (NIN)',
  drivers_license: "Driver's Licence",
  voters_card: "Voter's Card",
  passport: 'International Passport',
};

export function idTypeLabel(idType: string | null | undefined): string {
  return ID_TYPE_LABELS[idType as IdentityIdType] ?? 'Government ID';
}

/** "Oct 18, 2026 at 10:45 AM", or null when there is no date. */
export function formatVerifiedAt(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  const day = date.toLocaleDateString('en-NG', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const time = date.toLocaleTimeString('en-NG', { hour: 'numeric', minute: '2-digit' });
  return `${day} at ${time}`;
}

/** "Oct 18, 2026", or null when there is no date. */
export function formatDay(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('en-NG', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/** Title-cases a registry name ("ADAEZE TEST OKAFOR" → "Adaeze Test Okafor"). */
export function displayName(name: string | null | undefined): string | null {
  if (!name) return null;
  return name
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map(part => part[0].toUpperCase() + part.slice(1))
    .join(' ');
}

/** A short line describing a check, e.g. "NIN •••••••8901". */
export function checkSummary(check: VerificationCheck | null): string | null {
  if (!check) return null;
  if (check.kind === 'business') {
    return check.maskedId ? `CAC ${check.maskedId}` : 'Business details submitted';
  }
  const label = idTypeLabel(check.idType);
  return check.maskedId ? `${label} ${check.maskedId}` : label;
}

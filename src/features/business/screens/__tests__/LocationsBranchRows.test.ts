import { branchToLocationRow } from '@features/business/screens/LocationsBranchesScreen';
import { createBranchInput, updateBranchInput } from '@api/branchApi';
import type { ProfileBranch } from '@api/businessProfileApi';

/**
 * `branchToLocationRow` decides what a location card claims about a branch, so
 * the two cases that can lie are pinned here: an omitted `isActive` must not
 * read as paused (the column is nullish on the wire), and a paused branch must
 * not keep a call button with no number behind it.
 */

function branch(overrides: Partial<ProfileBranch> = {}): ProfileBranch {
  return {
    id: 'branch-1',
    name: 'Wuse Branch',
    uniqueCode: 'ABC123XYZ',
    username: 'wuse',
    address: 'Plot 12 Adetokunbo Ademola Crescent',
    state: 'FCT',
    city: 'Abuja',
    latitude: null,
    longitude: null,
    phone: '+2348032198831',
    isActive: true,
    isMainBranch: false,
    logoUrl: null,
    about: null,
    businessId: 'business-1',
    ...overrides,
  };
}

describe('branchToLocationRow', () => {
  it('maps identity and contact fields onto the card row', () => {
    const row = branchToLocationRow(branch());

    expect(row.id).toBe('branch-1');
    expect(row.name).toBe('Wuse Branch');
    expect(row.address).toBe('Plot 12 Adetokunbo Ademola Crescent');
    expect(row.phone).toBe('+2348032198831');
    expect(row.cluster).toBe('Abuja • FCT');
  });

  it('treats an omitted isActive as still trading', () => {
    // `profileBranchSchema` marks isActive nullish, so a payload that simply
    // leaves it out must not be presented as a paused location.
    expect(branchToLocationRow(branch({ isActive: undefined })).active).toBe(true);
    expect(branchToLocationRow(branch({ isActive: null })).active).toBe(true);
    expect(branchToLocationRow(branch({ isActive: false })).active).toBe(false);
  });

  it('marks only an explicit false as inactive, with a notice', () => {
    expect(branchToLocationRow(branch({ isActive: false })).status).toBe(
      'Inactive / Paused',
    );
    expect(branchToLocationRow(branch({ isActive: false })).notice).toContain('paused');
    // An active location needs no explanation, so it gets none.
    expect(branchToLocationRow(branch()).notice).toBeUndefined();
  });

  it('labels the main branch as the flagship and others by their code', () => {
    expect(branchToLocationRow(branch({ isMainBranch: true })).tag).toBe(
      'Flagship Branch',
    );
    expect(branchToLocationRow(branch({ uniqueCode: 'XYZ789ABC' })).tag).toBe(
      'XYZ789ABC',
    );
    // No code at all still needs a label rather than an empty pill.
    expect(branchToLocationRow(branch({ uniqueCode: null })).tag).toBe('Branch');
  });

  it('never leaves a call button pointing at a missing number', () => {
    expect(branchToLocationRow(branch({ phone: null })).phone).toBeUndefined();
  });

  it('falls back to a placeholder address instead of a blank card', () => {
    expect(branchToLocationRow(branch({ address: null })).address).toBe(
      'Address not set',
    );
  });

  it('omits the catalogue pills, which the branch payload does not carry', () => {
    const row = branchToLocationRow(branch());
    expect(row.products).toBeUndefined();
    expect(row.services).toBeUndefined();
    expect(row.deals).toBeUndefined();
  });
});

describe('branch payloads', () => {
  it('requires a name when creating', () => {
    expect(createBranchInput.safeParse({ name: 'Wuse' }).success).toBe(true);
    expect(createBranchInput.safeParse({ name: '  ' }).success).toBe(false);
    expect(createBranchInput.safeParse({}).success).toBe(false);
  });

  it('accepts a reactivate and rejects an out-of-range latitude', () => {
    expect(updateBranchInput.safeParse({ isActive: true }).success).toBe(true);
    expect(updateBranchInput.safeParse({ latitude: 91 }).success).toBe(false);
    expect(updateBranchInput.safeParse({ longitude: -181 }).success).toBe(false);
  });
});

import { useCallback, useMemo } from 'react';
import { useAuthStore } from '@store/authStore';
import { strings } from '@constants/strings';
import {
  toBranchList,
  useMyBusiness,
} from '@features/business/hooks/useBusinessDashboardData';
import type { BusinessBranch } from '@features/business/components/BusinessBranchSwitcher';

export interface ActiveBranchState {
  /** Live branches when the API answered, designed list while offline. */
  branches: readonly BusinessBranch[];
  activeBranchId: string | null;
  setActiveBranch: (branchId: string) => void;
  /** True when the list came from `GET /businesses/my-business`. */
  isLive: boolean;
}

/**
 * One active branch for every business surface. The selection is persisted in
 * the auth store so Overview, Orders and More can never disagree, and it
 * defaults to the main branch until the user picks another.
 */
export function useActiveBranch(): ActiveBranchState {
  const storedBranchId = useAuthStore(state => state.activeBranchId);
  const persist = useAuthStore(state => state.setActiveBranch);
  const myBusiness = useMyBusiness();

  const liveBranches = useMemo(() => toBranchList(myBusiness.data), [myBusiness.data]);
  const isLive = liveBranches.length > 0;
  const branches = isLive ? liveBranches : strings.businessBranchSwitcher.branches;

  const activeBranchId = useMemo(() => {
    if (storedBranchId && branches.some(branch => branch.id === storedBranchId)) {
      return storedBranchId;
    }
    const main = liveBranches.find(branch => branch.active) ?? branches[0];
    return main?.id ?? null;
  }, [branches, liveBranches, storedBranchId]);

  const setActiveBranch = useCallback((branchId: string) => persist(branchId), [persist]);

  return { branches, activeBranchId, setActiveBranch, isLive };
}

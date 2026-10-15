import { showError, showSuccess } from '@components/shared';
import { strings } from '@constants/strings';
import { useCatalogueDraftStore } from '@store/catalogueDraftStore';
import {
  useBusinessBranches,
  usePublishCatalogueOffer,
  useSaveDealEdit,
} from '@features/business/hooks/useCatalogueMutations';
import {
  dealDraftToReview,
  type DealReviewView,
} from '@features/business/utils/dealPresentation';

const copy = strings.businessCreateDeal.step4;

/** Driven by the real request: "Published" only shows once the API agreed. */
export type DealLaunchPhase = 'idle' | 'publishing' | 'published';

export interface DealReviewLaunch {
  review: DealReviewView;
  isEditing: boolean;
  phase: DealLaunchPhase;
  /** A request is in flight; both footer actions are blocked. */
  isBusy: boolean;
  launch: () => void;
  saveDraft: () => void;
}

/**
 * Step 4 of the deal wizard, shared by the Business-hub and setup-flow
 * navigators so the two cannot drift: builds the live review from the draft,
 * and creates (to every chosen branch) or saves an edit (to every branch of
 * the deal), reporting success only after the request resolves.
 */
export function useDealReviewLaunch({
  onLaunched,
  onDrafted,
  onEdited,
}: {
  onLaunched?: () => void;
  onDrafted?: () => void;
  onEdited?: () => void;
}): DealReviewLaunch {
  const deal = useCatalogueDraftStore(state => state.deal);
  const branches = useBusinessBranches();
  const publish = usePublishCatalogueOffer();
  const saveEdit = useSaveDealEdit();

  const isEditing = Boolean(deal.editingDealGroupId);
  const branchList = (branches.data ?? []).map(branch => ({
    id: branch.id,
    name: branch.name,
    address: branch.address,
  }));
  const review = dealDraftToReview(deal, branchList);
  const isBusy = publish.isPending || saveEdit.isPending;
  const launched =
    saveEdit.isSuccess || (publish.isSuccess && publish.variables?.status === 'active');
  const phase: DealLaunchPhase = isBusy ? 'publishing' : launched ? 'published' : 'idle';

  const submit = (status: 'active' | 'inactive') => {
    if (isBusy) return;
    if (isEditing) {
      saveEdit.mutate(undefined, {
        onSuccess: () => {
          showSuccess(copy.savedToast);
          onEdited?.();
        },
        onError: error =>
          showError(error instanceof Error ? error.message : copy.saveError),
      });
      return;
    }
    if (review.blocker) {
      showError(review.blocker);
      return;
    }
    const branchIds = deal.branchIds.length
      ? deal.branchIds
      : branchList.map(branch => branch.id);
    publish.mutate(
      { status, branchIds },
      {
        onSuccess: () => {
          showSuccess(status === 'active' ? copy.launchedToast : copy.draftToast);
          if (status === 'active') onLaunched?.();
          else onDrafted?.();
        },
        onError: error =>
          showError(error instanceof Error ? error.message : copy.launchError),
      },
    );
  };

  return {
    review,
    isEditing,
    phase,
    isBusy,
    launch: () => submit('active'),
    saveDraft: () => submit('inactive'),
  };
}

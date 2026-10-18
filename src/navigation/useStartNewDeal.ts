import { useCallback } from 'react';
import { useCatalogueDraftStore } from '@store/catalogueDraftStore';
import { useBusinessNavigation } from '@navigation/useBusinessNavigation';

/** "Create deal" from anywhere in the shell: a fresh draft in the live wizard. */
export function useStartNewDeal() {
  const navigation = useBusinessNavigation();
  const resetDeal = useCatalogueDraftStore(state => state.resetDeal);
  return useCallback(() => {
    resetDeal();
    navigation.navigate('CreateDealStep1');
  }, [navigation, resetDeal]);
}

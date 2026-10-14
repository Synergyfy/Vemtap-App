import { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQueryClient } from '@tanstack/react-query';
import { subscriptionsApi } from '@api/subscriptionsApi';
import {
  subscriptionKeys,
  trialStageOf,
} from '@features/business/hooks/useSubscriptions';
import type { BusinessSetupStackParamList, RootStackParamList } from '@navigation/types';

/** The plan screen for each subscription stage (see the integration guide §2.5). */
const SCREEN_BY_STAGE = {
  eligible: 'BusinessPlanTrialOverview',
  active: 'TrialActiveStatus',
  ending: 'TrialEndingRenewGrowth',
  expired: 'TrialExpiredReactivate',
  paid: 'BusinessPlanTrialOverview',
  none: 'BusinessPlanTrialOverview',
} as const satisfies Record<string, keyof BusinessSetupStackParamList>;

/**
 * Opens the plan screen that fits the business's subscription right now:
 * the plan picker, the running trial, the "trial ending" nudge or the
 * "trial ended" page. Works from the business app and the setup flow.
 */
export function useOpenPlanScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const queryClient = useQueryClient();
  return useCallback(async () => {
    const subscription = await queryClient
      .fetchQuery({
        queryKey: subscriptionKeys.active(),
        queryFn: () => subscriptionsApi.active(),
        staleTime: 30_000,
      })
      .catch(() => undefined);
    navigation.navigate('BusinessSetup', {
      screen: SCREEN_BY_STAGE[trialStageOf(subscription ?? undefined)],
    });
  }, [navigation, queryClient]);
}

/** Opens the verification status centre (start, continue or review verification). */
export function useOpenVerificationCenter() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  return useCallback(
    () =>
      navigation.navigate('BusinessSetup', {
        screen: 'BusinessVerificationStatusCenter',
      }),
    [navigation],
  );
}

/** Opens the paid add-ons catalogue. */
export function useOpenAddOns() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  return useCallback(
    () => navigation.navigate('BusinessSetup', { screen: 'VemtapAddOns' }),
    [navigation],
  );
}

import React, { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LoadingState } from '@components/shared/LoadingState';
import { businessProfileCopy } from '@features/business/businessCopy';
import { useAuthStore, selectIsAuthenticated } from '@store/authStore';
import type { BusinessSetupStackParamList } from '@navigation/types';

/** Where the gate sends the caller; params are always `fromGate`. */
export type BusinessSetupGateTarget =
  | { name: 'BusinessAccountCredentials'; params: { fromGate: true } }
  | { name: 'BusinessIntroduction'; params?: undefined };

/**
 * The gate's decision, pure so it is testable on its own:
 *
 * - No session → credentials. The credentials step sees no session and runs
 *   its create flow (email + password, verified by OTP).
 * - Customer session → credentials. It sees a customer and runs its confirm
 *   flow (re-enter the password, upgrade the same account to owner).
 * - Owner session → straight to BusinessIntroduction.
 *
 * The credentials step picks create vs confirm from the session itself, so the
 * gate only says where to go, not how.
 */
export function businessSetupGateTarget(
  isAuthenticated: boolean,
  role: string | null | undefined,
): BusinessSetupGateTarget {
  if (!isAuthenticated || role?.toLowerCase() === 'customer') {
    return { name: 'BusinessAccountCredentials', params: { fromGate: true } };
  }
  return { name: 'BusinessIntroduction' };
}

export interface BusinessSetupGateScreenProps {
  navigation: Pick<NativeStackNavigationProp<BusinessSetupStackParamList>, 'replace'>;
}

/**
 * Entry gate for the business setup wizard.
 *
 * Every wizard step from BusinessIntroduction onward assumes the caller is
 * authenticated: the profile screens persist through the session-scoped
 * `PATCH /businesses/my-business`, and the account step upgrades the same
 * account to owner. Before this gate, authentication was deferred to the
 * wizard's fourth step — a new user walked three screens into the flow before
 * being told they needed an account.
 *
 * It *replaces* itself with the destination: left in the stack, back from the
 * next screen would land on a spinner whose redirect has already fired, and
 * the still-mounted gate would race the next screen's own navigation when the
 * session changes.
 */
export function BusinessSetupGateScreen({ navigation }: BusinessSetupGateScreenProps) {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const role = useAuthStore(state => state.user?.role);

  useEffect(() => {
    const target = businessSetupGateTarget(isAuthenticated, role);
    if (target.name === 'BusinessIntroduction') {
      navigation.replace('BusinessIntroduction');
    } else {
      navigation.replace('BusinessAccountCredentials', target.params);
    }
  }, [isAuthenticated, navigation, role]);

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <LoadingState label={businessProfileCopy.accountSetup.gate.checking} />
    </SafeAreaView>
  );
}

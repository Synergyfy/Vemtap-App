import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore } from '@store/authStore';
import { useSwitchRole } from '@features/auth/hooks/useSwitchRole';
import { strings } from '@constants/strings';
import type { RootStackParamList } from '@navigation/types';

/**
 * Customer-side "own a business" entry, shared by Account, Home, Featured
 * Deals and Discover so they all behave the same:
 *
 * - A dual-role owner flips back to their merchant side and lands on the
 *   business dashboard instead of re-walking the setup wizard (which would
 *   otherwise edit their existing business).
 * - Everyone else opens the business setup wizard.
 */
export function useOpenBusinessSetup() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const ownerAccount = useAuthStore(state => state.ownerAccount);
  const switchRole = useSwitchRole();

  return useCallback(() => {
    if (!ownerAccount) {
      navigation.navigate('BusinessSetup');
      return;
    }

    switchRole.mutate('business', {
      onSuccess: () =>
        navigation.navigate('BusinessTabs', { screen: 'BusinessOverview' }),
      onError: error =>
        Alert.alert(
          strings.switchToCustomer.error.title,
          error.message || strings.switchToCustomer.error.body,
        ),
    });
  }, [navigation, ownerAccount, switchRole]);
}

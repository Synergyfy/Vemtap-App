import React from 'react';
import {
  NavigationContainer,
  createNavigationContainerRef,
} from '@react-navigation/native';
import { act, cleanup, render } from '@testing-library/react-native';
import { BusinessSetupNavigator } from '@navigation/BusinessSetupNavigator';
import { businessSetupGateTarget } from '@features/business/screens/BusinessSetupGateScreen';
import { businessProfileCopy } from '@features/business/businessCopy';
import { useAuthStore } from '@store/authStore';
import { useBusinessOnboardingStore } from '@store/businessOnboardingStore';
import { businessDashboardApi } from '@api/businessDashboardApi';
import type { BusinessSetupStackParamList } from '@navigation/types';

/**
 * The business setup wizard's entry gate. Every "start a business" entry point
 * opens `BusinessSetup` with no screen, so the gate is the real entry: it must
 * redirect at once and must not stay in the back stack (back would otherwise
 * land on a spinner whose redirect already fired).
 */

afterEach(() => {
  cleanup();
  jest.restoreAllMocks();
  useAuthStore.setState({ status: 'unauthenticated', user: null } as never);
  useBusinessOnboardingStore.getState().reset();
});

describe('businessSetupGateTarget', () => {
  it('sends signed-out and customer sessions to credentials, owners to the wizard', () => {
    const credentials = {
      name: 'BusinessAccountCredentials',
      params: { fromGate: true },
    };
    expect(businessSetupGateTarget(false, undefined)).toEqual(credentials);
    expect(businessSetupGateTarget(true, 'Customer')).toEqual(credentials);
    expect(businessSetupGateTarget(true, 'customer')).toEqual(credentials);
    expect(businessSetupGateTarget(true, 'Owner')).toEqual({
      name: 'BusinessIntroduction',
    });
  });
});

describe('BusinessSetupGate in the real setup navigator', () => {
  async function openWizard(auth: { status: string; role?: string }) {
    useAuthStore.setState({
      status: auth.status,
      user: auth.role ? { id: 'user-1', role: auth.role, email: 'a@b.co' } : null,
    } as never);
    const ref = createNavigationContainerRef<BusinessSetupStackParamList>();
    const view = await render(
      <NavigationContainer ref={ref}>
        <BusinessSetupNavigator />
      </NavigationContainer>,
    );
    await act(async () => {
      await Promise.resolve();
    });
    return { ref, view };
  }

  it.each([
    ['signed out', { status: 'unauthenticated' }, 'BusinessAccountCredentials'],
    [
      'a customer',
      { status: 'authenticated', role: 'Customer' },
      'BusinessAccountCredentials',
    ],
    ['an owner', { status: 'authenticated', role: 'Owner' }, 'BusinessIntroduction'],
  ])(
    'sends %s straight on, leaving no gate to go back to',
    async (_who, auth, target) => {
      const { ref, view } = await openWizard(auth);

      expect(ref.getCurrentRoute()?.name).toBe(target);
      expect(ref.getRootState()?.routes.map(route => route.name) ?? []).not.toContain(
        'BusinessSetupGate',
      );
      expect(view.queryByText(businessProfileCopy.accountSetup.gate.checking)).toBeNull();
    },
  );

  it('treats an owner still onboarding as signed in, not as signed out', async () => {
    // A just-registered owner is `onboarding` until the wizard ends; treating
    // that as signed out bounced them from Introduction back to sign-up.
    const { ref } = await openWizard({ status: 'onboarding', role: 'Owner' });
    expect(ref.getCurrentRoute()?.name).toBe('BusinessIntroduction');
  });

  it('stays on the account step when the business cannot be created', async () => {
    jest
      .spyOn(businessDashboardApi, 'updateMyBusiness')
      .mockRejectedValue(new Error('Network down'));
    useBusinessOnboardingStore
      .getState()
      .setBasicInfo({ name: 'Mama Put', category: '', specialties: [], description: '' });
    const { ref, view } = await openWizard({ status: 'authenticated', role: 'Owner' });

    await act(async () => {
      ref.navigate('BusinessAccountCredentials');
    });
    await act(async () => {
      await Promise.resolve();
    });

    expect(ref.getCurrentRoute()?.name).toBe('BusinessAccountCredentials');
    expect(
      (await view.findAllByText(businessProfileCopy.accountSetup.businessSyncFailed))
        .length,
    ).toBeGreaterThan(0);
    expect(view.getByText('Network down')).toBeTruthy();
  });

  it('tells the credentials step it came from the gate', async () => {
    const { ref } = await openWizard({ status: 'unauthenticated' });
    expect(ref.getCurrentRoute()?.params).toEqual({ fromGate: true });
  });
});

import React from 'react';
import { act, renderHook } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { colors } from '@theme/colors';
import { usePullToRefresh } from '@hooks/usePullToRefresh';

/**
 * Home, Deals, Discover and the account screens all pass this hook's
 * `refreshControl` to their ScrollView, so the control is pinned here once:
 * a drag invalidates exactly the screen's key namespaces, and the spinner is
 * branded on both platforms (`colors` is Android-only; iOS reads `tintColor`).
 */
async function setup(keys: string[][]) {
  const client = new QueryClient();
  const invalidate = jest.spyOn(client, 'invalidateQueries').mockResolvedValue();
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  const hook = await renderHook(() => usePullToRefresh(keys), { wrapper });
  return { invalidate, result: hook.result };
}

test('a drag invalidates every key namespace the screen renders', async () => {
  jest.useFakeTimers();
  const { result, invalidate } = await setup([['offers'], ['notifications']]);

  await act(async () => {
    await result.current.refreshControl.props.onRefresh();
  });

  expect(invalidate).toHaveBeenCalledWith({ queryKey: ['offers'], exact: false });
  expect(invalidate).toHaveBeenCalledWith({ queryKey: ['notifications'], exact: false });
  expect(result.current.refreshControl.props.refreshing).toBe(true);

  await act(async () => {
    jest.advanceTimersByTime(600);
  });
  expect(result.current.refreshControl.props.refreshing).toBe(false);
  jest.useRealTimers();
});

test('the control is tinted on iOS and Android', async () => {
  const { result } = await setup([['offers']]);
  expect(result.current.refreshControl.props).toMatchObject({
    colors: [colors.primary],
    tintColor: colors.primary,
  });
});

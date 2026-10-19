import { act, renderHook } from '@testing-library/react-native';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { useTopOnlyBounce } from '@hooks/useTopOnlyBounce';

const scrollTo = (y: number) =>
  ({
    nativeEvent: { contentOffset: { x: 0, y } },
  }) as NativeSyntheticEvent<NativeScrollEvent>;

test('bounces only while the feed sits at the top', async () => {
  const { result } = await renderHook(() => useTopOnlyBounce());
  expect(result.current.bounces).toBe(true);
  expect(result.current.overScrollMode).toBe('never');

  // Scrolled into the feed: no bounce, so it cannot be dragged past the end.
  await act(async () => result.current.onScroll(scrollTo(600)));
  expect(result.current.bounces).toBe(false);
  expect(result.current.alwaysBounceVertical).toBe(false);

  // Back at the top: bounce returns for pull-to-refresh.
  await act(async () => result.current.onScroll(scrollTo(0)));
  expect(result.current.bounces).toBe(true);
});

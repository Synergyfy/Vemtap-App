import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { act, cleanup, render } from '@testing-library/react-native';
import { useHideTabBarOnFocus } from '@navigation/useHideTabBarOnFocus';
import { navigationRef } from '@navigation/navigationRef';
import { useTabBarStore } from '@store/tabBarStore';

/**
 * The conversation view is a full-height canvas, so it hides the consumer tab
 * bar while it is focused and restores it on blur. The two halves live in
 * different modules — the screen-side hook that raises the flag and the
 * navigator-side `tabBarStyle` that reads it — so this drives the hook through a
 * real navigation container (focus and blur both fire for real) and asserts the
 * store the bar is styled from.
 */

const Stack = createNativeStackNavigator<{ Chat: undefined; Feed: undefined }>();

function Chat() {
  useHideTabBarOnFocus();
  return <Text>chat</Text>;
}

function Feed() {
  return <Text>feed</Text>;
}

function Root() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Chat" component={Chat} />
      <Stack.Screen name="Feed" component={Feed} />
    </Stack.Navigator>
  );
}

/** Mirrors the app: the container is attached to the shared ref so actions route. */
function renderStack(children: React.ReactNode) {
  return render(
    <NavigationContainer ref={navigationRef}>{children}</NavigationContainer>,
  );
}

/** The shared ref is typed for the root stack; this test drives a local one. */
function goTo(screenName: 'Chat' | 'Feed') {
  const { navigate } = navigationRef as {
    navigate: (name: string, params?: object) => void;
  };
  navigate(screenName);
}

afterEach(() => {
  cleanup();
  act(() => useTabBarStore.getState().setTabBarHidden(false));
});

test('the chat screen hides the tab bar while focused and restores it on blur', async () => {
  await act(async () => {
    renderStack(<Root />);
  });

  // Start on the chat screen so focus has already raised the flag.
  expect(useTabBarStore.getState().isTabBarHidden).toBe(true);

  // Blur it by pushing the feed; the hook's cleanup must clear the flag.
  await act(async () => {
    goTo('Feed');
  });
  expect(useTabBarStore.getState().isTabBarHidden).toBe(false);

  // Focus it again by navigating back; the flag is raised once more.
  await act(async () => {
    goTo('Chat');
  });
  expect(useTabBarStore.getState().isTabBarHidden).toBe(true);
});

test('a screen that does not use the hook leaves the bar visible', async () => {
  await act(async () => {
    renderStack(
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Feed" component={Feed} />
      </Stack.Navigator>,
    );
  });

  expect(useTabBarStore.getState().isTabBarHidden).toBe(false);
});

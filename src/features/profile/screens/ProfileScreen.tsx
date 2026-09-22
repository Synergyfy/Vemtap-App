import React from 'react';
import { View, ScrollView } from 'react-native';
import { cssInterop } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';
import { VemtapText } from '@components/ui/Text';
import { Card } from '@components/ui/Card';
import { Button } from '@components/ui/Button';
import { useAuthStore } from '@store/authStore';
import { useLogout } from '@features/auth/hooks/useLogout';
import { useTheme } from '@theme/ThemeProvider';

cssInterop(View, { className: 'style' });
cssInterop(ScrollView, { className: 'style' });

export function ProfileScreen() {
  const user = useAuthStore(state => state.user);
  const logout = useLogout();
  const { theme, toggleTheme } = useTheme();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerClassName="px-screen py-6 gap-4">
        <VemtapText variant="headingLg" accessibilityRole="header">
          Account
        </VemtapText>

        <Card elevated>
          <VemtapText variant="headingSm">{user?.displayName ?? 'Vemtap user'}</VemtapText>
          <VemtapText tone="secondary" className="mt-1">
            {user?.email}
          </VemtapText>
        </Card>

        <Card>
          <View className="flex-row items-center justify-between">
            <View className="flex-1 me-3">
              <VemtapText variant="labelMd">Appearance</VemtapText>
              <VemtapText tone="secondary" variant="caption">
                Currently {theme}
              </VemtapText>
            </View>
            <Button
              label={theme === 'dark' ? 'Light' : 'Dark'}
              variant="outline"
              size="sm"
              fullWidth={false}
              onPress={toggleTheme}
              accessibilityHint="Toggle light and dark theme"
            />
          </View>
        </Card>

        <Button
          label="Sign out"
          variant="destructive"
          loading={logout.isPending}
          onPress={() => logout.mutate()}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

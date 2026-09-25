import React from 'react';
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { VemtapText } from '@components/ui/Text';
import { Card } from '@components/ui/Card';
import { Button } from '@components/ui/Button';
import { useAuthStore } from '@store/authStore';
import { useLogout } from '@features/auth/hooks/useLogout';

export function ProfileScreen() {
  const user = useAuthStore(state => state.user);
  const logout = useLogout();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1" contentContainerClassName="px-4 py-6 gap-4">
        <VemtapText
          variant="headingXl"
          accessibilityRole="header"
          className="text-heading-xl"
        >
          Account
        </VemtapText>

        <Card elevated>
          <VemtapText variant="headingSm">
            {user?.displayName ?? 'Vemtap user'}
          </VemtapText>
          <VemtapText tone="secondary" className="mt-1">
            {user?.email}
          </VemtapText>
        </Card>

        <Card>
          <View className="flex-1">
            <VemtapText variant="labelMd">Appearance</VemtapText>
            <VemtapText tone="secondary" variant="caption">
              Light mode (VEMTAP design system)
            </VemtapText>
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

import React from 'react';
import { View, ScrollView } from 'react-native';
import { cssInterop } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { VemtapText } from '@components/ui/Text';
import { Button } from '@components/ui/Button';
import type { AuthStackParamList } from '@navigation/types';
import { strings } from '@constants/strings';

cssInterop(View, { className: 'style' });
cssInterop(ScrollView, { className: 'style' });

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Welcome'>;

export function WelcomeScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView contentContainerClassName="flex-grow px-screen justify-between py-6">
        <View className="pt-4">
          <VemtapText variant="headingLg" tone="brand" accessibilityRole="header">
            VEMTAP
          </VemtapText>
        </View>

        <View className="gap-3">
          <VemtapText variant="displayMobile" accessibilityRole="header">
            Discover More. Buy Smarter.
          </VemtapText>
          <VemtapText variant="bodyLg" tone="secondary">
            Find great deals, products and businesses around you — all in one place.
          </VemtapText>
        </View>

        <View className="gap-4 pb-4">
          <Button
            label={strings.common.getStarted}
            size="lg"
            onPress={() => navigation.navigate('SignUp')}
            accessibilityHint="Creates a new account"
          />
          <Button
            label={strings.common.signIn}
            variant="ghost"
            onPress={() => navigation.navigate('SignIn')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

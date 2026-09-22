import React, { useCallback } from 'react';
import { ScrollView, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { VemtapText } from '@components/ui/Text';
import { Button } from '@components/ui/Button';
import { TextField } from '@components/forms/TextField';
import { loginInputSchema, type LoginInput } from '@api/authApi';
import { useLogin } from '@features/auth/hooks/useLogin';
import type { AuthStackParamList } from '@navigation/types';

cssInterop(View, { className: 'style' });
cssInterop(ScrollView, { className: 'style' });

type Nav = NativeStackNavigationProp<AuthStackParamList, 'SignIn'>;

export function SignInScreen() {
  const navigation = useNavigation<Nav>();
  const login = useLogin();

  const { control, handleSubmit, formState } = useForm<LoginInput>({
    resolver: zodResolver(loginInputSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onBlur',
  });

  const onSubmit = useCallback(
    (values: LoginInput) => {
      login.mutate(values);
    },
    [login],
  );

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView contentContainerClassName="px-screen py-6 gap-6" keyboardShouldPersistTaps="handled">
        <View className="gap-2 pt-4">
          <VemtapText variant="headingLg" accessibilityRole="header">
            Welcome back
          </VemtapText>
          <VemtapText tone="secondary">Sign in to continue discovering deals.</VemtapText>
        </View>

        <View className="gap-4">
          <TextField
            control={control}
            name="email"
            label="Email"
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
          />
          <TextField
            control={control}
            name="password"
            label="Password"
            placeholder="••••••••"
            secureTextEntry
            autoComplete="password"
            textContentType="password"
          />
        </View>

        {login.isError ? (
          <VemtapText tone="error" accessibilityRole="alert">
            {(login.error as Error).message}
          </VemtapText>
        ) : null}

        <View className="gap-3">
          <Button
            label="Sign In"
            loading={login.isPending}
            disabled={!formState.isValid}
            onPress={() => {
              handleSubmit(onSubmit)();
            }}
          />
          <Button
            label="Create an account"
            variant="ghost"
            onPress={() => navigation.navigate('SignUp')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

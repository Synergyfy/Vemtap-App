import React, { useCallback } from 'react';
import { ScrollView, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { z } from 'zod';
import { VemtapText } from '@components/ui/Text';
import { Button } from '@components/ui/Button';
import { TextField } from '@components/forms/TextField';
import { CheckboxField } from '@components/forms/CheckboxField';
import { displayNameSchema, emailSchema, passwordSchema } from '@utils/validators';
import { useRegister } from '@features/auth/hooks/useRegister';
import type { AuthStackParamList } from '@navigation/types';

cssInterop(View, { className: 'style' });
cssInterop(ScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});
cssInterop(SafeAreaView, { className: 'style' });

const signUpSchema = z
  .object({
    displayName: displayNameSchema,
    email: emailSchema,
    password: passwordSchema,
    acceptTerms: z.boolean(),
  })
  .refine(data => data.acceptTerms, {
    path: ['acceptTerms'],
    message: 'You must accept the terms to continue',
  });

type SignUpInput = z.infer<typeof signUpSchema>;

type Nav = NativeStackNavigationProp<AuthStackParamList, 'SignUp'>;

export function SignUpScreen() {
  const navigation = useNavigation<Nav>();
  const register = useRegister();

  const { control, handleSubmit, formState } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      displayName: '',
      email: '',
      password: '',
      acceptTerms: false,
    },
    mode: 'onBlur',
  });

  const onSubmit = useCallback(
    (values: SignUpInput) => {
      const { acceptTerms: _accepted, ...payload } = values;
      register.mutate(payload);
    },
    [register],
  );

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView
        contentContainerClassName="px-screen py-6 gap-6"
        keyboardShouldPersistTaps="handled"
      >
        <View className="gap-2 pt-4">
          <VemtapText variant="headingLg" accessibilityRole="header">
            Create your account
          </VemtapText>
          <VemtapText tone="secondary">One tap from your next great find.</VemtapText>
        </View>

        <View className="gap-4">
          <TextField
            control={control}
            name="displayName"
            label="Full name"
            placeholder="Ada Lovelace"
            autoComplete="name"
            textContentType="name"
          />
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
            placeholder="At least 8 characters"
            secureTextEntry
            autoComplete="password-new"
            textContentType="newPassword"
          />
          <CheckboxField
            control={control}
            name="acceptTerms"
            label="I agree to the Terms of Service and Privacy Policy"
          />
        </View>

        {register.isError ? (
          <VemtapText tone="error" accessibilityRole="alert">
            {(register.error as Error).message}
          </VemtapText>
        ) : null}

        <View className="gap-3">
          <Button
            label="Create account"
            loading={register.isPending}
            disabled={!formState.isValid}
            onPress={() => {
              handleSubmit(onSubmit)();
            }}
          />
          <Button
            label="I already have an account"
            variant="ghost"
            onPress={() => navigation.navigate('SignIn')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

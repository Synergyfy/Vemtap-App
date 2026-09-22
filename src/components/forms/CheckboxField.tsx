import React from 'react';
import { Pressable, View } from 'react-native';
import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';
import { cssInterop } from 'nativewind';
import { cn } from '@utils/cn';
import { VemtapText } from '@components/ui/Text';

cssInterop(View, { className: 'style' });
cssInterop(Pressable, { className: 'style' });

export interface CheckboxFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  control: Control<TFieldValues>;
  name: TName;
  label: string;
  containerClassName?: string;
}

export function CheckboxField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({ control, name, label, containerClassName }: CheckboxFieldProps<TFieldValues, TName>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: Boolean(value) }}
          accessibilityLabel={label}
          onPress={() => onChange(!value)}
          className={cn('flex-row items-start gap-3 min-h-[44px]', containerClassName)}
        >
          <View
            className={cn(
              'mt-0.5 h-5 w-5 items-center justify-center rounded-md border',
              value ? 'bg-primary border-primary' : 'bg-surface border-border',
            )}
          >
            {value ? (
              <View className="h-2 w-2 rounded-sm bg-primary-foreground" />
            ) : null}
          </View>
          <View className="flex-1">
            <VemtapText variant="bodyMd" tone={error ? 'error' : 'secondary'}>
              {label}
            </VemtapText>
            {error ? (
              <VemtapText variant="labelSm" tone="error" accessibilityRole="alert">
                {error.message}
              </VemtapText>
            ) : null}
          </View>
        </Pressable>
      )}
    />
  );
}

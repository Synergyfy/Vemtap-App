import React, { useId } from 'react';
import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';
import { Input, type InputProps } from '@components/ui/Input';

export interface TextFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<InputProps, 'value' | 'onChangeText' | 'onBlur' | 'error'> {
  control: Control<TFieldValues>;
  name: TName;
}

/**
 * react-hook-form Controller wired to the shared Input.
 * Keeps inputs uncontrolled by RHF so keystrokes don't re-render parents.
 */
export function TextField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({ control, name, label, ...inputProps }: TextFieldProps<TFieldValues, TName>) {
  const autoId = useId();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value, ref }, fieldState: { error } }) => (
        <Input
          ref={ref}
          label={label}
          value={(value as string) ?? ''}
          onChangeText={onChange}
          onBlur={onBlur}
          error={error?.message}
          accessibilityLabel={label ?? `${String(name)}-${autoId}`}
          {...inputProps}
        />
      )}
    />
  );
}

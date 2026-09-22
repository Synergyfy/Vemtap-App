import React, { useId } from 'react';
import { Pressable, View } from 'react-native';
import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';
import { cssInterop } from 'nativewind';
import { cn } from '@utils/cn';
import { VemtapText } from '@components/ui/Text';

cssInterop(View, { className: 'style' });
cssInterop(Pressable, { className: 'style' });

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  control: Control<TFieldValues>;
  name: TName;
  label?: string;
  options: SelectOption[];
  containerClassName?: string;
}

/**
 * Segmented select (design-system friendly). For long lists use a bottom sheet.
 */
export function SelectField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({ control, name, label, options, containerClassName }: SelectFieldProps<TFieldValues, TName>) {
  const groupId = useId();

  return (
    <View className={cn('gap-1.5', containerClassName)}>
      {label ? (
        <VemtapText variant="labelMd" tone="secondary">
          {label}
        </VemtapText>
      ) : null}
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value } }) => (
          <View accessibilityRole="radiogroup" className="flex-row flex-wrap gap-2">
            {options.map(option => {
              const selected = value === option.value;
              return (
                <Pressable
                  key={option.value}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`${label ?? groupId}: ${option.label}`}
                  onPress={() => onChange(option.value)}
                  className={cn(
                    'min-h-[36px] justify-center rounded-full border px-3',
                    selected
                      ? 'bg-surface-tint border-border-active'
                      : 'bg-surface-muted border-border',
                  )}
                >
                  <VemtapText
                    variant="labelSm"
                    className={cn(selected ? 'text-primary' : 'text-text-secondary')}
                  >
                    {option.label}
                  </VemtapText>
                </Pressable>
              );
            })}
          </View>
        )}
      />
    </View>
  );
}

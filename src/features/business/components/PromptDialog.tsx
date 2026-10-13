import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { BottomSheet } from '@components/shared/BottomSheet';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';

export interface PromptDialogField {
  key: string;
  label: string;
  value: string;
  keyboardType?: 'default' | 'decimal-pad' | 'numeric';
}

export interface PromptDialogProps {
  visible: boolean;
  title: string;
  fields: PromptDialogField[];
  confirmLabel: string;
  confirmVariant?: 'primary' | 'destructive';
  onCancel: () => void;
  onConfirm: (values: Record<string, string>) => void;
}

/**
 * A bottom sheet with one or two text fields and cancel/confirm actions.
 *
 * The hub needs three small edits — rename a category, tweak an item's name or
 * price — and none of them justify pushing a full wizard screen. Built on the
 * shared BottomSheet so it behaves like every other sheet in the business app.
 */
export function PromptDialog({
  visible,
  title,
  fields,
  confirmLabel,
  confirmVariant = 'primary',
  onCancel,
  onConfirm,
}: PromptDialogProps) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map(field => [field.key, field.value])),
  );

  useEffect(() => {
    if (visible) {
      setValues(Object.fromEntries(fields.map(field => [field.key, field.value])));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only when the sheet opens; the captured field values belong to the row that opened it.
  }, [visible]);

  return (
    <BottomSheet visible={visible} onClose={onCancel} title={title}>
      <View className="gap-4 px-6 pb-6">
        {fields.map(field => (
          <Input
            key={field.key}
            label={field.label}
            value={values[field.key] ?? ''}
            onChangeText={text =>
              setValues(current => ({ ...current, [field.key]: text }))
            }
            keyboardType={field.keyboardType}
            accessibilityLabel={field.label}
          />
        ))}
        <View className="flex-row gap-3">
          <Button
            label="Cancel"
            variant="outline"
            fullWidth={false}
            className="flex-1"
            onPress={onCancel}
          />
          <Button
            label={confirmLabel}
            variant={confirmVariant}
            fullWidth={false}
            className="flex-1"
            onPress={() => onConfirm(values)}
          />
        </View>
      </View>
    </BottomSheet>
  );
}

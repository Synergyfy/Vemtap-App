import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { BottomSheet } from '@components/shared/BottomSheet';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { Input } from '@components/ui/Input';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';
import { useKeyboardInset } from '@hooks/useKeyboardInset';

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
  /**
   * Rendered inside the sheet, above the fields.
   *
   * This sheet is a `Modal`, and a toast does not reliably paint above one — so
   * a rejected save used to look like it had done nothing at all. Anything the
   * user must see while the sheet is still open belongs here, not in a toast.
   */
  error?: string | null;
  /** Called whenever the user edits a field, so a stale error can be cleared. */
  onChangeField?: (key: string) => void;
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
  error,
  onChangeField,
}: PromptDialogProps) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map(field => [field.key, field.value])),
  );
  const { dismissKeyboard } = useKeyboardInset();

  useEffect(() => {
    if (visible) {
      setValues(Object.fromEntries(fields.map(field => [field.key, field.value])));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only when the sheet opens; the captured field values belong to the row that opened it.
  }, [visible]);

  return (
    <BottomSheet visible={visible} onClose={onCancel} title={title}>
      <View className="gap-4 px-6 pb-6">
        {/* The fields scroll and the actions stay pinned: `BottomSheet` caps the
            sheet's height to what is left above the keyboard, and on a short
            device that is not always enough for three inputs plus buttons. The
            actions are the only way out of the sheet, so they must never be the
            part that gets cut off. */}
        <ScrollView
          className="flex-shrink"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="gap-4">
            {error ? (
              <View
                accessibilityRole="alert"
                accessibilityLabel={error}
                className="flex-row items-start gap-2 rounded-field bg-error-container p-3"
              >
                <Icon name="info" size={17} color={colors.error} />
                <VemtapText variant="caption" className="min-w-0 flex-1 text-error">
                  {error}
                </VemtapText>
              </View>
            ) : null}
            {fields.map(field => (
              <Input
                key={field.key}
                label={field.label}
                value={values[field.key] ?? ''}
                onChangeText={text => {
                  setValues(current => ({ ...current, [field.key]: text }));
                  onChangeField?.(field.key);
                }}
                keyboardType={field.keyboardType}
                accessibilityLabel={field.label}
                // iOS dismisses the keyboard on a swipe *without* emitting a
                // hide event, so the sheet's lift would have nothing to retract
                // it and would hang in mid-screen. Losing focus is the one
                // signal that always arrives — the same reason ChatComposer
                // clears its lift here.
                onBlur={dismissKeyboard}
              />
            ))}
          </View>
        </ScrollView>
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

import React from 'react';
import { View } from 'react-native';
import { cssInterop } from 'nativewind';
import { cn } from '@utils/cn';
import { VemtapText } from '@components/ui/Text';

cssInterop(View, { className: 'style' });

export interface Toast {
  message: string;
  type: 'info' | 'success' | 'error';
}

/**
 * Lightweight global toast surface. Wire to useUiStore.showToast().
 * Kept deliberately simple — swap for a headless library later if needed.
 */
export function ToastHost({ toast }: { toast: Toast | null }) {
  if (!toast) {
    return null;
  }

  const toneClass =
    toast.type === 'error'
      ? 'bg-error'
      : toast.type === 'success'
        ? 'bg-success'
        : 'bg-navy';

  return (
    <View
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
      className={cn(
        'absolute left-0 right-0 bottom-24 mx-6 rounded-card px-4 py-3 z-50',
        toneClass,
      )}
    >
      <VemtapText variant="labelMd" className="text-primary-foreground text-center">
        {toast.message}
      </VemtapText>
    </View>
  );
}

import React from 'react';
import { Modal, Pressable, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { cn } from '@utils/cn';
import { VemtapText } from '@components/ui/Text';

cssInterop(View, { className: 'style' });
cssInterop(Pressable, { className: 'style' });

export interface AppModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function AppModal({
  visible,
  onClose,
  title,
  children,
  className,
}: AppModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Close modal"
        onPress={onClose}
        className="flex-1 items-center justify-center bg-text/40 p-6"
      >
        <Pressable
          className={cn(
            'w-full max-w-screen rounded-card-lg bg-surface p-6 border border-border',
            'shadow-lg',
            className,
          )}
          onPress={e => e.stopPropagation()}
        >
          {title ? (
            <VemtapText variant="headingSm" className="mb-3">
              {title}
            </VemtapText>
          ) : null}
          <View>{children}</View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

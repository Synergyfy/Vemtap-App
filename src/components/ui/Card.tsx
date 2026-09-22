import React from 'react';
import { View, type ViewProps } from 'react-native';
import { cssInterop } from 'nativewind';
import { cn } from '@utils/cn';

cssInterop(View, { className: 'style' });

export interface CardProps extends ViewProps {
  className?: string;
  children: React.ReactNode;
  elevated?: boolean;
}

/** Surface card: white, 1px border, design-system radius + ambient shadow. */
export function Card({
  className,
  children,
  elevated = false,
  ...rest
}: CardProps) {
  return (
    <View
      className={cn(
        'rounded-card-lg bg-surface border border-border p-4',
        elevated && 'shadow-md',
        className,
      )}
      {...rest}
    >
      {children}
    </View>
  );
}

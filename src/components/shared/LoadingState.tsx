import React from 'react';
import { Loader } from '@components/ui/Loader';
import { VemtapText } from '@components/ui/Text';

export interface LoadingStateProps {
  label?: string;
  className?: string;
}

export function LoadingState({ label, className }: LoadingStateProps) {
  return (
    <Loader label={label} className={className} />
  );
}

export function LoadingSkeletonList({ rows = 4 }: { rows?: number }) {
  return (
    <VemtapText accessibilityRole="progressbar" accessibilityLabel="Loading" className="sr-only">
      Loading {rows} items…
    </VemtapText>
  );
}

import React from 'react';
import { View } from 'react-native';
import { cssInterop } from 'nativewind';
import * as Sentry from '@sentry/react-native';
import { VemtapText } from '@components/ui/Text';
import { Button } from '@components/ui/Button';
import { SENTRY_ENABLED } from '@constants/config';
import { strings } from '@constants/strings';
import { logger } from '@utils/logger';

cssInterop(View, { className: 'style' });

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Global ErrorBoundary — catches render crashes, reports to Sentry (when enabled),
 * and shows a recoverable fallback with a reset action.
 */
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    logger.error('app', 'Unhandled render error', {
      message: error.message,
      componentStack: info.componentStack,
    });
    if (SENTRY_ENABLED) {
      Sentry.captureException(error, { extra: { componentStack: info.componentStack } });
    }
  }

  handleReset = (): void => {
    this.setState({ hasError: false });
  };

  handleReload = (): void => {
    // RN has no full reload API from JS; navigate user flow by remounting children.
    this.handleReset();
  };

  render(): React.ReactNode {
    const { hasError } = this.state;
    const { children } = this.props;
    if (hasError) {
      return (
        <View className="flex-1 items-center justify-center bg-background px-6 gap-4">
          <VemtapText variant="headingMd" tone="error" className="text-center">
            Something went wrong
          </VemtapText>
          <VemtapText tone="secondary" className="text-center">
            {strings.errors.server}
          </VemtapText>
          <Button
            label={strings.common.retry}
            fullWidth={false}
            onPress={this.handleReload}
          />
        </View>
      );
    }
    return children;
  }
}

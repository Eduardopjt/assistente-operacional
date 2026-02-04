import React, { Component, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Clipboard } from 'react-native';
import { logger } from '@assistente/shared';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, errorInfo: string, retry: () => void) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: string | null;
}

/**
 * Executive-grade error boundary for mobile
 * Calm fallback UI, error reporting, clipboard copy
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    const errorStack = errorInfo.componentStack || '';

    logger.error('React component error caught', error, {
      component: 'ErrorBoundary',
      componentStack: errorStack,
    });

    this.setState({
      errorInfo: errorStack,
    });
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleCopyError = (): void => {
    const { error, errorInfo } = this.state;
    const errorText = `
Error: ${error?.name}
Message: ${error?.message}

Stack:
${error?.stack || 'No stack trace'}

Component Stack:
${errorInfo || 'No component stack'}
    `.trim();

    Clipboard.setString(errorText);
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error!, this.state.errorInfo || '', this.handleRetry);
      }

      // Default calm fallback UI
      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.title}>Algo inesperado aconteceu</Text>
            <Text style={styles.message}>
              O aplicativo encontrou um erro. Você pode tentar novamente ou copiar os detalhes para
              suporte.
            </Text>

            <TouchableOpacity style={styles.primaryButton} onPress={this.handleRetry}>
              <Text style={styles.primaryButtonText}>Tentar Novamente</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={this.handleCopyError}>
              <Text style={styles.secondaryButtonText}>Copiar Detalhes do Erro</Text>
            </TouchableOpacity>

            {process.env.NODE_ENV === 'development' && (
              <View style={styles.debugInfo}>
                <Text style={styles.debugTitle}>Debug Info:</Text>
                <Text style={styles.debugText}>{this.state.error?.message}</Text>
                <Text style={styles.debugText}>{this.state.error?.stack?.slice(0, 200)}</Text>
              </View>
            )}
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0E14',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    maxWidth: 400,
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#F9FAFB',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    fontWeight: '300',
    color: '#9CA3AF',
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 24,
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#374151',
  },
  secondaryButtonText: {
    color: '#9CA3AF',
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
  },
  debugInfo: {
    marginTop: 32,
    padding: 16,
    backgroundColor: '#1F2937',
    borderRadius: 8,
  },
  debugTitle: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  debugText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 4,
  },
});

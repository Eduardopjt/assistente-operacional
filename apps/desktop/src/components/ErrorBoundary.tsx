import React, { Component, ReactNode } from 'react';
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
 * Executive-grade error boundary for desktop
 * Calm fallback UI, error reporting, copy to clipboard
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

    navigator.clipboard.writeText(errorText);
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback(
          this.state.error!,
          this.state.errorInfo || '',
          this.handleRetry
        );
      }

      // Default calm fallback UI (executive design)
      return (
        <div style={styles.container}>
          <div style={styles.content}>
            <h1 style={styles.title}>Algo inesperado aconteceu</h1>
            <p style={styles.message}>
              O aplicativo encontrou um erro. Você pode tentar novamente ou copiar os detalhes para suporte.
            </p>

            <button style={styles.primaryButton} onClick={this.handleRetry}>
              Tentar Novamente
            </button>

            <button style={styles.secondaryButton} onClick={this.handleCopyError}>
              Copiar Detalhes do Erro
            </button>

            {process.env.NODE_ENV === 'development' && (
              <div style={styles.debugInfo}>
                <div style={styles.debugTitle}>Debug Info:</div>
                <pre style={styles.debugText}>{this.state.error?.message}</pre>
                <pre style={styles.debugText}>{this.state.error?.stack?.slice(0, 300)}</pre>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#0B0E14',
    padding: '24px',
  },
  content: {
    maxWidth: '500px',
    width: '100%',
  },
  title: {
    fontSize: '28px',
    fontWeight: 600,
    color: '#F9FAFB',
    marginBottom: '12px',
    textAlign: 'center',
  },
  message: {
    fontSize: '16px',
    fontWeight: 300,
    color: '#9CA3AF',
    marginBottom: '32px',
    textAlign: 'center',
    lineHeight: '24px',
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
    color: '#FFFFFF',
    padding: '16px 24px',
    fontSize: '16px',
    fontWeight: 500,
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    width: '100%',
    marginBottom: '12px',
    transition: 'opacity 0.2s ease',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    color: '#9CA3AF',
    padding: '16px 24px',
    fontSize: '16px',
    fontWeight: 400,
    border: '1px solid #374151',
    borderRadius: '8px',
    cursor: 'pointer',
    width: '100%',
    transition: 'opacity 0.2s ease',
  },
  debugInfo: {
    marginTop: '32px',
    padding: '16px',
    backgroundColor: '#1F2937',
    borderRadius: '8px',
  },
  debugTitle: {
    color: '#EF4444',
    fontSize: '14px',
    fontWeight: 600,
    marginBottom: '8px',
  },
  debugText: {
    color: '#9CA3AF',
    fontSize: '12px',
    fontFamily: 'monospace',
    marginBottom: '4px',
    overflow: 'auto',
  },
};

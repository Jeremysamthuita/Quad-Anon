import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Unhandled app error in ErrorBoundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          role="alert"
          aria-live="assertive"
          className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center"
        >
          <div className="w-14 h-14 rounded-2xl bg-danger/15 text-danger border border-danger/30 flex items-center justify-center mb-4">
            <AlertTriangle className="w-7 h-7" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-bold font-mono text-text-primary mb-2">
            Something went wrong
          </h2>
          <p className="text-sm text-text-secondary max-w-md mb-6">
            An unexpected error occurred while rendering this view. Your data and account are safe.
          </p>
          {this.state.error && (
            <div className="p-3 mb-6 rounded-xl bg-canvas border border-border-glass text-xs font-mono text-text-muted max-w-md w-full overflow-x-auto text-left">
              {this.state.error.message}
            </div>
          )}
          <button
            onClick={this.handleReset}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-mint text-neutral-900 font-mono text-xs font-bold shadow-md hover:opacity-90 transition-opacity active:scale-95"
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            <span>Reload Application</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

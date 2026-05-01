'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  override render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div
          className="flex flex-col items-center justify-center gap-3 rounded-xl px-6 py-8 text-center"
          style={{ background: '#C4A06008', border: '1px solid #C4A06020' }}
          role="alert"
        >
          <span
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '13px',
              fontWeight: 600,
              color: '#8A6A4A',
            }}
          >
            This section couldn't load
          </span>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, error: null })}
            className="cursor-pointer rounded-full px-4 py-1 transition-all hover:opacity-80"
            style={{
              background: '#C4A06015',
              border: '1px solid #C4A06030',
              fontFamily: 'var(--font-serif)',
              fontSize: '11px',
              fontWeight: 700,
              color: '#C4A060',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

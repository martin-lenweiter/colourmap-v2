'use client';

import ErrorBoundary from '@/components/ErrorBoundary';
import { useViewMode } from '@/components/ViewModeContext';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { mode } = useViewMode();

  if (mode === 'phone') {
    return (
      <ErrorBoundary>
        <div className="mx-auto w-full max-w-sm px-4 py-6">{children}</div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="mx-auto w-full max-w-7xl px-6 py-10">{children}</div>
    </ErrorBoundary>
  );
}

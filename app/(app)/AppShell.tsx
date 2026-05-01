'use client';

import { usePathname } from 'next/navigation';
import ErrorBoundary from '@/components/ErrorBoundary';
import SoundLab from '@/components/SoundLab';
import { useViewMode } from '@/components/ViewModeContext';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { mode } = useViewMode();
  const pathname = usePathname();
  const onMusic = pathname === '/music';

  const containerClass =
    mode === 'phone' ? 'mx-auto w-full max-w-sm px-4 py-6' : 'mx-auto w-full max-w-7xl px-6 py-10';

  return (
    <ErrorBoundary>
      <div className={containerClass}>
        {/* Always mounted so Web Audio keeps running on navigation.
            display:none hides it but never unmounts — audio survives
            route changes. Only visible when on /music. */}
        <div style={{ display: onMusic ? 'block' : 'none' }}>
          <SoundLab />
        </div>
        {children}
      </div>
    </ErrorBoundary>
  );
}

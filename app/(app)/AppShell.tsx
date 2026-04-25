'use client';

import { useViewMode } from '@/components/ViewModeContext';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { mode } = useViewMode();

  if (mode === 'phone') {
    return <div className="mx-auto w-full max-w-sm px-4 py-6">{children}</div>;
  }

  // Desktop: lift the outer cap to 7xl so pages that *want* the
  // full width (Sounds, Day) can use it. Pages that prefer to stay
  // narrow (Notebook, Journey, Life Scan, Programs) still set their
  // own max-w-lg / max-w-2xl inside, so they're unaffected. Per
  // Martin 2026-04-25: "layers take full space in desktop view not
  // just one side but stretching both sides to use space."
  return <div className="mx-auto w-full max-w-7xl px-6 py-10">{children}</div>;
}

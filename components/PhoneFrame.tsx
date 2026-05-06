'use client';

import { useViewMode } from './ViewModeContext';

export default function PhoneFrame({ children }: { children: React.ReactNode }) {
  const { mode, mounted } = useViewMode();

  // Before hydration, default to phone frame to avoid layout shift.
  // After mount, switch based on stored preference.
  const isPhone = !mounted || mode === 'phone';

  if (isPhone) {
    return (
      <div className="lg:flex lg:min-h-screen lg:items-start lg:justify-center lg:bg-[#0C0905]">
        <div className="w-full lg:max-w-[430px]">{children}</div>
      </div>
    );
  }

  return <div className="w-full">{children}</div>;
}

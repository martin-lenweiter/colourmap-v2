'use client';

import { useState } from 'react';

/* ═══════════════════════════════════════════════════════════
   DAY TABS — FEELING / DOING / SHARING
   Three-tab container with consistent structure across all doors.
   Each tab: Block 1 (check-in card) + Block 2 (compass card)
   ═══════════════════════════════════════════════════════════ */

type Tab = 'feeling' | 'doing' | 'sharing';

const TABS: { id: Tab; label: string; color: string }[] = [
  { id: 'feeling', label: 'CARING', color: '#C4A060' },
  { id: 'doing', label: 'DOING', color: '#7A9A7A' },
  { id: 'sharing', label: 'SHARING', color: '#6B7F4E' },
];

interface DayTabsProps {
  feelingContent: React.ReactNode;
  doingContent: React.ReactNode;
  sharingContent: React.ReactNode;
}

export default function DayTabs({ feelingContent, doingContent, sharingContent }: DayTabsProps) {
  const [active, setActive] = useState<Tab>('feeling');

  return (
    <div className="space-y-4">
      {/* Tab selectors */}
      <div className="flex gap-1.5">
        {TABS.map((tab) => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActive(tab.id)}
              className="flex-1 cursor-pointer rounded-xl py-2.5 text-[13px] font-serif font-semibold tracking-[0.08em] transition-all duration-200"
              style={{
                background: isActive ? '#C4A06018' : 'transparent',
                border: `1.5px solid ${isActive ? '#C4A060' : 'hsl(var(--border) / 0.25)'}`,
                color: 'hsl(var(--foreground))',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="animate-in fade-in duration-200">
        {active === 'feeling' && feelingContent}
        {active === 'doing' && doingContent}
        {active === 'sharing' && sharingContent}
      </div>
    </div>
  );
}

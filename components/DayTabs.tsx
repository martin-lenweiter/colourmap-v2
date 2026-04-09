'use client';

import { useState } from 'react';

import { useStyle } from '@/components/StyleContext';

/* ═══════════════════════════════════════════════════════════
   DAY TABS — CARING / DOING / SHARING
   ═══════════════════════════════════════════════════════════ */

type Tab = 'feeling' | 'doing' | 'sharing';

const TABS: { id: Tab; label: string }[] = [
  { id: 'feeling', label: 'Caring' },
  { id: 'doing', label: 'Doing' },
  { id: 'sharing', label: 'Sharing' },
];

interface DayTabsProps {
  feelingContent: React.ReactNode;
  doingContent: React.ReactNode;
  sharingContent: React.ReactNode;
}

export default function DayTabs({ feelingContent, doingContent, sharingContent }: DayTabsProps) {
  const [active, setActive] = useState<Tab>('feeling');
  const { style } = useStyle();

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
              className="flex-1 cursor-pointer rounded-xl py-3 uppercase tracking-[0.18em] transition-all duration-200"
              style={{
                background: isActive ? '#C4A06015' : 'transparent',
                border: `1.5px solid ${isActive ? '#8A6A4A' : '#8A6A4A25'}`,
                color: '#6B4830',
                fontFamily: 'var(--font-serif)',
                fontSize: '13px',
                fontWeight: 600,
                letterSpacing: '0.18em',
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

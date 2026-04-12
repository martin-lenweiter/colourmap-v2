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
              className="flex-1 cursor-pointer rounded-xl py-2.5 uppercase tracking-[0.08em] transition-all duration-200"
              style={{
                background: isActive ? '#C4A06018' : 'transparent',
                border: `1.5px solid ${isActive ? '#C4A060' : 'hsl(var(--border) / 0.25)'}`,
                color: 'hsl(var(--foreground))',
                fontFamily: style.headingFont,
                fontSize: style.titleSize,
                fontWeight: style.weight.title,
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

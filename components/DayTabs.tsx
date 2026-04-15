'use client';

import { useEffect, useState } from 'react';

import { useStyle } from '@/components/StyleContext';

/* ═══════════════════════════════════════════════════════════
   DAY TABS — COCKPIT / OVERVIEW
   Cockpit = daily pulse (balance arc + compass carousel).
   Overview = wide-angle life categories map.
   Caring / Doing / Sharing now live inside the compass carousel
   in the cockpit — no need to duplicate them at the top level.
   ═══════════════════════════════════════════════════════════ */

type Tab = 'cockpit' | 'overview';

const TABS: { id: Tab; label: string }[] = [
  { id: 'cockpit', label: 'Cockpit' },
  { id: 'overview', label: 'Overview' },
];

const TAB_KEY = 'colourmap:day-tab';

interface DayTabsProps {
  cockpitContent: React.ReactNode;
  overviewContent: React.ReactNode;
}

export default function DayTabs({ cockpitContent, overviewContent }: DayTabsProps) {
  const [active, setActive] = useState<Tab>('cockpit');
  const { style } = useStyle();

  // Restore last-chosen tab on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(TAB_KEY);
      if (stored === 'cockpit' || stored === 'overview') setActive(stored);
    } catch {
      /* silent */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(TAB_KEY, active);
    } catch {
      /* silent */
    }
  }, [active]);

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
        {active === 'cockpit' && cockpitContent}
        {active === 'overview' && overviewContent}
      </div>
    </div>
  );
}

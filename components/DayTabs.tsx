'use client';

import { useEffect, useState } from 'react';

import { useStyle } from '@/components/StyleContext';
import { haptic } from '@/lib/haptics';

/* ═══════════════════════════════════════════════════════════
   DAY TABS — CHECK IN / OVERVIEW
   Check in = daily pulse (the emotional register + pillboxes).
   Overview = wide-angle life map + compass carousel.
   ═══════════════════════════════════════════════════════════ */

type Tab = 'checkin' | 'overview';

// Day = Check in + Overview. Sounds moved out to its own top-nav tab
// (/sounds) so the Day surface stays about the feeling/doing rhythm.
const TABS: { id: Tab; label: string }[] = [
  { id: 'checkin', label: 'Check in' },
  { id: 'overview', label: 'Overview' },
];

const TAB_KEY = 'colourmap:day-tab';

interface DayTabsProps {
  checkinContent: React.ReactNode;
  overviewContent: React.ReactNode;
}

export default function DayTabs({ checkinContent, overviewContent }: DayTabsProps) {
  const [active, setActive] = useState<Tab>('checkin');
  const { style } = useStyle();

  // Restore last-chosen tab on mount. Previous key values ('cockpit',
  // 'tuner', 'mastery') are remapped to the nearest surviving tab so
  // users don't land on a disappeared tab after upgrade.
  useEffect(() => {
    try {
      const stored = localStorage.getItem(TAB_KEY);
      if (stored === 'overview') setActive('overview');
      else setActive('checkin');
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
    <div className="space-y-6">
      {/* Tab selectors — bigger, more breathing room on phone */}
      <div className="flex gap-2">
        {TABS.map((tab) => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                if (tab.id !== active) haptic('tap');
                setActive(tab.id);
              }}
              className="flex-1 cursor-pointer rounded-2xl py-3.5 uppercase tracking-[0.18em] transition-all duration-200"
              style={{
                background: isActive ? '#C4A06018' : 'transparent',
                border: `1.5px solid ${isActive ? '#C4A060' : 'hsl(var(--border) / 0.25)'}`,
                color: 'hsl(var(--foreground))',
                fontFamily: style.headingFont,
                fontSize: '15px',
                fontWeight: isActive ? 700 : 600,
                minHeight: 48,
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="animate-in fade-in duration-200">
        {active === 'checkin' && checkinContent}
        {active === 'overview' && overviewContent}
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';

import { useStyle } from '@/components/StyleContext';

/* ═══════════════════════════════════════════════════════════
   DAY TABS — CHECK IN / OVERVIEW
   Check in = daily pulse (the emotional register + pillboxes).
   Overview = wide-angle life map + compass carousel.
   ═══════════════════════════════════════════════════════════ */

type Tab = 'checkin' | 'overview' | 'mastery' | 'tuner';

// V1: Check in + Sounds only. Overview + Mastery hidden — restore by uncommenting.
const TABS: { id: Tab; label: string }[] = [
  { id: 'checkin', label: 'Check in' },
  // { id: 'overview', label: 'Overview' },
  // { id: 'mastery', label: 'Mastery' },
  { id: 'tuner', label: 'Sounds' },
];

const TAB_KEY = 'colourmap:day-tab';

interface DayTabsProps {
  checkinContent: React.ReactNode;
  overviewContent: React.ReactNode;
  masteryContent?: React.ReactNode;
  tunerContent?: React.ReactNode;
}

export default function DayTabs({
  checkinContent,
  overviewContent,
  masteryContent,
  tunerContent,
}: DayTabsProps) {
  const [active, setActive] = useState<Tab>('checkin');
  const { style } = useStyle();

  // Restore last-chosen tab on mount. Previous key values ('cockpit') are
  // mapped to 'checkin' so users don't get bounced to Overview on upgrade.
  useEffect(() => {
    try {
      const stored = localStorage.getItem(TAB_KEY);
      if (stored === 'cockpit' || stored === 'checkin') setActive('checkin');
      else if (stored === 'overview') setActive('overview');
      else if (stored === 'mastery') setActive('mastery');
      else if (stored === 'tuner') setActive('tuner');
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
              className="flex-1 cursor-pointer rounded-xl py-2.5 uppercase tracking-[0.18em] transition-all duration-200"
              style={{
                background: isActive ? '#C4A06018' : 'transparent',
                border: `1.5px solid ${isActive ? '#C4A060' : 'hsl(var(--border) / 0.25)'}`,
                color: 'hsl(var(--foreground))',
                fontFamily: style.headingFont,
                fontSize: '13px',
                fontWeight: isActive ? 700 : 600,
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
        {active === 'mastery' && masteryContent}
      </div>
      {/* Tuner stays mounted so audio keeps playing across tabs */}
      <div style={{ display: active === 'tuner' ? 'block' : 'none' }}>{tunerContent}</div>
    </div>
  );
}

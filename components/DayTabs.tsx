'use client';

import { useEffect, useState } from 'react';

import { useStyle } from '@/components/StyleContext';
import { haptic } from '@/lib/haptics';

const LS_CHECKINS = 'colourmap:check-ins';

// Mirror of computeStreak from DayRail. Lifted inline so the phone
// (which hides DayRail) still sees the streak under the tab strip.
function computeStreakFromStorage(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = localStorage.getItem(LS_CHECKINS);
    if (!raw) return 0;
    const entries = JSON.parse(raw);
    if (!Array.isArray(entries) || entries.length === 0) return 0;
    const days = new Set<string>();
    for (const e of entries) {
      if (!e?.date) continue;
      days.add(new Date(e.date).toISOString().slice(0, 10));
    }
    const today = new Date();
    let streak = 0;
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      if (days.has(key)) streak++;
      else if (i > 0) break;
    }
    return streak;
  } catch {
    return 0;
  }
}

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
  /** Today's date ("Friday 24 April") shown as a tiny header above the
   *  tab strip so it belongs to the "today's scan" block instead of
   *  floating on its own between the nav and the tabs. */
  dateLabel?: string;
}

export default function DayTabs({ checkinContent, overviewContent, dateLabel }: DayTabsProps) {
  const [active, setActive] = useState<Tab>('checkin');
  const [streak, setStreak] = useState(0);
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
    setStreak(computeStreakFromStorage());
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
      <div>
        {dateLabel && (
          <p
            className="text-center italic"
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '14px',
              color: '#7A5438',
              opacity: 0.7,
              letterSpacing: '0.06em',
              // Sits centered in the negative space between the global
              // nav (above) and the tab strip (below) — bigger margin
              // top + bottom so it doesn't feel squashed.
              marginTop: 14,
              marginBottom: 18,
            }}
          >
            {dateLabel}
          </p>
        )}
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
        {/* Streak line — compact status right under the tab strip so
            it's visible on phone too (DayRail is desktop-only). Shows
            nothing when there's no streak yet, to avoid nagging. */}
        {streak > 0 && (
          <p
            className="text-center"
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '12px',
              color: '#C4A060',
              opacity: 0.85,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              marginTop: 4,
            }}
          >
            <span style={{ fontWeight: 700 }}>{streak}</span>
            <span style={{ fontWeight: 500, opacity: 0.75, marginLeft: 6 }}>
              day{streak === 1 ? '' : 's'} · streak
            </span>
          </p>
        )}
      </div>

      {/* Content */}
      <div className="animate-in fade-in duration-200">
        {active === 'checkin' && checkinContent}
        {active === 'overview' && overviewContent}
      </div>
    </div>
  );
}

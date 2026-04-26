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
   DAY TABS — two tiers, separate heights
   - Top mini-strip:  LIST  ·  ROAD
       List = today's pulse (the inner trio below)
       Road = wide-angle life map (compasses + categories)
   - Inner trio (only visible inside List):
       FEELING · DOING · SHARING
       — emotion · agenda + missions · social/circles —
   Lifting List/Road into its own row keeps the trio from
   competing with the wide-overview surface for the same band of
   space. (Per Martin 2026-04-26.)
   ═══════════════════════════════════════════════════════════ */

type Scope = 'list' | 'road';
type Tab = 'feeling' | 'doing' | 'sharing';

const SCOPES: { id: Scope; label: string }[] = [
  { id: 'list', label: 'List' },
  { id: 'road', label: 'Road' },
];

const TABS: { id: Tab; label: string }[] = [
  { id: 'feeling', label: 'Feeling' },
  { id: 'doing', label: 'Doing' },
  { id: 'sharing', label: 'Sharing' },
];

const TAB_KEY = 'colourmap:day-tab';
const SCOPE_KEY = 'colourmap:day-scope';

interface DayTabsProps {
  feelingContent: React.ReactNode;
  doingContent: React.ReactNode;
  sharingContent: React.ReactNode;
  roadContent: React.ReactNode;
  /** Today's date ("Friday 24 April") shown as a tiny header above the
   *  tab strip so it belongs to the "today's scan" block instead of
   *  floating on its own between the nav and the tabs. */
  dateLabel?: string;
}

export default function DayTabs({
  feelingContent,
  doingContent,
  sharingContent,
  roadContent,
  dateLabel,
}: DayTabsProps) {
  const [scope, setScope] = useState<Scope>('list');
  const [active, setActive] = useState<Tab>('feeling');
  const [streak, setStreak] = useState(0);
  const { style } = useStyle();

  // Restore last-chosen scope + tab on mount. Legacy values are
  // remapped: 'checkin' → 'feeling', 'overview' → 'road'. So users
  // who previously sat on the Overview tab land on Road, not on a
  // disappeared label.
  useEffect(() => {
    try {
      const storedScope = localStorage.getItem(SCOPE_KEY);
      if (storedScope === 'road') setScope('road');
      else setScope('list');

      const storedTab = localStorage.getItem(TAB_KEY);
      if (storedTab === 'doing' || storedTab === 'sharing') setActive(storedTab);
      else if (storedTab === 'overview') setScope('road');
      else setActive('feeling');
    } catch {
      /* silent */
    }
    setStreak(computeStreakFromStorage());
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(TAB_KEY, active);
      localStorage.setItem(SCOPE_KEY, scope);
    } catch {
      /* silent */
    }
  }, [active, scope]);

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        {dateLabel && (
          <p
            className="text-center italic"
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '14px',
              color: '#7A5438',
              opacity: 0.7,
              letterSpacing: '0.06em',
              // Symmetric vertical breathing room — same negative space
              // above and below so the date sits visually centered in
              // its band, not pushed down by the global nav above.
              marginTop: 6,
              marginBottom: 6,
            }}
          >
            {dateLabel}
          </p>
        )}
        {/* Top mini-strip — List · Road. Tighter / lighter than the
            inner tabs so the two tiers read as different priorities. */}
        <div className="flex justify-center gap-1">
          {SCOPES.map((s) => {
            const isOn = scope === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  if (s.id !== scope) haptic('tap');
                  setScope(s.id);
                }}
                className="cursor-pointer rounded-full px-4 py-1.5 uppercase tracking-[0.22em] transition-all duration-200"
                style={{
                  background: isOn ? '#C4A06014' : 'transparent',
                  border: `1px solid ${isOn ? '#C4A06070' : 'transparent'}`,
                  color: isOn ? '#7A5438' : '#8A6A4A',
                  fontFamily: style.headingFont,
                  fontSize: '11px',
                  fontWeight: isOn ? 700 : 600,
                  opacity: isOn ? 1 : 0.65,
                }}
              >
                {s.label}
              </button>
            );
          })}
        </div>
        {/* Inner trio — only when scope = list. Bigger, full-width,
            this is the daily-pulse register. */}
        {scope === 'list' && (
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
                  className="flex-1 cursor-pointer rounded-2xl py-3 uppercase tracking-[0.16em] transition-all duration-200"
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
        )}
        {/* Streak line — under whichever strip is current, so the
            phone always sees it (DayRail is desktop-only). */}
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
              marginTop: 2,
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
        {scope === 'road' && roadContent}
        {scope === 'list' && active === 'feeling' && feelingContent}
        {scope === 'list' && active === 'doing' && doingContent}
        {scope === 'list' && active === 'sharing' && sharingContent}
      </div>
    </div>
  );
}

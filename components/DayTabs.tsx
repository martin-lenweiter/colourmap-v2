'use client';

import { useEffect, useState } from 'react';

import { useStyle } from '@/components/StyleContext';
import { haptic } from '@/lib/haptics';

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

type Scope = 'list' | 'list2';
type Tab = 'feeling' | 'doing' | 'sharing';
type Tab2 = 'feeling2' | 'doing2' | 'overview2';

const SCOPES: { id: Scope; label: string }[] = [
  { id: 'list', label: 'List' },
  { id: 'list2', label: 'List 2' },
];

const TABS: { id: Tab; label: string }[] = [
  { id: 'feeling', label: 'Feeling' },
  { id: 'doing', label: 'Doing' },
  { id: 'sharing', label: 'Sharing' },
];

const TABS2: { id: Tab2; label: string }[] = [
  { id: 'feeling2', label: 'Emotion' },
  { id: 'doing2', label: 'Mission' },
  { id: 'overview2', label: 'Progress' },
];

const TAB_KEY = 'colourmap:day-tab';
const SCOPE_KEY = 'colourmap:day-scope';

interface DayTabsProps {
  feelingContent: React.ReactNode;
  ringContent: React.ReactNode;
  doingContent: React.ReactNode;
  sharingContent: React.ReactNode;
  roadContent: React.ReactNode;
  list2Content: React.ReactNode;
  /** Today's date ("Friday 24 April") shown as a tiny header above the
   *  tab strip so it belongs to the "today's scan" block instead of
   *  floating on its own between the nav and the tabs. */
  dateLabel?: string;
}

export default function DayTabs({
  feelingContent,
  ringContent,
  doingContent,
  sharingContent,
  roadContent,
  list2Content,
  dateLabel,
}: DayTabsProps) {
  const [scope, setScope] = useState<Scope>('list');
  const [active, setActive] = useState<Tab>('feeling');
  const [active2, setActive2] = useState<Tab2>('feeling2');
  const { style } = useStyle();

  useEffect(() => {
    try {
      const storedScope = localStorage.getItem(SCOPE_KEY);
      if (storedScope === 'list2') setScope('list2');
      else setScope('list');

      const storedTab = localStorage.getItem(TAB_KEY);
      if (storedTab === 'doing' || storedTab === 'sharing') setActive(storedTab as Tab);
      else setActive('feeling');

      const storedTab2 = localStorage.getItem('colourmap:day-tab2');
      if (storedTab2 === 'doing2' || storedTab2 === 'overview2') setActive2(storedTab2 as Tab2);
      else setActive2('feeling2');
    } catch {
      /* silent */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(TAB_KEY, active);
      localStorage.setItem(SCOPE_KEY, scope);
      localStorage.setItem('colourmap:day-tab2', active2);
    } catch {
      /* silent */
    }
  }, [active, scope, active2]);

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
        {/* Inner tabs — List scope: Feeling (grouped) · Doing · Sharing */}
        {scope === 'list' && (
          <div className="flex gap-3">
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
                  className="flex-1 cursor-pointer rounded-2xl py-4 uppercase tracking-[0.14em] transition-all duration-200"
                  style={{
                    background: isActive ? '#C4A06018' : 'transparent',
                    border: `1.5px solid ${isActive ? '#C4A060' : 'hsl(var(--border) / 0.25)'}`,
                    color: isActive ? '#5C3018' : 'hsl(var(--foreground))',
                    fontFamily: style.headingFont,
                    fontSize: '15px',
                    fontWeight: 700,
                    minHeight: 60,
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Inner tabs — List 2 scope: Feeling 2 · Doing 2 · Overview 2 */}
        {scope === 'list2' && (
          <div className="flex gap-3">
            {TABS2.map((tab) => {
              const isActive = active2 === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    if (tab.id !== active2) haptic('tap');
                    setActive2(tab.id);
                  }}
                  className="flex-1 cursor-pointer rounded-2xl py-4 uppercase tracking-[0.14em] transition-all duration-200"
                  style={{
                    background: isActive ? '#C4A06018' : 'transparent',
                    border: `1.5px solid ${isActive ? '#C4A060' : 'hsl(var(--border) / 0.25)'}`,
                    color: isActive ? '#5C3018' : 'hsl(var(--foreground))',
                    fontFamily: style.headingFont,
                    fontSize: '15px',
                    fontWeight: 700,
                    minHeight: 60,
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="animate-in fade-in duration-200">
        {/* List scope */}
        {scope === 'list' && active === 'feeling' && (
          <div className="space-y-6">
            {feelingContent}
            {ringContent}
          </div>
        )}
        {scope === 'list' && active === 'doing' && doingContent}
        {scope === 'list' && active === 'sharing' && sharingContent}

        {/* List 2 scope */}
        {scope === 'list2' && active2 === 'feeling2' && ringContent}
        {scope === 'list2' && active2 === 'doing2' && list2Content}
        {scope === 'list2' && active2 === 'overview2' && roadContent}
      </div>
    </div>
  );
}

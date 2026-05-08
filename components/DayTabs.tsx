'use client';

import { useEffect, useState } from 'react';

import { useStyle } from '@/components/StyleContext';
import { haptic } from '@/lib/haptics';

type Tab = 'emotion' | 'mission' | 'progress';

const TABS: { id: Tab; label: string }[] = [
  { id: 'emotion', label: 'Emotion' },
  { id: 'mission', label: 'Mission' },
  { id: 'progress', label: 'Progress' },
];

const TAB_KEY = 'colourmap:day-tab2';

interface DayTabsProps {
  emotionContent: React.ReactNode;
  missionContent: React.ReactNode;
  progressContent: React.ReactNode;
  belowTabs?: React.ReactNode;
}

export default function DayTabs({
  emotionContent,
  missionContent,
  progressContent,
  belowTabs,
}: DayTabsProps) {
  const [active, setActive] = useState<Tab>('emotion');
  const { style } = useStyle();

  useEffect(() => {
    try {
      const stored = localStorage.getItem(TAB_KEY);
      if (stored === 'mission' || stored === 'progress') setActive(stored as Tab);
      else setActive('emotion');
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
    <div className="space-y-5">
      <div className="space-y-3">
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
                  color: 'hsl(var(--foreground))',
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
        {belowTabs && (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 8 }}>
            {belowTabs}
          </div>
        )}
      </div>

      <div className="animate-in fade-in duration-200">
        {active === 'emotion' && emotionContent}
        {active === 'mission' && missionContent}
        {active === 'progress' && progressContent}
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useStyle } from '@/components/StyleContext';
import { haptic } from '@/lib/haptics';

type Tab = 'emotion' | 'mission' | 'progress';

const TABS: { id: Tab; label: string }[] = [
  { id: 'emotion', label: 'Emotions' },
  { id: 'mission', label: 'Missions' },
  { id: 'progress', label: 'Progress' },
];

const TAB_KEY = 'colourmap:day-tab2';

interface DayTabsProps {
  emotionContent: React.ReactNode;
  missionContent: React.ReactNode;
  progressContent: React.ReactNode;
}

function hex2rgba(hex: string, a: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}

export default function DayTabs({ emotionContent, missionContent, progressContent }: DayTabsProps) {
  const [active, setActive] = useState<Tab>('emotion');
  const { tabStyle, tabFillColor, appTheme: _appTheme } = useStyle();

  useEffect(() => {
    try {
      const stored = localStorage.getItem(TAB_KEY);
      if (stored === 'mission' || stored === 'progress') setActive(stored as Tab);
      else setActive('emotion');
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(TAB_KEY, active);
    } catch {}
  }, [active]);

  /* Tab appearance — CSS vars override when palette defines flat tab colours */
  function tabBg(isActive: boolean) {
    if (tabStyle === 'filled') {
      const fallback = isActive ? hex2rgba(tabFillColor, 0.88) : hex2rgba(tabFillColor, 0.06);
      return isActive
        ? `var(--palette-tab-active-bg, ${fallback})`
        : `var(--palette-tab-inactive-bg, ${fallback})`;
    }
    return isActive ? 'rgba(196,160,96,0.28)' : 'hsl(var(--card))';
  }
  function tabBorder(isActive: boolean) {
    if (tabStyle === 'filled') {
      return `1.5px solid ${isActive ? hex2rgba(tabFillColor, 0.75) : hex2rgba(tabFillColor, 0.18)}`;
    }
    return `1.5px solid ${isActive ? 'rgba(196,160,96,0.65)' : 'hsl(var(--border) / 0.35)'}`;
  }
  function tabColor(isActive: boolean) {
    if (tabStyle === 'filled') {
      const fallback = isActive ? 'rgba(240,216,152,0.92)' : hex2rgba(tabFillColor, 0.55);
      return isActive
        ? `var(--palette-tab-active-text, ${fallback})`
        : `var(--palette-tab-inactive-text, ${fallback})`;
    }
    return 'hsl(var(--foreground))';
  }

  return (
    <div className="space-y-6">
      {/* ── Tab row ── */}
      <div style={{ display: 'flex', gap: 6 }}>
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
              className="flex-1 min-w-0 cursor-pointer rounded-2xl transition-all duration-200"
              style={{
                background: tabBg(isActive),
                border: tabBorder(isActive),
                color: tabColor(isActive),
                fontFamily: 'var(--font-serif)',
                fontSize: '14px',
                fontWeight: 900,
                letterSpacing: '0.08em',
                minHeight: 72,
                textAlign: 'center',
                textTransform: 'uppercase',
                padding: '20px 6px',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="animate-in fade-in duration-200">
        {active === 'emotion' && emotionContent}
        {active === 'mission' && missionContent}
        {active === 'progress' && progressContent}
      </div>
    </div>
  );
}

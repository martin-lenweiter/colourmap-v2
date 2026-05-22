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
  headerBackdrop?: {
    image: string;
    enabled: boolean;
    dayImage?: boolean;
  };
}

function hex2rgba(hex: string, a: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}

export default function DayTabs({
  emotionContent,
  missionContent,
  progressContent,
  headerBackdrop,
}: DayTabsProps) {
  const [active, setActive] = useState<Tab>('emotion');
  const [isLightTheme, setIsLightTheme] = useState(true);
  const [isPhone, setIsPhone] = useState(false);
  const { tabStyle, tabFillColor } = useStyle();

  useEffect(() => {
    try {
      const stored = localStorage.getItem(TAB_KEY);
      if (stored === 'mission' || stored === 'progress') setActive(stored as Tab);
      else setActive('emotion');
    } catch {}
  }, []);

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const query = window.matchMedia('(max-width: 520px)');
    function syncPhone() {
      setIsPhone(query.matches);
    }
    syncPhone();
    query.addEventListener('change', syncPhone);
    return () => query.removeEventListener('change', syncPhone);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(TAB_KEY, active);
    } catch {}
  }, [active]);

  useEffect(() => {
    function syncLightTheme() {
      const color = localStorage.getItem('colourmap-theme') ?? 'paper';
      const palette = localStorage.getItem('colourmap-palette') ?? 'light-brown';
      setIsLightTheme(color === 'paper' || color === 'golden' || palette === 'light-brown');
    }
    syncLightTheme();
    const observer = new MutationObserver(syncLightTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    window.addEventListener('storage', syncLightTheme);
    return () => {
      observer.disconnect();
      window.removeEventListener('storage', syncLightTheme);
    };
  }, []);

  /* Tab appearance — CSS vars override when palette defines flat tab colours */
  function tabBg(isActive: boolean) {
    if (isLightTheme) {
      return 'transparent';
    }
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
    if (isLightTheme) {
      return 'var(--header-text, #5C3018)';
    }
    if (tabStyle === 'filled') {
      return 'var(--palette-tab-active-text, rgba(240,216,152,0.92))';
    }
    return 'hsl(var(--foreground))';
  }

  return (
    <div className="space-y-6">
      {/* ── Tab row ── */}
      <div
        style={{
          position: 'relative',
          width: headerBackdrop?.enabled
            ? isPhone
              ? 'calc(100% + 16px)'
              : 'calc(100% + 32px)'
            : undefined,
          marginLeft: headerBackdrop?.enabled ? (isPhone ? -8 : -16) : undefined,
          marginRight: headerBackdrop?.enabled ? (isPhone ? -8 : -16) : undefined,
          marginTop: headerBackdrop?.enabled ? -12 : 0,
          padding: headerBackdrop?.enabled ? (isPhone ? '16px 8px 12px' : '20px 16px 14px') : 0,
          minHeight: headerBackdrop?.enabled ? (isPhone ? 126 : 154) : undefined,
          overflow: 'hidden',
        }}
      >
        {headerBackdrop?.enabled && (
          <>
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `url("${headerBackdrop.image}")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center 46%',
                transition: 'background-image 900ms ease',
              }}
            />
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                inset: 0,
                background: headerBackdrop.dayImage
                  ? 'linear-gradient(180deg, rgba(255,248,226,0.12), rgba(46,18,6,0.38))'
                  : 'linear-gradient(180deg, rgba(5,3,2,0.1), rgba(5,3,2,0.58))',
              }}
            />
          </>
        )}
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            gap: 6,
            width: '100%',
            maxWidth: 640,
            marginInline: 'auto',
          }}
        >
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
                  background: headerBackdrop?.enabled
                    ? isActive
                      ? 'rgba(18,10,5,0.42)'
                      : 'rgba(18,10,5,0.22)'
                    : tabBg(isActive),
                  border: headerBackdrop?.enabled
                    ? `1.5px solid ${isActive ? 'rgba(240,216,152,0.7)' : 'rgba(240,216,152,0.32)'}`
                    : tabBorder(isActive),
                  color: headerBackdrop?.enabled ? 'rgba(240,216,152,0.94)' : tabColor(isActive),
                  fontFamily: 'var(--font-serif)',
                  fontSize: '14px',
                  fontWeight: 900,
                  letterSpacing: '0.08em',
                  minHeight: headerBackdrop?.enabled && isPhone ? 58 : 72,
                  textAlign: 'center',
                  textTransform: 'uppercase',
                  padding: headerBackdrop?.enabled && isPhone ? '15px 4px' : '20px 6px',
                  backdropFilter: headerBackdrop?.enabled ? 'blur(2px)' : undefined,
                  boxShadow: headerBackdrop?.enabled
                    ? '0 8px 24px rgba(0,0,0,0.16), inset 0 1px 0 rgba(255,255,255,0.08)'
                    : undefined,
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="animate-in fade-in duration-200">
        {active === 'emotion' && emotionContent}
        {active === 'mission' && missionContent}
        {active === 'progress' && progressContent}
      </div>
    </div>
  );
}

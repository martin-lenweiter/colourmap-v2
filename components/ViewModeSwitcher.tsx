'use client';

import { useViewMode } from './ViewModeContext';

function DesktopIcon({ active }: { active: boolean }) {
  const c = active ? 'rgba(196,160,96,0.9)' : 'rgba(196,160,96,0.35)';
  return (
    <svg width="22" height="16" viewBox="0 0 22 16" fill="none">
      <rect x="1" y="1" width="20" height="12" rx="2" stroke={c} strokeWidth="1.5" />
      <line x1="8" y1="13" x2="14" y2="13" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="11" y1="13" x2="11" y2="15" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function PhoneIcon({ active }: { active: boolean }) {
  const c = active ? 'rgba(196,160,96,0.9)' : 'rgba(196,160,96,0.35)';
  return (
    <svg width="12" height="20" viewBox="0 0 12 20" fill="none">
      <rect x="1" y="1" width="10" height="18" rx="2.5" stroke={c} strokeWidth="1.5" />
      <circle cx="6" cy="16.5" r="1" fill={c} />
    </svg>
  );
}

export default function ViewModeSwitcher() {
  const { mode, setMode } = useViewMode();
  const next = mode === 'desktop' ? 'phone' : 'desktop';

  return (
    <button
      type="button"
      onClick={() => setMode(next)}
      title={mode === 'desktop' ? 'Desktop view' : 'Phone view'}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 36,
        height: 28,
        borderRadius: 7,
        border: '1px solid rgba(196,160,96,0.18)',
        background: 'rgba(196,160,96,0.07)',
        cursor: 'pointer',
        padding: 0,
      }}
    >
      {mode === 'desktop' ? <DesktopIcon active /> : <PhoneIcon active />}
    </button>
  );
}

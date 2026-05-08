'use client';

import { useState } from 'react';

import CheckInPing from '@/components/CheckInPing';
import DailyRituals from '@/components/DailyRituals';
import DayRoad from '@/components/DayRoad';
import DayTabs from '@/components/DayTabs';
import DayView3D from '@/components/DayView3D';
import DoingCardsPanel from '@/components/DoingCardsPanel';
import FeelingCircles2 from '@/components/FeelingCircles2';
import FirstRunOnboarding from '@/components/FirstRunOnboarding';
import InfographicsView from '@/components/InfographicsView';
import Overview2 from '@/components/Overview2';
import { StyleProvider } from '@/components/StyleContext';
import TodaysField from '@/components/TodaysField';

function DayContent() {
  const [roadOpen, setRoadOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const dateStr = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  return (
    <div className="mx-auto w-full max-w-2xl space-y-4 px-4 py-3" style={{ paddingBottom: 36 }}>
      <FirstRunOnboarding />
      <TodaysField />
      <CheckInPing />
      {roadOpen && <DayRoad onClose={() => setRoadOpen(false)} />}
      {mapOpen && <InfographicsView onClose={() => setMapOpen(false)} />}
      {viewOpen && <DayView3D onClose={() => setViewOpen(false)} />}
      {/* Fixed date at the bottom */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          textAlign: 'center',
          padding: '6px 0 8px',
          fontFamily: 'var(--font-serif)',
          fontSize: 11,
          fontStyle: 'italic',
          letterSpacing: '0.06em',
          color: 'rgba(122,84,56,0.55)',
          pointerEvents: 'none',
          zIndex: 10,
        }}
      >
        {dateStr}
      </div>

      <DayTabs
        belowTabs={
          <div style={{ display: 'flex', gap: 8 }}>
            {(
              [
                { label: 'Road', active: roadOpen, toggle: () => setRoadOpen((v) => !v) },
                { label: 'Map', active: mapOpen, toggle: () => setMapOpen((v) => !v) },
                { label: 'View', active: viewOpen, toggle: () => setViewOpen((v) => !v) },
              ] as const
            ).map(({ label, active, toggle }) => (
              <button
                key={label}
                type="button"
                onClick={toggle}
                style={{
                  padding: '4px 14px',
                  borderRadius: 20,
                  border: `1px solid ${active ? 'rgba(92,48,24,0.55)' : 'rgba(122,84,56,0.28)'}`,
                  background: active ? 'rgba(92,48,24,0.1)' : 'transparent',
                  color: active ? '#5C3018' : '#7A5438',
                  fontFamily: 'var(--font-serif)',
                  fontSize: 11,
                  fontWeight: active ? 700 : 500,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase' as const,
                  cursor: 'pointer',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        }
        emotionContent={<FeelingCircles2 />}
        missionContent={
          <div className="space-y-3">
            <DoingCardsPanel />
            <DailyRituals />
          </div>
        }
        progressContent={<Overview2 />}
      />
    </div>
  );
}

export default function DayPage() {
  return (
    <StyleProvider>
      <DayContent />
    </StyleProvider>
  );
}

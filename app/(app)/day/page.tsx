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
import Overview2 from '@/components/Overview2';
import { StyleProvider } from '@/components/StyleContext';
import TodaysField from '@/components/TodaysField';

function DayContent() {
  const [roadOpen, setRoadOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const dateStr = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  return (
    <div className="mx-auto w-full max-w-2xl space-y-4 px-4 py-3">
      <FirstRunOnboarding />
      <TodaysField />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {(['Road', 'View'] as const).map((label) => (
          <button
            key={label}
            type="button"
            onClick={() => (label === 'Road' ? setRoadOpen(true) : setViewOpen(true))}
            style={{
              padding: '4px 11px',
              borderRadius: 20,
              border: '1px solid rgba(196,160,96,0.28)',
              background: 'transparent',
              color: '#A08060',
              fontFamily: 'var(--font-serif)',
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: '0.1em',
              textTransform: 'uppercase' as const,
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            {label}
          </button>
        ))}
      </div>
      {roadOpen && <DayRoad onClose={() => setRoadOpen(false)} />}
      {viewOpen && <DayView3D onClose={() => setViewOpen(false)} />}
      <CheckInPing />
      <DayTabs
        dateLabel={dateStr}
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

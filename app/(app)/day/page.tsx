'use client';

import CompassCarousel from '@/components/CompassCarousel';
import DailyAgenda from '@/components/DailyAgenda';
import DayTabs from '@/components/DayTabs';
import FeelingCheckInCard from '@/components/FeelingCheckInCard';
import LifeCategories from '@/components/LifeCategories';
import ReflectBox from '@/components/ReflectBox';
import { StyleProvider } from '@/components/StyleContext';

function DayContent() {
  const dateStr = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 py-6">
      <p
        className="text-center"
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '13px',
          color: '#8A6A4A',
          opacity: 0.6,
          letterSpacing: '0.06em',
        }}
      >
        {dateStr}
      </p>
      <DayTabs
        checkinContent={
          <div className="space-y-4">
            <FeelingCheckInCard />
            <DailyAgenda />
          </div>
        }
        overviewContent={
          <div className="space-y-4">
            <CompassCarousel />
            <LifeCategories />
            <ReflectBox />
          </div>
        }
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

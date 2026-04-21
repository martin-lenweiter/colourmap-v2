'use client';

import CompassCarousel from '@/components/CompassCarousel';
import DailyAgenda from '@/components/DailyAgenda';
import DayTabs from '@/components/DayTabs';
import FeelingCheckInCard from '@/components/FeelingCheckInCard';
import FrequencyBox from '@/components/FrequencyBox';
import LifeCategories from '@/components/LifeCategories';
import MasteryBox from '@/components/MasteryBox';
import ReflectBox from '@/components/ReflectBox';
import SoundLab from '@/components/SoundLab';
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
          fontSize: '14px',
          color: '#7A5438',
          opacity: 0.8,
          letterSpacing: '0.06em',
        }}
      >
        {dateStr}
      </p>
      <DayTabs
        checkinContent={
          <div className="space-y-4">
            <FeelingCheckInCard />
            <FrequencyBox />
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
        masteryContent={<MasteryBox />}
        tunerContent={<SoundLab />}
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

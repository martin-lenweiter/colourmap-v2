'use client';

import CategoryCompass from '@/components/CategoryCompass';
import CheckInPing from '@/components/CheckInPing';
import CompassCarousel from '@/components/CompassCarousel';
import DailyAgenda from '@/components/DailyAgenda';
import DayRail from '@/components/DayRail';
import DayTabs from '@/components/DayTabs';
import FeelingCheckInCard from '@/components/FeelingCheckInCard';
import FirstRunOnboarding from '@/components/FirstRunOnboarding';
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
    <div className="mx-auto flex w-full max-w-6xl gap-6 px-4 py-8 lg:px-6">
      <div className="mx-auto w-full max-w-2xl space-y-6 lg:mx-0 lg:flex-1">
        <FirstRunOnboarding />
        <CheckInPing />
        <p
          className="text-center"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '17px',
            fontStyle: 'italic',
            color: '#7A5438',
            opacity: 0.85,
            letterSpacing: '0.06em',
          }}
        >
          {dateStr}
        </p>
        <DayTabs
          checkinContent={
            <div className="space-y-4">
              {/* Segment — emotions + expression. FrequencyBox was
                  removed entirely from the check-in (user: 'delete
                  the frequency box in check in'). Sound tuning lives
                  on /sounds now. */}
              <FeelingCheckInCard />
              {/* Segment — missions */}
              <DailyAgenda />
            </div>
          }
          overviewContent={
            <div className="space-y-4">
              <CompassCarousel />
              <CategoryCompass />
              <LifeCategories />
              <ReflectBox />
            </div>
          }
          masteryContent={<MasteryBox />}
          tunerContent={<SoundLab />}
        />
      </div>
      <DayRail />
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

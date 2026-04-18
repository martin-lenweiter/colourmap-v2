'use client';

import CompassCarousel from '@/components/CompassCarousel';
import DailyAgenda from '@/components/DailyAgenda';
import DayTabs from '@/components/DayTabs';
import FeelingCheckInCard from '@/components/FeelingCheckInCard';
import LifeCategories from '@/components/LifeCategories';
import ReflectBox from '@/components/ReflectBox';
import { StyleProvider } from '@/components/StyleContext';

function DayContent() {
  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 py-6">
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

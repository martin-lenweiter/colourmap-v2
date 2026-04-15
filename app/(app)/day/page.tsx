'use client';

import CompassCarousel from '@/components/CompassCarousel';
import DayTabs from '@/components/DayTabs';
import FeelingCheckInCard from '@/components/FeelingCheckInCard';
import LifeCategories from '@/components/LifeCategories';
import { StyleProvider } from '@/components/StyleContext';

function DayContent() {
  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 py-6">
      <DayTabs
        cockpitContent={
          <div className="space-y-4">
            <FeelingCheckInCard />
            <CompassCarousel />
          </div>
        }
        overviewContent={
          <div className="space-y-4">
            <LifeCategories />
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

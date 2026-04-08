'use client';

import CareCompass from '@/components/CareCompass';
import DayTabs from '@/components/DayTabs';
import DoingCheckInCard from '@/components/DoingCheckInCard';
import FeelingCheckInCard from '@/components/FeelingCheckInCard';
import ShareCompass from '@/components/ShareCompass';
import SharingCheckInCard from '@/components/SharingCheckInCard';
import StarCompass from '@/components/StarCompass';

export default function DayPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 py-6">
      <div className="mb-4 text-center">
        <h1 className="font-serif text-2xl font-semibold">Today</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your day at a glance.</p>
      </div>

      <DayTabs
        feelingContent={
          <div className="space-y-4">
            <FeelingCheckInCard />
            <CareCompass />
          </div>
        }
        doingContent={
          <div className="space-y-4">
            <DoingCheckInCard />
            <StarCompass />
          </div>
        }
        sharingContent={
          <div className="space-y-4">
            <SharingCheckInCard />
            <ShareCompass />
          </div>
        }
      />
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import ActiveCategoryBanner from '@/components/ActiveCategoryBanner';
import CompassCarousel from '@/components/CompassCarousel';
import LifeCategories from '@/components/LifeCategories';
import LifeCategoriesEmptyState from '@/components/LifeCategoriesEmptyState';
import LifeCategoriesStrip from '@/components/LifeCategoriesStrip';
import LifePathDots from '@/components/LifePathDots';
import ProgressTab from '@/components/ProgressTab';
import ReflectThreeDots from '@/components/ReflectThreeDots';
import SlowWins from '@/components/SlowWins';
import { useStyle } from '@/components/StyleContext';
import WeekShape from '@/components/WeekShape';
import { haptic } from '@/lib/haptics';

type RoadTab = 'overview' | 'progress';
const ROAD_TAB_KEY = 'colourmap:road-tab';

const ROAD_TABS: { id: RoadTab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'progress', label: 'Progress' },
];

export default function RoadView() {
  const { style } = useStyle();
  const [tab, setTab] = useState<RoadTab>('overview');

  useEffect(() => {
    try {
      const stored = localStorage.getItem(ROAD_TAB_KEY);
      if (stored === 'progress') setTab('progress');
    } catch {
      /* silent */
    }
  }, []);

  function switchTab(id: RoadTab) {
    if (id !== tab) haptic('tap');
    setTab(id);
    try {
      localStorage.setItem(ROAD_TAB_KEY, id);
    } catch {
      /* silent */
    }
  }

  return (
    <div className="space-y-5">
      {/* Sub-tab pills */}
      <div className="flex gap-2">
        {ROAD_TABS.map((t) => {
          const isActive = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => switchTab(t.id)}
              className="flex-1 cursor-pointer rounded-2xl py-2.5 uppercase tracking-[0.14em] transition-all duration-200"
              style={{
                background: isActive ? '#C4A06018' : 'transparent',
                border: `1.5px solid ${isActive ? '#C4A060' : 'hsl(var(--border) / 0.25)'}`,
                color: isActive ? '#5C3018' : 'hsl(var(--foreground))',
                fontFamily: style.headingFont,
                fontSize: '18px',
                fontWeight: 700,
                minHeight: 52,
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="animate-in fade-in duration-200">
        {tab === 'overview' && (
          <div className="space-y-6">
            {/* F / D / S axis dots — path + domains */}
            <LifePathDots />
            {/* Reflect — journaling across emotional / wellbeing levels */}
            <ReflectThreeDots />
            <LifeCategoriesEmptyState />
            <WeekShape />
            <LifeCategoriesStrip />
            <ActiveCategoryBanner />
            <SlowWins />
            <CompassCarousel />
            <LifeCategories />
          </div>
        )}
        {tab === 'progress' && <ProgressTab />}
      </div>
    </div>
  );
}

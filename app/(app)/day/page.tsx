'use client';

import { useEffect, useState } from 'react';
import ActiveCompartments from '@/components/ActiveCompartments';
import ArchetypeBridge from '@/components/ArchetypeBridge';
import CheckInPing from '@/components/CheckInPing';
import ColourMapPanel from '@/components/ColourMapPanel';
import DailyRituals from '@/components/DailyRituals';
import DayRoad from '@/components/DayRoad';
import DayTabs from '@/components/DayTabs';
import DayView3D from '@/components/DayView3D';
import FeelingCircles2 from '@/components/FeelingCircles2';
import FirstRunOnboarding from '@/components/FirstRunOnboarding';
import IdeaConstellation from '@/components/IdeaConstellation';
import InfographicsView from '@/components/InfographicsView';
import InnerWork from '@/components/InnerWork';
import LearningHub from '@/components/LearningHub';
import MissionDesignSwitcher from '@/components/MissionDesignSwitcher';
import Overview2 from '@/components/Overview2';
import TodaysField from '@/components/TodaysField';
import { hydrate } from '@/lib/sync';

const DAY_EMOTION_IMAGES = ['/emotions/emotion-sunset-1.webp', '/emotions/emotion-sunset-2.webp'];

const NIGHT_EMOTION_IMAGES = [
  '/emotions/emotion-city-night-1.webp',
  '/emotions/emotion-city-night-2.webp',
];

function EmotionMoodSurface({ children }: { children: React.ReactNode }) {
  const [index, setIndex] = useState(0);
  const [nightMode, setNightMode] = useState(false);

  const images = nightMode ? NIGHT_EMOTION_IMAGES : DAY_EMOTION_IMAGES;
  const currentImage = images[index % images.length];

  useEffect(() => {
    const timer = window.setInterval(() => setIndex((current) => current + 1), 18_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const update = () => {
      setNightMode(root.classList.contains('dark'));
      setIndex(0);
    };
    update();
    const observer = new MutationObserver(update);
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return (
    <div
      style={{
        display: 'grid',
        gap: 12,
      }}
    >
      <div
        style={{
          border: '1px solid var(--panel-border, rgba(122,84,56,0.22))',
          borderRadius: 14,
          overflow: 'hidden',
          background: 'var(--card)',
          boxShadow: '0 12px 28px rgba(92,48,24,0.1)',
        }}
      >
        <img
          src={currentImage}
          alt=""
          aria-hidden="true"
          loading="eager"
          style={{
            display: 'block',
            width: '100%',
            aspectRatio: '16 / 7',
            objectFit: 'cover',
            objectPosition: nightMode ? 'center 42%' : 'center 50%',
            transition: 'opacity 900ms ease',
          }}
        />
      </div>
      <div className="space-y-3" style={{ background: 'transparent' }}>
        {children}
      </div>
    </div>
  );
}

function DayContent() {
  const [roadOpen, setRoadOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [starsOpen, setStarsOpen] = useState(false);
  const [learnOpen, setLearnOpen] = useState(false);
  const [experimentsOpen, setExperimentsOpen] = useState(false);
  const [modesOpen, setModesOpen] = useState(false);

  // Silently restore server state into localStorage on mount.
  // Current session renders from whatever is already local (instant).
  // Next session (or cross-device) benefits from the restored values.
  useEffect(() => {
    hydrate();
  }, []);

  useEffect(() => {
    try {
      if (sessionStorage.getItem('colourmap:open-education') === '1') {
        sessionStorage.removeItem('colourmap:open-education');
        setLearnOpen(true);
      }
    } catch {}
  }, []);

  return (
    <div
      className="mx-auto w-full max-w-2xl space-y-4 px-2 sm:px-4 py-3"
      style={{ paddingBottom: 36 }}
    >
      <FirstRunOnboarding />
      <TodaysField />
      <CheckInPing />
      {starsOpen && <IdeaConstellation onClose={() => setStarsOpen(false)} />}
      {learnOpen && <LearningHub onClose={() => setLearnOpen(false)} />}

      <DayTabs
        emotionContent={
          <EmotionMoodSurface>
            <InnerWork />
            <div style={{ height: 20 }} />
            <FeelingCircles2 />
            {/* Experiments — collapsible pill */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 10,
                paddingTop: 8,
              }}
            >
              <button
                type="button"
                onClick={() => setExperimentsOpen((v) => !v)}
                style={{
                  padding: '4px 18px',
                  borderRadius: 20,
                  border: `1px solid ${experimentsOpen ? 'var(--panel-border, rgba(122,84,56,0.45))' : 'var(--panel-border, rgba(122,84,56,0.22))'}`,
                  background: 'transparent',
                  color: 'var(--light-surface-muted, #7A5438)',
                  fontFamily: 'var(--font-serif)',
                  fontSize: 11,
                  fontWeight: 500,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase' as const,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                Experiments
                <span style={{ fontSize: 8, opacity: 0.4 }}>{experimentsOpen ? '▲' : '▼'}</span>
              </button>
              {experimentsOpen && (
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
                        border: `1px solid ${active ? 'var(--panel-border, rgba(92,48,24,0.55))' : 'var(--panel-border, rgba(122,84,56,0.28))'}`,
                        background: active
                          ? 'var(--palette-l3-bg, rgba(92,48,24,0.1))'
                          : 'transparent',
                        color: active
                          ? 'var(--light-surface-text, #5C3018)'
                          : 'var(--light-surface-muted, #7A5438)',
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
              )}
            </div>
            {roadOpen && <DayRoad embedded onClose={() => setRoadOpen(false)} />}
            {mapOpen && <InfographicsView embedded onClose={() => setMapOpen(false)} />}
            {viewOpen && <DayView3D embedded onClose={() => setViewOpen(false)} />}
          </EmotionMoodSurface>
        }
        missionContent={
          <div className="space-y-3">
            <MissionDesignSwitcher
              beforeContent={
                <>
                  <ActiveCompartments />
                  <ColourMapPanel />
                </>
              }
            />
            <div style={{ paddingTop: 16 }}>
              <DailyRituals />
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, paddingTop: 4 }}>
              <button
                type="button"
                onClick={() => setStarsOpen(true)}
                style={{
                  padding: '5px 20px',
                  borderRadius: 999,
                  border: '1px solid var(--panel-border, rgba(122,84,56,0.28))',
                  background: 'transparent',
                  color: 'var(--light-surface-muted, #7A5438)',
                  fontFamily: 'var(--font-serif)',
                  fontSize: 11,
                  fontWeight: 500,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                }}
              >
                Constellation
              </button>
            </div>
          </div>
        }
        progressContent={
          <div className="space-y-3">
            <Overview2 />
            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 4 }}>
              <button
                type="button"
                onClick={() => setModesOpen((v) => !v)}
                style={{
                  padding: '5px 20px',
                  borderRadius: 999,
                  border: `1px solid ${modesOpen ? 'var(--panel-border, rgba(92,48,24,0.55))' : 'var(--panel-border, rgba(122,84,56,0.28))'}`,
                  background: modesOpen
                    ? 'var(--palette-l3-bg, rgba(92,48,24,0.1))'
                    : 'transparent',
                  color: modesOpen
                    ? 'var(--light-surface-text, #5C3018)'
                    : 'var(--light-surface-muted, #7A5438)',
                  fontFamily: 'var(--font-serif)',
                  fontSize: 11,
                  fontWeight: modesOpen ? 700 : 500,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                }}
              >
                Modes
              </button>
            </div>
            {modesOpen && <ArchetypeBridge />}
          </div>
        }
      />
    </div>
  );
}

export default function DayPage() {
  return <DayContent />;
}

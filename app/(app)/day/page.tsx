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

const EMOTION_BACKDROPS = [...NIGHT_EMOTION_IMAGES, ...DAY_EMOTION_IMAGES];

type EmotionVisualDesign = 1 | 2;

function EmotionMoodSurface({
  children,
  design,
  onDesignChange,
  imageIndex,
}: {
  children: React.ReactNode;
  design: EmotionVisualDesign;
  onDesignChange: (design: EmotionVisualDesign) => void;
  imageIndex: number;
}) {
  const [isLightTheme, setIsLightTheme] = useState(true);
  const [nightMode, setNightMode] = useState(false);
  const images = nightMode ? NIGHT_EMOTION_IMAGES : DAY_EMOTION_IMAGES;
  const currentImage = images[imageIndex % images.length] ?? DAY_EMOTION_IMAGES[0];

  useEffect(() => {
    function syncLightTheme() {
      const color = localStorage.getItem('colourmap-theme') ?? 'paper';
      const palette = localStorage.getItem('colourmap-palette') ?? 'light-brown';
      setIsLightTheme(color === 'golden' || (color === 'paper' && palette === 'light-brown'));
    }

    syncLightTheme();
    const observer = new MutationObserver(syncLightTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    window.addEventListener('storage', syncLightTheme);
    return () => {
      observer.disconnect();
      window.removeEventListener('storage', syncLightTheme);
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const update = () => {
      setNightMode(root.classList.contains('dark'));
    };
    update();
    const observer = new MutationObserver(update);
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: isLightTheme ? 0 : 18,
        padding: isLightTheme ? '0 0 14px' : design === 2 ? '8px 8px 14px' : '12px 8px 14px',
        background: isLightTheme
          ? 'transparent'
          : 'linear-gradient(180deg, var(--palette-l2-bg, rgba(30,16,8,0.54)), color-mix(in srgb, var(--palette-l2-bg, rgba(30,16,8,0.54)) 82%, black))',
        boxShadow: isLightTheme
          ? 'none'
          : 'inset 0 1px 0 rgba(255,255,255,0.04), 0 18px 42px rgba(0,0,0,0.14)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'center', margin: '0 0 10px' }}>
        <fieldset
          aria-label="Emotion image design"
          style={{
            display: 'inline-flex',
            border: '1px solid var(--panel-border, rgba(196,160,96,0.22))',
            borderRadius: 999,
            background: isLightTheme
              ? 'color-mix(in srgb, var(--card) 74%, transparent)'
              : 'rgba(10,6,3,0.28)',
            padding: 2,
            gap: 2,
            margin: 0,
          }}
        >
          {([1, 2] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onDesignChange(option)}
              style={{
                border: 0,
                borderRadius: 999,
                minWidth: 32,
                minHeight: 26,
                background: design === option ? 'rgba(196,160,96,0.2)' : 'transparent',
                color:
                  design === option
                    ? 'var(--palette-panel-text, #5C3018)'
                    : 'var(--palette-panel-muted, rgba(196,160,96,0.72))',
                fontFamily: 'var(--font-serif)',
                fontSize: 12,
                fontWeight: 900,
                cursor: 'pointer',
              }}
            >
              {option}
            </button>
          ))}
        </fieldset>
      </div>
      {design === 1 && (
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
      )}
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
  const [emotionVisualDesign, setEmotionVisualDesign] = useState<EmotionVisualDesign>(1);
  const [emotionImageIndex, setEmotionImageIndex] = useState(0);

  // Silently restore server state into localStorage on mount.
  // Current session renders from whatever is already local (instant).
  // Next session (or cross-device) benefits from the restored values.
  useEffect(() => {
    hydrate();
  }, []);

  useEffect(() => {
    const timer = window.setInterval(
      () => setEmotionImageIndex((current) => (current + 1) % EMOTION_BACKDROPS.length),
      18_000,
    );
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('colourmap:emotion-visual-design');
      if (stored === '2') setEmotionVisualDesign(2);
    } catch {}
  }, []);

  function changeEmotionVisualDesign(next: EmotionVisualDesign) {
    setEmotionVisualDesign(next);
    try {
      localStorage.setItem('colourmap:emotion-visual-design', String(next));
    } catch {}
  }

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
        headerBackdrop={{
          enabled: emotionVisualDesign === 2,
          image: EMOTION_BACKDROPS[emotionImageIndex],
          dayImage: emotionImageIndex >= 2,
        }}
        emotionContent={
          <EmotionMoodSurface
            design={emotionVisualDesign}
            onDesignChange={changeEmotionVisualDesign}
            imageIndex={emotionImageIndex}
          >
            <InnerWork />
            <div style={{ height: 20 }} />
            <FeelingCircles2 visualDesign={emotionVisualDesign} />
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

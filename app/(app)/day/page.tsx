'use client';

import { useEffect, useState } from 'react';
import ActiveCompartments from '@/components/ActiveCompartments';
import ArchetypeBridge from '@/components/ArchetypeBridge';
import CheckInPing from '@/components/CheckInPing';
import ColourMapPanel from '@/components/ColourMapPanel';
import DailyRituals from '@/components/DailyRituals';
import DayRoad from '@/components/DayRoad';
import DayTabs, { type BackgroundPlacement } from '@/components/DayTabs';
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
const ROUND_WINDOW_EMOTION_IMAGE = '/emotions/emotion-round-window-1.webp';
const AREA_FILL_EMOTION_IMAGES = [ROUND_WINDOW_EMOTION_IMAGE, ...DAY_EMOTION_IMAGES];
const MISSION_AREA_IMAGE = '/emotions/mission-terrace-1.webp';
const PROGRESS_AREA_IMAGE = '/emotions/progress-observatory-1.webp';

const NIGHT_EMOTION_IMAGES = [
  '/emotions/emotion-city-night-1.webp',
  '/emotions/emotion-city-night-2.webp',
];

const EMOTION_BACKDROPS = [...NIGHT_EMOTION_IMAGES, ...DAY_EMOTION_IMAGES];

type EmotionVisualDesign = 1 | 2 | 3;
type LaneKey = 'emotion' | 'mission' | 'progress';
type LanePlacements = Record<LaneKey, BackgroundPlacement>;

const DEFAULT_LANE_PLACEMENTS: LanePlacements = {
  emotion: { x: 50, y: 32, zoom: 142 },
  mission: { x: 50, y: 42, zoom: 132 },
  progress: { x: 50, y: 40, zoom: 132 },
};

const PLACEMENT_KEY = 'colourmap:lane-background-placement';

function getAreaFillEmotionImage(index: number) {
  return (
    AREA_FILL_EMOTION_IMAGES[index % AREA_FILL_EMOTION_IMAGES.length] ?? ROUND_WINDOW_EMOTION_IMAGE
  );
}

function getEmotionImagePosition(image: string, nightMode: boolean) {
  if (image === ROUND_WINDOW_EMOTION_IMAGE) return 'center 36%';
  return nightMode ? 'center 42%' : 'center 48%';
}

function getLaneImagePosition(tone: 'mission' | 'progress') {
  return tone === 'mission' ? 'center 48%' : 'center 45%';
}

function loadLanePlacements(): LanePlacements {
  try {
    const raw = localStorage.getItem(PLACEMENT_KEY);
    if (!raw) return DEFAULT_LANE_PLACEMENTS;
    const parsed = JSON.parse(raw) as Partial<Record<LaneKey, Partial<BackgroundPlacement>>>;
    return {
      emotion: { ...DEFAULT_LANE_PLACEMENTS.emotion, ...parsed.emotion },
      mission: { ...DEFAULT_LANE_PLACEMENTS.mission, ...parsed.mission },
      progress: { ...DEFAULT_LANE_PLACEMENTS.progress, ...parsed.progress },
    };
  } catch {
    return DEFAULT_LANE_PLACEMENTS;
  }
}

function PlacementTuner({
  lane,
  placement,
  onChange,
}: {
  lane: LaneKey;
  placement: BackgroundPlacement;
  onChange: (next: BackgroundPlacement) => void;
}) {
  const [open, setOpen] = useState(false);
  const defaults = DEFAULT_LANE_PLACEMENTS[lane];
  const code = `${lane} x ${placement.x} y ${placement.y} zoom ${placement.zoom}`;

  function update(key: keyof BackgroundPlacement, value: number) {
    onChange({ ...placement, [key]: value });
  }

  return (
    <div
      style={{
        position: 'relative',
        zIndex: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        margin: '0 0 10px',
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        style={{
          border: '1px solid rgba(240,216,152,0.28)',
          borderRadius: 999,
          background: 'rgba(18,10,5,0.32)',
          color: 'rgba(240,216,152,0.86)',
          fontFamily: 'var(--font-serif)',
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: '0.12em',
          padding: '4px 12px',
          textTransform: 'uppercase',
          cursor: 'pointer',
          backdropFilter: 'blur(8px)',
        }}
      >
        Place image
      </button>
      {open && (
        <div
          style={{
            width: 'min(560px, calc(100vw - 28px))',
            border: '1px solid rgba(240,216,152,0.24)',
            borderRadius: 12,
            background: 'rgba(18,10,5,0.52)',
            color: 'rgba(240,216,152,0.88)',
            padding: 12,
            fontFamily: 'var(--font-serif)',
            fontSize: 11,
            backdropFilter: 'blur(12px)',
            boxShadow: '0 12px 32px rgba(0,0,0,0.22)',
          }}
        >
          <div style={{ display: 'grid', gap: 8 }}>
            <PlacementSlider label="x" value={placement.x} min={0} max={100} onChange={update} />
            <PlacementSlider label="y" value={placement.y} min={0} max={100} onChange={update} />
            <PlacementSlider
              label="zoom"
              value={placement.zoom}
              min={86}
              max={190}
              onChange={update}
            />
          </div>
          <div
            style={{
              display: 'flex',
              gap: 8,
              justifyContent: 'center',
              alignItems: 'center',
              flexWrap: 'wrap',
              paddingTop: 10,
            }}
          >
            <code style={{ color: 'rgba(240,216,152,0.9)' }}>{code}</code>
            <button
              type="button"
              onClick={() => navigator.clipboard?.writeText(code)}
              style={{
                border: '1px solid rgba(240,216,152,0.28)',
                borderRadius: 999,
                background: 'rgba(255,248,226,0.08)',
                color: 'rgba(240,216,152,0.9)',
                fontFamily: 'var(--font-serif)',
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: '0.08em',
                padding: '4px 10px',
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              Copy
            </button>
            <button
              type="button"
              onClick={() => onChange(defaults)}
              style={{
                border: '1px solid rgba(240,216,152,0.2)',
                borderRadius: 999,
                background: 'rgba(255,248,226,0.05)',
                color: 'rgba(240,216,152,0.78)',
                fontFamily: 'var(--font-serif)',
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: '0.08em',
                padding: '4px 10px',
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function PlacementSlider({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: keyof BackgroundPlacement;
  value: number;
  min: number;
  max: number;
  onChange: (key: keyof BackgroundPlacement, value: number) => void;
}) {
  return (
    <label
      style={{
        display: 'grid',
        gridTemplateColumns: '54px 1fr 42px',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <span style={{ letterSpacing: '0.14em', textTransform: 'uppercase' }}>{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(event) => onChange(label, Number(event.target.value))}
        aria-label={`${label} background placement`}
        style={{ accentColor: '#FFD080', width: '100%' }}
      />
      <span style={{ textAlign: 'right' }}>{value}</span>
    </label>
  );
}

function EmotionMoodSurface({
  children,
  design,
  onDesignChange,
  imageIndex,
  placement,
  onPlacementChange,
}: {
  children: React.ReactNode;
  design: EmotionVisualDesign;
  onDesignChange: (design: EmotionVisualDesign) => void;
  imageIndex: number;
  placement: BackgroundPlacement;
  onPlacementChange: (next: BackgroundPlacement) => void;
}) {
  const [isLightTheme, setIsLightTheme] = useState(true);
  const [nightMode, setNightMode] = useState(false);
  const areaFill = design === 3;
  const images = nightMode ? NIGHT_EMOTION_IMAGES : DAY_EMOTION_IMAGES;
  const areaFillImages = areaFill ? AREA_FILL_EMOTION_IMAGES : images;
  const currentImage = areaFillImages[imageIndex % areaFillImages.length] ?? DAY_EMOTION_IMAGES[0];
  const currentPosition = getEmotionImagePosition(currentImage, nightMode);

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
        width: areaFill ? '100%' : undefined,
        marginTop: areaFill ? -1 : undefined,
        borderRadius: areaFill || isLightTheme ? 0 : 18,
        padding: areaFill
          ? '12px max(12px, calc((100vw - 672px) / 2 + 16px)) 40px'
          : isLightTheme
            ? '0 0 14px'
            : design === 2
              ? '8px 8px 14px'
              : '12px 8px 14px',
        minHeight: areaFill ? 'calc(100svh - 168px)' : undefined,
        background: areaFill
          ? 'transparent'
          : isLightTheme
            ? 'transparent'
            : 'linear-gradient(180deg, var(--palette-l2-bg, rgba(30,16,8,0.54)), color-mix(in srgb, var(--palette-l2-bg, rgba(30,16,8,0.54)) 82%, black))',
        boxShadow:
          areaFill || isLightTheme
            ? 'none'
            : 'inset 0 1px 0 rgba(255,255,255,0.04), 0 18px 42px rgba(0,0,0,0.14)',
      }}
    >
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          justifyContent: 'center',
          margin: '0 0 10px',
        }}
      >
        {areaFill && (
          <PlacementTuner lane="emotion" placement={placement} onChange={onPlacementChange} />
        )}
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
          {([1, 2, 3] as const).map((option) => (
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
              objectPosition: currentPosition,
              transition: 'opacity 900ms ease',
            }}
          />
        </div>
      )}
      <div
        className="space-y-3"
        style={{
          position: 'relative',
          zIndex: 1,
          background: 'transparent',
        }}
      >
        {children}
      </div>
    </div>
  );
}

type LaneImageDesign = 1 | 2;

function AreaFillLaneSurface({
  children,
  design,
  onDesignChange,
  image,
  label,
  tone,
  placement,
  onPlacementChange,
}: {
  children: React.ReactNode;
  design: LaneImageDesign;
  onDesignChange: (design: LaneImageDesign) => void;
  image: string;
  label: string;
  tone: 'mission' | 'progress';
  placement: BackgroundPlacement;
  onPlacementChange: (next: BackgroundPlacement) => void;
}) {
  const areaFill = design === 2;
  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        width: areaFill ? '100%' : undefined,
        padding: areaFill ? '12px max(12px, calc((100vw - 672px) / 2 + 16px)) 40px' : undefined,
        minHeight: areaFill ? 'calc(100svh - 168px)' : undefined,
      }}
    >
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          justifyContent: 'center',
          margin: '0 0 10px',
        }}
      >
        {areaFill && (
          <PlacementTuner lane={tone} placement={placement} onChange={onPlacementChange} />
        )}
        <fieldset
          aria-label={`${label} image design`}
          style={{
            display: 'inline-flex',
            border: '1px solid var(--panel-border, rgba(196,160,96,0.22))',
            borderRadius: 999,
            background: areaFill ? 'rgba(18,10,5,0.36)' : 'transparent',
            padding: 2,
            gap: 2,
            margin: 0,
            backdropFilter: areaFill ? 'blur(8px)' : undefined,
          }}
        >
          {([1, 2] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onDesignChange(option)}
              aria-pressed={design === option}
              style={{
                border: 0,
                borderRadius: 999,
                minWidth: 32,
                minHeight: 26,
                background: design === option ? 'rgba(196,160,96,0.22)' : 'transparent',
                color: areaFill
                  ? 'rgba(240,216,152,0.9)'
                  : design === option
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
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
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
  const [missionVisualDesign, setMissionVisualDesign] = useState<LaneImageDesign>(1);
  const [progressVisualDesign, setProgressVisualDesign] = useState<LaneImageDesign>(1);
  const [emotionImageIndex, setEmotionImageIndex] = useState(0);
  const [lanePlacements, setLanePlacements] = useState<LanePlacements>(DEFAULT_LANE_PLACEMENTS);

  // Silently restore server state into localStorage on mount.
  // Current session renders from whatever is already local (instant).
  // Next session (or cross-device) benefits from the restored values.
  useEffect(() => {
    hydrate();
  }, []);

  useEffect(() => {
    setLanePlacements(loadLanePlacements());
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
      if (stored === '2' || stored === '3') setEmotionVisualDesign(Number(stored) as 2 | 3);
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
      const missionStored = localStorage.getItem('colourmap:mission-visual-design');
      const progressStored = localStorage.getItem('colourmap:progress-visual-design');
      if (missionStored === '2') setMissionVisualDesign(2);
      if (progressStored === '2') setProgressVisualDesign(2);
    } catch {}
  }, []);

  function changeMissionVisualDesign(next: LaneImageDesign) {
    setMissionVisualDesign(next);
    try {
      localStorage.setItem('colourmap:mission-visual-design', String(next));
    } catch {}
  }

  function changeProgressVisualDesign(next: LaneImageDesign) {
    setProgressVisualDesign(next);
    try {
      localStorage.setItem('colourmap:progress-visual-design', String(next));
    } catch {}
  }

  function changeLanePlacement(lane: LaneKey, next: BackgroundPlacement) {
    setLanePlacements((current) => {
      const updated = { ...current, [lane]: next };
      try {
        localStorage.setItem(PLACEMENT_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
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
        headerBackdrops={{
          emotion: {
            enabled: emotionVisualDesign === 2 || emotionVisualDesign === 3,
            image:
              emotionVisualDesign === 3
                ? getAreaFillEmotionImage(emotionImageIndex)
                : EMOTION_BACKDROPS[emotionImageIndex],
            dayImage: emotionVisualDesign === 3 || emotionImageIndex >= 2,
            position:
              emotionVisualDesign === 3
                ? getEmotionImagePosition(getAreaFillEmotionImage(emotionImageIndex), false)
                : 'center 46%',
            placement: lanePlacements.emotion,
            fullBleed: emotionVisualDesign === 3,
          },
          mission: {
            enabled: missionVisualDesign === 2,
            image: MISSION_AREA_IMAGE,
            dayImage: true,
            position: getLaneImagePosition('mission'),
            placement: lanePlacements.mission,
            fullBleed: true,
            overlay: 'rgba(48,22,7,0.34)',
          },
          progress: {
            enabled: progressVisualDesign === 2,
            image: PROGRESS_AREA_IMAGE,
            dayImage: true,
            position: getLaneImagePosition('progress'),
            placement: lanePlacements.progress,
            fullBleed: true,
            overlay: 'rgba(17,28,22,0.36)',
          },
        }}
        emotionContent={
          <EmotionMoodSurface
            design={emotionVisualDesign}
            onDesignChange={changeEmotionVisualDesign}
            imageIndex={emotionImageIndex}
            placement={lanePlacements.emotion}
            onPlacementChange={(next) => changeLanePlacement('emotion', next)}
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
          <AreaFillLaneSurface
            design={missionVisualDesign}
            onDesignChange={changeMissionVisualDesign}
            image={MISSION_AREA_IMAGE}
            label="Mission"
            tone="mission"
            placement={lanePlacements.mission}
            onPlacementChange={(next) => changeLanePlacement('mission', next)}
          >
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
          </AreaFillLaneSurface>
        }
        progressContent={
          <AreaFillLaneSurface
            design={progressVisualDesign}
            onDesignChange={changeProgressVisualDesign}
            image={PROGRESS_AREA_IMAGE}
            label="Progress"
            tone="progress"
            placement={lanePlacements.progress}
            onPlacementChange={(next) => changeLanePlacement('progress', next)}
          >
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
          </AreaFillLaneSurface>
        }
      />
    </div>
  );
}

export default function DayPage() {
  return <DayContent />;
}

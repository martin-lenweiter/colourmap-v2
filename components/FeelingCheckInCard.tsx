'use client';

import { useState } from 'react';
import CockpitCat from '@/components/CockpitCat';

/* ═══════════════════════════════════════════════════════════
   FEELING CHECK-IN CARD — Cat + Hawkins slider + FACING + Note
   Block 1 for the Feeling tab. Mirrors DoingCheckInCard / SharingCheckInCard.
   ═══════════════════════════════════════════════════════════ */

const HAWKINS = [
  { level: 'Shame', color: '#C83030' },
  { level: 'Guilt', color: '#D44040' },
  { level: 'Grief', color: '#C85050' },
  { level: 'Fear', color: '#D46050' },
  { level: 'Desire', color: '#D87048' },
  { level: 'Anger', color: '#E0844A' },
  { level: 'Pride', color: '#E0844A' },
  { level: 'Courage', color: '#C88820' },
  { level: 'Willingness', color: '#7AAA58' },
  { level: 'Acceptance', color: '#80C0A0' },
  { level: 'Reason', color: '#3AA8A0' },
  { level: 'Love', color: '#3A8AC4' },
  { level: 'Joy', color: '#7A6AB8' },
  { level: 'Peace', color: '#9B6BA0' },
];

const INNER_TRACKERS = [
  {
    id: 'fear',
    label: 'Fear',
    letter: 'F',
    questions: [
      'What are you afraid of today?',
      'What would happen if it came true?',
      "What's one small thing you can face right now?",
    ],
    color: '#C85050',
  },
  {
    id: 'avoidance',
    label: 'Avoidance',
    letter: 'A',
    questions: [
      'What do you keep pushing back?',
      'What happens if you keep avoiding it?',
      "What's the smallest first step?",
    ],
    color: '#D09060',
  },
  {
    id: 'confusion',
    label: 'Confusion',
    letter: 'C',
    questions: [
      'What feels unclear right now?',
      'What would clarity look like?',
      'Who or what could help you see it?',
    ],
    color: '#A878A8',
  },
  {
    id: 'intention',
    label: 'Intention',
    letter: 'I',
    questions: [
      'What will you pursue?',
      'Why does it matter today?',
      "What's the smallest next move?",
    ],
    color: '#6890B0',
  },
  {
    id: 'need',
    label: 'Need',
    letter: 'N',
    questions: [
      'What do you need right now?',
      'What would support look like?',
      'How can you give or ask for it today?',
    ],
    color: '#C8A050',
  },
  {
    id: 'gratitude',
    label: 'Gratitude',
    letter: 'G',
    questions: [
      'What are you grateful for?',
      'Why does it matter to you?',
      'Who made it possible?',
    ],
    color: '#88A858',
  },
] as const;

const CELL_SHAPES = [
  '60% 40% 55% 45% / 50% 60% 40% 50%',
  '45% 55% 40% 60% / 55% 45% 55% 45%',
  '50% 50% 45% 55% / 40% 60% 50% 50%',
  '55% 45% 60% 40% / 50% 50% 45% 55%',
  '52% 48% 42% 58% / 48% 52% 50% 50%',
  '48% 52% 55% 45% / 55% 45% 48% 52%',
];

const PEACE_TRACKERS = [
  {
    id: 'pause',
    label: 'Pause',
    letter: 'P',
    questions: [
      'Can you stop for 10 seconds right now?',
      'What happens when you pause?',
      'What does stillness feel like?',
    ],
    color: '#8098B0',
  },
  {
    id: 'express',
    label: 'Express',
    letter: 'E',
    questions: [
      'What needs to come out right now?',
      'What would you say if nobody was listening?',
      'How does it feel to let it out?',
    ],
    color: '#A08878',
  },
  {
    id: 'accept',
    label: 'Accept',
    letter: 'A',
    questions: [
      'What are you resisting right now?',
      'What would change if you stopped fighting it?',
      'Can you let it be, just for today?',
    ],
    color: '#90A080',
  },
  {
    id: 'calm',
    label: 'Calm',
    letter: 'C',
    questions: [
      'Where in your body do you feel tension?',
      'What would help you settle right now?',
      'What does calm feel like for you?',
    ],
    color: '#7098A0',
  },
  {
    id: 'emerge',
    label: 'Emerge',
    letter: 'E',
    questions: [
      'What are you ready to step into?',
      'What is on the other side of this?',
      'How do you want to show up next?',
    ],
    color: '#A0A070',
  },
] as const;

type TrackerMode = 'facing' | 'peace';

export default function FeelingCheckInCard() {
  const [sliderValue, setSliderValue] = useState(50);
  const [barActive, setBarActive] = useState(false);
  const [showDesc, setShowDesc] = useState(false);
  const [trackerMode, setTrackerMode] = useState<TrackerMode>('facing');
  const [note, setNote] = useState('');
  const [activeTracker, setActiveTracker] = useState<string | null>(null);
  const [trackerValues, setTrackerValues] = useState<Record<string, string>>({});

  const hawkinsIdx = Math.min(Math.round((sliderValue / 100) * 13), 13);
  const current = HAWKINS[hawkinsIdx];

  return (
    <div
      className="space-y-5 rounded-3xl border border-[#7a543833] px-5 py-6"
      style={{
        background: 'linear-gradient(180deg, rgba(251,244,232,0.95), rgba(246,236,221,0.92))',
        boxShadow: '0 24px 50px -34px rgba(92,48,24,0.35)',
      }}
    >
      {/* Cat */}
      <CockpitCat />

      {/* Emotion name — always visible above slider */}
      <p
        className="text-center text-lg font-semibold transition-all duration-300"
        style={{
          color: current.color,
          opacity: barActive ? 1 : 0.5,
          fontFamily: 'var(--font-serif)',
        }}
      >
        {current.level}
      </p>

      {/* Hawkins slider */}
      <div className="space-y-3">
        <div
          className="flex cursor-pointer gap-[2px] overflow-hidden rounded-lg"
          style={{ touchAction: 'none' }}
          onMouseDown={(e) => {
            setBarActive(true);
            setShowDesc(false);
            const r = e.currentTarget.getBoundingClientRect();
            setSliderValue(Math.round(((e.clientX - r.left) / r.width) * 100));
          }}
          onMouseMove={(e) => {
            if (e.buttons > 0) {
              const r = e.currentTarget.getBoundingClientRect();
              setSliderValue(
                Math.max(0, Math.min(100, Math.round(((e.clientX - r.left) / r.width) * 100))),
              );
            }
          }}
          onTouchStart={(e) => {
            setBarActive(true);
            setShowDesc(false);
            const r = e.currentTarget.getBoundingClientRect();
            setSliderValue(Math.round(((e.touches[0].clientX - r.left) / r.width) * 100));
          }}
          onTouchMove={(e) => {
            e.preventDefault();
            const r = e.currentTarget.getBoundingClientRect();
            setSliderValue(
              Math.max(
                0,
                Math.min(100, Math.round(((e.touches[0].clientX - r.left) / r.width) * 100)),
              ),
            );
          }}
        >
          {HAWKINS.map((h, i) => {
            const isSelected = i === hawkinsIdx;
            const dist = Math.abs(i - hawkinsIdx);
            return (
              <div
                key={h.level}
                style={{
                  flex: 1,
                  height: 34,
                  background: h.color,
                  opacity: barActive
                    ? isSelected
                      ? 1
                      : dist === 1
                        ? 0.55
                        : 0.2
                    : isSelected
                      ? 0.7
                      : dist === 1
                        ? 0.4
                        : 0.2,
                  borderRadius: i === 0 ? '8px 0 0 8px' : i === 13 ? '0 8px 8px 0' : 0,
                  transition: 'all 0.3s',
                }}
              />
            );
          })}
        </div>

        {barActive && !showDesc && (
          <div className="text-center">
            <button
              type="button"
              onClick={() => setShowDesc(true)}
              className="text-[10px] text-muted-foreground/40 transition-colors hover:text-muted-foreground/60"
            >
              more
            </button>
          </div>
        )}
        {barActive && showDesc && (
          <div className="space-y-2 text-center animate-in fade-in duration-200">
            <p
              className="px-2 text-xs leading-relaxed"
              style={{ color: current.color, opacity: 0.7 }}
            >
              {(() => {
                const descs: Record<string, string> = {
                  Shame:
                    'You believe you are fundamentally flawed. Separate what you did from who you are.',
                  Guilt: 'You believe you did something wrong. Acknowledge it, then let it go.',
                  Grief: 'The weight of loss. Let yourself feel it fully without rushing.',
                  Fear: 'The world feels threatening. Name the fear. Face one small piece today.',
                  Desire: 'Craving and attachment. Ask what you really need underneath.',
                  Anger:
                    "Raw energy from crossed boundaries. Channel it — don't suppress, don't explode.",
                  Pride: "Feels good but fragile. Find worth that doesn't need an audience.",
                  Courage: "The turning point. Take one action you've been postponing.",
                  Willingness: 'Open and ready. Say yes to something uncomfortable.',
                  Acceptance: "You've stopped fighting reality. Focus on what you can control.",
                  Reason: 'Intellect is strong. Balance thinking with feeling.',
                  Love: 'Unconditional, not attachment. Extend this love to yourself.',
                  Joy: 'Inner joy independent of circumstances. Share it.',
                  Peace: 'Complete stillness. Protect your silence.',
                };
                return descs[current.level] || '';
              })()}
            </p>
            <button
              type="button"
              onClick={() => setShowDesc(false)}
              className="text-[10px] text-muted-foreground/30 transition-colors hover:text-muted-foreground/50"
            >
              less
            </button>
          </div>
        )}
      </div>

      {/* Note — single line with time */}
      <div className="flex items-center gap-2 rounded-xl border border-[#C4A06020] bg-[#C4A06005] px-3 py-2.5">
        <span className="shrink-0 text-[10px] text-muted-foreground/40">
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={(() => {
            if (!barActive) return "What's on your mind?";
            const prompts: Record<string, string> = {
              Shame: 'What feels heavy?',
              Guilt: "What's weighing on you?",
              Grief: 'What are you letting go of?',
              Fear: 'What feels threatening?',
              Desire: 'What are you craving?',
              Anger: 'What crossed a line?',
              Pride: 'What are you proving?',
              Courage: 'What shifted?',
              Willingness: 'What are you open to?',
              Acceptance: 'What did you let in?',
              Reason: 'What are you figuring out?',
              Love: 'What are you nurturing?',
              Joy: 'What lit you up?',
              Peace: 'What feels still?',
            };
            return prompts[current.level] || "What's on your mind?";
          })()}
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/40"
        />
      </div>

      {/* FACING / PEACE trackers — swappable */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {/* Arrow left (only if on PEACE) */}
          {trackerMode === 'peace' && (
            <button
              type="button"
              onClick={() => {
                setTrackerMode('facing');
                setActiveTracker(null);
              }}
              className="shrink-0 cursor-pointer text-sm text-muted-foreground/30 transition-colors hover:text-muted-foreground/60"
              style={{ background: 'none', border: 'none' }}
            >
              ‹
            </button>
          )}

          <div className="flex flex-1 items-center justify-center gap-2">
            {(trackerMode === 'facing' ? INNER_TRACKERS : PEACE_TRACKERS).map((t, idx) => {
              const isActive = activeTracker === t.id;
              const size = isActive ? 52 : 48;
              const shapes =
                trackerMode === 'facing'
                  ? CELL_SHAPES
                  : [
                      '50% 50% 45% 55% / 45% 55% 50% 50%',
                      '45% 55% 50% 50% / 50% 50% 45% 55%',
                      '55% 45% 50% 50% / 50% 50% 55% 45%',
                      '50% 50% 55% 45% / 55% 45% 50% 50%',
                      '48% 52% 42% 58% / 52% 48% 50% 50%',
                    ];
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTracker(isActive ? null : t.id)}
                  className="relative flex cursor-pointer items-center justify-center transition-all duration-300 hover:scale-110"
                  style={{
                    width: size,
                    height: size,
                    borderRadius: shapes[idx % shapes.length],
                    background: t.color,
                    opacity: isActive ? 1 : 0.6,
                    border: 'none',
                    padding: 0,
                  }}
                >
                  <span
                    className="text-base font-black text-white select-none"
                    style={{ fontFamily: 'var(--font-handwritten)', letterSpacing: 1 }}
                  >
                    {t.letter}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Arrow right (only if on FACING) */}
          {trackerMode === 'facing' && (
            <button
              type="button"
              onClick={() => {
                setTrackerMode('peace');
                setActiveTracker(null);
              }}
              className="shrink-0 cursor-pointer text-sm text-muted-foreground/30 transition-colors hover:text-muted-foreground/60"
              style={{ background: 'none', border: 'none' }}
            >
              ›
            </button>
          )}
        </div>

        {/* Open tracker program */}
        {activeTracker &&
          (() => {
            const allTrackers = [...INNER_TRACKERS, ...PEACE_TRACKERS];
            const tracker = allTrackers.find((t) => t.id === activeTracker);
            if (!tracker) return null;

            const keys = tracker.questions.map((_, i) =>
              i === 0 ? tracker.id : `${tracker.id}_${i + 1}`,
            );
            const unlockedCount = keys.filter((key) => key in trackerValues).length;
            const visibleCount = Math.max(1, unlockedCount);
            const lastKey = keys[visibleCount - 1];
            const canUnlockNext =
              visibleCount < tracker.questions.length && trackerValues[lastKey]?.trim();

            return (
              <div className="space-y-2 animate-in fade-in duration-150">
                <p
                  className="text-center text-xl italic leading-none"
                  style={{ color: tracker.color, fontFamily: 'var(--font-handwritten)' }}
                >
                  {tracker.label}
                </p>
                <div className="space-y-1">
                  {tracker.questions.slice(0, visibleCount).map((question, index) => {
                    const key = keys[index];
                    const showLosange = index < visibleCount - 1;
                    return (
                      <div key={key}>
                        <input
                          type="text"
                          value={trackerValues[key] || ''}
                          onChange={(e) =>
                            setTrackerValues((prev) => ({ ...prev, [key]: e.target.value }))
                          }
                          placeholder={question}
                          className="w-full rounded-lg border px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/40"
                          style={{
                            borderColor: `${tracker.color}25`,
                            background: `${tracker.color}05`,
                          }}
                        />
                        {showLosange && (
                          <div className="flex justify-center py-2">
                            <div
                              className="h-2 w-2 rotate-45 rounded-[1px]"
                              style={{ background: tracker.color, opacity: 0.2 }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {canUnlockNext && (
                    <div className="flex justify-center py-2">
                      <button
                        type="button"
                        onClick={() =>
                          setTrackerValues((prev) => ({ ...prev, [keys[visibleCount]]: '' }))
                        }
                        className="flex h-3.5 w-3.5 rotate-45 cursor-pointer items-center justify-center transition-all hover:scale-125"
                        style={{
                          background: `${tracker.color}30`,
                          borderRadius: 1.5,
                          border: 'none',
                        }}
                      >
                        <span
                          className="-rotate-45 text-[6px] font-bold leading-none"
                          style={{ color: tracker.color }}
                        >
                          +
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
      </div>
    </div>
  );
}

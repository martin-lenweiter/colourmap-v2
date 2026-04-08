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
  { level: 'Grief', color: '#D45050' },
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
    color: '#D45050',
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
    color: '#E6A168',
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
    color: '#B68DB8',
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
    color: '#76AED0',
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
    color: '#D8BA5D',
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
    color: '#9DBE74',
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

export default function FeelingCheckInCard() {
  const [sliderValue, setSliderValue] = useState(50);
  const [barActive, setBarActive] = useState(false);
  const [showDesc, setShowDesc] = useState(false);
  const [note, setNote] = useState('');
  const [activeTracker, setActiveTracker] = useState<string | null>(null);

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
        style={{ color: current.color, opacity: barActive ? 1 : 0.5 }}
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
                  height: 28,
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

      {/* FACING trackers — cell shapes */}
      <div className="space-y-2">
        <div className="flex items-center justify-center gap-2">
          {INNER_TRACKERS.map((t, idx) => {
            const isActive = activeTracker === t.id;
            const size = isActive ? 46 : 38;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTracker(isActive ? null : t.id)}
                className="relative flex cursor-pointer items-center justify-center transition-all duration-300 hover:scale-110"
                style={{
                  width: size,
                  height: size,
                  borderRadius: CELL_SHAPES[idx],
                  background: t.color,
                  opacity: isActive ? 1 : 0.6,
                  border: 'none',
                  padding: 0,
                }}
              >
                <span
                  className="text-sm font-bold text-white select-none"
                  style={{ fontFamily: 'var(--font-handwritten)', letterSpacing: 1 }}
                >
                  {t.letter}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

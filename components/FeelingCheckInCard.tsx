'use client';

import { useEffect, useRef, useState } from 'react';

/* ═══════════════════════════════════════════════════════════
   FEELING CHECK-IN CARD — Zen circle + losange gateway
   Swipe the circle to change emotion. Tap losange to go deeper.
   ═══════════════════════════════════════════════════════════ */

/* ─── Mind spectrum (circle + name) — pastel ─── */
const MIND = [
  { level: 'Stuck', color: '#E0908A' },
  { level: 'Overwhelmed', color: '#E8A090' },
  { level: 'Confused', color: '#C8A8C8' },
  { level: 'Restless', color: '#E0B898' },
  { level: 'Loaded', color: '#D8C088' },
  { level: 'Neutral', color: '#D0C8B0' },
  { level: 'Focused', color: '#A8CCA0' },
  { level: 'Efficient', color: '#B0D8D0' },
  { level: 'Relaxed', color: '#B0D0E8' },
  { level: 'Flowing', color: '#B0A0D0' },
  { level: 'Light', color: '#C8A8C0' },
];

/* ─── Mission / mode spectrum — pastel ─── */
const MODE = [
  { level: 'Resting', color: '#A8B8D0' },
  { level: 'Passive', color: '#B0C8A8' },
  { level: 'Drifting', color: '#D0C8B0' },
  { level: 'Preparing', color: '#D8C088' },
  { level: 'Working', color: '#E0B898' },
  { level: 'Pushing', color: '#E0908A' },
  { level: 'Active', color: '#A8CCA0' },
  { level: 'Building', color: '#90C8B8' },
  { level: 'Creating', color: '#90B8D8' },
  { level: 'On Fire', color: '#B0A0D0' },
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
      'What do you need right now?',
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

/* ─── Reusable draggable square slider ─── */
function DragSlider({
  items,
  selectedIdx,
  onSelect,
  size = 22,
}: {
  items: readonly { level: string; color: string }[];
  selectedIdx: number;
  onSelect: (idx: number) => void;
  size?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gap = 2;

  const idxFromX = (clientX: number) => {
    const el = containerRef.current;
    if (!el) return selectedIdx;
    const rect = el.getBoundingClientRect();
    const x = clientX - rect.left;
    const step = size + gap;
    return Math.max(0, Math.min(items.length - 1, Math.floor(x / step)));
  };

  return (
    <div
      ref={containerRef}
      className="flex cursor-pointer justify-center"
      style={{ gap: `${gap}px`, touchAction: 'none' }}
      onMouseDown={(e) => onSelect(idxFromX(e.clientX))}
      onMouseMove={(e) => {
        if (e.buttons > 0) onSelect(idxFromX(e.clientX));
      }}
      onTouchStart={(e) => onSelect(idxFromX(e.touches[0].clientX))}
      onTouchMove={(e) => {
        e.preventDefault();
        onSelect(idxFromX(e.touches[0].clientX));
      }}
    >
      {items.map((h, i) => {
        const isSelected = i === selectedIdx;
        const dist = Math.abs(i - selectedIdx);
        return (
          <div
            key={h.level}
            style={{
              width: size,
              height: size,
              background: h.color,
              opacity: isSelected ? 1 : dist === 1 ? 0.55 : 0.2,
              borderRadius: 3,
              transition: 'opacity 0.15s',
            }}
          />
        );
      })}
    </div>
  );
}

type TrackerMode = 'facing' | 'peace';

function loadNum(key: string, fallback: number): number {
  try {
    const v = localStorage.getItem(key);
    return v !== null ? Number(v) : fallback;
  } catch {
    return fallback;
  }
}

export default function FeelingCheckInCard() {
  const [mindIdx, setMindIdx] = useState(() => loadNum('colourmap:mind-idx', 5));
  const [modeIdx, setModeIdx] = useState(() => loadNum('colourmap:mode-idx', 4));
  const [trackerMode, setTrackerMode] = useState<TrackerMode>('facing');
  const [note, setNote] = useState(() => {
    try {
      return localStorage.getItem('colourmap:feeling-note') || '';
    } catch {
      return '';
    }
  });
  const [activeTracker, setActiveTracker] = useState<string | null>(null);
  const [trackerValues, setTrackerValues] = useState<Record<string, string>>(() => {
    try {
      return JSON.parse(localStorage.getItem('colourmap:tracker-values') || '{}');
    } catch {
      return {};
    }
  });
  const [expanded, setExpanded] = useState(false);
  const [entries, setEntries] = useState<
    { time: string; text: string; mind: string; mode: string }[]
  >(() => {
    try {
      return JSON.parse(localStorage.getItem('colourmap:feeling-entries') || '[]');
    } catch {
      return [];
    }
  });

  const saveEntry = () => {
    if (!note.trim()) return;
    const entry = {
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: note.trim(),
      mind: currentMind.level,
      mode: currentMode.level,
    };
    const next = [entry, ...entries].slice(0, 50);
    setEntries(next);
    localStorage.setItem('colourmap:feeling-entries', JSON.stringify(next));
    setNote('');
  };

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('colourmap:mind-idx', String(mindIdx));
  }, [mindIdx]);
  useEffect(() => {
    localStorage.setItem('colourmap:mode-idx', String(modeIdx));
  }, [modeIdx]);
  useEffect(() => {
    localStorage.setItem('colourmap:feeling-note', note);
  }, [note]);
  useEffect(() => {
    localStorage.setItem('colourmap:tracker-values', JSON.stringify(trackerValues));
  }, [trackerValues]);

  const [mindDragging, setMindDragging] = useState(false);
  const [modeDragging, setModeDragging] = useState(false);

  // Swipe tracking
  const mindDragRef = useRef<{ startX: number; startIdx: number } | null>(null);
  const modeDragRef = useRef<{ startX: number; startIdx: number } | null>(null);

  const currentMind = MIND[mindIdx];
  const currentMode = MODE[modeIdx];

  const startMindDrag = (clientX: number) => {
    mindDragRef.current = { startX: clientX, startIdx: mindIdx };
    setMindDragging(true);
  };

  const startModeDrag = (clientX: number) => {
    modeDragRef.current = { startX: clientX, startIdx: modeIdx };
    setModeDragging(true);
  };

  const mindIdxRef = useRef(mindIdx);
  mindIdxRef.current = mindIdx;
  const modeIdxRef = useRef(modeIdx);
  modeIdxRef.current = modeIdx;

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (mindDragRef.current) {
        const dx = e.clientX - mindDragRef.current.startX;
        const steps = Math.round(dx / 22);
        const next = Math.max(0, Math.min(MIND.length - 1, mindDragRef.current.startIdx + steps));
        if (next !== mindIdxRef.current) setMindIdx(next);
      }
      if (modeDragRef.current) {
        const dx = e.clientX - modeDragRef.current.startX;
        const steps = Math.round(dx / 22);
        const next = Math.max(0, Math.min(MODE.length - 1, modeDragRef.current.startIdx + steps));
        if (next !== modeIdxRef.current) setModeIdx(next);
      }
    };
    const onUp = () => {
      if (mindDragRef.current) {
        mindDragRef.current = null;
        setMindDragging(false);
      }
      if (modeDragRef.current) {
        modeDragRef.current = null;
        setModeDragging(false);
      }
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  return (
    <div
      className="space-y-5 rounded-3xl border border-[#7a543833] px-5 py-6"
      style={{
        background: 'linear-gradient(180deg, rgba(251,244,232,0.95), rgba(246,236,221,0.92))',
        boxShadow: '0 24px 50px -34px rgba(92,48,24,0.35)',
      }}
    >
      {/* Mind circle — swipe to change */}
      <div className="flex justify-center">
        <div
          className="cursor-grab transition-colors duration-500 active:cursor-grabbing"
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: currentMind.color,
            opacity: 0.85,
            touchAction: 'none',
          }}
          onMouseDown={(e) => startMindDrag(e.clientX)}
          onTouchStart={(e) => startMindDrag(e.touches[0].clientX)}
          onTouchMove={(e) => {
            e.preventDefault();
            if (!mindDragRef.current) return;
            const dx = e.touches[0].clientX - mindDragRef.current.startX;
            const steps = Math.round(dx / 22);
            const next = Math.max(
              0,
              Math.min(MIND.length - 1, mindDragRef.current.startIdx + steps),
            );
            if (next !== mindIdx) setMindIdx(next);
          }}
          onTouchEnd={() => {
            mindDragRef.current = null;
            setMindDragging(false);
          }}
        />
      </div>

      {/* Mind name */}
      <p
        className="text-center text-xl font-bold transition-all duration-300"
        style={{ color: currentMind.color, fontFamily: 'var(--font-serif)' }}
      >
        {currentMind.level}
      </p>

      {/* Mind rainbow — appears while dragging */}
      {mindDragging && (
        <div className="animate-in fade-in duration-150">
          <DragSlider items={MIND} selectedIdx={mindIdx} onSelect={setMindIdx} size={20} />
        </div>
      )}

      {/* Mode circle — swipe to change */}
      <div className="flex justify-center">
        <div
          className="cursor-grab transition-colors duration-500 active:cursor-grabbing"
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: currentMode.color,
            opacity: 0.75,
            touchAction: 'none',
          }}
          onMouseDown={(e) => startModeDrag(e.clientX)}
          onTouchStart={(e) => startModeDrag(e.touches[0].clientX)}
          onTouchMove={(e) => {
            e.preventDefault();
            if (!modeDragRef.current) return;
            const dx = e.touches[0].clientX - modeDragRef.current.startX;
            const steps = Math.round(dx / 25);
            const next = Math.max(
              0,
              Math.min(MODE.length - 1, modeDragRef.current.startIdx + steps),
            );
            if (next !== modeIdx) setModeIdx(next);
          }}
          onTouchEnd={() => {
            modeDragRef.current = null;
            setModeDragging(false);
          }}
        />
      </div>

      {/* Mode name */}
      <p
        className="text-center text-lg font-bold transition-all duration-300"
        style={{ color: currentMode.color, fontFamily: 'var(--font-serif)' }}
      >
        {currentMode.level}
      </p>

      {/* Mode rainbow — appears while dragging */}
      {modeDragging && (
        <div className="animate-in fade-in duration-150">
          <DragSlider items={MODE} selectedIdx={modeIdx} onSelect={setModeIdx} size={20} />
        </div>
      )}

      {/* Losange gateway */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => {
            setExpanded(!expanded);
            if (expanded) {
              setActiveTracker(null);
            }
          }}
          className="h-5 w-5 rotate-45 cursor-pointer transition-all duration-300 hover:scale-125"
          style={{
            background: expanded ? `${currentMind.color}40` : `${currentMind.color}18`,
            borderRadius: 2,
            border: 'none',
          }}
        />
      </div>

      {/* Expanded: note + FACING / PEACE */}
      {expanded && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Note input — Enter saves */}
          <div className="flex items-center gap-2 rounded-xl border border-[#C4A06020] bg-[#C4A06005] px-3 py-2.5">
            <span className="shrink-0 text-xs text-muted-foreground/40">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveEntry();
              }}
              placeholder="What's on your mind?"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/40"
            />
          </div>

          {/* Saved entries */}
          {entries.length > 0 && (
            <div className="space-y-1">
              {entries.map((e, i) => (
                <div key={i} className="flex items-start gap-2 px-1">
                  <span className="shrink-0 text-xs text-muted-foreground/30 pt-0.5">{e.time}</span>
                  <span
                    className="text-sm"
                    style={{ color: '#7a5438', fontFamily: 'var(--font-handwritten)' }}
                  >
                    {e.text}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* FACING / PEACE trackers */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {trackerMode === 'peace' && (
                <button
                  type="button"
                  onClick={() => {
                    setTrackerMode('facing');
                    setActiveTracker(null);
                  }}
                  className="shrink-0 cursor-pointer text-sm text-muted-foreground/50 transition-colors hover:text-muted-foreground/60"
                  style={{ background: 'none', border: 'none' }}
                >
                  ‹
                </button>
              )}

              <div className="flex flex-1 items-center justify-center gap-2">
                {(trackerMode === 'facing' ? INNER_TRACKERS : PEACE_TRACKERS).map((t, idx) => {
                  const isActive = activeTracker === t.id;
                  const size = isActive ? 46 : 38;
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

              {trackerMode === 'facing' && (
                <button
                  type="button"
                  onClick={() => {
                    setTrackerMode('peace');
                    setActiveTracker(null);
                  }}
                  className="shrink-0 cursor-pointer text-sm text-muted-foreground/50 transition-colors hover:text-muted-foreground/60"
                  style={{ background: 'none', border: 'none' }}
                >
                  ›
                </button>
              )}
            </div>

            {/* Tracker questions */}
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
                  <div className="space-y-1 animate-in fade-in duration-150">
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
                            className="-rotate-45 text-[10px] font-bold leading-none"
                            style={{ color: tracker.color }}
                          >
                            +
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()}
          </div>
        </div>
      )}
    </div>
  );
}

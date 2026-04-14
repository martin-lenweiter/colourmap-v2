'use client';

import { useEffect, useRef, useState } from 'react';
import { DoingContent } from '@/components/DoingCheckInCard';

/* ═══════════════════════════════════════════════════════════
   FEELING CHECK-IN CARD — Zen circle + losange gateway
   Swipe the circle to change emotion. Tap losange to go deeper.
   ═══════════════════════════════════════════════════════════ */

/* ─── PRESENCE spectrum — how am I inside, right now? ─── */
const MIND = [
  { level: 'Absent', color: '#E0908A' },
  { level: 'Scattered', color: '#E8B898' },
  { level: 'Drifting', color: '#D8C088' },
  { level: 'Present', color: '#A8CCA0' },
  { level: 'Flowing', color: '#B0A0D0' },
];

/* ─── ENGAGEMENT spectrum — how IN the mission am I? ─── */
const MODE = [
  { level: 'Avoiding', color: '#E0908A' },
  { level: 'Resisting', color: '#E8B898' },
  { level: 'Trying', color: '#D8C088' },
  { level: 'Working', color: '#A8CCA0' },
  { level: 'In Flow', color: '#90B8D8' },
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
  // Presence (formerly Mind) + Engagement (formerly Mode) — 5 levels each, default mid
  const [mindIdx, setMindIdx] = useState(() => {
    const v = loadNum('colourmap:presence-idx', 2);
    return Math.max(0, Math.min(MIND.length - 1, v));
  });
  const [modeIdx, setModeIdx] = useState(() => {
    const v = loadNum('colourmap:engagement-idx', 2);
    return Math.max(0, Math.min(MODE.length - 1, v));
  });
  const [objective, setObjective] = useState(() => {
    try {
      return localStorage.getItem('colourmap:current-objective') || '';
    } catch {
      return '';
    }
  });
  const [emotionInput, setEmotionInput] = useState('');
  const [sessionEmotions, setSessionEmotions] = useState<
    { time: string; text: string; mind: string; mindColor: string }[]
  >(() => {
    try {
      return JSON.parse(localStorage.getItem('colourmap:session-emotions') || '[]');
    } catch {
      return [];
    }
  });
  const [nextObjectives, setNextObjectives] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('colourmap:next-objectives') || '[]');
    } catch {
      return [];
    }
  });
  const [nextInput, setNextInput] = useState('');
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
  const [showRecent, setShowRecent] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [objectiveSectionOpen, setObjectiveSectionOpen] = useState(() => {
    try {
      return localStorage.getItem('colourmap:objective-section-open') === 'true';
    } catch {
      return false;
    }
  });
  const [emotionsSectionOpen, setEmotionsSectionOpen] = useState(() => {
    try {
      return localStorage.getItem('colourmap:emotions-section-open') !== 'false';
    } catch {
      return true;
    }
  });
  const [observationsSectionOpen, setObservationsSectionOpen] = useState(() => {
    try {
      return localStorage.getItem('colourmap:observations-section-open') !== 'false';
    } catch {
      return true;
    }
  });
  const [nextSectionOpen, setNextSectionOpen] = useState(() => {
    try {
      return localStorage.getItem('colourmap:next-section-open') === 'true';
    } catch {
      return false;
    }
  });
  const toggleSection = (
    section: 'objective' | 'emotions' | 'observations',
    setter: (fn: (prev: boolean) => boolean) => void,
  ) => {
    setter((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(`colourmap:${section}-section-open`, String(next));
      } catch {
        /* silent */
      }
      return next;
    });
  };
  const toggleObjectiveSection = () => toggleSection('objective', setObjectiveSectionOpen);
  const toggleEmotionsSection = () => toggleSection('emotions', setEmotionsSectionOpen);
  const toggleObservationsSection = () => toggleSection('observations', setObservationsSectionOpen);
  const toggleNextSection = () => {
    setNextSectionOpen((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('colourmap:next-section-open', String(next));
      } catch {
        /* silent */
      }
      return next;
    });
  };

  // Observations — persistent free-text notes
  const [observation, setObservation] = useState(() => {
    try {
      return localStorage.getItem('colourmap:current-observation') || '';
    } catch {
      return '';
    }
  });
  const [observationsList, setObservationsList] = useState<{ time: string; text: string }[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('colourmap:observations-list') || '[]');
    } catch {
      return [];
    }
  });
  const addObservation = () => {
    const text = observation.trim();
    if (!text) return;
    const entry = {
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text,
    };
    const next = [entry, ...observationsList].slice(0, 50);
    setObservationsList(next);
    try {
      localStorage.setItem('colourmap:observations-list', JSON.stringify(next));
    } catch {
      /* silent */
    }
    setObservation('');
    try {
      localStorage.setItem('colourmap:current-observation', '');
    } catch {
      /* silent */
    }
  };
  useEffect(() => {
    try {
      localStorage.setItem('colourmap:current-observation', observation);
    } catch {
      /* silent */
    }
  }, [observation]);

  // Life categories for objective tagging
  const [lifeCategories, setLifeCategories] = useState<
    { id: string; name: string; color: string }[]
  >([]);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [justTagged, setJustTagged] = useState<string | null>(null);
  useEffect(() => {
    try {
      const cats = localStorage.getItem('colourmap:life-categories');
      if (cats) setLifeCategories(JSON.parse(cats));
    } catch {
      /* silent */
    }
  }, []);

  const tagObjectiveToCategory = (categoryId: string) => {
    const text = objective.trim();
    if (!text) return;
    try {
      const raw = localStorage.getItem('colourmap:life-targets');
      const existing: Array<{
        id: string;
        categoryId: string;
        text: string;
        done: boolean;
        createdAt: string;
        completedAt: string | null;
      }> = raw ? JSON.parse(raw) : [];
      const newTarget = {
        id: crypto.randomUUID(),
        categoryId,
        text,
        done: false,
        createdAt: new Date().toISOString(),
        completedAt: null,
      };
      localStorage.setItem('colourmap:life-targets', JSON.stringify([...existing, newTarget]));
      setJustTagged(categoryId);
      setShowCategoryPicker(false);
      setTimeout(() => setJustTagged(null), 1200);
    } catch {
      /* silent */
    }
  };
  const [checkIns, setCheckIns] = useState<
    {
      id: string;
      time: string;
      date: string;
      mind: string;
      mindColor: string;
      mode: string;
      modeColor: string;
      note: string;
      objective: string;
      emotions: { time: string; text: string; mind: string; mindColor: string }[];
      facing: Record<string, string>;
    }[]
  >(() => {
    try {
      return JSON.parse(localStorage.getItem('colourmap:check-ins') || '[]');
    } catch {
      return [];
    }
  });

  /* ─── Completed objectives history (with snapshot of reflections) ─── */
  type DoneObjective = {
    id: string;
    text: string;
    completedAt: string;
    reflections?: { time: string; text: string; mind: string; mindColor: string }[];
    mindAtComplete?: string;
    modeAtComplete?: string;
  };
  const [doneObjectives, setDoneObjectives] = useState<DoneObjective[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('colourmap:done-objectives') || '[]');
    } catch {
      return [];
    }
  });
  const [showDone, setShowDone] = useState(false);
  const [expandedDoneId, setExpandedDoneId] = useState<string | null>(null);

  const completeObjective = (text: string, promoteFirstNext = true) => {
    const clean = text.trim();
    if (!clean) return;
    const entry: DoneObjective = {
      id: crypto.randomUUID(),
      text: clean,
      completedAt: new Date().toISOString(),
      // Snapshot the logbook entries that accompanied this objective
      reflections: sessionEmotions.slice(),
      mindAtComplete: currentMind.level,
      modeAtComplete: currentMode.level,
    };
    const next = [entry, ...doneObjectives].slice(0, 200);
    setDoneObjectives(next);
    try {
      localStorage.setItem('colourmap:done-objectives', JSON.stringify(next));
    } catch {
      /* silent */
    }
    // Clear the current session's reflections — they travel with the done objective
    setSessionEmotions([]);
    try {
      localStorage.setItem('colourmap:session-emotions', '[]');
    } catch {
      /* silent */
    }
    if (promoteFirstNext && nextObjectives.length > 0) {
      setObjective(nextObjectives[0]);
      setNextObjectives(nextObjectives.slice(1));
    } else {
      setObjective('');
    }
  };
  const completeNextObjective = (i: number) => {
    const text = nextObjectives[i];
    // Next objectives don't have their own reflection stream yet — store bare entry
    const entry: DoneObjective = {
      id: crypto.randomUUID(),
      text,
      completedAt: new Date().toISOString(),
      mindAtComplete: currentMind.level,
      modeAtComplete: currentMode.level,
    };
    const next = [entry, ...doneObjectives].slice(0, 200);
    setDoneObjectives(next);
    try {
      localStorage.setItem('colourmap:done-objectives', JSON.stringify(next));
    } catch {
      /* silent */
    }
    setNextObjectives(nextObjectives.filter((_, idx) => idx !== i));
  };

  const saveCheckIn = () => {
    // Only save if there's something beyond default state
    const hasNote = note.trim().length > 0;
    const hasEmotions = sessionEmotions.length > 0;
    const hasFacing = Object.values(trackerValues).some((v) => v.trim());
    if (!hasNote && !hasEmotions && !hasFacing) return;

    const entry = {
      id: crypto.randomUUID(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toISOString(),
      mind: currentMind.level,
      mindColor: currentMind.color,
      mode: currentMode.level,
      modeColor: currentMode.color,
      note: note.trim(),
      objective: objective.trim(),
      emotions: [...sessionEmotions],
      facing: { ...trackerValues },
    };
    const next = [entry, ...checkIns].slice(0, 100);
    setCheckIns(next);
    localStorage.setItem('colourmap:check-ins', JSON.stringify(next));

    // Clear session — promote next objective if available
    setNote('');
    setSessionEmotions([]);
    localStorage.setItem('colourmap:session-emotions', '[]');
    if (nextObjectives.length > 0) {
      setObjective(nextObjectives[0]);
      setNextObjectives(nextObjectives.slice(1));
    }
    setTrackerValues({});
    setActiveTracker(null);

    // Pulse confirmation
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 1500);
  };

  // Persist to localStorage (new keys for Presence/Engagement)
  useEffect(() => {
    localStorage.setItem('colourmap:presence-idx', String(mindIdx));
  }, [mindIdx]);
  useEffect(() => {
    localStorage.setItem('colourmap:engagement-idx', String(modeIdx));
  }, [modeIdx]);
  useEffect(() => {
    localStorage.setItem('colourmap:feeling-note', note);
  }, [note]);
  useEffect(() => {
    localStorage.setItem('colourmap:tracker-values', JSON.stringify(trackerValues));
  }, [trackerValues]);
  useEffect(() => {
    localStorage.setItem('colourmap:current-objective', objective);
  }, [objective]);
  useEffect(() => {
    localStorage.setItem('colourmap:session-emotions', JSON.stringify(sessionEmotions));
  }, [sessionEmotions]);
  useEffect(() => {
    localStorage.setItem('colourmap:next-objectives', JSON.stringify(nextObjectives));
  }, [nextObjectives]);

  const addNextObjective = () => {
    if (!nextInput.trim()) return;
    setNextObjectives([...nextObjectives, nextInput.trim()]);
    setNextInput('');
  };

  const promoteNext = (idx: number) => {
    const promoted = nextObjectives[idx];
    setNextObjectives(nextObjectives.filter((_, i) => i !== idx));
    setObjective(promoted);
  };

  const removeNext = (idx: number) => {
    setNextObjectives(nextObjectives.filter((_, i) => i !== idx));
  };

  const addEmotion = () => {
    if (!emotionInput.trim()) return;
    const entry = {
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: emotionInput.trim(),
      mind: currentMind.level,
      mindColor: currentMind.color,
    };
    const next = [...sessionEmotions, entry];
    setSessionEmotions(next);
    setEmotionInput('');
  };

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
      {/* Presence — one circle, centered */}
      <div className="flex flex-col items-center gap-2">
        <span
          className="text-xs font-semibold uppercase tracking-[0.22em]"
          style={{ color: '#C4A060' }}
        >
          Presence
        </span>
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
        <p
          className="text-center text-xl font-bold transition-all duration-300"
          style={{ color: currentMind.color, fontFamily: 'var(--font-serif)' }}
        >
          {currentMind.level}
        </p>
        {mindDragging && (
          <div className="animate-in fade-in duration-150">
            <DragSlider items={MIND} selectedIdx={mindIdx} onSelect={setMindIdx} size={18} />
          </div>
        )}
      </div>

      {/* ── CURRENT OBJECTIVE ── clickable pill opens/closes the Logbook below */}
      <div className="flex flex-col items-center gap-2 pt-1">
        <button
          type="button"
          onClick={toggleObjectiveSection}
          className="flex cursor-pointer items-center gap-2 rounded-full px-5 py-1.5 transition-all"
          style={{
            background: '#C4A06015',
            border: '1px solid #C4A06040',
          }}
        >
          <span
            className="text-center text-sm font-semibold uppercase tracking-[0.22em]"
            style={{ color: '#C4A060' }}
          >
            Current Objective
          </span>
          <span
            className="text-sm transition-transform duration-200"
            style={{
              color: '#C4A06080',
              transform: objectiveSectionOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          >
            ▾
          </span>
        </button>
        <div className="relative flex w-full items-center gap-2">
          <input
            type="text"
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            placeholder="set an objective..."
            className="flex-1 border-b bg-transparent pb-1 text-center outline-none placeholder:text-muted-foreground/40"
            style={{
              color: '#7a5438',
              borderColor: '#C4A06020',
              fontFamily: 'var(--font-handwritten)',
              fontSize: '24px',
            }}
          />
          {lifeCategories.length > 0 && objective.trim().length > 0 && (
            <button
              type="button"
              onClick={() => setShowCategoryPicker(!showCategoryPicker)}
              className="shrink-0 cursor-pointer rounded-md px-2 py-0.5 text-[11px] uppercase tracking-wider transition-all"
              style={{
                color: showCategoryPicker ? '#C4A060' : '#C4A06060',
                background: showCategoryPicker ? '#C4A06010' : 'transparent',
                border: `1px solid ${showCategoryPicker ? '#C4A06030' : 'transparent'}`,
              }}
            >
              {justTagged ? '✓ tagged' : 'tag'}
            </button>
          )}
          {/* Completion checkbox — mark objective as done */}
          {objective.trim().length > 0 && (
            <button
              type="button"
              onClick={() => completeObjective(objective)}
              title="Mark as done"
              className="flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded border transition-all hover:scale-110"
              style={{
                borderColor: '#7AAA5860',
                background: '#7AAA5810',
              }}
            >
              <span className="text-xs" style={{ color: '#7AAA58' }}>
                ✓
              </span>
            </button>
          )}
          {showCategoryPicker && lifeCategories.length > 0 && (
            <div
              className="absolute right-0 top-full z-50 mt-1 animate-in fade-in duration-150 overflow-hidden rounded-xl"
              style={{
                background: '#F5ECDC',
                border: '1px solid #8A6A4A40',
                boxShadow: '0 8px 24px rgba(92,48,24,0.18)',
                minWidth: 180,
              }}
            >
              {lifeCategories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => tagObjectiveToCategory(cat.id)}
                  className="flex w-full cursor-pointer items-center gap-2.5 px-3 py-2 text-left transition-all hover:bg-muted/30"
                  style={{ border: 'none', background: 'transparent' }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: cat.color,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '14px',
                      color: '#7a5438',
                    }}
                  >
                    {cat.name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── LOGBOOK & EMOTIONS ── opens with Current Objective */}
      {objectiveSectionOpen && (
        <div className="space-y-2 pt-1">
          <p
            className="text-center text-sm font-semibold uppercase tracking-[0.18em]"
            style={{ color: '#C4A06080' }}
          >
            Logbook & Emotions
          </p>
          <input
            type="text"
            value={emotionInput}
            onChange={(e) => setEmotionInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') addEmotion();
            }}
            className="w-full border-b bg-transparent pb-1 outline-none"
            style={{
              color: '#7a5438',
              borderColor: '#C4A06020',
              fontFamily: 'var(--font-handwritten)',
              fontSize: '20px',
            }}
          />
          {sessionEmotions.length > 0 && (
            <div className="space-y-1">
              {sessionEmotions.map((e, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="shrink-0 text-sm text-muted-foreground/30">{e.time}</span>
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ background: e.mindColor, opacity: 0.6 }}
                  />
                  <span
                    style={{
                      color: '#7a5438',
                      fontFamily: 'var(--font-handwritten)',
                      fontSize: '20px',
                    }}
                  >
                    {e.text}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── NEXT OBJECTIVE ── hidden behind a "+" when empty and closed */}
      {!nextSectionOpen && nextObjectives.length === 0 ? (
        <div className="flex justify-center pt-1">
          <button
            type="button"
            onClick={toggleNextSection}
            title="Add next objective"
            className="group flex items-center gap-1.5 cursor-pointer bg-transparent transition-all"
            style={{ border: 'none' }}
          >
            <span
              className="flex h-6 w-6 rotate-45 items-center justify-center rounded-[3px] border transition-all group-hover:scale-110"
              style={{ borderColor: '#C4A06040', background: '#C4A06010' }}
            >
              <span
                className="-rotate-45 text-sm font-light"
                style={{ color: '#C4A060', lineHeight: 1 }}
              >
                +
              </span>
            </span>
            <span
              className="text-[10px] font-semibold uppercase tracking-[0.18em] opacity-0 transition-opacity group-hover:opacity-70"
              style={{ color: '#C4A060' }}
            >
              next
            </span>
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 pt-1">
          <button
            type="button"
            onClick={toggleNextSection}
            className="flex cursor-pointer items-center gap-2 rounded-full px-5 py-1.5 transition-all"
            style={{
              background: '#C4A06015',
              border: '1px solid #C4A06040',
            }}
          >
            <span
              className="text-center text-sm font-semibold uppercase tracking-[0.22em]"
              style={{ color: '#C4A060' }}
            >
              Next Objective
            </span>
            <span
              className="text-sm transition-transform duration-200"
              style={{
                color: '#C4A06080',
                transform: nextSectionOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            >
              ▾
            </span>
          </button>
        </div>
      )}

      {/* Existing next-objective list — always visible if any exist */}
      {nextObjectives.length > 0 && (
        <div className="space-y-1">
          {nextObjectives.map((obj, i) => (
            <div
              key={`${obj}-${i}`}
              className="group relative flex items-center justify-center px-8"
            >
              <button
                type="button"
                onClick={() => promoteNext(i)}
                className="absolute left-0 cursor-pointer text-sm transition-colors hover:text-muted-foreground/60"
                style={{ color: '#C4A060', opacity: 0.5, background: 'none', border: 'none' }}
                title="Make current"
              >
                ↑
              </button>
              <span
                className="text-center"
                style={{
                  color: '#7a5438',
                  fontFamily: 'var(--font-handwritten)',
                  fontSize: '24px',
                }}
              >
                {obj}
              </span>
              <div className="absolute right-0 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => completeNextObjective(i)}
                  title="Mark as done"
                  className="flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded border transition-all hover:scale-110"
                  style={{
                    borderColor: '#7AAA5860',
                    background: '#7AAA5810',
                  }}
                >
                  <span className="text-xs" style={{ color: '#7AAA58' }}>
                    ✓
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => removeNext(i)}
                  title="Remove"
                  className="cursor-pointer text-sm opacity-0 transition-opacity group-hover:opacity-40"
                  style={{ color: '#7a5438', background: 'none', border: 'none' }}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Input only when the pill is open */}
      {nextSectionOpen && (
        <input
          type="text"
          value={nextInput}
          onChange={(e) => setNextInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') addNextObjective();
          }}
          placeholder="+ add next objective..."
          className="w-full border-b bg-transparent pb-1 text-center outline-none placeholder:text-muted-foreground/40"
          style={{
            color: '#7a5438',
            borderColor: '#C4A06020',
            fontFamily: 'var(--font-handwritten)',
            fontSize: '24px',
          }}
        />
      )}

      {/* ── DONE ── completed objectives history (matching Current/Next pill) */}
      {doneObjectives.length > 0 && (
        <>
          <div className="flex flex-col items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowDone(!showDone)}
              className="flex cursor-pointer items-center gap-2 rounded-full px-5 py-1.5 transition-all"
              style={{
                background: '#7AAA5810',
                border: '1px solid #7AAA5840',
              }}
            >
              <span
                className="text-center text-sm font-semibold uppercase tracking-[0.22em]"
                style={{ color: '#7AAA58' }}
              >
                Done · {doneObjectives.length}
              </span>
              <span
                className="text-sm transition-transform duration-200"
                style={{
                  color: '#7AAA5880',
                  transform: showDone ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              >
                ▾
              </span>
            </button>
          </div>

          {showDone && (
            <div className="space-y-2 animate-in fade-in duration-200">
              {doneObjectives.slice(0, 12).map((d) => {
                const dt = new Date(d.completedAt);
                const dateStr = `${dt.getDate()}/${dt.getMonth() + 1}`;
                const hasReflections = (d.reflections?.length ?? 0) > 0;
                const isOpen = expandedDoneId === d.id;
                return (
                  <div key={d.id} className="space-y-1">
                    <div className="group relative flex items-center justify-center px-8">
                      <span className="absolute left-0 text-xs" style={{ color: '#8A6A4A50' }}>
                        {dateStr}
                      </span>
                      <button
                        type="button"
                        onClick={() => setExpandedDoneId(isOpen ? null : d.id)}
                        className="cursor-pointer text-center line-through"
                        style={{
                          color: '#7a5438',
                          fontFamily: 'var(--font-handwritten)',
                          fontSize: '20px',
                          opacity: 0.55,
                          background: 'none',
                          border: 'none',
                        }}
                      >
                        {d.text}
                        {hasReflections && (
                          <span
                            className="ml-2 text-[10px] no-underline"
                            style={{ color: '#C4A06080' }}
                          >
                            {d.reflections?.length} note{d.reflections?.length === 1 ? '' : 's'}
                          </span>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const next = doneObjectives.filter((x) => x.id !== d.id);
                          setDoneObjectives(next);
                          try {
                            localStorage.setItem('colourmap:done-objectives', JSON.stringify(next));
                          } catch {
                            /* silent */
                          }
                          if (expandedDoneId === d.id) setExpandedDoneId(null);
                        }}
                        title="Remove from history"
                        className="absolute right-0 cursor-pointer text-sm opacity-0 transition-opacity group-hover:opacity-40"
                        style={{ color: '#7a5438', background: 'none', border: 'none' }}
                      >
                        ✕
                      </button>
                    </div>

                    {/* Expanded reflections for this done objective */}
                    {isOpen && (
                      <div
                        className="mx-auto max-w-md space-y-1 rounded-xl border px-4 py-2 animate-in fade-in duration-150"
                        style={{
                          borderColor: '#8A6A4A20',
                          background: 'rgba(245,236,220,0.55)',
                        }}
                      >
                        {/* State at completion */}
                        {(d.mindAtComplete || d.modeAtComplete) && (
                          <div
                            className="flex items-center justify-center gap-3 pb-1 text-xs"
                            style={{ color: '#8A6A4A70' }}
                          >
                            {d.mindAtComplete && <span>mind: {d.mindAtComplete}</span>}
                            {d.modeAtComplete && <span>· mode: {d.modeAtComplete}</span>}
                          </div>
                        )}
                        {/* Reflections list */}
                        {hasReflections ? (
                          d.reflections?.map((r, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <span className="shrink-0 text-xs" style={{ color: '#8A6A4A40' }}>
                                {r.time}
                              </span>
                              <span
                                className="h-2 w-2 shrink-0 rounded-full"
                                style={{ background: r.mindColor, opacity: 0.6 }}
                              />
                              <span
                                style={{
                                  color: '#7a5438',
                                  fontFamily: 'var(--font-handwritten)',
                                  fontSize: '16px',
                                }}
                              >
                                {r.text}
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="text-center text-xs italic" style={{ color: '#8A6A4A50' }}>
                            no reflections recorded
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Save star — quick save without opening losange */}
      <div className="flex flex-col items-center gap-1">
        <button
          type="button"
          onClick={() => {
            saveCheckIn();
          }}
          className="cursor-pointer transition-all duration-500 hover:scale-125"
          style={{ background: 'none', border: 'none', padding: 0 }}
        >
          <svg width={20} height={20} viewBox="0 0 20 20">
            {(() => {
              const cx = 10;
              const cy = 10;
              const r1 = 9;
              const r2 = 3.5;
              const pts: string[] = [];
              for (let i = 0; i < 8; i++) {
                const a = -Math.PI / 2 + (i * Math.PI) / 4;
                const r = i % 2 === 0 ? r1 : r2;
                pts.push(`${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`);
              }
              return (
                <polygon
                  points={pts.join(' ')}
                  fill={justSaved ? currentMind.color : `${currentMind.color}40`}
                  style={{ transition: 'fill 0.5s' }}
                />
              );
            })()}
          </svg>
        </button>
        {justSaved && (
          <span
            className="text-xs animate-in fade-in duration-300"
            style={{
              color: currentMind.color,
              opacity: 0.6,
              fontFamily: 'var(--font-handwritten)',
            }}
          >
            saved
          </span>
        )}
      </div>

      {/* Losange gateway — closing also saves */}
      <div className="flex flex-col items-center gap-1">
        <button
          type="button"
          onClick={() => {
            if (expanded) {
              saveCheckIn();
              setExpanded(false);
            } else {
              setExpanded(true);
            }
          }}
          className="flex items-center gap-2 cursor-pointer transition-all duration-300 hover:opacity-80"
          style={{ background: 'none', border: 'none' }}
        >
          <span
            className="h-4 w-4 rotate-45 transition-all duration-300"
            style={{
              background: expanded ? `${currentMind.color}60` : `${currentMind.color}25`,
              borderRadius: 2,
            }}
          />
          <span
            className="text-xs font-semibold uppercase tracking-[0.18em]"
            style={{ color: expanded ? currentMind.color : '#8A6A4A80' }}
          >
            {expanded ? 'save & close' : 'go deeper'}
          </span>
        </button>
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
                if (e.key === 'Enter') {
                  saveCheckIn();
                  setExpanded(false);
                }
              }}
              placeholder="What's on your mind?"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/40"
            />
          </div>

          {/* Recent check-ins — collapsible */}
          {checkIns.length > 0 && (
            <div>
              <button
                type="button"
                onClick={() => setShowRecent(!showRecent)}
                className="flex w-full cursor-pointer items-center justify-between"
                style={{ background: 'none', border: 'none', padding: 0 }}
              >
                <span className="text-xs text-muted-foreground/40">Recent ({checkIns.length})</span>
                <span className="text-xs text-muted-foreground/30">{showRecent ? '▲' : '▼'}</span>
              </button>
              {showRecent && (
                <div className="space-y-1.5 pt-2 animate-in fade-in duration-150">
                  {checkIns.slice(0, 5).map((c) => (
                    <div key={c.id} className="flex items-start gap-2 px-1">
                      <span className="shrink-0 text-xs text-muted-foreground/30 pt-0.5">
                        {c.time}
                      </span>
                      <div className="flex items-center gap-1 shrink-0 pt-1">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ background: c.mindColor, opacity: 0.7 }}
                        />
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ background: c.modeColor, opacity: 0.5 }}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        {c.objective && (
                          <p
                            className="text-xs font-semibold truncate"
                            style={{ color: '#7a5438', fontFamily: 'var(--font-handwritten)' }}
                          >
                            {c.objective}
                          </p>
                        )}
                        {c.emotions && c.emotions.length > 0 && (
                          <p
                            className="text-xs truncate"
                            style={{
                              color: '#7a5438',
                              opacity: 0.6,
                              fontFamily: 'var(--font-handwritten)',
                            }}
                          >
                            {c.emotions.map((em: { text: string }) => em.text).join(' → ')}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Doing: to-do, missions, trackers */}
          <DoingContent />

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

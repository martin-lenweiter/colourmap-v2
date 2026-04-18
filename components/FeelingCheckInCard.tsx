'use client';

import { useEffect, useRef, useState } from 'react';
import CategoryTagPicker from '@/components/CategoryTagPicker';

/* ═══════════════════════════════════════════════════════════
   FEELING CHECK-IN CARD — Zen circle + losange gateway
   Swipe the circle to change emotion. Tap losange to go deeper.
   ═══════════════════════════════════════════════════════════ */

/* ─── PRESENCE spectrum — am I here? (6 levels) ─── */
const MIND = [
  { level: 'Absent', color: '#E0908A' },
  { level: 'Scattered', color: '#E8B898' },
  { level: 'Confused', color: '#C8A8C8' },
  { level: 'Drifting', color: '#D8C088' },
  { level: 'Present', color: '#A8CCA0' },
  { level: 'Flowing', color: '#B0A0D0' },
];

/* ─── HAWKINS emotional spectrum — classic Map of Consciousness, 10-level distillation
       from contraction (Shame) toward expansion (Peace). Colours stay on the cool→warm→
       light arc so the visual still reads as a journey from stuck to free. */
const HAWKINS = [
  { level: 'Shame', color: '#B8D0E8', hawkins: 20 },
  { level: 'Apathy', color: '#D8B0C8', hawkins: 50 },
  { level: 'Grief', color: '#E8A0C4', hawkins: 75 },
  { level: 'Fear', color: '#F080B8', hawkins: 100 },
  { level: 'Anger', color: '#F0A088', hawkins: 150 },
  { level: 'Courage', color: '#F8C040', hawkins: 200 },
  { level: 'Acceptance', color: '#F0E060', hawkins: 350 },
  { level: 'Reason', color: '#A8E090', hawkins: 400 },
  { level: 'Love', color: '#88D8B0', hawkins: 500 },
  { level: 'Peace', color: '#88C8E8', hawkins: 600 },
];

/* ─── ENGAGEMENT spectrum — how IN the mission am I? ─── */
const MODE = [
  { level: 'Avoiding', color: '#E0908A' },
  { level: 'Resisting', color: '#E8B898' },
  { level: 'Trying', color: '#D8C088' },
  { level: 'Working', color: '#A8CCA0' },
  { level: 'In Flow', color: '#90B8D8' },
];

/* ─── Meaningful sliders at the bottom of box 1 — warm rainbow palette ─── */
// Are you clear on next missions? — Lost → Crystal
const CLARITY_MISSIONS = [
  { level: 'Lost', color: '#E0908A' },
  { level: 'Foggy', color: '#C8A8C8' },
  { level: 'Some', color: '#D8C088' },
  { level: 'Clear', color: '#A8CCA0' },
  { level: 'Crystal', color: '#B0D0E8' },
];

// Ready to push? — Drained → Charged
const READINESS = [
  { level: 'Drained', color: '#A8B8D0' },
  { level: 'Slow', color: '#B0C8A8' },
  { level: 'Steady', color: '#D8C088' },
  { level: 'Ready', color: '#E0B898' },
  { level: 'Charged', color: '#E0908A' },
];

const _INNER_TRACKERS = [
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

const _CELL_SHAPES = [
  '60% 40% 55% 45% / 50% 60% 40% 50%',
  '45% 55% 40% 60% / 55% 45% 55% 45%',
  '50% 50% 45% 55% / 40% 60% 50% 50%',
  '55% 45% 60% 40% / 50% 50% 45% 55%',
  '52% 48% 42% 58% / 48% 52% 50% 50%',
  '48% 52% 55% 45% / 55% 45% 48% 52%',
];

const _PEACE_TRACKERS = [
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
      className="flex cursor-pointer"
      style={{
        gap: `${gap}px`,
        touchAction: 'none',
        width: 'fit-content',
        marginLeft: 'auto',
        marginRight: 'auto',
      }}
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
  // Presence — 5 levels (Absent → Flowing), default mid (idx 2 = Drifting)
  const [mindIdx, setMindIdx] = useState(() => {
    const v = loadNum('colourmap:presence-idx', 2);
    return Math.max(0, Math.min(MIND.length - 1, v));
  });
  // Process state — 10 steps from Frozen → Liberation, default mid (idx 4 = Wrestling)
  const [hawkinsIdx, setHawkinsIdx] = useState(() => {
    const v = loadNum('colourmap:process-idx', 4);
    return Math.max(0, Math.min(HAWKINS.length - 1, v));
  });
  const _currentHawkins = HAWKINS[hawkinsIdx];
  // MODE retained for backwards compat with existing check-ins history; not rendered
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
    {
      time: string;
      text: string;
      mind: string;
      mindColor: string;
      tag?: string;
      tagColor?: string;
    }[]
  >(() => {
    try {
      return JSON.parse(localStorage.getItem('colourmap:session-emotions') || '[]');
    } catch {
      return [];
    }
  });
  // In-progress tag picked for the next challenge/flow entry. Reset after save.
  const [challengeTag, setChallengeTag] = useState<{ name: string; color: string } | null>(null);
  const [flowTag, setFlowTag] = useState<{ name: string; color: string } | null>(null);
  const [showChallengeTagPicker, setShowChallengeTagPicker] = useState(false);
  const [showFlowTagPicker, setShowFlowTagPicker] = useState(false);
  // Static compass axis options (Caring / Doing / Sharing) — offered alongside user-named life categories
  const COMPASS_AXES: { name: string; color: string; group: string }[] = [
    { name: 'Care', color: '#D4805A', group: 'Caring' },
    { name: 'Attitude', color: '#C4A070', group: 'Caring' },
    { name: 'Rest', color: '#C4906A', group: 'Caring' },
    { name: 'Emotions', color: '#B07A5A', group: 'Caring' },
    { name: 'Clarity', color: '#7AAA58', group: 'Doing' },
    { name: 'Target', color: '#7A9A7A', group: 'Doing' },
    { name: 'Resources', color: '#8AB0A0', group: 'Doing' },
    { name: 'Action', color: '#9AB090', group: 'Doing' },
    { name: 'Voice', color: '#6B7F4E', group: 'Sharing' },
    { name: 'Listen', color: '#8CA46E', group: 'Sharing' },
    { name: 'Bond', color: '#7B9560', group: 'Sharing' },
    { name: 'Boundary', color: '#5F7447', group: 'Sharing' },
  ];
  const [nextObjectives, setNextObjectives] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('colourmap:next-objectives') || '[]');
    } catch {
      return [];
    }
  });
  const [nextInput, setNextInput] = useState('');
  const [_trackerMode, _setTrackerMode] = useState<TrackerMode>('facing');
  const [note, setNote] = useState(() => {
    try {
      return localStorage.getItem('colourmap:feeling-note') || '';
    } catch {
      return '';
    }
  });
  const [_activeTracker, setActiveTracker] = useState<string | null>(null);
  const [trackerValues, setTrackerValues] = useState<Record<string, string>>(() => {
    try {
      return JSON.parse(localStorage.getItem('colourmap:tracker-values') || '{}');
    } catch {
      return {};
    }
  });
  const [_expanded, _setExpanded] = useState(false);
  const [_showRecent, _setShowRecent] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [objectiveSectionOpen, setObjectiveSectionOpen] = useState(() => {
    try {
      return localStorage.getItem('colourmap:objective-section-open') !== 'false';
    } catch {
      return true;
    }
  });
  const [_emotionsSectionOpen, setEmotionsSectionOpen] = useState(() => {
    try {
      return localStorage.getItem('colourmap:emotions-section-open') !== 'false';
    } catch {
      return true;
    }
  });
  const [_observationsSectionOpen, setObservationsSectionOpen] = useState(() => {
    try {
      return localStorage.getItem('colourmap:observations-section-open') !== 'false';
    } catch {
      return true;
    }
  });
  const [_nextSectionOpen, setNextSectionOpen] = useState(() => {
    try {
      return localStorage.getItem('colourmap:next-section-open') === 'true';
    } catch {
      return false;
    }
  });
  const [dailyObjOpen, setDailyObjOpen] = useState(true);
  const [pushTomorrowOpen, setPushTomorrowOpen] = useState(true);
  const [doneOpen, setDoneOpen] = useState(false);
  const [otherMissionsOpen, setOtherMissionsOpen] = useState(() => {
    try {
      return localStorage.getItem('colourmap:other-missions-open') !== 'false';
    } catch {
      return true;
    }
  });
  const toggleOtherMissions = () => {
    setOtherMissionsOpen((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('colourmap:other-missions-open', String(next));
      } catch {
        /* silent */
      }
      return next;
    });
  };
  const [logbookSectionOpen, setLogbookSectionOpen] = useState(() => {
    try {
      return localStorage.getItem('colourmap:logbook-section-open') !== 'false';
    } catch {
      return true;
    }
  });
  const toggleLogbookSection = () => {
    setLogbookSectionOpen((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('colourmap:logbook-section-open', String(next));
      } catch {
        /* silent */
      }
      return next;
    });
  };
  const [_presenceSectionOpen, setPresenceSectionOpen] = useState(() => {
    try {
      return localStorage.getItem('colourmap:presence-section-open') === 'true';
    } catch {
      return false;
    }
  });
  const _togglePresenceSection = () => {
    setPresenceSectionOpen((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('colourmap:presence-section-open', String(next));
      } catch {
        /* silent */
      }
      return next;
    });
  };
  // Writing stream inside Presence & Emotions — each entry can be tagged with a Hawkins level
  type PresenceEntry = {
    time: string;
    text: string;
    hawkinsIdx?: number;
    hawkinsName?: string;
    hawkinsColor?: string;
    hawkinsLevel?: number;
  };
  const [presenceInput, setPresenceInput] = useState('');
  const [entryHawkinsIdx, setEntryHawkinsIdx] = useState<number | null>(null); // null = not tagged
  const [_showHawkinsPicker, setShowHawkinsPicker] = useState(false);
  const [_showDotHawkinsPicker, _setShowDotHawkinsPicker] = useState(false);

  // Emotional-register variant — six ways to render the same balance level.
  // 1 arc · 2 circle · 3 rings · 4 mountain · 5 slider · 6 boxes
  type Variant = 1 | 2 | 3 | 4 | 5 | 6;
  const VARIANTS: { id: Variant; label: string }[] = [
    { id: 1, label: 'arc' },
    { id: 2, label: 'circle' },
    { id: 3, label: 'rings' },
    { id: 4, label: 'mountain' },
    { id: 5, label: 'slider' },
    { id: 6, label: 'boxes' },
  ];
  const [variantIdx, setVariantIdx] = useState<Variant>(() => {
    const v = loadNum('colourmap:design-variant', 1);
    return Math.max(1, Math.min(6, v)) as Variant;
  });
  useEffect(() => {
    localStorage.setItem('colourmap:design-variant', String(variantIdx));
  }, [variantIdx]);
  const [designsOpen, setDesignsOpen] = useState(false);

  // hawkinsIdx + setHawkinsIdx already declared above (line ~285) — reused by the Boxes variant

  const _CLARITY = [
    'Sharp',
    'Clear',
    'Seeing',
    'Noticing',
    'Grounded',
    'Aware',
    'Curious',
    'Open',
    'Quiet',
    'Present',
  ];

  // VARIANT 6: 3-column x 5-row grid. Left = heavy, middle = uncertain, right = light.
  const GRID_3x5: { label: string; color: string }[][] = [
    // Left column (Heavy) — dusty blue-pink shades
    [
      { label: 'Frozen', color: '#B8D0E8' },
      { label: 'Stuck', color: '#C8B0D0' },
      { label: 'Frustrated', color: '#EE9090' },
      { label: 'Distracted', color: '#E8A0C4' },
      { label: 'Restless', color: '#F080B8' },
    ],
    // Middle column (Uncertain) — warm yellows/oranges
    [
      { label: 'Confused', color: '#EF988C' },
      { label: 'Drifting', color: '#F0A088' },
      { label: 'Wrestling', color: '#F0B060' },
      { label: 'Searching', color: '#F8C040' },
      { label: 'Opening', color: '#F0E060' },
    ],
    // Right column (Light) — greens to blues, productive/focused
    [
      { label: 'Curious', color: '#C8E880' },
      { label: 'Focused', color: '#A8E090' },
      { label: 'On It', color: '#88D8B0' },
      { label: 'Productive', color: '#88D8D0' },
      { label: 'In Flow', color: '#88C8E8' },
    ],
  ];
  // State for grid: [col, row] — default middle center
  const [gridCol, _setGridCol] = useState(() => loadNum('colourmap:grid-col', 1));
  const [gridRow, _setGridRow] = useState(() => loadNum('colourmap:grid-row', 2));
  useEffect(() => {
    localStorage.setItem('colourmap:grid-col', String(gridCol));
  }, [gridCol]);
  useEffect(() => {
    localStorage.setItem('colourmap:grid-row', String(gridRow));
  }, [gridRow]);
  const _gridCell = GRID_3x5[gridCol]?.[gridRow] ?? GRID_3x5[1][2];

  // VARIANT 2: Balance scale — middle is equilibrium, extremes are valid deep states
  const BALANCE = [
    { label: 'Deep Rest', color: '#88C8E8' }, // far left — restorative
    { label: 'Soft', color: '#B8D8E8' },
    { label: 'Easing', color: '#C8E880' },
    { label: 'Balance', color: '#7AAA58' }, // center
    { label: 'Engaged', color: '#F8C040' },
    { label: 'Focused', color: '#F0A088' },
    { label: 'Tunnel Vision', color: '#E08030' }, // far right — deep focus
  ];
  const [balanceIdx, setBalanceIdx] = useState(() => loadNum('colourmap:balance-idx', 3));
  useEffect(() => {
    localStorage.setItem('colourmap:balance-idx', String(balanceIdx));
  }, [balanceIdx]);

  // CONTEXT — outer ring layer for variant 1: am I on the right mission?
  const CONTEXT = [
    { label: 'Avoiding', color: '#88C8E8' }, // turning away from mission
    { label: 'Absorbed', color: '#C8B0D0' }, // head down in detail, missing context
    { label: 'Facing', color: '#7AAA58' }, // engaged with mission
    { label: 'Aware', color: '#F8C040' }, // seeing the bigger picture
    { label: 'Re-orienting', color: '#F0A088' }, // shifting / questioning
  ];
  const [contextIdx, _setContextIdx] = useState(() => {
    const v = loadNum('colourmap:context-idx', 2);
    return Math.max(0, Math.min(CONTEXT.length - 1, v));
  });
  const [_showContextPicker, _setShowContextPicker] = useState(false);
  useEffect(() => {
    localStorage.setItem('colourmap:context-idx', String(contextIdx));
  }, [contextIdx]);

  // Mission presence — second arc: how here am I with my mission?
  const _PRESENCE_ARC = [
    { label: 'Absent', color: '#88C8E8' },
    { label: 'Distant', color: '#B8D8E8' },
    { label: 'Dipping', color: '#C8E880' },
    { label: 'Present', color: '#7AAA58' },
    { label: 'Connected', color: '#F8C040' },
    { label: 'Absorbed', color: '#F0A088' },
    { label: 'Merged', color: '#E08030' },
  ];
  const [presenceArcIdx, _setPresenceArcIdx] = useState(() =>
    loadNum('colourmap:presence-arc-idx', 3),
  );
  useEffect(() => {
    localStorage.setItem('colourmap:presence-arc-idx', String(presenceArcIdx));
  }, [presenceArcIdx]);

  // Bottom sliders — clarity & readiness check-ins
  const [clarityMissionsIdx, setClarityMissionsIdx] = useState(() => {
    const v = loadNum('colourmap:clarity-missions-idx', 2);
    return Math.max(0, Math.min(CLARITY_MISSIONS.length - 1, v));
  });
  const [readinessIdx, _setReadinessIdx] = useState(() => {
    const v = loadNum('colourmap:readiness-idx', 2);
    return Math.max(0, Math.min(READINESS.length - 1, v));
  });
  useEffect(() => {
    localStorage.setItem('colourmap:clarity-missions-idx', String(clarityMissionsIdx));
  }, [clarityMissionsIdx]);
  useEffect(() => {
    localStorage.setItem('colourmap:readiness-idx', String(readinessIdx));
  }, [readinessIdx]);

  // Logbook entries shown/hidden behind a transparent pill toggle
  const [showLogbookEntries, setShowLogbookEntries] = useState(() => {
    try {
      return localStorage.getItem('colourmap:logbook-entries-open') !== 'false';
    } catch {
      return true;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem('colourmap:logbook-entries-open', String(showLogbookEntries));
    } catch {
      /* silent */
    }
  }, [showLogbookEntries]);

  // Logbook display mode: 'grouped' (challenge stack + flow stack) or 'mixed' (chronological)
  const [logbookMode, setLogbookMode] = useState<'grouped' | 'mixed'>(() => {
    try {
      const v = localStorage.getItem('colourmap:logbook-mode');
      return v === 'mixed' ? 'mixed' : 'grouped';
    } catch {
      return 'grouped';
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem('colourmap:logbook-mode', logbookMode);
    } catch {
      /* silent */
    }
  }, [logbookMode]);

  // Two separate inputs for the logbook — challenge + flow
  const [challengeInput, setChallengeInput] = useState('');
  const [flowInput, setFlowInput] = useState('');
  const saveChallenge = () => {
    const text = challengeInput.trim();
    if (!text) return;
    setSessionEmotions([
      ...sessionEmotions,
      {
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text,
        mind: 'challenge',
        mindColor: '#A05A40',
        ...(challengeTag && { tag: challengeTag.name, tagColor: challengeTag.color }),
      },
    ]);
    setChallengeInput('');
    setChallengeTag(null);
  };
  const saveFlow = () => {
    const text = flowInput.trim();
    if (!text) return;
    setSessionEmotions([
      ...sessionEmotions,
      {
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text,
        mind: 'flow',
        mindColor: '#C4A060',
        ...(flowTag && { tag: flowTag.name, tagColor: flowTag.color }),
      },
    ]);
    setFlowInput('');
    setFlowTag(null);
  };

  // Today's objectives — multiple things planned for today
  type TodoItem = { id: string; text: string; done: boolean; notes?: string };
  const [expandedTodayId, setExpandedTodayId] = useState<string | null>(null);
  const updateTodayNotes = (id: string, notes: string) => {
    const next = todayObjectives.map((t) => (t.id === id ? { ...t, notes } : t));
    setTodayObjectives(next);
    try {
      localStorage.setItem('colourmap:today-objectives', JSON.stringify(next));
    } catch {
      /* silent */
    }
  };
  const [todayObjectives, setTodayObjectives] = useState<TodoItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('colourmap:today-objectives') || '[]');
    } catch {
      return [];
    }
  });
  const [todayInput, setTodayInput] = useState('');
  const persistTodayObjectives = (next: TodoItem[]) => {
    setTodayObjectives(next);
    try {
      localStorage.setItem('colourmap:today-objectives', JSON.stringify(next));
    } catch {
      /* silent */
    }
  };
  const addTodayObjective = () => {
    const text = todayInput.trim();
    if (!text) return;
    persistTodayObjectives([...todayObjectives, { id: crypto.randomUUID(), text, done: false }]);
    setTodayInput('');
  };
  const toggleTodayObjective = (id: string) => {
    persistTodayObjectives(todayObjectives.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };
  const removeTodayObjective = (id: string) => {
    persistTodayObjectives(todayObjectives.filter((t) => t.id !== id));
  };
  const reorderTodayObjectives = (fromIdx: number, toIdx: number) => {
    if (fromIdx === toIdx || fromIdx < 0 || toIdx < 0) return;
    const next = [...todayObjectives];
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);
    persistTodayObjectives(next);
  };
  const [draggedTodayIdx, setDraggedTodayIdx] = useState<number | null>(null);
  const [dragOverTodayIdx, setDragOverTodayIdx] = useState<number | null>(null);

  // Quick to-do list inside the check-in
  const [todos, setTodos] = useState<TodoItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('colourmap:checkin-todos') || '[]');
    } catch {
      return [];
    }
  });
  const [todoInput, setTodoInput] = useState('');
  const persistTodos = (next: TodoItem[]) => {
    setTodos(next);
    try {
      localStorage.setItem('colourmap:checkin-todos', JSON.stringify(next));
    } catch {
      /* silent */
    }
  };
  const addTodo = () => {
    const text = todoInput.trim();
    if (!text) return;
    persistTodos([...todos, { id: crypto.randomUUID(), text, done: false }]);
    setTodoInput('');
  };
  const toggleTodo = (id: string) => {
    persistTodos(todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };
  const removeTodo = (id: string) => {
    persistTodos(todos.filter((t) => t.id !== id));
  };
  const reorderTodos = (fromIdx: number, toIdx: number) => {
    if (fromIdx === toIdx || fromIdx < 0 || toIdx < 0) return;
    const next = [...todos];
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);
    persistTodos(next);
  };
  const [draggedTodoIdx, setDraggedTodoIdx] = useState<number | null>(null);
  const [dragOverTodoIdx, setDragOverTodoIdx] = useState<number | null>(null);
  const [clarityOpen, setClarityOpen] = useState(false);
  type HawkinsStyle = 'squares' | 'dots' | 'losanges';
  const [hawkinsStyle, setHawkinsStyle] = useState<HawkinsStyle>(() => {
    try {
      const v = localStorage.getItem('colourmap:hawkins-style');
      if (v === 'dots' || v === 'losanges') return v;
      return 'squares';
    } catch {
      return 'squares';
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem('colourmap:hawkins-style', hawkinsStyle);
    } catch {
      /* silent */
    }
  }, [hawkinsStyle]);
  const [presenceLog, setPresenceLog] = useState<PresenceEntry[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('colourmap:presence-log') || '[]');
    } catch {
      return [];
    }
  });
  const _addPresenceEntry = () => {
    const text = presenceInput.trim();
    if (!text) return;
    const tagged = entryHawkinsIdx !== null ? HAWKINS[entryHawkinsIdx] : null;
    const entry: PresenceEntry = {
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text,
      ...(tagged && {
        hawkinsIdx: entryHawkinsIdx ?? undefined,
        hawkinsName: tagged.level,
        hawkinsColor: tagged.color,
        hawkinsLevel: tagged.hawkins,
      }),
    };
    const next = [entry, ...presenceLog].slice(0, 100);
    setPresenceLog(next);
    try {
      localStorage.setItem('colourmap:presence-log', JSON.stringify(next));
    } catch {
      /* silent */
    }
    setPresenceInput('');
    setEntryHawkinsIdx(null);
    setShowHawkinsPicker(false);
  };
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
  const _toggleEmotionsSection = () => toggleSection('emotions', setEmotionsSectionOpen);
  const _toggleObservationsSection = () =>
    toggleSection('observations', setObservationsSectionOpen);
  const _toggleNextSection = () => {
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
  const _addObservation = () => {
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
  const [_showDone2, _setShowDone2] = useState(false);
  const [_expandedDoneId, _setExpandedDoneId] = useState<string | null>(null);

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
  const _completeNextObjective = (i: number) => {
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

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('colourmap:presence-idx', String(mindIdx));
  }, [mindIdx]);
  useEffect(() => {
    localStorage.setItem('colourmap:process-idx', String(hawkinsIdx));
  }, [hawkinsIdx]);
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

  const _addNextObjective = () => {
    if (!nextInput.trim()) return;
    setNextObjectives([...nextObjectives, nextInput.trim()]);
    setNextInput('');
  };

  const _promoteNext = (idx: number) => {
    const promoted = nextObjectives[idx];
    setNextObjectives(nextObjectives.filter((_, i) => i !== idx));
    setObjective(promoted);
  };

  const _removeNext = (idx: number) => {
    setNextObjectives(nextObjectives.filter((_, i) => i !== idx));
  };

  const _addEmotion = () => {
    if (!emotionInput.trim()) return;
    // If a process level was picked for this entry, use ITS color/name as the tag
    const tagged = entryHawkinsIdx !== null ? HAWKINS[entryHawkinsIdx] : null;
    const entry = {
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: emotionInput.trim(),
      mind: tagged ? tagged.level : currentMind.level,
      mindColor: tagged ? tagged.color : currentMind.color,
    };
    const next = [...sessionEmotions, entry];
    setSessionEmotions(next);
    setEmotionInput('');
    setEntryHawkinsIdx(null);
    setShowHawkinsPicker(false);
  };

  const [_mindDragging, setMindDragging] = useState(false);
  const [_modeDragging, setModeDragging] = useState(false);

  // Swipe tracking
  const mindDragRef = useRef<{ startX: number; startIdx: number } | null>(null);
  const modeDragRef = useRef<{ startX: number; startIdx: number } | null>(null);
  const hawkinsDragRef = useRef<{ startX: number; startIdx: number } | null>(null);
  const [_hawkinsDragging, setHawkinsDragging] = useState(false);

  const currentMind = MIND[mindIdx];
  const currentMode = MODE[modeIdx];

  const _startMindDrag = (clientX: number) => {
    mindDragRef.current = { startX: clientX, startIdx: mindIdx };
    setMindDragging(true);
  };

  const _startModeDrag = (clientX: number) => {
    modeDragRef.current = { startX: clientX, startIdx: modeIdx };
    setModeDragging(true);
  };

  const _startHawkinsDrag = (clientX: number) => {
    hawkinsDragRef.current = { startX: clientX, startIdx: hawkinsIdx };
    setHawkinsDragging(true);
  };

  const mindIdxRef = useRef(mindIdx);
  mindIdxRef.current = mindIdx;
  const modeIdxRef = useRef(modeIdx);
  modeIdxRef.current = modeIdx;
  const hawkinsIdxRef = useRef(hawkinsIdx);
  hawkinsIdxRef.current = hawkinsIdx;

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
      if (hawkinsDragRef.current) {
        const dx = e.clientX - hawkinsDragRef.current.startX;
        const steps = Math.round(dx / 20);
        const next = Math.max(
          0,
          Math.min(HAWKINS.length - 1, hawkinsDragRef.current.startIdx + steps),
        );
        if (next !== hawkinsIdxRef.current) setHawkinsIdx(next);
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
      if (hawkinsDragRef.current) {
        hawkinsDragRef.current = null;
        setHawkinsDragging(false);
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
      className="relative space-y-5 rounded-3xl border border-[#7a543833] px-5 py-6"
      style={{
        background: 'linear-gradient(180deg, rgba(251,244,232,0.95), rgba(246,236,221,0.92))',
        boxShadow: '0 24px 50px -34px rgba(92,48,24,0.35)',
      }}
    >
      {/* Discrete design toggle — tiny losange at top-right, opens variant picker */}
      <div className="absolute right-4 top-4" style={{ zIndex: 10 }}>
        <button
          type="button"
          onClick={() => setDesignsOpen((o) => !o)}
          aria-label="Choose design"
          className="flex cursor-pointer items-center justify-center rounded-full transition-all"
          style={{
            width: 18,
            height: 18,
            background: 'transparent',
            border: 'none',
            opacity: 1,
          }}
        >
          <span
            style={{
              width: 12,
              height: 12,
              background: '#D8BE94',
              opacity: 1,
              borderRadius: '50%',
              display: 'block',
            }}
          />
        </button>
        {designsOpen && (
          <div
            className="absolute right-0 mt-1 animate-in fade-in duration-150 overflow-hidden rounded-xl"
            style={{
              background: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border) / 0.3)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
              minWidth: 140,
            }}
          >
            {VARIANTS.map((v) => {
              const active = variantIdx === v.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => {
                    setVariantIdx(v.id);
                    setDesignsOpen(false);
                  }}
                  className="flex w-full cursor-pointer items-center gap-2.5 px-3 py-2 text-left transition-all hover:bg-muted/30"
                  style={{
                    border: 'none',
                    background: active ? '#C4A06012' : 'transparent',
                  }}
                >
                  <span
                    className="rotate-45"
                    style={{
                      width: 7,
                      height: 7,
                      background: '#C4A060',
                      opacity: active ? 1 : 0.35,
                      borderRadius: 1,
                      display: 'block',
                    }}
                  />
                  <span
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '14px',
                      fontWeight: active ? 700 : 400,
                      color: active ? '#5C3018' : '#8A6A4A',
                    }}
                  >
                    {v.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Emotional register — 6 variants (pick the visual that fits the moment) */}
      <div className="flex flex-col items-center gap-2">
        {/* Variant 1: Arc — cosine bow */}
        {variantIdx === 1 && (
          <div className="relative" style={{ width: 300, height: 95 }}>
            {(() => {
              const W = 300;
              const dotSize = 32;
              const n = BALANCE.length;
              const cy = 75;
              const ry = 55;
              return BALANCE.map((b, i) => {
                const x = ((W - dotSize) * i) / (n - 1);
                const angle = (i / (n - 1) - 0.5) * Math.PI;
                const y = cy - ry * Math.cos(angle) - dotSize / 2;
                const selected = balanceIdx === i;
                return (
                  <button
                    key={b.label}
                    type="button"
                    onClick={() => setBalanceIdx(i)}
                    className="absolute flex cursor-pointer items-center justify-center rounded-full transition-all hover:scale-110"
                    style={{
                      left: x,
                      top: y,
                      width: dotSize,
                      height: dotSize,
                      background: b.color,
                      opacity: selected ? 1 : 0.55,
                      border: 'none',
                      boxShadow: selected ? `0 4px 14px -4px ${b.color}` : 'none',
                      transform: selected ? 'scale(1.08)' : 'scale(1)',
                    }}
                    title={b.label}
                  />
                );
              });
            })()}
            <svg
              width="300"
              height="95"
              viewBox="0 0 300 95"
              style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
            >
              <path
                d="M 16 75 A 134 55 0 0 1 284 75"
                fill="none"
                stroke="#C4A06030"
                strokeWidth="1"
                strokeDasharray="2 4"
              />
            </svg>
          </div>
        )}

        {/* Variant 2: Circle — single draggable color disc */}
        {variantIdx === 2 && (
          <div
            className="relative flex items-center justify-center select-none"
            style={{ width: 300, height: 95 }}
          >
            <div
              className="cursor-grab rounded-full transition-colors duration-500 active:cursor-grabbing"
              style={{
                width: 90,
                height: 90,
                // Pastel: blend the raw BALANCE colour with the cream paper base
                // via a semi-transparent overlay. The 60% alpha lets the warm
                // parchment tone show through, softening every variant.
                background: `linear-gradient(rgba(245,236,220,0.45), rgba(245,236,220,0.45)), ${BALANCE[balanceIdx].color}`,
                touchAction: 'none',
              }}
              onClick={(e) => {
                const rect = (e.target as HTMLElement).getBoundingClientRect();
                const cx = rect.left + rect.width / 2;
                if (e.clientX < cx && balanceIdx > 0) setBalanceIdx(balanceIdx - 1);
                else if (e.clientX > cx && balanceIdx < BALANCE.length - 1)
                  setBalanceIdx(balanceIdx + 1);
              }}
              onMouseDown={(e) => {
                const startX = e.clientX;
                const startIdx = balanceIdx;
                const onMove = (ev: MouseEvent) => {
                  const dx = ev.clientX - startX;
                  const steps = Math.round(dx / 30);
                  const next = Math.max(0, Math.min(BALANCE.length - 1, startIdx + steps));
                  if (next !== balanceIdx) setBalanceIdx(next);
                };
                const onUp = () => {
                  window.removeEventListener('mousemove', onMove);
                  window.removeEventListener('mouseup', onUp);
                };
                window.addEventListener('mousemove', onMove);
                window.addEventListener('mouseup', onUp);
              }}
              onTouchStart={(e) => {
                const startX = e.touches[0].clientX;
                const startIdx = balanceIdx;
                const onMove = (ev: TouchEvent) => {
                  ev.preventDefault();
                  const dx = ev.touches[0].clientX - startX;
                  const steps = Math.round(dx / 30);
                  const next = Math.max(0, Math.min(BALANCE.length - 1, startIdx + steps));
                  if (next !== balanceIdx) setBalanceIdx(next);
                };
                const onEnd = () => {
                  window.removeEventListener('touchmove', onMove);
                  window.removeEventListener('touchend', onEnd);
                };
                window.addEventListener('touchmove', onMove, { passive: false });
                window.addEventListener('touchend', onEnd);
              }}
            />
          </div>
        )}

        {/* Variant 3: Rings — concentric Hawkins-style rings */}
        {variantIdx === 3 && (
          <div className="relative" style={{ width: 300, height: 95 }}>
            <svg width="300" height="95" viewBox="0 0 300 95">
              {(() => {
                const cx = 150;
                const cy = 95;
                const radii = [14, 24, 34, 44, 54, 64, 74];
                return BALANCE.map((b, i) => {
                  const selected = balanceIdx === i;
                  return (
                    <g key={b.label}>
                      {/* Hitbox — wider transparent stroke */}
                      <circle
                        cx={cx}
                        cy={cy}
                        r={radii[i]}
                        fill="none"
                        stroke="transparent"
                        strokeWidth={10}
                        style={{ cursor: 'pointer' }}
                        onClick={() => setBalanceIdx(i)}
                      />
                      {/* Visual stroke */}
                      <circle
                        cx={cx}
                        cy={cy}
                        r={radii[i]}
                        fill="none"
                        stroke={b.color}
                        strokeWidth={selected ? 6 : 3}
                        opacity={selected ? 1 : 0.3}
                        style={{ pointerEvents: 'none', transition: 'all 200ms' }}
                      />
                    </g>
                  );
                });
              })()}
              {/* Center dot — current colour */}
              <circle
                cx={150}
                cy={95}
                r={6}
                fill={BALANCE[balanceIdx].color}
                style={{ pointerEvents: 'none' }}
              />
            </svg>
          </div>
        )}

        {/* Variant 4: Mountain — stacked-bar terrain */}
        {variantIdx === 4 && (
          <div className="relative" style={{ width: 300, height: 95 }}>
            {(() => {
              const barW = 30;
              const gap = 6;
              const n = BALANCE.length;
              const totalW = barW * n + gap * (n - 1);
              const offsetX = (300 - totalW) / 2;
              const heights = [28, 46, 64, 82, 64, 46, 28]; // bell curve
              const baseY = 90;
              return BALANCE.map((b, i) => {
                const h = heights[i];
                const x = offsetX + i * (barW + gap);
                const y = baseY - h;
                const selected = balanceIdx === i;
                return (
                  <button
                    key={b.label}
                    type="button"
                    onClick={() => setBalanceIdx(i)}
                    className="absolute cursor-pointer rounded-t-md transition-all"
                    style={{
                      left: x,
                      top: y,
                      width: barW,
                      height: h,
                      background: b.color,
                      opacity: selected ? 1 : 0.4,
                      border: 'none',
                      boxShadow: selected ? `0 4px 14px -4px ${b.color}` : 'none',
                    }}
                    title={b.label}
                  />
                );
              });
            })()}
          </div>
        )}

        {/* Variant 5: Slider — long row of small drawer blocks (Hawkins-boxes vocabulary) */}
        {variantIdx === 5 && (
          <div
            className="relative flex items-center justify-center select-none"
            style={{ width: 300, height: 95 }}
          >
            {(() => {
              // 21 small blocks across the full width — 3 per BALANCE level.
              // Each block takes its color from the level it belongs to, giving
              // a long row that reads as a continuous drawer strip.
              const blocksPerLevel = 3;
              const totalBlocks = BALANCE.length * blocksPerLevel;
              const blockW = 9;
              const gap = 5; // doubled negative space between blocks
              const totalW = totalBlocks * blockW + (totalBlocks - 1) * gap;
              const offsetX = (300 - totalW) / 2;
              const blockH = 44;
              const baseY = (95 - blockH) / 2;
              return Array.from({ length: totalBlocks }, (_, i) => {
                const level = Math.floor(i / blocksPerLevel);
                const b = BALANCE[level];
                const selected = balanceIdx === level;
                const x = offsetX + i * (blockW + gap);
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setBalanceIdx(level)}
                    className="absolute cursor-pointer rounded-sm transition-all"
                    style={{
                      left: x,
                      top: selected ? baseY - 6 : baseY,
                      width: blockW,
                      height: selected ? blockH + 12 : blockH,
                      background: b.color,
                      opacity: selected ? 1 : 0.35,
                      border: 'none',
                      boxShadow: selected ? `0 4px 14px -4px ${b.color}` : 'none',
                    }}
                    title={b.label}
                  />
                );
              });
            })()}
          </div>
        )}

        {/* Variant 6: Boxes — central circle with drawer bars on both sides */}
        {variantIdx === 6 && (
          <div
            className="relative flex items-center justify-center"
            style={{ width: 340, height: 120 }}
          >
            {(() => {
              const stuck = HAWKINS.slice(0, 5); // Shame → Anger (contracted side)
              const free = HAWKINS.slice(5); // Courage → Peace (expanded side)
              const W = 340;
              const H = 120;
              const barW = 22; // was 14 — ~60% wider
              const barH = 84; // was 60 — 40% taller
              const gap = 2; // negative space between drawers
              const groupW = barW * 5 + gap * 4;
              const circleD = 80; // was 70
              const sideGap = 14;
              const totalW = groupW * 2 + circleD + sideGap * 2;
              const startX = (W - totalW) / 2;

              const renderBar = (label: string, color: string, globalIdx: number, x: number) => {
                const selected = hawkinsIdx === globalIdx;
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setHawkinsIdx(globalIdx)}
                    className="absolute cursor-pointer rounded-sm transition-all"
                    style={{
                      left: x,
                      top: (H - barH) / 2,
                      width: barW,
                      height: barH,
                      background: color,
                      opacity: selected ? 1 : 0.35,
                      border: 'none',
                      boxShadow: selected ? `0 4px 14px -4px ${color}` : 'none',
                    }}
                    title={label}
                  />
                );
              };

              return (
                <>
                  {/* Left drawers — stuck states (Frozen → Overwhelmed) */}
                  {stuck.map((h, i) => {
                    const x = startX + i * (barW + gap);
                    return renderBar(h.level, h.color, i, x);
                  })}
                  {/* Central circle — pastel (blend raw HAWKINS colour with cream), no glow */}
                  <div
                    className="absolute rounded-full transition-colors duration-300"
                    style={{
                      left: startX + groupW + sideGap,
                      top: (H - circleD) / 2,
                      width: circleD,
                      height: circleD,
                      background: `linear-gradient(rgba(245,236,220,0.45), rgba(245,236,220,0.45)), ${HAWKINS[hawkinsIdx].color}`,
                    }}
                  />
                  {/* Right drawers — freedom states (Searching → Liberation) */}
                  {free.map((h, i) => {
                    const globalIdx = 5 + i;
                    const x = startX + groupW + sideGap + circleD + sideGap + i * (barW + gap);
                    return renderBar(h.level, h.color, globalIdx, x);
                  })}
                </>
              );
            })()}
          </div>
        )}

        <p
          className="text-center text-lg font-bold transition-all duration-300"
          style={{
            color: variantIdx === 6 ? HAWKINS[hawkinsIdx].color : BALANCE[balanceIdx].color,
            fontFamily: 'var(--font-serif)',
          }}
        >
          {variantIdx === 6 ? HAWKINS[hawkinsIdx].level : BALANCE[balanceIdx].label}
        </p>
      </div>

      {/* ── CURRENT OBJECTIVE ── all in one pillbox */}
      <div
        className="space-y-2 rounded-2xl border px-4 py-3"
        style={{
          borderColor: '#C4A06030',
          background: 'rgba(245,236,220,0.45)',
        }}
      >
        <div className="flex flex-col items-center gap-2">
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
          <div className="relative w-full">
            <input
              type="text"
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              placeholder="set an objective..."
              className="w-full border-b bg-transparent pb-1 text-center outline-none placeholder:text-muted-foreground/40"
              style={{
                color: '#5C3018',
                borderColor: '#C4A06020',
                fontFamily: 'var(--font-handwritten)',
                fontSize: '24px',
                fontWeight: 700,
                letterSpacing: '0.06em',
                paddingLeft: '64px',
                paddingRight: '64px',
              }}
            />
            <div className="absolute right-0 top-1/2 flex -translate-y-1/2 items-center gap-1.5">
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
            </div>
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

        {/* Done archive moved to Other Missions Done tab */}
      </div>

      {/* ── OTHER MISSIONS ── collapsible pillbox: Daily Objectives + To-do */}
      <div
        className="space-y-3 rounded-2xl border px-4 py-3"
        style={{
          borderColor: '#C4A06030',
          background: 'rgba(245,236,220,0.45)',
        }}
      >
        <div className="flex justify-center">
          <button
            type="button"
            onClick={toggleOtherMissions}
            className="flex cursor-pointer items-center gap-2 rounded-full px-5 py-1.5 transition-all"
            style={{
              background: '#C4A06015',
              border: '1px solid #C4A06040',
            }}
          >
            <span
              className="text-center uppercase"
              style={{
                color: '#C4A060',
                fontSize: '15px',
                fontWeight: 700,
                letterSpacing: '0.22em',
              }}
            >
              Other Missions
            </span>
            <span
              className="text-sm transition-transform duration-200"
              style={{
                color: '#C4A06080',
                transform: otherMissionsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            >
              ▾
            </span>
          </button>
        </div>

        {otherMissionsOpen && (
          <>
            {/* Daily Objectives */}
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => setDailyObjOpen((s) => !s)}
                className="flex cursor-pointer items-center gap-1.5 px-1"
                style={{ background: 'none', border: 'none' }}
              >
                <span
                  className="font-semibold uppercase tracking-[0.18em]"
                  style={{ color: '#C4A060', fontSize: '13px' }}
                >
                  Daily Objectives
                </span>
                <span
                  className="text-[10px] transition-transform duration-200"
                  style={{
                    color: '#C4A06080',
                    transform: dailyObjOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                >
                  ▾
                </span>
              </button>
              {dailyObjOpen && (
                <>
                  {todayObjectives
                    .filter((o) => !o.done)
                    .map((o, idx) => {
                      const isExpanded = expandedTodayId === o.id;
                      const isDragging = draggedTodayIdx === idx;
                      const isDropTarget = dragOverTodayIdx === idx && draggedTodayIdx !== idx;
                      return (
                        <div
                          key={o.id}
                          className="space-y-1"
                          draggable
                          onDragStart={() => setDraggedTodayIdx(idx)}
                          onDragOver={(e) => {
                            e.preventDefault();
                            if (draggedTodayIdx !== null && draggedTodayIdx !== idx) {
                              setDragOverTodayIdx(idx);
                            }
                          }}
                          onDragLeave={(e) => {
                            // Only clear if leaving to something outside this row
                            if (
                              !(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)
                            ) {
                              setDragOverTodayIdx((prev) => (prev === idx ? null : prev));
                            }
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            if (draggedTodayIdx !== null) {
                              reorderTodayObjectives(draggedTodayIdx, idx);
                            }
                            setDraggedTodayIdx(null);
                            setDragOverTodayIdx(null);
                          }}
                          onDragEnd={() => {
                            setDraggedTodayIdx(null);
                            setDragOverTodayIdx(null);
                          }}
                          style={{
                            opacity: isDragging ? 0.4 : 1,
                            borderTop: isDropTarget ? '2px solid #C4A060' : '2px solid transparent',
                            cursor: 'grab',
                            transition: 'opacity 120ms, border-color 120ms',
                          }}
                        >
                          <div className="group flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => toggleTodayObjective(o.id)}
                              title={o.done ? 'Mark as not done' : 'Mark as done'}
                              className="flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded border transition-all hover:scale-110"
                              style={{
                                borderColor: o.done ? '#7AAA5860' : '#C4A06060',
                                background: o.done ? '#7AAA5810' : 'transparent',
                              }}
                            >
                              {o.done && (
                                <span className="text-xs" style={{ color: '#7AAA58' }}>
                                  ✓
                                </span>
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => setExpandedTodayId(isExpanded ? null : o.id)}
                              className="flex-1 cursor-pointer bg-transparent text-left"
                              style={{
                                color: o.done ? '#C4A060' : '#7a5438',
                                fontFamily: 'var(--font-handwritten)',
                                fontSize: '20px',
                                opacity: o.done ? 0.85 : 0.95,
                                border: 'none',
                              }}
                              title="Click to open notes"
                            >
                              {o.text}
                              {o.notes && o.notes.trim().length > 0 && !isExpanded && (
                                <span
                                  className="ml-2 text-xs no-underline"
                                  style={{ color: '#C4A06080' }}
                                >
                                  ·
                                </span>
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => removeTodayObjective(o.id)}
                              title="Remove"
                              className="cursor-pointer text-sm opacity-0 transition-opacity group-hover:opacity-40"
                              style={{ color: '#7a5438', background: 'none', border: 'none' }}
                            >
                              ✕
                            </button>
                          </div>
                          {isExpanded && (
                            <textarea
                              value={o.notes || ''}
                              onChange={(e) => updateTodayNotes(o.id, e.target.value)}
                              placeholder="advancements, next steps..."
                              rows={2}
                              className="ml-7 w-[calc(100%-1.75rem)] resize-none border-b bg-transparent pb-1 pt-0.5 outline-none placeholder:text-muted-foreground/40 animate-in fade-in duration-150"
                              style={{
                                color: '#7a5438',
                                borderColor: '#C4A06025',
                                fontFamily: 'var(--font-handwritten)',
                                fontSize: '17px',
                                lineHeight: 1.4,
                              }}
                            />
                          )}
                        </div>
                      );
                    })}
                  <input
                    type="text"
                    value={todayInput}
                    onChange={(e) => setTodayInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') addTodayObjective();
                    }}
                    placeholder="+ add objective for today..."
                    className="w-full border-b bg-transparent pb-1 outline-none placeholder:text-muted-foreground/40"
                    style={{
                      color: '#7a5438',
                      borderColor: '#C4A06020',
                      fontFamily: 'var(--font-handwritten)',
                      fontSize: '20px',
                    }}
                  />
                </>
              )}
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="h-px flex-1" style={{ background: '#C4A06020' }} />
              <span
                className="block h-3 w-3 rotate-45 rounded-[2px]"
                style={{ background: '#C4A060', opacity: 0.85 }}
              />
              <div className="h-px flex-1" style={{ background: '#C4A06020' }} />
            </div>

            {/* Push for tomorrow */}
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => setPushTomorrowOpen((s) => !s)}
                className="flex cursor-pointer items-center gap-1.5 px-1"
                style={{ background: 'none', border: 'none' }}
              >
                <span
                  className="font-semibold uppercase tracking-[0.18em]"
                  style={{ color: '#C4A060', fontSize: '13px' }}
                >
                  Push for tomorrow
                </span>
                <span
                  className="text-[10px] transition-transform duration-200"
                  style={{
                    color: '#C4A06080',
                    transform: pushTomorrowOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                >
                  ▾
                </span>
              </button>
              {pushTomorrowOpen && (
                <>
                  {todos
                    .filter((t) => !t.done)
                    .map((t, idx) => {
                      const isDragging = draggedTodoIdx === idx;
                      const isDropTarget = dragOverTodoIdx === idx && draggedTodoIdx !== idx;
                      return (
                        <div
                          key={t.id}
                          className="group flex items-center gap-2"
                          draggable
                          onDragStart={() => setDraggedTodoIdx(idx)}
                          onDragOver={(e) => {
                            e.preventDefault();
                            if (draggedTodoIdx !== null && draggedTodoIdx !== idx) {
                              setDragOverTodoIdx(idx);
                            }
                          }}
                          onDragLeave={(e) => {
                            if (
                              !(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)
                            ) {
                              setDragOverTodoIdx((prev) => (prev === idx ? null : prev));
                            }
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            if (draggedTodoIdx !== null) {
                              reorderTodos(draggedTodoIdx, idx);
                            }
                            setDraggedTodoIdx(null);
                            setDragOverTodoIdx(null);
                          }}
                          onDragEnd={() => {
                            setDraggedTodoIdx(null);
                            setDragOverTodoIdx(null);
                          }}
                          style={{
                            opacity: isDragging ? 0.4 : 1,
                            borderTop: isDropTarget ? '2px solid #C4A060' : '2px solid transparent',
                            cursor: 'grab',
                            transition: 'opacity 120ms, border-color 120ms',
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => toggleTodo(t.id)}
                            title={t.done ? 'Mark as not done' : 'Mark as done'}
                            className="flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded border transition-all hover:scale-110"
                            style={{
                              borderColor: t.done ? '#7AAA5860' : '#C4A06060',
                              background: t.done ? '#7AAA5810' : 'transparent',
                            }}
                          >
                            {t.done && (
                              <span className="text-xs" style={{ color: '#7AAA58' }}>
                                ✓
                              </span>
                            )}
                          </button>
                          <span
                            className="flex-1"
                            style={{
                              color: t.done ? '#C4A060' : '#7a5438',
                              fontFamily: 'var(--font-handwritten)',
                              fontSize: '20px',
                              opacity: t.done ? 0.85 : 0.95,
                            }}
                          >
                            {t.text}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeTodo(t.id)}
                            title="Remove"
                            className="cursor-pointer text-sm opacity-0 transition-opacity group-hover:opacity-40"
                            style={{ color: '#7a5438', background: 'none', border: 'none' }}
                          >
                            ✕
                          </button>
                        </div>
                      );
                    })}
                  <input
                    type="text"
                    value={todoInput}
                    onChange={(e) => setTodoInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') addTodo();
                    }}
                    placeholder="+ add to-do..."
                    className="w-full border-b bg-transparent pb-1 outline-none placeholder:text-muted-foreground/40"
                    style={{
                      color: '#7a5438',
                      borderColor: '#C4A06020',
                      fontFamily: 'var(--font-handwritten)',
                      fontSize: '20px',
                    }}
                  />
                </>
              )}
            </div>

            {/* Done — all completed items grouped by category */}
            {(doneObjectives.length > 0 ||
              todayObjectives.some((o) => o.done) ||
              todos.some((t) => t.done)) && (
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => setDoneOpen((s) => !s)}
                  className="flex cursor-pointer items-center gap-1.5 px-1"
                  style={{ background: 'none', border: 'none' }}
                >
                  <span
                    className="font-semibold uppercase tracking-[0.18em]"
                    style={{ color: '#7AAA58', fontSize: '13px' }}
                  >
                    Done
                  </span>
                  <span
                    className="text-[10px] transition-transform duration-200"
                    style={{
                      color: '#7AAA5880',
                      transform: doneOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                  >
                    ▾
                  </span>
                </button>
                {doneOpen && (
                  <div className="space-y-3 animate-in fade-in duration-150">
                    {/* Current Objective completions */}
                    {doneObjectives.length > 0 && (
                      <div className="space-y-1">
                        <p
                          className="px-1 text-[11px] font-semibold uppercase tracking-wider"
                          style={{ color: '#8A6A4A', opacity: 0.6 }}
                        >
                          Current Objective
                        </p>
                        {doneObjectives.slice(0, 10).map((d) => {
                          const dt = new Date(d.completedAt);
                          const dateStr = `${dt.getDate()}/${dt.getMonth() + 1}`;
                          return (
                            <div
                              key={d.id}
                              className="flex items-center gap-2 px-1"
                              style={{ minHeight: 28 }}
                            >
                              <span
                                style={{
                                  color: '#8A6A4A',
                                  opacity: 0.6,
                                  fontSize: '12px',
                                  lineHeight: '28px',
                                  flexShrink: 0,
                                }}
                              >
                                {dateStr}
                              </span>
                              <span
                                className="flex h-4 w-4 shrink-0 items-center justify-center rounded border"
                                style={{ borderColor: '#7AAA5860', background: '#7AAA5810' }}
                              >
                                <span className="text-[10px]" style={{ color: '#7AAA58' }}>
                                  ✓
                                </span>
                              </span>
                              <span
                                style={{
                                  color: '#8A6A4A',
                                  fontFamily: 'var(--font-handwritten)',
                                  fontSize: '16px',
                                  opacity: 0.6,
                                }}
                              >
                                {d.text}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {/* Daily Objectives completions */}
                    {todayObjectives.some((o) => o.done) && (
                      <div className="space-y-1">
                        <p
                          className="px-1 text-[11px] font-semibold uppercase tracking-wider"
                          style={{ color: '#8A6A4A', opacity: 0.6 }}
                        >
                          Daily Objectives
                        </p>
                        {todayObjectives
                          .filter((o) => o.done)
                          .map((o) => (
                            <div
                              key={o.id}
                              className="flex items-center gap-2 px-1"
                              style={{ minHeight: 28 }}
                            >
                              <button
                                type="button"
                                onClick={() => toggleTodayObjective(o.id)}
                                className="flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded border"
                                style={{ borderColor: '#7AAA5860', background: '#7AAA5810' }}
                              >
                                <span className="text-xs" style={{ color: '#7AAA58' }}>
                                  ✓
                                </span>
                              </button>
                              <span
                                style={{
                                  color: '#8A6A4A',
                                  fontFamily: 'var(--font-handwritten)',
                                  fontSize: '16px',
                                  opacity: 0.6,
                                }}
                              >
                                {o.text}
                              </span>
                            </div>
                          ))}
                      </div>
                    )}
                    {/* Push for tomorrow completions */}
                    {todos.some((t) => t.done) && (
                      <div className="space-y-1">
                        <p
                          className="px-1 text-[11px] font-semibold uppercase tracking-wider"
                          style={{ color: '#8A6A4A', opacity: 0.6 }}
                        >
                          Push for tomorrow
                        </p>
                        {todos
                          .filter((t) => t.done)
                          .map((t) => (
                            <div
                              key={t.id}
                              className="flex items-center gap-2 px-1"
                              style={{ minHeight: 28 }}
                            >
                              <button
                                type="button"
                                onClick={() => toggleTodo(t.id)}
                                className="flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded border"
                                style={{ borderColor: '#7AAA5860', background: '#7AAA5810' }}
                              >
                                <span className="text-xs" style={{ color: '#7AAA58' }}>
                                  ✓
                                </span>
                              </button>
                              <span
                                style={{
                                  color: '#8A6A4A',
                                  fontFamily: 'var(--font-handwritten)',
                                  fontSize: '16px',
                                  opacity: 0.6,
                                }}
                              >
                                {t.text}
                              </span>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Are you clear on next missions? — collapsed behind a star.
                Click the star (or the whole row) to open the clarity slider. */}
            <div className="space-y-1.5 pt-2">
              <button
                type="button"
                onClick={() => setClarityOpen((o) => !o)}
                className="flex w-full cursor-pointer items-center justify-center gap-2 bg-transparent italic"
                style={{
                  color: '#8A6A4A',
                  fontFamily: 'var(--font-serif)',
                  fontSize: '15px',
                  opacity: 0.95,
                  border: 'none',
                  padding: '4px 0',
                }}
                title={clarityOpen ? 'Hide clarity slider' : 'Open clarity slider'}
              >
                <svg
                  width={14}
                  height={14}
                  viewBox="0 0 20 20"
                  style={{ transition: 'transform 200ms', flexShrink: 0 }}
                >
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
                        fill={clarityOpen ? CLARITY_MISSIONS[clarityMissionsIdx].color : '#C4A060'}
                        opacity={clarityOpen ? 1 : 0.55}
                      />
                    );
                  })()}
                </svg>
                are you clear on next missions?
              </button>
              {clarityOpen && (
                <div className="space-y-1.5 animate-in fade-in duration-200">
                  <DragSlider
                    items={CLARITY_MISSIONS}
                    selectedIdx={clarityMissionsIdx}
                    onSelect={setClarityMissionsIdx}
                    size={36}
                  />
                  <p
                    className="text-center font-bold transition-all duration-300"
                    style={{
                      color: CLARITY_MISSIONS[clarityMissionsIdx].color,
                      fontFamily: 'var(--font-serif)',
                      fontSize: '16px',
                    }}
                  >
                    {CLARITY_MISSIONS[clarityMissionsIdx].level}
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* ── LOGBOOK & EMOTIONS ── collapsible pillbox */}
      <div
        className="space-y-2 rounded-2xl border px-4 py-3"
        style={{
          borderColor: '#C4A06030',
          background: 'rgba(245,236,220,0.45)',
        }}
      >
        {/* Pill header — click to open/close */}
        <div className="flex items-center justify-between">
          <span className="w-12" />
          <button
            type="button"
            onClick={toggleLogbookSection}
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
              Logbook & Emotions
            </span>
            <span
              className="text-sm transition-transform duration-200"
              style={{
                color: '#C4A06080',
                transform: logbookSectionOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            >
              ▾
            </span>
          </button>
          <span className="w-12" />
        </div>

        {logbookSectionOpen && (
          <>
            {/* Hawkins emotional slider — Shame → Peace, 10 stops.
                Two visual styles (squares | dots), toggle on the right.
                Lives inside the Logbook & Emotions pill so it only appears
                when you're actually opening the emotional reflection layer. */}
            <div className="relative flex flex-col items-center gap-2 pt-4 pb-2">
              {/* Style toggle — small beige circle that switches between square and dot rendering */}
              <button
                type="button"
                onClick={() =>
                  setHawkinsStyle((s) =>
                    s === 'squares' ? 'dots' : s === 'dots' ? 'losanges' : 'squares',
                  )
                }
                aria-label="Toggle hawkins slider style"
                className="absolute right-0 flex cursor-pointer items-center justify-center"
                style={{
                  // Align vertically with the slider row: pt-4 (16px) + half of
                  // 36px container (18px) − half of this button (10px) = 24px.
                  top: 24,
                  width: 20,
                  height: 20,
                  background: 'transparent',
                  border: 'none',
                }}
              >
                <span
                  style={{
                    width: 14,
                    height: 14,
                    background: '#8A6A4A',
                    borderRadius: hawkinsStyle === 'dots' ? '50%' : '3px',
                    display: 'block',
                    transform: hawkinsStyle === 'losanges' ? 'rotate(45deg)' : 'rotate(0deg)',
                    transition: 'border-radius 200ms, transform 200ms',
                  }}
                />
              </button>

              <div className="relative" style={{ width: 300, height: 36 }}>
                {(() => {
                  if (hawkinsStyle === 'losanges') {
                    // LOSANGES — rotated squares (diamonds). A rotated 18px square
                    // visually occupies ~25.4px diagonal, so gap 13 yields ~4px
                    // clean negative space between adjacent losanges.
                    const sq = 18;
                    const gap = 13;
                    const totalW = HAWKINS.length * sq + (HAWKINS.length - 1) * gap;
                    const offsetX = (300 - totalW) / 2;
                    const baseY = (36 - sq) / 2;
                    return HAWKINS.map((h, i) => {
                      const selected = hawkinsIdx === i;
                      const x = offsetX + i * (sq + gap);
                      return (
                        <button
                          key={h.level}
                          type="button"
                          onClick={() => setHawkinsIdx(i)}
                          className="absolute cursor-pointer transition-all"
                          style={{
                            left: x,
                            top: baseY,
                            width: sq,
                            height: sq,
                            background: h.color,
                            opacity: selected ? 1 : 0.45,
                            border: 'none',
                            borderRadius: '2px',
                            transform: selected ? 'rotate(45deg) scale(1.15)' : 'rotate(45deg)',
                            boxShadow: selected ? `0 4px 14px -4px ${h.color}` : 'none',
                          }}
                          title={h.level}
                        />
                      );
                    });
                  }
                  if (hawkinsStyle === 'dots') {
                    // DOTS style — circular dots in a straight horizontal line,
                    // same vocabulary as variant 1 (arc) but flat instead of bowed.
                    const dotSize = 22;
                    const totalW = HAWKINS.length * dotSize + (HAWKINS.length - 1) * 6;
                    const offsetX = (300 - totalW) / 2;
                    const baseY = (36 - dotSize) / 2;
                    return HAWKINS.map((h, i) => {
                      const selected = hawkinsIdx === i;
                      const x = offsetX + i * (dotSize + 6);
                      return (
                        <button
                          key={h.level}
                          type="button"
                          onClick={() => setHawkinsIdx(i)}
                          className="absolute cursor-pointer rounded-full transition-all"
                          style={{
                            left: x,
                            top: baseY,
                            width: dotSize,
                            height: dotSize,
                            background: h.color,
                            opacity: selected ? 1 : 0.55,
                            border: 'none',
                            transform: selected ? 'scale(1.15)' : 'scale(1)',
                            boxShadow: selected ? `0 4px 14px -4px ${h.color}` : 'none',
                          }}
                          title={h.level}
                        />
                      );
                    });
                  }
                  // SQUARES style — original 20×20 rounded squares
                  const sq = 20;
                  const gap = 6;
                  const totalW = HAWKINS.length * sq + (HAWKINS.length - 1) * gap;
                  const offsetX = (300 - totalW) / 2;
                  const baseY = (36 - sq) / 2;
                  return HAWKINS.map((h, i) => {
                    const selected = hawkinsIdx === i;
                    const x = offsetX + i * (sq + gap);
                    return (
                      <button
                        key={h.level}
                        type="button"
                        onClick={() => setHawkinsIdx(i)}
                        className="absolute cursor-pointer rounded-[3px] transition-all"
                        style={{
                          left: x,
                          top: baseY,
                          width: sq,
                          height: sq,
                          background: h.color,
                          opacity: selected ? 1 : 0.35,
                          border: 'none',
                          transform: selected ? 'scale(1.15)' : 'scale(1)',
                          boxShadow: selected ? `0 4px 14px -4px ${h.color}` : 'none',
                        }}
                        title={h.level}
                      />
                    );
                  });
                })()}
              </div>
              <p
                style={{
                  // Acceptance's raw yellow (#F0E060) doesn't read against the cream
                  // paper background — swap to a readable ochre while keeping the
                  // yellow swatch in the slider itself.
                  color:
                    HAWKINS[hawkinsIdx].level === 'Acceptance'
                      ? '#B8860B'
                      : HAWKINS[hawkinsIdx].color,
                  fontFamily: 'var(--font-serif)',
                  fontSize: '18px',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  opacity: 1,
                }}
              >
                {HAWKINS[hawkinsIdx].level}
              </p>
            </div>

            {/* Two writing spots — challenge (top) + flow (bottom, ochre) */}
            <div className="space-y-2">
              {/* CHALLENGE — label above, question as placeholder on write line */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 px-1">
                  <span
                    className="block h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ background: '#A05A40', opacity: 0.85 }}
                  />
                  <span
                    className="shrink-0 font-semibold uppercase tracking-[0.18em]"
                    style={{ color: '#A05A40', fontSize: '16px' }}
                  >
                    Challenge
                  </span>
                </div>
                <div className="relative flex items-end gap-2">
                  <input
                    type="text"
                    value={challengeInput}
                    onChange={(e) => setChallengeInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveChallenge();
                    }}
                    placeholder="what is your main tension right now?"
                    className="flex-1 border-b bg-transparent pb-1 outline-none placeholder:italic placeholder:text-[#A05A40] placeholder:opacity-80"
                    style={{
                      color: '#7a5438',
                      borderColor: '#A05A4030',
                      fontFamily: 'var(--font-handwritten)',
                      fontSize: '20px',
                    }}
                  />
                  <CategoryTagPicker
                    value={challengeTag}
                    onChange={setChallengeTag}
                    open={showChallengeTagPicker}
                    onToggle={() => setShowChallengeTagPicker((o) => !o)}
                    onClose={() => setShowChallengeTagPicker(false)}
                    lifeCategories={lifeCategories}
                    compassAxes={COMPASS_AXES}
                  />
                </div>
              </div>

              {/* FLOW — label above, question as placeholder on write line */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 px-1">
                  <span
                    className="block h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ background: '#C4A060', opacity: 0.85 }}
                  />
                  <span
                    className="shrink-0 font-semibold uppercase tracking-[0.18em]"
                    style={{ color: '#C4A060', fontSize: '16px' }}
                  >
                    Flow
                  </span>
                </div>
                <div className="relative flex items-end gap-2">
                  <input
                    type="text"
                    value={flowInput}
                    onChange={(e) => setFlowInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveFlow();
                    }}
                    placeholder="what is working well?"
                    className="flex-1 border-b bg-transparent pb-1 outline-none placeholder:italic placeholder:text-[#C4A060] placeholder:opacity-80"
                    style={{
                      color: '#7a5438',
                      borderColor: '#C4A06030',
                      fontFamily: 'var(--font-handwritten)',
                      fontSize: '20px',
                    }}
                  />
                  <CategoryTagPicker
                    value={flowTag}
                    onChange={setFlowTag}
                    open={showFlowTagPicker}
                    onToggle={() => setShowFlowTagPicker((o) => !o)}
                    onClose={() => setShowFlowTagPicker(false)}
                    lifeCategories={lifeCategories}
                    compassAxes={COMPASS_AXES}
                  />
                </div>
              </div>
            </div>
            {/* Notes toggle — transparent pill that collapses/expands the entry list */}
            {sessionEmotions.length > 0 && (
              <div className="flex justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogbookEntries(!showLogbookEntries)}
                  className="flex cursor-pointer items-center gap-1.5 rounded-full bg-transparent px-3 py-0.5 font-semibold uppercase tracking-wider transition-all"
                  style={{
                    color: '#8A6A4A',
                    border: '1px dashed #C4A06070',
                    fontSize: '12px',
                  }}
                  title={showLogbookEntries ? 'Hide notes' : 'Show notes'}
                >
                  notes · {sessionEmotions.length}
                  <span
                    className="text-[8px] transition-transform duration-200"
                    style={{
                      color: '#C4A06080',
                      transform: showLogbookEntries ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                  >
                    ▾
                  </span>
                </button>
                {showLogbookEntries && (
                  <button
                    type="button"
                    onClick={() => setLogbookMode(logbookMode === 'grouped' ? 'mixed' : 'grouped')}
                    className="cursor-pointer rounded-md bg-transparent px-2 py-0.5 font-semibold uppercase tracking-wider transition-all"
                    style={{
                      color: '#8A6A4A',
                      border: '1px solid #C4A06050',
                      fontSize: '12px',
                    }}
                    title={`Switch to ${logbookMode === 'grouped' ? 'chronological (mixed)' : 'grouped'} view`}
                  >
                    {logbookMode === 'grouped' ? 'mixed' : 'grouped'}
                  </button>
                )}
              </div>
            )}

            {showLogbookEntries && sessionEmotions.length > 0 && logbookMode === 'mixed' && (
              <div className="space-y-1 pt-1">
                {sessionEmotions.map((e, i) => (
                  <div key={`m-${i}`} className="flex items-center gap-2" style={{ minHeight: 28 }}>
                    <span
                      className="shrink-0"
                      style={{
                        color: '#8A6A4A',
                        opacity: 0.75,
                        fontSize: '12px',
                        lineHeight: '28px',
                      }}
                    >
                      {e.time}
                    </span>
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ background: e.mindColor, opacity: 0.7 }}
                    />
                    <span
                      style={{
                        color: '#7a5438',
                        fontFamily: 'var(--font-handwritten)',
                        fontSize: '20px',
                        lineHeight: '28px',
                      }}
                    >
                      {e.text}
                    </span>
                  </div>
                ))}
              </div>
            )}
            {showLogbookEntries && sessionEmotions.length > 0 && logbookMode === 'grouped' && (
              <div className="space-y-3 pt-1">
                {/* CHALLENGE stack — red entries */}
                {sessionEmotions.some((e) => e.mind === 'challenge') && (
                  <div className="space-y-1">
                    <p
                      className="font-semibold uppercase tracking-[0.18em]"
                      style={{ color: '#A05A40', fontSize: '14px' }}
                    >
                      Challenge
                    </p>
                    {sessionEmotions
                      .filter((e) => e.mind === 'challenge')
                      .map((e, i) => (
                        <div
                          key={`c-${i}`}
                          className="flex items-center gap-2"
                          style={{ minHeight: 28 }}
                        >
                          <span
                            className="shrink-0"
                            style={{
                              color: '#8A6A4A',
                              opacity: 0.75,
                              fontSize: '12px',
                              lineHeight: '28px',
                            }}
                          >
                            {e.time}
                          </span>
                          <span
                            className="h-2 w-2 shrink-0 rounded-full"
                            style={{ background: e.mindColor, opacity: 0.7 }}
                          />
                          <span
                            style={{
                              color: '#7a5438',
                              fontFamily: 'var(--font-handwritten)',
                              fontSize: '20px',
                              lineHeight: '28px',
                            }}
                          >
                            {e.text}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
                {/* FLOW stack — green entries */}
                {sessionEmotions.some((e) => e.mind === 'flow') && (
                  <div className="space-y-1">
                    <p
                      className="font-semibold uppercase tracking-[0.18em]"
                      style={{ color: '#C4A060', fontSize: '14px' }}
                    >
                      Flow
                    </p>
                    {sessionEmotions
                      .filter((e) => e.mind === 'flow')
                      .map((e, i) => (
                        <div
                          key={`f-${i}`}
                          className="flex items-center gap-2"
                          style={{ minHeight: 28 }}
                        >
                          <span
                            className="shrink-0"
                            style={{
                              color: '#8A6A4A',
                              opacity: 0.75,
                              fontSize: '12px',
                              lineHeight: '28px',
                            }}
                          >
                            {e.time}
                          </span>
                          <span
                            className="h-2 w-2 shrink-0 rounded-full"
                            style={{ background: e.mindColor, opacity: 0.7 }}
                          />
                          <span
                            style={{
                              color: '#7a5438',
                              fontFamily: 'var(--font-handwritten)',
                              fontSize: '20px',
                              lineHeight: '28px',
                            }}
                          >
                            {e.text}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
                {/* Untagged entries (neither challenge nor flow) */}
                {sessionEmotions.some((e) => e.mind !== 'challenge' && e.mind !== 'flow') && (
                  <div className="space-y-1">
                    {sessionEmotions
                      .filter((e) => e.mind !== 'challenge' && e.mind !== 'flow')
                      .map((e, i) => (
                        <div
                          key={`u-${i}`}
                          className="flex items-center gap-2"
                          style={{ minHeight: 28 }}
                        >
                          <span
                            className="shrink-0"
                            style={{
                              color: '#8A6A4A',
                              opacity: 0.75,
                              fontSize: '12px',
                              lineHeight: '28px',
                            }}
                          >
                            {e.time}
                          </span>
                          <span
                            className="h-2 w-2 shrink-0 rounded-full"
                            style={{ background: e.mindColor, opacity: 0.6 }}
                          />
                          <span
                            style={{
                              color: '#7a5438',
                              fontFamily: 'var(--font-handwritten)',
                              fontSize: '20px',
                              lineHeight: '28px',
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
          </>
        )}
      </div>

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
    </div>
  );
}

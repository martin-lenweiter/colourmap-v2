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
  {
    level: 'Shame',
    color: '#B8D0E8',
    hawkins: 20,
    desc: 'You feel fundamentally flawed. Separate what you did from who you are. One act of self-compassion.',
    evolve: 'Move toward Apathy by simply acknowledging "I exist and that is enough."',
  },
  {
    level: 'Apathy',
    color: '#D8B0C8',
    hawkins: 50,
    desc: 'Nothing matters. You have given up. The world feels grey.',
    evolve: 'Move toward Grief by letting yourself care about one small thing again.',
  },
  {
    level: 'Grief',
    color: '#E8A0C4',
    hawkins: 75,
    desc: 'The weight of loss. You feel the absence of something important.',
    evolve: 'Move toward Fear by letting the sadness flow through rather than holding it.',
  },
  {
    level: 'Fear',
    color: '#F080B8',
    hawkins: 100,
    desc: 'The world feels threatening. You anticipate danger.',
    evolve: 'Move toward Anger by asking "what crossed my line?" — fear becomes fuel.',
  },
  {
    level: 'Anger',
    color: '#F0A088',
    hawkins: 150,
    desc: 'Raw energy from crossed boundaries. Information about what matters.',
    evolve: 'Move toward Courage by channeling the energy into one constructive action.',
  },
  {
    level: 'Courage',
    color: '#F8C040',
    hawkins: 200,
    desc: 'The first level of real power. You face what you have been avoiding.',
    evolve: 'Move toward Acceptance by dropping the need to fight and letting things be.',
  },
  {
    level: 'Acceptance',
    color: '#F0E060',
    hawkins: 350,
    desc: 'You stopped fighting reality. You work with what is.',
    evolve: 'Move toward Reason by using your clarity to understand patterns and systems.',
  },
  {
    level: 'Reason',
    color: '#A8E090',
    hawkins: 400,
    desc: 'Clear intellect. You see how things connect. Logic is strong.',
    evolve:
      'Move toward Love by balancing thinking with feeling — the heart knows things the mind cannot.',
  },
  {
    level: 'Love',
    color: '#88D8B0',
    hawkins: 500,
    desc: 'Unconditional warmth. Not attachment — genuine care without conditions.',
    evolve:
      'Move toward Peace by extending this love to yourself and releasing all remaining effort.',
  },
  {
    level: 'Peace',
    color: '#88C8E8',
    hawkins: 600,
    desc: 'Complete stillness. Pure awareness. You are the silence.',
    evolve: 'You are here. Protect this. Return through breath whenever the world pulls you.',
  },
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

/* ─── Challenge depth — guided follow-up questions ─── */
const CHALLENGE_QUESTIONS = [
  { key: 'why', placeholder: 'why does this feel hard?' },
  { key: 'fear', placeholder: 'what are you afraid will happen?' },
  { key: 'need', placeholder: 'what do you need right now?' },
  { key: 'smallest', placeholder: 'what is the smallest step you could take?' },
];

function ChallengeDepth({ onSave }: { onSave: (text: string) => void }) {
  const [open, setOpen] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  function saveAll() {
    const filled = CHALLENGE_QUESTIONS.filter((q) => answers[q.key]?.trim()).map(
      (q) => `${q.placeholder}: ${answers[q.key]?.trim()}`,
    );
    if (filled.length === 0) return;
    onSave(filled.join(' · '));
    setAnswers({});
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setOpen(false);
    }, 1500);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="cursor-pointer rounded-full px-2.5 py-1 text-[10px] font-semibold italic transition-all"
        style={{
          color: '#8A6A4A',
          opacity: 0.4,
          background: 'transparent',
          border: 'none',
          marginLeft: 14,
        }}
      >
        go deeper...
      </button>
    );
  }

  return (
    <div
      className="space-y-2 rounded-xl px-3 py-3 animate-in fade-in duration-200"
      style={{ background: '#C4A06006', border: '1px solid #C4A06012', marginLeft: 14 }}
    >
      {CHALLENGE_QUESTIONS.map((q) => (
        <input
          key={q.key}
          type="text"
          value={answers[q.key] || ''}
          onChange={(e) => setAnswers((prev) => ({ ...prev, [q.key]: e.target.value }))}
          onKeyDown={(e) => {
            if (e.key === 'Enter') saveAll();
          }}
          placeholder={q.placeholder}
          className="w-full border-b bg-transparent pb-1 outline-none placeholder:italic placeholder:text-[#8A6A4A] placeholder:opacity-50"
          style={{
            color: '#7a5438',
            borderColor: '#C4A06020',
            fontFamily: 'var(--font-serif)',
            fontSize: '14px',
          }}
        />
      ))}
      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={saveAll}
          className="cursor-pointer rounded-full px-3 py-1 text-[11px] font-semibold transition-all"
          style={{
            color: '#C4A060',
            background: '#C4A06010',
            border: '1px solid #C4A06025',
          }}
        >
          {saved ? 'saved' : 'save'}
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setAnswers({});
          }}
          className="cursor-pointer text-[10px] transition-all"
          style={{ color: '#8A6A4A', opacity: 0.4, background: 'none', border: 'none' }}
        >
          close
        </button>
      </div>
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
      missionId?: string;
      missionText?: string;
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
    { name: 'Care', color: '#D4805A', group: 'Feeling' },
    { name: 'Attitude', color: '#C4A070', group: 'Feeling' },
    { name: 'Rest', color: '#C4906A', group: 'Feeling' },
    { name: 'Emotions', color: '#B07A5A', group: 'Feeling' },
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
      return localStorage.getItem('colourmap:objective-section-open') === 'true';
    } catch {
      return false;
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
  const [sectionLabels, setSectionLabels] = useState<Record<string, string>>(() => {
    try {
      const raw = localStorage.getItem('colourmap:section-labels');
      if (raw) return JSON.parse(raw);
    } catch {}
    return {};
  });
  const [renamingSection, setRenamingSection] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  function sectionLabel(key: string, fallback: string) {
    return sectionLabels[key] || fallback;
  }

  function commitRename(key: string, fallback: string) {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== fallback) {
      const next = { ...sectionLabels, [key]: trimmed };
      setSectionLabels(next);
      try {
        localStorage.setItem('colourmap:section-labels', JSON.stringify(next));
      } catch {}
    }
    setRenamingSection(null);
  }

  const [sliderVisible, setSliderVisible] = useState(true);
  const [showHawkinsDesc, setShowHawkinsDesc] = useState(false);
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

  // Emotional-register variant — nine ways to render the same balance level.
  // 1 arc · 2 circle · 3 rings · 4 mountain · 5 slider · 6 boxes · 7 quadrant · 8 bars · 9 grid
  type Variant = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
  const VARIANTS: { id: Variant; label: string }[] = [
    { id: 1, label: 'arc' },
    { id: 2, label: 'circle' },
    { id: 3, label: 'rings' },
    { id: 4, label: 'mountain' },
    { id: 5, label: 'slider' },
    { id: 6, label: 'boxes' },
    { id: 7, label: 'quadrant' },
    { id: 8, label: 'bars' },
    { id: 9, label: 'grid' },
  ];
  const [variantIdx, setVariantIdx] = useState<Variant>(() => {
    const v = loadNum('colourmap:design-variant', 1);
    return Math.max(1, Math.min(9, v)) as Variant;
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

  // Quadrant variant — two axes: body (relaxed↔tense) and mind (productive↔disconnected)
  const BODY_AXIS = [
    { label: 'Relaxed', color: '#7AAA58' },
    { label: 'At ease', color: '#A0C8A0' },
    { label: 'Neutral', color: '#C8C8A0' },
    { label: 'Tight', color: '#E8A878' },
    { label: 'Tense', color: '#D06040' },
  ];
  const MIND_AXIS = [
    { label: 'Productive', color: '#6890B0' },
    { label: 'Focused', color: '#88B0C8' },
    { label: 'Entering the zone', color: '#C8C8A0' },
    { label: 'Drifting', color: '#D8C078' },
    { label: 'Disconnected', color: '#C4A060' },
  ];
  const CLARITY_AXIS = [
    { label: 'Clear mind', color: '#7AAA58' },
    { label: 'Mostly clear', color: '#A0C8A0' },
    { label: 'A bit foggy', color: '#C8C8A0' },
    { label: 'Scattered', color: '#D8C078' },
    { label: 'Blocking my focus', color: '#D06040' },
  ];
  const [bodyIdx, setBodyIdx] = useState(() => loadNum('colourmap:body-idx', 2));
  const [focusIdx, setFocusIdx] = useState(() => loadNum('colourmap:focus-idx', 2));
  const [clarityIdx, setClarityIdx] = useState(() => loadNum('colourmap:clarity-idx', 2));
  useEffect(() => {
    localStorage.setItem('colourmap:body-idx', String(bodyIdx));
  }, [bodyIdx]);
  useEffect(() => {
    localStorage.setItem('colourmap:focus-idx', String(focusIdx));
  }, [focusIdx]);
  useEffect(() => {
    localStorage.setItem('colourmap:clarity-idx', String(clarityIdx));
  }, [clarityIdx]);

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

  const [readinessIdx, _setReadinessIdx] = useState(() => {
    const v = loadNum('colourmap:readiness-idx', 2);
    return Math.max(0, Math.min(READINESS.length - 1, v));
  });
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
        mindColor: '#C4A060',
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
  const [objectiveTag, setObjectiveTag] = useState<{
    name: string;
    color: string;
    categoryId?: string;
  } | null>(null);
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
      setShowCategoryPicker(false);
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

  // Load check-in history from backend on mount
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional mount-only load
  useEffect(() => {
    fetch('/api/check-ins')
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error();
      })
      .then(
        (
          data: {
            id: string;
            sliderValue: number;
            note: string | null;
            emotionName: string | null;
            emotionColor: string | null;
            challenge: string | null;
            flow: string | null;
            createdAt: string;
          }[],
        ) => {
          if (!Array.isArray(data) || data.length === 0) return;
          // Merge API data with localStorage — API is source of truth for persisted entries
          const apiEntries = data.map((d) => ({
            id: d.id,
            time: new Date(d.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
            date: d.createdAt,
            mind:
              d.emotionName ||
              HAWKINS[Math.round((d.sliderValue / 100) * (HAWKINS.length - 1))].level,
            mindColor:
              d.emotionColor ||
              HAWKINS[Math.round((d.sliderValue / 100) * (HAWKINS.length - 1))].color,
            hawkinsIdx: Math.round((d.sliderValue / 100) * (HAWKINS.length - 1)),
            mode: '',
            modeColor: '',
            note: d.note || '',
            objective: '',
            emotions: [
              ...(d.challenge
                ? [{ time: '', text: d.challenge, mind: 'challenge', mindColor: '#C4A060' }]
                : []),
              ...(d.flow ? [{ time: '', text: d.flow, mind: 'flow', mindColor: '#6890B0' }] : []),
            ],
            facing: {},
          }));
          // Merge: keep local-only entries (no API id match) + all API entries
          const apiIds = new Set(apiEntries.map((e) => e.id));
          const localOnly = checkIns.filter((c) => !apiIds.has(c.id));
          const merged = [...localOnly, ...apiEntries]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 100);
          setCheckIns(merged);
          localStorage.setItem('colourmap:check-ins', JSON.stringify(merged));
        },
      )
      .catch(() => {
        /* silent — use localStorage */
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
      hawkinsIdx,
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

    // Persist to backend (Supabase via API)
    const challengeText = sessionEmotions
      .filter((e) => e.mind === 'challenge')
      .map((e) => e.text)
      .join('\n')
      .trim();
    const flowText = sessionEmotions
      .filter((e) => e.mind === 'flow')
      .map((e) => e.text)
      .join('\n')
      .trim();
    fetch('/api/check-ins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sliderValue: Math.round((hawkinsIdx / (HAWKINS.length - 1)) * 100),
        note: note.trim() || null,
        emotionName: currentMind.level,
        emotionColor: currentMind.color,
        challenge: challengeText || null,
        flow: flowText || null,
        facing:
          Object.keys(trackerValues).length > 0
            ? Object.fromEntries(
                Object.entries(trackerValues)
                  .filter(([, v]) => v.trim())
                  .map(([k, v]) => [k, { label: k, answers: [v.trim()] }]),
              )
            : null,
      }),
    }).catch(() => {
      /* silent — localStorage is fallback */
    });

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
    <>
      {/* BOX A: FEELING — frame removed on phone to reclaim margins.
          Desktop keeps the beige card for visual grouping. */}
      <div className="relative space-y-2.5 rounded-none border-0 bg-transparent px-0 py-0 shadow-none md:space-y-5 md:rounded-3xl md:border md:border-[#7a543833] md:px-5 md:py-6 md:bg-[linear-gradient(180deg,rgba(251,244,232,0.95),rgba(246,236,221,0.92))] md:shadow-[0_24px_50px_-34px_rgba(92,48,24,0.35)]">
        <p
          className="text-center uppercase tracking-[0.2em] md:tracking-[0.24em]"
          style={{
            fontFamily: 'var(--font-serif)',
            // Tighter on phone per user: go deeper, smaller.
            fontSize: 'clamp(10px, 2.4vw, 13px)',
            fontWeight: 700,
            color: '#D4805A',
            opacity: 0.7,
          }}
        >
          feeling
        </p>
        {/* Discrete design toggle — tiny losange at top-right, opens variant picker */}
        <div className="absolute right-4 top-4" style={{ zIndex: 10 }}>
          <button
            type="button"
            onClick={() => setDesignsOpen((o) => !o)}
            aria-label="Choose design"
            className="flex cursor-pointer items-center justify-center rounded-full transition-all"
            style={{
              width: 28,
              height: 28,
              background: 'transparent',
              border: 'none',
              opacity: 1,
            }}
          >
            <span
              style={{
                width: 20,
                height: 20,
                background: '#D8BE94',
                opacity: 0.3,
                borderRadius: '50%',
                display: 'block',
              }}
            />
          </button>
          {designsOpen && (
            <div
              className="absolute right-0 mt-1 animate-in fade-in duration-150 overflow-hidden rounded-xl"
              style={{
                // Fully opaque — previous use of hsl(var(--card)) could
                // resolve to a translucent color in some themes and the
                // list underneath bled through.
                background: '#FAF2E4',
                border: '1px solid #C4A06055',
                boxShadow:
                  '0 8px 24px -4px rgba(92,48,24,0.25), 0 2px 8px -2px rgba(92,48,24,0.15)',
                minWidth: 160,
                backdropFilter: 'none',
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

          {/* Variant 3: Rings — continuous rainbow filled band */}
          {variantIdx === 3 && (
            <div className="relative" style={{ width: 300, height: 100 }}>
              <svg width="300" height="100" viewBox="0 0 300 100">
                <defs>
                  <radialGradient id="rainbow-ring" cx="50%" cy="100%" r="90%">
                    {BALANCE.map((b, i) => (
                      <stop
                        key={b.label}
                        offset={`${(i / (BALANCE.length - 1)) * 100}%`}
                        stopColor={b.color}
                      />
                    ))}
                  </radialGradient>
                </defs>
                {(() => {
                  const cx = 150;
                  const cy = 100;
                  const minR = 8;
                  const maxR = 92;
                  const n = BALANCE.length;
                  const bandW = (maxR - minR) / n;

                  return (
                    <>
                      {/* Continuous rainbow band — filled arc segments */}
                      {BALANCE.map((b, i) => {
                        const innerR = minR + i * bandW;
                        const outerR = innerR + bandW;
                        const d = `M ${cx - outerR} ${cy} A ${outerR} ${outerR} 0 0 1 ${cx + outerR} ${cy} L ${cx + innerR} ${cy} A ${innerR} ${innerR} 0 0 0 ${cx - innerR} ${cy} Z`;
                        const selected = balanceIdx === i;
                        const dist = Math.abs(i - balanceIdx);
                        return (
                          <g key={b.label}>
                            <path
                              d={d}
                              fill={b.color}
                              opacity={selected ? 0.85 : dist === 1 ? 0.4 : 0.15}
                              style={{ cursor: 'pointer', transition: 'opacity 250ms' }}
                              onClick={() => setBalanceIdx(i)}
                            />
                          </g>
                        );
                      })}
                    </>
                  );
                })()}
                <circle
                  cx={150}
                  cy={100}
                  r={5}
                  fill={BALANCE[balanceIdx].color}
                  style={{ pointerEvents: 'none', transition: 'fill 250ms' }}
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

          {variantIdx === 7 && (
            <div className="flex items-stretch gap-6" style={{ width: 340, minHeight: 120 }}>
              {/* Left axis — body: Relaxed ↔ Tense */}
              <div className="flex flex-1 flex-col items-center gap-1">
                <span
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '10px',
                    fontWeight: 700,
                    color: '#8A6A4A',
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase' as const,
                    opacity: 0.6,
                  }}
                >
                  body
                </span>
                <div className="flex flex-1 flex-col gap-[3px]" style={{ width: '100%' }}>
                  {BODY_AXIS.map((b, i) => {
                    const active = bodyIdx === i;
                    return (
                      <button
                        key={b.label}
                        type="button"
                        onClick={() => setBodyIdx(i)}
                        className="flex-1 cursor-pointer rounded-sm transition-all"
                        style={{
                          background: b.color,
                          opacity: active ? 1 : 0.2,
                          border: 'none',
                          boxShadow: active ? `0 2px 10px -3px ${b.color}` : 'none',
                          minHeight: 16,
                        }}
                      />
                    );
                  })}
                </div>
                <span
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: BODY_AXIS[bodyIdx].color,
                  }}
                >
                  {BODY_AXIS[bodyIdx].label}
                </span>
              </div>

              {/* Right axis — focus: Productive ↔ Disconnected */}
              <div className="flex flex-1 flex-col items-center gap-1">
                <span
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '10px',
                    fontWeight: 700,
                    color: '#8A6A4A',
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase' as const,
                    opacity: 0.6,
                  }}
                >
                  focus
                </span>
                <div className="flex flex-1 flex-col gap-[3px]" style={{ width: '100%' }}>
                  {MIND_AXIS.map((m, i) => {
                    const active = focusIdx === i;
                    return (
                      <button
                        key={m.label}
                        type="button"
                        onClick={() => setFocusIdx(i)}
                        className="flex-1 cursor-pointer rounded-sm transition-all"
                        style={{
                          background: m.color,
                          opacity: active ? 1 : 0.2,
                          border: 'none',
                          boxShadow: active ? `0 2px 10px -3px ${m.color}` : 'none',
                          minHeight: 16,
                        }}
                      />
                    );
                  })}
                </div>
                <span
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: MIND_AXIS[focusIdx].color,
                  }}
                >
                  {MIND_AXIS[focusIdx].label}
                </span>
              </div>
              {/* Clarity — horizontal bar below both columns */}
              <div className="mt-3 space-y-1.5" style={{ width: '100%' }}>
                <div className="flex items-center justify-between">
                  <span
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#8A6A4A',
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase' as const,
                      opacity: 0.6,
                    }}
                  >
                    clarity
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: CLARITY_AXIS[clarityIdx].color,
                    }}
                  >
                    {CLARITY_AXIS[clarityIdx].label}
                  </span>
                </div>
                <div className="flex gap-[3px]">
                  {CLARITY_AXIS.map((c, i) => {
                    const active = clarityIdx === i;
                    return (
                      <button
                        key={c.label}
                        type="button"
                        onClick={() => setClarityIdx(i)}
                        className="flex-1 cursor-pointer rounded-sm transition-all"
                        style={{
                          height: 14,
                          background: c.color,
                          opacity: active ? 1 : 0.18,
                          border: 'none',
                          boxShadow: active ? `0 2px 8px -2px ${c.color}` : 'none',
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {variantIdx === 8 && (
            <div className="space-y-4" style={{ width: 340 }}>
              {/* Body axis — horizontal bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#8A6A4A',
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase' as const,
                      opacity: 0.6,
                    }}
                  >
                    body
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: BODY_AXIS[bodyIdx].color,
                    }}
                  >
                    {BODY_AXIS[bodyIdx].label}
                  </span>
                </div>
                <div className="flex gap-[3px]">
                  {BODY_AXIS.map((b, i) => {
                    const active = bodyIdx === i;
                    return (
                      <button
                        key={b.label}
                        type="button"
                        onClick={() => setBodyIdx(i)}
                        className="flex-1 cursor-pointer rounded-sm transition-all"
                        style={{
                          height: 18,
                          background: b.color,
                          opacity: active ? 1 : 0.18,
                          border: 'none',
                          boxShadow: active ? `0 2px 8px -2px ${b.color}` : 'none',
                        }}
                      />
                    );
                  })}
                </div>
              </div>
              {/* Focus axis — horizontal bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#8A6A4A',
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase' as const,
                      opacity: 0.6,
                    }}
                  >
                    focus
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: MIND_AXIS[focusIdx].color,
                    }}
                  >
                    {MIND_AXIS[focusIdx].label}
                  </span>
                </div>
                <div className="flex gap-[3px]">
                  {MIND_AXIS.map((m, i) => {
                    const active = focusIdx === i;
                    return (
                      <button
                        key={m.label}
                        type="button"
                        onClick={() => setFocusIdx(i)}
                        className="flex-1 cursor-pointer rounded-sm transition-all"
                        style={{
                          height: 18,
                          background: m.color,
                          opacity: active ? 1 : 0.18,
                          border: 'none',
                          boxShadow: active ? `0 2px 8px -2px ${m.color}` : 'none',
                        }}
                      />
                    );
                  })}
                </div>
              </div>
              {/* Clarity axis — horizontal bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#8A6A4A',
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase' as const,
                      opacity: 0.6,
                    }}
                  >
                    clarity
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: CLARITY_AXIS[clarityIdx].color,
                    }}
                  >
                    {CLARITY_AXIS[clarityIdx].label}
                  </span>
                </div>
                <div className="flex gap-[3px]">
                  {CLARITY_AXIS.map((c, i) => {
                    const active = clarityIdx === i;
                    return (
                      <button
                        key={c.label}
                        type="button"
                        onClick={() => setClarityIdx(i)}
                        className="flex-1 cursor-pointer rounded-sm transition-all"
                        style={{
                          height: 18,
                          background: c.color,
                          opacity: active ? 1 : 0.18,
                          border: 'none',
                          boxShadow: active ? `0 2px 8px -2px ${c.color}` : 'none',
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Variant 9: grid — body left, focus right as square columns, clarity bar below */}
          {variantIdx === 9 && (
            <div style={{ width: 340 }}>
              <div className="flex gap-4">
                {/* Body column — left */}
                <div className="flex flex-1 flex-col items-center gap-1">
                  <span
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '10px',
                      fontWeight: 700,
                      color: '#8A6A4A',
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase' as const,
                      opacity: 0.6,
                    }}
                  >
                    body
                  </span>
                  <div className="flex flex-col gap-[3px]" style={{ width: '100%' }}>
                    {BODY_AXIS.map((b, i) => {
                      const active = bodyIdx === i;
                      return (
                        <button
                          key={b.label}
                          type="button"
                          onClick={() => setBodyIdx(i)}
                          className="cursor-pointer rounded-[3px] transition-all"
                          style={{
                            width: '100%',
                            height: 24,
                            background: b.color,
                            opacity: active ? 1 : 0.18,
                            border: 'none',
                            boxShadow: active ? `0 2px 8px -2px ${b.color}` : 'none',
                          }}
                        />
                      );
                    })}
                  </div>
                  <span
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: BODY_AXIS[bodyIdx].color,
                    }}
                  >
                    {BODY_AXIS[bodyIdx].label}
                  </span>
                </div>
                {/* Focus column — right */}
                <div className="flex flex-1 flex-col items-center gap-1">
                  <span
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '10px',
                      fontWeight: 700,
                      color: '#8A6A4A',
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase' as const,
                      opacity: 0.6,
                    }}
                  >
                    focus
                  </span>
                  <div className="flex flex-col gap-[3px]" style={{ width: '100%' }}>
                    {MIND_AXIS.map((m, i) => {
                      const active = focusIdx === i;
                      return (
                        <button
                          key={m.label}
                          type="button"
                          onClick={() => setFocusIdx(i)}
                          className="cursor-pointer rounded-[3px] transition-all"
                          style={{
                            width: '100%',
                            height: 24,
                            background: m.color,
                            opacity: active ? 1 : 0.18,
                            border: 'none',
                            boxShadow: active ? `0 2px 8px -2px ${m.color}` : 'none',
                          }}
                        />
                      );
                    })}
                  </div>
                  <span
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: MIND_AXIS[focusIdx].color,
                    }}
                  >
                    {MIND_AXIS[focusIdx].label}
                  </span>
                </div>
              </div>
              {/* Clarity — horizontal bar below both columns */}
              <div className="mt-4 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#8A6A4A',
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase' as const,
                      opacity: 0.6,
                    }}
                  >
                    clarity
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: CLARITY_AXIS[clarityIdx].color,
                    }}
                  >
                    {CLARITY_AXIS[clarityIdx].label}
                  </span>
                </div>
                <div className="flex gap-[3px]">
                  {CLARITY_AXIS.map((c, i) => {
                    const active = clarityIdx === i;
                    return (
                      <button
                        key={c.label}
                        type="button"
                        onClick={() => setClarityIdx(i)}
                        className="flex-1 cursor-pointer rounded-[3px] transition-all"
                        style={{
                          height: 18,
                          background: c.color,
                          opacity: active ? 1 : 0.18,
                          border: 'none',
                          boxShadow: active ? `0 2px 8px -2px ${c.color}` : 'none',
                        }}
                      />
                    );
                  })}
                </div>
              </div>
              {/* Hawkins emotion bar */}
              <div className="mt-4 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#8A6A4A',
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase' as const,
                      opacity: 0.6,
                    }}
                  >
                    emotion
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: HAWKINS[hawkinsIdx].color,
                    }}
                  >
                    {HAWKINS[hawkinsIdx].level}
                  </span>
                </div>
                <div className="flex gap-[3px]">
                  {HAWKINS.map((h, i) => {
                    const active = hawkinsIdx === i;
                    return (
                      <button
                        key={h.level}
                        type="button"
                        onClick={() => setHawkinsIdx(i)}
                        className="flex-1 cursor-pointer rounded-[3px] transition-all"
                        style={{
                          height: 18,
                          background: h.color,
                          opacity: active ? 1 : 0.18,
                          border: 'none',
                          boxShadow: active ? `0 2px 8px -2px ${h.color}` : 'none',
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {variantIdx !== 7 && variantIdx !== 8 && variantIdx !== 9 && (
            <p
              className="text-center text-lg font-bold transition-all duration-300"
              style={{
                color: '#1a1a1a',
                fontFamily: 'var(--font-serif)',
              }}
            >
              {variantIdx === 6 ? HAWKINS[hawkinsIdx].level : BALANCE[balanceIdx].label}
            </p>
          )}
        </div>

        {/* LOGBOOK & EMOTIONS — frame removed on phone. */}
        <div
          className="space-y-2 rounded-none border-0 bg-transparent px-0 py-1 md:rounded-2xl md:border md:px-4 md:py-3"
          style={{
            borderColor: '#C4A06030',
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
                Emotions
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
              {/* Hawkins emotional slider — toggled by losange below */}
              {sliderVisible && (
                <div className="relative flex flex-col items-center gap-2 pt-4 pb-2">
                  {/* Style toggle — pushed to the top-right corner of
                      the slider container with z-index 2 so it sits
                      ABOVE the slider squares on phone (was hidden
                      behind them before). Bigger tap target (28px)
                      and more visible border so it doesn't look like
                      a faded dot. */}
                  {/* Design-style toggle — plain beige dot on both
                      phone and desktop. User feedback: 'jsut a biege
                      dot liek in feeling' + 'do it a small bit higher'.
                      Title carries the current design number so they
                      can long-press to read it without visual clutter. */}
                  <button
                    type="button"
                    onClick={() =>
                      setHawkinsStyle((s) =>
                        s === 'squares' ? 'dots' : s === 'dots' ? 'losanges' : 'squares',
                      )
                    }
                    aria-label={`Slider design ${
                      hawkinsStyle === 'squares' ? 1 : hawkinsStyle === 'dots' ? 2 : 3
                    } of 3 — tap to cycle`}
                    title={`Design ${
                      hawkinsStyle === 'squares' ? 1 : hawkinsStyle === 'dots' ? 2 : 3
                    } of 3`}
                    className="absolute cursor-pointer flex items-center justify-center"
                    style={{
                      right: 2,
                      top: 4,
                      width: 22,
                      height: 22,
                      background: 'transparent',
                      border: 'none',
                      padding: 4,
                      zIndex: 2,
                    }}
                  >
                    <span
                      aria-hidden="true"
                      style={{
                        width: 14,
                        height: 14,
                        background: '#C4A060',
                        borderRadius: '50%',
                        opacity: 0.22,
                      }}
                    />
                  </button>

                  <div className="relative" style={{ width: 300, height: 40 }}>
                    {(() => {
                      if (hawkinsStyle === 'losanges') {
                        // LOSANGES — rotated squares (diamonds). A rotated 18px square
                        // visually occupies ~25.4px diagonal, so gap 13 yields ~4px
                        // clean negative space between adjacent losanges.
                        const sq = 18;
                        const gap = 13;
                        const totalW = HAWKINS.length * sq + (HAWKINS.length - 1) * gap;
                        const offsetX = (300 - totalW) / 2;
                        const baseY = (40 - sq) / 2;
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
                        const baseY = (40 - dotSize) / 2;
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
                      const baseY = (40 - sq) / 2;
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
                      color: '#1a1a1a',
                      fontFamily: 'var(--font-serif)',
                      fontSize: '18px',
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                      opacity: 1,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setShowHawkinsDesc((s) => !s)}
                      className="cursor-pointer transition-all hover:opacity-80"
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        color: 'inherit',
                        font: 'inherit',
                        fontWeight: 'inherit',
                        letterSpacing: 'inherit',
                      }}
                    >
                      {HAWKINS[hawkinsIdx].level}
                    </button>
                  </p>
                  {showHawkinsDesc && (
                    <div className="animate-in fade-in duration-200 space-y-2 px-4 pt-1 pb-2">
                      <p
                        style={{
                          fontFamily: 'var(--font-serif)',
                          fontSize: '14px',
                          color: '#5C3018',
                          lineHeight: 1.5,
                          opacity: 0.85,
                        }}
                      >
                        {HAWKINS[hawkinsIdx].desc}
                      </p>
                      <p
                        className="italic"
                        style={{
                          fontFamily: 'var(--font-serif)',
                          fontSize: '13px',
                          color:
                            HAWKINS[hawkinsIdx].color === '#F0E060'
                              ? '#B8860B'
                              : HAWKINS[hawkinsIdx].color,
                          lineHeight: 1.4,
                          opacity: 0.75,
                        }}
                      >
                        {HAWKINS[hawkinsIdx].evolve}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Losange toggle — show/hide slider + emotion name */}
              <div className="flex justify-center py-1">
                <button
                  type="button"
                  onClick={() => setSliderVisible((s) => !s)}
                  className="cursor-pointer transition-all hover:scale-125"
                  style={{ background: 'none', border: 'none', padding: 4 }}
                  title={sliderVisible ? 'Hide slider' : 'Show slider'}
                >
                  <span
                    style={{
                      display: 'block',
                      width: 10,
                      height: 10,
                      background: HAWKINS[hawkinsIdx].color,
                      opacity: sliderVisible ? 0.6 : 0.3,
                      borderRadius: 2,
                      transform: 'rotate(45deg)',
                      transition: 'opacity 0.2s',
                    }}
                  />
                </button>
              </div>

              {/* Two writing spots — challenge (top) + flow (bottom, ochre) */}
              <div className="space-y-2">
                {/* CHALLENGE — label above, question as placeholder on write line */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 px-1">
                    <span
                      className="block h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ background: '#C4A060', opacity: 0.85 }}
                    />
                    <span
                      className="shrink-0 font-semibold uppercase tracking-[0.22em]"
                      style={{ color: '#C4A060', fontSize: '16px' }}
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
                      className="flex-1 border-b bg-transparent pb-1 outline-none placeholder:italic placeholder:text-[#8A6A4A] placeholder:opacity-[0.95]"
                      style={{
                        color: '#7a5438',
                        borderColor: '#C4A06030',
                        fontFamily: 'var(--font-serif)',
                        fontSize: '16px',
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

                {/* Challenge depth — guided follow-ups */}
                <ChallengeDepth
                  onSave={(text) => {
                    setSessionEmotions([
                      ...sessionEmotions,
                      {
                        time: new Date().toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        }),
                        text,
                        mind: 'challenge',
                        mindColor: '#C4A060',
                        ...(challengeTag && {
                          tag: challengeTag.name,
                          tagColor: challengeTag.color,
                        }),
                      },
                    ]);
                  }}
                />

                {/* FLOW — label above, question as placeholder on write line */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 px-1">
                    <span
                      className="block h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ background: '#C4A060', opacity: 0.85 }}
                    />
                    <span
                      className="shrink-0 font-semibold uppercase tracking-[0.22em]"
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
                      placeholder="what is working well? how are you celebrating?"
                      className="flex-1 border-b bg-transparent pb-1 outline-none placeholder:italic placeholder:text-[#8A6A4A] placeholder:opacity-[0.95]"
                      style={{
                        color: '#7a5438',
                        borderColor: '#C4A06030',
                        fontFamily: 'var(--font-serif)',
                        fontSize: '16px',
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
                        className="text-[10px] transition-transform duration-200"
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
                        onClick={() =>
                          setLogbookMode(logbookMode === 'grouped' ? 'mixed' : 'grouped')
                        }
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
                      <div
                        key={`m-${i}`}
                        className="flex items-start gap-2"
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
                          className="mt-[10px] h-2 w-2 shrink-0 rounded-full"
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
                          className="font-semibold uppercase tracking-[0.22em]"
                          style={{ color: '#C4A060', fontSize: '14px' }}
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
                          className="font-semibold uppercase tracking-[0.22em]"
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
              </div>
            </>
          )}
        </div>

        {/* Save star + post-save summary */}
        <div className="flex flex-col items-center gap-1">
          <button
            type="button"
            onClick={() => saveCheckIn()}
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
          {justSaved &&
            (() => {
              // Celebration logic — compare with previous check-ins
              const today = new Date().toISOString().split('T')[0];
              const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
              const prevToday = checkIns.find(
                (c) => c.date?.startsWith(today) && c.id !== checkIns[0]?.id,
              );
              const prevYesterday = checkIns.find((c) => c.date?.startsWith(yesterday));
              const prev = prevToday || prevYesterday;
              const prevIdx = (prev as { hawkinsIdx?: number })?.hawkinsIdx;
              const _moved = typeof prevIdx === 'number' && prevIdx !== hawkinsIdx;
              const movedUp = typeof prevIdx === 'number' && hawkinsIdx > prevIdx;

              // Streak: count consecutive days with check-ins
              let streak = 1;
              const seen = new Set([today]);
              for (const c of checkIns) {
                if (!c.date) continue;
                const d = c.date.split('T')[0];
                if (seen.has(d)) continue;
                const expected = new Date(Date.now() - streak * 86400000)
                  .toISOString()
                  .split('T')[0];
                if (d === expected) {
                  streak++;
                  seen.add(d);
                } else break;
              }

              // Celebration message
              let celebration = '';
              if (movedUp && prev) {
                celebration = `${HAWKINS[prevIdx].level} → ${HAWKINS[hawkinsIdx].level}. You moved.`;
              } else if (hawkinsIdx >= 7) {
                celebration = 'You are in expansion. Protect this.';
              } else if (hawkinsIdx >= 5) {
                celebration = 'Courage territory. Keep going.';
              }

              return (
                <div className="animate-in fade-in duration-300 text-center space-y-1">
                  <p
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: currentMind.color,
                    }}
                  >
                    {HAWKINS[hawkinsIdx].level}
                  </p>
                  {celebration && (
                    <p
                      className="italic"
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '12px',
                        color: '#5C3018',
                        opacity: 0.7,
                      }}
                    >
                      {celebration}
                    </p>
                  )}
                  <p
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '11px',
                      color: '#8A6A4A',
                      opacity: 0.5,
                    }}
                  >
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {sessionEmotions.length > 0 && ` · ${sessionEmotions.length} notes`}
                    {streak > 1 && ` · ${streak} day streak`}
                  </p>
                </div>
              );
            })()}
        </div>
      </div>

      {/* BOX B: DOING — frame removed on phone to reclaim margins. */}
      <div className="space-y-2.5 rounded-none border-0 bg-transparent px-0 py-0 shadow-none md:space-y-4 md:rounded-3xl md:border md:border-[#7a543833] md:px-5 md:py-6 md:bg-[linear-gradient(180deg,rgba(251,244,232,0.95),rgba(246,236,221,0.92))] md:shadow-[0_24px_50px_-34px_rgba(92,48,24,0.35)]">
        <p
          className="text-center uppercase tracking-[0.24em]"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '10px',
            fontWeight: 700,
            color: '#6890B0',
            opacity: 0.5,
          }}
        >
          doing
        </p>
        {/* CURRENT OBJECTIVE */}
        <div className="space-y-2 px-0 py-1 transition-all">
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
                {renamingSection === 'current' ? (
                  <input
                    type="text"
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={() => commitRename('current', 'Current Objective')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') commitRename('current', 'Current Objective');
                      if (e.key === 'Escape') setRenamingSection(null);
                    }}
                    autoFocus
                    className="bg-transparent text-center text-sm font-semibold uppercase tracking-[0.22em] outline-none border-b"
                    style={{ color: '#C4A060', borderColor: '#C4A06040' }}
                  />
                ) : (
                  <span
                    className="cursor-pointer"
                    onDoubleClick={() => {
                      setRenamingSection('current');
                      setRenameValue(sectionLabel('current', 'Current Objective'));
                    }}
                    title="Double-click to rename"
                  >
                    {sectionLabel('current', 'Current Objective')}
                  </span>
                )}
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
                className="w-full border-b bg-transparent pb-1 text-center outline-none placeholder:text-[#7A5438] placeholder:opacity-50"
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
                {objective.trim().length > 0 && (
                  <CategoryTagPicker
                    value={objectiveTag}
                    onChange={(v) => {
                      setObjectiveTag(v);
                      if (v?.categoryId) tagObjectiveToCategory(v.categoryId);
                    }}
                    open={showCategoryPicker}
                    onToggle={() => setShowCategoryPicker(!showCategoryPicker)}
                    onClose={() => setShowCategoryPicker(false)}
                    lifeCategories={lifeCategories}
                    compassAxes={COMPASS_AXES}
                  />
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
            </div>
          </div>

          {/* Done archive moved to Other Missions Done tab */}
        </div>
      </div>
    </>
  );
}

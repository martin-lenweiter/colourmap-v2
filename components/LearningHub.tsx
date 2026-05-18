'use client';

import { useMemo, useState } from 'react';
import { PROGRAMS, type Program } from '@/lib/programs';
import ComicProgram from './ComicProgram';
import LearningProgram from './LearningProgram';
import PersonalityTypeProgram from './PersonalityTypeProgram';

const COMIC_PROGRAMS = new Set([
  'room-to-breathe',
  'emotional-intelligence',
  'self-talk',
  'wellbeing',
  'hope-energy',
  'struggle-letting-go',
  'sleep',
  'nervous-system',
  'grief',
  'belonging',
  'agency',
  'organisational-intelligence',
  'creativity',
  'relational-intelligence',
  'artificial-intelligence',
  'ai-future',
  'collective-evolution',
  'deep-attention',
  'fishing-in-the-dark',
  'conflict-repair',
  'money-anxiety',
  'identity-becoming',
  'parenting-patterns',
  'carl-jung',
  'paulo-freire',
  'thich-nhat-hanh',
]);

const EDUCATION_IMAGES = ['/education-1.png', '/education-2.png', '/education-3.png'];
const EDUCATION_WORLDS = [
  {
    href: '#personality-map',
    title: 'Personality Map',
    label: 'Traits, story, and mode bridges',
    body: 'A positive self-understanding test that maps tendencies, story lens, gifts, frictions, and next reactions.',
    tint: '#D0A35F',
    kind: 'personality',
  },
  {
    href: '/atlas',
    title: 'Living Atlas',
    label: 'Maps and collective knowledge',
    body: 'Wellbeing, society, hope, data, and human progress as a living map.',
    tint: '#6B7A50',
    kind: 'link',
  },
  {
    href: '/progress-road',
    title: 'Progress Roads',
    label: 'History as hopeful timelines',
    body: 'Tools, democracy, peace, kindness, freedom, happiness, and future questions.',
    tint: '#6888B0',
    kind: 'link',
  },
];

const POSITIVE_OVERLAY_PROGRAMS = new Set([
  'agency',
  'organisational-intelligence',
  'creativity',
  'relational-intelligence',
  'artificial-intelligence',
  'ai-future',
  'collective-evolution',
  'deep-attention',
  'fishing-in-the-dark',
  'conflict-repair',
  'money-anxiety',
  'identity-becoming',
  'parenting-patterns',
]);
const JPG_PANEL_PROGRAMS = new Set(['carl-jung', 'struggle-letting-go']);
const GENERATED_COVER_PROGRAMS = new Set(['paulo-freire', 'thich-nhat-hanh']);
const PROGRAM_COVER_PANEL: Record<string, number> = {
  'room-to-breathe': 4,
  'emotional-intelligence': 3,
  'self-talk': 2,
  wellbeing: 3,
  'hope-energy': 5,
  sleep: 4,
  'nervous-system': 3,
  grief: 5,
  'struggle-letting-go': 2,
  belonging: 4,
  agency: 2,
  'organisational-intelligence': 1,
  creativity: 3,
  'relational-intelligence': 2,
  'artificial-intelligence': 2,
  'ai-future': 4,
  'collective-evolution': 5,
  'deep-attention': 8,
  'carl-jung': 13,
  'paulo-freire': 5,
  'thich-nhat-hanh': 8,
};

const SERIF = 'var(--font-serif)';
const cream = (a: number) => `rgba(240,216,152,${a})`;
const och = (a: number) => `rgba(196,160,96,${a})`;

function col(color: string, a: number) {
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}

/* ── Colour progression within a group lane ─────────────────── */
function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h =
    max === r
      ? ((g - b) / d + (g < b ? 6 : 0)) / 6
      : max === g
        ? ((b - r) / d + 2) / 6
        : ((r - g) / d + 4) / 6;
  return [h, s, l];
}

function hslToHex(h: number, s: number, l: number): string {
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const r = Math.round(hue2rgb(p, q, h + 1 / 3) * 255);
  const g = Math.round(hue2rgb(p, q, h) * 255);
  const b = Math.round(hue2rgb(p, q, h - 1 / 3) * 255);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function progressionColor(tint: string, index: number, total: number): string {
  const [h, s, l] = hexToHsl(tint);
  const t = total > 1 ? index / (total - 1) : 0.5;
  // light → rich: lightness goes from l+0.18 down to l-0.12
  const newL = Math.max(0.15, Math.min(0.82, l + 0.18 - t * 0.3));
  return hslToHex(h, Math.min(s + 0.05, 1), newL);
}

/* ── Groups with tint color per category ─────────────────────── */
const GROUPS: { label: string; keys: string[]; tint: string; startHere?: string }[] = [
  {
    label: 'Inner Life',
    keys: [
      'room-to-breathe',
      'emotional-intelligence',
      'self-talk',
      'carl-jung',
      'paulo-freire',
      'thich-nhat-hanh',
      'wellbeing',
      'hope-energy',
      'sleep',
      'nervous-system',
      'grief',
      'struggle-letting-go',
      'belonging',
    ],
    tint: '#C4A060',
    startHere: 'emotional-intelligence',
  },
  {
    label: 'Growth',
    keys: [
      'agency',
      'creativity',
      'relational-intelligence',
      'deep-attention',
      'conflict-repair',
      'money-anxiety',
      'identity-becoming',
    ],
    tint: '#6888B0',
  },
  {
    label: 'Systems',
    keys: ['organisational-intelligence', 'collective-evolution', 'parenting-patterns'],
    tint: '#6B7A50',
  },
  {
    label: 'Intelligence',
    keys: ['artificial-intelligence', 'ai-future'],
    tint: '#7A8898',
  },
];

function GeneratedProgramCover({ color }: { color: string }) {
  return (
    <svg
      viewBox="0 0 352 208"
      role="img"
      aria-label="Generated education cover"
      style={{ display: 'block', width: '100%', height: '100%' }}
    >
      <rect width="352" height="208" fill="#ead8b4" />
      <rect width="352" height="208" fill={col(color, 0.12)} />
      <path
        d="M34 154 C74 104, 116 106, 154 128 C194 151, 233 96, 318 72"
        fill="none"
        stroke="#5C3018"
        strokeWidth="3"
        opacity="0.36"
      />
      <path
        d="M58 145 C104 128, 139 139, 178 122 C219 104, 250 75, 305 66"
        fill="none"
        stroke={color}
        strokeWidth="7"
        strokeLinecap="round"
        opacity="0.44"
      />
      {[62, 108, 154, 202, 248, 294].map((x, index) => (
        <g key={x} transform={`translate(${x} ${index % 2 === 0 ? 132 : 112})`}>
          <circle r="13" fill="#f8edcf" stroke="#5C3018" strokeWidth="2" opacity="0.86" />
          <path
            d="M-18 38 C-9 15, 9 15, 18 38"
            fill="none"
            stroke="#5C3018"
            strokeWidth="2"
            opacity="0.72"
          />
        </g>
      ))}
      <circle cx="284" cy="64" r="18" fill={color} opacity="0.68" />
      <circle cx="284" cy="64" r="32" fill="none" stroke={color} strokeWidth="2" opacity="0.28" />
      <g stroke="#5C3018" strokeWidth="1" opacity="0.14">
        <path d="M28 34h188M28 48h132M28 62h92" />
        <path d="M236 124h82M225 138h58M246 152h72" />
      </g>
    </svg>
  );
}

function getProgress(program: Program): number {
  try {
    const saved = localStorage.getItem(`colourmap:program:${program.key}`);
    if (saved !== null) return Math.min(Number(saved) + 1, program.segments.length);
  } catch {}
  return 0;
}

/* ── Dynamic opening based on today's emotion ───────────────── */
function getOpening(): { headline: string; sub: string } {
  try {
    const word = (localStorage.getItem('colourmap:mood-word') ?? '').toLowerCase();
    const anxious = [
      'anxious',
      'anxiety',
      'stressed',
      'nervous',
      'overwhelmed',
      'worried',
      'tense',
      'fearful',
    ];
    const low = ['sad', 'low', 'tired', 'exhausted', 'empty', 'lost', 'grief', 'heavy', 'numb'];
    const good = [
      'good',
      'great',
      'energised',
      'excited',
      'clear',
      'focused',
      'grateful',
      'hopeful',
      'alive',
    ];

    if (anxious.some((w) => word.includes(w)))
      return {
        headline: "You're here. That already matters.",
        sub: 'Anxiety is information — about what you value, what you fear, what needs attention. Start anywhere. One page is enough.',
      };
    if (low.some((w) => word.includes(w)))
      return {
        headline: 'Start anywhere. The reading finds you.',
        sub: "Low states are not obstacles to learning — they're often the entry point. Pick one program. Open one page.",
      };
    if (good.some((w) => word.includes(w)))
      return {
        headline: 'Good moment to go deeper.',
        sub: 'Use the clarity. Pick what pulls you. Each program is a tool — not a course, not a commitment. One page at a time.',
      };
  } catch {}
  return {
    headline: 'Every state is information.',
    sub: 'This is where you learn to read it, use it, and move through it. Pick any program. Open one page. That is enough.',
  };
}

/* ── Swim card ───────────────────────────────────────────────── */
function SwimCard({
  program,
  onOpen,
  startHere,
  cardColor,
}: {
  program: Program;
  onOpen: () => void;
  startHere?: boolean;
  cardColor: string;
}) {
  const c = cardColor;
  const progress = getProgress(program);
  const total = program.segments.length;
  const pct = total > 0 ? progress / total : 0;
  const started = progress > 0;
  const R = 22;
  const circumference = 2 * Math.PI * R;

  return (
    <button
      type="button"
      onClick={onOpen}
      style={{
        flexShrink: 0,
        width: 136,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
        background: col(c, 0.08),
        border: `1px solid ${col(c, started ? 0.35 : 0.2)}`,
        borderRadius: 16,
        cursor: 'pointer',
        padding: '18px 10px 14px',
        boxShadow: started ? `0 0 20px ${col(c, 0.14)}` : 'none',
        position: 'relative',
        transition: 'opacity 0.15s',
      }}
    >
      {/* start here badge */}
      {startHere && !started && (
        <div
          style={{
            position: 'absolute',
            top: -9,
            left: '50%',
            transform: 'translateX(-50%)',
            background: col(c, 0.9),
            borderRadius: 999,
            padding: '2px 10px',
            fontFamily: SERIF,
            fontSize: 8.5,
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'rgba(10,6,3,0.9)',
            whiteSpace: 'nowrap',
          }}
        >
          start here
        </div>
      )}

      {/* progress ring */}
      <div style={{ position: 'relative', width: 52, height: 52, flexShrink: 0 }}>
        <svg
          width="52"
          height="52"
          style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}
        >
          <circle cx="26" cy="26" r={R} fill="none" stroke={col(c, 0.18)} strokeWidth="2.5" />
          {started && (
            <circle
              cx="26"
              cy="26"
              r={R}
              fill="none"
              stroke={col(c, 0.85)}
              strokeWidth="2.5"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - pct)}
              strokeLinecap="round"
            />
          )}
        </svg>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: 11,
              height: 11,
              borderRadius: '50%',
              background: c,
              opacity: started ? 0.9 : 0.6,
            }}
          />
        </div>
      </div>

      <div
        style={{
          fontFamily: SERIF,
          fontSize: 12.5,
          fontWeight: 700,
          color: cream(0.88),
          textAlign: 'center',
          lineHeight: 1.35,
        }}
      >
        {program.domain}
      </div>

      <div style={{ fontFamily: SERIF, fontSize: 10, color: col(c, 0.6), letterSpacing: '0.04em' }}>
        {started ? `${progress} / ${total}` : `${total} pages`}
      </div>
    </button>
  );
}

/* ── Hub palettes ────────────────────────────────────────────── */
function ProgramImageCard({
  program,
  onOpen,
  startHere,
  cardColor,
}: {
  program: Program;
  onOpen: () => void;
  startHere?: boolean;
  cardColor: string;
}) {
  const c = cardColor;
  const progress = getProgress(program);
  const total = program.segments.length;
  const started = progress > 0;
  const coverPanel = PROGRAM_COVER_PANEL[program.key] ?? 0;
  const imageSrc = POSITIVE_OVERLAY_PROGRAMS.has(program.key)
    ? `/comics/${program.key}/variants/positive-overlay/panel-${coverPanel}.png`
    : COMIC_PROGRAMS.has(program.key)
      ? `/comics/${program.key}/panel-${coverPanel}.${JPG_PANEL_PROGRAMS.has(program.key) ? 'jpg' : 'png'}`
      : EDUCATION_IMAGES[0];

  return (
    <button
      type="button"
      onClick={onOpen}
      style={{
        flexShrink: 0,
        width: 176,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        background: col(c, 0.08),
        border: `1px solid ${col(c, started ? 0.35 : 0.2)}`,
        borderRadius: 0,
        cursor: 'pointer',
        padding: 8,
        boxShadow: started ? `0 0 20px ${col(c, 0.14)}` : 'none',
        position: 'relative',
        textAlign: 'left',
      }}
    >
      {startHere && !started && (
        <div
          style={{
            position: 'absolute',
            top: -9,
            left: 12,
            background: col(c, 0.9),
            borderRadius: 999,
            padding: '2px 10px',
            fontFamily: SERIF,
            fontSize: 8.5,
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'rgba(10,6,3,0.9)',
            whiteSpace: 'nowrap',
          }}
        >
          start here
        </div>
      )}

      <div
        style={{
          width: '100%',
          height: 104,
          overflow: 'hidden',
          background: 'rgba(10,6,3,0.18)',
          border: `1px solid ${col(c, 0.16)}`,
        }}
      >
        {GENERATED_COVER_PROGRAMS.has(program.key) ? (
          <GeneratedProgramCover color={c} />
        ) : (
          <img
            src={imageSrc}
            alt=""
            style={{ display: 'block', width: '100%', height: '100%', objectFit: 'contain' }}
          />
        )}
      </div>

      <div style={{ padding: '2px 2px 0' }}>
        <div
          style={{
            fontFamily: SERIF,
            fontSize: 13,
            fontWeight: 700,
            color: cream(0.9),
            lineHeight: 1.28,
          }}
        >
          {program.domain}
        </div>
        <div
          style={{
            fontFamily: SERIF,
            fontSize: 9.5,
            color: col(c, 0.66),
            letterSpacing: '0.04em',
            marginTop: 5,
          }}
        >
          {started ? `${progress} / ${total}` : `${total} pages`}
        </div>
      </div>
    </button>
  );
}

function EducationWorldCard({
  world,
  onOpen,
}: {
  world: (typeof EDUCATION_WORLDS)[number];
  onOpen: () => void;
}) {
  function openWorld() {
    onOpen();
    if (world.kind === 'link') window.location.assign(world.href);
  }

  return (
    <button
      type="button"
      onClick={openWorld}
      style={{
        flexShrink: 0,
        width: 194,
        minHeight: 118,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 12,
        padding: 12,
        border: `1px solid ${col(world.tint, 0.28)}`,
        background: `linear-gradient(135deg, ${col(world.tint, 0.16)}, rgba(255,255,255,0.035))`,
        color: cream(0.88),
        textAlign: 'left',
        cursor: 'pointer',
        boxShadow: `inset 0 0 28px ${col(world.tint, 0.08)}`,
      }}
    >
      <div>
        <div
          style={{
            fontFamily: SERIF,
            fontSize: 9.5,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: col(world.tint, 0.78),
            marginBottom: 8,
          }}
        >
          {world.label}
        </div>
        <div
          style={{
            fontFamily: SERIF,
            fontSize: 18,
            fontWeight: 700,
            lineHeight: 1.02,
            color: cream(0.94),
          }}
        >
          {world.title}
        </div>
      </div>
      <div style={{ fontSize: 11.5, lineHeight: 1.45, color: cream(0.62) }}>{world.body}</div>
    </button>
  );
}

const HUB_PALETTES = [
  { id: 'brown', bg: 'rgba(18,10,4,0.99)', dot: '#3E1A08' },
  { id: 'navy', bg: 'rgba(2,4,14,0.99)', dot: '#0A1830' },
  { id: 'forest', bg: 'rgba(2,6,2,0.99)', dot: '#102010' },
  { id: 'burgundy', bg: 'rgba(10,2,6,0.99)', dot: '#300C18' },
  { id: 'slate', bg: 'rgba(6,8,10,0.99)', dot: '#202830' },
] as const;
type HubPaletteId = (typeof HUB_PALETTES)[number]['id'];
const HUB_LS = 'colourmap-learn-palette';
type HomeDisplayMode = 'blocks' | 'images';
const HOME_DISPLAY_LS = 'colourmap-learn-home-display';
function loadHubPalette(): HubPaletteId {
  try {
    return (localStorage.getItem(HUB_LS) ?? 'brown') as HubPaletteId;
  } catch {
    return 'brown';
  }
}
function loadHomeDisplayMode(): HomeDisplayMode {
  try {
    const saved = localStorage.getItem(HOME_DISPLAY_LS);
    return saved === 'images' ? 'images' : 'blocks';
  } catch {
    return 'blocks';
  }
}

export default function LearningHub({ onClose }: { onClose: () => void }) {
  const [active, setActive] = useState<Program | null>(null);
  const [personalityOpen, setPersonalityOpen] = useState(false);
  const [hubPalId, setHubPalId] = useState<HubPaletteId>(loadHubPalette);
  const [homeDisplay, setHomeDisplay] = useState<HomeDisplayMode>(loadHomeDisplayMode);
  const hubBg = HUB_PALETTES.find((p) => p.id === hubPalId)?.bg ?? 'rgba(18,10,4,0.99)';
  const heroImage = useMemo(
    () => EDUCATION_IMAGES[Math.floor(Math.random() * EDUCATION_IMAGES.length)],
    [],
  );
  const opening = useMemo(() => getOpening(), []);

  function pickPalette(id: HubPaletteId) {
    setHubPalId(id);
    try {
      localStorage.setItem(HUB_LS, id);
    } catch {}
  }

  function pickHomeDisplay(mode: HomeDisplayMode) {
    setHomeDisplay(mode);
    try {
      localStorage.setItem(HOME_DISPLAY_LS, mode);
    } catch {}
  }

  const byKey = Object.fromEntries(PROGRAMS.map((p) => [p.key, p]));

  if (active) {
    if (COMIC_PROGRAMS.has(active.key)) {
      return (
        <ComicProgram
          program={active}
          onClose={() => setActive(null)}
          onBack={() => setActive(null)}
          hubBg={hubBg}
        />
      );
    }
    return (
      <LearningProgram
        program={active}
        onClose={() => setActive(null)}
        onBack={() => setActive(null)}
        hubBg={hubBg}
      />
    );
  }

  if (personalityOpen) {
    return (
      <PersonalityTypeProgram
        onClose={onClose}
        onBack={() => setPersonalityOpen(false)}
        hubBg={hubBg}
      />
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 80,
        display: 'flex',
        justifyContent: 'center',
        background: 'rgba(4,2,0,0.6)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 672,
          background: hubBg,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
      >
        {/* Hero image */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            minHeight: 160,
            flexShrink: 0,
            overflow: 'visible',
            background: 'rgba(10,6,3,0.2)',
          }}
        >
          <img
            src={heroImage}
            alt=""
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: `linear-gradient(to bottom, transparent 40%, ${hubBg}88 100%)`,
              pointerEvents: 'none',
            }}
          />
        </div>

        {/* Title below image */}
        <div style={{ textAlign: 'center', padding: '18px 20px 0', flexShrink: 0 }}>
          <div
            style={{
              fontFamily: SERIF,
              fontSize: 10,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: och(0.4),
              marginBottom: 4,
            }}
          >
            Colourmap
          </div>
          <div
            style={{
              fontFamily: SERIF,
              fontSize: 32,
              fontWeight: 700,
              color: cream(0.92),
              letterSpacing: '-0.02em',
              lineHeight: 1,
            }}
          >
            Education
          </div>
        </div>

        {/* Header — palette + close */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 20px',
            borderBottom: `1px solid ${och(0.12)}`,
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', gap: 6 }}>
            {(['blocks', 'images'] as HomeDisplayMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => pickHomeDisplay(mode)}
                style={{
                  borderRadius: 999,
                  border: `1px solid ${och(homeDisplay === mode ? 0.42 : 0.18)}`,
                  background: och(homeDisplay === mode ? 0.14 : 0.04),
                  color: cream(homeDisplay === mode ? 0.86 : 0.48),
                  fontFamily: SERIF,
                  fontSize: 10.5,
                  letterSpacing: '0.08em',
                  cursor: 'pointer',
                  padding: '5px 10px',
                  textTransform: 'uppercase',
                }}
              >
                {mode}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', gap: 5 }}>
              {HUB_PALETTES.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => pickPalette(p.id)}
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    background: p.dot,
                    border:
                      hubPalId === p.id
                        ? '1.5px solid rgba(196,160,96,0.8)'
                        : '1px solid rgba(196,160,96,0.2)',
                    cursor: 'pointer',
                    padding: 0,
                    flexShrink: 0,
                  }}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'none',
                border: `1px solid ${och(0.22)}`,
                borderRadius: 999,
                color: och(0.45),
                fontFamily: SERIF,
                fontSize: 11,
                letterSpacing: '0.1em',
                cursor: 'pointer',
                padding: '5px 14px',
              }}
            >
              close
            </button>
          </div>
        </div>

        {/* Opening statement — dynamic */}
        <div style={{ padding: '16px 20px 4px', flexShrink: 0 }}>
          <p
            style={{
              fontFamily: SERIF,
              fontSize: 15,
              color: cream(0.82),
              lineHeight: 1.7,
              margin: '0 0 6px',
              fontWeight: 600,
            }}
          >
            {opening.headline}
          </p>
        </div>

        {/* Programs — swim lanes with group tints */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 0 40px' }}>
          <div style={{ marginBottom: 32 }}>
            <div style={{ paddingLeft: 20, marginBottom: 14 }}>
              <div
                style={{
                  fontFamily: SERIF,
                  fontSize: 14,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: och(0.68),
                }}
              >
                Knowledge worlds
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                gap: 10,
                overflowX: 'auto',
                paddingLeft: 20,
                paddingRight: 20,
                paddingBottom: 6,
                scrollbarWidth: 'none',
              }}
            >
              {EDUCATION_WORLDS.map((world) => (
                <EducationWorldCard
                  key={world.href}
                  world={world}
                  onOpen={() => {
                    if (world.kind === 'personality') setPersonalityOpen(true);
                    else onClose();
                  }}
                />
              ))}
            </div>
          </div>

          {GROUPS.map((group) => {
            const programs = group.keys.map((k) => byKey[k]).filter(Boolean);
            if (!programs.length) return null;
            return (
              <div key={group.label} style={{ marginBottom: 32 }}>
                {/* group label */}
                <div style={{ paddingLeft: 20, marginBottom: 14 }}>
                  <div
                    style={{
                      fontFamily: SERIF,
                      fontSize: 14,
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: col(group.tint, 0.75),
                    }}
                  >
                    {group.label}
                  </div>
                </div>

                {/* horizontal scroll lane */}
                <div
                  style={{
                    display: 'flex',
                    gap: 10,
                    overflowX: 'auto',
                    paddingLeft: 20,
                    paddingRight: 20,
                    paddingBottom: 6,
                    scrollbarWidth: 'none',
                  }}
                >
                  {programs.map((p, i) =>
                    homeDisplay === 'images' ? (
                      <ProgramImageCard
                        key={p.key}
                        program={p}
                        onOpen={() => setActive(p)}
                        startHere={group.startHere === p.key}
                        cardColor={progressionColor(group.tint, i, programs.length)}
                      />
                    ) : (
                      <SwimCard
                        key={p.key}
                        program={p}
                        onOpen={() => setActive(p)}
                        startHere={group.startHere === p.key}
                        cardColor={progressionColor(group.tint, i, programs.length)}
                      />
                    ),
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

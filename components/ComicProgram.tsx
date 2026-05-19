'use client';

import { useState } from 'react';
import type { Program } from '@/lib/programs';

const SERIF = 'var(--font-serif)';
const cream = (a: number) => `rgba(240,216,152,${a})`;

type ImageStyle = {
  key: string;
  label: string;
};

const DEFAULT_IMAGE_STYLE: ImageStyle = { key: 'default', label: 'Warm paper' };
const POSITIVE_OVERLAY_STYLE: ImageStyle = { key: 'positive-overlay', label: 'Positive' };

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

const TEXT_ON_IMAGE_PROGRAMS = new Set([
  'agency',
  'creativity',
  'deep-attention',
  'identity-becoming',
]);

const BLANK_BUBBLE_PROGRAMS = new Set(['carl-jung']);
const JPG_PANEL_PROGRAMS = new Set(['carl-jung', 'struggle-letting-go']);
const LAYERED_BUBBLE_PROGRAMS = new Set(['carl-jung', 'paulo-freire', 'thich-nhat-hanh', 'gandhi']);
const LANDSCAPE_LAYERED_PROGRAMS = new Set(['thich-nhat-hanh']);
const LIFE_GUIDE_PROGRAMS = new Set(['carl-jung', 'paulo-freire', 'thich-nhat-hanh', 'gandhi']);
const GENERATED_LAYERED_PANEL_COUNTS: Record<string, number> = {
  'carl-jung': 20,
  'paulo-freire': 2,
  'thich-nhat-hanh': 2,
  gandhi: 20,
};

const PROGRAM_IMAGE_STYLES: Record<string, ImageStyle[]> = {
  'carl-jung': [
    { key: 'default', label: 'Clean layer' },
    { key: 'blank-bubbles', label: 'Empty bubbles' },
  ],
  'hope-energy': [DEFAULT_IMAGE_STYLE, { key: 'euro-bd', label: 'European BD' }],
  'emotional-intelligence': [DEFAULT_IMAGE_STYLE, { key: 'minimal', label: 'Minimal' }],
};

const THREE_PART_GUIDES = new Set(['carl-jung', 'gandhi']);
const GUIDE_PARTS = [
  { label: 'Part 1', start: 0, end: 5 },
  { label: 'Part 2', start: 6, end: 12 },
  { label: 'Part 3', start: 13, end: 19 },
];

function getImageStyles(programKey: string): ImageStyle[] {
  const styles = PROGRAM_IMAGE_STYLES[programKey] ?? [DEFAULT_IMAGE_STYLE];
  if (!POSITIVE_OVERLAY_PROGRAMS.has(programKey)) return styles;
  if (styles.some((style) => style.key === POSITIVE_OVERLAY_STYLE.key)) return styles;
  return [POSITIVE_OVERLAY_STYLE, ...styles];
}

function col(color: string, a: number) {
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}

function hex2rgb(color: string) {
  return {
    r: parseInt(color.slice(1, 3), 16),
    g: parseInt(color.slice(3, 5), 16),
    b: parseInt(color.slice(5, 7), 16),
  };
}

function toParagraphs(text: string): string[] {
  if (text.includes('\n\n')) return text.split('\n\n').filter(Boolean);
  const sentences = text.match(/[^.!?]+[.!?]+["']?/g) ?? [text];
  const paras: string[] = [];
  for (let i = 0; i < sentences.length; i += 2) {
    paras.push(
      sentences
        .slice(i, i + 2)
        .join(' ')
        .trim(),
    );
  }
  return paras.filter(Boolean);
}

function conciseLesson(text: string) {
  const sentences = text.match(/[^.!?]+[.!?]/g) ?? [text];
  return sentences.slice(0, 2).join(' ').trim();
}

/* ── Generative panel art — one composition per segment index ── */
function PanelArt({ index, color }: { index: number; color: string }) {
  const { r, g, b } = hex2rgb(color);
  const c = `rgb(${r},${g},${b})`;
  const cm = `rgba(${r},${g},${b}`;

  const scenes = [
    /* 0 — Signal : concentric rings emanating from heart */
    <svg
      key={0}
      viewBox="0 0 400 260"
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid slice"
    >
      <rect
        width="400"
        height="260"
        fill={`rgb(${Math.max(r - 60, 0)},${Math.max(g - 60, 0)},${Math.max(b - 60, 0)})`}
      />
      <rect width="400" height="260" fill="black" opacity="0.55" />
      {[180, 140, 100, 62, 32].map((radius, i) => (
        <circle
          key={i}
          cx="200"
          cy="130"
          r={radius}
          fill="none"
          stroke={c}
          strokeWidth={i === 4 ? 2 : 1}
          opacity={[0.08, 0.12, 0.18, 0.32, 0.75][i]}
        />
      ))}
      <circle cx="200" cy="130" r="10" fill={c} opacity="0.9" />
      <line x1="200" y1="0" x2="200" y2="260" stroke={c} strokeWidth="0.5" opacity="0.07" />
      <line x1="0" y1="130" x2="400" y2="130" stroke={c} strokeWidth="0.5" opacity="0.07" />
    </svg>,

    /* 1 — Three layers : sensation / thought / impulse */
    <svg
      key={1}
      viewBox="0 0 400 260"
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid slice"
    >
      <rect width="400" height="260" fill="black" />
      <ellipse cx="160" cy="130" rx="110" ry="80" fill={`${cm},0.18)`} stroke={c} strokeWidth="1" />
      <ellipse cx="200" cy="130" rx="110" ry="80" fill={`${cm},0.14)`} stroke={c} strokeWidth="1" />
      <ellipse cx="240" cy="130" rx="110" ry="80" fill={`${cm},0.18)`} stroke={c} strokeWidth="1" />
      {/* intersection labels */}
      <text
        x="120"
        y="134"
        textAnchor="middle"
        fontFamily="serif"
        fontSize="9"
        fill={c}
        opacity="0.55"
      >
        sensation
      </text>
      <text
        x="200"
        y="110"
        textAnchor="middle"
        fontFamily="serif"
        fontSize="9"
        fill={c}
        opacity="0.75"
      >
        thought
      </text>
      <text
        x="280"
        y="134"
        textAnchor="middle"
        fontFamily="serif"
        fontSize="9"
        fill={c}
        opacity="0.55"
      >
        impulse
      </text>
    </svg>,

    /* 2 — Label : precise word emerging from fog */
    <svg
      key={2}
      viewBox="0 0 400 260"
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <radialGradient id="fog2" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor={c} stopOpacity="0.22" />
          <stop offset="100%" stopColor="black" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="260" fill="black" />
      <rect width="400" height="260" fill="url(#fog2)" />
      {/* blurred word fragments */}
      {['anxious', 'unsure', 'heavy', 'lost', 'afraid'].map((word, i) => (
        <text
          key={i}
          x={50 + i * 70}
          y={80 + (i % 3) * 40}
          fontFamily="serif"
          fontSize="11"
          fill={c}
          opacity={0.08 + i * 0.04}
          transform={`rotate(${-8 + i * 4}, ${80 + i * 70}, ${80 + (i % 3) * 40})`}
        >
          {word}
        </text>
      ))}
      {/* sharp label */}
      <rect
        x="130"
        y="105"
        width="140"
        height="38"
        rx="3"
        fill="none"
        stroke={c}
        strokeWidth="1.5"
        opacity="0.8"
      />
      <text
        x="200"
        y="129"
        textAnchor="middle"
        fontFamily="serif"
        fontSize="16"
        fontWeight="bold"
        fill={c}
        opacity="0.95"
      >
        shame
      </text>
    </svg>,

    /* 3 — Scale : vertical spectrum of states */
    <svg
      key={3}
      viewBox="0 0 400 260"
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="scale3" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={c} stopOpacity="0.9" />
          <stop offset="50%" stopColor={c} stopOpacity="0.35" />
          <stop offset="100%" stopColor="black" stopOpacity="0.6" />
        </linearGradient>
      </defs>
      <rect width="400" height="260" fill="black" />
      <rect x="194" y="20" width="12" height="220" rx="6" fill="url(#scale3)" />
      {[
        { y: 30, label: 'peace', op: 0.9 },
        { y: 68, label: 'joy', op: 0.8 },
        { y: 106, label: 'courage', op: 0.65 },
        { y: 144, label: 'anger', op: 0.45 },
        { y: 182, label: 'fear', op: 0.3 },
        { y: 220, label: 'shame', op: 0.18 },
      ].map(({ y, label, op }) => (
        <g key={label}>
          <line x1="206" y1={y} x2="224" y2={y} stroke={c} strokeWidth="1" opacity={op} />
          <text x="228" y={y + 4} fontFamily="serif" fontSize="10" fill={c} opacity={op}>
            {label}
          </text>
        </g>
      ))}
    </svg>,

    /* 4 — Decision fork : emotion colours the path */
    <svg
      key={4}
      viewBox="0 0 400 260"
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid slice"
    >
      <rect width="400" height="260" fill="black" />
      {/* stem */}
      <line x1="200" y1="240" x2="200" y2="140" stroke={c} strokeWidth="2" opacity="0.6" />
      {/* branches */}
      <path d="M200,140 Q160,110 120,80" fill="none" stroke={c} strokeWidth="1.5" opacity="0.7" />
      <path d="M200,140 Q240,110 280,80" fill="none" stroke={c} strokeWidth="1.5" opacity="0.7" />
      <path
        d="M200,140 Q200,110 200,80"
        fill="none"
        stroke={c}
        strokeWidth="1"
        opacity="0.35"
        strokeDasharray="4 3"
      />
      {/* emotion cloud */}
      <circle
        cx="200"
        cy="160"
        r="28"
        fill={`${cm},0.12)`}
        stroke={c}
        strokeWidth="1"
        opacity="0.5"
      />
      <text
        x="200"
        y="164"
        textAnchor="middle"
        fontFamily="serif"
        fontSize="9"
        fill={c}
        opacity="0.75"
      >
        emotion
      </text>
      {/* endpoints */}
      <circle cx="120" cy="78" r="5" fill={c} opacity="0.7" />
      <circle cx="280" cy="78" r="5" fill={c} opacity="0.7" />
      <circle cx="200" cy="78" r="3" fill={c} opacity="0.3" />
    </svg>,

    /* 5 — Resilience weave : three interlocking threads */
    <svg
      key={5}
      viewBox="0 0 400 260"
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid slice"
    >
      <rect width="400" height="260" fill="black" />
      {/* three woven paths */}
      <path
        d="M0,100 C80,60 160,160 240,100 S360,60 400,100"
        fill="none"
        stroke={c}
        strokeWidth="1.5"
        opacity="0.7"
      />
      <path
        d="M0,130 C80,170 160,90 240,130 S360,170 400,130"
        fill="none"
        stroke={c}
        strokeWidth="1.5"
        opacity="0.5"
      />
      <path
        d="M0,160 C80,120 160,200 240,160 S360,120 400,160"
        fill="none"
        stroke={c}
        strokeWidth="1"
        opacity="0.35"
      />
      {/* anchor points */}
      {[0, 80, 160, 240, 320, 400].map((x, i) => (
        <circle key={i} cx={x} cy={130} r="2.5" fill={c} opacity="0.4" />
      ))}
      {/* label */}
      <text
        x="200"
        y="228"
        textAnchor="middle"
        fontFamily="serif"
        fontSize="10"
        fontStyle="italic"
        fill={c}
        opacity="0.45"
      >
        meaning · agency · connection
      </text>
    </svg>,
  ];

  return (
    <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
      {scenes[index % scenes.length]}
    </div>
  );
}

/* ── Panel image — real file if exists, SVG art fallback ───────── */
function PanelImage({
  programKey,
  index,
  color,
  imageStyle,
  alt = '',
}: {
  programKey: string;
  index: number;
  color: string;
  imageStyle?: string;
  alt?: string;
}) {
  const [failed, setFailed] = useState(false);
  const generatedCount = GENERATED_LAYERED_PANEL_COUNTS[programKey];
  if (imageStyle && imageStyle !== 'default' && !failed) {
    const extension = JPG_PANEL_PROGRAMS.has(programKey) ? 'jpg' : 'png';
    return (
      <img
        src={`/comics/${programKey}/variants/${imageStyle}/panel-${index}.${extension}`}
        alt={alt}
        onError={() => setFailed(true)}
        style={{
          width: '100%',
          height: 'auto',
          display: 'block',
          background: 'rgba(10,6,3,0.24)',
        }}
      />
    );
  }
  if (generatedCount && !failed) {
    return (
      <img
        src={`/comics/${programKey}/generated/panel-${index % generatedCount}.png`}
        alt={alt}
        onError={() => setFailed(true)}
        style={{
          width: '100%',
          height: 'auto',
          display: 'block',
          background: 'rgba(10,6,3,0.24)',
        }}
      />
    );
  }
  if (programKey === 'thich-nhat-hanh') {
    return <ThichBasePanel index={index} color={color} />;
  }
  if (programKey === 'paulo-freire') {
    return <FreireBasePanel index={index} color={color} />;
  }
  if (programKey === 'carl-jung') {
    return <CarlJungBasePanel index={index} color={color} />;
  }
  const extension = JPG_PANEL_PROGRAMS.has(programKey) ? 'jpg' : 'png';
  const src = `/comics/${programKey}/panel-${index}.${extension}`;
  if (!failed) {
    return (
      <img
        src={src}
        alt={alt}
        onError={() => setFailed(true)}
        style={{
          width: '100%',
          height: 'auto',
          display: 'block',
          background: 'rgba(10,6,3,0.24)',
        }}
      />
    );
  }
  return <PanelArt index={index} color={color} />;
}

function FreireBasePanel({ index, color }: { index: number; color: string }) {
  const scenes = [
    { path: 'M44 418 C112 360, 181 382, 258 330 C320 289, 352 244, 389 196', sun: [334, 132] },
    { path: 'M34 384 C98 330, 164 330, 222 288 C282 245, 332 218, 398 214', sun: [300, 128] },
    { path: 'M40 430 C98 374, 150 368, 214 334 C289 294, 338 248, 408 226', sun: [330, 154] },
    { path: 'M34 398 C92 356, 150 386, 220 328 C286 274, 338 256, 400 214', sun: [322, 132] },
  ];
  const scene = scenes[index % scenes.length];
  const people = [
    { x: 86, y: 402, scale: 1.04, tone: '#5C3018', shape: 'dress' },
    { x: 136, y: 384, scale: 0.94, tone: '#6b4429', shape: 'coat' },
    { x: 190, y: 400, scale: 1.08, tone: '#50301f', shape: 'wide' },
    { x: 246, y: 372, scale: 0.9, tone: '#7a5438', shape: 'dress' },
    { x: 300, y: 346, scale: 1.02, tone: '#573621', shape: 'coat' },
    { x: 342, y: 368, scale: 0.82, tone: '#66503a', shape: 'dress' },
  ];

  return (
    <svg
      viewBox="0 0 430 620"
      role="img"
      aria-label={`Paulo Freire symbolic comic panel ${index + 1}`}
      style={{ display: 'block', width: '100%', height: 'auto', background: '#20120c' }}
    >
      <defs>
        <radialGradient id={`freire-sun-${index}`} cx="70%" cy="22%" r="54%">
          <stop offset="0%" stopColor={color} stopOpacity="0.55" />
          <stop offset="100%" stopColor="#ead8b4" stopOpacity="0" />
        </radialGradient>
        <filter id={`freire-grain-${index}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" seed={index + 21} />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="table" tableValues="0 0.08" />
          </feComponentTransfer>
        </filter>
      </defs>
      <rect width="430" height="620" fill="#ead8b4" />
      <rect width="430" height="620" fill={`url(#freire-sun-${index})`} />
      <rect width="430" height="620" filter={`url(#freire-grain-${index})`} />

      <g opacity="0.12" stroke="#5C3018" strokeWidth="1.2" fill="none">
        <path d="M42 72h152M42 94h102" />
        <path d="M270 470h94M286 496h70" />
        <circle cx={scene.sun[0]} cy={scene.sun[1]} r="54" />
        <circle cx={scene.sun[0]} cy={scene.sun[1]} r="86" />
      </g>

      <path d={scene.path} fill="none" stroke="#5C3018" strokeWidth="4" opacity="0.18" />
      <path
        d={scene.path}
        fill="none"
        stroke={color}
        strokeWidth="10"
        strokeLinecap="round"
        opacity="0.32"
      />

      <g opacity="0.4">
        <path
          d="M60 512 C108 476, 159 500, 205 468 C263 428, 306 444, 370 402"
          fill="none"
          stroke="#6B7A50"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M78 532 C126 510, 169 528, 224 496 C281 464, 318 472, 384 438"
          fill="none"
          stroke="#6888B0"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </g>

      {people.map((person) => (
        <g
          key={`${person.x}-${person.y}`}
          transform={`translate(${person.x} ${person.y}) scale(${person.scale})`}
        >
          <circle cx="0" cy="-32" r="12" fill="#f7e8c8" stroke={person.tone} strokeWidth="2" />
          {person.shape === 'dress' ? (
            <path
              d="M-16 4 L0 -20 L16 4 L10 42 H-10 Z"
              fill="none"
              stroke={person.tone}
              strokeWidth="3"
            />
          ) : person.shape === 'wide' ? (
            <path
              d="M-20 -17 C-10 -3, 10 -3, 20 -17 M-15 -8 V40 M15 -8 V40"
              fill="none"
              stroke={person.tone}
              strokeWidth="3"
            />
          ) : (
            <path
              d="M0 -20 V42 M-18 -6 H18 M-11 42 L-22 68 M11 42 L22 68"
              fill="none"
              stroke={person.tone}
              strokeWidth="3"
            />
          )}
        </g>
      ))}

      <g fill={color} opacity="0.55">
        <circle cx="86" cy="274" r="4" />
        <circle cx="146" cy="250" r="4" />
        <circle cx="220" cy="232" r="4" />
        <circle cx="284" cy="196" r="4" />
      </g>
    </svg>
  );
}

function ThichBasePanel({ index, color }: { index: number; color: string }) {
  const scenes = [
    {
      sun: [116, 82],
      river: 'M0 258 C120 220, 212 288, 344 246 S548 208, 640 238',
      tree: [488, 222],
    },
    {
      sun: [524, 74],
      river: 'M0 244 C92 214, 176 236, 266 214 S430 160, 640 190',
      tree: [146, 220],
    },
    {
      sun: [326, 78],
      river: 'M0 274 C108 230, 222 256, 328 230 S514 212, 640 248',
      tree: [520, 204],
    },
    {
      sun: [92, 96],
      river: 'M0 232 C132 206, 230 226, 336 198 S512 168, 640 202',
      tree: [300, 214],
    },
  ];
  const scene = scenes[index % scenes.length];
  const people = [
    { x: 170, y: 238, scale: 0.85, tone: '#5C3018', shape: 'dress' },
    { x: 218, y: 246, scale: 0.74, tone: '#6B7A50', shape: 'coat' },
    { x: 430, y: 232, scale: 0.78, tone: '#7A5438', shape: 'wide' },
    { x: 474, y: 244, scale: 0.7, tone: '#4f3a2b', shape: 'dress' },
  ];

  return (
    <svg
      viewBox="0 0 640 360"
      role="img"
      aria-label={`Thich Nhat Hanh landscape comic panel ${index + 1}`}
      style={{ display: 'block', width: '100%', height: 'auto', background: '#ead8b4' }}
    >
      <defs>
        <linearGradient id={`thich-sky-${index}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f2dfba" />
          <stop offset="100%" stopColor="#d9c190" />
        </linearGradient>
        <radialGradient id={`thich-light-${index}`} cx="50%" cy="22%" r="68%">
          <stop offset="0%" stopColor={color} stopOpacity="0.34" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
        <filter id={`thich-grain-${index}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.62" numOctaves="2" seed={index + 44} />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="table" tableValues="0 0.06" />
          </feComponentTransfer>
        </filter>
      </defs>
      <rect width="640" height="360" fill={`url(#thich-sky-${index})`} />
      <rect width="640" height="360" fill={`url(#thich-light-${index})`} />
      <rect width="640" height="360" filter={`url(#thich-grain-${index})`} />

      <g opacity="0.16" stroke="#5C3018" strokeWidth="1" fill="none">
        <circle cx={scene.sun[0]} cy={scene.sun[1]} r="32" />
        <circle cx={scene.sun[0]} cy={scene.sun[1]} r="56" />
        <path d="M54 78h118M466 302h92" />
      </g>

      <g fill="none" strokeLinecap="round">
        <path
          d="M0 236 C110 190, 200 210, 286 188 S498 142, 640 166"
          stroke="#6B7A50"
          strokeWidth="18"
          opacity="0.14"
        />
        <path d={scene.river} stroke="#6888B0" strokeWidth="20" opacity="0.22" />
        <path d={scene.river} stroke="#fff7dc" strokeWidth="4" opacity="0.42" />
        <path
          d="M0 310 C150 294, 256 330, 410 296 S568 284, 640 306"
          stroke="#5C3018"
          strokeWidth="2"
          opacity="0.13"
        />
      </g>

      <g transform={`translate(${scene.tree[0]} ${scene.tree[1]})`}>
        <path
          d="M0 52 V-28"
          stroke="#5C3018"
          strokeWidth="5"
          strokeLinecap="round"
          opacity="0.72"
        />
        <path
          d="M0 -12 C-34 -44, -70 -22, -62 10 C-30 12, -18 0, 0 -12Z"
          fill="#6B7A50"
          opacity="0.45"
        />
        <path d="M0 -18 C34 -56, 78 -28, 66 8 C36 14, 18 2, 0 -18Z" fill="#7A8A50" opacity="0.5" />
        <path
          d="M0 -34 C-18 -70, 28 -78, 42 -42 C30 -20, 16 -26, 0 -34Z"
          fill={color}
          opacity="0.26"
        />
      </g>

      {people.map((person) => (
        <g
          key={`${person.x}-${person.y}`}
          transform={`translate(${person.x} ${person.y}) scale(${person.scale})`}
        >
          <circle cx="0" cy="-24" r="10" fill="#f7e8c8" stroke={person.tone} strokeWidth="2" />
          {person.shape === 'dress' ? (
            <path
              d="M-14 34 L0 -12 L14 34 M-10 34 L-16 54 M10 34 L16 54"
              fill="none"
              stroke={person.tone}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : person.shape === 'wide' ? (
            <path
              d="M-17 -2 C-8 8, 8 8, 17 -2 M-12 6 V34 M12 6 V34 M-8 34 L-18 54 M8 34 L18 54"
              fill="none"
              stroke={person.tone}
              strokeWidth="3"
              strokeLinecap="round"
            />
          ) : (
            <path
              d="M0 -12 V34 M-16 2 H16 M-9 34 L-20 54 M9 34 L20 54"
              fill="none"
              stroke={person.tone}
              strokeWidth="3"
              strokeLinecap="round"
            />
          )}
          <path
            d="M-18 20 C-8 28, 8 28, 18 20"
            fill="none"
            stroke={color}
            strokeWidth="2"
            opacity="0.32"
          />
        </g>
      ))}

      <g fill={color} opacity="0.28">
        <circle cx="250" cy="130" r="4" />
        <circle cx="292" cy="120" r="3" />
        <circle cx="338" cy="132" r="4" />
        <circle cx="382" cy="112" r="3" />
      </g>
    </svg>
  );
}

function CarlJungBasePanel({ index, color }: { index: number; color: string }) {
  const pages = [
    'desk',
    'field',
    'shadow',
    'mask',
    'statues',
    'roots',
    'dream',
    'symbols',
    'knot',
    'path',
    'mirror',
    'dialogue',
    'stars',
    'mandala',
    'city',
    'phone',
    'studio',
    'relationship',
    'atlas',
    'sunrise',
  ];
  const scene = pages[index % pages.length];
  const line = '#4c2f1f';
  const paper = '#ead8b4';
  const warm = color;

  return (
    <svg
      viewBox="0 0 390 620"
      role="img"
      aria-label={`Blank Carl Jung comic page ${index + 1}`}
      style={{ display: 'block', width: '100%', height: 'auto', background: paper }}
    >
      <defs>
        <filter id={`grain-${index}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={index + 4} />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="table" tableValues="0 0.11" />
          </feComponentTransfer>
        </filter>
        <radialGradient id={`glow-${index}`} cx="50%" cy="18%" r="80%">
          <stop offset="0%" stopColor={warm} stopOpacity="0.24" />
          <stop offset="68%" stopColor="#f1dfbc" stopOpacity="0.04" />
          <stop offset="100%" stopColor="#1b1009" stopOpacity="0.08" />
        </radialGradient>
      </defs>

      <rect width="390" height="620" fill={paper} />
      <rect width="390" height="620" fill={`url(#glow-${index})`} />
      <rect width="390" height="620" filter={`url(#grain-${index})`} />

      <g fill="none" stroke={line} strokeLinecap="round" strokeLinejoin="round">
        {scene === 'desk' && (
          <>
            <path
              d="M76 369h238M106 369l-18 81M285 369l18 81M132 346c22-28 60-28 82 0M180 346c14-58 57-87 98-66"
              strokeWidth="5"
              opacity="0.72"
            />
            <path d="M81 275c45-31 91-31 136 0" strokeWidth="3" opacity="0.42" />
            <circle cx="276" cy="256" r="32" strokeWidth="4" opacity="0.55" />
          </>
        )}
        {scene === 'field' && (
          <>
            <path d="M54 372c70-41 137-41 202 0 28-18 55-26 82-22" strokeWidth="5" opacity="0.65" />
            <path
              d="M195 106v250M97 230c72-61 123-57 154 12M195 181c54-60 101-62 141-6"
              strokeWidth="4"
              opacity="0.55"
            />
          </>
        )}
        {scene === 'shadow' && (
          <>
            <path
              d="M196 127c48 0 82 40 82 96 0 76-38 124-82 170-44-46-82-94-82-170 0-56 34-96 82-96z"
              strokeWidth="5"
              opacity="0.7"
            />
            <path
              d="M201 157c47 18 68 62 51 132-11 45-34 77-51 96"
              strokeWidth="11"
              opacity="0.18"
            />
          </>
        )}
        {scene === 'mask' && (
          <>
            <path
              d="M94 155c56-50 147-50 203 0v103c0 62-46 98-101 128-55-30-102-66-102-128z"
              strokeWidth="5"
              opacity="0.68"
            />
            <path
              d="M132 225h54M211 225h54M155 300c31 17 60 17 88 0"
              strokeWidth="4"
              opacity="0.5"
            />
          </>
        )}
        {scene === 'statues' &&
          [86, 145, 204, 263, 322].map((x, i) => (
            <g key={x} opacity={0.48 + i * 0.04}>
              <circle cx={x} cy={176 + (i % 2) * 12} r="18" strokeWidth="4" />
              <path d={`M${x - 19} ${244 + (i % 2) * 10}h38l-9 98h-20z`} strokeWidth="4" />
            </g>
          ))}
        {scene === 'roots' && (
          <>
            <circle cx="195" cy="184" r="72" strokeWidth="5" opacity="0.54" />
            <path
              d="M195 256v145M195 309c-44-24-82-17-112 22M195 331c43-31 80-28 111 8M195 362c-31 9-55 30-72 63M195 384c36 6 62 27 78 63"
              strokeWidth="4"
              opacity="0.54"
            />
          </>
        )}
        {scene === 'dream' && (
          <>
            <path d="M70 336c45-62 89-62 134 0s89 62 134 0" strokeWidth="5" opacity="0.55" />
            <path
              d="M86 224c46-31 91-31 136 0M185 164c27-32 54-32 82 0M130 420c42-18 86-18 130 0"
              strokeWidth="4"
              opacity="0.4"
            />
          </>
        )}
        {scene === 'symbols' && (
          <>
            <circle cx="119" cy="196" r="42" strokeWidth="5" opacity="0.5" />
            <path
              d="M248 153l49 85h-98zM195 287l28 58 64 9-46 44 11 63-57-30-57 30 11-63-46-44 64-9z"
              strokeWidth="5"
              opacity="0.58"
            />
          </>
        )}
        {scene === 'knot' && (
          <>
            <path
              d="M118 254c54-85 129 63 183-22M118 332c54 85 129-63 183 22M116 293c68-42 88-42 160 0"
              strokeWidth="6"
              opacity="0.58"
            />
            <circle cx="195" cy="293" r="72" strokeWidth="3" opacity="0.28" />
          </>
        )}
        {scene === 'path' && (
          <>
            <path
              d="M55 492c74-122 131-238 140-382 16 145 72 262 140 382"
              strokeWidth="5"
              opacity="0.58"
            />
            <path d="M142 236h107M119 314h152M96 393h198" strokeWidth="3" opacity="0.32" />
          </>
        )}
        {scene === 'mirror' && (
          <>
            <path d="M116 118h158l42 65-121 222L74 183z" strokeWidth="5" opacity="0.58" />
            <path
              d="M116 118l79 287 79-287M134 257c39-26 83-26 122 0"
              strokeWidth="4"
              opacity="0.34"
            />
          </>
        )}
        {scene === 'dialogue' && (
          <>
            <circle cx="132" cy="278" r="44" strokeWidth="5" opacity="0.58" />
            <circle cx="260" cy="278" r="44" strokeWidth="5" opacity="0.58" />
            <path
              d="M176 278h40M132 322c17 52 60 78 128 78M260 234c-17-52-60-78-128-78"
              strokeWidth="4"
              opacity="0.38"
            />
          </>
        )}
        {scene === 'stars' && (
          <>
            <path
              d="M195 102l20 54 57 5-44 36 14 56-47-30-47 30 14-56-44-36 57-5z"
              strokeWidth="5"
              opacity="0.62"
            />
            <path
              d="M74 374c79-43 160-43 242 0M96 423c62-25 127-25 195 0"
              strokeWidth="4"
              opacity="0.35"
            />
            {[86, 128, 273, 313, 244].map((x, i) => (
              <circle key={x} cx={x} cy={136 + i * 32} r="4" fill={line} opacity="0.34" />
            ))}
          </>
        )}
        {scene === 'mandala' && (
          <>
            {[142, 96, 52].map((radius) => (
              <circle key={radius} cx="195" cy="286" r={radius} strokeWidth="4" opacity="0.24" />
            ))}
            <path
              d="M195 144v284M53 286h284M94 185l202 202M296 185L94 387"
              strokeWidth="3"
              opacity="0.3"
            />
            <circle cx="195" cy="286" r="20" fill={warm} opacity="0.38" strokeWidth="4" />
          </>
        )}
        {scene === 'city' && (
          <>
            <path
              d="M62 424h266M83 424V252h48v172M154 424V185h58v239M236 424V226h68v198"
              strokeWidth="5"
              opacity="0.52"
            />
            <path d="M89 190c42-36 84-36 126 0 42-36 84-36 126 0" strokeWidth="3" opacity="0.32" />
          </>
        )}
        {scene === 'phone' && (
          <>
            <rect x="132" y="120" width="126" height="248" rx="22" strokeWidth="5" opacity="0.55" />
            <path
              d="M153 205c31-29 57-29 84 0M153 270c31 29 57 29 84 0"
              strokeWidth="4"
              opacity="0.36"
            />
            <circle cx="195" cy="396" r="19" strokeWidth="4" opacity="0.38" />
          </>
        )}
        {scene === 'studio' && (
          <>
            <path
              d="M83 404c77-62 151-62 225 0M111 350c23-80 64-124 123-132M244 164c-13 74-5 125 25 154"
              strokeWidth="5"
              opacity="0.5"
            />
            <circle cx="244" cy="164" r="34" strokeWidth="5" opacity="0.5" />
          </>
        )}
        {scene === 'relationship' && (
          <>
            <path
              d="M124 186c37 0 67 34 67 76 0 73-67 112-67 112s-67-39-67-112c0-42 30-76 67-76zM266 186c37 0 67 34 67 76 0 73-67 112-67 112s-67-39-67-112c0-42 30-76 67-76z"
              strokeWidth="5"
              opacity="0.45"
            />
            <path d="M163 315c22-18 43-18 64 0" strokeWidth="4" opacity="0.42" />
          </>
        )}
        {scene === 'atlas' && (
          <>
            <path
              d="M75 146h240v304H75zM195 146v304M75 248h240M75 350h240"
              strokeWidth="5"
              opacity="0.44"
            />
            <path
              d="M104 206c46-28 86-22 121 18 29-17 55-14 78 10M111 402c55-34 113-34 174 0"
              strokeWidth="4"
              opacity="0.44"
            />
          </>
        )}
        {scene === 'sunrise' && (
          <>
            <path
              d="M56 408h278M98 408c19-66 51-99 97-99s78 33 97 99"
              strokeWidth="5"
              opacity="0.55"
            />
            <path
              d="M195 169v93M96 247l65 65M294 247l-65 65M70 342h91M229 342h91"
              strokeWidth="4"
              opacity="0.4"
            />
          </>
        )}
      </g>

      <g fill="none" stroke={line} strokeLinecap="round" strokeLinejoin="round" opacity="0.24">
        <circle cx="78" cy="104" r="22" strokeWidth="2" />
        <circle cx="312" cy="116" r="28" strokeWidth="2" />
        <path d="M78 82v44M56 104h44M292 116h40M312 96v40" strokeWidth="1.8" />
        <path d="M78 520c42-23 78-19 108 13M220 510c31-28 67-31 108-8" strokeWidth="2.2" />
        <path d="M310 236c24-16 45-13 62 9M31 308c28-20 56-22 86-5" strokeWidth="2" />
      </g>

      <g
        transform="translate(196 440)"
        fill="none"
        stroke={line}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M-48 94 C-42 45 -28 20 0 20 C28 20 42 45 48 94" strokeWidth="5" opacity="0.45" />
        <path
          d="M-34 53 C-15 66 15 66 34 53 M-22 80 C-6 86 8 86 24 80"
          strokeWidth="3"
          opacity="0.32"
        />
        <circle cx="0" cy="-7" r="37" fill={paper} strokeWidth="5" opacity="0.96" />
        <path d="M-29 -22 C-16 -45 18 -46 32 -22" strokeWidth="6" opacity="0.5" />
        <path d="M-31 -4 C-18 -12 -8 -12 5 -4 M9 -4 C22 -12 32 -12 43 -3" strokeWidth="3" />
        <circle cx="-18" cy="-2" r="8" strokeWidth="2.4" opacity="0.8" />
        <circle cx="18" cy="-2" r="8" strokeWidth="2.4" opacity="0.8" />
        <path d="M-10 -2h20M-8 17 C0 13 8 13 16 17" strokeWidth="2.2" opacity="0.6" />
        <path d="M-18 27 C-6 35 8 35 20 27" strokeWidth="3" opacity="0.5" />
        <path d="M-31 -39 C-10 -54 18 -52 34 -36" strokeWidth="3" opacity="0.28" />
      </g>

      <g stroke={line} strokeWidth="1.8" opacity="0.12">
        <path d="M54 90h118M248 520h82M72 496h86" />
        <path d="M312 96c-23 24-45 42-72 55M72 168c34-21 68-28 102-21" />
      </g>
    </svg>
  );
}

/* ── Program descriptions shown on intro screen ────────────────── */
const PROGRAM_INTROS: Record<string, { what: string; gain: string }> = {
  'emotional-intelligence': {
    what: 'A six-page exploration of what emotions actually are, how they shape every decision you make, and how to build the resilience to move through them.',
    gain: "You'll leave with a practical vocabulary for your inner life — and a different relationship to the states you've been trying to avoid.",
  },
};

/* ── Comic Program Reader ──────────────────────────────────────── */
type Props = {
  program: Program;
  onClose: () => void;
  onBack?: () => void;
  hubBg?: string;
};

export default function ComicProgram({
  program,
  onClose,
  onBack,
  hubBg = 'rgba(10,6,3,0.98)',
}: Props) {
  const [intro, setIntro] = useState(true);
  const [index, setIndex] = useState(0);
  const imageStyles = getImageStyles(program.key);
  const [imageStyle, setImageStyle] = useState(imageStyles[0]?.key ?? 'default');
  const [moreOpen, setMoreOpen] = useState(false);
  const current = program.segments[index];
  const total = program.segments.length;
  const paras = toParagraphs(current.body);

  function prev() {
    if (index > 0) {
      setMoreOpen(false);
      setIndex(index - 1);
    }
  }
  function next() {
    if (index < total - 1) {
      setMoreOpen(false);
      setIndex(index + 1);
    } else (onBack ?? onClose)();
  }

  const introData = PROGRAM_INTROS[program.key];

  if (BLANK_BUBBLE_PROGRAMS.has(program.key) && !LAYERED_BUBBLE_PROGRAMS.has(program.key)) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 150,
          background: hubBg,
          display: 'flex',
          flexDirection: 'column',
          maxWidth: 672,
          margin: '0 auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            padding: '12px 18px',
            flexShrink: 0,
            borderBottom: `1px solid ${col(program.color, 0.12)}`,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: SERIF,
                fontSize: 10,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: col(program.color, 0.58),
              }}
            >
              Comic book
            </div>
            <div
              style={{
                marginTop: 3,
                fontFamily: SERIF,
                fontSize: 16,
                color: cream(0.9),
                lineHeight: 1.15,
              }}
            >
              {program.domain}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontFamily: SERIF, fontSize: 11, color: col(program.color, 0.42) }}>
              {index + 1} / {total}
            </div>
            <button
              type="button"
              onClick={onBack ?? onClose}
              style={{
                background: 'none',
                border: `1px solid ${col(program.color, 0.22)}`,
                borderRadius: 999,
                color: col(program.color, 0.48),
                fontFamily: SERIF,
                fontSize: 11,
                letterSpacing: '0.1em',
                cursor: 'pointer',
                padding: '5px 13px',
              }}
            >
              back
            </button>
          </div>
        </div>

        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            padding: '14px 18px 18px',
          }}
        >
          <button
            type="button"
            onClick={next}
            aria-label={index === total - 1 ? 'Return to education' : 'Next comic page'}
            style={{
              display: 'block',
              width: '100%',
              maxWidth: 430,
              margin: '0 auto',
              padding: 0,
              border: `1.5px solid ${col(program.color, 0.25)}`,
              background: 'transparent',
              boxShadow: `0 0 34px ${col(program.color, 0.12)}`,
              cursor: 'pointer',
            }}
          >
            <PanelImage
              programKey={program.key}
              index={index}
              color={program.color}
              imageStyle={imageStyle}
              alt={`Blank Carl Jung comic page ${index + 1}`}
            />
          </button>

          <div
            style={{
              maxWidth: 430,
              margin: '12px auto 0',
              border: `1px solid ${col(program.color, 0.18)}`,
              background: 'rgba(255,255,255,0.035)',
              padding: 12,
            }}
          >
            <div
              style={{
                fontFamily: SERIF,
                fontSize: 9,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: col(program.color, 0.6),
                marginBottom: 5,
              }}
            >
              page {index + 1} / future text note
            </div>
            <div
              style={{
                fontFamily: SERIF,
                fontSize: 17,
                lineHeight: 1.2,
                color: cream(0.9),
              }}
            >
              {current.title}
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            padding: '10px 18px max(14px, env(safe-area-inset-bottom, 14px))',
            flexShrink: 0,
            borderTop: `1px solid ${col(program.color, 0.1)}`,
          }}
        >
          <button
            type="button"
            onClick={prev}
            disabled={index === 0}
            style={{
              border: 0,
              background: 'transparent',
              color: col(program.color, index === 0 ? 0.22 : 0.58),
              fontFamily: SERIF,
              fontSize: 13,
              cursor: index === 0 ? 'default' : 'pointer',
              padding: '8px 0',
            }}
          >
            prev
          </button>
          <div
            style={{
              display: 'flex',
              gap: 5,
              maxWidth: 190,
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            {program.segments.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setMoreOpen(false);
                  setIndex(i);
                }}
                aria-label={`Open page ${i + 1}`}
                style={{
                  width: i === index ? 17 : 5,
                  height: 5,
                  borderRadius: 999,
                  border: 0,
                  background: col(program.color, i === index ? 0.82 : 0.25),
                  padding: 0,
                  cursor: 'pointer',
                }}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={next}
            style={{
              border: 0,
              background: 'transparent',
              color: col(program.color, 0.62),
              fontFamily: SERIF,
              fontSize: 13,
              cursor: 'pointer',
              padding: '8px 0',
            }}
          >
            {index === total - 1 ? 'Education' : 'next'}
          </button>
        </div>
      </div>
    );
  }

  /* ── Intro screen ── */
  if (intro) {
    const { r: _r, g: _g, b: _b } = hex2rgb(program.color);
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 150,
          background: hubBg,
          display: 'flex',
          flexDirection: 'column',
          maxWidth: 672,
          margin: '0 auto',
          overflowY: 'auto',
        }}
      >
        {/* header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 20px',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              fontFamily: SERIF,
              fontSize: 10,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: col(program.color, 0.4),
            }}
          >
            Education
          </div>
          <button
            type="button"
            onClick={onBack ?? onClose}
            style={{
              background: 'none',
              border: `1px solid ${col(program.color, 0.22)}`,
              borderRadius: 999,
              color: col(program.color, 0.45),
              fontFamily: SERIF,
              fontSize: 11,
              letterSpacing: '0.1em',
              cursor: 'pointer',
              padding: '4px 12px',
            }}
          >
            ← back
          </button>
        </div>

        {/* panel art preview — first scene */}
        <button
          type="button"
          onClick={() => setIntro(false)}
          aria-label={`Begin ${program.domain}`}
          style={{
            display: 'block',
            width: 'auto',
            margin: '10px 20px 0',
            padding: 0,
            borderRadius: 0,
            overflow: 'visible',
            border: `1.5px solid ${col(program.color, 0.2)}`,
            flexShrink: 0,
            background: 'transparent',
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <PanelImage
            programKey={program.key}
            index={0}
            color={program.color}
            imageStyle={imageStyle}
          />
        </button>

        {imageStyles.length > 1 && (
          <div style={{ display: 'flex', gap: 8, padding: '12px 20px 0', flexShrink: 0 }}>
            {imageStyles.map((style) => (
              <button
                key={style.key}
                type="button"
                onClick={() => {
                  setMoreOpen(false);
                  setImageStyle(style.key);
                }}
                style={{
                  flex: 1,
                  borderRadius: 999,
                  border: `1px solid ${col(program.color, imageStyle === style.key ? 0.5 : 0.2)}`,
                  background: col(program.color, imageStyle === style.key ? 0.16 : 0.05),
                  color: cream(imageStyle === style.key ? 0.9 : 0.56),
                  cursor: 'pointer',
                  fontFamily: SERIF,
                  fontSize: 11,
                  letterSpacing: '0.08em',
                  padding: '8px 10px',
                }}
              >
                {style.label}
              </button>
            ))}
          </div>
        )}

        {/* program info */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '28px 24px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: SERIF,
                fontSize: 11,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: col(program.color, 0.55),
                marginBottom: 8,
              }}
            >
              Program
            </div>
            <div
              style={{
                fontFamily: SERIF,
                fontSize: 28,
                fontWeight: 700,
                color: cream(0.92),
                lineHeight: 1.15,
                letterSpacing: '-0.01em',
              }}
            >
              {program.domain}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 16 }}>
            <div
              style={{
                background: col(program.color, 0.08),
                border: `1px solid ${col(program.color, 0.15)}`,
                borderRadius: 10,
                padding: '10px 16px',
                flex: 1,
                textAlign: 'center',
              }}
            >
              <div style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 700, color: cream(0.85) }}>
                {program.segments.length}
              </div>
              <div
                style={{
                  fontFamily: SERIF,
                  fontSize: 10,
                  color: col(program.color, 0.5),
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginTop: 2,
                }}
              >
                pages
              </div>
            </div>
            <div
              style={{
                background: col(program.color, 0.08),
                border: `1px solid ${col(program.color, 0.15)}`,
                borderRadius: 10,
                padding: '10px 16px',
                flex: 1,
                textAlign: 'center',
              }}
            >
              <div style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 700, color: cream(0.85) }}>
                ~{program.segments.length * 2}m
              </div>
              <div
                style={{
                  fontFamily: SERIF,
                  fontSize: 10,
                  color: col(program.color, 0.5),
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginTop: 2,
                }}
              >
                to read
              </div>
            </div>
          </div>

          {introData && (
            <>
              <p
                style={{
                  fontFamily: SERIF,
                  fontSize: 14,
                  color: cream(0.7),
                  lineHeight: 1.85,
                  margin: 0,
                }}
              >
                {introData.what}
              </p>
              <div style={{ borderLeft: `3px solid ${col(program.color, 0.5)}`, paddingLeft: 14 }}>
                <div
                  style={{
                    fontFamily: SERIF,
                    fontSize: 10,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: col(program.color, 0.45),
                    marginBottom: 5,
                  }}
                >
                  You'll walk away with
                </div>
                <p
                  style={{
                    fontFamily: SERIF,
                    fontSize: 13,
                    color: cream(0.62),
                    lineHeight: 1.8,
                    margin: 0,
                    fontStyle: 'italic',
                  }}
                >
                  {introData.gain}
                </p>
              </div>
            </>
          )}
        </div>

        {/* begin button */}
        <div style={{ padding: '16px 24px 28px', flexShrink: 0 }}>
          <button
            type="button"
            onClick={() => setIntro(false)}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: 14,
              cursor: 'pointer',
              background: col(program.color, 0.12),
              border: `1.5px solid ${col(program.color, 0.45)}`,
              fontFamily: SERIF,
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: '0.06em',
              color: cream(0.92),
              boxShadow: `0 0 24px ${col(program.color, 0.12)}`,
            }}
          >
            Begin →
          </button>
        </div>
      </div>
    );
  }

  if (TEXT_ON_IMAGE_PROGRAMS.has(program.key)) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 150,
          background: hubBg,
          display: 'flex',
          flexDirection: 'column',
          maxWidth: 672,
          margin: '0 auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 18px',
            flexShrink: 0,
            borderBottom: `1px solid ${col(program.color, 0.12)}`,
          }}
        >
          <div
            style={{
              fontFamily: SERIF,
              fontSize: 11,
              color: col(program.color, 0.58),
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            {program.domain}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ fontFamily: SERIF, fontSize: 11, color: col(program.color, 0.42) }}>
              {index + 1} / {total}
            </div>
            <button
              type="button"
              onClick={onBack ?? onClose}
              style={{
                background: 'none',
                border: `1px solid ${col(program.color, 0.22)}`,
                borderRadius: 999,
                color: col(program.color, 0.48),
                fontFamily: SERIF,
                fontSize: 11,
                letterSpacing: '0.1em',
                cursor: 'pointer',
                padding: '5px 13px',
              }}
            >
              back
            </button>
          </div>
        </div>

        <div
          style={{
            position: 'relative',
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
          }}
        >
          <button
            type="button"
            onClick={next}
            aria-label={index === total - 1 ? 'Return to education' : 'Next comic page'}
            style={{
              display: 'block',
              width: '100%',
              border: 0,
              background: 'transparent',
              cursor: 'pointer',
              padding: 0,
              textAlign: 'left',
            }}
          >
            <PanelImage
              programKey={program.key}
              index={index}
              color={program.color}
              imageStyle={imageStyle}
            />
          </button>
          <div
            style={{
              position: 'sticky',
              left: 0,
              right: 0,
              bottom: 0,
              marginTop: -220,
              padding: '96px 18px 18px',
              background: `linear-gradient(180deg, transparent 0%, ${hubBg}ee 38%, ${hubBg} 100%)`,
              color: cream(0.9),
            }}
          >
            <div
              style={{
                border: `1px solid ${col(program.color, 0.26)}`,
                background: 'rgba(10,6,3,0.68)',
                backdropFilter: 'blur(10px)',
                padding: 16,
                boxShadow: `0 18px 46px ${col(program.color, 0.13)}`,
              }}
            >
              <div
                style={{
                  fontFamily: SERIF,
                  fontSize: 9,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: col(program.color, 0.66),
                  marginBottom: 6,
                }}
              >
                page {index + 1}
              </div>
              <div
                style={{
                  fontFamily: SERIF,
                  fontSize: 21,
                  fontWeight: 700,
                  color: cream(0.94),
                  lineHeight: 1.18,
                  marginBottom: 10,
                }}
              >
                {current.title}
              </div>
              <div style={{ display: 'grid', gap: 10 }}>
                {paras.slice(0, 2).map((p, i) => (
                  <p
                    key={i}
                    style={{
                      fontFamily: SERIF,
                      fontSize: 14.5,
                      lineHeight: 1.72,
                      color: cream(i === 0 ? 0.78 : 0.64),
                      margin: 0,
                    }}
                  >
                    {p}
                  </p>
                ))}
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  marginTop: 14,
                  paddingTop: 12,
                  borderTop: `1px solid ${col(program.color, 0.12)}`,
                }}
              >
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    prev();
                  }}
                  disabled={index === 0}
                  style={{
                    border: 0,
                    background: 'transparent',
                    color: col(program.color, index === 0 ? 0.22 : 0.58),
                    fontFamily: SERIF,
                    fontSize: 13,
                    cursor: index === 0 ? 'default' : 'pointer',
                    padding: '8px 0',
                  }}
                >
                  Previous
                </button>
                <div style={{ display: 'flex', gap: 5 }}>
                  {program.segments.map((_, i) => (
                    <span
                      key={i}
                      style={{
                        width: i === index ? 18 : 5,
                        height: 5,
                        borderRadius: 999,
                        background: col(program.color, i === index ? 0.8 : 0.24),
                      }}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={next}
                  style={{
                    border: 0,
                    background: 'transparent',
                    color: col(program.color, 0.62),
                    fontFamily: SERIF,
                    fontSize: 13,
                    cursor: 'pointer',
                    padding: '8px 0',
                  }}
                >
                  {index === total - 1 ? 'Finish' : 'Next'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (LAYERED_BUBBLE_PROGRAMS.has(program.key)) {
    const isLandscape = LANDSCAPE_LAYERED_PROGRAMS.has(program.key);
    const usesGuideTextBox = LIFE_GUIDE_PROGRAMS.has(program.key);
    const visibleGuideParagraphs = moreOpen ? paras : [conciseLesson(current.body)];
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 150,
          background: hubBg,
          display: 'flex',
          flexDirection: 'column',
          maxWidth: 672,
          margin: '0 auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 18px',
            flexShrink: 0,
            borderBottom: `1px solid ${col(program.color, 0.12)}`,
          }}
        >
          <div
            style={{
              fontFamily: SERIF,
              fontSize: 11,
              color: col(program.color, 0.58),
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            {program.domain}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ fontFamily: SERIF, fontSize: 11, color: col(program.color, 0.42) }}>
              {index + 1} / {total}
            </div>
            <button
              type="button"
              onClick={onBack ?? onClose}
              style={{
                background: 'none',
                border: `1px solid ${col(program.color, 0.22)}`,
                borderRadius: 999,
                color: col(program.color, 0.48),
                fontFamily: SERIF,
                fontSize: 11,
                letterSpacing: '0.1em',
                cursor: 'pointer',
                padding: '5px 13px',
              }}
            >
              back
            </button>
          </div>
        </div>

        {THREE_PART_GUIDES.has(program.key) && (
          <div
            style={{
              display: 'flex',
              gap: 6,
              padding: '10px 14px 0',
              flexShrink: 0,
            }}
          >
            {GUIDE_PARTS.map((part) => {
              const activePart = index >= part.start && index <= part.end;
              return (
                <button
                  key={part.label}
                  type="button"
                  aria-label={`${part.label} ${part.start + 1}-${part.end + 1}`}
                  onClick={() => {
                    setMoreOpen(false);
                    setIndex(part.start);
                  }}
                  style={{
                    flex: 1,
                    borderRadius: 999,
                    border: `1px solid ${col(program.color, activePart ? 0.48 : 0.18)}`,
                    background: col(program.color, activePart ? 0.16 : 0.05),
                    color: cream(activePart ? 0.9 : 0.54),
                    cursor: 'pointer',
                    fontFamily: SERIF,
                    fontSize: 10.5,
                    letterSpacing: '0.08em',
                    padding: '7px 8px',
                  }}
                >
                  {part.label}
                  <span style={{ opacity: 0.55 }}>
                    {' '}
                    {part.start + 1}-{part.end + 1}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            padding: '14px 14px 18px',
            paddingBottom: 'max(18px, env(safe-area-inset-bottom, 18px))',
          }}
        >
          <div
            style={{
              display: 'block',
              position: 'relative',
              width: isLandscape
                ? 'min(100%, 620px, calc((100dvh - 150px) * 1.78))'
                : 'min(100%, 390px, calc((100dvh - 150px) * 0.63))',
              maxWidth: '100%',
              margin: '0 auto',
              padding: 0,
              border: 0,
              background: 'transparent',
              cursor: 'pointer',
              boxShadow: `0 16px 42px ${col(program.color, 0.14)}`,
              overflow: 'hidden',
            }}
          >
            <button
              type="button"
              onClick={next}
              aria-label={index === total - 1 ? 'Return to education' : 'Next comic page'}
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 1,
                border: 0,
                background: 'transparent',
                cursor: 'pointer',
                padding: 0,
              }}
            />
            <PanelImage
              programKey={program.key}
              index={index}
              color={program.color}
              imageStyle={imageStyle}
              alt={
                program.key === 'carl-jung'
                  ? `Carl Jung comic page ${index + 1}`
                  : `${program.domain} comic page ${index + 1}`
              }
            />
            {usesGuideTextBox && (
              <div
                style={{
                  position: 'absolute',
                  left: isLandscape ? 16 : 14,
                  right: isLandscape ? 16 : 14,
                  bottom: isLandscape ? 14 : 16,
                  zIndex: 2,
                  border: `1px solid ${col(program.color, 0.28)}`,
                  background: 'rgba(44, 24, 13, 0.84)',
                  backdropFilter: 'blur(8px)',
                  padding: isLandscape ? '12px 14px' : '13px 14px',
                  boxShadow: `0 18px 44px ${col(program.color, 0.18)}`,
                  maxHeight: moreOpen ? (isLandscape ? '58%' : '48%') : '42%',
                  overflowY: moreOpen ? 'auto' : 'hidden',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'start',
                    justifyContent: 'space-between',
                    gap: 12,
                    marginBottom: 7,
                  }}
                >
                  <div
                    style={{
                      fontFamily: SERIF,
                      fontSize: isLandscape ? 16 : 18,
                      fontWeight: 700,
                      color: cream(0.95),
                      lineHeight: 1.18,
                      overflowWrap: 'anywhere',
                    }}
                  >
                    {current.title}
                  </div>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setMoreOpen((value) => !value);
                    }}
                    style={{
                      flexShrink: 0,
                      borderRadius: 999,
                      border: `1px solid ${col(program.color, 0.36)}`,
                      background: col(program.color, 0.12),
                      color: col(program.color, 0.86),
                      cursor: 'pointer',
                      fontFamily: SERIF,
                      fontSize: 10,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      padding: '5px 9px',
                    }}
                  >
                    {moreOpen ? 'less' : 'more'}
                  </button>
                </div>
                <div style={{ display: 'grid', gap: moreOpen ? 8 : 0 }}>
                  {visibleGuideParagraphs.map((paragraph, paragraphIndex) => (
                    <p
                      key={paragraph}
                      style={{
                        margin: 0,
                        color: paragraphIndex === 0 ? col(program.color, 0.9) : cream(0.68),
                        fontFamily: SERIF,
                        fontSize: isLandscape ? 12.5 : 13,
                        lineHeight: 1.48,
                        overflowWrap: 'anywhere',
                      }}
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
          {imageStyles.length > 1 && (
            <div
              style={{
                display: 'flex',
                gap: 7,
                maxWidth: isLandscape ? 620 : 390,
                margin: '10px auto 0',
              }}
            >
              {imageStyles.map((style) => (
                <button
                  key={style.key}
                  type="button"
                  onClick={() => {
                    setMoreOpen(false);
                    setImageStyle(style.key);
                  }}
                  style={{
                    flex: 1,
                    borderRadius: 999,
                    border: `1px solid ${col(program.color, imageStyle === style.key ? 0.5 : 0.2)}`,
                    background: col(program.color, imageStyle === style.key ? 0.16 : 0.05),
                    color: cream(imageStyle === style.key ? 0.9 : 0.56),
                    cursor: 'pointer',
                    fontFamily: SERIF,
                    fontSize: 11,
                    letterSpacing: '0.08em',
                    padding: '8px 10px',
                  }}
                >
                  {style.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            padding: '10px 18px max(14px, env(safe-area-inset-bottom, 14px))',
            flexShrink: 0,
            borderTop: `1px solid ${col(program.color, 0.1)}`,
          }}
        >
          <button
            type="button"
            onClick={prev}
            disabled={index === 0}
            style={{
              border: 0,
              background: 'transparent',
              color: col(program.color, index === 0 ? 0.22 : 0.58),
              fontFamily: SERIF,
              fontSize: 13,
              cursor: index === 0 ? 'default' : 'pointer',
              padding: '8px 0',
            }}
          >
            prev
          </button>
          <div
            style={{
              display: 'flex',
              gap: 5,
              maxWidth: 190,
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            {program.segments.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setMoreOpen(false);
                  setIndex(i);
                }}
                aria-label={`Open page ${i + 1}`}
                style={{
                  width: i === index ? 17 : 5,
                  height: 5,
                  borderRadius: 999,
                  border: 0,
                  background: col(program.color, i === index ? 0.82 : 0.25),
                  padding: 0,
                  cursor: 'pointer',
                }}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={next}
            style={{
              border: 0,
              background: 'transparent',
              color: col(program.color, 0.62),
              fontFamily: SERIF,
              fontSize: 13,
              cursor: 'pointer',
              padding: '8px 0',
            }}
          >
            {index === total - 1 ? 'Education' : 'next'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 150,
        background: hubBg,
        display: 'flex',
        flexDirection: 'column',
        maxWidth: 672,
        margin: '0 auto',
        overflowY: 'auto',
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 20px',
          flexShrink: 0,
          borderBottom: `1px solid ${col(program.color, 0.12)}`,
        }}
      >
        <div
          style={{
            fontFamily: SERIF,
            fontSize: 11,
            color: col(program.color, 0.55),
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          {program.domain}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontFamily: SERIF, fontSize: 11, color: col(program.color, 0.4) }}>
            {index + 1} / {total}
          </div>
          <button
            type="button"
            onClick={onBack ?? onClose}
            style={{
              background: 'none',
              border: `1px solid ${col(program.color, 0.22)}`,
              borderRadius: 999,
              color: col(program.color, 0.45),
              fontFamily: SERIF,
              fontSize: 11,
              letterSpacing: '0.1em',
              cursor: 'pointer',
              padding: '4px 12px',
            }}
          >
            ← back
          </button>
        </div>
      </div>

      {/* ── Panel art ── */}
      <button
        type="button"
        onClick={next}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            next();
          }
        }}
        aria-label={index === total - 1 ? 'Return to education' : 'Next comic page'}
        style={{
          flexShrink: 0,
          margin: '16px 20px 0',
          borderRadius: 0,
          overflow: 'visible',
          border: `1.5px solid ${col(program.color, 0.25)}`,
          boxShadow: `0 0 32px ${col(program.color, 0.1)}`,
          cursor: 'pointer',
          display: 'block',
          padding: 0,
          width: 'calc(100% - 40px)',
          background: 'transparent',
          textAlign: 'left',
        }}
      >
        <PanelImage
          programKey={program.key}
          index={index}
          color={program.color}
          imageStyle={imageStyle}
        />
      </button>

      {imageStyles.length > 1 && (
        <div
          style={{
            display: 'flex',
            gap: 8,
            padding: '10px 20px 0',
            flexShrink: 0,
          }}
        >
          {imageStyles.map((style) => (
            <button
              key={style.key}
              type="button"
              onClick={() => {
                setMoreOpen(false);
                setImageStyle(style.key);
              }}
              style={{
                flex: 1,
                minHeight: 34,
                borderRadius: 999,
                border: `1px solid ${col(program.color, imageStyle === style.key ? 0.5 : 0.2)}`,
                background: col(program.color, imageStyle === style.key ? 0.16 : 0.05),
                color: cream(imageStyle === style.key ? 0.9 : 0.56),
                cursor: 'pointer',
                fontFamily: SERIF,
                fontSize: 11,
                letterSpacing: '0.08em',
              }}
            >
              {style.label}
            </button>
          ))}
        </div>
      )}

      {/* ── Caption + body ── */}
      <div style={{ padding: '20px 20px 24px' }}>
        {/* title caption box */}
        <div
          style={{
            borderLeft: `3px solid ${col(program.color, 0.7)}`,
            paddingLeft: 14,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              fontFamily: SERIF,
              fontSize: 9,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: col(program.color, 0.5),
              marginBottom: 5,
            }}
          >
            page {index + 1}
          </div>
          <div
            style={{
              fontFamily: SERIF,
              fontSize: 20,
              fontWeight: 700,
              color: cream(0.92),
              lineHeight: 1.25,
              letterSpacing: '-0.01em',
            }}
          >
            {current.title}
          </div>
        </div>

        {/* body paragraphs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {paras.map((para, i) => (
            <p
              key={i}
              style={{
                fontFamily: SERIF,
                fontSize: 15,
                color: cream(0.72),
                lineHeight: 1.9,
                margin: 0,
              }}
            >
              {para}
            </p>
          ))}
        </div>
      </div>

      {/* ── Navigation ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 20px 20px',
          flexShrink: 0,
          borderTop: `1px solid ${col(program.color, 0.1)}`,
        }}
      >
        <button
          type="button"
          onClick={prev}
          disabled={index === 0}
          style={{
            fontFamily: SERIF,
            fontSize: 13,
            color: col(program.color, index === 0 ? 0.2 : 0.55),
            background: 'none',
            border: 'none',
            cursor: index === 0 ? 'default' : 'pointer',
            padding: '6px 0',
          }}
        >
          ← prev
        </button>

        {/* dot indicators */}
        <div style={{ display: 'flex', gap: 6 }}>
          {program.segments.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setMoreOpen(false);
                setIndex(i);
              }}
              style={{
                width: i === index ? 18 : 6,
                height: 6,
                borderRadius: 3,
                background: col(program.color, i === index ? 0.8 : 0.25),
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                transition: 'width 0.2s, background 0.2s',
              }}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={next}
          style={{
            fontFamily: SERIF,
            fontSize: 13,
            color: index === total - 1 ? col(program.color, 0.7) : col(program.color, 0.55),
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '6px 0',
            fontWeight: index === total - 1 ? 700 : 400,
          }}
        >
          {index === total - 1 ? '← Education' : 'next →'}
        </button>
      </div>
    </div>
  );
}

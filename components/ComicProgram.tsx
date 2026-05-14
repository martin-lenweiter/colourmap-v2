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

const PROGRAM_IMAGE_STYLES: Record<string, ImageStyle[]> = {
  'hope-energy': [DEFAULT_IMAGE_STYLE, { key: 'euro-bd', label: 'European BD' }],
  'emotional-intelligence': [DEFAULT_IMAGE_STYLE, { key: 'minimal', label: 'Minimal' }],
};

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
}: {
  programKey: string;
  index: number;
  color: string;
  imageStyle?: string;
}) {
  const [failed, setFailed] = useState(false);
  const src =
    imageStyle && imageStyle !== 'default'
      ? `/comics/${programKey}/variants/${imageStyle}/panel-${index}.png`
      : `/comics/${programKey}/panel-${index}.png`;
  if (!failed) {
    return (
      <img
        src={src}
        alt=""
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
  const current = program.segments[index];
  const total = program.segments.length;
  const paras = toParagraphs(current.body);

  function prev() {
    if (index > 0) setIndex(index - 1);
  }
  function next() {
    if (index < total - 1) setIndex(index + 1);
    else (onBack ?? onClose)();
  }

  const introData = PROGRAM_INTROS[program.key];

  /* ── Intro screen ── */
  if (intro) {
    const { r: _r, g: _g, b: _b } = hex2rgb(program.color);
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 90,
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
        <div
          style={{
            margin: '10px 20px 0',
            borderRadius: 0,
            overflow: 'visible',
            border: `1.5px solid ${col(program.color, 0.2)}`,
            flexShrink: 0,
          }}
        >
          <PanelImage
            programKey={program.key}
            index={0}
            color={program.color}
            imageStyle={imageStyle}
          />
        </div>

        {imageStyles.length > 1 && (
          <div style={{ display: 'flex', gap: 8, padding: '12px 20px 0', flexShrink: 0 }}>
            {imageStyles.map((style) => (
              <button
                key={style.key}
                type="button"
                onClick={() => setImageStyle(style.key)}
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
          zIndex: 90,
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

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 90,
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
              onClick={() => setImageStyle(style.key)}
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
              onClick={() => setIndex(i)}
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

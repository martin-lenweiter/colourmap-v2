'use client';

import { useState } from 'react';
import { PROGRESS_ROADS, type ProgressRoad, type RoadStep } from '@/lib/progress-roads';

const SERIF = 'var(--font-serif)';

function rgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function stepIcon(step: RoadStep, index: number) {
  const lower = `${step.title} ${step.tool}`.toLowerCase();
  if (lower.includes('fire')) return 'flame';
  if (lower.includes('writing') || lower.includes('memory')) return 'tablet';
  if (lower.includes('sanitation') || lower.includes('water')) return 'wave';
  if (lower.includes('medicine') || lower.includes('care')) return 'cross';
  if (lower.includes('internet') || lower.includes('ai') || lower.includes('network'))
    return 'nodes';
  if (lower.includes('democracy') || lower.includes('assembly') || lower.includes('voice'))
    return 'circle';
  if (lower.includes('peace') || lower.includes('treat')) return 'bridge';
  if (lower.includes('women') || lower.includes('freedom') || lower.includes('vote'))
    return 'open-door';
  if (lower.includes('animal') || lower.includes('kinship')) return 'leaf';
  if (lower.includes('happiness') || lower.includes('harmony')) return 'sun';
  return index % 2 === 0 ? 'tool' : 'light';
}

function RoadSymbol({ type, color }: { type: string; color: string }) {
  const stroke = rgba(color, 0.95);
  return (
    <svg viewBox="0 0 80 80" width="54" height="54" aria-hidden="true">
      <circle cx="40" cy="40" r="30" fill={rgba(color, 0.13)} stroke={stroke} strokeWidth="2" />
      {type === 'flame' && (
        <path
          d="M42 17 C22 38 36 50 36 61 C51 57 61 43 45 26 C47 37 35 38 42 17Z"
          fill={rgba(color, 0.6)}
        />
      )}
      {type === 'tablet' && (
        <rect
          x="26"
          y="18"
          width="28"
          height="44"
          rx="3"
          fill="none"
          stroke={stroke}
          strokeWidth="3"
        />
      )}
      {type === 'wave' && (
        <path
          d="M17 44 C28 32 37 56 49 43 C55 36 61 37 65 42"
          fill="none"
          stroke={stroke}
          strokeWidth="4"
          strokeLinecap="round"
        />
      )}
      {type === 'cross' && (
        <path d="M40 22 V58 M22 40 H58" stroke={stroke} strokeWidth="6" strokeLinecap="round" />
      )}
      {type === 'nodes' && (
        <g fill={rgba(color, 0.62)} stroke={stroke} strokeWidth="2">
          <path d="M25 29 L53 25 L58 52 L31 57 Z" fill="none" />
          <circle cx="25" cy="29" r="5" />
          <circle cx="53" cy="25" r="5" />
          <circle cx="58" cy="52" r="5" />
          <circle cx="31" cy="57" r="5" />
        </g>
      )}
      {type === 'circle' && (
        <path
          d="M20 45 C22 27 58 27 60 45 C48 58 32 58 20 45Z"
          fill="none"
          stroke={stroke}
          strokeWidth="3"
        />
      )}
      {type === 'bridge' && (
        <path
          d="M15 52 C28 31 52 31 65 52 M18 52 H62"
          fill="none"
          stroke={stroke}
          strokeWidth="4"
          strokeLinecap="round"
        />
      )}
      {type === 'open-door' && (
        <path
          d="M28 62 V18 H52 V62 M52 20 L64 28 V62"
          fill="none"
          stroke={stroke}
          strokeWidth="3"
          strokeLinejoin="round"
        />
      )}
      {type === 'leaf' && (
        <path
          d="M20 48 C28 21 55 16 63 18 C62 47 42 61 20 48Z M27 47 C38 39 48 30 61 19"
          fill="none"
          stroke={stroke}
          strokeWidth="3"
          strokeLinecap="round"
        />
      )}
      {type === 'sun' && (
        <g stroke={stroke} strokeWidth="3" strokeLinecap="round">
          <circle cx="40" cy="40" r="10" fill={rgba(color, 0.35)} />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
            <line
              key={angle}
              x1="40"
              y1="18"
              x2="40"
              y2="10"
              transform={`rotate(${angle} 40 40)`}
            />
          ))}
        </g>
      )}
      {(type === 'tool' || type === 'light') && (
        <path
          d="M23 52 L51 24 M46 21 L58 33"
          stroke={stroke}
          strokeWidth="4"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}

function Walker({ step, index }: { step: RoadStep; index: number }) {
  const clothing = ['#4a3324', '#5b4630', '#6a563a', '#4e5d46', '#3d5660', '#5a4a68', '#3f604f'];
  return (
    <svg viewBox="0 0 140 150" width="116" height="124" aria-hidden="true">
      <g transform="translate(12 5)">
        <circle cx="56" cy="23" r="13" fill="#2f2418" />
        <path
          d="M48 38 C42 58 40 78 43 97 L73 97 C76 76 73 56 65 38 Z"
          fill={clothing[index % clothing.length]}
          stroke="#2f2418"
          strokeWidth="2"
        />
        <path
          d="M46 51 C30 64 24 73 18 86"
          fill="none"
          stroke="#2f2418"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <path
          d="M68 52 C82 61 89 68 98 77"
          fill="none"
          stroke="#2f2418"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <path
          d="M51 96 C45 113 39 125 31 137"
          fill="none"
          stroke="#2f2418"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d="M68 96 C80 110 88 121 100 130"
          fill="none"
          stroke="#2f2418"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <circle cx="102" cy="130" r="4" fill="#2f2418" />
        <circle cx="31" cy="137" r="4" fill="#2f2418" />
        <g transform="translate(88 34)">
          <RoadSymbol type={stepIcon(step, index)} color={step.color} />
        </g>
      </g>
    </svg>
  );
}

function RoadSelector({
  roads,
  active,
  onSelect,
}: {
  roads: ProgressRoad[];
  active: ProgressRoad;
  onSelect: (road: ProgressRoad) => void;
}) {
  return (
    <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '0 14px 12px' }}>
      {roads.map((road) => (
        <button
          key={road.key}
          type="button"
          onClick={() => onSelect(road)}
          style={{
            flexShrink: 0,
            border: '1px solid rgba(92,48,24,0.2)',
            background: road.key === active.key ? 'rgba(92,48,24,0.14)' : 'rgba(255,255,255,0.18)',
            color: '#3b2a18',
            padding: '8px 11px',
            fontFamily: SERIF,
            fontSize: 12,
            whiteSpace: 'nowrap',
          }}
        >
          {road.title.replace('History Of ', '')}
        </button>
      ))}
    </div>
  );
}

export default function ProgressRoadPrototype() {
  const [roadKey, setRoadKey] = useState(PROGRESS_ROADS[0].key);
  const road = PROGRESS_ROADS.find((item) => item.key === roadKey) ?? PROGRESS_ROADS[0];
  const [stepIndex, setStepIndex] = useState(0);
  const [reveal, setReveal] = useState(0);
  const step = road.steps[stepIndex];
  const visible = Math.min(reveal + 1, 4);
  const progressPct = road.steps.length > 1 ? stepIndex / (road.steps.length - 1) : 0;

  function selectRoad(nextRoad: ProgressRoad) {
    setRoadKey(nextRoad.key);
    setStepIndex(0);
    setReveal(0);
  }

  function next() {
    if (reveal < 3) {
      setReveal(reveal + 1);
      return;
    }
    if (stepIndex === road.steps.length - 1) {
      backToEducation();
      return;
    }
    setStepIndex((current) => Math.min(current + 1, road.steps.length - 1));
    setReveal(0);
  }

  function backToEducation() {
    try {
      sessionStorage.setItem('colourmap:open-education', '1');
    } catch {}
    window.location.assign('/day');
  }

  return (
    <main
      style={{
        minHeight: '100svh',
        padding: '14px 0 34px',
        background: 'linear-gradient(180deg, #f2dfb4 0%, #d6bc88 100%)',
        color: '#302316',
      }}
    >
      <section style={{ padding: '0 16px 12px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 12,
            alignItems: 'center',
          }}
        >
          <div
            style={{ fontFamily: SERIF, fontSize: 12, letterSpacing: '0.18em', color: '#7a5a36' }}
          >
            Progress Road
          </div>
          <button
            type="button"
            onClick={backToEducation}
            style={{
              border: '1px solid rgba(92,48,24,0.22)',
              background: 'rgba(255,255,255,0.18)',
              color: '#6b4b2e',
              borderRadius: 999,
              padding: '5px 12px',
              fontFamily: SERIF,
              fontSize: 11,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            Education
          </button>
        </div>
        <h1 style={{ fontFamily: SERIF, fontSize: 34, lineHeight: 0.96, margin: '6px 0 10px' }}>
          {road.title}
        </h1>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.55, color: '#5b432b' }}>
          {road.subtitle}
        </p>
      </section>

      <RoadSelector roads={PROGRESS_ROADS} active={road} onSelect={selectRoad} />

      <div
        onClick={next}
        style={{
          margin: '0 14px',
          minHeight: 360,
          position: 'relative',
          overflow: 'hidden',
          cursor: 'pointer',
          border: '1px solid rgba(92,48,24,0.18)',
          background:
            'linear-gradient(180deg, rgba(247,232,190,0.92), rgba(224,196,139,0.92)), radial-gradient(circle at 80% 16%, rgba(255,244,190,0.8), transparent 24%)',
          boxShadow: 'inset 0 0 38px rgba(92,48,24,0.12)',
        }}
      >
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        >
          <defs>
            <pattern id="roadGrid" width="7" height="7" patternUnits="userSpaceOnUse">
              <path
                d="M 7 0 L 0 0 0 7"
                fill="none"
                stroke="rgba(38,93,96,0.13)"
                strokeWidth="0.22"
              />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#roadGrid)" />
          <path
            d="M 7 74 C 26 60, 42 68, 56 56 S 82 39, 95 24"
            fill="none"
            stroke="rgba(92,48,24,0.34)"
            strokeWidth="1.8"
          />
          <path
            d="M 7 74 C 26 60, 42 68, 56 56 S 82 39, 95 24"
            fill="none"
            stroke={rgba(step.color, 0.7)}
            strokeWidth="1.2"
            strokeDasharray={`${progressPct * 120} 120`}
          />
        </svg>

        {road.steps.map((roadStep, index) => {
          const left = 10 + (index / Math.max(1, road.steps.length - 1)) * 80;
          const top = 74 - Math.sin(index * 0.8) * 22 - index * 5;
          const active = index === stepIndex;
          const passed = index <= stepIndex;
          return (
            <button
              key={roadStep.title}
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setStepIndex(index);
                setReveal(0);
              }}
              style={{
                position: 'absolute',
                left: `${left}%`,
                top: `${top}%`,
                transform: 'translate(-50%, -50%)',
                width: active ? 52 : 28,
                height: active ? 52 : 28,
                borderRadius: '50%',
                border: `1.5px solid ${rgba(roadStep.color, active ? 0.95 : 0.46)}`,
                background: passed
                  ? rgba(roadStep.color, active ? 0.28 : 0.16)
                  : 'rgba(255,255,255,0.35)',
                boxShadow: active ? `0 0 28px ${rgba(roadStep.color, 0.34)}` : 'none',
                color: '#312315',
                fontFamily: SERIF,
                fontSize: active ? 9 : 0,
                padding: 3,
              }}
            >
              {active ? roadStep.era : ''}
            </button>
          );
        })}

        <div
          style={{
            position: 'absolute',
            left: `${12 + progressPct * 68}%`,
            bottom: 42,
            transition: 'left 0.35s ease',
          }}
        >
          <Walker step={step} index={stepIndex} />
        </div>

        <div
          style={{
            position: 'absolute',
            left: 16,
            right: 16,
            bottom: 14,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'end',
          }}
        >
          <div style={{ fontFamily: SERIF, fontSize: 12, color: '#765638' }}>
            {stepIndex + 1} / {road.steps.length}
          </div>
          <div style={{ fontFamily: SERIF, fontSize: 11, color: rgba(step.color, 0.9) }}>
            {stepIndex === road.steps.length - 1 && reveal >= 3 ? 'back to menu' : 'tap to reveal'}
          </div>
        </div>
      </div>

      <section
        style={{
          margin: 14,
          padding: 16,
          background: 'rgba(252,242,206,0.88)',
          border: `1px solid ${rgba(step.color, 0.34)}`,
        }}
      >
        <div
          style={{
            fontFamily: SERIF,
            fontSize: 11,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: rgba(step.color, 0.96),
          }}
        >
          {step.era} · {step.tool}
        </div>
        <h2 style={{ margin: '8px 0 10px', fontFamily: SERIF, fontSize: 28, lineHeight: 1 }}>
          {step.title}
        </h2>
        <p style={{ margin: '0 0 12px', fontSize: 14, lineHeight: 1.55, color: '#60472e' }}>
          {step.scene}
        </p>
        <div style={{ display: 'grid', gap: 10 }}>
          {visible >= 1 && <Info label="What improved" text={step.improved} color={step.color} />}
          {visible >= 2 && <Info label="What remained" text={step.unresolved} color={step.color} />}
          {visible >= 3 && <Info label="Lesson" text={step.lesson} color={step.color} />}
          {visible >= 4 && <Info label="Simple act" text={step.action} color={step.color} strong />}
        </div>
      </section>
    </main>
  );
}

function Info({
  label,
  text,
  color,
  strong = false,
}: {
  label: string;
  text: string;
  color: string;
  strong?: boolean;
}) {
  return (
    <div style={{ borderLeft: `3px solid ${rgba(color, 0.76)}`, paddingLeft: 12 }}>
      <div
        style={{
          fontFamily: SERIF,
          fontSize: 10,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: rgba(color, 0.9),
          marginBottom: 2,
        }}
      >
        {label}
      </div>
      <div
        style={{ fontSize: 14, lineHeight: 1.55, color: '#3b2a18', fontWeight: strong ? 700 : 400 }}
      >
        {text}
      </div>
    </div>
  );
}

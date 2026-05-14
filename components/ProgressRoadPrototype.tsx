'use client';

import { useMemo, useState } from 'react';
import { PROGRESS_ROADS, type ProgressRoad, type RoadStep } from '@/lib/progress-roads';

const SERIF = 'var(--font-serif)';
const ROAD_PATH = 'M 7 76 C 18 58, 30 68, 41 49 S 62 32, 73 43 S 88 57, 95 24';

type RoadPoint = {
  left: number;
  top: number;
};

function rgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function roadPoint(index: number, total: number): RoadPoint {
  const count = Math.max(1, total - 1);
  const t = index / count;
  return {
    left: 7 + t * 88,
    top: 76 - Math.sin(t * Math.PI * 1.28) * 25 - t * 28 + Math.sin(index * 1.7) * 7,
  };
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

function RoadSymbol({ type, color, size = 54 }: { type: string; color: string; size?: number }) {
  const stroke = rgba(color, 0.95);
  return (
    <svg viewBox="0 0 80 80" width={size} height={size} aria-hidden="true">
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
    <svg viewBox="0 0 140 150" width="100" height="108" aria-hidden="true">
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
          <RoadSymbol type={stepIcon(step, index)} color={step.color} size={48} />
        </g>
      </g>
    </svg>
  );
}

function EducationButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        border: '1px solid rgba(68,39,18,0.5)',
        background: '#5c3018',
        color: '#fff3d2',
        borderRadius: 999,
        padding: '9px 18px',
        minHeight: 40,
        fontFamily: SERIF,
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        cursor: 'pointer',
        boxShadow: '0 8px 18px rgba(54,29,13,0.2)',
      }}
    >
      Education
    </button>
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
    <div
      style={{
        display: 'grid',
        gap: 8,
        overflowY: 'auto',
        paddingRight: 2,
      }}
    >
      {roads.map((road) => {
        const activeRoad = road.key === active.key;
        return (
          <button
            key={road.key}
            type="button"
            onClick={() => onSelect(road)}
            style={{
              width: '100%',
              border: activeRoad
                ? '1px solid rgba(92,48,24,0.46)'
                : '1px solid rgba(92,48,24,0.15)',
              background: activeRoad ? 'rgba(92,48,24,0.12)' : 'rgba(255,248,222,0.66)',
              color: '#3b2a18',
              padding: '10px 12px',
              minHeight: 48,
              borderRadius: 8,
              fontFamily: SERIF,
              fontSize: 13,
              textAlign: 'left',
              cursor: 'pointer',
              boxShadow: activeRoad ? 'inset 3px 0 0 #5c3018' : 'none',
            }}
          >
            {road.title.replace('History Of ', '')}
          </button>
        );
      })}
    </div>
  );
}

function RoadCanvas({
  road,
  step,
  stepIndex,
  progressPct,
  onStep,
  onAdvance,
}: {
  road: ProgressRoad;
  step: RoadStep;
  stepIndex: number;
  progressPct: number;
  onStep: (index: number) => void;
  onAdvance: () => void;
}) {
  const activePoint = roadPoint(stepIndex, road.steps.length);

  return (
    <div
      onClick={onAdvance}
      style={{
        position: 'relative',
        minHeight: 0,
        height: '100%',
        overflow: 'hidden',
        cursor: 'pointer',
        border: '1px solid rgba(92,48,24,0.16)',
        borderRadius: 0,
        background:
          'linear-gradient(180deg, rgba(252,239,196,0.96), rgba(214,188,130,0.93)), radial-gradient(circle at 75% 20%, rgba(255,247,198,0.95), transparent 24%), radial-gradient(circle at 18% 78%, rgba(92,142,136,0.18), transparent 30%)',
        boxShadow: 'inset 0 0 70px rgba(92,48,24,0.14)',
        isolation: 'isolate',
      }}
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0 }}
      >
        <defs>
          <pattern id="roadGrid" width="6" height="6" patternUnits="userSpaceOnUse">
            <path d="M 6 0 L 0 0 0 6" fill="none" stroke="rgba(38,93,96,0.1)" strokeWidth="0.18" />
          </pattern>
          <linearGradient id="roadGlow" x1="0" x2="1" y1="1" y2="0">
            <stop offset="0%" stopColor={rgba(road.steps[0]?.color ?? step.color, 0.3)} />
            <stop offset="100%" stopColor={rgba(step.color, 0.78)} />
          </linearGradient>
        </defs>
        <rect width="100" height="100" fill="url(#roadGrid)" />
        <path
          d="M 0 88 C 20 70, 38 85, 58 68 S 78 48, 100 58"
          fill="none"
          stroke="rgba(255,255,255,0.28)"
          strokeWidth="10"
        />
        <path
          d="M 2 90 C 21 71, 39 84, 58 69 S 79 49, 99 60"
          fill="none"
          stroke="rgba(92,48,24,0.09)"
          strokeWidth="5"
        />
        <path
          d={ROAD_PATH}
          fill="none"
          stroke="rgba(92,48,24,0.34)"
          strokeWidth="2.3"
          strokeLinecap="round"
        />
        <path
          d={ROAD_PATH}
          fill="none"
          stroke="url(#roadGlow)"
          strokeWidth="1.55"
          strokeLinecap="round"
          strokeDasharray={`${Math.max(2, progressPct * 124)} 124`}
        />
      </svg>

      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          backgroundImage: 'radial-gradient(circle, rgba(72,50,30,0.18) 1px, transparent 1.6px)',
          backgroundSize: '34px 34px',
          opacity: 0.28,
          maskImage: 'linear-gradient(180deg, transparent 0%, black 18%, black 82%, transparent)',
        }}
      />

      {road.steps.map((roadStep, index) => {
        const point = roadPoint(index, road.steps.length);
        const active = index === stepIndex;
        const passed = index <= stepIndex;
        return (
          <button
            key={roadStep.title}
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onStep(index);
            }}
            style={{
              position: 'absolute',
              left: `${point.left}%`,
              top: `${point.top}%`,
              transform: 'translate(-50%, -50%)',
              zIndex: 4,
              width: active ? 68 : 38,
              height: active ? 68 : 38,
              borderRadius: '50%',
              border: `1.5px solid ${rgba(roadStep.color, active ? 1 : 0.56)}`,
              background: passed
                ? `radial-gradient(circle, ${rgba(roadStep.color, active ? 0.34 : 0.22)}, ${rgba(
                    roadStep.color,
                    0.09,
                  )})`
                : 'rgba(255,255,255,0.46)',
              boxShadow: active
                ? `0 0 0 8px ${rgba(roadStep.color, 0.1)}, 0 0 30px ${rgba(roadStep.color, 0.38)}`
                : '0 8px 18px rgba(58,36,18,0.12)',
              color: '#312315',
              fontFamily: SERIF,
              fontSize: active ? 10 : 0,
              lineHeight: 1.05,
              padding: active ? 5 : 0,
              cursor: 'pointer',
              transition: 'width 180ms ease, height 180ms ease, box-shadow 180ms ease',
            }}
            aria-label={`Open ${roadStep.title}`}
          >
            {active ? roadStep.era : ''}
          </button>
        );
      })}

      <div
        style={{
          position: 'absolute',
          left: `${activePoint.left}%`,
          top: `${Math.min(86, activePoint.top + 14)}%`,
          zIndex: 5,
          transform: 'translate(-42%, -62%)',
          transition: 'left 0.42s ease, top 0.42s ease',
          filter: 'drop-shadow(0 12px 12px rgba(50,30,14,0.18))',
          pointerEvents: 'none',
        }}
      >
        <Walker step={step} index={stepIndex} />
      </div>

      <div
        style={{
          position: 'absolute',
          left: 18,
          right: 18,
          bottom: 16,
          zIndex: 6,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'end',
          gap: 12,
        }}
      >
        <div style={{ fontFamily: SERIF, fontSize: 13, color: '#765638' }}>
          {stepIndex + 1} / {road.steps.length}
        </div>
        <div
          style={{
            border: `1px solid ${rgba(step.color, 0.38)}`,
            background: 'rgba(255,248,221,0.76)',
            color: rgba(step.color, 0.95),
            borderRadius: 999,
            padding: '7px 12px',
            fontFamily: SERIF,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          Tap road to continue
        </div>
      </div>
    </div>
  );
}

function StepPanel({
  step,
  stepIndex,
  total,
  visible,
  onNext,
  onBack,
}: {
  step: RoadStep;
  stepIndex: number;
  total: number;
  visible: number;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <aside
      style={{
        minHeight: 0,
        overflowY: 'auto',
        border: `1px solid ${rgba(step.color, 0.28)}`,
        background: 'rgba(255,247,222,0.9)',
        padding: 18,
        boxShadow: '0 18px 45px rgba(66,42,20,0.14)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          marginBottom: 12,
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
        <RoadSymbol type={stepIcon(step, stepIndex)} color={step.color} size={42} />
      </div>
      <h2 style={{ margin: '0 0 10px', fontFamily: SERIF, fontSize: 30, lineHeight: 0.98 }}>
        {step.title}
      </h2>
      <p style={{ margin: '0 0 14px', fontSize: 14, lineHeight: 1.58, color: '#60472e' }}>
        {step.scene}
      </p>
      <div style={{ display: 'grid', gap: 11 }}>
        {visible >= 1 && <Info label="What improved" text={step.improved} color={step.color} />}
        {visible >= 2 && <Info label="What remained" text={step.unresolved} color={step.color} />}
        {visible >= 3 && <Info label="Lesson" text={step.lesson} color={step.color} />}
        {visible >= 4 && <Info label="Simple act" text={step.action} color={step.color} strong />}
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
        <button
          type="button"
          onClick={onBack}
          disabled={stepIndex === 0}
          style={{
            flex: 1,
            border: '1px solid rgba(92,48,24,0.18)',
            background: 'rgba(255,255,255,0.34)',
            color: stepIndex === 0 ? 'rgba(74,48,26,0.34)' : '#4c321d',
            borderRadius: 8,
            padding: '10px 12px',
            fontFamily: SERIF,
            fontSize: 12,
            fontWeight: 700,
            cursor: stepIndex === 0 ? 'default' : 'pointer',
          }}
        >
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          style={{
            flex: 1.4,
            border: `1px solid ${rgba(step.color, 0.46)}`,
            background: rgba(step.color, 0.18),
            color: '#3b2a18',
            borderRadius: 8,
            padding: '10px 12px',
            fontFamily: SERIF,
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          {stepIndex === total - 1 && visible >= 4 ? 'Finish' : visible < 4 ? 'Reveal' : 'Next'}
        </button>
      </div>
    </aside>
  );
}

export default function ProgressRoadPrototype() {
  const [roadKey, setRoadKey] = useState(PROGRESS_ROADS[0].key);
  const road = PROGRESS_ROADS.find((item) => item.key === roadKey) ?? PROGRESS_ROADS[0];
  const [stepIndex, setStepIndex] = useState(0);
  const [reveal, setReveal] = useState(1);
  const step = road.steps[stepIndex];
  const visible = Math.min(reveal, 4);
  const progressPct = road.steps.length > 1 ? stepIndex / (road.steps.length - 1) : 0;
  const strip = useMemo(() => road.steps.map((item) => item.color), [road.steps]);

  function selectRoad(nextRoad: ProgressRoad) {
    setRoadKey(nextRoad.key);
    setStepIndex(0);
    setReveal(1);
  }

  function previous() {
    setStepIndex((current) => Math.max(0, current - 1));
    setReveal(1);
  }

  function next() {
    if (reveal < 4) {
      setReveal((current) => Math.min(current + 1, 4));
      return;
    }
    if (stepIndex === road.steps.length - 1) {
      backToEducation();
      return;
    }
    setStepIndex((current) => Math.min(current + 1, road.steps.length - 1));
    setReveal(1);
  }

  function backToEducation() {
    try {
      sessionStorage.setItem('colourmap:open-education', '1');
    } catch {}
    window.location.assign('/day');
  }

  return (
    <main
      className="progress-road-shell"
      style={{
        height: 'calc(100svh - 116px)',
        minHeight: 620,
        padding: 14,
        background:
          'linear-gradient(180deg, #f4e2ba 0%, #d5ba83 100%), radial-gradient(circle at 86% 8%, rgba(118,160,155,0.24), transparent 26%)',
        color: '#302316',
        display: 'grid',
        gridTemplateRows: 'auto minmax(0, 1fr)',
        gap: 12,
        overflow: 'hidden',
      }}
    >
      <style>{`
        @media (max-width: 820px) {
          .progress-road-shell {
            height: auto !important;
            min-height: calc(100svh - 104px) !important;
            overflow: visible !important;
          }
          .progress-road-workspace {
            grid-template-columns: 1fr !important;
            grid-template-rows: auto minmax(520px, 58svh) auto !important;
            overflow: visible !important;
          }
          .progress-road-rail {
            max-height: none !important;
          }
          .progress-road-selector {
            display: flex !important;
            overflow-x: auto !important;
            padding-bottom: 4px !important;
          }
          .progress-road-selector > button {
            min-width: max-content !important;
          }
          .progress-road-title {
            font-size: 29px !important;
          }
        }
      `}</style>
      <section
        style={{
          display: 'flex',
          alignItems: 'end',
          justifyContent: 'space-between',
          gap: 14,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{ fontFamily: SERIF, fontSize: 12, letterSpacing: '0.18em', color: '#7a5a36' }}
          >
            Progress Road
          </div>
          <h1
            className="progress-road-title"
            style={{ fontFamily: SERIF, fontSize: 38, lineHeight: 0.96, margin: '5px 0 7px' }}
          >
            {road.title}
          </h1>
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.45, color: '#5b432b' }}>
            {road.subtitle}
          </p>
        </div>
        <EducationButton onClick={backToEducation} />
      </section>

      <div
        className="progress-road-workspace"
        style={{
          minHeight: 0,
          display: 'grid',
          gridTemplateColumns: '210px minmax(0, 1fr) minmax(290px, 350px)',
          gap: 12,
          overflow: 'hidden',
        }}
      >
        <section
          className="progress-road-rail"
          style={{
            minHeight: 0,
            overflow: 'hidden',
            display: 'grid',
            gridTemplateRows: 'auto minmax(0, 1fr)',
            gap: 12,
            border: '1px solid rgba(92,48,24,0.14)',
            background: 'rgba(252,242,206,0.72)',
            padding: 12,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: SERIF,
                fontSize: 11,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: '#765638',
                marginBottom: 7,
              }}
            >
              Roads
            </div>
            <div
              style={{
                height: 5,
                display: 'grid',
                gridTemplateColumns: `repeat(${strip.length}, 1fr)`,
                overflow: 'hidden',
                background: 'rgba(92,48,24,0.1)',
              }}
            >
              {strip.map((color, index) => (
                <span key={`${color}-${index}`} style={{ background: rgba(color, 0.72) }} />
              ))}
            </div>
          </div>
          <div className="progress-road-selector" style={{ minHeight: 0 }}>
            <RoadSelector roads={PROGRESS_ROADS} active={road} onSelect={selectRoad} />
          </div>
        </section>

        <RoadCanvas
          road={road}
          step={step}
          stepIndex={stepIndex}
          progressPct={progressPct}
          onStep={(index) => {
            setStepIndex(index);
            setReveal(1);
          }}
          onAdvance={next}
        />

        <StepPanel
          step={step}
          stepIndex={stepIndex}
          total={road.steps.length}
          visible={visible}
          onNext={next}
          onBack={previous}
        />
      </div>
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

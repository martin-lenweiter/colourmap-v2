'use client';

type FeelingAxis = 'attitude' | 'emotions' | 'presence' | 'body';

const AXES: {
  key: FeelingAxis;
  label: string;
  x: string;
  y: string;
  textClass: string;
}[] = [
  { key: 'attitude', label: 'Attitude', x: '50%', y: '5%', textClass: '-translate-x-1/2' },
  { key: 'body', label: 'Body', x: '91%', y: '50%', textClass: '-translate-y-1/2' },
  {
    key: 'presence',
    label: 'Presence',
    x: '50%',
    y: '91%',
    textClass: '-translate-x-1/2 -translate-y-full',
  },
  {
    key: 'emotions',
    label: 'Emotions',
    x: '9%',
    y: '50%',
    textClass: '-translate-x-full -translate-y-1/2',
  },
];

const SEGMENTS = [
  { key: 'attitude' as FeelingAxis, d: 'M 90 90 L 90 32 A 58 58 0 0 1 148 90 Z' },
  { key: 'body' as FeelingAxis, d: 'M 90 90 L 148 90 A 58 58 0 0 1 90 148 Z' },
  { key: 'presence' as FeelingAxis, d: 'M 90 90 L 90 148 A 58 58 0 0 1 32 90 Z' },
  { key: 'emotions' as FeelingAxis, d: 'M 90 90 L 32 90 A 58 58 0 0 1 90 32 Z' },
];

interface FeelingCompassProps {
  values: Partial<Record<FeelingAxis, number>>;
  onChange: (values: Partial<Record<FeelingAxis, number>>) => void;
}

function nextValue(value: number | undefined): number {
  if (value == null) return 25;
  if (value >= 100) return 0;
  return value + 25;
}

export default function FeelingCompass({ values, onChange }: FeelingCompassProps) {
  return (
    <div className="space-y-4 px-2 py-2">
      <p className="text-center text-[11px] font-semibold uppercase tracking-[0.24em] text-[#ba7c2d]">
        Feeling
      </p>
      <div className="grid items-center gap-5 md:grid-cols-[88px_minmax(0,1fr)_88px]">
        <div className="hidden space-y-4 md:block">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#c97632] text-lg font-semibold italic text-[#fff8ee] shadow-[0_12px_30px_-18px_rgba(120,52,12,0.7)]">
            A
          </div>
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#edc4aa] text-lg font-semibold italic text-[#fff8ee] shadow-[0_12px_30px_-18px_rgba(120,52,12,0.55)]">
            E
          </div>
        </div>
        <div className="relative mx-auto h-[220px] w-[220px]">
          <svg viewBox="0 0 180 180" className="h-full w-full">
            <circle
              cx="90"
              cy="90"
              r="58"
              fill="none"
              stroke="#ddb97f"
              strokeWidth="1.5"
              opacity="0.7"
            />
            <line
              x1="47"
              y1="47"
              x2="133"
              y2="133"
              stroke="#ddb97f"
              strokeWidth="1.2"
              opacity="0.7"
            />
            <line
              x1="133"
              y1="47"
              x2="47"
              y2="133"
              stroke="#ddb97f"
              strokeWidth="1.2"
              opacity="0.7"
            />
            {SEGMENTS.map((segment) => {
              const value = values[segment.key] ?? 0;
              return (
                <path
                  key={segment.key}
                  d={segment.d}
                  fill="#c98a43"
                  opacity={0.12 + value / 140}
                  stroke="#ddb97f"
                  strokeWidth="0.6"
                />
              );
            })}
            <circle cx="90" cy="90" r="13" fill="#d49a55" opacity="0.18" />
          </svg>
          {AXES.map((axis) => (
            <button
              key={axis.key}
              type="button"
              onClick={() =>
                onChange({
                  ...values,
                  [axis.key]: nextValue(values[axis.key]),
                })
              }
              className={`absolute rounded-full px-3 py-1.5 text-xs italic transition-colors ${axis.textClass}`}
              style={{
                left: axis.x,
                top: axis.y,
                background: '#f6ead7',
                color: '#6b4830',
                border: '1px solid rgba(196, 160, 96, 0.24)',
              }}
              aria-label={`${axis.label} ${values[axis.key] ?? 0}%`}
            >
              {axis.label}
              <span className="ml-1 text-[10px] not-italic text-[#ba7c2d]">
                {values[axis.key] ?? 0}%
              </span>
            </button>
          ))}
        </div>
        <div className="hidden justify-self-end space-y-4 md:block">
          <div className="ml-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#dcb082] text-lg font-semibold italic text-[#fff8ee] shadow-[0_12px_30px_-18px_rgba(120,52,12,0.55)]">
            P
          </div>
          <div className="ml-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#eab996] text-lg font-semibold italic text-[#fff8ee] shadow-[0_12px_30px_-18px_rgba(120,52,12,0.55)]">
            B
          </div>
        </div>
      </div>
      <p className="text-center text-[10px] text-[#8f6a47]">
        Tap each dimension to step through its intensity.
      </p>
    </div>
  );
}

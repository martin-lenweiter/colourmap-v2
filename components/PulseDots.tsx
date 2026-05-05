'use client';

import { useEffect, useState } from 'react';
import SquareSlider from '@/components/SquareSlider';

type PulseAxis = 'feeling' | 'doing' | 'sharing';

const LS_PULSE = 'colourmap:fds-pulse';
const font = 'var(--font-serif)';

const AXIS_COLORS: Record<PulseAxis, string> = {
  feeling: '#D4805A',
  doing: '#6890B0',
  sharing: '#6B7F4E',
};

const PULSE_DIMS: Record<
  PulseAxis,
  { key: string; label: string; scale: string[]; levels: string[] }[]
> = {
  feeling: [
    {
      key: 'body',
      label: 'Body',
      scale: ['#AABCCC', '#B8B4CC', '#CCACB8', '#D8A8A0', '#D49890'],
      levels: ['Exhausted', 'Heavy', 'Neutral', 'Energised', 'Vibrant'],
    },
    {
      key: 'heart',
      label: 'Heart',
      scale: ['#A8C8C0', '#B0C4B4', '#C4B4C0', '#D0A8B8', '#CC98A8'],
      levels: ['Numb', 'Heavy', 'Tender', 'Open', 'Glowing'],
    },
    {
      key: 'mind',
      label: 'Mind',
      scale: ['#D8CCA8', '#C4C4C4', '#B0B8D4', '#98AACC', '#8898C0'],
      levels: ['Foggy', 'Scattered', 'Present', 'Clear', 'Sharp'],
    },
  ],
  doing: [
    {
      key: 'clarity',
      label: 'Clarity',
      scale: ['#D8C8A0', '#C0C8A8', '#A8C4B8', '#90B8D0', '#78A8C8'],
      levels: ['Lost', 'Hazy', 'Oriented', 'Focused', 'Locked in'],
    },
    {
      key: 'drive',
      label: 'Drive',
      scale: ['#A8C4B0', '#B8C4A0', '#D0BC90', '#D8A878', '#CC9060'],
      levels: ['Drained', 'Slow', 'Moving', 'Motivated', 'On fire'],
    },
    {
      key: 'progress',
      label: 'Progress',
      scale: ['#C0B4D4', '#A8BCC8', '#90C0B4', '#78BCA0', '#6CB488'],
      levels: ['Stuck', 'Crawling', 'Steady', 'Flowing', 'Momentum'],
    },
  ],
  sharing: [
    {
      key: 'closeness',
      label: 'Closeness',
      scale: ['#D4C0C0', '#C4C4B8', '#B4C8B0', '#98C0A4', '#84B490'],
      levels: ['Isolated', 'Distant', 'Present', 'Connected', 'Intimate'],
    },
    {
      key: 'expression',
      label: 'Expression',
      scale: ['#A8C0D8', '#B8C0C4', '#C8BEB0', '#D4B890', '#CCA870'],
      levels: ['Muted', 'Guarded', 'Open', 'Expressive', 'Flowing'],
    },
    {
      key: 'nourishment',
      label: 'Nourishment',
      scale: ['#C0B0D4', '#A8BCC8', '#A0C4B8', '#8CC0A8', '#7AB494'],
      levels: ['Depleted', 'Hungry', 'Sustained', 'Fed', 'Nourished'],
    },
  ],
};

function DimCard({
  dim,
  val,
  onSlide,
  isFirst,
  onCollapse,
}: {
  dim: (typeof PULSE_DIMS)[PulseAxis][number];
  val: number;
  onSlide: (i: number) => void;
  isFirst?: boolean;
  onCollapse?: () => void;
}) {
  const color = dim.scale[val];
  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <div
        onClick={isFirst ? onCollapse : undefined}
        style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: color,
          opacity: 0.92,
          boxShadow: `0 8px 24px -8px ${color}99`,
          transition: 'background 0.3s, box-shadow 0.3s',
          cursor: isFirst ? 'pointer' : 'default',
        }}
      />
      <span
        style={{
          fontFamily: font,
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color,
          transition: 'color 0.3s',
        }}
      >
        {dim.label}
      </span>
      <span
        className="italic"
        style={{
          fontFamily: font,
          fontSize: 14,
          color: '#1A1A1A',
          opacity: 0.75,
          letterSpacing: '0.03em',
        }}
      >
        {dim.levels[val]}
      </span>
      <SquareSlider colors={dim.scale} value={val} onChange={onSlide} />
    </div>
  );
}

export default function PulseDots({ axisKey }: { axisKey: PulseAxis }) {
  const axisColor = AXIS_COLORS[axisKey];
  const dims = PULSE_DIMS[axisKey];

  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<Record<string, number>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_PULSE);
      const all = raw ? (JSON.parse(raw) as Record<string, Record<string, number>>) : {};
      const saved = all[axisKey] ?? {};
      const defaults: Record<string, number> = {};
      for (const d of dims) defaults[d.key] = saved[d.key] ?? 2;
      setValues(defaults);
    } catch {}
  }, [axisKey, dims]);

  function slide(key: string, val: number) {
    const updated = { ...values, [key]: val };
    setValues(updated);
    try {
      const raw = localStorage.getItem(LS_PULSE);
      const all = raw ? (JSON.parse(raw) as Record<string, Record<string, number>>) : {};
      localStorage.setItem(LS_PULSE, JSON.stringify({ ...all, [axisKey]: updated }));
    } catch {}
  }

  return (
    <div className="flex flex-col items-center w-full py-1">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '6px 16px',
          }}
        >
          <span
            style={{
              display: 'block',
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: axisColor,
              opacity: 0.2,
              transition: 'opacity 0.22s',
            }}
          />
        </button>
      ) : (
        <div
          className="flex flex-col items-center gap-6 pb-6 pt-2 animate-in fade-in duration-300"
          style={{ width: 200 }}
        >
          {dims.map((dim, i) => (
            <DimCard
              key={dim.key}
              dim={dim}
              val={values[dim.key] ?? 2}
              onSlide={(v) => slide(dim.key, v)}
              isFirst={i === 0}
              onCollapse={() => setOpen(false)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

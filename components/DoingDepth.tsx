'use client';

import { useEffect, useState } from 'react';

/* ═══════════════════════════════════════════════════════════
   DOING DEPTH — The Life Wheel
   Box 3: Radar chart using trackers from Box 1 as spokes.
   ═══════════════════════════════════════════════════════════ */

const TRACKERS_KEY = 'colourmap:doing-trackers-list';

function loadTrackers(): { id: string; name: string; days: boolean[] }[] {
  try {
    return JSON.parse(localStorage.getItem(TRACKERS_KEY) || '[]');
  } catch {
    return [];
  }
}

export default function DoingDepth() {
  const [trackers, setTrackers] = useState<{ id: string; name: string; days: boolean[] }[]>([]);

  useEffect(() => {
    setTrackers(loadTrackers());
    const poll = () => setTrackers(loadTrackers());
    window.addEventListener('focus', poll);
    const interval = setInterval(poll, 3000);
    return () => {
      window.removeEventListener('focus', poll);
      clearInterval(interval);
    };
  }, []);

  const sz = 220;
  const cx = sz / 2;
  const cy = sz / 2;
  const maxR = 85;

  if (trackers.length === 0) {
    return (
      <div
        className="space-y-4 rounded-3xl border border-[#8A6A4A50] px-5 py-6"
        style={{
          background: 'linear-gradient(180deg, rgba(242,232,210,0.97), rgba(236,224,204,0.95))',
          boxShadow: '0 28px 55px -36px rgba(92,48,24,0.3)',
        }}
      >
        <p
          className="text-center text-[11px] font-semibold uppercase tracking-[0.24em]"
          style={{ color: '#7A9A7A' }}
        >
          Life Wheel
        </p>
        <p
          className="text-center text-xs"
          style={{ color: '#7A9A7A', opacity: 0.4, fontFamily: 'var(--font-handwritten)' }}
        >
          Add trackers above to see your wheel.
        </p>
      </div>
    );
  }

  const count = trackers.length;
  const points = trackers.map((t, i) => {
    const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
    const completed = t.days.filter(Boolean).length;
    const r = maxR * (completed / 7);
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
      lx: cx + (maxR + 16) * Math.cos(angle),
      ly: cy + (maxR + 16) * Math.sin(angle),
      name: t.name,
      completed,
      angle,
    };
  });

  const dataPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
  const totalCompleted = trackers.reduce((s, t) => s + t.days.filter(Boolean).length, 0);
  const rhythmScore = Math.round((totalCompleted / (count * 7)) * 100);

  return (
    <div
      className="space-y-4 rounded-3xl border border-[#8A6A4A50] px-5 py-6"
      style={{
        background: 'linear-gradient(180deg, rgba(242,232,210,0.97), rgba(236,224,204,0.95))',
        boxShadow: '0 28px 55px -36px rgba(92,48,24,0.3)',
      }}
    >
      <p
        className="text-center text-[11px] font-semibold uppercase tracking-[0.24em]"
        style={{ color: '#7A9A7A' }}
      >
        Life Wheel
      </p>

      <div className="flex justify-center">
        <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`}>
          {/* Grid rings */}
          {[0.25, 0.5, 0.75, 1].map((r) => (
            <circle
              key={r}
              cx={cx}
              cy={cy}
              r={maxR * r}
              fill="none"
              stroke="#C4B890"
              strokeWidth="0.4"
              opacity={0.1}
            />
          ))}

          {/* Spokes */}
          {points.map((p, i) => (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={cx + maxR * Math.cos(p.angle)}
              y2={cy + maxR * Math.sin(p.angle)}
              stroke="#C4B890"
              strokeWidth="0.3"
              opacity={0.15}
            />
          ))}

          {/* Data polygon */}
          {count >= 3 && (
            <path
              d={dataPath}
              fill="#7A9A7A"
              opacity={0.12}
              stroke="#7A9A7A"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          )}

          {/* Data dots + labels */}
          {points.map((p) => (
            <g key={p.name}>
              <circle cx={p.x} cy={p.y} r={3.5} fill="#7A9A7A" opacity={0.6} />
              <text
                x={p.lx}
                y={p.ly}
                textAnchor="middle"
                dominantBaseline="middle"
                style={{
                  fontSize: '9px',
                  fontFamily: 'var(--font-handwritten)',
                  fontWeight: 600,
                  fill: '#7A9A7A',
                }}
              >
                {p.name}
              </text>
            </g>
          ))}

          {/* Center score */}
          <text
            x={cx}
            y={cy + 2}
            textAnchor="middle"
            dominantBaseline="middle"
            style={{
              fontSize: '18px',
              fontFamily: 'var(--font-handwritten)',
              fontWeight: 700,
              fill: '#7A9A7A',
              opacity: 0.6,
            }}
          >
            {rhythmScore}
          </text>
          <text
            x={cx}
            y={cy + 16}
            textAnchor="middle"
            style={{
              fontSize: '7px',
              fontFamily: 'var(--font-handwritten)',
              fill: '#7A9A7A',
              opacity: 0.35,
            }}
          >
            rhythm
          </text>
        </svg>
      </div>
    </div>
  );
}

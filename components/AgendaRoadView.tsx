'use client';

/* ═══════════════════════════════════════════════════════════
   AGENDA ROAD VIEW — perspective pyramid view of daily blocks.
   Inspired by Guitar Hero: blocks ascend toward a horizon point.
   Toggle on/off from the agenda — does not replace the normal view.
   ═══════════════════════════════════════════════════════════ */

interface Block {
  id: string;
  text: string;
  startHour: number;
  duration: number;
  color: string;
  kind: 'mission' | 'emotion';
}

interface Props {
  blocks: Block[];
  wakeHour: number;
}

export default function AgendaRoadView({ blocks, wakeHour }: Props) {
  // Sort blocks by startHour ascending (closest = bottom, furthest = top)
  const sorted = [...blocks].sort((a, b) => a.startHour - b.startHour);
  const totalHours = 22 - wakeHour;
  const W = 340;
  const H = 320;

  // Perspective: bottom is wide (full width), top narrows to a point
  // Each block is a horizontal pill placed at its perspective depth
  const vanishY = 20; // horizon point Y
  const baseY = H - 20; // bottom of the road
  const vanishX = W / 2; // center convergence

  return (
    <div className="relative overflow-hidden rounded-2xl" style={{ width: W, height: H }}>
      {/* Gradient sky background */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, #E8C8A0 0%, #F0DCC0 40%, #F5ECDC 100%)',
        }}
      />

      {/* Perspective grid lines */}
      {[0.2, 0.4, 0.6, 0.8].map((t) => {
        const y = vanishY + (baseY - vanishY) * t;
        const widthAtY = W * 0.15 + W * 0.85 * t;
        const x = (W - widthAtY) / 2;
        return (
          <div
            key={t}
            className="absolute"
            style={{
              top: y,
              left: x,
              width: widthAtY,
              height: 1,
              background: '#5C301810',
            }}
          />
        );
      })}

      {/* Left and right perspective lines */}
      <svg className="absolute inset-0" width={W} height={H} style={{ pointerEvents: 'none' }}>
        <line x1={vanishX} y1={vanishY} x2={0} y2={baseY} stroke="#5C301808" strokeWidth={1} />
        <line x1={vanishX} y1={vanishY} x2={W} y2={baseY} stroke="#5C301808" strokeWidth={1} />
      </svg>

      {/* Horizon label */}
      <p
        className="absolute text-center"
        style={{
          top: 4,
          left: 0,
          right: 0,
          fontFamily: 'var(--font-handwritten)',
          fontSize: '13px',
          color: '#5C3018',
          opacity: 0.5,
        }}
      >
        → horizon
      </p>

      {/* Blocks as perspective pills */}
      {sorted.map((block, idx) => {
        // t=0 is first hour (bottom), t=1 is last hour (top/horizon)
        const hourOffset = block.startHour - wakeHour;
        const t = totalHours > 0 ? hourOffset / totalHours : 0;
        // Invert: early hours at bottom, later hours at top
        const depth = 1 - t;

        const y = vanishY + (baseY - vanishY) * (1 - depth);
        const widthAtDepth = 60 + (W - 120) * depth;
        const x = (W - widthAtDepth) / 2;
        const pillH = Math.max(24, 36 * depth);
        const fontSize = Math.max(11, 14 * depth);
        const opacity = 0.4 + 0.6 * depth;

        return (
          <div
            key={block.id}
            className="absolute flex items-center justify-center rounded-full transition-all"
            style={{
              left: x,
              top: y - pillH / 2,
              width: widthAtDepth,
              height: pillH,
              background: block.color,
              opacity,
              boxShadow: `0 2px 8px -2px ${block.color}40`,
            }}
          >
            <span
              className="truncate px-3"
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize,
                fontWeight: 600,
                color: '#F5ECDC',
                maxWidth: widthAtDepth - 16,
              }}
            >
              {block.text}
            </span>
          </div>
        );
      })}

      {/* Step labels on the left */}
      {sorted.map((block, idx) => {
        const hourOffset = block.startHour - wakeHour;
        const t = totalHours > 0 ? hourOffset / totalHours : 0;
        const depth = 1 - t;
        const y = vanishY + (baseY - vanishY) * (1 - depth);

        return (
          <span
            key={`label-${block.id}`}
            className="absolute"
            style={{
              left: 6,
              top: y - 7,
              fontFamily: 'var(--font-serif)',
              fontSize: '10px',
              fontWeight: 600,
              color: '#5C3018',
              opacity: 0.35,
            }}
          >
            {String(block.startHour).padStart(2, '0')}h
          </span>
        );
      })}
    </div>
  );
}

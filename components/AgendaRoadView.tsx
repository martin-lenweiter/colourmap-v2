'use client';

/* ═══════════════════════════════════════════════════════════
   AGENDA ROAD VIEW — perspective road with missions as steps.
   Inspired by Guitar Hero / road to horizon.
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
  const sorted = [...blocks].sort((a, b) => a.startHour - b.startHour);
  const totalHours = 22 - wakeHour;
  const W = 340;
  const H = 360;

  const vanishX = W / 2;
  const vanishY = 30;
  const baseY = H - 30;
  const roadSpan = baseY - vanishY;

  // Road edges at a given depth (0=horizon, 1=bottom)
  const roadLeft = (depth: number) => vanishX - (vanishX - 20) * depth;
  const roadRight = (depth: number) => vanishX + (vanishX - 20) * depth;

  return (
    <div className="relative overflow-hidden rounded-2xl" style={{ width: W, height: H }}>
      {/* Sky gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, #D8A878 0%, #E8C8A0 30%, #F0DCC0 60%, #F5ECDC 100%)',
        }}
      />

      {/* Road surface — trapezoid */}
      <svg className="absolute inset-0" width={W} height={H} style={{ pointerEvents: 'none' }}>
        {/* Road fill */}
        <polygon
          points={`${vanishX},${vanishY} ${roadLeft(1)},${baseY} ${roadRight(1)},${baseY}`}
          fill="#C4A06018"
        />
        {/* Road edges */}
        <line
          x1={vanishX}
          y1={vanishY}
          x2={roadLeft(1)}
          y2={baseY}
          stroke="#5C301815"
          strokeWidth={2}
        />
        <line
          x1={vanishX}
          y1={vanishY}
          x2={roadRight(1)}
          y2={baseY}
          stroke="#5C301815"
          strokeWidth={2}
        />
        {/* Center dashed line */}
        <line
          x1={vanishX}
          y1={vanishY}
          x2={vanishX}
          y2={baseY}
          stroke="#C4A06030"
          strokeWidth={1.5}
          strokeDasharray="6 8"
        />
        {/* Horizon line */}
        <line x1={30} y1={vanishY} x2={W - 30} y2={vanishY} stroke="#5C301810" strokeWidth={1} />
        {/* Horizontal depth markers */}
        {[0.2, 0.35, 0.5, 0.65, 0.8, 0.92].map((d) => {
          const y = vanishY + roadSpan * d;
          return (
            <line
              key={d}
              x1={roadLeft(d)}
              y1={y}
              x2={roadRight(d)}
              y2={y}
              stroke="#5C301808"
              strokeWidth={1}
            />
          );
        })}
      </svg>

      {/* Horizon marker */}
      <div
        className="absolute"
        style={{
          top: vanishY - 14,
          left: 0,
          right: 0,
          textAlign: 'center',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-handwritten)',
            fontSize: '12px',
            color: '#5C3018',
            opacity: 0.4,
          }}
        >
          horizon
        </span>
      </div>

      {/* Blocks as road pills — early hours at bottom, later at top */}
      {sorted.map((block) => {
        const hourOffset = block.startHour - wakeHour;
        const t = totalHours > 0 ? hourOffset / totalHours : 0;
        const depth = 1 - t; // 1=bottom (now), 0=horizon (later)

        const y = vanishY + roadSpan * (1 - depth);
        const left = roadLeft(depth);
        const right = roadRight(depth);
        const pillW = (right - left) * 0.75;
        const pillX = vanishX - pillW / 2;
        const pillH = Math.max(22, 34 * depth);
        const fontSize = Math.max(10, 14 * depth);
        const opacity = 0.5 + 0.5 * depth;

        return (
          <div
            key={block.id}
            className="absolute flex items-center justify-center rounded-full transition-all"
            style={{
              left: pillX,
              top: y - pillH / 2,
              width: pillW,
              height: pillH,
              background: block.color,
              opacity,
              boxShadow: `0 2px 10px -3px ${block.color}50`,
            }}
          >
            <span
              className="truncate px-3"
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize,
                fontWeight: 600,
                color: '#F5ECDC',
                maxWidth: pillW - 12,
              }}
            >
              {block.text}
            </span>
          </div>
        );
      })}

      {/* Hour labels along the left road edge */}
      {sorted.map((block) => {
        const hourOffset = block.startHour - wakeHour;
        const t = totalHours > 0 ? hourOffset / totalHours : 0;
        const depth = 1 - t;
        const y = vanishY + roadSpan * (1 - depth);
        const left = roadLeft(depth);

        return (
          <span
            key={`h-${block.id}`}
            className="absolute"
            style={{
              left: left - 4,
              top: y - 6,
              fontFamily: 'var(--font-serif)',
              fontSize: Math.max(9, 11 * depth),
              fontWeight: 600,
              color: '#5C3018',
              opacity: 0.3 + 0.2 * depth,
              textAlign: 'right',
              transform: 'translateX(-100%)',
            }}
          >
            {String(block.startHour).padStart(2, '0')}h
          </span>
        );
      })}

      {/* Empty state */}
      {sorted.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p
            style={{
              fontFamily: 'var(--font-handwritten)',
              fontSize: '16px',
              color: '#5C3018',
              opacity: 0.3,
            }}
          >
            add missions to see the road
          </p>
        </div>
      )}
    </div>
  );
}

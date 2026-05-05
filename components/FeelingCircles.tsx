'use client';

import { useEffect, useRef, useState } from 'react';

const BODY_LEVELS = [
  { label: 'Depleted', color: '#B89898' },
  { label: 'Tired', color: '#C8A888' },
  { label: 'Okay', color: '#D4BC80' },
  { label: 'Good', color: '#A0C898' },
  { label: 'Energized', color: '#78C8A8' },
];

const MIND_LEVELS = [
  { label: 'Absent', color: '#E0908A' },
  { label: 'Scattered', color: '#E8B898' },
  { label: 'Confused', color: '#C8A8C8' },
  { label: 'Drifting', color: '#D8C088' },
  { label: 'Present', color: '#A8CCA0' },
  { label: 'Flowing', color: '#B0A0D0' },
];

const EMOTION_LEVELS = [
  { label: 'Shame', color: '#B8D0E8' },
  { label: 'Apathy', color: '#D8B0C8' },
  { label: 'Grief', color: '#E8A0C4' },
  { label: 'Fear', color: '#F080B8' },
  { label: 'Anger', color: '#F0A088' },
  { label: 'Courage', color: '#F8C040' },
  { label: 'Acceptance', color: '#F0E060' },
  { label: 'Reason', color: '#A8E090' },
  { label: 'Love', color: '#88D8B0' },
  { label: 'Peace', color: '#88C8E8' },
];

function loadNum(key: string, fallback: number): number {
  try {
    const v = localStorage.getItem(key);
    return v !== null ? Math.max(0, Number(v)) : fallback;
  } catch {
    return fallback;
  }
}

function DraggableCircle({
  levels,
  idx,
  onChange,
  title,
}: {
  levels: { label: string; color: string }[];
  idx: number;
  onChange: (i: number) => void;
  title: string;
}) {
  const dragRef = useRef<{ startX: number; startIdx: number } | null>(null);
  const idxRef = useRef(idx);
  idxRef.current = idx;

  const current = levels[idx];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <span
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 10,
          fontWeight: 700,
          color: '#7A5438',
          opacity: 0.5,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
        }}
      >
        {title}
      </span>
      <span
        className="block rounded-full"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          dragRef.current = { startX: e.clientX, startIdx: idxRef.current };
        }}
        onPointerMove={(e) => {
          if (!dragRef.current || e.buttons !== 1) return;
          const dx = e.clientX - dragRef.current.startX;
          const steps = Math.round(dx / 22);
          const next = Math.max(0, Math.min(levels.length - 1, dragRef.current.startIdx + steps));
          if (next !== idxRef.current) onChange(next);
        }}
        onPointerUp={() => {
          dragRef.current = null;
        }}
        style={{
          display: 'block',
          width: 90,
          height: 90,
          background: current.color,
          boxShadow: `0 12px 32px -8px ${current.color}88`,
          transition: 'background 0.3s, box-shadow 0.3s',
          cursor: 'ew-resize',
          touchAction: 'none',
          userSelect: 'none',
        }}
      />
      <span
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 12,
          fontWeight: 700,
          color: current.color,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          transition: 'color 0.3s',
        }}
      >
        {current.label}
      </span>
    </div>
  );
}

export default function FeelingCircles() {
  const [bodyIdx, setBodyIdx] = useState(2);
  const [mindIdx, setMindIdx] = useState(3);
  const [emotionIdx, setEmotionIdx] = useState(4);

  useEffect(() => {
    setBodyIdx(Math.min(BODY_LEVELS.length - 1, loadNum('colourmap:body-idx', 2)));
    setMindIdx(Math.min(MIND_LEVELS.length - 1, loadNum('colourmap:presence-idx', 3)));
    setEmotionIdx(Math.min(EMOTION_LEVELS.length - 1, loadNum('colourmap:process-idx', 4)));
  }, []);

  function pickBody(i: number) {
    setBodyIdx(i);
    try {
      localStorage.setItem('colourmap:body-idx', String(i));
    } catch {}
  }

  function pickMind(i: number) {
    setMindIdx(i);
    try {
      localStorage.setItem('colourmap:presence-idx', String(i));
    } catch {}
  }

  function pickEmotion(i: number) {
    setEmotionIdx(i);
    try {
      localStorage.setItem('colourmap:process-idx', String(i));
    } catch {}
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'flex-start',
        padding: '12px 0 16px',
      }}
    >
      <DraggableCircle levels={BODY_LEVELS} idx={bodyIdx} onChange={pickBody} title="Body" />
      <DraggableCircle levels={MIND_LEVELS} idx={mindIdx} onChange={pickMind} title="Mind" />
      <DraggableCircle
        levels={EMOTION_LEVELS}
        idx={emotionIdx}
        onChange={pickEmotion}
        title="Emotions"
      />
    </div>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import SquareSlider from '@/components/SquareSlider';

const BODY_LEVELS = [
  { label: 'Depleted', color: '#A89090' },
  { label: 'Tired', color: '#B8A080' },
  { label: 'Okay', color: '#C4B478' },
  { label: 'Good', color: '#98B890' },
  { label: 'Energized', color: '#70B098' },
];

const MIND_LEVELS = [
  { label: 'Absent', color: '#B89088' },
  { label: 'Scattered', color: '#C4A888' },
  { label: 'Confused', color: '#B0A0B8' },
  { label: 'Drifting', color: '#C4B880' },
  { label: 'Present', color: '#98BC90' },
  { label: 'Flowing', color: '#A098C0' },
];

const EMOTION_LEVELS = [
  { label: 'Shame', color: '#A8C0D0' },
  { label: 'Apathy', color: '#C0A0B8' },
  { label: 'Grief', color: '#C098B0' },
  { label: 'Fear', color: '#C07898' },
  { label: 'Anger', color: '#C49080' },
  { label: 'Courage', color: '#C8A858' },
  { label: 'Acceptance', color: '#C4C068' },
  { label: 'Reason', color: '#90B880' },
  { label: 'Love', color: '#80B898' },
  { label: 'Peace', color: '#80B0C8' },
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
  const [dragging, setDragging] = useState(false);
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
          setDragging(true);
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
          setDragging(false);
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

      {/* Slider — appears while dragging */}
      <div
        style={{
          maxHeight: dragging ? 40 : 0,
          opacity: dragging ? 1 : 0,
          overflow: 'hidden',
          transition: 'max-height 0.15s, opacity 0.15s',
          pointerEvents: dragging ? 'auto' : 'none',
        }}
      >
        <SquareSlider
          colors={levels.map((l) => l.color)}
          value={idx}
          onChange={onChange}
          size={16}
          gap={5}
        />
      </div>
    </div>
  );
}

export default function FeelingCircles() {
  const [bodyIdx, setBodyIdx] = useState(2);
  const [mindIdx, setMindIdx] = useState(3);
  const [emotionIdx, setEmotionIdx] = useState(4);
  const [depthOpen, setDepthOpen] = useState(false);

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
        flexDirection: 'column',
        alignItems: 'center',
        gap: 24,
        padding: '12px 0 16px',
      }}
    >
      {/* Primary: Emotion circle always visible */}
      <DraggableCircle
        levels={EMOTION_LEVELS}
        idx={emotionIdx}
        onChange={pickEmotion}
        title="Emotions"
      />

      {/* Ochre diamond — expands Body + Mind */}
      <button
        type="button"
        onClick={() => setDepthOpen((v) => !v)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '0',
        }}
      >
        <span
          style={{
            display: 'block',
            width: 10,
            height: 10,
            background: depthOpen ? '#C4A060' : '#C4A06050',
            transform: 'rotate(45deg)',
            transition: 'background 0.2s',
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 11,
            fontWeight: 700,
            color: '#C4A060',
            opacity: depthOpen ? 0.9 : 0.5,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            transition: 'opacity 0.2s',
          }}
        >
          body · mind
        </span>
      </button>

      {/* Body + Mind — expand below */}
      <div
        style={{
          maxHeight: depthOpen ? 400 : 0,
          opacity: depthOpen ? 1 : 0,
          overflow: 'hidden',
          transition: 'max-height 0.25s ease, opacity 0.2s ease',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 24,
          width: '100%',
        }}
      >
        <DraggableCircle levels={BODY_LEVELS} idx={bodyIdx} onChange={pickBody} title="Body" />
        <DraggableCircle levels={MIND_LEVELS} idx={mindIdx} onChange={pickMind} title="Mind" />
      </div>
    </div>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import SquareSlider from '@/components/SquareSlider';

const CIRCLES = [
  {
    id: 'emotions',
    title: 'Emotions',
    lsIdxKey: 'colourmap:process-idx',
    lsFragKey: 'colourmap:ring-emotions-frag',
    defaultIdx: 4,
    levels: [
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
    ],
  },
  {
    id: 'body',
    title: 'Body',
    lsIdxKey: 'colourmap:body-idx',
    lsFragKey: 'colourmap:ring-body-frag',
    defaultIdx: 1,
    levels: [
      { label: 'Depleted', color: '#A89090' },
      { label: 'Tense', color: '#C09878' },
      { label: 'Good', color: '#98B890' },
      { label: 'Energized', color: '#70B098' },
    ],
  },
  {
    id: 'mind',
    title: 'Mind',
    lsIdxKey: 'colourmap:presence-idx',
    lsFragKey: 'colourmap:ring-mind-frag',
    defaultIdx: 3,
    levels: [
      { label: 'Absent', color: '#B89088' },
      { label: 'Scattered', color: '#C4A888' },
      { label: 'Confused', color: '#B0A0B8' },
      { label: 'Drifting', color: '#C4B880' },
      { label: 'Present', color: '#98BC90' },
      { label: 'Flowing', color: '#A098C0' },
    ],
  },
];

const SIZE = 210;
const STROKE = 20;
const R = (SIZE - STROKE) / 2;

function useCircleState(circle: (typeof CIRCLES)[number]) {
  const [idx, setIdx] = useState<number>(circle.defaultIdx);
  const [fragment, setFragment] = useState('');
  const [editing, setEditing] = useState(false);
  const dragRef = useRef<{ startX: number; startIdx: number } | null>(null);
  const idxRef = useRef<number>(idx);
  const inputRef = useRef<HTMLInputElement>(null);
  idxRef.current = idx;

  useEffect(() => {
    try {
      const v = localStorage.getItem(circle.lsIdxKey);
      if (v !== null) setIdx(Math.min(circle.levels.length - 1, Math.max(0, Number(v))));
      const f = localStorage.getItem(circle.lsFragKey);
      if (f) setFragment(f);
    } catch {}
  }, [circle.lsIdxKey, circle.lsFragKey, circle.levels.length]);

  function saveIdx(i: number) {
    const c = Math.max(0, Math.min(circle.levels.length - 1, i));
    setIdx(c);
    idxRef.current = c;
    try {
      localStorage.setItem(circle.lsIdxKey, String(c));
    } catch {}
  }

  function saveFrag(v: string) {
    setFragment(v);
    try {
      localStorage.setItem(circle.lsFragKey, v);
    } catch {}
  }

  return { idx, fragment, editing, setEditing, dragRef, idxRef, inputRef, saveIdx, saveFrag };
}

function FragmentField({
  fragment,
  editing,
  setEditing,
  saveFrag,
  inputRef,
  color,
}: {
  fragment: string;
  editing: boolean;
  setEditing: (v: boolean) => void;
  saveFrag: (v: string) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  color: string;
}) {
  if (editing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={fragment}
        onChange={(e) => saveFrag(e.target.value)}
        onBlur={() => setEditing(false)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') setEditing(false);
        }}
        spellCheck={false}
        autoCorrect="off"
        style={{
          pointerEvents: 'all',
          background: 'transparent',
          border: 'none',
          outline: 'none',
          borderBottom: `1px solid ${color}55`,
          fontFamily: 'var(--font-serif)',
          fontStyle: 'italic',
          fontSize: 12,
          color,
          textAlign: 'center',
          width: '88%',
          padding: '1px 0',
        }}
      />
    );
  }
  return (
    <span
      onClick={() => {
        setEditing(true);
        setTimeout(() => inputRef.current?.focus(), 0);
      }}
      style={{
        pointerEvents: 'all',
        cursor: 'text',
        fontFamily: 'var(--font-serif)',
        fontStyle: 'italic',
        fontSize: 12,
        color,
        opacity: fragment ? 0.7 : 0.3,
        textAlign: 'center',
      }}
    >
      {fragment || '…'}
    </span>
  );
}

/* ── Emotions: same DraggableCircle + SquareSlider as FeelingCircles ── */
function SliderCircle({ circle }: { circle: (typeof CIRCLES)[number] }) {
  const { idx, fragment, editing, setEditing, dragRef, idxRef, inputRef, saveIdx, saveFrag } =
    useCircleState(circle);
  const [dragging, setDragging] = useState(false);

  const level = circle.levels[idx] ?? circle.levels[0];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        touchAction: 'none',
        userSelect: 'none',
      }}
    >
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
        {circle.title}
      </span>

      {/* 90×90 colored block — drag left/right */}
      <span
        className="block rounded-full"
        onPointerDown={(e) => {
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          dragRef.current = { startX: e.clientX, startIdx: idxRef.current };
          setDragging(true);
        }}
        onPointerMove={(e) => {
          if (!dragRef.current || e.buttons !== 1) return;
          const steps = Math.round((e.clientX - dragRef.current.startX) / 22);
          const next = Math.max(
            0,
            Math.min(circle.levels.length - 1, dragRef.current.startIdx + steps),
          );
          if (next !== idxRef.current) saveIdx(next);
        }}
        onPointerUp={() => {
          dragRef.current = null;
          setDragging(false);
        }}
        style={{
          display: 'block',
          width: 90,
          height: 90,
          background: level.color,
          boxShadow: `0 12px 32px -8px ${level.color}88`,
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
          color: level.color,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          transition: 'color 0.3s',
        }}
      >
        {level.label}
      </span>

      {/* SquareSlider — appears while dragging */}
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
          colors={circle.levels.map((l) => l.color)}
          value={idx}
          onChange={saveIdx}
          size={16}
          gap={5}
        />
      </div>

      <FragmentField
        fragment={fragment}
        editing={editing}
        setEditing={setEditing}
        saveFrag={saveFrag}
        inputRef={inputRef}
        color={level.color}
      />
    </div>
  );
}

/* ── Body / Mind: SVG ring ── */
function RingCircle({ circle }: { circle: (typeof CIRCLES)[number] }) {
  const { idx, fragment, editing, setEditing, dragRef, idxRef, inputRef, saveIdx, saveFrag } =
    useCircleState(circle);

  const level = circle.levels[idx] ?? circle.levels[0];

  return (
    <div
      style={{
        position: 'relative',
        width: SIZE,
        height: SIZE,
        touchAction: 'none',
        userSelect: 'none',
      }}
    >
      <svg
        width={SIZE}
        height={SIZE}
        style={{ display: 'block', cursor: 'ew-resize' }}
        onPointerDown={(e) => {
          if (editing) return;
          (e.currentTarget as SVGSVGElement).setPointerCapture(e.pointerId);
          dragRef.current = { startX: e.clientX, startIdx: idxRef.current };
        }}
        onPointerMove={(e) => {
          if (!dragRef.current) return;
          const steps = Math.round((e.clientX - dragRef.current.startX) / 22);
          saveIdx(dragRef.current.startIdx + steps);
        }}
        onPointerUp={() => {
          dragRef.current = null;
        }}
      >
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          fill="none"
          stroke={`${level.color}20`}
          strokeWidth={STROKE}
        />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          fill="none"
          stroke={level.color}
          strokeWidth={STROKE}
          style={{ transition: 'stroke 0.3s' }}
        />
      </svg>

      <div
        style={{
          position: 'absolute',
          inset: STROKE,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
          pointerEvents: 'none',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: level.color,
            opacity: 0.65,
          }}
        >
          {circle.title}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-handwritten)',
            fontSize: 26,
            fontWeight: 700,
            color: level.color,
            lineHeight: 1.1,
            textAlign: 'center',
            transition: 'color 0.3s',
          }}
        >
          {level.label}
        </span>
        <FragmentField
          fragment={fragment}
          editing={editing}
          setEditing={setEditing}
          saveFrag={saveFrag}
          inputRef={inputRef}
          color={level.color}
        />
      </div>
    </div>
  );
}

export default function FeelingCircles2() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 36,
        padding: '12px 0 32px',
      }}
    >
      {CIRCLES.map((c) =>
        c.id === 'emotions' ? (
          <SliderCircle key={c.id} circle={c} />
        ) : (
          <RingCircle key={c.id} circle={c} />
        ),
      )}
    </div>
  );
}

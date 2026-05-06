'use client';

import { useEffect, useRef, useState } from 'react';
import SquareSlider from '@/components/SquareSlider';

/* ─── Focus + Emotion levels ─────────────────────────────────── */
const FOCUS_LEVELS = [
  { label: 'Scattered', color: '#9098A8' },
  { label: 'Distracted', color: '#A898B0' },
  { label: 'Restless', color: '#B8A890' },
  { label: 'Warming', color: '#C4A868' },
  { label: 'Present', color: '#C4B058' },
  { label: 'Locked', color: '#A8B870' },
  { label: 'Flowing', color: '#88B888' },
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

const BODY_LEVELS = [
  { label: 'Depleted', color: '#A89090' },
  { label: 'Tense', color: '#C09878' },
  { label: 'Good', color: '#98B890' },
  { label: 'Energized', color: '#70B098' },
];

const MOOD_DOTS = [
  { bg: '#C07878', border: '#C07878' },
  { bg: 'transparent', border: '#A8B870' },
  { bg: '#80B0C8', border: '#80B0C8' },
  { bg: 'transparent', border: '#C4A868' },
];

/* ─── Tokens ─────────────────────────────────────────────────── */
const CARD_BG = 'rgba(255,255,255,0.03)';
const CARD_BORDER = 'rgba(196,160,96,0.2)';
const INNER_DIV = 'rgba(196,160,96,0.1)';
const OCHRE = '#C4A060';
const BROWN = '#5C3018';
const LABEL_COLOR = '#8A6A4A';

/* ─── Section wrapper — collapsible box ──────────────────────── */
function Section({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  textStyle?: number;
}) {
  return (
    <div
      style={{
        border: `1px solid ${CARD_BORDER}`,
        borderRadius: 16,
        background: CARD_BG,
        overflow: 'hidden',
      }}
    >
      <div
        onClick={onToggle}
        style={{
          padding: '10px 16px',
          borderBottom: open ? `1px solid ${CARD_BORDER}` : 'none',
          textAlign: 'center',
          background: 'rgba(196,160,96,0.1)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          position: 'relative',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 13,
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.14em',
            color: '#5C3018',
          }}
        >
          {title}
        </span>
        <span
          style={{
            position: 'absolute',
            right: 14,
            color: OCHRE,
            opacity: 0.4,
            fontSize: 11,
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
          }}
        >
          ▾
        </span>
      </div>
      {open && children}
    </div>
  );
}

/* ─── Compass axes ───────────────────────────────────────────── */
const AXIS_GROUPS = [
  {
    id: 'feeling',
    dot: '#D4805A',
    axes: [
      { name: 'Care', color: '#D4805A' },
      { name: 'Attitude', color: '#C4A070' },
      { name: 'Rest', color: '#C4906A' },
      { name: 'Emotions', color: '#B07A5A' },
    ],
  },
  {
    id: 'doing',
    dot: '#7AAA58',
    axes: [
      { name: 'Clarity', color: '#7AAA58' },
      { name: 'Target', color: '#7A9A7A' },
      { name: 'Resources', color: '#8AB0A0' },
      { name: 'Action', color: '#9AB090' },
    ],
  },
  {
    id: 'sharing',
    dot: '#6B7F4E',
    axes: [
      { name: 'Voice', color: '#6B7F4E' },
      { name: 'Listen', color: '#8CA46E' },
      { name: 'Bond', color: '#7B9560' },
      { name: 'Boundary', color: '#5F7447' },
    ],
  },
];

const AXES = AXIS_GROUPS.flatMap((g) => g.axes);

/* ─── Types ──────────────────────────────────────────────────── */
type EmoState = 'stuck' | 'heavy' | 'flowing' | null;

type CardItem = {
  id: string;
  text: string;
  done: boolean;
  feels?: string;
  blocking?: string;
  flowing?: string;
  emotionalState?: EmoState;
  compassAxis?: string;
  createdAt?: string;
  notes?: string;
  ease?: number;
  weight?: number;
  urgency?: number;
  status?: 'active' | 'waiting';
  tag?: { name: string; color: string; categoryId?: string };
  textStyle?: number;
  timeFrame?: string;
  focusIdx?: number;
  emotionIdx?: number;
  bodyIdx?: number;
  blockingLog?: string[];
  flowingLog?: string[];
};

const EMO: { id: EmoState; label: string; color: string }[] = [
  { id: 'stuck', label: 'Stuck', color: '#C4A060' },
  { id: 'heavy', label: 'Heavy', color: '#C4A060' },
  { id: 'flowing', label: 'Flowing', color: '#C4A060' },
];

/* ─── Typography presets — cycled by the design dot ─────────────── */
const TEXT_STYLES = [
  {
    font: 'var(--font-handwritten)',
    size: 20,
    weight: 700,
    fStyle: 'normal',
    transform: 'none' as const,
    spacing: 'normal',
  },
  {
    font: 'var(--font-serif)',
    size: 15,
    weight: 600,
    fStyle: 'normal',
    transform: 'none' as const,
    spacing: '0.04em',
  },
  {
    font: 'var(--font-serif)',
    size: 16,
    weight: 400,
    fStyle: 'italic',
    transform: 'none' as const,
    spacing: 'normal',
  },
  {
    font: 'var(--font-serif)',
    size: 11,
    weight: 800,
    fStyle: 'normal',
    transform: 'uppercase' as const,
    spacing: '0.22em',
  },
] as const;

/* Dot visual per style */
const STYLE_DOTS = [
  { bg: BROWN, border: BROWN, rotate: false, scale: 1 }, // handwritten – warm filled
  { bg: 'transparent', border: OCHRE, rotate: false, scale: 1 }, // serif        – outlined
  { bg: `${OCHRE}55`, border: OCHRE, rotate: true, scale: 1 }, // italic       – tilted diamond
  { bg: LABEL_COLOR, border: LABEL_COLOR, rotate: false, scale: 0.55 }, // small caps   – tiny dot
] as const;

/* ─── Fragment input ─────────────────────────────────────────── */
function FragInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <span
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: LABEL_COLOR,
          opacity: 0.55,
        }}
      >
        {label}
      </span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onInput={(e) => {
          const el = e.currentTarget;
          el.style.height = 'auto';
          el.style.height = `${Math.min(el.scrollHeight, 72)}px`;
        }}
        placeholder={placeholder}
        rows={1}
        spellCheck={false}
        autoCorrect="off"
        autoCapitalize="off"
        style={{
          background: 'transparent',
          border: 'none',
          outline: 'none',
          borderBottom: `1px solid rgba(196,160,96,0.18)`,
          fontFamily: 'var(--font-handwritten)',
          fontStyle: 'italic',
          fontSize: 18,
          color: BROWN,
          padding: '2px 0',
          width: '100%',
          resize: 'none',
          overflow: 'hidden',
          lineHeight: 1.35,
          maxHeight: 72,
        }}
      />
    </div>
  );
}

/* ─── Log + handwritten textarea ────────────────────────────────── */
function LogFragInput({
  label,
  log,
  onAdd,
}: {
  label: string;
  log: string[];
  onAdd: (entry: string) => void;
}) {
  const [val, setVal] = useState('');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: LABEL_COLOR,
          opacity: 0.55,
          textAlign: 'center',
        }}
      >
        {label}
      </span>
      {log.map((entry, i) => (
        <span
          key={i}
          style={{
            fontFamily: 'var(--font-handwritten)',
            fontStyle: 'italic',
            fontSize: 17,
            color: BROWN,
            opacity: 0.65,
            lineHeight: 1.35,
            textAlign: 'center',
          }}
        >
          {entry}
        </span>
      ))}
      <textarea
        value={val}
        rows={1}
        onChange={(e) => {
          setVal(e.target.value);
          const el = e.currentTarget;
          el.style.height = 'auto';
          el.style.height = `${Math.min(el.scrollHeight, 72)}px`;
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (val.trim()) {
              onAdd(val.trim());
              setVal('');
            }
          }
        }}
        placeholder="…"
        spellCheck={false}
        autoCorrect="off"
        autoCapitalize="off"
        style={{
          background: 'transparent',
          border: 'none',
          outline: 'none',
          borderBottom: `1px solid rgba(196,160,96,0.18)`,
          fontFamily: 'var(--font-handwritten)',
          fontStyle: 'italic',
          fontSize: 18,
          color: BROWN,
          padding: '2px 0',
          width: '100%',
          resize: 'none',
          overflow: 'hidden',
          lineHeight: 1.35,
          maxHeight: 72,
          textAlign: 'center',
        }}
      />
    </div>
  );
}

/* ─── Emotion circle — rounded draggable dot, centered ────────── */
function EmotionCircle({
  levels,
  idx,
  onChange,
}: {
  levels: { label: string; color: string }[];
  idx: number;
  onChange: (i: number) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startIdx: number } | null>(null);
  const idxRef = useRef(idx);
  idxRef.current = idx;
  const level = levels[idx] ?? levels[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <span
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: LABEL_COLOR,
          opacity: 0.4,
        }}
      >
        How do you feel?
      </span>

      <span
        className="block rounded-full"
        onPointerDown={(e) => {
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          dragRef.current = { startX: e.clientX, startIdx: idxRef.current };
          setDragging(true);
        }}
        onPointerMove={(e) => {
          if (!dragRef.current || e.buttons !== 1) return;
          const steps = Math.round((e.clientX - dragRef.current.startX) / 20);
          const next = Math.max(0, Math.min(levels.length - 1, dragRef.current.startIdx + steps));
          if (next !== idxRef.current) onChange(next);
        }}
        onPointerUp={() => {
          dragRef.current = null;
          setDragging(false);
        }}
        style={{
          display: 'block',
          width: 88,
          height: 88,
          background: level.color,
          boxShadow: `0 10px 28px -8px ${level.color}88`,
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
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          transition: 'color 0.3s',
        }}
      >
        {level.label}
      </span>

      {/* SquareSlider — appears while dragging */}
      <div
        style={{
          maxHeight: dragging ? 32 : 0,
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
          size={14}
          gap={4}
        />
      </div>
    </div>
  );
}

/* ─── Mood section — 4-mode dot cycles state pickers ─────────── */
function MoodSection({
  item,
  onChange,
}: {
  item: CardItem;
  onChange: (f: Partial<CardItem>) => void;
}) {
  const [mode, setMode] = useState(0);
  const dot = MOOD_DOTS[mode];

  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setMode((m) => (m + 1) % 4)}
        style={{
          position: 'absolute',
          top: 2,
          right: -4,
          width: 10,
          height: 10,
          borderRadius: '50%',
          background: dot.bg,
          border: `1.5px solid ${dot.border}`,
          cursor: 'pointer',
          padding: 0,
        }}
      />

      {mode === 0 && (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          {EMO.map((e) => (
            <button
              key={e.id}
              type="button"
              onClick={() =>
                onChange({ emotionalState: item.emotionalState === e.id ? null : e.id })
              }
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                background: item.emotionalState === e.id ? e.color : `${e.color}15`,
                color: item.emotionalState === e.id ? '#fff' : e.color,
                border: `1px solid ${e.color}${item.emotionalState === e.id ? 'cc' : '40'}`,
                borderRadius: 4,
                padding: '10px 0',
                cursor: 'pointer',
                flex: 1,
                transition: 'all 0.15s',
              }}
            >
              {e.label}
            </button>
          ))}
        </div>
      )}

      {mode === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: LABEL_COLOR,
              opacity: 0.4,
            }}
          >
            Focus · {FOCUS_LEVELS[item.focusIdx ?? 3]?.label ?? ''}
          </span>
          <SquareSlider
            colors={FOCUS_LEVELS.map((l) => l.color)}
            value={item.focusIdx ?? 3}
            onChange={(i) => onChange({ focusIdx: i })}
            size={18}
            gap={6}
          />
        </div>
      )}

      {mode === 2 && (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <EmotionCircle
            levels={EMOTION_LEVELS}
            idx={item.emotionIdx ?? 4}
            onChange={(i) => onChange({ emotionIdx: i })}
          />
        </div>
      )}

      {mode === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: LABEL_COLOR,
              opacity: 0.4,
            }}
          >
            Energy · {BODY_LEVELS[item.bodyIdx ?? 1]?.label ?? ''}
          </span>
          <SquareSlider
            colors={BODY_LEVELS.map((l) => l.color)}
            value={item.bodyIdx ?? 1}
            onChange={(i) => onChange({ bodyIdx: i })}
            size={22}
            gap={8}
          />
        </div>
      )}
    </div>
  );
}

function LogField({
  label,
  log,
  onAdd,
}: {
  label: string;
  log: string[];
  onAdd: (entry: string) => void;
}) {
  const [val, setVal] = useState('');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
      <span
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: LABEL_COLOR,
          opacity: 0.4,
          textAlign: 'center',
        }}
      >
        {label}
      </span>
      {log.map((entry, i) => (
        <span
          key={i}
          style={{
            fontFamily: 'var(--font-serif)',
            fontStyle: 'italic',
            fontSize: 13,
            color: BROWN,
            opacity: 0.75,
            lineHeight: 1.4,
            textAlign: 'center',
          }}
        >
          {entry}
        </span>
      ))}
      <input
        type="text"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && val.trim()) {
            onAdd(val.trim());
            setVal('');
          }
        }}
        placeholder="…"
        spellCheck={false}
        autoCorrect="off"
        style={{
          background: 'transparent',
          border: 'none',
          outline: 'none',
          borderBottom: `1px solid ${INNER_DIV}`,
          fontFamily: 'var(--font-serif)',
          fontStyle: 'italic',
          fontSize: 13,
          color: BROWN,
          width: '80%',
          padding: '3px 0',
          textAlign: 'center',
        }}
      />
    </div>
  );
}

/* ─── Mission card — row inside a Section box ────────────────── */
function MissionCard({
  item,
  expanded,
  onToggle,
  onChange,
  onDone,
  onDelete,
  last,
  textStyle,
}: {
  item: CardItem;
  expanded: boolean;
  onToggle: () => void;
  onChange: (f: Partial<CardItem>) => void;
  onDone: () => void;
  onDelete: () => void;
  last?: boolean;
  textStyle: number;
}) {
  const axis = AXES.find((a) => a.name === item.compassAxis);
  const emo = EMO.find((e) => e.id === item.emotionalState);

  const [axisGroup, setAxisGroup] = useState<number | null>(() => {
    if (!item.compassAxis) return null;
    const i = AXIS_GROUPS.findIndex((g) => g.axes.some((a) => a.name === item.compassAxis));
    return i >= 0 ? i : null;
  });

  useEffect(() => {
    if (item.compassAxis) {
      const i = AXIS_GROUPS.findIndex((g) => g.axes.some((a) => a.name === item.compassAxis));
      if (i >= 0) setAxisGroup(i);
    }
  }, [item.compassAxis]);

  return (
    <div
      style={{
        padding: '12px 16px',
        borderBottom: last ? 'none' : `1px solid ${INNER_DIV}`,
        opacity: item.done ? 0.45 : 1,
        transition: 'opacity 0.2s',
      }}
    >
      {/* ── Header ──────────────────────────────────────────── */}
      <div
        onClick={onToggle}
        style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDone();
          }}
          style={{
            flexShrink: 0,
            width: 20,
            height: 20,
            borderRadius: '50%',
            border: `1.5px solid ${item.done ? OCHRE : 'rgba(196,160,96,0.4)'}`,
            background: item.done ? OCHRE : 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s',
          }}
        >
          {item.done && <span style={{ color: '#fff', fontSize: 11, lineHeight: 1 }}>✓</span>}
        </button>

        {(() => {
          const ts = TEXT_STYLES[textStyle % TEXT_STYLES.length];
          return (
            <textarea
              value={item.text}
              placeholder="untitled"
              spellCheck={false}
              autoCorrect="off"
              autoCapitalize="off"
              rows={1}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => onChange({ text: e.target.value })}
              onInput={(e) => {
                const el = e.currentTarget;
                el.style.height = 'auto';
                el.style.height = `${el.scrollHeight}px`;
              }}
              style={{
                flex: 1,
                minWidth: 0,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontFamily: ts.font,
                fontSize: ts.size,
                fontWeight: ts.weight,
                fontStyle: ts.fStyle,
                letterSpacing: ts.spacing,
                textTransform: ts.transform,
                color: item.done ? OCHRE : BROWN,
                textDecoration: item.done ? 'line-through' : 'none',
                lineHeight: 1.3,
                padding: 0,
                cursor: 'text',
                textAlign: 'center',
                resize: 'none',
                overflow: 'hidden',
              }}
            />
          );
        })()}

        {axis && (
          <span
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              background: `${axis.color}18`,
              color: axis.color,
              border: `1px solid ${axis.color}45`,
              borderRadius: 999,
              padding: '2px 8px',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {axis.name}
          </span>
        )}

        <span
          style={{
            color: OCHRE,
            opacity: 0.45,
            fontSize: 11,
            flexShrink: 0,
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
          }}
        >
          ▾
        </span>
      </div>

      {/* ── Collapsed subtitle: by when · emo state ─────────── */}
      {!expanded && (item.timeFrame || emo) && (
        <div
          style={{
            display: 'flex',
            gap: 8,
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: 3,
          }}
        >
          {item.timeFrame && (
            <span
              style={{
                fontFamily: 'var(--font-serif)',
                fontStyle: 'italic',
                fontSize: 11,
                color: OCHRE,
                opacity: 0.55,
              }}
            >
              {item.timeFrame}
            </span>
          )}
          {item.timeFrame && emo && (
            <span style={{ color: OCHRE, opacity: 0.25, fontSize: 10 }}>·</span>
          )}
          {emo && (
            <span
              style={{
                fontFamily: 'var(--font-serif)',
                fontStyle: 'italic',
                fontSize: 11,
                color: emo.color,
                opacity: 0.7,
              }}
            >
              {emo.label}
            </span>
          )}
        </div>
      )}

      {/* ── Expanded body ───────────────────────────────────── */}
      {expanded && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 14 }}>
          <MoodSection item={item} onChange={onChange} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <LogFragInput
              label="What is taking your focus away?"
              log={item.blockingLog ?? []}
              onAdd={(entry) => onChange({ blockingLog: [...(item.blockingLog ?? []), entry] })}
            />
            <LogFragInput
              label="What is helping?"
              log={item.flowingLog ?? []}
              onAdd={(entry) => onChange({ flowingLog: [...(item.flowingLog ?? []), entry] })}
            />
          </div>

          {/* ── Compass axis — 3 group dots → 4 axis pills ──── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
            <span
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: LABEL_COLOR,
                opacity: 0.5,
              }}
            >
              Compass axis
            </span>
            <div style={{ display: 'flex', gap: 24 }}>
              {AXIS_GROUPS.map((group, i) => {
                const isOn = axisGroup === i;
                const hasThis = group.axes.some((a) => a.name === item.compassAxis);
                return (
                  <button
                    key={group.id}
                    type="button"
                    onClick={() => setAxisGroup(isOn ? null : i)}
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      flexShrink: 0,
                      background: isOn || hasThis ? group.dot : `${group.dot}30`,
                      border: `2.5px solid ${isOn || hasThis ? group.dot : `${group.dot}50`}`,
                      boxShadow: isOn ? `0 0 0 4px ${group.dot}25` : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  />
                );
              })}
            </div>
            {axisGroup !== null && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 6,
                  width: '100%',
                }}
              >
                {AXIS_GROUPS[axisGroup].axes.map((a) => (
                  <button
                    key={a.name}
                    type="button"
                    onClick={() =>
                      onChange({ compassAxis: item.compassAxis === a.name ? undefined : a.name })
                    }
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: '0.07em',
                      textTransform: 'uppercase',
                      background: item.compassAxis === a.name ? a.color : `${a.color}15`,
                      color: item.compassAxis === a.name ? '#fff' : a.color,
                      border: `1px solid ${a.color}${item.compassAxis === a.name ? 'cc' : '40'}`,
                      borderRadius: 4,
                      padding: '14px 0',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      textAlign: 'center',
                    }}
                  >
                    {a.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Time frame */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <span
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: LABEL_COLOR,
                opacity: 0.5,
                flexShrink: 0,
              }}
            >
              by
            </span>
            <input
              type="text"
              value={item.timeFrame ?? ''}
              onChange={(e) => onChange({ timeFrame: e.target.value || undefined })}
              placeholder="when…"
              spellCheck={false}
              autoCorrect="off"
              autoCapitalize="off"
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                borderBottom: `1px solid rgba(196,160,96,0.18)`,
                fontFamily: 'var(--font-serif)',
                fontSize: 13,
                color: BROWN,
                padding: '2px 0',
                textAlign: 'center',
                width: 100,
              }}
            />
          </div>

          <button
            type="button"
            onClick={onDelete}
            style={{
              alignSelf: 'center',
              background: 'none',
              border: 'none',
              fontFamily: 'var(--font-serif)',
              fontSize: 11,
              color: LABEL_COLOR,
              opacity: 0.35,
              cursor: 'pointer',
              letterSpacing: '0.08em',
            }}
          >
            remove
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Add input row — inside a Section box ───────────────────── */
function AddRow({
  placeholder,
  onAdd,
  textStyle = 0,
}: {
  placeholder: string;
  onAdd: (text: string) => void;
  textStyle?: number;
}) {
  const [val, setVal] = useState('');
  const ts = TEXT_STYLES[textStyle % TEXT_STYLES.length];
  function submit() {
    const t = val.trim();
    if (!t) return;
    onAdd(t);
    setVal('');
  }
  return (
    <div style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 28, flexShrink: 0 }} />
      <input
        type="text"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') submit();
        }}
        placeholder={placeholder}
        spellCheck={false}
        autoCorrect="off"
        autoCapitalize="off"
        style={{
          flex: 1,
          background: 'transparent',
          border: 'none',
          outline: 'none',
          fontFamily: ts.font,
          fontSize: ts.size,
          fontWeight: ts.weight,
          fontStyle: ts.fStyle,
          letterSpacing: ts.spacing,
          textTransform: ts.transform,
          color: BROWN,
          textAlign: 'center',
        }}
      />
      {val.trim() && (
        <button
          type="button"
          onClick={submit}
          style={{
            flexShrink: 0,
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: OCHRE,
            border: `1.5px solid ${OCHRE}`,
            color: '#fff',
            fontSize: 18,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s',
          }}
        >
          +
        </button>
      )}
    </div>
  );
}

/* ─── Main panel ─────────────────────────────────────────────── */
export default function DoingCardsPanel() {
  const [globalStyle, setGlobalStyle] = useState(0);
  const [objItem, setObjItem] = useState<CardItem>({ id: 'current', text: '', done: false });
  const [objOpen, setObjOpen] = useState(false);
  const [secOpen, setSecOpen] = useState({ mission: true, daily: true, push: true, done: true });

  const [missions, setMissions] = useState<CardItem[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [push, setPush] = useState<CardItem[]>([]);
  const [pushExpandedId, setPushExpandedId] = useState<string | null>(null);
  const [chapter, setChapter] = useState('');

  useEffect(() => {
    try {
      const obj = localStorage.getItem('colourmap:current-objective') ?? '';
      const chal = localStorage.getItem('colourmap:objective-challenge') ?? '';
      const flow = localStorage.getItem('colourmap:objective-flow-text') ?? '';
      const blRaw = localStorage.getItem('colourmap:objective-blocking-log');
      const flRaw = localStorage.getItem('colourmap:objective-flowing-log');
      setObjItem((prev) => ({
        ...prev,
        text: obj,
        blocking: chal,
        flowing: flow,
        blockingLog: blRaw ? JSON.parse(blRaw) : [],
        flowingLog: flRaw ? JSON.parse(flRaw) : [],
      }));
      const raw = localStorage.getItem('colourmap:today-objectives');
      if (raw) setMissions(JSON.parse(raw));
      const rawPush = localStorage.getItem('colourmap:checkin-todos');
      if (rawPush) setPush(JSON.parse(rawPush));
      const gs = localStorage.getItem('colourmap:text-style');
      if (gs !== null) setGlobalStyle(Number(gs));
      setChapter(localStorage.getItem('colourmap:done-chapter') ?? '');
      const objDone = localStorage.getItem('colourmap:objective-done');
      if (objDone === 'true') setObjItem((prev) => ({ ...prev, done: true }));
    } catch {}
  }, []);

  function saveChapter(v: string) {
    setChapter(v);
    try {
      localStorage.setItem('colourmap:done-chapter', v);
    } catch {}
  }

  function cycleStyle() {
    const next = (globalStyle + 1) % TEXT_STYLES.length;
    setGlobalStyle(next);
    try {
      localStorage.setItem('colourmap:text-style', String(next));
    } catch {}
  }

  function updateObj(f: Partial<CardItem>) {
    setObjItem((prev) => ({ ...prev, ...f }));
    try {
      if (f.text !== undefined) localStorage.setItem('colourmap:current-objective', f.text);
      if (f.blocking !== undefined)
        localStorage.setItem('colourmap:objective-challenge', f.blocking ?? '');
      if (f.flowing !== undefined)
        localStorage.setItem('colourmap:objective-flow-text', f.flowing ?? '');
      if (f.blockingLog !== undefined)
        localStorage.setItem('colourmap:objective-blocking-log', JSON.stringify(f.blockingLog));
      if (f.flowingLog !== undefined)
        localStorage.setItem('colourmap:objective-flowing-log', JSON.stringify(f.flowingLog));
      if (f.done !== undefined) localStorage.setItem('colourmap:objective-done', String(f.done));
    } catch {}
  }

  function persistMissions(next: CardItem[]) {
    setMissions(next);
    try {
      localStorage.setItem('colourmap:today-objectives', JSON.stringify(next));
    } catch {}
  }
  function updateMission(id: string, f: Partial<CardItem>) {
    persistMissions(missions.map((m) => (m.id === id ? { ...m, ...f } : m)));
  }
  function addMission(text: string) {
    persistMissions([
      ...missions,
      {
        id: crypto.randomUUID(),
        text,
        done: false,
        createdAt: new Date().toISOString(),
      },
    ]);
  }

  function persistPush(next: CardItem[]) {
    setPush(next);
    try {
      localStorage.setItem('colourmap:checkin-todos', JSON.stringify(next));
    } catch {}
  }
  function updatePush(id: string, f: Partial<CardItem>) {
    persistPush(push.map((p) => (p.id === id ? { ...p, ...f } : p)));
  }
  function addPush(text: string) {
    persistPush([
      ...push,
      {
        id: crypto.randomUUID(),
        text,
        done: false,
        createdAt: new Date().toISOString(),
      },
    ]);
  }

  const activeMissions = missions.filter((m) => !m.done);
  const doneMissions = missions.filter((m) => m.done);
  const activePush = push.filter((p) => !p.done);
  const donePush = push.filter((p) => p.done);
  const allDone = [
    ...doneMissions.map((m) => ({ ...m, _src: 'daily' as const })),
    ...donePush.map((p) => ({ ...p, _src: 'push' as const })),
  ];

  const dot = STYLE_DOTS[globalStyle % STYLE_DOTS.length];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '4px 0 32px' }}>
      {/* ── Global typo dot ──────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: 4 }}>
        <button
          type="button"
          onClick={cycleStyle}
          title="Change text style"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '2px 4px',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: LABEL_COLOR,
              opacity: 0.4,
            }}
          >
            {['handwritten', 'serif', 'italic', 'caps'][globalStyle % 4]}
          </span>
          <span
            style={{
              display: 'block',
              width: `${9 * dot.scale}px`,
              height: `${9 * dot.scale}px`,
              borderRadius: dot.rotate ? '1.5px' : '50%',
              transform: dot.rotate ? 'rotate(45deg)' : 'none',
              background: dot.bg,
              border: `1.5px solid ${dot.border}`,
              opacity: 0.6,
              transition: 'all 0.2s',
            }}
          />
        </button>
      </div>

      {/* ── Current Mission ─────────────────────────────────── */}
      <Section
        title="Current Mission"
        open={secOpen.mission}
        onToggle={() => setSecOpen((s) => ({ ...s, mission: !s.mission }))}
        textStyle={globalStyle}
      >
        <MissionCard
          item={objItem}
          expanded={objOpen}
          onToggle={() => setObjOpen((v) => !v)}
          onChange={updateObj}
          onDone={() => updateObj({ done: !objItem.done })}
          onDelete={() => {}}
          textStyle={globalStyle}
          last
        />
        {secOpen.mission && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px' }}>
            <button
              type="button"
              onClick={() => updateObj({ done: !objItem.done })}
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                background: objItem.done ? `${OCHRE}18` : 'transparent',
                border: `1px solid ${objItem.done ? OCHRE : `${OCHRE}40`}`,
                color: objItem.done ? OCHRE : LABEL_COLOR,
                opacity: objItem.done ? 1 : 0.5,
                borderRadius: 999,
                padding: '4px 20px',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {objItem.done ? '↺ reopen' : 'done'}
            </button>
          </div>
        )}
      </Section>

      {/* ── Daily Missions ───────────────────────────────────── */}
      <Section
        title="Daily Missions"
        open={secOpen.daily}
        onToggle={() => setSecOpen((s) => ({ ...s, daily: !s.daily }))}
        textStyle={globalStyle}
      >
        {activeMissions.map((m, i) => (
          <MissionCard
            key={m.id}
            item={m}
            expanded={expandedId === m.id}
            onToggle={() => setExpandedId(expandedId === m.id ? null : m.id)}
            onChange={(f) => updateMission(m.id, f)}
            onDone={() => updateMission(m.id, { done: true })}
            onDelete={() => persistMissions(missions.filter((x) => x.id !== m.id))}
            textStyle={globalStyle}
          />
        ))}
        <AddRow placeholder="add a mission…" onAdd={addMission} textStyle={globalStyle} />
      </Section>

      {/* ── Push for Tomorrow ────────────────────────────────── */}
      <Section
        title="Push for Tomorrow"
        open={secOpen.push}
        onToggle={() => setSecOpen((s) => ({ ...s, push: !s.push }))}
        textStyle={globalStyle}
      >
        {activePush.map((p) => (
          <MissionCard
            key={p.id}
            item={p}
            expanded={pushExpandedId === p.id}
            onToggle={() => setPushExpandedId(pushExpandedId === p.id ? null : p.id)}
            onChange={(f) => updatePush(p.id, f)}
            onDone={() => updatePush(p.id, { done: true })}
            onDelete={() => persistPush(push.filter((x) => x.id !== p.id))}
            textStyle={globalStyle}
          />
        ))}
        <AddRow placeholder="push for tomorrow…" onAdd={addPush} textStyle={globalStyle} />
      </Section>

      {/* ── Done ────────────────────────────────────────────────── */}
      {allDone.length > 0 && (
        <div
          style={{
            border: `1px solid ${CARD_BORDER}`,
            borderRadius: 16,
            background: CARD_BG,
            overflow: 'hidden',
            /* Narrower horizontal footprint when closed — indent both sides */
            marginLeft: secOpen.done ? 0 : 24,
            marginRight: secOpen.done ? 0 : 24,
            transition: 'margin 0.2s ease',
          }}
        >
          <div
            onClick={() => setSecOpen((s) => ({ ...s, done: !s.done }))}
            style={{
              padding: '8px 16px',
              borderBottom: secOpen.done ? `1px solid ${CARD_BORDER}` : 'none',
              textAlign: 'center',
              background: 'rgba(196,160,96,0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              cursor: 'pointer',
              position: 'relative',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 12,
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.14em',
                color: LABEL_COLOR,
                opacity: 0.5,
              }}
            >
              Done
            </span>
            <span
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 11,
                color: LABEL_COLOR,
                opacity: 0.35,
              }}
            >
              {allDone.length}
            </span>
            <span
              style={{
                position: 'absolute',
                right: 14,
                color: OCHRE,
                opacity: 0.4,
                fontSize: 11,
                transform: secOpen.done ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s',
              }}
            >
              ▾
            </span>
          </div>
          {secOpen.done && (
            <div style={{ padding: '12px 20px 4px' }}>
              <FragInput
                label="Chapter"
                value={chapter}
                onChange={saveChapter}
                placeholder="what chapter are you in…"
              />
            </div>
          )}
          {secOpen.done &&
            allDone.map((item, i) => {
              const ts = TEXT_STYLES[globalStyle % TEXT_STYLES.length];
              const isLast = i === allDone.length - 1;
              return (
                <div
                  key={item.id}
                  style={{
                    padding: '10px 16px',
                    borderBottom: isLast ? 'none' : `1px solid ${INNER_DIV}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    opacity: 0.45,
                  }}
                >
                  {/* Undo */}
                  <button
                    type="button"
                    onClick={() => {
                      if (item._src === 'daily') updateMission(item.id, { done: false });
                      else updatePush(item.id, { done: false });
                    }}
                    style={{
                      flexShrink: 0,
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      border: `1.5px solid ${OCHRE}`,
                      background: OCHRE,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span style={{ color: '#fff', fontSize: 11, lineHeight: 1 }}>✓</span>
                  </button>
                  {/* Title */}
                  <span
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      minWidth: 0,
                      fontFamily: ts.font,
                      fontSize: ts.size,
                      fontWeight: ts.weight,
                      fontStyle: ts.fStyle,
                      letterSpacing: ts.spacing,
                      textTransform: ts.transform,
                      color: OCHRE,
                      textDecoration: 'line-through',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.text}
                  </span>
                  {/* Source label */}
                  <span
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: LABEL_COLOR,
                      opacity: 0.5,
                      flexShrink: 0,
                    }}
                  >
                    {item._src === 'push' ? 'tmrw' : 'daily'}
                  </span>
                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => {
                      if (item._src === 'daily')
                        persistMissions(missions.filter((x) => x.id !== item.id));
                      else persistPush(push.filter((x) => x.id !== item.id));
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: LABEL_COLOR,
                      opacity: 0.3,
                      cursor: 'pointer',
                      fontSize: 14,
                      lineHeight: 1,
                    }}
                  >
                    ×
                  </button>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}

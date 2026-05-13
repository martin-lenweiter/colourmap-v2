'use client';

import { useEffect, useRef, useState } from 'react';
import SquareSlider from '@/components/SquareSlider';
import { syncPref } from '@/lib/sync';

/* ─── Focus levels — 8 steps ─────────────────────────────────── */
const FOCUS_LEVELS = [
  { label: 'Scattered', color: '#9098A8' },
  { label: 'Distracted', color: '#A898B0' },
  { label: 'Restless', color: '#B8A890' },
  { label: 'Warming', color: '#C4A868' },
  { label: 'Present', color: '#C4B058' },
  { label: 'Locked', color: '#A8B870' },
  { label: 'Flowing', color: '#8BA870' },
  { label: 'Zone', color: '#7A9E58' },
];

/* ─── Tokens ─────────────────────────────────────────────────── */
const CARD_BG = 'rgba(255,255,255,0.03)';
const CARD_BORDER = 'rgba(196,160,96,0.2)';
const INNER_DIV = 'rgba(196,160,96,0.1)';
const OCHRE = '#C4A060'; // keep for borders/backgrounds
const OCHRE_TEXT = 'var(--palette-panel-text, #C4A060)';
const BROWN = 'var(--palette-panel-text, #5C3018)';
const LABEL_COLOR = 'var(--palette-panel-muted, #8A6A4A)';

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
          background: 'rgba(196,160,96,0.1)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <span style={{ flex: 1 }} />
        <span
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 13,
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.14em',
            color: 'var(--palette-panel-text, rgba(196,160,96,0.88))',
          }}
        >
          {title}
        </span>
        <span style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <span
            style={{
              color: OCHRE_TEXT,
              opacity: 0.4,
              fontSize: 11,
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
            }}
          >
            ▾
          </span>
        </span>
      </div>
      {open && children}
    </div>
  );
}

/* ─── Types ──────────────────────────────────────────────────── */
type Subtask = { id: string; text: string; done: boolean };

type CardItem = {
  id: string;
  text: string;
  done: boolean;
  createdAt?: string;
  timeFrame?: string;
  focusIdx?: number;
  blockingLog?: string[];
  flowingLog?: string[];
  subtasks?: Subtask[];
  ideas?: string[];
  status?: 'active' | 'waiting';
  tag?: { name: string; color: string; categoryId?: string };
};

/* ─── Typography presets ─────────────────────────────────────── */
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

const _STYLE_DOTS = [
  { bg: BROWN, border: BROWN, rotate: false, scale: 1 },
  { bg: 'transparent', border: OCHRE, rotate: false, scale: 1 },
  { bg: `${OCHRE}55`, border: OCHRE, rotate: true, scale: 1 },
  { bg: LABEL_COLOR, border: LABEL_COLOR, rotate: false, scale: 0.55 },
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
          fontFamily: 'var(--font-serif)',
          fontStyle: 'normal',
          fontSize: 15,
          color: '#3A1E08',
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

/* ─── Append-only log textarea ───────────────────────────────── */
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
            fontFamily: 'var(--font-serif)',
            fontStyle: 'normal',
            fontSize: 14,
            color: '#3A1E08',
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
          fontFamily: 'var(--font-serif)',
          fontStyle: 'normal',
          fontSize: 15,
          color: '#3A1E08',
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

/* ─── Sub-section toggle strip ───────────────────────────────── */
const SUBSECTIONS = [
  { id: 'process' as const, label: 'Process' },
  { id: 'focus' as const, label: 'Focus' },
  { id: 'ideas' as const, label: 'Ideas' },
];
type SubKey = 'process' | 'focus' | 'ideas';

/* ─── ProcessBox — subtask checklist ────────────────────────── */
function ProcessBox({
  item,
  onChange,
}: {
  item: CardItem;
  onChange: (f: Partial<CardItem>) => void;
}) {
  const [val, setVal] = useState('');
  const subtasks = item.subtasks ?? [];

  function add() {
    const t = val.trim();
    if (!t) return;
    onChange({ subtasks: [...subtasks, { id: crypto.randomUUID(), text: t, done: false }] });
    setVal('');
  }

  return (
    <div
      style={{
        background: INNER_DIV,
        borderRadius: 10,
        padding: '10px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      {subtasks.map((s) => (
        <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            type="button"
            onClick={() =>
              onChange({
                subtasks: subtasks.map((x) => (x.id === s.id ? { ...x, done: !x.done } : x)),
              })
            }
            style={{
              flexShrink: 0,
              width: 16,
              height: 16,
              borderRadius: '50%',
              border: `1.5px solid ${s.done ? OCHRE : 'rgba(196,160,96,0.4)'}`,
              background: s.done ? OCHRE : 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {s.done && <span style={{ color: '#fff', fontSize: 9, lineHeight: 1 }}>✓</span>}
          </button>
          <span
            style={{
              flex: 1,
              fontFamily: 'var(--font-handwritten)',
              fontStyle: 'italic',
              fontSize: 17,
              color: BROWN,
              opacity: s.done ? 0.4 : 1,
              textDecoration: s.done ? 'line-through' : 'none',
            }}
          >
            {s.text}
          </span>
          <button
            type="button"
            onClick={() => onChange({ subtasks: subtasks.filter((x) => x.id !== s.id) })}
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
      ))}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <div style={{ width: 16, flexShrink: 0 }} />
        <input
          type="text"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') add();
          }}
          placeholder="add step…"
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            borderBottom: `1px solid rgba(196,160,96,0.18)`,
            fontFamily: 'var(--font-handwritten)',
            fontStyle: 'italic',
            fontSize: 17,
            color: BROWN,
            padding: '2px 0',
          }}
        />
      </div>
    </div>
  );
}

/* ─── FocusBox — slider + blocking / helping logs ───────────── */
function FocusBox({
  item,
  onChange,
}: {
  item: CardItem;
  onChange: (f: Partial<CardItem>) => void;
}) {
  const focusIdx = item.focusIdx ?? 3;
  const focusLevel = FOCUS_LEVELS[focusIdx];
  return (
    <div
      style={{
        background: INNER_DIV,
        borderRadius: 10,
        padding: '10px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
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
          Focus · {focusLevel.label}
        </span>
        <SquareSlider
          colors={FOCUS_LEVELS.map((l) => l.color)}
          value={focusIdx}
          onChange={(i) => onChange({ focusIdx: i })}
          size={18}
          gap={6}
        />
      </div>
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
  );
}

/* ─── IdeasBox — free-form idea capture ─────────────────────── */
function IdeasBox({
  item,
  onChange,
}: {
  item: CardItem;
  onChange: (f: Partial<CardItem>) => void;
}) {
  const [val, setVal] = useState('');
  const ideas = item.ideas ?? [];

  function add() {
    const t = val.trim();
    if (!t) return;
    onChange({ ideas: [...ideas, t] });
    setVal('');
  }

  return (
    <div
      style={{
        background: INNER_DIV,
        borderRadius: 10,
        padding: '10px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      {ideas.map((idea, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <span
            style={{ color: OCHRE_TEXT, opacity: 0.5, fontSize: 12, paddingTop: 2, flexShrink: 0 }}
          >
            ·
          </span>
          <span
            style={{
              flex: 1,
              fontFamily: 'var(--font-handwritten)',
              fontStyle: 'italic',
              fontSize: 17,
              color: BROWN,
              lineHeight: 1.35,
            }}
          >
            {idea}
          </span>
          <button
            type="button"
            onClick={() => onChange({ ideas: ideas.filter((_, j) => j !== i) })}
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
            add();
          }
        }}
        placeholder="spark an idea…"
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
          fontSize: 17,
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

/* ─── Mission card ───────────────────────────────────────────── */
function MissionCard({
  item,
  expanded,
  onToggle,
  onChange,
  onDone,
  last,
  textStyle,
  isDragging,
  dropIndicator,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  onDragLeave,
}: {
  item: CardItem;
  expanded: boolean;
  onToggle: () => void;
  onChange: (f: Partial<CardItem>) => void;
  onDone: () => void;
  last?: boolean;
  textStyle: number;
  isDragging: boolean;
  dropIndicator: 'before' | 'after' | null;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDragOver: (pos: 'before' | 'after') => void;
  onDrop: () => void;
  onDragLeave: () => void;
}) {
  const [subOpen, setSubOpen] = useState<Record<SubKey, boolean>>({
    process: false,
    focus: false,
    ideas: false,
  });

  function toggleSub(key: SubKey) {
    setSubOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  const ts = TEXT_STYLES[textStyle % TEXT_STYLES.length];

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();
        onDragOver(e.clientY < rect.top + rect.height / 2 ? 'before' : 'after');
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onDrop();
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) onDragLeave();
      }}
      style={{
        position: 'relative',
        borderBottom: last ? 'none' : `1px solid ${INNER_DIV}`,
        opacity: isDragging ? 0.28 : 1,
        transition: 'opacity 0.15s',
      }}
    >
      {/* Drop-before line */}
      {dropIndicator === 'before' && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 14,
            right: 14,
            height: 2,
            background: OCHRE,
            borderRadius: 1,
            zIndex: 10,
          }}
        />
      )}

      <div style={{ padding: '12px 16px' }}>
        {/* ── Title row ───────────────────────────────────────── */}
        <div
          onClick={onToggle}
          style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
        >
          {/* Grip handle */}
          <div
            draggable
            onDragStart={(e) => {
              e.stopPropagation();
              e.dataTransfer.effectAllowed = 'move';
              e.dataTransfer.setData('text/plain', item.id);
              onDragStart();
            }}
            onDragEnd={(e) => {
              e.stopPropagation();
              onDragEnd();
            }}
            onClick={(e) => e.stopPropagation()}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '3px',
              width: 12,
              flexShrink: 0,
              cursor: 'grab',
              padding: '1px 0',
            }}
          >
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <span
                key={i}
                style={{
                  width: 3,
                  height: 3,
                  borderRadius: '50%',
                  background: OCHRE,
                  opacity: 0.25,
                }}
              />
            ))}
          </div>

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

          <span
            style={{
              color: OCHRE_TEXT,
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

        {/* ── By When — always visible ────────────────────────── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 3,
            paddingTop: 5,
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 13,
              fontWeight: 400,
              letterSpacing: '0.04em',
              color: BROWN,
              flexShrink: 0,
            }}
          >
            by
          </span>
          <input
            type="text"
            value={item.timeFrame ?? ''}
            onChange={(e) => onChange({ timeFrame: e.target.value || undefined })}
            onClick={(e) => e.stopPropagation()}
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

        {/* ── Expanded body ───────────────────────────────────── */}
        {expanded && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              {SUBSECTIONS.map((sec) => {
                const isOpen = subOpen[sec.id];
                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => toggleSub(sec.id)}
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      background: isOpen ? `${OCHRE}28` : `${OCHRE}15`,
                      color: isOpen ? BROWN : OCHRE_TEXT,
                      border: `1px solid ${OCHRE}${isOpen ? 'cc' : '40'}`,
                      borderRadius: 4,
                      padding: '10px 0',
                      cursor: 'pointer',
                      flex: 1,
                      transition: 'all 0.15s',
                    }}
                  >
                    {sec.label}
                  </button>
                );
              })}
            </div>
            {subOpen.process && <ProcessBox item={item} onChange={onChange} />}
            {subOpen.focus && <FocusBox item={item} onChange={onChange} />}
            {subOpen.ideas && <IdeasBox item={item} onChange={onChange} />}
          </div>
        )}
      </div>

      {/* Drop-after line */}
      {dropIndicator === 'after' && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 14,
            right: 14,
            height: 2,
            background: OCHRE,
            borderRadius: 1,
            zIndex: 10,
          }}
        />
      )}
    </div>
  );
}

/* ─── Add input row ──────────────────────────────────────────── */
function AddRow({ placeholder, onAdd }: { placeholder: string; onAdd: (text: string) => void }) {
  const [val, setVal] = useState('');
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
          fontFamily: 'var(--font-serif)',
          fontSize: 12,
          fontWeight: 500,
          letterSpacing: '0.06em',
          color: LABEL_COLOR,
          opacity: 0.7,
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
  const globalStyle = 3;
  const [objItem, setObjItem] = useState<CardItem>({ id: 'current', text: '', done: false });
  const [objOpen, setObjOpen] = useState(false);
  const [secOpen, setSecOpen] = useState({
    mission: false,
    daily: false,
    push: false,
    done: false,
  });

  const [missions, setMissions] = useState<CardItem[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [push, setPush] = useState<CardItem[]>([]);
  const [pushExpandedId, setPushExpandedId] = useState<string | null>(null);
  const [chapter, setChapter] = useState('');

  /* ── Drag state ─────────────────────────────────────────────── */
  const dragSrcRef = useRef<{ id: string; src: 'daily' | 'push' } | null>(null);
  // dropTargetRef is the source of truth for logic; dropTarget state is only for visual indicators
  const dropTargetRef = useRef<{ id: string; pos: 'before' | 'after' } | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{ id: string; pos: 'before' | 'after' } | null>(
    null,
  );

  useEffect(() => {
    try {
      const obj = localStorage.getItem('colourmap:current-objective') ?? '';
      const blRaw = localStorage.getItem('colourmap:objective-blocking-log');
      const flRaw = localStorage.getItem('colourmap:objective-flowing-log');
      const stRaw = localStorage.getItem('colourmap:objective-subtasks');
      const idRaw = localStorage.getItem('colourmap:objective-ideas');
      const tf = localStorage.getItem('colourmap:objective-timeframe');
      setObjItem((prev) => ({
        ...prev,
        text: obj,
        timeFrame: tf ?? undefined,
        blockingLog: blRaw ? JSON.parse(blRaw) : [],
        flowingLog: flRaw ? JSON.parse(flRaw) : [],
        subtasks: stRaw ? JSON.parse(stRaw) : [],
        ideas: idRaw ? JSON.parse(idRaw) : [],
      }));
      const raw = localStorage.getItem('colourmap:today-objectives');
      if (raw) setMissions(JSON.parse(raw));
      const rawPush = localStorage.getItem('colourmap:checkin-todos');
      if (rawPush) setPush(JSON.parse(rawPush));
      // text-style no longer user-configurable (fixed at caps)
      setChapter(localStorage.getItem('colourmap:life-chapter') ?? '');
      const objDone = localStorage.getItem('colourmap:objective-done');
      if (objDone === 'true') setObjItem((prev) => ({ ...prev, done: true }));
    } catch {}
  }, []);

  function saveChapter(v: string) {
    setChapter(v);
    try {
      localStorage.setItem('colourmap:life-chapter', v);
    } catch {}
    syncPref('colourmap:life-chapter', v);
  }

  function updateObj(f: Partial<CardItem>) {
    setObjItem((prev) => ({ ...prev, ...f }));
    try {
      if (f.text !== undefined) localStorage.setItem('colourmap:current-objective', f.text);
      if (f.timeFrame !== undefined)
        localStorage.setItem('colourmap:objective-timeframe', f.timeFrame ?? '');
      if (f.blockingLog !== undefined)
        localStorage.setItem('colourmap:objective-blocking-log', JSON.stringify(f.blockingLog));
      if (f.flowingLog !== undefined)
        localStorage.setItem('colourmap:objective-flowing-log', JSON.stringify(f.flowingLog));
      if (f.subtasks !== undefined)
        localStorage.setItem('colourmap:objective-subtasks', JSON.stringify(f.subtasks));
      if (f.ideas !== undefined)
        localStorage.setItem('colourmap:objective-ideas', JSON.stringify(f.ideas));
      if (f.done !== undefined) localStorage.setItem('colourmap:objective-done', String(f.done));
    } catch {}
  }

  function persistMissions(next: CardItem[]) {
    setMissions(next);
    try {
      localStorage.setItem('colourmap:today-objectives', JSON.stringify(next));
    } catch {}
    syncPref('colourmap:today-objectives', next);
  }
  function updateMission(id: string, f: Partial<CardItem>) {
    persistMissions(missions.map((m) => (m.id === id ? { ...m, ...f } : m)));
  }
  function addMission(text: string) {
    persistMissions([
      ...missions,
      { id: crypto.randomUUID(), text, done: false, createdAt: new Date().toISOString() },
    ]);
  }

  function persistPush(next: CardItem[]) {
    setPush(next);
    try {
      localStorage.setItem('colourmap:checkin-todos', JSON.stringify(next));
    } catch {}
    syncPref('colourmap:checkin-todos', next);
  }
  function updatePush(id: string, f: Partial<CardItem>) {
    persistPush(push.map((p) => (p.id === id ? { ...p, ...f } : p)));
  }
  function addPush(text: string) {
    persistPush([
      ...push,
      { id: crypto.randomUUID(), text, done: false, createdAt: new Date().toISOString() },
    ]);
  }

  /* ── Drag handlers ──────────────────────────────────────────── */
  function startDrag(id: string, src: 'daily' | 'push') {
    dragSrcRef.current = { id, src };
    setDraggingId(id);
  }

  function endDrag() {
    dragSrcRef.current = null;
    dropTargetRef.current = null;
    setDraggingId(null);
    setDropTarget(null);
  }

  function hoverCard(targetId: string, pos: 'before' | 'after') {
    dropTargetRef.current = { id: targetId, pos };
    setDropTarget({ id: targetId, pos });
  }

  function dropOnCard(targetId: string, dest: 'daily' | 'push') {
    const ds = dragSrcRef.current;
    const dt = dropTargetRef.current;
    if (!ds || !dt || ds.id === targetId) {
      endDrag();
      return;
    }
    const { id: srcId, src } = ds;
    const { pos } = dt;

    const activeMiss = missions.filter((m) => !m.done);
    const doneMiss = missions.filter((m) => m.done);
    const activePsh = push.filter((p) => !p.done);
    const donePsh = push.filter((p) => p.done);

    const srcArr = src === 'daily' ? activeMiss : activePsh;
    const srcItem = srcArr.find((m) => m.id === srcId);
    if (!srcItem) {
      endDrag();
      return;
    }

    if (src === dest) {
      const arr = srcArr.filter((m) => m.id !== srcId);
      const ti = arr.findIndex((m) => m.id === targetId);
      const ii = pos === 'before' ? ti : ti + 1;
      const next = [...arr.slice(0, ii), srcItem, ...arr.slice(ii)];
      if (src === 'daily') persistMissions([...next, ...doneMiss]);
      else persistPush([...next, ...donePsh]);
    } else {
      const srcNew = srcArr.filter((m) => m.id !== srcId);
      const destArr = dest === 'daily' ? activeMiss : activePsh;
      const ti = destArr.findIndex((m) => m.id === targetId);
      const ii = pos === 'before' ? ti : ti + 1;
      const destNew = [...destArr.slice(0, ii), srcItem, ...destArr.slice(ii)];
      if (src === 'daily') persistMissions([...srcNew, ...doneMiss]);
      else persistPush([...srcNew, ...donePsh]);
      if (dest === 'daily') persistMissions([...destNew, ...doneMiss]);
      else persistPush([...destNew, ...donePsh]);
    }
    endDrag();
  }

  function dropAtSectionEnd(dest: 'daily' | 'push') {
    const ds = dragSrcRef.current;
    if (!ds) {
      endDrag();
      return;
    }
    const { id: srcId, src } = ds;
    const activeMiss = missions.filter((m) => !m.done);
    const doneMiss = missions.filter((m) => m.done);
    const activePsh = push.filter((p) => !p.done);
    const donePsh = push.filter((p) => p.done);
    const srcArr = src === 'daily' ? activeMiss : activePsh;
    const srcItem = srcArr.find((m) => m.id === srcId);
    if (!srcItem) {
      endDrag();
      return;
    }
    const srcNew = srcArr.filter((m) => m.id !== srcId);
    if (src === dest) {
      if (src === 'daily') persistMissions([...srcNew, srcItem, ...doneMiss]);
      else persistPush([...srcNew, srcItem, ...donePsh]);
    } else {
      if (src === 'daily') persistMissions([...srcNew, ...doneMiss]);
      else persistPush([...srcNew, ...donePsh]);
      const destArr = dest === 'daily' ? activeMiss : activePsh;
      if (dest === 'daily') persistMissions([...destArr, srcItem, ...doneMiss]);
      else persistPush([...destArr, srcItem, ...donePsh]);
    }
    endDrag();
  }

  const activeMissions = missions.filter((m) => !m.done);
  const doneMissions = missions.filter((m) => m.done);
  const activePush = push.filter((p) => !p.done);
  const donePush = push.filter((p) => p.done);
  const allDone = [
    ...doneMissions.map((m) => ({ ...m, _src: 'daily' as const })),
    ...donePush.map((p) => ({ ...p, _src: 'push' as const })),
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '4px 0 32px' }}>
      {/* ── Current Mission ──────────────────────────────────── */}
      <Section
        title="Current Mission"
        open={secOpen.mission}
        onToggle={() => setSecOpen((s) => ({ ...s, mission: !s.mission }))}
      >
        <MissionCard
          item={objItem}
          expanded={objOpen}
          onToggle={() => setObjOpen((v) => !v)}
          onChange={updateObj}
          onDone={() => updateObj({ done: !objItem.done })}
          textStyle={globalStyle}
          isDragging={false}
          dropIndicator={null}
          onDragStart={() => {}}
          onDragEnd={() => {}}
          onDragOver={() => {}}
          onDrop={() => {}}
          onDragLeave={() => {}}
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
                color: objItem.done ? OCHRE_TEXT : LABEL_COLOR,
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
      >
        {activeMissions.map((m) => (
          <MissionCard
            key={m.id}
            item={m}
            expanded={expandedId === m.id}
            onToggle={() => setExpandedId(expandedId === m.id ? null : m.id)}
            onChange={(f) => updateMission(m.id, f)}
            onDone={() => updateMission(m.id, { done: true })}
            textStyle={globalStyle}
            isDragging={draggingId === m.id}
            dropIndicator={dropTarget?.id === m.id ? dropTarget.pos : null}
            onDragStart={() => startDrag(m.id, 'daily')}
            onDragEnd={endDrag}
            onDragOver={(pos) => hoverCard(m.id, pos)}
            onDrop={() => dropOnCard(m.id, 'daily')}
            onDragLeave={() => {
              dropTargetRef.current = null;
              setDropTarget(null);
            }}
          />
        ))}
        {/* Section-end drop zone */}
        {draggingId && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              dropTargetRef.current = null;
              setDropTarget(null);
            }}
            onDrop={(e) => {
              e.preventDefault();
              dropAtSectionEnd('daily');
            }}
            style={{ height: 32, display: 'flex', alignItems: 'center', paddingLeft: 16 }}
          >
            <div style={{ height: 2, flex: 1, borderRadius: 1, background: `${OCHRE}20` }} />
          </div>
        )}
        <AddRow placeholder="add a mission…" onAdd={addMission} />
      </Section>

      {/* ── Push for Tomorrow ────────────────────────────────── */}
      <Section
        title="Push for Tomorrow"
        open={secOpen.push}
        onToggle={() => setSecOpen((s) => ({ ...s, push: !s.push }))}
      >
        {activePush.map((p) => (
          <MissionCard
            key={p.id}
            item={p}
            expanded={pushExpandedId === p.id}
            onToggle={() => setPushExpandedId(pushExpandedId === p.id ? null : p.id)}
            onChange={(f) => updatePush(p.id, f)}
            onDone={() => updatePush(p.id, { done: true })}
            textStyle={globalStyle}
            isDragging={draggingId === p.id}
            dropIndicator={dropTarget?.id === p.id ? dropTarget.pos : null}
            onDragStart={() => startDrag(p.id, 'push')}
            onDragEnd={endDrag}
            onDragOver={(pos) => hoverCard(p.id, pos)}
            onDrop={() => dropOnCard(p.id, 'push')}
            onDragLeave={() => {
              dropTargetRef.current = null;
              setDropTarget(null);
            }}
          />
        ))}
        {/* Section-end drop zone */}
        {draggingId && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              dropTargetRef.current = null;
              setDropTarget(null);
            }}
            onDrop={(e) => {
              e.preventDefault();
              dropAtSectionEnd('push');
            }}
            style={{ height: 32, display: 'flex', alignItems: 'center', paddingLeft: 16 }}
          >
            <div style={{ height: 2, flex: 1, borderRadius: 1, background: `${OCHRE}20` }} />
          </div>
        )}
        <AddRow placeholder="push for tomorrow…" onAdd={addPush} />
      </Section>

      {/* ── Done ─────────────────────────────────────────────── */}
      {allDone.length > 0 && (
        <div
          style={{
            border: `1px solid ${CARD_BORDER}`,
            borderRadius: 16,
            background: CARD_BG,
            overflow: 'hidden',
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
              background: 'rgba(196,160,96,0.06)',
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
            }}
          >
            <span style={{ flex: 1 }} />
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
                marginLeft: 5,
              }}
            >
              {allDone.length}
            </span>
            <span style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
              <span
                style={{
                  color: OCHRE,
                  opacity: 0.4,
                  fontSize: 11,
                  transform: secOpen.done ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s',
                }}
              >
                ▾
              </span>
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
                  }}
                >
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
                  <span
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: '#C09878',
                      flexShrink: 0,
                    }}
                  >
                    {item._src === 'push' ? 'tmrw' : 'daily'}
                  </span>
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

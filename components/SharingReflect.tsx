'use client';

import { useState } from 'react';

/* ── Sharing reflection panel — pill lists + open questions ── */

const S_COLOR = '#6B7F4E';
const font = 'var(--font-serif)';
const LS_REFLECT = 'colourmap:sharing-reflect-v2';

const PILL_LISTS = [
  {
    key: 'catchup',
    label: 'People I want to catch up with',
    storageKey: 'colourmap:sharing-catchup',
  },
  { key: 'met', label: 'People I recently met', storageKey: 'colourmap:sharing-met' },
  { key: 'meet', label: 'People I should meet', storageKey: 'colourmap:sharing-meet' },
  { key: 'lifters', label: 'Who lifts me up', storageKey: 'colourmap:sharing-lifters' },
  {
    key: 'live',
    label: 'Things I want to live in the next months',
    storageKey: 'colourmap:sharing-live',
  },
] as const;

const QUESTIONS = [
  { key: 'weight', label: 'Did you share what was weighing you down?' },
  { key: 'lift', label: 'Did you share what was lifting you up?' },
  { key: 'happy', label: 'Are you happy with the people around you?' },
  { key: 'impact', label: 'Whose life could your presence make lighter right now?' },
  { key: 'need', label: 'What do you need from others?' },
];

function loadList(storageKey: string): { id: string; text: string }[] {
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? (JSON.parse(raw) as { id: string; text: string }[]) : [];
  } catch {
    return [];
  }
}

function PillList({ label, storageKey }: { label: string; storageKey: string }) {
  const [items, setItems] = useState<{ id: string; text: string }[]>(() => loadList(storageKey));
  const [input, setInput] = useState('');

  function save(next: typeof items) {
    setItems(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  }

  return (
    <div className="space-y-2">
      <p
        style={{
          fontFamily: font,
          fontSize: 11,
          fontWeight: 700,
          color: S_COLOR,
          opacity: 0.7,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </p>
      {items.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {items.map((item) => (
            <span
              key={item.id}
              className="group inline-flex items-center gap-1 rounded-full px-3 py-1"
              style={{
                background: `${S_COLOR}0E`,
                border: `1px solid ${S_COLOR}30`,
                fontFamily: font,
                fontSize: 12,
                color: S_COLOR,
              }}
            >
              {item.text}
              <button
                type="button"
                onClick={() => save(items.filter((i) => i.id !== item.id))}
                className="cursor-pointer opacity-0 transition-opacity group-hover:opacity-50 text-xs"
                style={{ background: 'none', border: 'none', padding: 0, color: S_COLOR }}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && input.trim()) {
            save([...items, { id: crypto.randomUUID(), text: input.trim() }]);
            setInput('');
          }
        }}
        placeholder="+ add…"
        className="w-full border-b bg-transparent pb-1 text-sm outline-none placeholder:italic text-center placeholder:text-center"
        style={{ fontFamily: font, color: 'var(--foreground)', borderColor: `${S_COLOR}20` }}
      />
    </div>
  );
}

export default function SharingReflect() {
  const [open, setOpen] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    try {
      return JSON.parse(localStorage.getItem(LS_REFLECT) || '{}') as Record<string, string>;
    } catch {
      return {};
    }
  });

  function save(key: string, value: string) {
    const next = { ...answers, [key]: value };
    setAnswers(next);
    localStorage.setItem(LS_REFLECT, JSON.stringify(next));
  }

  return (
    <div className="w-full">
      {/* Losange trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full cursor-pointer items-center gap-3"
        style={{ background: 'none', border: 'none', padding: '4px 0' }}
      >
        <div style={{ flex: 1, height: 1, background: `${S_COLOR}20` }} />
        <span
          style={{
            width: 10,
            height: 10,
            background: open ? S_COLOR : 'transparent',
            border: `1.5px solid ${S_COLOR}`,
            display: 'block',
            transform: 'rotate(45deg)',
            borderRadius: 2,
            flexShrink: 0,
            transition: 'background 0.15s',
          }}
        />
        <span
          style={{
            fontFamily: font,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: S_COLOR,
            opacity: open ? 1 : 0.6,
          }}
        >
          Programme
        </span>
        <div style={{ flex: 1, height: 1, background: `${S_COLOR}20` }} />
      </button>

      {open && (
        <div className="mt-3 space-y-5 animate-in fade-in duration-150">
          {PILL_LISTS.map((pl) => (
            <PillList key={pl.key} label={pl.label} storageKey={pl.storageKey} />
          ))}

          <div style={{ height: 1, background: `${S_COLOR}15` }} />

          {QUESTIONS.map((q) => (
            <div key={q.key}>
              <p
                style={{
                  fontFamily: font,
                  fontSize: 11,
                  fontWeight: 700,
                  color: S_COLOR,
                  opacity: 0.7,
                  marginBottom: 5,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                {q.label}
              </p>
              <textarea
                value={answers[q.key] || ''}
                onChange={(e) => save(q.key, e.target.value)}
                placeholder="…"
                rows={1}
                className="w-full resize-none border-b bg-transparent pb-1 outline-none placeholder:italic"
                style={{
                  fontFamily: font,
                  fontSize: 13,
                  color: 'var(--foreground)',
                  borderColor: `${S_COLOR}25`,
                  overflow: 'hidden',
                  fieldSizing: 'content' as React.CSSProperties['fieldSizing'],
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

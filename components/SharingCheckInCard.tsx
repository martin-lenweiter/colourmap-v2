'use client';

import { useState } from 'react';

import CockpitCat from '@/components/CockpitCat';
import { useStyle } from '@/components/StyleContext';

/* ═══════════════════════════════════════════════════════════
   SHARING CHECK-IN CARD — Cat + People + Gratitude + Reach Out
   ═══════════════════════════════════════════════════════════ */

const SHARING_COLOR = '#6B7F4E';

function loadList(key: string): string[] {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
}

function SimpleList({
  storageKey,
  placeholder,
  icon,
}: {
  storageKey: string;
  placeholder: string;
  icon: string;
}) {
  const [items, setItems] = useState<string[]>(() => loadList(storageKey));
  const [input, setInput] = useState('');

  const save = (next: string[]) => {
    setItems(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  };

  const add = (text: string) => {
    if (!text.trim()) return;
    save([...items, text.trim()]);
    setInput('');
  };

  return (
    <div className="space-y-2">
      <div className="space-y-1.5">
        {items.map((item, i) => (
          <div key={i} className="group flex items-center gap-2.5">
            <span className="shrink-0 text-sm" style={{ color: SHARING_COLOR, opacity: 0.5 }}>
              {icon}
            </span>
            <span className="flex-1 text-sm" style={{ fontFamily: 'var(--font-handwritten)' }}>
              {item}
            </span>
            <button
              type="button"
              onClick={() => save(items.filter((_, idx) => idx !== i))}
              className="cursor-pointer text-xs opacity-0 transition-opacity group-hover:opacity-40"
              style={{ background: 'none', border: 'none', color: SHARING_COLOR }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') add(input);
        }}
        placeholder={placeholder}
        className="w-full border-b bg-transparent pb-1 text-sm outline-none"
        style={{
          color: SHARING_COLOR,
          borderColor: `${SHARING_COLOR}20`,
          fontFamily: 'var(--font-handwritten)',
        }}
      />
    </div>
  );
}

export default function SharingCheckInCard() {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    people: true,
    gratitude: false,
    reachout: false,
  });
  const toggle = (key: string) => setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const sections = [
    {
      key: 'people',
      label: 'People',
      storageKey: 'colourmap:sharing-people',
      placeholder: 'Who did you connect with?...',
      icon: '●',
    },
    {
      key: 'gratitude',
      label: 'Gratitude',
      storageKey: 'colourmap:sharing-gratitude',
      placeholder: 'What are you grateful for?...',
      icon: '♡',
    },
    {
      key: 'reachout',
      label: 'Reach Out',
      storageKey: 'colourmap:sharing-reachout',
      placeholder: 'Who will you reach out to?...',
      icon: '→',
    },
  ];

  return (
    <div
      className="space-y-4 rounded-3xl border border-[#7a543833] px-5 py-6"
      style={{
        background: 'linear-gradient(180deg, rgba(251,244,232,0.95), rgba(246,236,221,0.92))',
        boxShadow: '0 24px 50px -34px rgba(92,48,24,0.35)',
      }}
    >
      <CockpitCat />

      {sections.map((s) => (
        <div key={s.key}>
          <button
            type="button"
            onClick={() => toggle(s.key)}
            className="flex w-full cursor-pointer items-center justify-between"
            style={{ background: 'none', border: 'none', padding: 0 }}
          >
            <span
              className="text-base font-semibold"
              style={{ color: SHARING_COLOR, fontFamily: 'var(--font-handwritten)' }}
            >
              {s.label}
            </span>
            <span className="text-xs text-muted-foreground/30">
              {openSections[s.key] ? '▲' : '▼'}
            </span>
          </button>
          {openSections[s.key] && (
            <SimpleList storageKey={s.storageKey} placeholder={s.placeholder} icon={s.icon} />
          )}
        </div>
      ))}
    </div>
  );
}

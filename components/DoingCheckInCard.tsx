'use client';

import { useState } from 'react';
import CockpitCat from '@/components/CockpitCat';

/* ═══════════════════════════════════════════════════════════
   DOING CHECK-IN CARD — Cat + To-do + Missions + Trackers
   Pillbox format for all lists.
   ═══════════════════════════════════════════════════════════ */

const DOING_COLOR = '#7A9A7A';
const TODOS_KEY = 'colourmap:doing-todos';
const MISSIONS_KEY = 'colourmap:doing-missions-list';
const TRACKERS_KEY = 'colourmap:doing-trackers-list';

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

/* ─── To-do — pills ─── */
function TodoList({ fontFamily }: { fontFamily: string }) {
  const [items, setItems] = useState<{ id: string; text: string; done: boolean }[]>(() =>
    loadJson(TODOS_KEY, []),
  );
  const [input, setInput] = useState('');
  const save = (next: typeof items) => {
    setItems(next);
    localStorage.setItem(TODOS_KEY, JSON.stringify(next));
  };
  const add = (text: string) => {
    if (!text.trim()) return;
    save([...items, { id: crypto.randomUUID(), text: text.trim(), done: false }]);
    setInput('');
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item.id}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-full px-4 py-2.5 text-sm transition-all hover:scale-105"
            style={{
              background: item.done ? `${DOING_COLOR}15` : `${DOING_COLOR}08`,
              border: `1.5px solid ${item.done ? `${DOING_COLOR}40` : `${DOING_COLOR}22`}`,
              color: item.done ? `${DOING_COLOR}70` : DOING_COLOR,
              textDecoration: item.done ? 'line-through' : 'none',
              fontFamily,
              fontWeight: item.done ? 400 : 600,
            }}
            onClick={() => save(items.map((i) => (i.id === item.id ? { ...i, done: !i.done } : i)))}
          >
            {item.text}
            <span
              className="text-[10px] opacity-30 hover:opacity-70"
              onClick={(e) => {
                e.stopPropagation();
                save(items.filter((i) => i.id !== item.id));
              }}
            >
              ✕
            </span>
          </span>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') add(input);
        }}
        placeholder="+ add task..."
        className="w-full border-b bg-transparent pb-2 text-base outline-none"
        style={{ color: DOING_COLOR, borderColor: `${DOING_COLOR}20`, fontFamily }}
      />
    </div>
  );
}

/* ─── Missions — pills with progress fill ─── */
function MissionsList({ fontFamily }: { fontFamily: string }) {
  const [missions, setMissions] = useState<{ id: string; name: string; progress: number }[]>(() =>
    loadJson(MISSIONS_KEY, []),
  );
  const [input, setInput] = useState('');
  const save = (next: typeof missions) => {
    setMissions(next);
    localStorage.setItem(MISSIONS_KEY, JSON.stringify(next));
  };
  const add = (name: string) => {
    if (!name.trim()) return;
    save([...missions, { id: crypto.randomUUID(), name: name.trim(), progress: 0 }]);
    setInput('');
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {missions.map((m) => (
          <div
            key={m.id}
            className="group relative overflow-hidden rounded-full transition-all hover:scale-105"
            style={{ border: `1.5px solid ${DOING_COLOR}30`, background: `${DOING_COLOR}06` }}
          >
            <div
              className="absolute inset-0 rounded-full transition-all duration-300"
              style={{ width: `${m.progress}%`, background: DOING_COLOR, opacity: 0.12 }}
            />
            <div className="relative flex items-center gap-1.5 px-4 py-2">
              <button
                type="button"
                onClick={() =>
                  save(
                    missions.map((x) =>
                      x.id === m.id ? { ...x, progress: Math.min(100, x.progress + 10) } : x,
                    ),
                  )
                }
                className="cursor-pointer text-sm"
                style={{
                  color: DOING_COLOR,
                  fontFamily,
                  fontWeight: 600,
                  background: 'none',
                  border: 'none',
                  padding: 0,
                }}
              >
                {m.name}
              </button>
              <span
                className="text-[11px]"
                style={{ color: DOING_COLOR, opacity: 0.5, fontFamily }}
              >
                {m.progress}%
              </span>
              <span
                className="cursor-pointer text-[10px] opacity-0 transition-opacity group-hover:opacity-50"
                style={{ color: DOING_COLOR }}
                onClick={() => save(missions.filter((x) => x.id !== m.id))}
              >
                ✕
              </span>
            </div>
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
        placeholder="+ add mission..."
        className="w-full border-b bg-transparent pb-2 text-base outline-none"
        style={{ color: DOING_COLOR, borderColor: `${DOING_COLOR}20`, fontFamily }}
      />
    </div>
  );
}

/* ─── Trackers — pill cards with day dots ─── */
function TrackersList({ fontFamily }: { fontFamily: string }) {
  const today = new Date().getDay();
  const [trackers, setTrackers] = useState<{ id: string; name: string; days: boolean[] }[]>(() =>
    loadJson(TRACKERS_KEY, []),
  );
  const [input, setInput] = useState('');
  const save = (next: typeof trackers) => {
    setTrackers(next);
    localStorage.setItem(TRACKERS_KEY, JSON.stringify(next));
  };
  const add = (name: string) => {
    if (!name.trim()) return;
    save([
      ...trackers,
      { id: crypto.randomUUID(), name: name.trim(), days: Array(7).fill(false) as boolean[] },
    ]);
    setInput('');
  };
  const labels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <div className="space-y-3">
      {trackers.map((t) => (
        <div
          key={t.id}
          className="group rounded-2xl px-4 py-3"
          style={{ background: `${DOING_COLOR}06`, border: `1px solid ${DOING_COLOR}15` }}
        >
          <div className="mb-2 flex items-center justify-between">
            <span
              className="text-sm font-semibold"
              style={{ color: DOING_COLOR, fontFamily: 'var(--font-handwritten)' }}
            >
              {t.name}
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs" style={{ color: DOING_COLOR, opacity: 0.4, fontFamily }}>
                {t.days.filter(Boolean).length}/7
              </span>
              <span
                className="cursor-pointer text-[10px] opacity-0 transition-opacity group-hover:opacity-40"
                style={{ color: DOING_COLOR }}
                onClick={() => save(trackers.filter((x) => x.id !== t.id))}
              >
                ✕
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {t.days.map((done, di) => (
              <button
                key={di}
                type="button"
                onClick={() =>
                  save(
                    trackers.map((x) =>
                      x.id !== t.id ? x : { ...x, days: x.days.map((d, j) => (j === di ? !d : d)) },
                    ),
                  )
                }
                className="flex cursor-pointer flex-col items-center gap-1"
                style={{ background: 'none', border: 'none', padding: 0 }}
              >
                <div
                  className="rounded-full transition-all duration-200"
                  style={{
                    width: 28,
                    height: 28,
                    background: done ? DOING_COLOR : `${DOING_COLOR}12`,
                    opacity: done ? 0.6 : 0.4,
                    border: di === (today + 6) % 7 ? `2px solid ${DOING_COLOR}` : 'none',
                  }}
                />
                <span className="text-[10px]" style={{ color: DOING_COLOR, opacity: 0.35 }}>
                  {labels[di]}
                </span>
              </button>
            ))}
          </div>
        </div>
      ))}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') add(input);
        }}
        placeholder="+ add tracker..."
        className="w-full border-b bg-transparent pb-2 text-base outline-none"
        style={{ color: DOING_COLOR, borderColor: `${DOING_COLOR}20`, fontFamily }}
      />
    </div>
  );
}

/* ─── Main ─── */
export default function DoingCheckInCard() {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    todos: true,
    missions: false,
    trackers: false,
  });
  const toggle = (key: string) => setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div
      className="space-y-4 rounded-3xl border border-[#7a543833] px-5 py-6"
      style={{
        background: 'linear-gradient(180deg, rgba(251,244,232,0.95), rgba(246,236,221,0.92))',
        boxShadow: '0 24px 50px -34px rgba(92,48,24,0.35)',
      }}
    >
      <CockpitCat />

      {(['todos', 'missions', 'trackers'] as const).map((key) => {
        const label = key === 'todos' ? 'To-do' : key === 'missions' ? 'Missions' : 'Trackers';
        return (
          <div key={key}>
            <button
              type="button"
              onClick={() => toggle(key)}
              className="flex w-full cursor-pointer items-center justify-between"
              style={{ background: 'none', border: 'none', padding: 0 }}
            >
              <span
                className="text-base font-semibold"
                style={{ color: DOING_COLOR, fontFamily: 'var(--font-handwritten)' }}
              >
                {label}
              </span>
              <span className="text-xs text-muted-foreground/30">
                {openSections[key] ? '▲' : '▼'}
              </span>
            </button>
            {openSections[key] &&
              (key === 'todos' ? (
                <TodoList fontFamily={'var(--font-handwritten)'} />
              ) : key === 'missions' ? (
                <MissionsList fontFamily={'var(--font-handwritten)'} />
              ) : (
                <TrackersList fontFamily={'var(--font-handwritten)'} />
              ))}
          </div>
        );
      })}
    </div>
  );
}

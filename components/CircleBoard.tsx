'use client';

import { useEffect, useState } from 'react';

/* ═══════════════════════════════════════════════════════════
   CIRCLE BOARD — shared mission board for a group of people.
   Create circles, join with a code, shared missions + log.
   Phase 1: localStorage only (single device, demo mode).
   ═══════════════════════════════════════════════════════════ */

const LS_CIRCLES = 'colourmap:circles';
const LS_ACTIVE = 'colourmap:active-circle';
const LS_ME = 'colourmap:circle-me';

interface Circle {
  id: string;
  name: string;
  code: string;
  color: string;
  members: Member[];
  missions: Mission[];
  notes: Note[];
  createdAt: string;
}

interface Member {
  id: string;
  name: string;
  color: string;
  pulse?: string;
  pulseColor?: string;
}

interface Mission {
  id: string;
  text: string;
  claimedBy?: string;
  done: boolean;
  createdAt: string;
}

interface Note {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  createdAt: string;
}

const CIRCLE_COLORS = ['#D4805A', '#6890B0', '#7AAA58', '#9B6BA0', '#C4A060', '#5A8AAA'];

function ls<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function ss(key: string, val: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {}
}

function genCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

type View = 'list' | 'board';

export default function CircleBoard() {
  const [circles, setCircles] = useState<Circle[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [me, setMe] = useState<{ id: string; name: string }>({ id: '', name: '' });
  const [view, setView] = useState<View>('list');
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [newName, setNewName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [missionInput, setMissionInput] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [editingMe, setEditingMe] = useState(false);
  const [meNameInput, setMeNameInput] = useState('');

  useEffect(() => {
    setCircles(ls<Circle[]>(LS_CIRCLES, []));
    setActiveId(ls<string | null>(LS_ACTIVE, null));
    const savedMe = ls<{ id: string; name: string }>(LS_ME, {
      id: crypto.randomUUID(),
      name: '',
    });
    setMe(savedMe);
    if (!savedMe.name) setEditingMe(true);
  }, []);

  function persist(next: Circle[]) {
    setCircles(next);
    ss(LS_CIRCLES, next);
  }

  function selectCircle(id: string) {
    setActiveId(id);
    ss(LS_ACTIVE, id);
    setView('board');
  }

  function saveMe(name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;
    const updated = { ...me, name: trimmed };
    if (!updated.id) updated.id = crypto.randomUUID();
    setMe(updated);
    ss(LS_ME, updated);
    setEditingMe(false);
  }

  function createCircle() {
    const name = newName.trim();
    if (!name || !me.name) return;
    const circle: Circle = {
      id: crypto.randomUUID(),
      name,
      code: genCode(),
      color: CIRCLE_COLORS[circles.length % CIRCLE_COLORS.length],
      members: [{ id: me.id, name: me.name, color: CIRCLE_COLORS[0] }],
      missions: [],
      notes: [],
      createdAt: new Date().toISOString(),
    };
    const next = [...circles, circle];
    persist(next);
    selectCircle(circle.id);
    setNewName('');
    setCreating(false);
  }

  function joinCircle() {
    const code = joinCode.trim().toUpperCase();
    const circle = circles.find((c) => c.code === code);
    if (!circle) return;
    if (circle.members.some((m) => m.id === me.id)) {
      selectCircle(circle.id);
      setJoining(false);
      setJoinCode('');
      return;
    }
    const memberColor = CIRCLE_COLORS[circle.members.length % CIRCLE_COLORS.length];
    const updated = circles.map((c) =>
      c.id === circle.id
        ? { ...c, members: [...c.members, { id: me.id, name: me.name, color: memberColor }] }
        : c,
    );
    persist(updated);
    selectCircle(circle.id);
    setJoining(false);
    setJoinCode('');
  }

  function addMission() {
    const text = missionInput.trim();
    if (!text || !activeId) return;
    const mission: Mission = {
      id: crypto.randomUUID(),
      text,
      done: false,
      createdAt: new Date().toISOString(),
    };
    const updated = circles.map((c) =>
      c.id === activeId ? { ...c, missions: [...c.missions, mission] } : c,
    );
    persist(updated);
    setMissionInput('');
  }

  function toggleMission(missionId: string) {
    const updated = circles.map((c) =>
      c.id === activeId
        ? {
            ...c,
            missions: c.missions.map((m) => (m.id === missionId ? { ...m, done: !m.done } : m)),
          }
        : c,
    );
    persist(updated);
  }

  function claimMission(missionId: string) {
    const updated = circles.map((c) =>
      c.id === activeId
        ? {
            ...c,
            missions: c.missions.map((m) =>
              m.id === missionId
                ? { ...m, claimedBy: m.claimedBy === me.id ? undefined : me.id }
                : m,
            ),
          }
        : c,
    );
    persist(updated);
  }

  function removeMission(missionId: string) {
    const updated = circles.map((c) =>
      c.id === activeId ? { ...c, missions: c.missions.filter((m) => m.id !== missionId) } : c,
    );
    persist(updated);
  }

  function addNote() {
    const text = noteInput.trim();
    if (!text || !activeId) return;
    const note: Note = {
      id: crypto.randomUUID(),
      authorId: me.id,
      authorName: me.name,
      text,
      createdAt: new Date().toISOString(),
    };
    const updated = circles.map((c) =>
      c.id === activeId ? { ...c, notes: [note, ...c.notes].slice(0, 100) } : c,
    );
    persist(updated);
    setNoteInput('');
  }

  const active = circles.find((c) => c.id === activeId);

  // Read pulse from check-in — only on circle switch
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally runs only on activeId change
  useEffect(() => {
    if (!active || !me.id) return;
    try {
      const hawkinsIdx = Number(localStorage.getItem('colourmap:process-idx') || '4');
      const HAWKINS_LABELS = [
        'Shame',
        'Apathy',
        'Grief',
        'Fear',
        'Anger',
        'Courage',
        'Acceptance',
        'Reason',
        'Love',
        'Peace',
      ];
      const HAWKINS_COLORS = [
        '#B8D0E8',
        '#D8B0C8',
        '#E8A0C4',
        '#F080B8',
        '#F0A088',
        '#F8C040',
        '#F0E060',
        '#A8E090',
        '#88D8B0',
        '#88C8E8',
      ];
      const pulse = HAWKINS_LABELS[hawkinsIdx] || 'Neutral';
      const pulseColor = HAWKINS_COLORS[hawkinsIdx] || '#C4A060';
      const updated = circles.map((c) =>
        c.id === activeId
          ? {
              ...c,
              members: c.members.map((m) => (m.id === me.id ? { ...m, pulse, pulseColor } : m)),
            }
          : c,
      );
      // Only persist if pulse actually changed
      const currentMember = active.members.find((m) => m.id === me.id);
      if (currentMember?.pulse !== pulse) {
        persist(updated);
      }
    } catch {}
  }, [activeId]);

  const font = 'var(--font-serif)';

  // ── Name setup ──
  if (editingMe || !me.name) {
    return (
      <div className="mx-auto max-w-md space-y-6 px-4 py-12">
        <div className="text-center space-y-2">
          <p
            style={{
              fontFamily: font,
              fontSize: '22px',
              fontWeight: 700,
              fontStyle: 'italic',
              color: '#5C3018',
            }}
          >
            Circles
          </p>
          <p
            className="italic"
            style={{ fontFamily: font, fontSize: '14px', color: '#8A6A4A', opacity: 0.8 }}
          >
            first, what should people call you?
          </p>
        </div>
        <div className="flex justify-center">
          <input
            type="text"
            value={meNameInput || me.name}
            onChange={(e) => setMeNameInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveMe(meNameInput || me.name);
            }}
            placeholder="your name..."
            autoFocus
            className="border-b bg-transparent pb-2 text-center outline-none placeholder:italic placeholder:text-[#8A6A4A] placeholder:opacity-50"
            style={{
              fontFamily: font,
              fontSize: '18px',
              color: '#5C3018',
              borderColor: '#C4A06030',
              width: 200,
            }}
          />
        </div>
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => saveMe(meNameInput || me.name)}
            className="cursor-pointer rounded-full px-6 py-2 text-[13px] font-semibold transition-all"
            style={{ color: '#C4A060', background: '#C4A06012', border: '1px solid #C4A06030' }}
          >
            continue
          </button>
        </div>
      </div>
    );
  }

  // ── Circle list ──
  if (view === 'list' || !active) {
    return (
      <div className="mx-auto max-w-md space-y-6 px-4 py-8">
        <div className="text-center space-y-1">
          <p
            style={{
              fontFamily: font,
              fontSize: '22px',
              fontWeight: 700,
              fontStyle: 'italic',
              color: '#5C3018',
            }}
          >
            Circles
          </p>
          <p
            className="italic"
            style={{ fontFamily: font, fontSize: '14px', color: '#8A6A4A', opacity: 0.8 }}
          >
            your shared spaces
          </p>
        </div>

        {/* My name */}
        <div className="flex items-center justify-center gap-2">
          <span style={{ fontFamily: font, fontSize: '13px', color: '#8A6A4A', opacity: 0.5 }}>
            you are
          </span>
          <button
            type="button"
            onClick={() => {
              setMeNameInput(me.name);
              setEditingMe(true);
            }}
            className="cursor-pointer font-semibold transition-all"
            style={{
              fontFamily: font,
              fontSize: '13px',
              color: '#5C3018',
              background: 'none',
              border: 'none',
            }}
          >
            {me.name}
          </button>
        </div>

        {/* Circle cards */}
        {circles.length > 0 && (
          <div className="space-y-2">
            {circles.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => selectCircle(c.id)}
                className="flex w-full cursor-pointer items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all"
                style={{ background: `${c.color}08`, border: `1px solid ${c.color}20` }}
              >
                <span
                  className="block rounded-full"
                  style={{ width: 12, height: 12, background: c.color }}
                />
                <div className="flex-1">
                  <p
                    style={{
                      fontFamily: font,
                      fontSize: '15px',
                      fontWeight: 700,
                      color: '#5C3018',
                    }}
                  >
                    {c.name}
                  </p>
                  <p style={{ fontFamily: font, fontSize: '11px', color: '#8A6A4A', opacity: 0.5 }}>
                    {c.members.length} {c.members.length === 1 ? 'member' : 'members'} ·{' '}
                    {c.missions.filter((m) => !m.done).length} active
                  </p>
                </div>
                {/* Member pulse dots */}
                <div className="flex gap-1">
                  {c.members.map((m) => (
                    <span
                      key={m.id}
                      className="block rounded-full"
                      style={{
                        width: 8,
                        height: 8,
                        background: m.pulseColor || m.color,
                        opacity: m.pulse ? 0.8 : 0.3,
                      }}
                      title={`${m.name}${m.pulse ? ` · ${m.pulse}` : ''}`}
                    />
                  ))}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Create / Join buttons */}
        {!creating && !joining && (
          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="cursor-pointer rounded-full px-4 py-2 text-[12px] font-semibold transition-all"
              style={{ color: '#7AAA58', background: '#7AAA5810', border: '1px solid #7AAA5825' }}
            >
              create circle
            </button>
            <button
              type="button"
              onClick={() => setJoining(true)}
              className="cursor-pointer rounded-full px-4 py-2 text-[12px] font-semibold transition-all"
              style={{ color: '#6890B0', background: '#6890B010', border: '1px solid #6890B025' }}
            >
              join with code
            </button>
          </div>
        )}

        {/* Create form */}
        {creating && (
          <div
            className="space-y-3 rounded-2xl border px-4 py-4 animate-in fade-in duration-150"
            style={{ borderColor: '#7AAA5830', background: '#7AAA5806' }}
          >
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') createCircle();
              }}
              placeholder="circle name... (e.g. Rock Band)"
              autoFocus
              className="w-full border-b bg-transparent pb-1 outline-none placeholder:italic placeholder:text-[#8A6A4A] placeholder:opacity-50"
              style={{
                fontFamily: font,
                fontSize: '15px',
                color: '#5C3018',
                borderColor: '#7AAA5830',
              }}
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={createCircle}
                className="cursor-pointer rounded-full px-4 py-1.5 text-[12px] font-semibold"
                style={{ color: '#7AAA58', background: '#7AAA5812', border: '1px solid #7AAA5830' }}
              >
                create
              </button>
              <button
                type="button"
                onClick={() => setCreating(false)}
                className="cursor-pointer text-[11px]"
                style={{ color: '#8A6A4A', opacity: 0.4, background: 'none', border: 'none' }}
              >
                cancel
              </button>
            </div>
          </div>
        )}

        {/* Join form */}
        {joining && (
          <div
            className="space-y-3 rounded-2xl border px-4 py-4 animate-in fade-in duration-150"
            style={{ borderColor: '#6890B030', background: '#6890B006' }}
          >
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => {
                if (e.key === 'Enter') joinCircle();
              }}
              placeholder="enter 6-letter code..."
              autoFocus
              maxLength={6}
              className="w-full border-b bg-transparent pb-1 text-center uppercase tracking-[0.3em] outline-none placeholder:italic placeholder:text-[#8A6A4A] placeholder:opacity-50 placeholder:tracking-normal"
              style={{
                fontFamily: font,
                fontSize: '18px',
                color: '#5C3018',
                borderColor: '#6890B030',
              }}
            />
            <div className="flex justify-center gap-2">
              <button
                type="button"
                onClick={joinCircle}
                className="cursor-pointer rounded-full px-4 py-1.5 text-[12px] font-semibold"
                style={{ color: '#6890B0', background: '#6890B012', border: '1px solid #6890B030' }}
              >
                join
              </button>
              <button
                type="button"
                onClick={() => setJoining(false)}
                className="cursor-pointer text-[11px]"
                style={{ color: '#8A6A4A', opacity: 0.4, background: 'none', border: 'none' }}
              >
                cancel
              </button>
            </div>
          </div>
        )}

        {circles.length === 0 && !creating && !joining && (
          <p
            className="text-center italic"
            style={{ fontFamily: font, fontSize: '13px', color: '#8A6A4A', opacity: 0.4 }}
          >
            create your first circle to start collaborating
          </p>
        )}
      </div>
    );
  }

  // ── Board view ──
  const activeMissions = active.missions.filter((m) => !m.done);
  const doneMissions = active.missions.filter((m) => m.done);
  const memberMap = new Map(active.members.map((m) => [m.id, m]));

  return (
    <div className="mx-auto max-w-md space-y-5 px-4 py-6">
      {/* Header: pulse dots + circle name + back */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setView('list')}
          className="cursor-pointer text-[12px] transition-all"
          style={{ color: '#8A6A4A', opacity: 0.5, background: 'none', border: 'none' }}
        >
          ‹ back
        </button>
        <div className="flex flex-1 items-center justify-center gap-2">
          {active.members.map((m) => (
            <span
              key={m.id}
              className="block rounded-full transition-all"
              style={{
                width: 10,
                height: 10,
                background: m.pulseColor || m.color,
                opacity: m.pulse ? 0.85 : 0.3,
              }}
              title={`${m.name}${m.pulse ? ` · ${m.pulse}` : ''}`}
            />
          ))}
        </div>
        <span style={{ fontFamily: font, fontSize: '14px', fontWeight: 700, color: active.color }}>
          {active.name}
        </span>
      </div>

      {/* Join code */}
      <div className="flex items-center justify-center gap-2">
        <span style={{ fontFamily: font, fontSize: '11px', color: '#8A6A4A', opacity: 0.4 }}>
          code:
        </span>
        <span
          style={{
            fontFamily: font,
            fontSize: '13px',
            fontWeight: 700,
            color: active.color,
            letterSpacing: '0.2em',
            opacity: 0.6,
          }}
        >
          {active.code}
        </span>
      </div>

      {/* Members */}
      <div className="flex justify-center gap-3">
        {active.members.map((m) => (
          <div key={m.id} className="flex flex-col items-center gap-1">
            <span
              className="block rounded-full"
              style={{
                width: 20,
                height: 20,
                background: m.pulseColor || m.color,
                opacity: m.pulse ? 0.8 : 0.3,
              }}
            />
            <span
              style={{
                fontFamily: font,
                fontSize: '10px',
                color: '#5C3018',
                fontWeight: m.id === me.id ? 700 : 500,
                opacity: 0.7,
              }}
            >
              {m.name}
            </span>
            {m.pulse && (
              <span
                style={{ fontFamily: font, fontSize: '9px', color: m.pulseColor, opacity: 0.6 }}
              >
                {m.pulse}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Missions */}
      <div
        className="space-y-2 rounded-2xl border px-4 py-3"
        style={{ borderColor: `${active.color}20`, background: `${active.color}04` }}
      >
        <p
          className="uppercase tracking-[0.2em] text-center"
          style={{
            fontFamily: font,
            fontSize: '10px',
            fontWeight: 700,
            color: active.color,
            opacity: 0.5,
          }}
        >
          missions
        </p>

        {/* Active missions */}
        {activeMissions.map((m) => {
          const claimer = m.claimedBy ? memberMap.get(m.claimedBy) : null;
          return (
            <div key={m.id} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => toggleMission(m.id)}
                className="flex shrink-0 cursor-pointer items-center justify-center rounded-sm transition-all"
                style={{
                  width: 18,
                  height: 18,
                  border: `1.5px solid ${active.color}40`,
                  background: 'transparent',
                }}
              />
              <span
                className="flex-1 cursor-pointer"
                onClick={() => claimMission(m.id)}
                style={{ fontFamily: font, fontSize: '14px', color: '#5C3018' }}
                title="tap to claim"
              >
                {m.text}
              </span>
              {claimer && (
                <span
                  className="block rounded-full"
                  style={{
                    width: 8,
                    height: 8,
                    background: claimer.pulseColor || claimer.color,
                    opacity: 0.7,
                  }}
                  title={claimer.name}
                />
              )}
              <button
                type="button"
                onClick={() => removeMission(m.id)}
                className="cursor-pointer text-[10px] transition-all"
                style={{ color: '#8A6A4A', opacity: 0.2, background: 'none', border: 'none' }}
              >
                ×
              </button>
            </div>
          );
        })}

        {/* Add mission */}
        <div className="flex gap-2 pt-1">
          <input
            type="text"
            value={missionInput}
            onChange={(e) => setMissionInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') addMission();
            }}
            placeholder="+ add mission..."
            className="flex-1 border-b bg-transparent pb-1 outline-none placeholder:italic placeholder:text-[#8A6A4A] placeholder:opacity-40"
            style={{
              fontFamily: font,
              fontSize: '13px',
              color: '#5C3018',
              borderColor: `${active.color}20`,
            }}
          />
        </div>

        {/* Done missions */}
        {doneMissions.length > 0 && (
          <div className="space-y-1 pt-2">
            <p style={{ fontFamily: font, fontSize: '10px', color: '#8A6A4A', opacity: 0.3 }}>
              done
            </p>
            {doneMissions.slice(0, 5).map((m) => (
              <div key={m.id} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleMission(m.id)}
                  className="flex shrink-0 cursor-pointer items-center justify-center rounded-sm transition-all"
                  style={{
                    width: 18,
                    height: 18,
                    border: `1.5px solid ${active.color}20`,
                    background: `${active.color}15`,
                  }}
                >
                  <span style={{ fontSize: '10px', color: active.color, opacity: 0.6 }}>✓</span>
                </button>
                <span
                  style={{
                    fontFamily: font,
                    fontSize: '13px',
                    color: '#8A6A4A',
                    opacity: 0.4,
                    textDecoration: 'line-through',
                  }}
                >
                  {m.text}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Log */}
      <div
        className="space-y-2 rounded-2xl border px-4 py-3"
        style={{ borderColor: '#C4A06015', background: '#C4A06004' }}
      >
        <p
          className="uppercase tracking-[0.2em] text-center"
          style={{
            fontFamily: font,
            fontSize: '10px',
            fontWeight: 700,
            color: '#C4A060',
            opacity: 0.5,
          }}
        >
          log
        </p>

        {/* Add note */}
        <div className="flex gap-2">
          <input
            type="text"
            value={noteInput}
            onChange={(e) => setNoteInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') addNote();
            }}
            placeholder="share a note..."
            className="flex-1 border-b bg-transparent pb-1 outline-none placeholder:italic placeholder:text-[#8A6A4A] placeholder:opacity-40"
            style={{
              fontFamily: font,
              fontSize: '13px',
              color: '#5C3018',
              borderColor: '#C4A06018',
            }}
          />
        </div>

        {/* Notes */}
        {active.notes.slice(0, 20).map((n) => (
          <div key={n.id} className="flex items-start gap-2">
            <span
              style={{
                fontFamily: font,
                fontSize: '10px',
                color: '#8A6A4A',
                opacity: 0.4,
                flexShrink: 0,
                marginTop: 2,
              }}
            >
              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span
              style={{
                fontFamily: font,
                fontSize: '11px',
                color: '#5C3018',
                fontWeight: 600,
                opacity: 0.6,
                flexShrink: 0,
              }}
            >
              {n.authorName}
            </span>
            <span style={{ fontFamily: font, fontSize: '13px', color: '#5C3018', opacity: 0.8 }}>
              {n.text}
            </span>
          </div>
        ))}

        {active.notes.length === 0 && (
          <p
            className="text-center italic"
            style={{ fontFamily: font, fontSize: '12px', color: '#8A6A4A', opacity: 0.3 }}
          >
            no notes yet
          </p>
        )}
      </div>
    </div>
  );
}

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

interface ChapterMeaning {
  memberId: string;
  memberName: string;
  text: string;
}

interface Circle {
  id: string;
  name: string;
  code: string;
  color: string;
  members: Member[];
  missions: Mission[];
  notes: Note[];
  chapter?: string;
  chapterMeanings?: ChapterMeaning[];
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
  const [howOpen, setHowOpen] = useState(false);

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

  function _claimMission(missionId: string) {
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

        {/* "How Circles works" — auto-open when empty, collapsible otherwise */}
        <div className="rounded-2xl border border-border bg-muted/30 px-4 py-3">
          <button
            type="button"
            onClick={() => setHowOpen((o) => !o)}
            className="flex w-full cursor-pointer items-center justify-between"
            style={{ background: 'none', border: 'none', padding: 0 }}
            aria-expanded={circles.length === 0 || howOpen}
          >
            <span
              className="uppercase"
              style={{
                fontFamily: font,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.12em',
                color: '#5C3018',
              }}
            >
              How Circles works
            </span>
            <span
              style={{
                transform: circles.length === 0 || howOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s',
                color: '#8A6A4A',
              }}
            >
              ▾
            </span>
          </button>
          {(circles.length === 0 || howOpen) && (
            <div
              className="mt-3 space-y-3 animate-in fade-in duration-150"
              style={{ fontFamily: font, fontSize: 13, lineHeight: 1.55, color: '#5C3018' }}
            >
              <p>
                A <strong>Circle</strong> is a shared space with a few people you trust — friends,
                teammates, a band, a study group. Like a quiet co-working room you can drop into any
                time.
              </p>
              <div>
                <p
                  className="uppercase mb-1"
                  style={{
                    fontSize: 11,
                    letterSpacing: '0.12em',
                    color: '#8A6A4A',
                    fontWeight: 700,
                  }}
                >
                  What you can do now
                </p>
                <ul className="space-y-1 pl-3" style={{ listStyle: 'none' }}>
                  <li>
                    <span style={{ color: '#7AAA58' }}>•</span> <strong>Create</strong> a circle —
                    give it a name (Rock Band, Family, Dojo) and invite friends with a 6-character
                    code.
                  </li>
                  <li>
                    <span style={{ color: '#6890B0' }}>•</span> <strong>Join</strong> with a code
                    someone sent you.
                  </li>
                  <li>
                    <span style={{ color: '#C4A060' }}>•</span> <strong>Share missions</strong> —
                    write the thing you need to get done. Anyone in the circle can mark it complete.
                  </li>
                  <li>
                    <span style={{ color: '#B33A2B' }}>•</span> <strong>Leave notes</strong> — a
                    running log of what's happening in the circle, visible to everyone inside.
                  </li>
                  <li>
                    <span style={{ color: '#9B6BA0' }}>•</span>{' '}
                    <strong>See each other's pulse</strong> — tiny colored dots show whether each
                    member recently checked in and how they felt.
                  </li>
                </ul>
              </div>
              <div>
                <p
                  className="uppercase mb-1"
                  style={{
                    fontSize: 11,
                    letterSpacing: '0.12em',
                    color: '#8A6A4A',
                    fontWeight: 700,
                  }}
                >
                  Coming soon
                </p>
                <ul className="space-y-1 pl-3" style={{ listStyle: 'none' }}>
                  <li>
                    <span style={{ opacity: 0.5 }}>◇</span> Cross-device sync (right now your
                    circles live only on this device)
                  </li>
                  <li>
                    <span style={{ opacity: 0.5 }}>◇</span> Shared focus sessions — 25-minute timer
                    both of you see, with a shared calming sound
                  </li>
                  <li>
                    <span style={{ opacity: 0.5 }}>◇</span> Weekly retrospective — a gentle summary
                    of the circle's week
                  </li>
                  <li>
                    <span style={{ opacity: 0.5 }}>◇</span> Vacation mode — a one-tap "I'm taking a
                    break" signal
                  </li>
                </ul>
              </div>
              <p style={{ fontSize: 12, opacity: 0.65, fontStyle: 'italic' }}>
                This is <strong>not</strong> a chat, a feed, or a social network. It's a quiet room
                where chosen people are present while you do your work.
              </p>
            </div>
          )}
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

  // Group missions by owner
  const unclaimed = activeMissions.filter((m) => !m.claimedBy);
  const missionsByMember = new Map<string, Mission[]>();
  for (const m of activeMissions) {
    if (m.claimedBy) {
      const list = missionsByMember.get(m.claimedBy) || [];
      list.push(m);
      missionsByMember.set(m.claimedBy, list);
    }
  }

  // Chapter state
  const [editingChapter, setEditingChapter] = useState(false);
  const [chapterInput, setChapterInput] = useState(active.chapter || '');
  const [chapterOpen, setChapterOpen] = useState(false);
  const [meaningInput, setMeaningInput] = useState('');
  const [assigningMission, setAssigningMission] = useState<string | null>(null);

  function setChapter(text: string) {
    const updated = circles.map((c) => (c.id === activeId ? { ...c, chapter: text } : c));
    persist(updated);
    setEditingChapter(false);
  }

  function addMeaning() {
    const text = meaningInput.trim();
    if (!text || !active) return;
    const meaning: ChapterMeaning = { memberId: me.id, memberName: me.name, text };
    const existing = active.chapterMeanings || [];
    // Replace if same member already wrote one
    const updated = circles.map((c) =>
      c.id === activeId
        ? {
            ...c,
            chapterMeanings: [...existing.filter((m) => m.memberId !== me.id), meaning],
          }
        : c,
    );
    persist(updated);
    setMeaningInput('');
  }

  function assignMissionTo(missionId: string, memberId: string) {
    const updated = circles.map((c) =>
      c.id === activeId
        ? {
            ...c,
            missions: c.missions.map((m) =>
              m.id === missionId ? { ...m, claimedBy: memberId } : m,
            ),
          }
        : c,
    );
    persist(updated);
    setAssigningMission(null);
  }

  return (
    <div className="mx-auto max-w-md space-y-5 px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setView('list')}
          className="cursor-pointer text-[12px] transition-all"
          style={{ color: '#8A6A4A', opacity: 0.5, background: 'none', border: 'none' }}
        >
          ‹ back
        </button>
        <div className="flex-1 text-center">
          <span
            style={{ fontFamily: font, fontSize: '16px', fontWeight: 700, color: active.color }}
          >
            {active.name}
          </span>
        </div>
        <span
          style={{
            fontFamily: font,
            fontSize: '11px',
            color: active.color,
            opacity: 0.4,
            letterSpacing: '0.15em',
          }}
        >
          {active.code}
        </span>
      </div>

      {/* Chapter */}
      <div
        className="rounded-2xl border px-4 py-3"
        style={{ borderColor: `${active.color}15`, background: `${active.color}04` }}
      >
        {editingChapter ? (
          <input
            type="text"
            value={chapterInput}
            onChange={(e) => setChapterInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') setChapter(chapterInput);
            }}
            onBlur={() => setChapter(chapterInput)}
            placeholder="name this chapter..."
            autoFocus
            className="w-full bg-transparent text-center outline-none placeholder:italic placeholder:text-[#8A6A4A] placeholder:opacity-50"
            style={{
              fontFamily: font,
              fontSize: '16px',
              fontWeight: 700,
              fontStyle: 'italic',
              color: active.color,
            }}
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              setChapterInput(active.chapter || '');
              setEditingChapter(true);
            }}
            className="w-full cursor-pointer text-center transition-all"
            style={{ background: 'none', border: 'none' }}
          >
            <p
              style={{
                fontFamily: font,
                fontSize: '16px',
                fontWeight: 700,
                fontStyle: 'italic',
                color: active.color,
              }}
            >
              {active.chapter || 'name this chapter...'}
            </p>
          </button>
        )}

        {/* Tap to see meanings */}
        {active.chapter && (
          <button
            type="button"
            onClick={() => setChapterOpen((s) => !s)}
            className="mt-1 w-full cursor-pointer text-center"
            style={{ background: 'none', border: 'none' }}
          >
            <span
              className="italic"
              style={{ fontFamily: font, fontSize: '11px', color: '#8A6A4A', opacity: 0.45 }}
            >
              {chapterOpen
                ? 'close'
                : `what it means to us · ${(active.chapterMeanings || []).length}`}
            </span>
          </button>
        )}

        {chapterOpen && (
          <div className="mt-3 space-y-2 animate-in fade-in duration-150">
            {(active.chapterMeanings || []).map((m) => (
              <div key={m.memberId} className="flex items-start gap-2">
                <span
                  className="block shrink-0 rounded-full mt-1"
                  style={{
                    width: 6,
                    height: 6,
                    background: memberMap.get(m.memberId)?.color || '#C4A060',
                  }}
                />
                <div>
                  <span
                    style={{
                      fontFamily: font,
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#5C3018',
                      opacity: 0.6,
                    }}
                  >
                    {m.memberName}
                  </span>
                  <p style={{ fontFamily: font, fontSize: '13px', color: '#5C3018', opacity: 0.8 }}>
                    {m.text}
                  </p>
                </div>
              </div>
            ))}
            <input
              type="text"
              value={meaningInput}
              onChange={(e) => setMeaningInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') addMeaning();
              }}
              placeholder="what does this chapter mean to you?"
              className="w-full border-b bg-transparent pb-1 outline-none placeholder:italic placeholder:text-[#8A6A4A] placeholder:opacity-40"
              style={{
                fontFamily: font,
                fontSize: '13px',
                color: '#5C3018',
                borderColor: `${active.color}20`,
              }}
            />
          </div>
        )}
      </div>

      {/* Member cards */}
      <div className="flex justify-center gap-2">
        {active.members.map((m) => {
          const mCount = activeMissions.filter((mi) => mi.claimedBy === m.id).length;
          return (
            <div
              key={m.id}
              className="flex flex-col items-center gap-1 rounded-xl px-3 py-2 transition-all"
              style={{
                background: `${m.pulseColor || m.color}08`,
                border: `1px solid ${m.pulseColor || m.color}15`,
              }}
            >
              <span
                className="block rounded-full"
                style={{
                  width: 16,
                  height: 16,
                  background: m.pulseColor || m.color,
                  opacity: m.pulse ? 0.85 : 0.3,
                }}
              />
              <span
                style={{
                  fontFamily: font,
                  fontSize: '11px',
                  color: '#5C3018',
                  fontWeight: m.id === me.id ? 700 : 500,
                }}
              >
                {m.name}
              </span>
              {m.pulse && (
                <span
                  style={{ fontFamily: font, fontSize: '9px', color: m.pulseColor, opacity: 0.7 }}
                >
                  {m.pulse}
                </span>
              )}
              <span style={{ fontFamily: font, fontSize: '9px', color: '#8A6A4A', opacity: 0.4 }}>
                {mCount} {mCount === 1 ? 'mission' : 'missions'}
              </span>
            </div>
          );
        })}
      </div>

      {/* Missions — grouped by person */}
      <div
        className="space-y-3 rounded-2xl border px-4 py-3"
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

        {/* Unclaimed */}
        {unclaimed.length > 0 && (
          <div className="space-y-1">
            <p style={{ fontFamily: font, fontSize: '10px', color: '#8A6A4A', opacity: 0.4 }}>
              up for grabs
            </p>
            {unclaimed.map((m) => (
              <div key={m.id} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleMission(m.id)}
                  className="flex shrink-0 cursor-pointer items-center justify-center rounded-sm"
                  style={{
                    width: 18,
                    height: 18,
                    border: `1.5px solid ${active.color}40`,
                    background: 'transparent',
                  }}
                />
                <span
                  className="flex-1"
                  style={{ fontFamily: font, fontSize: '14px', color: '#5C3018' }}
                >
                  {m.text}
                </span>
                {assigningMission === m.id ? (
                  <div className="flex gap-1">
                    {active.members.map((member) => (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => assignMissionTo(m.id, member.id)}
                        className="cursor-pointer rounded-full transition-all hover:scale-125"
                        style={{
                          width: 14,
                          height: 14,
                          background: member.pulseColor || member.color,
                          opacity: 0.7,
                          border: 'none',
                        }}
                        title={member.name}
                      />
                    ))}
                    <button
                      type="button"
                      onClick={() => setAssigningMission(null)}
                      className="cursor-pointer text-[9px]"
                      style={{ color: '#8A6A4A', opacity: 0.3, background: 'none', border: 'none' }}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setAssigningMission(m.id)}
                    className="cursor-pointer rounded-full px-1.5 py-0.5 text-[9px] transition-all"
                    style={{
                      color: '#8A6A4A',
                      opacity: 0.3,
                      background: '#C4A06008',
                      border: '1px solid #C4A06012',
                    }}
                  >
                    assign
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeMission(m.id)}
                  className="cursor-pointer text-[10px]"
                  style={{ color: '#8A6A4A', opacity: 0.15, background: 'none', border: 'none' }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Per-member lanes */}
        {active.members.map((member) => {
          const memberMissions = missionsByMember.get(member.id) || [];
          if (memberMissions.length === 0) return null;
          return (
            <div key={member.id} className="space-y-1">
              <div className="flex items-center gap-1.5">
                <span
                  className="block rounded-full"
                  style={{ width: 6, height: 6, background: member.pulseColor || member.color }}
                />
                <span
                  style={{
                    fontFamily: font,
                    fontSize: '10px',
                    fontWeight: 600,
                    color: member.pulseColor || member.color,
                    opacity: 0.7,
                  }}
                >
                  {member.name}
                </span>
              </div>
              {memberMissions.map((m) => (
                <div key={m.id} className="flex items-center gap-2 pl-3">
                  <button
                    type="button"
                    onClick={() => toggleMission(m.id)}
                    className="flex shrink-0 cursor-pointer items-center justify-center rounded-sm"
                    style={{
                      width: 16,
                      height: 16,
                      border: `1.5px solid ${member.pulseColor || member.color}40`,
                      background: 'transparent',
                    }}
                  />
                  <span
                    className="flex-1"
                    style={{ fontFamily: font, fontSize: '13px', color: '#5C3018' }}
                  >
                    {m.text}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeMission(m.id)}
                    className="cursor-pointer text-[10px]"
                    style={{ color: '#8A6A4A', opacity: 0.15, background: 'none', border: 'none' }}
                  >
                    ×
                  </button>
                </div>
              ))}
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

        {/* Done */}
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
                  className="flex shrink-0 cursor-pointer items-center justify-center rounded-sm"
                  style={{
                    width: 16,
                    height: 16,
                    border: `1.5px solid ${active.color}20`,
                    background: `${active.color}15`,
                  }}
                >
                  <span style={{ fontSize: '9px', color: active.color, opacity: 0.6 }}>✓</span>
                </button>
                <span
                  style={{
                    fontFamily: font,
                    fontSize: '12px',
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

'use client';

import { useCallback, useEffect, useState } from 'react';

/* ═══════════════════════════════════════════════════════════
   CIRCLE BOARD — shared mission board for a group of people.
   Create circles, join with a code, shared missions + log.
   Phase 2: API-backed (multi-device, real collaboration).
   ═══════════════════════════════════════════════════════════ */

const LS_ME = 'colourmap:circle-me';

interface CircleMember {
  id: string;
  circleId: string;
  userId: string;
  name: string;
  color: string;
  pulse?: string | null;
  pulseColor?: string | null;
  sharePulse: boolean;
  joinedAt: string;
}

interface CircleMission {
  id: string;
  circleId: string;
  text: string;
  claimedBy?: string | null;
  done: boolean;
  dueDate?: string | null;
  createdBy: string;
  createdAt: string;
}

interface CircleNote {
  id: string;
  circleId: string;
  authorId: string;
  authorName: string;
  text: string;
  sessionId?: string | null;
  createdAt: string;
}

interface CircleSession {
  id: string;
  circleId: string;
  startedBy: string;
  startedAt: string;
  endedAt?: string | null;
  summary?: string | null;
}

interface Circle {
  id: string;
  name: string;
  code: string;
  color: string;
  createdBy: string;
  createdAt: string;
  members: CircleMember[];
}

interface CircleDetail extends Circle {
  missions: CircleMission[];
  notes: CircleNote[];
  activeSession: CircleSession | null;
}

const CIRCLE_COLORS = ['#D4805A', '#6890B0', '#7AAA58', '#9B6BA0', '#C4A060', '#5A8AAA'];

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
  } catch {
    /* noop */
  }
}

type View = 'list' | 'board' | 'week';

function getWeekDays(): { label: string; date: string }[] {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((day + 6) % 7));
  const days: { label: string; date: string }[] = [];
  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push({
      label: labels[i],
      date: d.toISOString().split('T')[0],
    });
  }
  return days;
}

export default function CircleBoard() {
  const [circles, setCircles] = useState<Circle[]>([]);
  const [activeDetail, setActiveDetail] = useState<CircleDetail | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [me, setMe] = useState<{ id: string; name: string }>({ id: '', name: '' });
  const [view, setView] = useState<View>('list');
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [newName, setNewName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [missionInput, setMissionInput] = useState('');
  const [missionDueDate, setMissionDueDate] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [editingMe, setEditingMe] = useState(false);
  const [meNameInput, setMeNameInput] = useState('');
  const [loading, setLoading] = useState(true);

  // Load saved name
  useEffect(() => {
    const savedMe = ls<{ id: string; name: string }>(LS_ME, { id: '', name: '' });
    setMe(savedMe);
    if (!savedMe.name) setEditingMe(true);
  }, []);

  // Fetch circles on mount
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/circles');
        if (res.ok) {
          const data = await res.json();
          setCircles(data);
        }
      } catch {
        /* offline fallback: circles stays empty */
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const fetchCircleDetail = useCallback(async (circleId: string) => {
    try {
      const res = await fetch(`/api/circles/${circleId}`);
      if (res.ok) {
        const data: CircleDetail = await res.json();
        setActiveDetail(data);
        return data;
      }
    } catch {
      /* noop */
    }
    return null;
  }, []);

  function selectCircle(id: string) {
    setActiveId(id);
    setView('board');
    fetchCircleDetail(id);
  }

  function saveMe(name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;
    const updated = { ...me, name: trimmed };
    setMe(updated);
    ss(LS_ME, updated);
    setEditingMe(false);
  }

  async function createCircle() {
    const name = newName.trim();
    if (!name || !me.name) return;

    // Optimistic: add placeholder
    const tempId = crypto.randomUUID();
    const tempCircle: Circle = {
      id: tempId,
      name,
      code: '------',
      color: CIRCLE_COLORS[circles.length % CIRCLE_COLORS.length],
      createdBy: '',
      createdAt: new Date().toISOString(),
      members: [],
    };
    setCircles((prev) => [...prev, tempCircle]);
    setNewName('');
    setCreating(false);

    try {
      const res = await fetch('/api/circles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, userName: me.name }),
      });
      if (res.ok) {
        const { circle, member } = await res.json();
        const full: Circle = { ...circle, members: [member] };
        setCircles((prev) => prev.map((c) => (c.id === tempId ? full : c)));
        selectCircle(circle.id);
      } else {
        // Revert
        setCircles((prev) => prev.filter((c) => c.id !== tempId));
      }
    } catch {
      setCircles((prev) => prev.filter((c) => c.id !== tempId));
    }
  }

  async function joinCircleAction() {
    const code = joinCode.trim().toUpperCase();
    if (!code || !me.name) return;

    try {
      const res = await fetch('/api/circles/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, userName: me.name }),
      });
      if (res.ok) {
        const { circle, member } = await res.json();
        // Refresh circles list
        const listRes = await fetch('/api/circles');
        if (listRes.ok) {
          setCircles(await listRes.json());
        } else {
          setCircles((prev) => {
            const exists = prev.some((c) => c.id === circle.id);
            if (exists) return prev;
            return [...prev, { ...circle, members: [member] }];
          });
        }
        selectCircle(circle.id);
        setJoining(false);
        setJoinCode('');
      }
    } catch {
      /* noop */
    }
  }

  async function addMission() {
    const text = missionInput.trim();
    if (!text || !activeId || !activeDetail) return;

    // Optimistic
    const tempId = crypto.randomUUID();
    const tempMission: CircleMission = {
      id: tempId,
      circleId: activeId,
      text,
      done: false,
      claimedBy: null,
      dueDate: missionDueDate || null,
      createdBy: '',
      createdAt: new Date().toISOString(),
    };
    setActiveDetail((prev) =>
      prev ? { ...prev, missions: [tempMission, ...prev.missions] } : prev,
    );
    setMissionInput('');
    setMissionDueDate('');

    try {
      const res = await fetch(`/api/circles/${activeId}/missions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, dueDate: missionDueDate || undefined }),
      });
      if (res.ok) {
        const mission: CircleMission = await res.json();
        setActiveDetail((prev) =>
          prev
            ? { ...prev, missions: prev.missions.map((m) => (m.id === tempId ? mission : m)) }
            : prev,
        );
      } else {
        setActiveDetail((prev) =>
          prev ? { ...prev, missions: prev.missions.filter((m) => m.id !== tempId) } : prev,
        );
      }
    } catch {
      setActiveDetail((prev) =>
        prev ? { ...prev, missions: prev.missions.filter((m) => m.id !== tempId) } : prev,
      );
    }
  }

  async function toggleMission(missionId: string) {
    if (!activeId || !activeDetail) return;
    const mission = activeDetail.missions.find((m) => m.id === missionId);
    if (!mission) return;

    // Optimistic
    setActiveDetail((prev) =>
      prev
        ? {
            ...prev,
            missions: prev.missions.map((m) => (m.id === missionId ? { ...m, done: !m.done } : m)),
          }
        : prev,
    );

    try {
      await fetch(`/api/circles/${activeId}/missions/${missionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ done: !mission.done }),
      });
    } catch {
      // Revert
      setActiveDetail((prev) =>
        prev
          ? {
              ...prev,
              missions: prev.missions.map((m) =>
                m.id === missionId ? { ...m, done: mission.done } : m,
              ),
            }
          : prev,
      );
    }
  }

  async function claimMission(missionId: string) {
    if (!activeId || !activeDetail) return;
    const mission = activeDetail.missions.find((m) => m.id === missionId);
    if (!mission) return;

    const member = activeDetail.members.find((m) => m.userId === me.id);
    const newClaimedBy =
      mission.claimedBy === (member?.userId ?? me.id) ? null : (member?.userId ?? me.id);

    // Optimistic
    setActiveDetail((prev) =>
      prev
        ? {
            ...prev,
            missions: prev.missions.map((m) =>
              m.id === missionId ? { ...m, claimedBy: newClaimedBy } : m,
            ),
          }
        : prev,
    );

    try {
      await fetch(`/api/circles/${activeId}/missions/${missionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claimedBy: newClaimedBy }),
      });
    } catch {
      // Revert
      setActiveDetail((prev) =>
        prev
          ? {
              ...prev,
              missions: prev.missions.map((m) =>
                m.id === missionId ? { ...m, claimedBy: mission.claimedBy } : m,
              ),
            }
          : prev,
      );
    }
  }

  async function removeMissionAction(missionId: string) {
    if (!activeId || !activeDetail) return;

    const removed = activeDetail.missions.find((m) => m.id === missionId);
    // Optimistic
    setActiveDetail((prev) =>
      prev ? { ...prev, missions: prev.missions.filter((m) => m.id !== missionId) } : prev,
    );

    try {
      await fetch(`/api/circles/${activeId}/missions/${missionId}`, { method: 'DELETE' });
    } catch {
      // Revert
      if (removed) {
        setActiveDetail((prev) =>
          prev ? { ...prev, missions: [...prev.missions, removed] } : prev,
        );
      }
    }
  }

  async function addNote() {
    const text = noteInput.trim();
    if (!text || !activeId || !activeDetail) return;

    const tempId = crypto.randomUUID();
    const tempNote: CircleNote = {
      id: tempId,
      circleId: activeId,
      authorId: me.id,
      authorName: me.name,
      text,
      sessionId: activeDetail.activeSession?.id ?? null,
      createdAt: new Date().toISOString(),
    };
    setActiveDetail((prev) => (prev ? { ...prev, notes: [tempNote, ...prev.notes] } : prev));
    setNoteInput('');

    try {
      const res = await fetch(`/api/circles/${activeId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          authorName: me.name,
          sessionId: activeDetail.activeSession?.id,
        }),
      });
      if (res.ok) {
        const note: CircleNote = await res.json();
        setActiveDetail((prev) =>
          prev ? { ...prev, notes: prev.notes.map((n) => (n.id === tempId ? note : n)) } : prev,
        );
      }
    } catch {
      /* keep optimistic note */
    }
  }

  // Sync pulse from localStorage check-in data
  useEffect(() => {
    if (!activeId) return;
    try {
      const hawkinsIdx = Number(localStorage.getItem('colourmap:process-idx') || '4');
      const pulse = HAWKINS_LABELS[hawkinsIdx] || 'Neutral';
      const pulseColor = HAWKINS_COLORS[hawkinsIdx] || '#C4A060';

      fetch(`/api/circles/${activeId}/pulse`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pulse, pulseColor }),
      }).catch(() => {
        /* noop */
      });
    } catch {
      /* noop */
    }
  }, [activeId]);

  async function handleStartSession() {
    if (!activeId || !activeDetail) return;

    try {
      const res = await fetch(`/api/circles/${activeId}/sessions`, { method: 'POST' });
      if (res.ok) {
        const session: CircleSession = await res.json();
        setActiveDetail((prev) => (prev ? { ...prev, activeSession: session } : prev));
      }
    } catch {
      /* noop */
    }
  }

  async function handleEndSession() {
    if (!activeId || !activeDetail?.activeSession) return;

    try {
      const res = await fetch(`/api/circles/${activeId}/sessions`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: activeDetail.activeSession.id }),
      });
      if (res.ok) {
        setActiveDetail((prev) => (prev ? { ...prev, activeSession: null } : prev));
      }
    } catch {
      /* noop */
    }
  }

  const font = 'var(--font-serif)';

  // ── Loading ──
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <p
          className="italic"
          style={{ fontFamily: font, fontSize: '14px', color: '#8A6A4A', opacity: 0.5 }}
        >
          loading circles...
        </p>
      </div>
    );
  }

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
  if (view === 'list' || !activeDetail) {
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
                    {c.members.length} {c.members.length === 1 ? 'member' : 'members'}
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
                        opacity: m.pulse && m.sharePulse ? 0.8 : 0.3,
                      }}
                      title={`${m.name}${m.pulse && m.sharePulse ? ` · ${m.pulse}` : ''}`}
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
                if (e.key === 'Enter') joinCircleAction();
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
                onClick={joinCircleAction}
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

  // ── Week view (collective agenda) ──
  if (view === 'week') {
    const weekDays = getWeekDays();
    const missionsWithDue = activeDetail.missions.filter((m) => m.dueDate && !m.done);
    const memberMap = new Map(activeDetail.members.map((m) => [m.userId, m]));

    return (
      <div className="mx-auto max-w-lg space-y-4 px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setView('board')}
            className="cursor-pointer text-[12px] transition-all"
            style={{ color: '#8A6A4A', opacity: 0.5, background: 'none', border: 'none' }}
          >
            &#8249; board
          </button>
          <div className="flex-1 text-center">
            <span style={{ fontFamily: font, fontSize: '14px', fontWeight: 700, color: '#5C3018' }}>
              week agenda
            </span>
          </div>
          <span
            style={{
              fontFamily: font,
              fontSize: '14px',
              fontWeight: 700,
              color: activeDetail.color,
            }}
          >
            {activeDetail.name}
          </span>
        </div>

        {/* 7-day grid */}
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((day) => {
            const dayMissions = missionsWithDue.filter((m) => m.dueDate === day.date);
            const isToday = day.date === new Date().toISOString().split('T')[0];
            return (
              <div
                key={day.date}
                className="rounded-xl px-1 py-2"
                style={{
                  background: isToday ? `${activeDetail.color}10` : 'transparent',
                  border: isToday ? `1px solid ${activeDetail.color}25` : '1px solid transparent',
                  minHeight: 80,
                }}
              >
                <p
                  className="text-center"
                  style={{
                    fontFamily: font,
                    fontSize: '10px',
                    fontWeight: isToday ? 700 : 500,
                    color: isToday ? activeDetail.color : '#8A6A4A',
                    opacity: isToday ? 1 : 0.5,
                  }}
                >
                  {day.label}
                </p>
                <p
                  className="text-center"
                  style={{
                    fontFamily: font,
                    fontSize: '9px',
                    color: '#8A6A4A',
                    opacity: 0.3,
                  }}
                >
                  {day.date.slice(5)}
                </p>
                <div className="mt-1 space-y-0.5">
                  {dayMissions.map((m) => {
                    const claimer = m.claimedBy ? memberMap.get(m.claimedBy) : null;
                    return (
                      <div
                        key={m.id}
                        className="rounded px-1 py-0.5"
                        style={{
                          background: claimer
                            ? `${claimer.pulseColor || claimer.color}20`
                            : `${activeDetail.color}10`,
                        }}
                      >
                        <p
                          style={{
                            fontFamily: font,
                            fontSize: '8px',
                            color: '#5C3018',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {m.text}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {missionsWithDue.length === 0 && (
          <p
            className="text-center italic"
            style={{ fontFamily: font, fontSize: '12px', color: '#8A6A4A', opacity: 0.4 }}
          >
            no missions with due dates this week
          </p>
        )}
      </div>
    );
  }

  // ── Board view ──
  const activeMissions = activeDetail.missions.filter((m) => !m.done);
  const doneMissions = activeDetail.missions.filter((m) => m.done);
  const memberMap = new Map(activeDetail.members.map((m) => [m.userId, m]));

  return (
    <div className="mx-auto max-w-md space-y-5 px-4 py-6">
      {/* Header: pulse dots + circle name + back */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => {
            setView('list');
            setActiveId(null);
            setActiveDetail(null);
          }}
          className="cursor-pointer text-[12px] transition-all"
          style={{ color: '#8A6A4A', opacity: 0.5, background: 'none', border: 'none' }}
        >
          &#8249; back
        </button>
        <div className="flex flex-1 items-center justify-center gap-2">
          {activeDetail.members.map((m) => (
            <span
              key={m.id}
              className="block rounded-full transition-all"
              style={{
                width: 10,
                height: 10,
                background: m.pulseColor || m.color,
                opacity: m.pulse && m.sharePulse ? 0.85 : 0.3,
              }}
              title={`${m.name}${m.pulse && m.sharePulse ? ` · ${m.pulse}` : ''}`}
            />
          ))}
        </div>
        <span
          style={{
            fontFamily: font,
            fontSize: '14px',
            fontWeight: 700,
            color: activeDetail.color,
          }}
        >
          {activeDetail.name}
        </span>
      </div>

      {/* Join code + week view link */}
      <div className="flex items-center justify-center gap-4">
        <div className="flex items-center gap-2">
          <span style={{ fontFamily: font, fontSize: '11px', color: '#8A6A4A', opacity: 0.4 }}>
            code:
          </span>
          <span
            style={{
              fontFamily: font,
              fontSize: '13px',
              fontWeight: 700,
              color: activeDetail.color,
              letterSpacing: '0.2em',
              opacity: 0.6,
            }}
          >
            {activeDetail.code}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setView('week')}
          className="cursor-pointer text-[11px] transition-all"
          style={{
            fontFamily: font,
            color: '#8A6A4A',
            opacity: 0.4,
            background: 'none',
            border: 'none',
          }}
        >
          week view
        </button>
      </div>

      {/* Active session indicator */}
      {activeDetail.activeSession ? (
        <div
          className="flex items-center justify-center gap-3 rounded-2xl px-4 py-2"
          style={{ background: '#7AAA5808', border: '1px solid #7AAA5820' }}
        >
          <span
            className="block animate-pulse rounded-full"
            style={{ width: 8, height: 8, background: '#7AAA58' }}
          />
          <span style={{ fontFamily: font, fontSize: '12px', color: '#7AAA58', fontWeight: 600 }}>
            session active
          </span>
          <span style={{ fontFamily: font, fontSize: '10px', color: '#8A6A4A', opacity: 0.4 }}>
            since{' '}
            {new Date(activeDetail.activeSession.startedAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
          <button
            type="button"
            onClick={handleEndSession}
            className="cursor-pointer rounded-full px-3 py-1 text-[10px] font-semibold transition-all"
            style={{ color: '#D4805A', background: '#D4805A10', border: '1px solid #D4805A25' }}
          >
            end
          </button>
        </div>
      ) : (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleStartSession}
            className="cursor-pointer rounded-full px-4 py-1.5 text-[11px] font-semibold transition-all"
            style={{ color: '#7AAA58', background: '#7AAA5808', border: '1px solid #7AAA5820' }}
          >
            start session
          </button>
        </div>
      )}

      {/* Members */}
      <div className="flex justify-center gap-3">
        {activeDetail.members.map((m) => (
          <div key={m.id} className="flex flex-col items-center gap-1">
            <span
              className="block rounded-full"
              style={{
                width: 20,
                height: 20,
                background: m.pulseColor || m.color,
                opacity: m.pulse && m.sharePulse ? 0.8 : 0.3,
              }}
            />
            <span
              style={{
                fontFamily: font,
                fontSize: '10px',
                color: '#5C3018',
                fontWeight: m.userId === me.id ? 700 : 500,
                opacity: 0.7,
              }}
            >
              {m.name}
            </span>
            {m.pulse && m.sharePulse && (
              <span
                style={{
                  fontFamily: font,
                  fontSize: '9px',
                  color: m.pulseColor || '#C4A060',
                  opacity: 0.6,
                }}
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
        style={{
          borderColor: `${activeDetail.color}20`,
          background: `${activeDetail.color}04`,
        }}
      >
        <p
          className="uppercase tracking-[0.2em] text-center"
          style={{
            fontFamily: font,
            fontSize: '10px',
            fontWeight: 700,
            color: activeDetail.color,
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
                  border: `1.5px solid ${activeDetail.color}40`,
                  background: 'transparent',
                }}
              />
              <button
                type="button"
                className="flex-1 cursor-pointer bg-transparent text-left"
                onClick={() => claimMission(m.id)}
                style={{
                  fontFamily: font,
                  fontSize: '14px',
                  color: '#5C3018',
                  border: 'none',
                  padding: 0,
                }}
                title="tap to claim"
              >
                {m.text}
              </button>
              {m.dueDate && (
                <span style={{ fontFamily: font, fontSize: '9px', color: '#8A6A4A', opacity: 0.4 }}>
                  {m.dueDate.slice(5)}
                </span>
              )}
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
                onClick={() => removeMissionAction(m.id)}
                className="cursor-pointer text-[10px] transition-all"
                style={{ color: '#8A6A4A', opacity: 0.2, background: 'none', border: 'none' }}
              >
                x
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
              borderColor: `${activeDetail.color}20`,
            }}
          />
          <input
            type="date"
            value={missionDueDate}
            onChange={(e) => setMissionDueDate(e.target.value)}
            className="border-b bg-transparent pb-1 outline-none"
            style={{
              fontFamily: font,
              fontSize: '11px',
              color: '#8A6A4A',
              opacity: 0.5,
              borderColor: `${activeDetail.color}15`,
              width: 100,
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
                    border: `1.5px solid ${activeDetail.color}20`,
                    background: `${activeDetail.color}15`,
                  }}
                >
                  <span style={{ fontSize: '10px', color: activeDetail.color, opacity: 0.6 }}>
                    &#10003;
                  </span>
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
        {activeDetail.notes.slice(0, 20).map((n) => (
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
              {new Date(n.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
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

        {activeDetail.notes.length === 0 && (
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

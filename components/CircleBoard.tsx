'use client';

import { useEffect, useMemo, useState } from 'react';

import CircleAgenda from '@/components/CircleAgenda';
import CircleAudio from '@/components/CircleAudio';
import CircleDecisions from '@/components/CircleDecisions';
import CircleEvents from '@/components/CircleEvents';
import CircleMoney from '@/components/CircleMoney';
import CircleRainbow from '@/components/CircleRainbow';
import { useKeyboardAware } from '@/components/hooks/useKeyboardAware';
import {
  type CircleDetail as ApiCircleDetail,
  type CircleMember as ApiCircleMember,
  type CircleMission as ApiCircleMission,
  type CircleNote as ApiCircleNote,
  useCircles,
} from '@/lib/use-circles';

/* ═══════════════════════════════════════════════════════════
   CIRCLE BOARD — shared mission board for a group of people.
   Create circles, join with a code, shared missions + log.
   Phase 2: Supabase-backed via /api/circles + useCircles() hook.
   Per Martin (2026-04-26): "all cicles needs supabase wire up."
   localStorage caches the last-seen state for offline-friendly
   first paint; mutations route through the API.
   ═══════════════════════════════════════════════════════════ */

const LS_ANNOTATIONS = 'colourmap:circle-annotations';

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

interface MissionNote {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  createdAt: string;
}

interface Mission {
  id: string;
  text: string;
  claimedBy?: string;
  done: boolean;
  /** Optional ISO date the mission is due (YYYY-MM-DD or full ISO). */
  due?: string;
  /** Inline notes thread on this specific mission. */
  notes?: MissionNote[];
  createdAt: string;
}

/**
 * Derive a 3-state status from the existing fields, so we don't
 * have to migrate the localStorage schema.
 *  - 'open'  → unclaimed and not done
 *  - 'doing' → claimed by someone, not done
 *  - 'done'  → done = true
 */
function getMissionStatus(m: Mission): 'open' | 'doing' | 'done' {
  if (m.done) return 'done';
  if (m.claimedBy) return 'doing';
  return 'open';
}

/** Format a YYYY-MM-DD or ISO date as a soft relative phrase. */
function dueLabel(
  due: string | undefined,
): { text: string; tone: 'soon' | 'overdue' | 'far' } | null {
  if (!due) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(due);
  if (Number.isNaN(dueDate.getTime())) return null;
  dueDate.setHours(0, 0, 0, 0);
  const diffMs = dueDate.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / 86_400_000);
  if (diffDays < 0) return { text: `overdue ${Math.abs(diffDays)}d`, tone: 'overdue' };
  if (diffDays === 0) return { text: 'today', tone: 'soon' };
  if (diffDays === 1) return { text: 'tomorrow', tone: 'soon' };
  if (diffDays <= 7) return { text: `in ${diffDays}d`, tone: 'soon' };
  if (diffDays <= 30) return { text: `in ${Math.round(diffDays / 7)}w`, tone: 'far' };
  return { text: dueDate.toLocaleDateString([], { month: 'short', day: 'numeric' }), tone: 'far' };
}

interface Note {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  createdAt: string;
}

const _CIRCLE_COLORS = ['#D4805A', '#6890B0', '#7AAA58', '#9B6BA0', '#C4A060', '#5A8AAA'];

/* ─── Local annotations layer ─────────────────────────────────
 *
 * The Supabase API supports the core surface (circle metadata,
 * members, missions, notes, pulse). It does NOT yet support:
 *   - per-mission notes thread (m.notes[])
 *   - chapter + chapterMeanings on a circle
 *
 * These live in localStorage keyed by circle id, and are merged
 * into the API-backed shape by `augmentCircle()` so the existing
 * UI keeps working. Wire these into the API in a follow-up PR.
 */
interface CircleAnnotations {
  chapter?: string;
  chapterMeanings?: ChapterMeaning[];
  missionNotes?: Record<string, MissionNote[]>;
}

type AnnotationStore = Record<string, CircleAnnotations>;

function loadAnnotations(): AnnotationStore {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(LS_ANNOTATIONS);
    return raw ? (JSON.parse(raw) as AnnotationStore) : {};
  } catch {
    return {};
  }
}

function persistAnnotations(store: AnnotationStore) {
  try {
    localStorage.setItem(LS_ANNOTATIONS, JSON.stringify(store));
  } catch {
    /* silent */
  }
}

/** Convert an API CircleDetail into the legacy local Circle shape
 *  the UI was originally written against. Maps `dueDate` → `due`,
 *  `userId` → `id`, and overlays local annotations. */
function augmentCircle(api: ApiCircleDetail, annotations: AnnotationStore): Circle {
  const ann = annotations[api.id] || {};
  const missionNotes = ann.missionNotes ?? {};
  return {
    id: api.id,
    name: api.name,
    code: api.code,
    color: api.color,
    createdAt: api.createdAt ?? '',
    members: api.members.map(
      (m: ApiCircleMember): Member => ({
        id: m.userId, // use real auth user id as the local id
        name: m.name,
        color: m.color,
        pulse: m.pulse ?? undefined,
        pulseColor: m.pulseColor ?? undefined,
      }),
    ),
    missions: api.missions.map(
      (m: ApiCircleMission): Mission => ({
        id: m.id,
        text: m.text,
        claimedBy: m.claimedBy ?? undefined,
        done: m.done,
        due: m.dueDate ?? undefined,
        notes: missionNotes[m.id] ?? [],
        createdAt: m.createdAt ?? '',
      }),
    ),
    notes: api.notes.map(
      (n: ApiCircleNote): Note => ({
        id: n.id,
        authorId: n.authorId,
        authorName: n.authorName,
        text: n.text,
        createdAt: n.createdAt,
      }),
    ),
    chapter: ann.chapter,
    chapterMeanings: ann.chapterMeanings,
  };
}

type View = 'list' | 'board';

export default function CircleBoard() {
  // Supabase-backed via the useCircles() hook. Annotations
  // (chapter, mission notes thread) layer on top from localStorage.
  const hook = useCircles();
  const [annotations, setAnnotations] = useState<AnnotationStore>({});
  useEffect(() => {
    setAnnotations(loadAnnotations());
  }, []);

  // The circles array the UI reads from — augmented with local
  // annotations so chapter + mission notes still work.
  const circles = useMemo<Circle[]>(
    () => hook.circles.map((c) => augmentCircle(c, annotations)),
    [hook.circles, annotations],
  );
  const activeId = hook.activeId;
  const active = circles.find((c) => c.id === activeId);
  const me = hook.me;

  const [view, setView] = useState<View>('list');
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [newName, setNewName] = useState('');
  const [createError, setCreateError] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [missionInput, setMissionInput] = useState('');
  const [missionDueInput, setMissionDueInput] = useState('');
  const [expandedMissionId, setExpandedMissionId] = useState<string | null>(null);
  const [missionNoteInput, setMissionNoteInput] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [editingMe, setEditingMe] = useState(false);
  const [meNameInput, setMeNameInput] = useState('');
  const [howOpen, setHowOpen] = useState(false);
  // Board-view-only state — declared at the top so the hook count stays
  // stable across renders. (Earlier these lived AFTER the list/setup
  // early returns, which crashed React when the user switched views:
  // hook count went from N → N+5 mid-flight, "rendered more hooks than
  // during the previous render" → blank screen.)
  const [editingChapter, setEditingChapter] = useState(false);
  const [chapterInput, setChapterInput] = useState('');
  const [chapterOpen, setChapterOpen] = useState(false);
  const [meaningInput, setMeaningInput] = useState('');
  const [assigningMission, setAssigningMission] = useState<string | null>(null);
  const boardRef = useKeyboardAware<HTMLDivElement>();

  // First-run name capture. Auto-opens the editor if no me.name.
  useEffect(() => {
    if (!hook.loading && !me.name) setEditingMe(true);
  }, [hook.loading, me.name]);

  // When the user picks an active circle, switch to board view.
  useEffect(() => {
    if (activeId) setView('board');
  }, [activeId]);

  /**
   * Update local annotations for a circle (chapter, mission notes,
   * etc.) and persist to localStorage. This is the only writer for
   * non-API fields.
   */
  function updateAnnotations(circleId: string, patch: Partial<CircleAnnotations>) {
    const next: AnnotationStore = {
      ...annotations,
      [circleId]: { ...(annotations[circleId] || {}), ...patch },
    };
    setAnnotations(next);
    persistAnnotations(next);
  }

  function selectCircle(id: string) {
    hook.selectCircle(id);
    setView('board');
  }

  function saveMe(name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;
    hook.setMyName(trimmed);
    setEditingMe(false);
  }

  async function createCircle() {
    const name = newName.trim();
    if (!name) return;
    if (!me.name) {
      setCreateError('Set your name first (tap your name above).');
      setEditingMe(true);
      return;
    }
    setCreateError('');
    const detail = await hook.createCircle(name);
    if (detail) {
      setNewName('');
      setCreating(false);
    } else {
      setCreateError('Could not create — check your connection and try again.');
    }
  }

  async function joinCircle() {
    const code = joinCode.trim().toUpperCase();
    if (!code || !me.name) return;
    const detail = await hook.joinCircle(code);
    if (detail) {
      setJoining(false);
      setJoinCode('');
    }
  }

  async function addMission() {
    const text = missionInput.trim();
    if (!text || !activeId) return;
    await hook.addMission(text, missionDueInput || null);
    setMissionInput('');
    setMissionDueInput('');
  }

  async function toggleMission(missionId: string) {
    await hook.toggleMissionDone(missionId);
  }

  /** Toggle "I'm working on this" — claims for me if unclaimed,
   *  unclaims if I already had it. Drives the doing-state chip. */
  async function claimMission(missionId: string) {
    await hook.claimMission(missionId);
  }

  async function setMissionDue(missionId: string, due: string | undefined) {
    await hook.setMissionDue(missionId, due ?? null);
  }

  /** Add a note to a mission's local thread. Stays localStorage-only
   *  for now — API extension is a follow-up. */
  function addMissionNote(missionId: string, text: string) {
    const trimmed = text.trim();
    if (!trimmed || !activeId) return;
    const note: MissionNote = {
      id: crypto.randomUUID(),
      authorId: me.id,
      authorName: me.name,
      text: trimmed,
      createdAt: new Date().toISOString(),
    };
    const existing = annotations[activeId]?.missionNotes ?? {};
    updateAnnotations(activeId, {
      missionNotes: {
        ...existing,
        [missionId]: [...(existing[missionId] || []), note],
      },
    });
  }

  async function removeMission(missionId: string) {
    await hook.removeMission(missionId);
  }

  async function addNote() {
    const text = noteInput.trim();
    if (!text || !activeId) return;
    await hook.addNote(text);
    setNoteInput('');
  }

  // Read pulse from check-in — only on circle switch. Posts to the
  // /api/circles/:id/pulse endpoint via the hook so other members
  // see the user's current Hawkins state.
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally runs only on activeId change
  useEffect(() => {
    if (!active || !me.id) return;
    try {
      const hawkinsIdx = Number(localStorage.getItem('colourmap:process-idx') || '4');
      const HAWKINS_LABELS = [
        'Shame',
        'Apathy',
        'Sadness',
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
      const currentMember = active.members.find((m) => m.id === me.id);
      if (currentMember?.pulse !== pulse) {
        void hook.setMyPulse(pulse, pulseColor);
      }
    } catch {
      /* silent */
    }
  }, [activeId]);

  const font = 'var(--font-serif)';

  // ── Name setup ──
  if (editingMe || !me.name) {
    return (
      <div ref={boardRef} className="mx-auto max-w-md space-y-6 px-4 py-12">
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
            coworking with people you trust
          </p>
          <p style={{ fontFamily: font, fontSize: '13px', color: '#8A6A4A', opacity: 0.6 }}>
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
      <div ref={boardRef} className="mx-auto max-w-md space-y-6 px-4 py-8">
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
            style={{
              fontFamily: font,
              fontSize: '15px',
              color: '#7A5438',
              opacity: 0.9,
              maxWidth: 360,
              margin: '0 auto',
              lineHeight: 1.5,
            }}
          >
            a shared space to align missions and become effective in the process.
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
                fontSize: 14,
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
              className="mt-4 space-y-5 animate-in fade-in duration-150"
              style={{ fontFamily: font, fontSize: 18, lineHeight: 1.55, color: '#5C3018' }}
            >
              <p>
                A <strong>Circle</strong> is a small group of people you trust.
              </p>
              <p>Share what you're working on and organise missions together.</p>
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
              placeholder="circle name..."
              autoFocus
              className="w-full border-b bg-transparent pb-2 text-center outline-none placeholder:italic placeholder:text-[#8A6A4A] placeholder:opacity-40"
              style={{
                fontFamily: 'var(--font-handwritten)',
                fontSize: '26px',
                fontWeight: 700,
                color: '#5C3018',
                borderColor: '#7AAA5830',
                letterSpacing: '0.04em',
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
                onClick={() => {
                  setCreating(false);
                  setCreateError('');
                }}
                className="cursor-pointer text-[11px]"
                style={{ color: '#8A6A4A', opacity: 0.4, background: 'none', border: 'none' }}
              >
                cancel
              </button>
            </div>
            {createError && (
              <p className="text-[11px] italic" style={{ color: '#D4605A' }}>
                {createError}
              </p>
            )}
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

  function setChapter(text: string) {
    if (!activeId) return;
    updateAnnotations(activeId, { chapter: text });
    setEditingChapter(false);
  }

  function addMeaning() {
    const text = meaningInput.trim();
    if (!text || !active || !activeId) return;
    const meaning: ChapterMeaning = { memberId: me.id, memberName: me.name, text };
    const existing = active.chapterMeanings || [];
    updateAnnotations(activeId, {
      chapterMeanings: [...existing.filter((m) => m.memberId !== me.id), meaning],
    });
    setMeaningInput('');
  }

  /** Assign a mission to a specific member. The hook's claimMission
   *  toggles based on me.id; for assigning to anyone else we go
   *  directly through patchMission via setMissionDue's sibling
   *  pathway. Today: when assigning to someone other than me, just
   *  set claimedBy via the API PATCH. */
  async function assignMissionTo(missionId: string, memberId: string) {
    if (!activeId) return;
    try {
      await fetch(`/api/circles/${activeId}/missions/${missionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claimedBy: memberId }),
      });
      await hook.refresh();
    } catch {
      /* silent — surface in UI in a follow-up */
    }
    setAssigningMission(null);
  }

  return (
    <div ref={boardRef} className="mx-auto max-w-md space-y-5 px-4 py-6">
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

      {/* Agenda — 14-day strip of mission due dates, coloured by owner */}
      <CircleAgenda
        missions={active.missions}
        members={active.members.map((m) => ({
          id: m.id,
          name: m.name,
          color: m.pulseColor || m.color,
        }))}
        onTapMission={(id) => setExpandedMissionId(id)}
      />

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
              {memberMissions.map((m) => {
                const status = getMissionStatus(m);
                const memberColor = member.pulseColor || member.color;
                const due = dueLabel(m.due);
                const noteCount = m.notes?.length ?? 0;
                const isExpanded = expandedMissionId === m.id;
                const isMine = m.claimedBy === me.id;
                const statusColour =
                  status === 'done' ? '#7AAA58' : status === 'doing' ? memberColor : '#8A6A4A';
                return (
                  <div key={m.id} className="rounded-lg" style={{ paddingLeft: 12 }}>
                    {/* Top row — tick + status chip + text + due + count */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleMission(m.id)}
                        className="flex shrink-0 cursor-pointer items-center justify-center rounded-sm transition-all"
                        style={{
                          width: 16,
                          height: 16,
                          border: `1.5px solid ${memberColor}55`,
                          background: status === 'done' ? `${statusColour}30` : 'transparent',
                        }}
                        aria-label={status === 'done' ? 'Mark not done' : 'Mark done'}
                      >
                        {status === 'done' && (
                          <span style={{ fontSize: '9px', color: statusColour, opacity: 0.8 }}>
                            ✓
                          </span>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setExpandedMissionId(isExpanded ? null : m.id)}
                        className="flex flex-1 cursor-pointer items-center gap-2 bg-transparent text-left"
                        style={{ border: 'none', padding: 0 }}
                      >
                        {/* Status chip — tiny pill */}
                        <span
                          className="rounded-full"
                          style={{
                            fontFamily: font,
                            fontSize: '9px',
                            fontWeight: 700,
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            padding: '1px 6px',
                            background: `${statusColour}18`,
                            color: statusColour,
                            border: `1px solid ${statusColour}35`,
                          }}
                        >
                          {status}
                        </span>
                        <span
                          className="flex-1"
                          style={{
                            fontFamily: font,
                            fontSize: '13px',
                            color: status === 'done' ? '#8A6A4A' : '#5C3018',
                            opacity: status === 'done' ? 0.5 : 1,
                            textDecoration: status === 'done' ? 'line-through' : 'none',
                          }}
                        >
                          {m.text}
                        </span>
                        {due && (
                          <span
                            className="shrink-0 rounded-full"
                            style={{
                              fontFamily: font,
                              fontSize: '9.5px',
                              fontWeight: 600,
                              padding: '1px 6px',
                              color:
                                due.tone === 'overdue'
                                  ? '#B33A2B'
                                  : due.tone === 'soon'
                                    ? '#C4A060'
                                    : '#8A6A4A',
                              opacity: 0.85,
                            }}
                          >
                            {due.text}
                          </span>
                        )}
                        {noteCount > 0 && (
                          <span
                            className="shrink-0"
                            style={{
                              fontFamily: font,
                              fontSize: '10px',
                              color: '#8A6A4A',
                              opacity: 0.55,
                            }}
                          >
                            💬 {noteCount}
                          </span>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeMission(m.id)}
                        className="cursor-pointer text-[10px]"
                        style={{
                          color: '#8A6A4A',
                          opacity: 0.15,
                          background: 'none',
                          border: 'none',
                        }}
                        aria-label="Delete mission"
                      >
                        ×
                      </button>
                    </div>

                    {/* Expanded — claim button, due picker, notes thread */}
                    {isExpanded && (
                      <div
                        className="mt-1.5 ml-6 space-y-2 rounded-lg animate-in fade-in duration-150"
                        style={{
                          padding: '8px 10px',
                          background: `${memberColor}08`,
                          border: `1px solid ${memberColor}1A`,
                        }}
                      >
                        <div className="flex flex-wrap items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => claimMission(m.id)}
                            className="cursor-pointer rounded-full px-2.5 py-1 transition-all"
                            style={{
                              fontFamily: font,
                              fontSize: '10px',
                              fontWeight: 600,
                              letterSpacing: '0.08em',
                              background: isMine ? `${memberColor}22` : 'transparent',
                              border: `1px solid ${memberColor}50`,
                              color: memberColor,
                            }}
                          >
                            {isMine ? '✓ on it' : 'I’m on it'}
                          </button>
                          <input
                            type="date"
                            value={m.due ? m.due.slice(0, 10) : ''}
                            onChange={(e) => setMissionDue(m.id, e.target.value || undefined)}
                            className="rounded-full bg-transparent px-2 py-0.5 outline-none"
                            style={{
                              fontFamily: font,
                              fontSize: '10px',
                              color: '#7A5438',
                              border: '1px solid #C4A06035',
                            }}
                            title="Set due date"
                          />
                        </div>
                        {/* Notes thread on this mission */}
                        {(m.notes || []).map((n) => (
                          <div key={n.id} className="flex items-start gap-2">
                            <span
                              className="rounded-full"
                              style={{
                                width: 6,
                                height: 6,
                                marginTop: 6,
                                background: memberColor,
                                opacity: 0.5,
                                flexShrink: 0,
                              }}
                            />
                            <div className="flex-1">
                              <span
                                style={{
                                  fontFamily: font,
                                  fontSize: '10px',
                                  fontWeight: 600,
                                  color: memberColor,
                                  opacity: 0.7,
                                  marginRight: 6,
                                }}
                              >
                                {n.authorName}
                              </span>
                              <span
                                style={{
                                  fontFamily: font,
                                  fontSize: '11px',
                                  color: '#5C3018',
                                  opacity: 0.85,
                                }}
                              >
                                {n.text}
                              </span>
                            </div>
                          </div>
                        ))}
                        {/* Add a note */}
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            value={isExpanded ? missionNoteInput : ''}
                            onChange={(e) => setMissionNoteInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && missionNoteInput.trim()) {
                                addMissionNote(m.id, missionNoteInput);
                                setMissionNoteInput('');
                              }
                            }}
                            placeholder="leave a note…"
                            className="flex-1 border-b bg-transparent px-1 pb-0.5 outline-none placeholder:italic placeholder:text-[#8A6A4A] placeholder:opacity-40"
                            style={{
                              fontFamily: font,
                              fontSize: '11px',
                              color: '#5C3018',
                              borderColor: `${memberColor}20`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}

        {/* Add mission — text + optional due date. Once you click on the
            mission you can also claim it / re-set the due date. */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
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
              minWidth: 160,
            }}
          />
          <input
            type="date"
            value={missionDueInput}
            onChange={(e) => setMissionDueInput(e.target.value)}
            className="rounded-full bg-transparent px-2 py-0.5 outline-none"
            style={{
              fontFamily: font,
              fontSize: '10px',
              color: '#7A5438',
              border: `1px solid ${active.color}25`,
            }}
            title="Optional due date"
          />
          {missionInput.trim() && (
            <button
              type="button"
              onClick={addMission}
              className="cursor-pointer rounded-full px-3 py-1 transition-all"
              style={{
                fontFamily: font,
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: active.color,
                background: `${active.color}10`,
                border: `1px solid ${active.color}40`,
              }}
            >
              add
            </button>
          )}
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

      {/* Sync sessions — rehearsals / mix nights / photoshoots */}
      <CircleEvents
        circleId={active.id}
        meId={me.id}
        meName={me.name}
        members={active.members.map((m) => ({
          id: m.id,
          name: m.name,
          color: m.pulseColor || m.color,
        }))}
      />

      {/* Decisions — proposals + voting log */}
      <CircleDecisions
        circleId={active.id}
        meId={me.id}
        meName={me.name}
        members={active.members.map((m) => ({
          id: m.id,
          name: m.name,
          color: m.pulseColor || m.color,
        }))}
      />

      {/* Money — shared expenses + balances */}
      <CircleMoney
        circleId={active.id}
        meId={me.id}
        meName={me.name}
        members={active.members.map((m) => ({
          id: m.id,
          name: m.name,
          color: m.pulseColor || m.color,
        }))}
      />

      {/* Audio — recordings + voice memos with reflections */}
      <CircleAudio
        circleId={active.id}
        meId={me.id}
        meName={me.name}
        meColour={active.members.find((m) => m.id === me.id)?.color || active.color}
      />

      {/* Rainbow — vertical Hawkins reflection band, threaded over time */}
      <CircleRainbow
        circleId={active.id}
        meId={me.id}
        meName={me.name}
        meColour={active.members.find((m) => m.id === me.id)?.color || active.color}
      />

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

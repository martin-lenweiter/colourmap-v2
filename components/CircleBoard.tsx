'use client';

import { useEffect, useMemo, useState } from 'react';

import CircleAgenda from '@/components/CircleAgenda';
import CircleAudio from '@/components/CircleAudio';
import CircleDecisions from '@/components/CircleDecisions';
import CircleEvents from '@/components/CircleEvents';
import CircleMoney from '@/components/CircleMoney';
import CircleRainbow from '@/components/CircleRainbow';
import CircleSparks from '@/components/CircleSparks';
import { useKeyboardAware } from '@/components/hooks/useKeyboardAware';
import {
  type CircleDetail as ApiCircleDetail,
  type CircleMember as ApiCircleMember,
  type CircleMission as ApiCircleMission,
  type CircleNote as ApiCircleNote,
  useCircles,
} from '@/lib/use-circles';

const LS_ANNOTATIONS = 'colourmap:circle-annotations';

const COWORKING_IMAGES = ['/coworking.png', '/coworking-2.png', '/coworking-3.png'];

/* ─── Types ─────────────────────────────────────────────────── */

interface ChapterMeaning {
  memberId: string;
  memberName: string;
  text: string;
}

interface Objective {
  id: string;
  text: string;
  createdAt: string;
}

interface MemberStatus {
  memberId: string;
  memberName: string;
  text: string;
  updatedAt: string;
}

interface ProcessEntry {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  createdAt: string;
}

interface HelpRequest {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  resolved: boolean;
  helpers: string[];
  createdAt: string;
}

interface MemberFeeling {
  memberId: string;
  memberName: string;
  word: string;
  description: string;
  sharedAt: string;
}

interface CircleAnnotations {
  chapter?: string;
  chapterMeanings?: ChapterMeaning[];
  missionNotes?: Record<string, MissionNote[]>;
  objectives?: Objective[];
  missionObjectiveMap?: Record<string, string>;
  memberStatuses?: MemberStatus[];
  memberFeelings?: MemberFeeling[];
  processEntries?: ProcessEntry[];
  helpRequests?: HelpRequest[];
}

type AnnotationStore = Record<string, CircleAnnotations>;

interface MissionNote {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
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
  due?: string;
  notes?: MissionNote[];
  createdAt: string;
}

interface Note {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  createdAt: string;
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

/* ─── Helpers ────────────────────────────────────────────────── */

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

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function dueLabel(
  due: string | undefined,
): { text: string; tone: 'soon' | 'overdue' | 'far' } | null {
  if (!due) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(due);
  if (Number.isNaN(d.getTime())) return null;
  d.setHours(0, 0, 0, 0);
  const days = Math.round((d.getTime() - today.getTime()) / 86_400_000);
  if (days < 0) return { text: `${Math.abs(days)}d overdue`, tone: 'overdue' };
  if (days === 0) return { text: 'today', tone: 'soon' };
  if (days === 1) return { text: 'tomorrow', tone: 'soon' };
  if (days <= 7) return { text: `in ${days}d`, tone: 'soon' };
  if (days <= 30) return { text: `in ${Math.round(days / 7)}w`, tone: 'far' };
  return { text: d.toLocaleDateString([], { month: 'short', day: 'numeric' }), tone: 'far' };
}

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
        id: m.userId,
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

/* ─── Section component ──────────────────────────────────────── */

function Section({
  label,
  badge,
  open,
  onToggle,
  children,
  accent = '#C4A060',
}: {
  label: string;
  badge?: number | string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  accent?: string;
}) {
  const font = 'var(--font-serif)';
  return (
    <div style={{ borderRadius: 14, border: `1px solid ${accent}20`, overflow: 'hidden' }}>
      <button
        type="button"
        onClick={onToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          width: '100%',
          padding: '10px 16px',
          background: `${accent}06`,
          border: 'none',
          cursor: 'pointer',
        }}
      >
        <span
          style={{
            fontFamily: font,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: accent,
            opacity: 0.7,
            flex: 1,
            textAlign: 'left',
          }}
        >
          {label}
        </span>
        {badge !== undefined && (
          <span style={{ fontFamily: font, fontSize: 10, color: accent, opacity: 0.45 }}>
            {badge}
          </span>
        )}
        <span
          style={{
            fontSize: 10,
            color: accent,
            opacity: 0.4,
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
          }}
        >
          ▾
        </span>
      </button>
      {open && (
        <div style={{ padding: '4px 16px 14px', borderTop: `1px solid ${accent}12` }}>
          {children}
        </div>
      )}
    </div>
  );
}

type View = 'list' | 'board';
type MissionTab = 'backlog' | 'active' | 'done';

/* ─── Component ──────────────────────────────────────────────── */

export default function CircleBoard() {
  const hook = useCircles();
  const [annotations, setAnnotations] = useState<AnnotationStore>({});
  useEffect(() => {
    setAnnotations(loadAnnotations());
  }, []);

  const circles = useMemo<Circle[]>(
    () => hook.circles.map((c) => augmentCircle(c, annotations)),
    [hook.circles, annotations],
  );
  const activeId = hook.activeId;
  const active = circles.find((c) => c.id === activeId);
  const me = hook.me;

  /* ── UI state (all at top level — no conditional hooks) ── */
  const [view, setView] = useState<View>('list');
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [newName, setNewName] = useState('');
  const [createError, setCreateError] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [editingMe, setEditingMe] = useState(false);
  const [meNameInput, setMeNameInput] = useState('');
  const [howOpen, setHowOpen] = useState(false);

  /* Board view state */
  const [missionTab, setMissionTab] = useState<MissionTab>('backlog');
  const [missionInput, setMissionInput] = useState('');
  const [missionDueInput, setMissionDueInput] = useState('');
  const [expandedMissionId, setExpandedMissionId] = useState<string | null>(null);
  const [missionNoteInput, setMissionNoteInput] = useState('');
  const [assigningMission, setAssigningMission] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState('');

  /* Objectives */
  const [objInput, setObjInput] = useState('');
  const [taggingMission, setTaggingMission] = useState<string | null>(null);

  /* My Status */
  const [editingMyStatus, setEditingMyStatus] = useState(false);
  const [myStatusInput, setMyStatusInput] = useState('');

  /* Process & Help */
  const [processInput, setProcessInput] = useState('');
  const [helpInput, setHelpInput] = useState('');

  /* Feelings */
  const [editingFeeling, setEditingFeeling] = useState(false);
  const [feelingWord, setFeelingWord] = useState('');
  const [feelingDesc, setFeelingDesc] = useState('');

  /* Chapter */
  const [editingChapter, setEditingChapter] = useState(false);
  const [chapterInput, setChapterInput] = useState('');

  /* Open sections */
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    objectives: true,
    missions: true,
    feelings: true,
    process: false,
    help: false,
    extras: false,
    log: false,
  });

  const boardRef = useKeyboardAware<HTMLDivElement>();
  const coworkingHero = useMemo(
    () => COWORKING_IMAGES[Math.floor(Math.random() * COWORKING_IMAGES.length)],
    [],
  );

  useEffect(() => {
    if (!hook.loading && !me.name) setEditingMe(true);
  }, [hook.loading, me.name]);

  useEffect(() => {
    if (activeId) setView('board');
  }, [activeId]);

  // Post Hawkins pulse on circle switch.
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally runs only on activeId change
  useEffect(() => {
    if (!active || !me.id) return;
    try {
      const idx = Number(localStorage.getItem('colourmap:process-idx') || '4');
      const LABELS = [
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
      const COLORS = [
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
      const pulse = LABELS[idx] || 'Neutral';
      const pulseColor = COLORS[idx] || '#C4A060';
      const cur = active.members.find((m) => m.id === me.id);
      if (cur?.pulse !== pulse) void hook.setMyPulse(pulse, pulseColor);
    } catch {
      /* silent */
    }
  }, [activeId]);

  const font = 'var(--font-serif)';

  /* ── Annotation helpers ── */
  function updateAnnotations(circleId: string, patch: Partial<CircleAnnotations>) {
    const next: AnnotationStore = {
      ...annotations,
      [circleId]: { ...(annotations[circleId] || {}), ...patch },
    };
    setAnnotations(next);
    persistAnnotations(next);
  }

  function ann(): CircleAnnotations {
    return activeId ? annotations[activeId] || {} : {};
  }

  function toggleSection(key: string) {
    setOpenSections((s) => ({ ...s, [key]: !s[key] }));
  }

  /* ── Identity ── */
  function saveMe(name: string) {
    const t = name.trim();
    if (!t) return;
    hook.setMyName(t);
    setEditingMe(false);
  }

  function selectCircle(id: string) {
    hook.selectCircle(id);
    setView('board');
  }

  /* ── Circle CRUD ── */
  async function createCircle() {
    const name = newName.trim();
    if (!name) return;
    if (!me.name) {
      setCreateError('Set your name first.');
      setEditingMe(true);
      return;
    }
    setCreateError('');
    const detail = await hook.createCircle(name);
    if (detail) {
      setNewName('');
      setCreating(false);
    } else setCreateError('Could not create — check your connection and try again.');
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

  /* ── Missions ── */
  async function addMission() {
    const text = missionInput.trim();
    if (!text || !activeId) return;
    await hook.addMission(text, missionDueInput || null);
    setMissionInput('');
    setMissionDueInput('');
  }

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
      /* silent */
    }
    setAssigningMission(null);
  }

  function addMissionNote(missionId: string, text: string) {
    const t = text.trim();
    if (!t || !activeId) return;
    const note: MissionNote = {
      id: crypto.randomUUID(),
      authorId: me.id,
      authorName: me.name,
      text: t,
      createdAt: new Date().toISOString(),
    };
    const existing = annotations[activeId]?.missionNotes ?? {};
    updateAnnotations(activeId, {
      missionNotes: { ...existing, [missionId]: [...(existing[missionId] || []), note] },
    });
  }

  /* ── Objectives ── */
  function addObjective() {
    const t = objInput.trim();
    if (!t || !activeId) return;
    const obj: Objective = {
      id: crypto.randomUUID(),
      text: t,
      createdAt: new Date().toISOString(),
    };
    const existing = ann().objectives ?? [];
    updateAnnotations(activeId, { objectives: [...existing, obj] });
    setObjInput('');
  }

  function removeObjective(id: string) {
    if (!activeId) return;
    const existing = ann().objectives ?? [];
    updateAnnotations(activeId, { objectives: existing.filter((o) => o.id !== id) });
  }

  function tagMission(missionId: string, objectiveId: string | null) {
    if (!activeId) return;
    const map = { ...(ann().missionObjectiveMap ?? {}) };
    if (objectiveId === null) delete map[missionId];
    else map[missionId] = objectiveId;
    updateAnnotations(activeId, { missionObjectiveMap: map });
    setTaggingMission(null);
  }

  /* ── My Status ── */
  function saveMyStatus() {
    const t = myStatusInput.trim();
    if (!activeId) return;
    const existing = ann().memberStatuses ?? [];
    const status: MemberStatus = {
      memberId: me.id,
      memberName: me.name,
      text: t,
      updatedAt: new Date().toISOString(),
    };
    updateAnnotations(activeId, {
      memberStatuses: [...existing.filter((s) => s.memberId !== me.id), ...(t ? [status] : [])],
    });
    setEditingMyStatus(false);
  }

  /* ── Feelings ── */
  function todayStart() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.toISOString();
  }

  function saveFeeling() {
    const w = feelingWord.trim();
    if (!w || !activeId) return;
    const existing = (ann().memberFeelings ?? []).filter((f) => f.memberId !== me.id);
    const feeling: MemberFeeling = {
      memberId: me.id,
      memberName: me.name,
      word: w,
      description: feelingDesc.trim(),
      sharedAt: new Date().toISOString(),
    };
    updateAnnotations(activeId, { memberFeelings: [...existing, feeling] });
    setEditingFeeling(false);
  }

  function clearMyFeeling() {
    if (!activeId) return;
    updateAnnotations(activeId, {
      memberFeelings: (ann().memberFeelings ?? []).filter((f) => f.memberId !== me.id),
    });
    setFeelingWord('');
    setFeelingDesc('');
    setEditingFeeling(false);
  }

  function useTodaysMood() {
    try {
      const word = localStorage.getItem('colourmap:mood-word') || '';
      const rawLog = localStorage.getItem('colourmap:emotions-log');
      const log: Array<{ word?: string; label?: string; createdAt?: string }> = rawLog
        ? JSON.parse(rawLog)
        : [];
      const today = todayStart();
      const todayEntry = log.find((e) => e.createdAt && e.createdAt >= today);
      const resolved = word || todayEntry?.word || todayEntry?.label || '';
      if (resolved) setFeelingWord(resolved);
    } catch {}
  }

  /* ── Process ── */
  function addProcessEntry() {
    const t = processInput.trim();
    if (!t || !activeId) return;
    const entry: ProcessEntry = {
      id: crypto.randomUUID(),
      authorId: me.id,
      authorName: me.name,
      text: t,
      createdAt: new Date().toISOString(),
    };
    updateAnnotations(activeId, { processEntries: [entry, ...(ann().processEntries ?? [])] });
    setProcessInput('');
  }

  function removeProcessEntry(id: string) {
    if (!activeId) return;
    updateAnnotations(activeId, {
      processEntries: (ann().processEntries ?? []).filter((e) => e.id !== id),
    });
  }

  /* ── Help ── */
  function addHelpRequest() {
    const t = helpInput.trim();
    if (!t || !activeId) return;
    const req: HelpRequest = {
      id: crypto.randomUUID(),
      authorId: me.id,
      authorName: me.name,
      text: t,
      resolved: false,
      helpers: [],
      createdAt: new Date().toISOString(),
    };
    updateAnnotations(activeId, { helpRequests: [req, ...(ann().helpRequests ?? [])] });
    setHelpInput('');
  }

  function toggleHelper(id: string) {
    if (!activeId) return;
    const reqs = ann().helpRequests ?? [];
    updateAnnotations(activeId, {
      helpRequests: reqs.map((r) => {
        if (r.id !== id) return r;
        const has = r.helpers.includes(me.id);
        return {
          ...r,
          helpers: has ? r.helpers.filter((h) => h !== me.id) : [...r.helpers, me.id],
        };
      }),
    });
  }

  function resolveHelp(id: string) {
    if (!activeId) return;
    updateAnnotations(activeId, {
      helpRequests: (ann().helpRequests ?? []).map((r) =>
        r.id === id ? { ...r, resolved: true } : r,
      ),
    });
  }

  /* ── Chapter ── */
  function setChapter(text: string) {
    if (!activeId) return;
    updateAnnotations(activeId, { chapter: text });
    setEditingChapter(false);
  }

  /* ── Log ── */
  async function addNote() {
    const t = noteInput.trim();
    if (!t || !activeId) return;
    await hook.addNote(t);
    setNoteInput('');
  }

  /* ═══════════════════════════════════════════════════════════ */
  /* Name setup                                                   */
  /* ═══════════════════════════════════════════════════════════ */
  if (editingMe || !me.name) {
    return (
      <div ref={boardRef} className="mx-auto max-w-md space-y-6 px-4 py-12">
        <div className="text-center space-y-2">
          <p
            style={{
              fontFamily: font,
              fontSize: 22,
              fontWeight: 700,
              fontStyle: 'italic',
              color: '#5C3018',
            }}
          >
            Circles
          </p>
          <p
            className="italic"
            style={{ fontFamily: font, fontSize: 14, color: '#8A6A4A', opacity: 0.8 }}
          >
            coworking with people you trust
          </p>
          <p style={{ fontFamily: font, fontSize: 13, color: '#8A6A4A', opacity: 0.6 }}>
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
              fontSize: 18,
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

  /* ═══════════════════════════════════════════════════════════ */
  /* Circle list                                                  */
  /* ═══════════════════════════════════════════════════════════ */
  if (view === 'list' || !active) {
    return (
      <div ref={boardRef} className="mx-auto max-w-md space-y-6 px-4 py-8">
        <div className="text-center space-y-1">
          <p
            style={{
              fontFamily: font,
              fontSize: 22,
              fontWeight: 700,
              fontStyle: 'italic',
              color: '#C47830',
            }}
          >
            Circles
          </p>
          <p
            className="italic"
            style={{
              fontFamily: font,
              fontSize: 15,
              color: '#7A5438',
              opacity: 0.9,
              maxWidth: 360,
              margin: '0 auto',
              lineHeight: 1.5,
            }}
          >
            a co-working space — share what you're working on and organise missions together.
          </p>
        </div>

        <div className="flex items-center justify-center gap-2">
          <span style={{ fontFamily: font, fontSize: 13, color: '#8A6A4A', opacity: 0.5 }}>
            you are
          </span>
          <button
            type="button"
            onClick={() => {
              setMeNameInput(me.name);
              setEditingMe(true);
            }}
            className="cursor-pointer font-semibold"
            style={{
              fontFamily: font,
              fontSize: 13,
              color: '#5C3018',
              background: 'none',
              border: 'none',
            }}
          >
            {me.name}
          </button>
        </div>

        <div className="rounded-2xl border border-border bg-muted/30 px-4 py-3">
          <button
            type="button"
            onClick={() => setHowOpen((o) => !o)}
            className="flex w-full cursor-pointer items-center justify-between"
            style={{ background: 'none', border: 'none', padding: 0 }}
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
              className="mt-4 space-y-3 animate-in fade-in duration-150"
              style={{ fontFamily: font, fontSize: 14, lineHeight: 1.6, color: '#5C3018' }}
            >
              <p>
                A <strong>Circle</strong> is a small group of people working on something together.
              </p>
              <p>
                Set objectives, claim missions, share what you're on — and ask for help when you
                need it.
              </p>
            </div>
          )}
        </div>

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
                  className="block rounded-full shrink-0"
                  style={{ width: 12, height: 12, background: c.color }}
                />
                <div className="flex-1">
                  <p style={{ fontFamily: font, fontSize: 15, fontWeight: 700, color: '#5C3018' }}>
                    {c.name}
                  </p>
                  <p style={{ fontFamily: font, fontSize: 11, color: '#8A6A4A', opacity: 0.5 }}>
                    {c.members.length} {c.members.length === 1 ? 'member' : 'members'} ·{' '}
                    {c.missions.filter((m) => !m.done).length} active
                  </p>
                </div>
                <div className="flex gap-1">
                  {c.members.map((m) => (
                    <span
                      key={m.id}
                      className="block rounded-full"
                      title={`${m.name}${m.pulse ? ` · ${m.pulse}` : ''}`}
                      style={{
                        width: 8,
                        height: 8,
                        background: m.pulseColor || m.color,
                        opacity: m.pulse ? 0.8 : 0.3,
                      }}
                    />
                  ))}
                </div>
              </button>
            ))}
          </div>
        )}

        {!creating && !joining && (
          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="cursor-pointer rounded-full px-4 py-2 text-[12px] font-semibold transition-all"
              style={{ color: '#C47830', background: '#C4783010', border: '1px solid #C4783030' }}
            >
              create circle
            </button>
            <button
              type="button"
              onClick={() => setJoining(true)}
              className="cursor-pointer rounded-full px-4 py-2 text-[12px] font-semibold transition-all"
              style={{ color: '#8A5A20', background: '#8A5A2010', border: '1px solid #8A5A2030' }}
            >
              join with code
            </button>
          </div>
        )}

        {creating && (
          <div
            className="space-y-3 rounded-2xl border px-4 py-4 animate-in fade-in duration-150"
            style={{ borderColor: '#C4783030', background: '#C4783006' }}
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
                fontSize: 26,
                fontWeight: 700,
                color: '#5C3018',
                borderColor: '#C4783030',
                letterSpacing: '0.04em',
              }}
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={createCircle}
                className="cursor-pointer rounded-full px-4 py-1.5 text-[12px] font-semibold"
                style={{ color: '#C47830', background: '#C4783012', border: '1px solid #C4783030' }}
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

        {joining && (
          <div
            className="space-y-3 rounded-2xl border px-4 py-4 animate-in fade-in duration-150"
            style={{ borderColor: '#8A5A2030', background: '#8A5A2006' }}
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
              style={{ fontFamily: font, fontSize: 18, color: '#5C3018', borderColor: '#8A5A2030' }}
            />
            <div className="flex justify-center gap-2">
              <button
                type="button"
                onClick={joinCircle}
                className="cursor-pointer rounded-full px-4 py-1.5 text-[12px] font-semibold"
                style={{ color: '#8A5A20', background: '#8A5A2012', border: '1px solid #8A5A2030' }}
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
            style={{ fontFamily: font, fontSize: 13, color: '#8A6A4A', opacity: 0.4 }}
          >
            create your first circle to start collaborating
          </p>
        )}
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════ */
  /* Board view                                                   */
  /* ═══════════════════════════════════════════════════════════ */

  const allAnnotations = ann();
  const objectives = allAnnotations.objectives ?? [];
  const missionObjMap = allAnnotations.missionObjectiveMap ?? {};
  const memberStatuses = allAnnotations.memberStatuses ?? [];
  const processEntries = allAnnotations.processEntries ?? [];
  const helpRequests = allAnnotations.helpRequests ?? [];
  const memberMap = new Map(active.members.map((m) => [m.id, m]));

  const myStatus = memberStatuses.find((s) => s.memberId === me.id);
  const myStatusText = myStatus?.text || '';

  /* Feelings — filter out stale entries from previous days */
  const todayISO = todayStart();
  const memberFeelings = (allAnnotations.memberFeelings ?? []).filter(
    (f) => f.sharedAt >= todayISO,
  );
  const myFeeling = memberFeelings.find((f) => f.memberId === me.id);
  const othersfeelings = memberFeelings.filter((f) => f.memberId !== me.id);

  const backlogMissions = active.missions.filter((m) => !m.done && !m.claimedBy);
  const activeMissions = active.missions.filter((m) => !m.done && !!m.claimedBy);
  const doneMissions = active.missions.filter((m) => m.done);

  const missionTabMissions =
    missionTab === 'backlog'
      ? backlogMissions
      : missionTab === 'active'
        ? activeMissions
        : doneMissions;

  const openHelpCount = helpRequests.filter((r) => !r.resolved).length;

  const memberPropsList = active.members.map((m) => ({
    id: m.id,
    name: m.name,
    color: m.pulseColor || m.color,
  }));

  return (
    <div ref={boardRef} className="mx-auto max-w-md space-y-3 pb-5">
      {/* ── Hero image ── */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: 180,
          overflow: 'hidden',
          borderRadius: '0 0 20px 20px',
        }}
      >
        <img
          src={coworkingHero}
          alt=""
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 20%',
            display: 'block',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(to bottom, transparent 20%, var(--background, #150c04) 100%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 14,
            left: 20,
            right: 20,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <p
              style={{
                fontFamily: font,
                fontSize: 9,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: '#8A6A4A',
                opacity: 0.55,
                margin: 0,
              }}
            >
              Circles
            </p>
            <p
              style={{
                fontFamily: font,
                fontSize: 18,
                fontWeight: 700,
                fontStyle: 'italic',
                color: active.color,
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              {active.name}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setView('list')}
            style={{
              fontFamily: font,
              fontSize: 11,
              color: '#8A6A4A',
              opacity: 0.5,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            ‹ back
          </button>
        </div>
      </div>

      <div className="px-4 space-y-3">
        {/* ── Header ── */}
        <div className="flex items-center gap-3">
          <div className="flex-1 text-center">
            {editingChapter ? (
              <input
                type="text"
                value={chapterInput}
                onChange={(e) => setChapterInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setChapter(chapterInput);
                }}
                onBlur={() => setChapter(chapterInput)}
                placeholder="circle subtitle..."
                autoFocus
                className="w-full bg-transparent text-center outline-none placeholder:italic placeholder:text-[#8A6A4A] placeholder:opacity-40"
                style={{ fontFamily: font, fontSize: 12, color: '#8A6A4A' }}
              />
            ) : (
              <div>
                <p style={{ fontFamily: font, fontSize: 16, fontWeight: 700, color: active.color }}>
                  {active.name}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setChapterInput(active.chapter || '');
                    setEditingChapter(true);
                  }}
                  style={{
                    fontFamily: font,
                    fontSize: 11,
                    color: '#8A6A4A',
                    opacity: 0.45,
                    fontStyle: 'italic',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {active.chapter || 'add a subtitle...'}
                </button>
              </div>
            )}
            {!hook.online && (
              <span
                style={{
                  fontFamily: font,
                  fontSize: 9,
                  color: '#8A6A4A',
                  opacity: 0.4,
                  display: 'block',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
              >
                local · will sync when online
              </span>
            )}
          </div>
          <span
            style={{
              fontFamily: font,
              fontSize: 11,
              color: active.color,
              opacity: 0.35,
              letterSpacing: '0.15em',
              flexShrink: 0,
            }}
          >
            {active.code}
          </span>
        </div>

        {/* ── Members strip ── */}
        <div
          style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2, paddingTop: 2 }}
        >
          {active.members.map((m) => {
            const status = memberStatuses.find((s) => s.memberId === m.id);
            const isMe = m.id === me.id;
            return (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  padding: '8px 12px',
                  borderRadius: 12,
                  flexShrink: 0,
                  background: `${m.pulseColor || m.color}08`,
                  border: `1px solid ${m.pulseColor || m.color}${isMe ? '40' : '18'}`,
                  minWidth: 72,
                }}
              >
                <span
                  className="block rounded-full"
                  style={{
                    width: 14,
                    height: 14,
                    background: m.pulseColor || m.color,
                    opacity: m.pulse ? 0.85 : 0.3,
                  }}
                />
                <span
                  style={{
                    fontFamily: font,
                    fontSize: 11,
                    color: '#5C3018',
                    fontWeight: isMe ? 700 : 500,
                  }}
                >
                  {m.name}
                </span>
                {m.pulse && (
                  <span
                    style={{ fontFamily: font, fontSize: 9, color: m.pulseColor, opacity: 0.65 }}
                  >
                    {m.pulse}
                  </span>
                )}
                {status?.text && (
                  <span
                    style={{
                      fontFamily: font,
                      fontSize: 9,
                      color: '#8A6A4A',
                      opacity: 0.55,
                      textAlign: 'center',
                      fontStyle: 'italic',
                      maxWidth: 72,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {status.text}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* ── My Status ── */}
        <div
          style={{
            borderRadius: 10,
            border: '1px solid #C4A06018',
            padding: '8px 14px',
            background: '#C4A06006',
          }}
        >
          {editingMyStatus ? (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                type="text"
                value={myStatusInput}
                onChange={(e) => setMyStatusInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveMyStatus();
                }}
                onBlur={saveMyStatus}
                placeholder="what are you working on right now?"
                autoFocus
                style={{
                  fontFamily: font,
                  fontSize: 12,
                  color: '#5C3018',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  flex: 1,
                  fontStyle: 'italic',
                }}
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setMyStatusInput(myStatusText);
                setEditingMyStatus(true);
              }}
              style={{
                fontFamily: font,
                fontSize: 12,
                color: myStatusText ? '#5C3018' : '#8A6A4A',
                opacity: myStatusText ? 0.8 : 0.4,
                fontStyle: 'italic',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                width: '100%',
                textAlign: 'left',
              }}
            >
              {myStatusText || 'what are you working on right now?'}
            </button>
          )}
        </div>

        {/* ── Feelings ── */}
        <Section
          label="feelings"
          badge={memberFeelings.length || undefined}
          open={openSections.feelings}
          onToggle={() => toggleSection('feelings')}
          accent={active.color}
        >
          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* Others' feelings */}
            {othersfeelings.map((f) => {
              const member = memberMap.get(f.memberId);
              const color = member?.pulseColor || member?.color || active.color;
              return (
                <div
                  key={f.memberId}
                  style={{
                    borderRadius: 10,
                    border: `1px solid ${color}22`,
                    background: `${color}08`,
                    padding: '10px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: color,
                        flexShrink: 0,
                        display: 'inline-block',
                      }}
                    />
                    <span
                      style={{ fontFamily: font, fontSize: 11, color: '#8A6A4A', opacity: 0.6 }}
                    >
                      {f.memberName}
                    </span>
                    <span
                      style={{
                        fontFamily: font,
                        fontSize: 13,
                        fontWeight: 700,
                        color,
                        fontStyle: 'italic',
                        marginLeft: 'auto',
                      }}
                    >
                      {f.word}
                    </span>
                  </div>
                  {f.description && (
                    <p
                      style={{
                        fontFamily: font,
                        fontSize: 12,
                        color: 'var(--palette-panel-text, rgba(196,160,96,0.88))',
                        opacity: 0.7,
                        margin: 0,
                        lineHeight: 1.5,
                        paddingLeft: 16,
                      }}
                    >
                      {f.description}
                    </p>
                  )}
                </div>
              );
            })}

            {/* My feeling */}
            {editingFeeling ? (
              <div
                style={{
                  borderRadius: 10,
                  border: `1px solid ${active.color}30`,
                  padding: '12px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    type="text"
                    value={feelingWord}
                    onChange={(e) => setFeelingWord(e.target.value)}
                    placeholder="one word..."
                    autoFocus
                    style={{
                      fontFamily: font,
                      fontSize: 13,
                      fontWeight: 600,
                      fontStyle: 'italic',
                      color: active.color,
                      background: 'transparent',
                      border: 'none',
                      borderBottom: `1px solid ${active.color}30`,
                      outline: 'none',
                      flex: 1,
                      paddingBottom: 3,
                    }}
                  />
                  <button
                    type="button"
                    onClick={useTodaysMood}
                    style={{
                      fontFamily: font,
                      fontSize: 10,
                      color: active.color,
                      opacity: 0.5,
                      background: 'none',
                      border: `1px solid ${active.color}25`,
                      borderRadius: 999,
                      padding: '3px 10px',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    use today's
                  </button>
                </div>
                <textarea
                  value={feelingDesc}
                  onChange={(e) => setFeelingDesc(e.target.value)}
                  placeholder="a few words about it... (optional)"
                  rows={2}
                  style={{
                    fontFamily: font,
                    fontSize: 12,
                    color: 'var(--palette-panel-text, rgba(196,160,96,0.88))',
                    background: 'transparent',
                    border: `1px solid ${active.color}18`,
                    borderRadius: 8,
                    outline: 'none',
                    padding: '8px 10px',
                    resize: 'none',
                    lineHeight: 1.5,
                  }}
                />
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setEditingFeeling(false)}
                    style={{
                      fontFamily: font,
                      fontSize: 11,
                      color: '#8A6A4A',
                      opacity: 0.45,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    cancel
                  </button>
                  {myFeeling && (
                    <button
                      type="button"
                      onClick={clearMyFeeling}
                      style={{
                        fontFamily: font,
                        fontSize: 11,
                        color: '#8A6A4A',
                        opacity: 0.45,
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      clear
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={saveFeeling}
                    style={{
                      fontFamily: font,
                      fontSize: 11,
                      color: active.color,
                      background: `${active.color}12`,
                      border: `1px solid ${active.color}30`,
                      borderRadius: 999,
                      padding: '4px 16px',
                      cursor: 'pointer',
                    }}
                  >
                    share
                  </button>
                </div>
              </div>
            ) : myFeeling ? (
              <button
                type="button"
                onClick={() => {
                  setFeelingWord(myFeeling.word);
                  setFeelingDesc(myFeeling.description);
                  setEditingFeeling(true);
                }}
                style={{
                  fontFamily: font,
                  fontSize: 12,
                  color: active.color,
                  opacity: 0.75,
                  fontStyle: 'italic',
                  background: `${active.color}08`,
                  border: `1px solid ${active.color}20`,
                  borderRadius: 10,
                  padding: '8px 14px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                }}
              >
                you: <strong>{myFeeling.word}</strong>
                {myFeeling.description ? ` — ${myFeeling.description}` : ''}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setFeelingWord('');
                  setFeelingDesc('');
                  setEditingFeeling(true);
                }}
                style={{
                  fontFamily: font,
                  fontSize: 12,
                  color: '#8A6A4A',
                  opacity: 0.4,
                  fontStyle: 'italic',
                  background: 'none',
                  border: `1px dashed ${active.color}20`,
                  borderRadius: 10,
                  padding: '8px 14px',
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left',
                }}
              >
                + share how you're feeling today
              </button>
            )}
          </div>
        </Section>

        {/* ── Objectives ── */}
        <Section
          label="objectives"
          badge={objectives.length || undefined}
          open={openSections.objectives}
          onToggle={() => toggleSection('objectives')}
          accent={active.color}
        >
          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {objectives.map((obj) => {
              const tagged = active.missions.filter((m) => missionObjMap[m.id] === obj.id);
              const doneCount = tagged.filter((m) => m.done).length;
              const pct = tagged.length > 0 ? Math.round((doneCount / tagged.length) * 100) : 0;
              return (
                <div key={obj.id} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                      style={{
                        flex: 1,
                        fontFamily: font,
                        fontSize: 13,
                        color: '#5C3018',
                        fontWeight: 600,
                      }}
                    >
                      {obj.text}
                    </span>
                    <span
                      style={{ fontFamily: font, fontSize: 10, color: active.color, opacity: 0.6 }}
                    >
                      {pct}%
                    </span>
                    <button
                      type="button"
                      onClick={() => removeObjective(obj.id)}
                      style={{
                        fontFamily: font,
                        fontSize: 11,
                        color: '#8A6A4A',
                        opacity: 0.2,
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      ×
                    </button>
                  </div>
                  <div
                    style={{
                      height: 3,
                      borderRadius: 99,
                      background: `${active.color}18`,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${pct}%`,
                        background: active.color,
                        borderRadius: 99,
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>
                  {tagged.length > 0 && (
                    <p style={{ fontFamily: font, fontSize: 10, color: '#8A6A4A', opacity: 0.45 }}>
                      {doneCount}/{tagged.length} missions done
                    </p>
                  )}
                </div>
              );
            })}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 2 }}>
              <input
                type="text"
                value={objInput}
                onChange={(e) => setObjInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') addObjective();
                }}
                placeholder="+ add objective..."
                style={{
                  fontFamily: font,
                  fontSize: 12,
                  color: '#5C3018',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: `1px solid ${active.color}20`,
                  outline: 'none',
                  flex: 1,
                  paddingBottom: 3,
                  fontStyle: 'italic',
                }}
              />
            </div>
          </div>
        </Section>

        {/* ── Missions ── */}
        <Section
          label="missions"
          badge={`${backlogMissions.length + activeMissions.length} open`}
          open={openSections.missions}
          onToggle={() => toggleSection('missions')}
          accent={active.color}
        >
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, marginTop: 10, marginBottom: 8 }}>
            {(['backlog', 'active', 'done'] as MissionTab[]).map((tab) => {
              const count =
                tab === 'backlog'
                  ? backlogMissions.length
                  : tab === 'active'
                    ? activeMissions.length
                    : doneMissions.length;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setMissionTab(tab)}
                  style={{
                    fontFamily: font,
                    fontSize: 10,
                    fontWeight: missionTab === tab ? 700 : 500,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: missionTab === tab ? active.color : '#8A6A4A',
                    background: missionTab === tab ? `${active.color}12` : 'transparent',
                    border: `1px solid ${missionTab === tab ? `${active.color}40` : '#C4A06020'}`,
                    borderRadius: 99,
                    padding: '3px 10px',
                    cursor: 'pointer',
                  }}
                >
                  {tab} {count > 0 && <span style={{ opacity: 0.6 }}>({count})</span>}
                </button>
              );
            })}
          </div>

          {/* Mission list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {missionTabMissions.length === 0 && (
              <p
                style={{
                  fontFamily: font,
                  fontSize: 12,
                  color: '#8A6A4A',
                  opacity: 0.35,
                  fontStyle: 'italic',
                  textAlign: 'center',
                  padding: '8px 0',
                }}
              >
                {missionTab === 'done' ? 'nothing finished yet' : 'nothing here yet'}
              </p>
            )}
            {missionTabMissions.map((m) => {
              const claimerMember = m.claimedBy ? memberMap.get(m.claimedBy) : null;
              const claimerColor = claimerMember
                ? claimerMember.pulseColor || claimerMember.color
                : active.color;
              const due = dueLabel(m.due);
              const isExpanded = expandedMissionId === m.id;
              const isMine = m.claimedBy === me.id;
              const objId = missionObjMap[m.id];
              const objLabel = objId ? objectives.find((o) => o.id === objId)?.text : null;

              return (
                <div
                  key={m.id}
                  style={{
                    borderRadius: 10,
                    border: `1px solid ${claimerColor}18`,
                    background: `${claimerColor}04`,
                    overflow: 'hidden',
                  }}
                >
                  {/* Main row */}
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px' }}
                  >
                    {/* Tick */}
                    <button
                      type="button"
                      onClick={() => hook.toggleMissionDone(m.id)}
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: 4,
                        flexShrink: 0,
                        cursor: 'pointer',
                        border: `1.5px solid ${claimerColor}50`,
                        background: m.done ? `${claimerColor}30` : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {m.done && <span style={{ fontSize: 9, color: claimerColor }}>✓</span>}
                    </button>

                    {/* Text */}
                    <button
                      type="button"
                      onClick={() => setExpandedMissionId(isExpanded ? null : m.id)}
                      style={{
                        flex: 1,
                        textAlign: 'left',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: font,
                          fontSize: 13,
                          color: m.done ? '#8A6A4A' : '#5C3018',
                          opacity: m.done ? 0.5 : 1,
                          textDecoration: m.done ? 'line-through' : 'none',
                        }}
                      >
                        {m.text}
                      </span>
                    </button>

                    {/* Objective tag */}
                    {objLabel && (
                      <span
                        style={{
                          fontFamily: font,
                          fontSize: 9,
                          color: active.color,
                          opacity: 0.55,
                          background: `${active.color}10`,
                          borderRadius: 99,
                          padding: '1px 6px',
                          flexShrink: 0,
                        }}
                      >
                        {objLabel}
                      </span>
                    )}

                    {/* Due */}
                    {due && (
                      <span
                        style={{
                          fontFamily: font,
                          fontSize: 9,
                          fontWeight: 600,
                          flexShrink: 0,
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

                    {/* Claimer dot */}
                    {claimerMember && (
                      <span
                        className="block rounded-full shrink-0"
                        style={{ width: 8, height: 8, background: claimerColor, opacity: 0.75 }}
                        title={claimerMember.name}
                      />
                    )}

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => hook.removeMission(m.id)}
                      style={{
                        color: '#8A6A4A',
                        opacity: 0.15,
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: 12,
                        flexShrink: 0,
                      }}
                    >
                      ×
                    </button>
                  </div>

                  {/* Expanded panel */}
                  {isExpanded && (
                    <div
                      style={{
                        padding: '0 10px 10px 34px',
                        borderTop: `1px solid ${claimerColor}12`,
                        background: `${claimerColor}06`,
                      }}
                      className="animate-in fade-in duration-150"
                    >
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 6,
                          paddingTop: 8,
                          paddingBottom: 8,
                        }}
                      >
                        {/* Claim */}
                        <button
                          type="button"
                          onClick={() => hook.claimMission(m.id)}
                          style={{
                            fontFamily: font,
                            fontSize: 10,
                            fontWeight: 600,
                            letterSpacing: '0.06em',
                            borderRadius: 99,
                            padding: '3px 10px',
                            cursor: 'pointer',
                            background: isMine ? `${claimerColor}20` : 'transparent',
                            border: `1px solid ${claimerColor}40`,
                            color: claimerColor,
                          }}
                        >
                          {isMine ? "✓ I'm on it" : "I'm on it"}
                        </button>

                        {/* Assign to */}
                        {assigningMission === m.id ? (
                          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                            {active.members.map((member) => (
                              <button
                                key={member.id}
                                type="button"
                                onClick={() => assignMissionTo(m.id, member.id)}
                                title={member.name}
                                style={{
                                  width: 14,
                                  height: 14,
                                  borderRadius: '50%',
                                  background: member.pulseColor || member.color,
                                  border: 'none',
                                  cursor: 'pointer',
                                }}
                              />
                            ))}
                            <button
                              type="button"
                              onClick={() => setAssigningMission(null)}
                              style={{
                                fontSize: 9,
                                color: '#8A6A4A',
                                opacity: 0.35,
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                              }}
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setAssigningMission(m.id)}
                            style={{
                              fontFamily: font,
                              fontSize: 10,
                              borderRadius: 99,
                              padding: '3px 10px',
                              color: '#8A6A4A',
                              opacity: 0.5,
                              background: '#C4A06008',
                              border: '1px solid #C4A06018',
                              cursor: 'pointer',
                            }}
                          >
                            assign
                          </button>
                        )}

                        {/* Tag objective */}
                        {objectives.length > 0 &&
                          (taggingMission === m.id ? (
                            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                              <button
                                type="button"
                                onClick={() => tagMission(m.id, null)}
                                style={{
                                  fontFamily: font,
                                  fontSize: 9,
                                  borderRadius: 99,
                                  padding: '2px 8px',
                                  color: '#8A6A4A',
                                  opacity: 0.5,
                                  background: 'transparent',
                                  border: '1px solid #C4A06020',
                                  cursor: 'pointer',
                                }}
                              >
                                no objective
                              </button>
                              {objectives.map((obj) => (
                                <button
                                  key={obj.id}
                                  type="button"
                                  onClick={() => tagMission(m.id, obj.id)}
                                  style={{
                                    fontFamily: font,
                                    fontSize: 9,
                                    borderRadius: 99,
                                    padding: '2px 8px',
                                    color: active.color,
                                    background: `${active.color}10`,
                                    border: `1px solid ${active.color}30`,
                                    cursor: 'pointer',
                                  }}
                                >
                                  {obj.text}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setTaggingMission(m.id)}
                              style={{
                                fontFamily: font,
                                fontSize: 10,
                                borderRadius: 99,
                                padding: '3px 10px',
                                color: active.color,
                                opacity: 0.5,
                                background: `${active.color}06`,
                                border: `1px solid ${active.color}20`,
                                cursor: 'pointer',
                              }}
                            >
                              {objLabel || 'tag objective'}
                            </button>
                          ))}

                        {/* Due date */}
                        <input
                          type="date"
                          value={m.due ? m.due.slice(0, 10) : ''}
                          onChange={(e) => hook.setMissionDue(m.id, e.target.value || null)}
                          style={{
                            fontFamily: font,
                            fontSize: 10,
                            color: '#7A5438',
                            background: 'transparent',
                            borderRadius: 99,
                            padding: '3px 8px',
                            border: '1px solid #C4A06030',
                            outline: 'none',
                          }}
                          title="Set due date"
                        />
                      </div>

                      {/* Notes thread */}
                      {(m.notes || []).map((n) => (
                        <div key={n.id} style={{ marginBottom: 6 }}>
                          <span
                            style={{
                              fontFamily: font,
                              fontSize: 10,
                              fontWeight: 600,
                              color: claimerColor,
                              opacity: 0.7,
                            }}
                          >
                            {n.authorName}{' '}
                          </span>
                          <span
                            style={{
                              fontFamily: font,
                              fontSize: 11,
                              color: '#5C3018',
                              opacity: 0.8,
                            }}
                          >
                            {n.text}
                          </span>
                        </div>
                      ))}
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
                        style={{
                          fontFamily: font,
                          fontSize: 11,
                          color: '#5C3018',
                          background: 'transparent',
                          border: 'none',
                          borderBottom: `1px solid ${claimerColor}20`,
                          outline: 'none',
                          width: '100%',
                          paddingBottom: 3,
                          fontStyle: 'italic',
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add mission */}
          <div
            style={{
              display: 'flex',
              gap: 8,
              alignItems: 'center',
              marginTop: 10,
              flexWrap: 'wrap',
            }}
          >
            <input
              type="text"
              value={missionInput}
              onChange={(e) => setMissionInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') addMission();
              }}
              placeholder="+ add mission..."
              style={{
                fontFamily: font,
                fontSize: 13,
                color: '#5C3018',
                background: 'transparent',
                border: 'none',
                borderBottom: `1px solid ${active.color}20`,
                outline: 'none',
                flex: 1,
                paddingBottom: 4,
                minWidth: 150,
                fontStyle: 'italic',
              }}
            />
            <input
              type="date"
              value={missionDueInput}
              onChange={(e) => setMissionDueInput(e.target.value)}
              style={{
                fontFamily: font,
                fontSize: 10,
                color: '#7A5438',
                background: 'transparent',
                borderRadius: 99,
                padding: '3px 8px',
                border: `1px solid ${active.color}25`,
                outline: 'none',
              }}
              title="Optional due date"
            />
            {missionInput.trim() && (
              <button
                type="button"
                onClick={addMission}
                style={{
                  fontFamily: font,
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: active.color,
                  background: `${active.color}10`,
                  border: `1px solid ${active.color}40`,
                  borderRadius: 99,
                  padding: '4px 12px',
                  cursor: 'pointer',
                }}
              >
                add
              </button>
            )}
          </div>
        </Section>

        {/* ── In the Process ── */}
        <Section
          label="in the process"
          badge={processEntries.length || undefined}
          open={openSections.process}
          onToggle={() => toggleSection('process')}
          accent="#9B7A40"
        >
          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <span
                className="block rounded-full shrink-0 mt-1"
                style={{
                  width: 8,
                  height: 8,
                  background:
                    active.members.find((m) => m.id === me.id)?.pulseColor || active.color,
                  opacity: 0.6,
                }}
              />
              <input
                type="text"
                value={processInput}
                onChange={(e) => setProcessInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') addProcessEntry();
                }}
                placeholder="share a process reflection or update..."
                style={{
                  fontFamily: font,
                  fontSize: 12,
                  color: '#5C3018',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: '1px solid #C4A06018',
                  outline: 'none',
                  flex: 1,
                  paddingBottom: 3,
                  fontStyle: 'italic',
                }}
              />
            </div>
            {processEntries.map((e) => {
              const author = memberMap.get(e.authorId);
              return (
                <div key={e.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span
                    className="block rounded-full shrink-0 mt-1"
                    style={{
                      width: 8,
                      height: 8,
                      background: author?.pulseColor || author?.color || '#C4A060',
                      opacity: 0.6,
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <span
                      style={{
                        fontFamily: font,
                        fontSize: 10,
                        fontWeight: 600,
                        color: '#8A6A4A',
                        opacity: 0.6,
                      }}
                    >
                      {e.authorName}{' '}
                    </span>
                    <span
                      style={{ fontFamily: font, fontSize: 10, color: '#8A6A4A', opacity: 0.4 }}
                    >
                      {timeAgo(e.createdAt)}
                    </span>
                    <p
                      style={{
                        fontFamily: font,
                        fontSize: 13,
                        color: '#5C3018',
                        opacity: 0.85,
                        fontStyle: 'italic',
                        marginTop: 2,
                        lineHeight: 1.5,
                      }}
                    >
                      {e.text}
                    </p>
                  </div>
                  {e.authorId === me.id && (
                    <button
                      type="button"
                      onClick={() => removeProcessEntry(e.id)}
                      style={{
                        fontSize: 11,
                        color: '#8A6A4A',
                        opacity: 0.2,
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        flexShrink: 0,
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>
              );
            })}
            {processEntries.length === 0 && (
              <p
                style={{
                  fontFamily: font,
                  fontSize: 12,
                  color: '#8A6A4A',
                  opacity: 0.3,
                  fontStyle: 'italic',
                }}
              >
                share what you're learning or figuring out as you go
              </p>
            )}
          </div>
        </Section>

        {/* ── Help Needed ── */}
        <Section
          label="help needed"
          badge={openHelpCount > 0 ? openHelpCount : undefined}
          open={openSections.help}
          onToggle={() => toggleSection('help')}
          accent="#B33A2B"
        >
          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 11, opacity: 0.4, flexShrink: 0, marginTop: 2 }}>🚩</span>
              <input
                type="text"
                value={helpInput}
                onChange={(e) => setHelpInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') addHelpRequest();
                }}
                placeholder="what are you blocked on?"
                style={{
                  fontFamily: font,
                  fontSize: 12,
                  color: '#5C3018',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: '1px solid #B33A2B20',
                  outline: 'none',
                  flex: 1,
                  paddingBottom: 3,
                  fontStyle: 'italic',
                }}
              />
            </div>
            {helpRequests.map((r) => {
              const author = memberMap.get(r.authorId);
              const iHelp = r.helpers.includes(me.id);
              return (
                <div
                  key={r.id}
                  style={{
                    display: 'flex',
                    gap: 10,
                    alignItems: 'flex-start',
                    padding: '8px 10px',
                    borderRadius: 10,
                    background: r.resolved ? '#7AAA5808' : '#B33A2B08',
                    border: `1px solid ${r.resolved ? '#7AAA5820' : '#B33A2B20'}`,
                    opacity: r.resolved ? 0.5 : 1,
                  }}
                >
                  <span
                    className="block rounded-full shrink-0 mt-1"
                    style={{
                      width: 8,
                      height: 8,
                      background: author?.pulseColor || author?.color || '#C4A060',
                      opacity: 0.6,
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <span
                      style={{
                        fontFamily: font,
                        fontSize: 10,
                        fontWeight: 600,
                        color: '#8A6A4A',
                        opacity: 0.6,
                      }}
                    >
                      {r.authorName}{' '}
                    </span>
                    <span
                      style={{ fontFamily: font, fontSize: 10, color: '#8A6A4A', opacity: 0.4 }}
                    >
                      {timeAgo(r.createdAt)}
                    </span>
                    <p
                      style={{
                        fontFamily: font,
                        fontSize: 13,
                        color: '#5C3018',
                        opacity: 0.9,
                        marginTop: 2,
                        lineHeight: 1.5,
                      }}
                    >
                      {r.text}
                    </p>
                    {!r.resolved && (
                      <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                        <button
                          type="button"
                          onClick={() => toggleHelper(r.id)}
                          style={{
                            fontFamily: font,
                            fontSize: 10,
                            borderRadius: 99,
                            padding: '2px 10px',
                            cursor: 'pointer',
                            background: iHelp ? '#B33A2B18' : 'transparent',
                            border: `1px solid ${iHelp ? '#B33A2B50' : '#C4A06025'}`,
                            color: iHelp ? '#B33A2B' : '#8A6A4A',
                          }}
                        >
                          {iHelp ? "✓ I'll help" : "I'll help"}
                          {r.helpers.length > 0 && (
                            <span style={{ opacity: 0.55 }}> ({r.helpers.length})</span>
                          )}
                        </button>
                        {r.authorId === me.id && (
                          <button
                            type="button"
                            onClick={() => resolveHelp(r.id)}
                            style={{
                              fontFamily: font,
                              fontSize: 10,
                              borderRadius: 99,
                              padding: '2px 10px',
                              cursor: 'pointer',
                              background: '#7AAA5812',
                              border: '1px solid #7AAA5840',
                              color: '#7AAA58',
                            }}
                          >
                            resolved
                          </button>
                        )}
                      </div>
                    )}
                    {r.resolved && (
                      <span
                        style={{ fontFamily: font, fontSize: 10, color: '#7AAA58', opacity: 0.6 }}
                      >
                        ✓ resolved
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            {helpRequests.length === 0 && (
              <p
                style={{
                  fontFamily: font,
                  fontSize: 12,
                  color: '#8A6A4A',
                  opacity: 0.3,
                  fontStyle: 'italic',
                }}
              >
                ask for help — someone will step in
              </p>
            )}
          </div>
        </Section>

        {/* ── Extras (agenda + extra circle tools) ── */}
        <Section
          label="more"
          open={openSections.extras}
          onToggle={() => toggleSection('extras')}
          accent="#7A8A6A"
        >
          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <CircleAgenda
              missions={active.missions}
              members={memberPropsList}
              onTapMission={(id) => setExpandedMissionId(id)}
            />
            <CircleSparks circleId={active.id} meId={me.id} circleColor={active.color} />
            <CircleEvents
              circleId={active.id}
              meId={me.id}
              meName={me.name}
              members={memberPropsList}
            />
            <CircleDecisions
              circleId={active.id}
              meId={me.id}
              meName={me.name}
              members={memberPropsList}
            />
            <CircleMoney
              circleId={active.id}
              meId={me.id}
              meName={me.name}
              members={memberPropsList}
            />
            <CircleAudio
              circleId={active.id}
              meId={me.id}
              meName={me.name}
              meColour={active.members.find((m) => m.id === me.id)?.color || active.color}
            />
            <CircleRainbow
              circleId={active.id}
              meId={me.id}
              meName={me.name}
              meColour={active.members.find((m) => m.id === me.id)?.color || active.color}
            />
          </div>
        </Section>

        {/* ── Log ── */}
        <Section
          label="log"
          badge={active.notes.length > 0 ? active.notes.length : undefined}
          open={openSections.log}
          onToggle={() => toggleSection('log')}
          accent="#8A8A8A"
        >
          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') addNote();
                }}
                placeholder="share a note..."
                style={{
                  fontFamily: font,
                  fontSize: 13,
                  color: '#5C3018',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: '1px solid #C4A06018',
                  outline: 'none',
                  flex: 1,
                  paddingBottom: 4,
                }}
              />
            </div>
            {active.notes.slice(0, 25).map((n) => (
              <div key={n.id}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 2 }}>
                  <span
                    style={{
                      fontFamily: font,
                      fontSize: 11,
                      fontWeight: 600,
                      color: '#5C3018',
                      opacity: 0.7,
                    }}
                  >
                    {n.authorName}
                  </span>
                  <span style={{ fontFamily: font, fontSize: 10, color: '#8A6A4A', opacity: 0.35 }}>
                    {new Date(n.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p
                  style={{
                    fontFamily: font,
                    fontSize: 13,
                    color: '#5C3018',
                    opacity: 0.85,
                    lineHeight: 1.5,
                    wordBreak: 'break-word',
                  }}
                >
                  {n.text}
                </p>
              </div>
            ))}
            {active.notes.length === 0 && (
              <p
                style={{
                  fontFamily: font,
                  fontSize: 12,
                  color: '#8A6A4A',
                  opacity: 0.3,
                  fontStyle: 'italic',
                  textAlign: 'center',
                }}
              >
                no notes yet
              </p>
            )}
          </div>
        </Section>
      </div>
    </div>
  );
}

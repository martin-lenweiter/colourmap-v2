'use client';

import { useCallback, useEffect, useState } from 'react';

/*
 * useCircles — client hook that wraps the Supabase-backed
 * /api/circles routes with optimistic updates + a localStorage
 * cache fallback.
 *
 * Per Martin (2026-04-26): "all cicles needs supabase wire up."
 *
 * Data flow:
 *  1. On mount: read cached circles from localStorage (instant
 *     paint, even offline).
 *  2. In parallel: GET /api/circles → list of circles with members.
 *     For each, GET /api/circles/[id] → full detail (missions +
 *     notes). Replace cache with fresh API data on success.
 *  3. Mutations (createCircle, joinCircle, addMission, etc.)
 *     update local state optimistically and call the right API
 *     endpoint. On failure the optimistic update stays (so the
 *     user isn't blocked) and the call can be retried.
 *
 * The "me" identity:
 *  - Server: real auth user.id (read once via /api/auth/me — or
 *    inferred from the first circle the user is a member of).
 *  - localStorage cache stores `colourmap:circle-me` = { id, name }
 *    purely as the user-typed display name. The id field is
 *    overridden by the real user.id on first successful list.
 */

const LS_CIRCLES = 'colourmap:circles';
const LS_ACTIVE = 'colourmap:active-circle';
const LS_ME = 'colourmap:circle-me';

export interface CircleMember {
  id: string;
  circleId: string;
  userId: string;
  name: string;
  color: string;
  pulse?: string | null;
  pulseColor?: string | null;
  sharePulse?: boolean;
  joinedAt?: string;
}

export interface CircleMission {
  id: string;
  circleId: string;
  text: string;
  claimedBy?: string | null;
  done: boolean;
  dueDate?: string | null;
  createdBy: string;
  createdAt?: string;
}

export interface CircleNote {
  id: string;
  circleId: string;
  authorId: string;
  authorName: string;
  text: string;
  sessionId?: string | null;
  createdAt: string;
}

export interface CircleSession {
  id: string;
  circleId: string;
  startedBy: string;
  startedAt: string;
  endedAt?: string | null;
  summary?: string | null;
}

export interface CircleDetail {
  id: string;
  name: string;
  code: string;
  color: string;
  createdBy: string;
  createdAt?: string;
  members: CircleMember[];
  missions: CircleMission[];
  notes: CircleNote[];
  activeSession?: CircleSession | null;
}

export interface MeIdentity {
  id: string;
  name: string;
}

interface CachedShape {
  circles: CircleDetail[];
  activeId: string | null;
  me: MeIdentity;
}

function loadJSON<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function persistJSON(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* silent — quota exceeded should not break UX */
  }
}

async function jsonFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) {
    let body = '';
    try {
      body = await res.text();
    } catch {
      /* silent */
    }
    throw new Error(`${res.status} ${res.statusText} — ${body}`);
  }
  return (await res.json()) as T;
}

export interface UseCircles {
  circles: CircleDetail[];
  activeId: string | null;
  active: CircleDetail | null;
  me: MeIdentity;
  loading: boolean;
  error: string | null;
  online: boolean;
  setMyName: (name: string) => void;
  refresh: () => Promise<void>;
  selectCircle: (id: string | null) => void;
  createCircle: (name: string) => Promise<CircleDetail | null>;
  joinCircle: (code: string) => Promise<CircleDetail | null>;
  addMission: (text: string, dueDate?: string | null) => Promise<void>;
  toggleMissionDone: (missionId: string) => Promise<void>;
  claimMission: (missionId: string) => Promise<void>;
  setMissionDue: (missionId: string, dueDate: string | null) => Promise<void>;
  removeMission: (missionId: string) => Promise<void>;
  addNote: (text: string) => Promise<void>;
  setMyPulse: (pulse: string, pulseColor: string) => Promise<void>;
}

const DEFAULT_ME: MeIdentity = { id: '', name: '' };

export function useCircles(): UseCircles {
  const [circles, setCircles] = useState<CircleDetail[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [me, setMe] = useState<MeIdentity>(DEFAULT_ME);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [online, setOnline] = useState(true);

  // Hydrate from localStorage instantly so the UI paints with
  // last-known data even if the API is slow / offline.
  useEffect(() => {
    const cached = loadJSON<CachedShape>(LS_CIRCLES, {
      circles: [],
      activeId: null,
      me: DEFAULT_ME,
    });
    if (Array.isArray(cached.circles)) {
      setCircles(
        cached.circles.map((c) => ({
          ...c,
          members: c.members ?? [],
          missions: c.missions ?? [],
          notes: c.notes ?? [],
          activeSession: c.activeSession ?? null,
        })),
      );
    }
    setActiveId(loadJSON<string | null>(LS_ACTIVE, cached.activeId ?? null));
    const cachedMe = loadJSON<MeIdentity>(LS_ME, cached.me);
    setMe(cachedMe);
  }, []);

  // Persist whenever state mutates.
  useEffect(() => {
    persistJSON(LS_CIRCLES, { circles, activeId, me });
  }, [circles, activeId, me]);
  useEffect(() => {
    if (activeId) persistJSON(LS_ACTIVE, activeId);
  }, [activeId]);
  useEffect(() => {
    persistJSON(LS_ME, me);
  }, [me]);

  const refresh = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      // GET /api/circles returns Circle + members.
      const summaries =
        await jsonFetch<(CircleDetail & { members?: CircleMember[] })[]>('/api/circles');
      // For each, fetch full detail (missions + notes + activeSession).
      const detailed = await Promise.all(
        summaries.map(async (s) => {
          try {
            return await jsonFetch<CircleDetail>(`/api/circles/${s.id}`);
          } catch {
            // If detail fetch fails, keep the summary (members) + empty
            // missions/notes.
            return { ...s, missions: [], notes: [], activeSession: null } as CircleDetail;
          }
        }),
      );
      setCircles(detailed);
      // Pick up real auth user id from the first circle's membership.
      if (detailed.length > 0) {
        const myMember = detailed[0].members.find((m) =>
          // The first member of a brand-new circle is the user themselves.
          // For subsequent fetches, find the member whose name matches
          // the local `me.name`.
          me.name ? m.name === me.name : true,
        );
        if (myMember && myMember.userId !== me.id) {
          setMe((prev) => ({ ...prev, id: myMember.userId }));
        }
      }
      setOnline(true);
    } catch (err) {
      setError((err as Error).message);
      setOnline(false);
    } finally {
      setLoading(false);
    }
  }, [me.name, me.id]);

  // Initial fetch on mount. We deliberately omit `refresh` from
  // deps so we only fetch once; refresh's identity changes when
  // me.name/me.id changes but we don't want a refetch loop.
  // biome-ignore lint/correctness/useExhaustiveDependencies: run once on mount
  useEffect(() => {
    void refresh();
  }, []);

  const setMyName = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setMe((prev) => ({ ...prev, name: trimmed, id: prev.id || crypto.randomUUID() }));
  }, []);

  const selectCircle = useCallback((id: string | null) => {
    setActiveId(id);
    if (id) persistJSON(LS_ACTIVE, id);
  }, []);

  const createCircle = useCallback(
    async (name: string): Promise<CircleDetail | null> => {
      const trimmed = name.trim();
      if (!trimmed || !me.name) return null;
      try {
        const { circle, member } = await jsonFetch<{
          circle: { id: string; name: string; code: string; color: string; createdBy: string };
          member: CircleMember;
        }>('/api/circles', {
          method: 'POST',
          body: JSON.stringify({ name: trimmed, userName: me.name }),
        });
        const detail: CircleDetail = {
          ...circle,
          members: [member],
          missions: [],
          notes: [],
        };
        setCircles((prev) => [...prev, detail]);
        setMe((prev) => ({ ...prev, id: member.userId }));
        selectCircle(circle.id);
        return detail;
      } catch {
        // API unavailable — create circle locally so the user can work solo
        const localId = crypto.randomUUID();
        const code = Array.from(
          { length: 6 },
          () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)],
        ).join('');
        const palette = ['#D4805A', '#6890B0', '#7AAA58', '#9B6BA0', '#C4A060', '#5A8AAA'];
        const color = palette[Math.floor(Math.random() * palette.length)];
        const myId = me.id || crypto.randomUUID();
        const localMember: CircleMember = {
          id: myId,
          circleId: localId,
          userId: myId,
          name: me.name,
          color: '#C4A060',
          joinedAt: new Date().toISOString(),
        };
        const detail: CircleDetail = {
          id: localId,
          name: trimmed,
          code,
          color,
          createdBy: myId,
          createdAt: new Date().toISOString(),
          members: [localMember],
          missions: [],
          notes: [],
        };
        setCircles((prev) => [...prev, detail]);
        if (!me.id) setMe((prev) => ({ ...prev, id: myId }));
        setOnline(false);
        selectCircle(localId);
        return detail;
      }
    },
    [me.name, me.id, selectCircle],
  );

  const joinCircle = useCallback(
    async (code: string): Promise<CircleDetail | null> => {
      const trimmed = code.trim().toUpperCase();
      if (!trimmed || !me.name) return null;
      try {
        const { circle } = await jsonFetch<{ circle: { id: string } }>('/api/circles/join', {
          method: 'POST',
          body: JSON.stringify({ code: trimmed, userName: me.name }),
        });
        // Fetch full detail for the joined circle.
        const detail = await jsonFetch<CircleDetail>(`/api/circles/${circle.id}`);
        setCircles((prev) => {
          const without = prev.filter((c) => c.id !== detail.id);
          return [...without, detail];
        });
        // Capture real user id.
        const myMember = detail.members.find((m) => m.name === me.name);
        if (myMember) setMe((prev) => ({ ...prev, id: myMember.userId }));
        selectCircle(detail.id);
        return detail;
      } catch (err) {
        setError((err as Error).message);
        return null;
      }
    },
    [me.name, selectCircle],
  );

  const addMission = useCallback(
    async (text: string, dueDate?: string | null) => {
      const trimmed = text.trim();
      if (!trimmed || !activeId) return;
      // Optimistic local add — works offline too
      const localMission: CircleMission = {
        id: crypto.randomUUID(),
        circleId: activeId,
        text: trimmed,
        done: false,
        claimedBy: null,
        dueDate: dueDate || null,
        createdBy: me.id,
        createdAt: new Date().toISOString(),
      };
      setCircles((prev) =>
        prev.map((c) =>
          c.id === activeId ? { ...c, missions: [...c.missions, localMission] } : c,
        ),
      );
      try {
        const mission = await jsonFetch<CircleMission>(`/api/circles/${activeId}/missions`, {
          method: 'POST',
          body: JSON.stringify({ text: trimmed, dueDate: dueDate || undefined }),
        });
        // Replace local placeholder with the server-assigned record
        setCircles((prev) =>
          prev.map((c) =>
            c.id === activeId
              ? { ...c, missions: c.missions.map((m) => (m.id === localMission.id ? mission : m)) }
              : c,
          ),
        );
      } catch {
        setOnline(false);
      }
    },
    [activeId, me.id],
  );

  const patchMission = useCallback(
    async (
      missionId: string,
      patch: { done?: boolean; claimedBy?: string | null; text?: string; dueDate?: string | null },
    ) => {
      if (!activeId) return;
      // Optimistic update.
      setCircles((prev) =>
        prev.map((c) =>
          c.id === activeId
            ? {
                ...c,
                missions: c.missions.map((m) => (m.id === missionId ? { ...m, ...patch } : m)),
              }
            : c,
        ),
      );
      try {
        await jsonFetch<CircleMission>(`/api/circles/${activeId}/missions/${missionId}`, {
          method: 'PATCH',
          body: JSON.stringify(patch),
        });
      } catch (err) {
        setError((err as Error).message);
      }
    },
    [activeId],
  );

  const toggleMissionDone = useCallback(
    async (missionId: string) => {
      const c = circles.find((cc) => cc.id === activeId);
      const m = c?.missions.find((mm) => mm.id === missionId);
      if (!m) return;
      await patchMission(missionId, { done: !m.done });
    },
    [activeId, circles, patchMission],
  );

  const claimMission = useCallback(
    async (missionId: string) => {
      const c = circles.find((cc) => cc.id === activeId);
      const m = c?.missions.find((mm) => mm.id === missionId);
      if (!m) return;
      const next = m.claimedBy === me.id ? null : me.id;
      await patchMission(missionId, { claimedBy: next });
    },
    [activeId, circles, me.id, patchMission],
  );

  const setMissionDue = useCallback(
    async (missionId: string, dueDate: string | null) => {
      await patchMission(missionId, { dueDate });
    },
    [patchMission],
  );

  const removeMission = useCallback(
    async (missionId: string) => {
      if (!activeId) return;
      // Optimistic remove.
      setCircles((prev) =>
        prev.map((c) =>
          c.id === activeId ? { ...c, missions: c.missions.filter((m) => m.id !== missionId) } : c,
        ),
      );
      try {
        await jsonFetch<{ ok: boolean }>(`/api/circles/${activeId}/missions/${missionId}`, {
          method: 'DELETE',
        });
      } catch (err) {
        setError((err as Error).message);
      }
    },
    [activeId],
  );

  const addNote = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || !activeId || !me.name) return;
      const localNote: CircleNote = {
        id: crypto.randomUUID(),
        circleId: activeId,
        authorId: me.id,
        authorName: me.name,
        text: trimmed,
        createdAt: new Date().toISOString(),
      };
      setCircles((prev) =>
        prev.map((c) =>
          c.id === activeId ? { ...c, notes: [localNote, ...c.notes].slice(0, 100) } : c,
        ),
      );
      try {
        const note = await jsonFetch<CircleNote>(`/api/circles/${activeId}/notes`, {
          method: 'POST',
          body: JSON.stringify({ text: trimmed, authorName: me.name }),
        });
        setCircles((prev) =>
          prev.map((c) =>
            c.id === activeId
              ? { ...c, notes: c.notes.map((n) => (n.id === localNote.id ? note : n)) }
              : c,
          ),
        );
      } catch {
        setOnline(false);
      }
    },
    [activeId, me.id, me.name],
  );

  const setMyPulse = useCallback(
    async (pulse: string, pulseColor: string) => {
      if (!activeId) return;
      try {
        const member = await jsonFetch<CircleMember>(`/api/circles/${activeId}/pulse`, {
          method: 'PATCH',
          body: JSON.stringify({ pulse, pulseColor }),
        });
        setCircles((prev) =>
          prev.map((c) =>
            c.id === activeId
              ? {
                  ...c,
                  members: c.members.map((m) => (m.id === member.id ? { ...m, ...member } : m)),
                }
              : c,
          ),
        );
      } catch (err) {
        setError((err as Error).message);
      }
    },
    [activeId],
  );

  const active = circles.find((c) => c.id === activeId) ?? null;

  return {
    circles,
    activeId,
    active,
    me,
    loading,
    error,
    online,
    setMyName,
    refresh,
    selectCircle,
    createCircle,
    joinCircle,
    addMission,
    toggleMissionDone,
    claimMission,
    setMissionDue,
    removeMission,
    addNote,
    setMyPulse,
  };
}

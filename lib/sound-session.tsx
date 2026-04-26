'use client';

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

/*
 * SoundSessionProvider — small reactive store that tracks "what
 * music tool is the user currently engaged with" so a global
 * MiniPlayer can show a pill when they wander away to other
 * pages.
 *
 * V1 honest scope:
 *  - Each music tool (Chill / Groove / Maker / Looper) calls
 *    `useSoundSession().setActive('chill-machine', meta)` when
 *    its play button is pressed.
 *  - The tool calls `setPlaying(true|false)` on play/pause.
 *  - The tool calls `clear()` when the user closes / unmounts.
 *  - The MiniPlayer reads `activeTool` + `isPlaying` and renders
 *    a pill on every page *except* /sounds (where the tool
 *    itself is visible). Tap the pill → navigates back to
 *    /sounds and auto-selects the right tab.
 *
 * What this V1 does NOT do:
 *  - It does not keep the AudioContext alive across navigation.
 *    When the tool unmounts, audio stops. The pill becomes a
 *    "tap to resume" affordance, not a true persistent player.
 *  - True persistence (audio survives navigation) would need the
 *    AudioContext to live here in the provider rather than in
 *    each tool. That's a larger refactor — spec'd in
 *    docs/specs/global-mini-player.md, slated for a follow-up.
 *
 * State is also mirrored to localStorage so reload / fresh-page
 * still surfaces "you were just in Chill Machine" correctly.
 */

export type SoundToolId = 'chill-machine' | 'groove-machine' | 'magic-maker' | 'lofi-looper';

const TOOL_LABELS: Record<SoundToolId, string> = {
  'chill-machine': 'Chill Machine',
  'groove-machine': 'Groove Machine',
  'magic-maker': 'Magic Maker',
  'lofi-looper': 'Lo-fi Looper',
};

const TOOL_COLOURS: Record<SoundToolId, string> = {
  'chill-machine': '#C4A060',
  'groove-machine': '#3A6890',
  'magic-maker': '#9B6BA0',
  'lofi-looper': '#7A3850',
};

const TOOL_SOUNDLAB_TAB: Record<SoundToolId, string> = {
  'chill-machine': 'tuner',
  'groove-machine': 'groove',
  'magic-maker': 'maker',
  'lofi-looper': 'looper',
};

const LS_SESSION_KEY = 'colourmap:sound-session';

interface SoundSessionState {
  activeTool: SoundToolId | null;
  isPlaying: boolean;
  /** Optional one-line meta — e.g. "528Hz · Sun-up Funk · 112bpm" */
  meta: string;
  /** Last engaged at — used so the pill auto-fades after a long
   *  idle period (24h). */
  lastActiveAt: string | null;
}

interface SoundSessionContextValue extends SoundSessionState {
  setActive: (tool: SoundToolId, meta?: string) => void;
  setPlaying: (playing: boolean) => void;
  setMeta: (meta: string) => void;
  clear: () => void;
}

const initialState: SoundSessionState = {
  activeTool: null,
  isPlaying: false,
  meta: '',
  lastActiveAt: null,
};

const SoundSessionContext = createContext<SoundSessionContextValue | null>(null);

function loadFromStorage(): SoundSessionState {
  if (typeof window === 'undefined') return initialState;
  try {
    const raw = localStorage.getItem(LS_SESSION_KEY);
    if (!raw) return initialState;
    const parsed = JSON.parse(raw) as Partial<SoundSessionState>;
    if (parsed.activeTool && parsed.activeTool in TOOL_LABELS) {
      // Don't restore "isPlaying" across reloads — audio always
      // stops on reload. Restore the tool name so the pill says
      // "tap to resume Chill Machine" but not "playing now."
      return {
        activeTool: parsed.activeTool as SoundToolId,
        isPlaying: false,
        meta: typeof parsed.meta === 'string' ? parsed.meta : '',
        lastActiveAt: typeof parsed.lastActiveAt === 'string' ? parsed.lastActiveAt : null,
      };
    }
  } catch {
    /* silent */
  }
  return initialState;
}

function persist(state: SoundSessionState) {
  try {
    localStorage.setItem(LS_SESSION_KEY, JSON.stringify(state));
  } catch {
    /* silent */
  }
}

export function SoundSessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SoundSessionState>(initialState);

  // Hydrate from localStorage on mount.
  useEffect(() => {
    const restored = loadFromStorage();
    // If the last active was more than 24h ago, drop it — the
    // pill shouldn't haunt the user a day later.
    if (restored.lastActiveAt) {
      const age = Date.now() - new Date(restored.lastActiveAt).getTime();
      if (age > 24 * 60 * 60 * 1000) {
        setState(initialState);
        persist(initialState);
        return;
      }
    }
    setState(restored);
  }, []);

  const setActive = useCallback((tool: SoundToolId, meta = '') => {
    setState((prev) => {
      const next: SoundSessionState = {
        activeTool: tool,
        isPlaying: prev.activeTool === tool ? prev.isPlaying : true,
        meta,
        lastActiveAt: new Date().toISOString(),
      };
      persist(next);
      return next;
    });
  }, []);

  const setPlaying = useCallback((playing: boolean) => {
    setState((prev) => {
      const next: SoundSessionState = {
        ...prev,
        isPlaying: playing,
        lastActiveAt: playing ? new Date().toISOString() : prev.lastActiveAt,
      };
      persist(next);
      return next;
    });
  }, []);

  const setMeta = useCallback((meta: string) => {
    setState((prev) => {
      const next = { ...prev, meta };
      persist(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setState(initialState);
    persist(initialState);
  }, []);

  const value = useMemo<SoundSessionContextValue>(
    () => ({ ...state, setActive, setPlaying, setMeta, clear }),
    [state, setActive, setPlaying, setMeta, clear],
  );

  return <SoundSessionContext.Provider value={value}>{children}</SoundSessionContext.Provider>;
}

/** Read + control the global sound session. Returns the context
 *  value when inside a provider, or a stub when outside (so
 *  components don't crash if the provider isn't mounted yet — for
 *  example during SSR or in isolated tests). */
export function useSoundSession(): SoundSessionContextValue {
  const ctx = useContext(SoundSessionContext);
  if (ctx) return ctx;
  return {
    ...initialState,
    setActive: () => {},
    setPlaying: () => {},
    setMeta: () => {},
    clear: () => {},
  };
}

export function getToolLabel(tool: SoundToolId | null): string {
  return tool ? TOOL_LABELS[tool] : '';
}

export function getToolColour(tool: SoundToolId | null): string {
  return tool ? TOOL_COLOURS[tool] : '#C4A060';
}

export function getToolSoundLabTab(tool: SoundToolId | null): string {
  return tool ? TOOL_SOUNDLAB_TAB[tool] : 'tuner';
}

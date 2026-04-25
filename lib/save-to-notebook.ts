'use client';

/*
 * saveToNotebook — shared helper that any music tool (Chill,
 * Groove, Maker, Looper) can use to capture a snapshot of its
 * current state and POST it to the user's Notebook (Ideas
 * category, tagged 'sound-snapshot' + the tool name).
 *
 * Falls back to localStorage 'colourmap:notebook-entries' when the
 * API is unreachable so the snapshot is never lost — the Notebook
 * page already reads that cache as its offline fallback.
 *
 * Per Martin's "every tool → Notebook" direction (task #21).
 */

export type SaveStatus = null | 'saving' | 'saved' | 'error';

export interface SaveToNotebookInput {
  /** What kind of tool is calling — used for the tag + auto-naming. */
  tool: 'chill-machine' | 'groove-machine' | 'magic-maker' | 'lofi-looper';
  /** Pre-built display title. If omitted, an auto title is generated. */
  title?: string;
  /** Multi-line content that captures the current state. */
  content: string;
  /** Extra tags. The tool name is added automatically. */
  extraTags?: string[];
  /** Notebook category. Defaults to 'ideas'. */
  category?: string;
}

const TOOL_LABELS: Record<SaveToNotebookInput['tool'], string> = {
  'chill-machine': 'Chill moment',
  'groove-machine': 'Groove',
  'magic-maker': 'Magic Maker pattern',
  'lofi-looper': 'Lofi loop',
};

function autoTitle(tool: SaveToNotebookInput['tool']): string {
  const stamp = new Date().toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${TOOL_LABELS[tool]} · ${stamp}`;
}

export async function saveToNotebook(input: SaveToNotebookInput): Promise<'saved' | 'error'> {
  const body = {
    category: input.category ?? 'ideas',
    title: input.title?.trim() || autoTitle(input.tool),
    content: input.content,
    tags: ['sound-snapshot', input.tool, ...(input.extraTags ?? [])],
  };

  // Try the API first.
  try {
    const res = await fetch('/api/notebook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.ok) return 'saved';
    throw new Error('api');
  } catch {
    // Local fallback — append to colourmap:notebook-entries.
    try {
      const raw = localStorage.getItem('colourmap:notebook-entries');
      const existing = raw ? JSON.parse(raw) : [];
      const localEntry = {
        id: crypto.randomUUID(),
        ...body,
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem('colourmap:notebook-entries', JSON.stringify([localEntry, ...existing]));
      return 'saved';
    } catch {
      return 'error';
    }
  }
}

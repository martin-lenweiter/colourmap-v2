'use client';

import { useEffect } from 'react';

/*
 * useKeyboardShortcut — registers a keydown handler with sensible
 * defaults for desktop power users.
 *
 * Behavior:
 * - Ignores keystrokes inside inputs, textareas, and contenteditable
 *   elements so typing a real value doesn't trigger shortcuts.
 * - Matches modifiers exactly. `meta`/`ctrl`/`shift`/`alt` must all
 *   be true OR all false in the event vs the descriptor — no
 *   accidental matches when the user presses Ctrl+Space while the
 *   shortcut was just "Space".
 * - Always prevents default + stops propagation when it matches, so
 *   e.g. Space doesn't scroll the page after toggling play.
 *
 * Disabled when `enabled` is false — useful for a global kill switch
 * (e.g. onboarding modal is open, don't capture keys).
 */

export interface KeyboardShortcut {
  key: string; // e.g. ' ', 'm', '1', 'Escape'
  meta?: boolean;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  handler: () => void;
}

function isTyping(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toUpperCase();
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (target.isContentEditable) return true;
  return false;
}

function matches(ev: KeyboardEvent, s: KeyboardShortcut): boolean {
  const keyMatches = ev.key.toLowerCase() === s.key.toLowerCase();
  if (!keyMatches) return false;
  if ((ev.metaKey ? true : false) !== (s.meta ?? false)) return false;
  if ((ev.ctrlKey ? true : false) !== (s.ctrl ?? false)) return false;
  if ((ev.shiftKey ? true : false) !== (s.shift ?? false)) return false;
  if ((ev.altKey ? true : false) !== (s.alt ?? false)) return false;
  return true;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[], enabled: boolean = true): void {
  useEffect(() => {
    if (!enabled) return;
    function onKeyDown(ev: KeyboardEvent) {
      if (isTyping(ev.target)) return;
      for (const s of shortcuts) {
        if (matches(ev, s)) {
          ev.preventDefault();
          ev.stopPropagation();
          s.handler();
          return;
        }
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [shortcuts, enabled]);
}

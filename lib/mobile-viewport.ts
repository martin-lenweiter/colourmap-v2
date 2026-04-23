'use client';

/*
 * Mobile viewport utility
 * -----------------------
 * On phones, the virtual keyboard occupies 40-50% of the screen when
 * an input is focused. Inputs and submit buttons at the bottom of a
 * page get hidden, breaking usability.
 *
 * This module:
 *  1. Listens to the visualViewport API (iOS Safari + Android Chrome)
 *  2. Writes the current keyboard height to a CSS custom property
 *     (--keyboard-height) that layouts can read
 *  3. Registers once on first call, idempotent afterwards
 *
 * Components use it by importing ensureMobileViewport() and calling it
 * once in a top-level useEffect. The CSS custom property is then
 * available everywhere:
 *
 *   .submit-button {
 *     position: sticky;
 *     bottom: calc(16px + var(--keyboard-height, 0px));
 *   }
 *
 * The accompanying `useKeyboardAware` hook (in components/hooks/)
 * additionally scrolls a specific input into view when it focuses.
 */

let installed = false;

export function ensureMobileViewport(): void {
  if (installed) return;
  if (typeof window === 'undefined') return;
  if (!('visualViewport' in window) || !window.visualViewport) return;

  const vv = window.visualViewport;
  const root = document.documentElement;

  function update() {
    const keyboardHeight = Math.max(0, window.innerHeight - vv.height);
    root.style.setProperty('--keyboard-height', `${keyboardHeight}px`);
    // Also update a boolean-ish flag so styles can react to keyboard
    // presence alone without needing a specific height value.
    root.dataset.keyboardOpen = keyboardHeight > 50 ? 'true' : 'false';
  }

  vv.addEventListener('resize', update);
  vv.addEventListener('scroll', update);
  update();
  installed = true;
}

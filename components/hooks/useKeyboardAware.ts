'use client';

import { type RefObject, useEffect, useRef } from 'react';

/*
 * useKeyboardAware
 * ----------------
 * Returns a ref to attach to a text input / textarea. When the user
 * focuses the input on a mobile device, the element is smoothly
 * scrolled into the visible (non-keyboard) portion of the viewport.
 *
 * Works together with `ensureMobileViewport()` which sets the
 * --keyboard-height CSS variable. Components that need their submit
 * button to sit above the keyboard should use CSS:
 *
 *   bottom: calc(16px + var(--keyboard-height, 0px));
 *
 * Usage:
 *   const noteRef = useKeyboardAware<HTMLTextAreaElement>();
 *   return <textarea ref={noteRef} ... />;
 */
export function useKeyboardAware<T extends HTMLElement>(): RefObject<T | null> {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    function onFocus() {
      // Wait for the keyboard to start appearing (next frame) so
      // visualViewport has updated before we compute where "in view" is.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
        });
      });
    }

    el.addEventListener('focus', onFocus);
    return () => el.removeEventListener('focus', onFocus);
  }, []);

  return ref;
}

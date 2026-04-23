'use client';

import { type RefObject, useEffect, useRef } from 'react';

/*
 * useKeyboardAware
 * ----------------
 * Returns a ref to attach to an input/textarea OR to a container
 * element wrapping one or more inputs. When any input inside the
 * ref target (including the ref target itself) focuses, the
 * focused element is smoothly scrolled into the visible
 * (non-keyboard) portion of the viewport.
 *
 * Uses focusin (which bubbles) instead of focus (which doesn't)
 * so you can wrap a form and catch every input inside it without
 * threading refs through sub-components.
 *
 * Works together with `ensureMobileViewport()` which sets the
 * --keyboard-height CSS variable. Components that need their submit
 * button to sit above the keyboard should use CSS:
 *
 *   bottom: calc(16px + var(--keyboard-height, 0px));
 *
 * Usage (direct):
 *   const noteRef = useKeyboardAware<HTMLTextAreaElement>();
 *   return <textarea ref={noteRef} ... />;
 *
 * Usage (wrapper):
 *   const formRef = useKeyboardAware<HTMLFormElement>();
 *   return <form ref={formRef}>...<textarea/>...<input/>...</form>;
 */
export function useKeyboardAware<T extends HTMLElement>(): RefObject<T | null> {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    function onFocusIn(ev: FocusEvent) {
      const target = ev.target as HTMLElement | null;
      if (!target) return;
      if (!target.matches('input, textarea, [contenteditable="true"]')) return;
      // Wait two frames for the virtual keyboard to start appearing
      // so visualViewport has updated before we compute "in view."
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          target.scrollIntoView?.({ block: 'center', behavior: 'smooth' });
        });
      });
    }

    el.addEventListener('focusin', onFocusIn);
    return () => el.removeEventListener('focusin', onFocusIn);
  }, []);

  return ref;
}

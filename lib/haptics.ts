'use client';

/*
 * Haptic feedback — wraps navigator.vibrate so callers don't have to
 * branch on "is this browser capable?" every time.
 *
 * Why wrap at all (vs. calling navigator.vibrate directly):
 * 1. navigator.vibrate is undefined on iOS Safari (no official support
 *    there — only Android Chrome + Firefox + some Samsung browsers).
 *    Calling it on iOS throws TypeError. We swallow silently.
 * 2. A user-visible respects-reduced-motion preference: if the OS
 *    preference is set, we skip haptics entirely.
 * 3. A localStorage opt-out so people who don't want haptics can
 *    disable them without OS-level changes (`colourmap:haptics=off`).
 * 4. Named presets (`tap`, `tick`, `success`, `long`) so call sites
 *    stay readable and we can tune durations in one place.
 *
 * Usage:
 *   import { haptic } from '@/lib/haptics';
 *   haptic('tap');        // 10ms quick feedback
 *   haptic('tick');       // 4ms very short
 *   haptic('success');    // [10, 60, 10] soft double-tap
 *   haptic('long');       // 25ms longer press
 */

export type HapticPreset = 'tap' | 'tick' | 'success' | 'long';

const PRESETS: Record<HapticPreset, number | number[]> = {
  tap: 10,
  tick: 4,
  success: [10, 60, 10],
  long: 25,
};

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  } catch {
    return false;
  }
}

function userDisabledHaptics(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem('colourmap:haptics') === 'off';
  } catch {
    return false;
  }
}

function vibrateSupported(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    typeof (navigator as unknown as { vibrate?: unknown }).vibrate === 'function'
  );
}

export function haptic(preset: HapticPreset): boolean {
  if (!vibrateSupported()) return false;
  if (prefersReducedMotion()) return false;
  if (userDisabledHaptics()) return false;
  try {
    return navigator.vibrate(PRESETS[preset]);
  } catch {
    return false;
  }
}

export function setHapticsEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    if (enabled) {
      window.localStorage.removeItem('colourmap:haptics');
    } else {
      window.localStorage.setItem('colourmap:haptics', 'off');
    }
  } catch {
    /* silent */
  }
}

export function hapticsEnabled(): boolean {
  return !userDisabledHaptics();
}

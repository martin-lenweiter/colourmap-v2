// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { haptic, hapticsEnabled, setHapticsEnabled } from './haptics';

function installVibrate(impl: (p: number | number[]) => boolean) {
  Object.defineProperty(navigator, 'vibrate', {
    configurable: true,
    value: impl,
  });
}

function removeVibrate() {
  Object.defineProperty(navigator, 'vibrate', {
    configurable: true,
    value: undefined,
  });
}

function installMatchMedia(reduce: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: (query: string) => ({
      matches: query.includes('prefers-reduced-motion') && reduce,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }),
  });
}

describe('haptic', () => {
  beforeEach(() => {
    window.localStorage.clear();
    installMatchMedia(false);
  });

  afterEach(() => {
    removeVibrate();
    window.localStorage.clear();
  });

  it('calls navigator.vibrate with the preset duration for tap', () => {
    const spy = vi.fn(() => true);
    installVibrate(spy);
    expect(haptic('tap')).toBe(true);
    expect(spy).toHaveBeenCalledWith(10);
  });

  it('uses the success pattern array', () => {
    const spy = vi.fn(() => true);
    installVibrate(spy);
    haptic('success');
    expect(spy).toHaveBeenCalledWith([10, 60, 10]);
  });

  it('returns false when navigator.vibrate is unavailable (iOS)', () => {
    removeVibrate();
    expect(haptic('tap')).toBe(false);
  });

  it('is silent when prefers-reduced-motion is set', () => {
    const spy = vi.fn(() => true);
    installVibrate(spy);
    installMatchMedia(true);
    expect(haptic('tap')).toBe(false);
    expect(spy).not.toHaveBeenCalled();
  });

  it('is silent when the user has disabled haptics via setHapticsEnabled', () => {
    const spy = vi.fn(() => true);
    installVibrate(spy);
    setHapticsEnabled(false);
    expect(haptic('tap')).toBe(false);
    expect(spy).not.toHaveBeenCalled();
  });

  it('re-enables haptics when setHapticsEnabled(true) is called after off', () => {
    const spy = vi.fn(() => true);
    installVibrate(spy);
    setHapticsEnabled(false);
    setHapticsEnabled(true);
    expect(haptic('tap')).toBe(true);
    expect(spy).toHaveBeenCalledWith(10);
  });

  it('hapticsEnabled reflects the localStorage flag', () => {
    expect(hapticsEnabled()).toBe(true);
    setHapticsEnabled(false);
    expect(hapticsEnabled()).toBe(false);
    setHapticsEnabled(true);
    expect(hapticsEnabled()).toBe(true);
  });

  it('swallows errors thrown by navigator.vibrate', () => {
    installVibrate(() => {
      throw new TypeError('unsupported');
    });
    expect(() => haptic('tap')).not.toThrow();
    expect(haptic('tap')).toBe(false);
  });
});

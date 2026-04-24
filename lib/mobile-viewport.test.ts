// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type VV = {
  height: number;
  addEventListener: ReturnType<typeof vi.fn>;
  removeEventListener?: ReturnType<typeof vi.fn>;
};

function installVisualViewport(vv: VV) {
  Object.defineProperty(window, 'visualViewport', {
    configurable: true,
    value: vv,
  });
}

function removeVisualViewport() {
  Object.defineProperty(window, 'visualViewport', {
    configurable: true,
    value: null,
  });
}

describe('ensureMobileViewport', () => {
  beforeEach(() => {
    vi.resetModules();
    document.documentElement.style.removeProperty('--keyboard-height');
    delete document.documentElement.dataset.keyboardOpen;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('writes --keyboard-height based on window.innerHeight - visualViewport.height', async () => {
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 800 });
    installVisualViewport({ height: 500, addEventListener: vi.fn() });

    const { ensureMobileViewport } = await import('./mobile-viewport');
    ensureMobileViewport();

    expect(document.documentElement.style.getPropertyValue('--keyboard-height')).toBe('300px');
    expect(document.documentElement.dataset.keyboardOpen).toBe('true');
  });

  it('sets keyboardOpen=false when the keyboard delta is <=50px', async () => {
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 800 });
    installVisualViewport({ height: 770, addEventListener: vi.fn() });

    const { ensureMobileViewport } = await import('./mobile-viewport');
    ensureMobileViewport();

    expect(document.documentElement.dataset.keyboardOpen).toBe('false');
  });

  it('clamps negative deltas to 0 (when visualViewport is taller than innerHeight)', async () => {
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 600 });
    installVisualViewport({ height: 700, addEventListener: vi.fn() });

    const { ensureMobileViewport } = await import('./mobile-viewport');
    ensureMobileViewport();

    expect(document.documentElement.style.getPropertyValue('--keyboard-height')).toBe('0px');
  });

  it('registers resize + scroll listeners on visualViewport', async () => {
    const addEventListener = vi.fn();
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 800 });
    installVisualViewport({ height: 800, addEventListener });

    const { ensureMobileViewport } = await import('./mobile-viewport');
    ensureMobileViewport();

    const events = addEventListener.mock.calls.map((c) => c[0]);
    expect(events).toContain('resize');
    expect(events).toContain('scroll');
  });

  it('is idempotent — second call does not add another listener', async () => {
    const addEventListener = vi.fn();
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 800 });
    installVisualViewport({ height: 800, addEventListener });

    const { ensureMobileViewport } = await import('./mobile-viewport');
    ensureMobileViewport();
    ensureMobileViewport();

    expect(addEventListener).toHaveBeenCalledTimes(2); // one for resize, one for scroll
  });

  it('is a no-op when visualViewport is unavailable', async () => {
    removeVisualViewport();

    const { ensureMobileViewport } = await import('./mobile-viewport');
    expect(() => ensureMobileViewport()).not.toThrow();
    expect(document.documentElement.style.getPropertyValue('--keyboard-height')).toBe('');
  });
});

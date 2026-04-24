// @vitest-environment jsdom
import { act, cleanup, render } from '@testing-library/react';
import { useEffect } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useKeyboardAware } from './useKeyboardAware';

function Harness({ onRef }: { onRef?: (el: HTMLDivElement | null) => void }) {
  const ref = useKeyboardAware<HTMLDivElement>();
  useEffect(() => {
    onRef?.(ref.current);
  }, [onRef, ref]);
  return (
    <div ref={ref}>
      <input data-testid="input" type="text" />
      <textarea data-testid="textarea" />
      <button data-testid="button" type="button">
        not an input
      </button>
    </div>
  );
}

describe('useKeyboardAware', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('scrolls focused input into view on focusin', async () => {
    const scrollSpy = vi.fn();
    Element.prototype.scrollIntoView = scrollSpy;
    const raf = vi
      .spyOn(globalThis, 'requestAnimationFrame')
      .mockImplementation((cb: FrameRequestCallback) => {
        cb(0);
        return 0;
      });

    const { getByTestId } = render(<Harness />);
    const input = getByTestId('input');

    await act(async () => {
      input.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    });

    expect(scrollSpy).toHaveBeenCalledWith({ block: 'center', behavior: 'smooth' });
    raf.mockRestore();
  });

  it('scrolls focused textarea into view on focusin', async () => {
    const scrollSpy = vi.fn();
    Element.prototype.scrollIntoView = scrollSpy;
    vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback) => {
      cb(0);
      return 0;
    });

    const { getByTestId } = render(<Harness />);
    const textarea = getByTestId('textarea');

    await act(async () => {
      textarea.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    });

    expect(scrollSpy).toHaveBeenCalledOnce();
  });

  it('ignores focusin on non-input elements', async () => {
    const scrollSpy = vi.fn();
    Element.prototype.scrollIntoView = scrollSpy;
    vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback) => {
      cb(0);
      return 0;
    });

    const { getByTestId } = render(<Harness />);
    const button = getByTestId('button');

    await act(async () => {
      button.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    });

    expect(scrollSpy).not.toHaveBeenCalled();
  });

  it('does not throw when scrollIntoView is absent (jsdom default)', async () => {
    const original = Element.prototype.scrollIntoView;
    // biome-ignore lint/performance/noDelete: testing the optional-call guard
    delete (Element.prototype as unknown as { scrollIntoView?: unknown }).scrollIntoView;
    vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback) => {
      cb(0);
      return 0;
    });

    const { getByTestId } = render(<Harness />);
    const input = getByTestId('input');

    expect(() => {
      input.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    }).not.toThrow();

    if (original) Element.prototype.scrollIntoView = original;
  });
});

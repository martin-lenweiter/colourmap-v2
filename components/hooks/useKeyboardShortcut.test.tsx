// @vitest-environment jsdom
import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useKeyboardShortcuts } from './useKeyboardShortcut';

function Harness({
  shortcuts,
  enabled,
  withInput,
}: {
  shortcuts: Parameters<typeof useKeyboardShortcuts>[0];
  enabled?: boolean;
  withInput?: boolean;
}) {
  useKeyboardShortcuts(shortcuts, enabled);
  return (
    <div>
      {withInput ? <input data-testid="input" type="text" /> : null}
      <textarea data-testid="textarea" />
    </div>
  );
}

describe('useKeyboardShortcuts', () => {
  afterEach(() => {
    cleanup();
  });

  it('calls the handler when the key matches', () => {
    const handler = vi.fn();
    render(<Harness shortcuts={[{ key: ' ', handler }]} />);
    fireEvent.keyDown(window, { key: ' ' });
    expect(handler).toHaveBeenCalledOnce();
  });

  it('does not call the handler when the key differs', () => {
    const handler = vi.fn();
    render(<Harness shortcuts={[{ key: ' ', handler }]} />);
    fireEvent.keyDown(window, { key: 'a' });
    expect(handler).not.toHaveBeenCalled();
  });

  it('ignores shortcuts while typing in an input', () => {
    const handler = vi.fn();
    render(<Harness withInput shortcuts={[{ key: ' ', handler }]} />);
    const input = document.querySelector('input');
    if (!input) throw new Error('input not found');
    input.focus();
    fireEvent.keyDown(input, { key: ' ' });
    expect(handler).not.toHaveBeenCalled();
  });

  it('ignores shortcuts while typing in a textarea', () => {
    const handler = vi.fn();
    render(<Harness shortcuts={[{ key: ' ', handler }]} />);
    const textarea = document.querySelector('textarea');
    if (!textarea) throw new Error('textarea not found');
    textarea.focus();
    fireEvent.keyDown(textarea, { key: ' ' });
    expect(handler).not.toHaveBeenCalled();
  });

  it('requires exact modifier match (no accidental Ctrl+Space triggering Space)', () => {
    const handler = vi.fn();
    render(<Harness shortcuts={[{ key: ' ', handler }]} />);
    fireEvent.keyDown(window, { key: ' ', ctrlKey: true });
    expect(handler).not.toHaveBeenCalled();
  });

  it('matches when modifiers are specified and pressed', () => {
    const handler = vi.fn();
    render(<Harness shortcuts={[{ key: 'k', meta: true, handler }]} />);
    fireEvent.keyDown(window, { key: 'k', metaKey: true });
    expect(handler).toHaveBeenCalledOnce();
  });

  it('is case-insensitive for the key', () => {
    const handler = vi.fn();
    render(<Harness shortcuts={[{ key: 'M', handler }]} />);
    fireEvent.keyDown(window, { key: 'm' });
    expect(handler).toHaveBeenCalledOnce();
  });

  it('does not register when enabled=false', () => {
    const handler = vi.fn();
    render(<Harness shortcuts={[{ key: ' ', handler }]} enabled={false} />);
    fireEvent.keyDown(window, { key: ' ' });
    expect(handler).not.toHaveBeenCalled();
  });

  it('unregisters the listener when the component unmounts', () => {
    const handler = vi.fn();
    const { unmount } = render(<Harness shortcuts={[{ key: ' ', handler }]} />);
    unmount();
    fireEvent.keyDown(window, { key: ' ' });
    expect(handler).not.toHaveBeenCalled();
  });

  it('dispatches to the first matching shortcut and stops', () => {
    const a = vi.fn();
    const b = vi.fn();
    render(
      <Harness
        shortcuts={[
          { key: ' ', handler: a },
          { key: ' ', handler: b },
        ]}
      />,
    );
    fireEvent.keyDown(window, { key: ' ' });
    expect(a).toHaveBeenCalledOnce();
    expect(b).not.toHaveBeenCalled();
  });
});

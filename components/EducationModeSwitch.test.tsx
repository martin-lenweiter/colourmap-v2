// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import EducationModeSwitch from './EducationModeSwitch';

describe('EducationModeSwitch', () => {
  afterEach(() => cleanup());

  it('marks the active mode and fires the alternate-mode callback', () => {
    const onSwitchToWorld = vi.fn();
    render(<EducationModeSwitch active="self" onSwitchToWorld={onSwitchToWorld} />);

    const selfBtn = screen.getByRole('button', { name: 'Self' });
    expect(selfBtn.getAttribute('aria-pressed')).toBe('true');
    expect(selfBtn.getAttribute('aria-current')).toBe('page');
    expect((selfBtn as HTMLButtonElement).disabled).toBe(true);

    fireEvent.click(screen.getByRole('button', { name: 'World' }));
    expect(onSwitchToWorld).toHaveBeenCalledTimes(1);
  });

  it('flips the marking when active is world', () => {
    const onSwitchToSelf = vi.fn();
    render(<EducationModeSwitch active="world" onSwitchToSelf={onSwitchToSelf} />);

    expect(screen.getByRole('button', { name: 'World' }).getAttribute('aria-pressed')).toBe('true');
    fireEvent.click(screen.getByRole('button', { name: 'Self' }));
    expect(onSwitchToSelf).toHaveBeenCalledTimes(1);
  });
});

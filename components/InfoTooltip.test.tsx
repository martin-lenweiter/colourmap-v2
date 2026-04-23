// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';

import InfoTooltip from './InfoTooltip';

describe('InfoTooltip', () => {
  afterEach(() => {
    cleanup();
  });

  it('does not show the popover by default', () => {
    render(
      <InfoTooltip
        trigger={<span>layer softness</span>}
        title="Reverb"
        content="Reverb adds space to the sound."
      />,
    );

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.queryByText('Reverb adds space to the sound.')).toBeNull();
  });

  it('opens the popover on trigger click', async () => {
    const user = userEvent.setup();
    render(
      <InfoTooltip
        trigger={<span>layer softness</span>}
        title="Reverb"
        content="Reverb adds space to the sound."
      />,
    );

    await user.click(screen.getByText('layer softness'));

    expect(screen.getByRole('dialog')).toBeDefined();
    expect(screen.getByText('Reverb adds space to the sound.')).toBeDefined();
  });

  it('shows the title as uppercase heading inside the popover', async () => {
    const user = userEvent.setup();
    render(
      <InfoTooltip
        trigger={<span>harmonics</span>}
        title="Harmonics"
        content="Overtones above the base tone."
      />,
    );

    await user.click(screen.getByText('harmonics'));

    const dialog = screen.getByRole('dialog');
    expect(dialog.getAttribute('aria-label')).toBe('Harmonics');
  });

  it('closes the popover when the close button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <InfoTooltip
        trigger={<span>softness</span>}
        title="Reverb"
        content="Reverb adds space to the sound."
      />,
    );

    await user.click(screen.getByText('softness'));
    expect(screen.getByRole('dialog')).toBeDefined();

    await user.click(screen.getByLabelText('Close'));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('toggles on repeat trigger clicks', async () => {
    const user = userEvent.setup();
    render(
      <InfoTooltip trigger={<span>softness</span>} title="Reverb" content="Reverb adds space." />,
    );

    await user.click(screen.getByText('softness'));
    expect(screen.getByRole('dialog')).toBeDefined();

    await user.click(screen.getByText('softness'));
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});

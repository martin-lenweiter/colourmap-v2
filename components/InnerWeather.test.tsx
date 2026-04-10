// @vitest-environment jsdom
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';

import InnerWeather, { type WeatherEntry } from './InnerWeather';

function WeatherHarness() {
  const [weather, setWeather] = React.useState<WeatherEntry[]>([]);
  return <InnerWeather weather={weather} setWeather={setWeather} />;
}

describe('InnerWeather', () => {
  afterEach(() => {
    cleanup();
  });

  it('adds, adjusts, and removes weather entries from the focused detail state', async () => {
    const user = userEvent.setup();

    render(<WeatherHarness />);

    expect(screen.getByText("Tap a weather to name what you're feeling.")).toBeDefined();

    await user.click(screen.getByRole('button', { name: /storm/i }));
    await user.click(screen.getByRole('button', { name: 'Anger' }));

    const angerRow = await screen.findByRole('button', { name: /Anger/ });
    expect(screen.queryByText("Tap a weather to name what you're feeling.")).toBeNull();

    await user.click(angerRow);

    const entryContainer = angerRow.parentElement;
    if (!(entryContainer instanceof HTMLElement)) {
      throw new Error('Expected weather entry container');
    }

    let entryButtons = within(entryContainer).getAllByRole('button');
    await user.click(entryButtons[5]);

    await waitFor(() => {
      entryButtons = within(entryContainer).getAllByRole('button');
      expect((entryButtons[5] as HTMLButtonElement).style.height).toBe('16px');
    });

    await user.click(entryButtons[6]);

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /Anger/ })).toBeNull();
    });
    expect(screen.getByText("Tap a weather to name what you're feeling.")).toBeDefined();
  });
});

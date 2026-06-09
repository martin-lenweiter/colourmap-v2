// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import CmaCgmProposal from './CmaCgmProposal';

describe('CmaCgmProposal', () => {
  afterEach(() => cleanup());

  it('lands on the proposal artifact with the verbatim Saadé quotes', () => {
    render(<CmaCgmProposal />);

    expect(screen.getByTestId('cma-cgm-proposal')).toBeDefined();
    expect(screen.getByRole('heading', { level: 1 }).textContent).toMatch(/MAIA-aligned/);
    expect(screen.getByText(/place France and the rest of Europe/i)).toBeDefined();
    expect(screen.getByText(/I would like the younger generation/i)).toBeDefined();
  });

  it('surfaces the three killer numbers', () => {
    render(<CmaCgmProposal />);
    expect(screen.getAllByText(/12×/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/45\.5%/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/80k/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/war-risk repricing/i)).toBeDefined();
    expect(screen.getByText(/orderbook \/ fleet/i)).toBeDefined();
    expect(screen.getByText(/MAIA users from 1 June 2026/i)).toBeDefined();
  });

  it('routes the open-intel button through the callback', () => {
    const onOpenIntel = vi.fn();
    render(<CmaCgmProposal onOpenIntel={onOpenIntel} />);

    fireEvent.click(screen.getByRole('button', { name: /Open the live dashboard/i }));
    expect(onOpenIntel).toHaveBeenCalledTimes(1);
  });
});

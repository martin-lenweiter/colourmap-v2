// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import BinauralTuner from './BinauralTuner';

vi.mock('@/components/AtomVisualizer', () => ({
  default: () => null,
}));

vi.mock('@/components/InfoTooltip', () => ({
  default: () => null,
}));

vi.mock('@/components/VoiceProviderSelector', () => ({
  default: () => null,
}));

vi.mock('@/lib/hooks/use-tts', () => ({
  useTTS: () => ({ speak: vi.fn(), stop: vi.fn() }),
}));

vi.mock('@/lib/sample-pack', () => ({
  playSampledNote: vi.fn(),
}));

describe('BinauralTuner', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('shows the long soft mood buttons in simple mode', () => {
    render(<BinauralTuner />);

    expect(screen.getByRole('button', { name: /Relax light cloud/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Focus clear air/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Sleep deep cloud/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Still one quiet horizon/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Ground deeper/i })).toBeDefined();
  });

  it('lets a long soft mood be selected without leaving simple mode', () => {
    render(<BinauralTuner />);

    fireEvent.click(screen.getByRole('button', { name: /Sleep deep cloud/i }));

    expect(screen.getByRole('button', { name: /studio/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Sleep deep cloud/i })).toBeDefined();
  });
});

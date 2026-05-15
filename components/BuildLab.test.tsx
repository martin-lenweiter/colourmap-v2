// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import BuildLab from './BuildLab';

describe('BuildLab', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        if (url.includes('/api/build-lab/availability')) {
          return new Response(
            JSON.stringify({
              agents: [
                { id: 'codex', name: 'Codex', available: true },
                { id: 'claude', name: 'Claude Code', available: false },
              ],
            }),
            { status: 200 },
          );
        }
        if (url.includes('/api/build-lab/project')) {
          return new Response(
            JSON.stringify({
              projectPath: 'C:/Users/victor/colourmap-v2',
              git: true,
              branch: 'feature/build-lab-agent-mission-control',
              changedFiles: ['components/BuildLab.tsx'],
            }),
            { status: 200 },
          );
        }
        if (url.includes('/api/build-lab/diff')) {
          return new Response(
            JSON.stringify({ diff: 'diff --git a/components/BuildLab.tsx', changedFiles: [] }),
            { status: 200 },
          );
        }
        return new Response('', { status: 404 });
      }),
    );
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  it('loads agent availability in a simplified prompt workspace', async () => {
    render(<BuildLab />);

    await waitFor(() => expect(screen.getByText('Codex')).toBeDefined());
    expect(screen.getByText('Mission prompt')).toBeDefined();
    expect(screen.getByText('Mission memory')).toBeDefined();
    expect(screen.getByText('Agent console')).toBeDefined();
    expect(screen.queryByText('Scope lens')).toBeNull();
    expect(screen.queryByText('Mission cards')).toBeNull();
    expect(screen.queryByText('Mode')).toBeNull();
  });

  it('loads a project and stores it as a recent project', async () => {
    render(<BuildLab />);

    await waitFor(() => expect(screen.getByText('Codex')).toBeDefined());
    fireEvent.change(screen.getByPlaceholderText('C:/Users/victor/colourmap-v2'), {
      target: { value: 'C:/Users/victor/colourmap-v2' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Load' }));

    await waitFor(() =>
      expect(screen.getByText('feature/build-lab-agent-mission-control')).toBeDefined(),
    );
    expect(localStorage.getItem('colourmap:build-lab-recent-projects')).toContain(
      'C:/Users/victor/colourmap-v2',
    );
  });
});

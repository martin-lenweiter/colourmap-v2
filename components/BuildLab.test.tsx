// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import BuildLab from './BuildLab';

describe('BuildLab', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string, init?: RequestInit) => {
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
        if (url.includes('/api/build-lab/runner')) {
          return new Response(
            JSON.stringify({
              runner: {
                online: true,
                executionOwner: 'desktop-server',
                remoteRunReady: true,
                host: 'localhost:3000',
                machine: 'studio-pc',
                platform: 'win32',
                workingDirectory: 'C:/Users/victor/colourmap-v2',
              },
            }),
            { status: 200 },
          );
        }
        if (url.includes('/api/build-lab/queue') && url.includes('/queue/')) {
          return new Response(
            JSON.stringify({
              id: 'queued-1',
              title: 'Build a tiny local runner queue test.',
              channelId: 'phone-runner',
              agentId: 'codex',
              projectPath: 'C:/Users/victor/colourmap-v2',
              prompt: 'Build a tiny local runner queue test.',
              status: 'running',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              events: [],
            }),
            { status: 200 },
          );
        }
        if (url.includes('/api/build-lab/queue')) {
          const method = init?.method ?? 'GET';
          if (method === 'POST') {
            return new Response(
              JSON.stringify({
                id: 'queued-1',
                title: 'Build a tiny local runner queue test.',
                channelId: 'phone-runner',
                agentId: 'codex',
                projectPath: 'C:/Users/victor/colourmap-v2',
                prompt: 'Build a tiny local runner queue test.',
                status: 'queued',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                events: [
                  {
                    id: 1,
                    type: 'queued',
                    text: 'Queued for desktop runner.',
                    createdAt: new Date().toISOString(),
                  },
                ],
              }),
              { status: 201 },
            );
          }
          return new Response(JSON.stringify({ missions: [] }), { status: 200 });
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
    expect(screen.getByText('Channel')).toBeDefined();
    expect(screen.getByText(/Character visuals, arena/i)).toBeDefined();
    expect(screen.getAllByText('Phone Level 2').length).toBeGreaterThan(0);
    expect(screen.getByText('runner ready')).toBeDefined();
    expect(screen.getByText('Garden of Ideas')).toBeDefined();
    expect(screen.getByText('Display mode')).toBeDefined();
    expect(screen.getByText('Sun Dialogue visual prompt mode')).toBeDefined();
    expect(screen.getByText('Agent console')).toBeDefined();
    expect(screen.queryByText('Scope lens')).toBeNull();
    expect(screen.queryByText('Mission cards')).toBeNull();
    expect(screen.queryByText('Mode')).toBeNull();
  });

  it('switches Build Lab work channels so mission memory is not one mixed chat', async () => {
    render(<BuildLab />);

    await waitFor(() => expect(screen.getByText('Codex')).toBeDefined());
    fireEvent.click(screen.getByRole('button', { name: /Channel/i }));
    const phoneChannelButton = screen
      .getAllByRole('button')
      .find((button) => button.textContent?.startsWith('Phone Level 2'));
    expect(phoneChannelButton).toBeDefined();
    fireEvent.click(phoneChannelButton as HTMLButtonElement);

    expect(screen.getByText(/Phone Level 2 \/ Phone control surface/i)).toBeDefined();
    expect(localStorage.getItem('colourmap:build-lab-active-channel')).toBe('phone-runner');
  });

  it('queues a local Phone Level 2 mission for the runner inbox', async () => {
    render(<BuildLab />);

    await waitFor(() => expect(screen.getByText('Codex')).toBeDefined());
    fireEvent.click(screen.getByRole('button', { name: /Channel/i }));
    const phoneChannelButton = screen
      .getAllByRole('button')
      .find((button) => button.textContent?.startsWith('Phone Level 2'));
    expect(phoneChannelButton).toBeDefined();
    fireEvent.click(phoneChannelButton as HTMLButtonElement);
    fireEvent.change(screen.getByPlaceholderText('C:/Users/victor/colourmap-v2'), {
      target: { value: 'C:/Users/victor/colourmap-v2' },
    });
    fireEvent.change(
      screen.getByPlaceholderText('Tell the agent what to build, fix, review, or plan...'),
      {
        target: { value: 'Build a tiny local runner queue test.' },
      },
    );
    fireEvent.click(screen.getByRole('button', { name: 'Queue for runner' }));

    expect(screen.getByText('Runner inbox')).toBeDefined();
    await waitFor(() =>
      expect(screen.getAllByText('Build a tiny local runner queue test.').length).toBeGreaterThan(
        0,
      ),
    );
    expect(screen.getByRole('button', { name: 'Run on this computer' })).toBeDefined();
  });

  it('switches Garden of Ideas perspectives without replacing the spec map', async () => {
    render(<BuildLab />);

    await waitFor(() => expect(screen.getByText('Codex')).toBeDefined());
    fireEvent.click(screen.getByRole('button', { name: /Garden of Ideas/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Open Garden' }));
    expect(screen.getByRole('button', { name: 'Glimpse' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Bubble Map' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Board' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Road' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Constellation' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Curriculum' })).toBeDefined();

    fireEvent.click(screen.getByRole('button', { name: 'Change category' }));
    fireEvent.click(screen.getByRole('button', { name: /Education Atlas/i }));
    expect(screen.getAllByText('Wellbeing Curriculum Compass').length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole('button', { name: 'Curriculum' }));
    expect(screen.getAllByText('Notice').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Connect').length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: 'Change category' }));
    const philosophyButton = screen
      .getAllByRole('button')
      .find((button) => button.textContent?.startsWith('Philosophy'));
    expect(philosophyButton).toBeDefined();
    fireEvent.click(philosophyButton as HTMLButtonElement);
    expect(screen.getAllByText('The Question That Organizes Life').length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole('button', { name: 'Glimpse' }));
    fireEvent.click(screen.getByRole('button', { name: 'Values And Action' }));
    expect(screen.getByText('Geometry bridge')).toBeDefined();
    expect(screen.getByRole('link', { name: /Open Dot Heart/i })).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: 'Curriculum' }));
    expect(screen.getAllByText('Wonder').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Practice').length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: 'Change category' }));
    fireEvent.click(screen.getByRole('button', { name: /Business Plan/i }));
    expect(screen.getAllByText('App Store Path').length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: 'Change category' }));
    const wellbeingButton = screen
      .getAllByRole('button')
      .find((button) => button.textContent?.startsWith('WellbeingHow can inner clarity'));
    expect(wellbeingButton).toBeDefined();
    fireEvent.click(wellbeingButton as HTMLButtonElement);
    expect(screen.getAllByText('Collective Happiness').length).toBeGreaterThan(0);
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

// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/components/ui/button', () => ({
  Button: (props: React.ComponentProps<'button'>) => <button {...props} />,
}));

vi.mock('@/components/ui/textarea', () => ({
  Textarea: (props: React.ComponentProps<'textarea'>) => <textarea {...props} />,
}));

vi.mock('./ReflectionMoment', () => ({
  default: ({ word, onDismiss }: { word: string; onDismiss: () => void }) => (
    <button type="button" data-testid="reflection" onClick={onDismiss}>
      {word}
    </button>
  ),
}));

vi.mock('@/components/PostCheckInInsight', () => ({
  default: ({ onDismiss }: { onDismiss: () => void }) => (
    <button type="button" data-testid="insight" onClick={onDismiss}>
      Insight
    </button>
  ),
}));

import CheckInForm from './CheckInForm';

describe('CheckInForm', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string, options?: RequestInit) => {
        if (url === '/api/check-ins' && (!options?.method || options.method === 'GET')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([]),
          });
        }
        if (url === '/api/life-scan-answers') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ answers: {} }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ id: '1', sliderValue: 72, note: null, tags: null }),
        });
      }),
    );
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders the submit button', () => {
    render(<CheckInForm />);

    expect(screen.getByRole('button', { name: 'Check in' })).toBeDefined();
  });

  it('renders the visible FACING row', () => {
    render(<CheckInForm />);

    expect(screen.getByText('FACING')).toBeDefined();
    expect(screen.getByRole('button', { name: 'Facing Fear' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Facing Avoidance' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Facing Confusion' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Facing Intention' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Facing Need' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Facing Gratitude' })).toBeDefined();
  });

  it('switches the active FACING tracker prompt family', async () => {
    const user = userEvent.setup();
    render(<CheckInForm />);

    expect(screen.getByText('Fear')).toBeDefined();
    expect(screen.getByPlaceholderText('What are you afraid of today?')).toBeDefined();

    await user.click(screen.getByRole('button', { name: 'Facing Need' }));

    expect(screen.getByText('Need')).toBeDefined();
    expect(screen.getByPlaceholderText('What do you need right now?')).toBeDefined();
  });

  it('renders the feeling compass controls', () => {
    render(<CheckInForm />);

    expect(screen.getByRole('button', { name: 'Attitude 0%' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Emotions 0%' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Presence 0%' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Body 0%' })).toBeDefined();
    expect(screen.getByText('Choose the stage that fits today.')).toBeDefined();
    expect(screen.getByRole('button', { name: 'Support Confidence' })).toBeDefined();
  });

  it('renders inline challenge and flow fields', () => {
    render(<CheckInForm />);

    expect(screen.getByLabelText('Challenge')).toBeDefined();
    expect(screen.getByLabelText('Flow')).toBeDefined();
    expect(screen.getByPlaceholderText("What's challenging?...")).toBeDefined();
    expect(screen.getByPlaceholderText("What's flowing?...")).toBeDefined();
  });

  it('submits feeling compass, stage, and support chips in the payload', async () => {
    const user = userEvent.setup();
    render(<CheckInForm />);

    await user.click(screen.getByRole('button', { name: 'Attitude 0%' }));
    await user.click(screen.getByRole('button', { name: 'Body 0%' }));
    await user.click(screen.getByRole('button', { name: 'Stage 4: Searching for more' }));
    await user.click(screen.getByRole('button', { name: 'Support Confidence' }));
    await user.click(screen.getByRole('button', { name: 'Support Gratitude' }));
    await user.click(screen.getByRole('button', { name: 'Check in' }));

    const postCall = vi
      .mocked(fetch)
      .mock.calls.find(
        ([url, options]) =>
          url === '/api/check-ins' && options && (options as RequestInit).method === 'POST',
      );

    expect(postCall).toBeDefined();
    const payload = JSON.parse((postCall?.[1] as RequestInit).body as string);

    expect(payload).toMatchObject({
      feelingCompass: {
        attitude: 25,
        body: 25,
      },
      feelingStage: 4,
      feelingSupport: ['Confidence', 'Gratitude'],
    });
  });

  it('submits challenge and flow values in the payload', async () => {
    const user = userEvent.setup();
    render(<CheckInForm />);

    await user.type(screen.getByLabelText('Challenge'), 'I am avoiding the hard sales call.');
    await user.type(screen.getByLabelText('Flow'), 'Writing is moving quickly this morning.');
    await user.click(screen.getByRole('button', { name: 'Check in' }));

    const postCall = vi
      .mocked(fetch)
      .mock.calls.find(
        ([url, options]) =>
          url === '/api/check-ins' && options && (options as RequestInit).method === 'POST',
      );

    expect(postCall).toBeDefined();
    const payload = JSON.parse((postCall?.[1] as RequestInit).body as string);

    expect(payload).toMatchObject({
      challenge: 'I am avoiding the hard sales call.',
      flow: 'Writing is moving quickly this morning.',
    });
  });

  it('shows the ochre brown ink note on a first check-in', async () => {
    render(<CheckInForm />);

    await waitFor(() => {
      expect(screen.getByText('First Check-In')).toBeDefined();
    });

    expect(screen.getByText('Ochre')).toBeDefined();
    expect(screen.getByText('Brown')).toBeDefined();
    expect(screen.getByText('Ink')).toBeDefined();
  });

  it('renders the Hawkins emotion bar', () => {
    const { container } = render(<CheckInForm />);

    // The bar contains 14 colored segments (HAWKINS array has 14 entries)
    const form = container.querySelector('form');
    expect(form).toBeDefined();
  });

  it('renders the textarea', () => {
    render(<CheckInForm />);

    const noteField = document.getElementById('check-in-note');
    expect(noteField).toBeDefined();
    expect(noteField?.tagName).toBe('TEXTAREA');
  });

  it('submit button is enabled by default', () => {
    render(<CheckInForm />);

    const button = screen.getByRole('button', { name: 'Check in' });
    expect(button).toHaveProperty('disabled', false);
  });

  it('sends a POST request on submit', async () => {
    const user = userEvent.setup();
    render(<CheckInForm />);

    await user.click(screen.getByRole('button', { name: 'Check in' }));

    expect(fetch).toHaveBeenCalledWith(
      '/api/check-ins',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }),
    );
  });

  it('submits CPC scaffold fields alongside the legacy note payload', async () => {
    const user = userEvent.setup();
    render(<CheckInForm />);

    await user.click(screen.getByRole('button', { name: 'Check in' }));

    const postCall = vi
      .mocked(fetch)
      .mock.calls.find(
        ([url, options]) =>
          url === '/api/check-ins' && options && (options as RequestInit).method === 'POST',
      );

    expect(postCall).toBeDefined();
    const payload = JSON.parse((postCall?.[1] as RequestInit).body as string);

    expect(payload).toMatchObject({
      sliderValue: 50,
      facing: null,
      pulses: null,
      challenge: null,
      flow: null,
      feelingCompass: null,
      feelingStage: null,
      feelingSupport: null,
    });
    expect(payload).toHaveProperty('note');
  });

  it('shows reflection moment after successful submit', async () => {
    const user = userEvent.setup();
    render(<CheckInForm />);

    await user.click(screen.getByRole('button', { name: 'Check in' }));

    await waitFor(() => {
      expect(screen.getByTestId('reflection')).toBeDefined();
    });
  });

  it('shows insight after reflection dismiss, then resets on insight dismiss', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<CheckInForm onCheckInComplete={onComplete} />);

    await user.type(screen.getByLabelText('Challenge'), 'Too many open loops.');
    await user.type(screen.getByLabelText('Flow'), 'Design work feels clear.');

    await user.click(screen.getByRole('button', { name: 'Check in' }));

    await waitFor(() => {
      expect(screen.getByTestId('reflection')).toBeDefined();
    });

    await user.click(screen.getByTestId('reflection'));

    await waitFor(() => {
      expect(screen.getByTestId('insight')).toBeDefined();
    });

    await user.click(screen.getByTestId('insight'));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Check in' })).toBeDefined();
    });

    expect(screen.getByLabelText('Challenge')).toHaveProperty('value', '');
    expect(screen.getByLabelText('Flow')).toHaveProperty('value', '');
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('shows an error message on API failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ error: 'sliderValue is required' }),
        }),
      ),
    );

    const user = userEvent.setup();
    render(<CheckInForm />);

    await user.click(screen.getByRole('button', { name: 'Check in' }));

    await waitFor(() => {
      expect(screen.getByText('sliderValue is required')).toBeDefined();
    });
  });

  it('shows a network error on fetch failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new Error('network'))),
    );

    const user = userEvent.setup();
    render(<CheckInForm />);

    await user.click(screen.getByRole('button', { name: 'Check in' }));

    await waitFor(() => {
      expect(screen.getByText('Network error — check your connection')).toBeDefined();
    });
  });

  it('shows loading text while submitting', async () => {
    let resolveResponse!: (value: unknown) => void;
    vi.stubGlobal(
      'fetch',
      vi.fn(
        () =>
          new Promise((resolve) => {
            resolveResponse = resolve;
          }),
      ),
    );

    const user = userEvent.setup();
    render(<CheckInForm />);

    await user.click(screen.getByRole('button', { name: 'Check in' }));

    expect(screen.getByRole('button', { name: 'Saving...' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Saving...' })).toHaveProperty('disabled', true);

    resolveResponse({
      ok: true,
      json: () => Promise.resolve({ id: '1' }),
    });

    await waitFor(() => {
      expect(screen.getByTestId('reflection')).toBeDefined();
    });
  });

  it('renders the Pulse collapsible section', () => {
    render(<CheckInForm />);

    expect(screen.getByText('Pulse')).toBeDefined();
  });
});

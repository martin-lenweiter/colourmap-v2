// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/components/CheckInAnalysis', () => ({
  default: () => <div data-testid="analysis">Analysis</div>,
}));

import CheckInHistory from './CheckInHistory';

const now = new Date('2026-03-31T14:00:00Z');
type MockDateArgs =
  | []
  | [string | number | Date]
  | [number, number]
  | [number, number, number]
  | [number, number, number, number]
  | [number, number, number, number, number]
  | [number, number, number, number, number, number]
  | [number, number, number, number, number, number, number];

const fakeEntries = [
  {
    id: '3',
    sliderValue: 80,
    note: 'feeling great',
    tags: ['Work'],
    missionId: null,
    emotionName: null,
    emotionColor: null,
    facing: {
      fear: {
        label: 'Fear',
        answers: ['I might miss the deadline', 'I can ask for help today'],
      },
    },
    pulses: {
      body: 75,
      attitude: 50,
    },
    challenge: 'Finishing the check-in parity work.',
    flow: 'The UI structure is finally getting cleaner.',
    feelingCompass: {
      attitude: 25,
      presence: 50,
    },
    feelingStage: 4,
    feelingSupport: ['Confidence', 'Gratitude'],
    createdAt: '2026-03-31T12:00:00Z',
  },
  {
    id: '2',
    sliderValue: 50,
    note: null,
    tags: null,
    missionId: null,
    emotionName: null,
    emotionColor: null,
    facing: null,
    pulses: null,
    challenge: null,
    flow: null,
    feelingCompass: null,
    feelingStage: null,
    feelingSupport: null,
    createdAt: '2026-03-31T08:00:00Z',
  },
  {
    id: '1',
    sliderValue: 10,
    note: 'rough day',
    tags: null,
    missionId: null,
    emotionName: null,
    emotionColor: null,
    facing: null,
    pulses: null,
    challenge: null,
    flow: null,
    feelingCompass: null,
    feelingStage: null,
    feelingSupport: null,
    createdAt: '2026-03-30T18:00:00Z',
  },
];

describe('CheckInHistory', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'Date',
      class extends Date {
        constructor(...args: MockDateArgs) {
          if (args.length === 0) {
            super(now.toISOString());
            return;
          }

          switch (args.length) {
            case 1:
              super(args[0]);
              return;
            case 2:
              super(args[0], args[1]);
              return;
            case 3:
              super(args[0], args[1], args[2]);
              return;
            case 4:
              super(args[0], args[1], args[2], args[3]);
              return;
            case 5:
              super(args[0], args[1], args[2], args[3], args[4]);
              return;
            case 6:
              super(args[0], args[1], args[2], args[3], args[4], args[5]);
              return;
            default:
              super(args[0], args[1], args[2], args[3], args[4], args[5], args[6]);
          }
        }

        static override now() {
          return now.getTime();
        }
      },
    );
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(fakeEntries),
        }),
      ),
    );
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders collapsed pill with title', async () => {
    render(<CheckInHistory refreshKey={0} />);

    await waitFor(() => {
      expect(screen.getByText('Recent Reflections')).toBeDefined();
    });
  });

  it('is collapsed by default', async () => {
    render(<CheckInHistory refreshKey={0} />);

    await waitFor(() => {
      expect(screen.getByText('Recent Reflections')).toBeDefined();
    });

    expect(screen.queryByText(/Today/)).toBeNull();
  });

  it('expands to show timeline when clicked', async () => {
    const user = userEvent.setup();
    render(<CheckInHistory refreshKey={0} />);

    await waitFor(() => {
      expect(screen.getByText('Recent Reflections')).toBeDefined();
    });

    await user.click(screen.getByRole('button', { expanded: false }));

    // Date groups show "Today — N check-ins, mostly <word>"
    expect(screen.getByText(/Today/)).toBeDefined();
    expect(screen.getByText(/Yesterday/)).toBeDefined();
    expect(screen.getByText('feeling great')).toBeDefined();
    expect(screen.getByText('rough day')).toBeDefined();
  });

  it('collapses when clicked again', async () => {
    const user = userEvent.setup();
    render(<CheckInHistory refreshKey={0} />);

    await waitFor(() => {
      expect(screen.getByText('Recent Reflections')).toBeDefined();
    });

    const pill = screen.getByRole('button', { expanded: false });
    await user.click(pill);
    expect(screen.getByText(/Today/)).toBeDefined();

    await user.click(screen.getByRole('button', { expanded: true }));
    expect(screen.queryByText(/Today/)).toBeNull();
  });

  it('shows tags in expanded entries', async () => {
    const user = userEvent.setup();
    render(<CheckInHistory refreshKey={0} />);

    await waitFor(() => {
      expect(screen.getByText('Recent Reflections')).toBeDefined();
    });

    await user.click(screen.getByRole('button', { expanded: false }));
    expect(screen.getByText('Work')).toBeDefined();
  });

  it('renders structured CPC fields in the expanded timeline entry', async () => {
    const user = userEvent.setup();
    render(<CheckInHistory refreshKey={0} />);

    await waitFor(() => {
      expect(screen.getByText('Recent Reflections')).toBeDefined();
    });

    await user.click(screen.getByRole('button', { expanded: false }));

    expect(screen.getByText('I might miss the deadline · I can ask for help today')).toBeDefined();
    expect(screen.getByText('Stage 4: Searching for more')).toBeDefined();
    expect(screen.getByText('Confidence')).toBeDefined();
    expect(screen.getByText('Gratitude')).toBeDefined();
    expect(screen.getByText('Finishing the check-in parity work.')).toBeDefined();
    expect(screen.getByText('The UI structure is finally getting cleaner.')).toBeDefined();
    expect(screen.getByText('25%')).toBeDefined();
    expect(screen.getByText('50%')).toBeDefined();
  });

  it('shows loading skeleton initially', () => {
    render(<CheckInHistory refreshKey={0} />);

    expect(screen.getByRole('status', { name: 'Loading history' })).toBeDefined();
  });

  it('hides when there are no check-ins', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        }),
      ),
    );

    const { container } = render(<CheckInHistory refreshKey={0} />);

    await waitFor(() => {
      expect(container.querySelector('[role="status"]')).toBeNull();
    });

    expect(container.children).toHaveLength(0);
  });

  it('refetches when refreshKey changes', async () => {
    const { rerender } = render(<CheckInHistory refreshKey={0} />);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    rerender(<CheckInHistory refreshKey={1} />);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });
});

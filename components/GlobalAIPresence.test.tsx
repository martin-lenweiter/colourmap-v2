import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/navigation', () => ({
  usePathname: () => '/missions',
}));

describe('GlobalAIPresence', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('opens a backend AI presence panel and streams a reflection', async () => {
    const fetchMock = vi.fn(async () => new Response('I notice a clean fragment.'));
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();
    const { default: GlobalAIPresence } = await import('./GlobalAIPresence');

    render(<GlobalAIPresence />);

    await user.click(screen.getByRole('button', { name: 'Open AI Presence' }));
    await user.type(
      screen.getByPlaceholderText('Drop the fragment here. What is happening?'),
      'I am stuck.',
    );
    await user.click(screen.getByRole('button', { name: /Reflect/i }));

    await waitFor(() => {
      expect(screen.getByText('I notice a clean fragment.')).toBeTruthy();
    });
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/ai/presence',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ message: 'I am stuck.', surface: 'Missions' }),
      }),
    );
  });
});

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import LearningHub from './LearningHub';

describe('LearningHub', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(Math, 'random').mockReturnValue(0);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('renders education worlds and opens the comic reader with image style choices', () => {
    localStorage.setItem('colourmap:mood-word', 'anxious');
    const onClose = vi.fn();
    const { container } = render(<LearningHub onClose={onClose} />);

    expect(screen.getByText("You're here. That already matters.")).toBeDefined();
    expect(screen.getByText('Knowledge worlds')).toBeDefined();
    expect(screen.getByRole('button', { name: /Living Atlas/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Progress Roads/i })).toBeDefined();
    expect(screen.getByText('start here')).toBeDefined();

    fireEvent.click(screen.getByRole('button', { name: 'images' }));
    expect(localStorage.getItem('colourmap-learn-home-display')).toBe('images');

    const emotionalIntelligence = screen.getByText('Emotional Intelligence').closest('button');
    expect(emotionalIntelligence).not.toBeNull();
    fireEvent.click(emotionalIntelligence as HTMLButtonElement);

    expect(screen.getByRole('button', { name: 'Warm paper' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Minimal' })).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: 'Minimal' }));
    fireEvent.click(screen.getByRole('button', { name: /Begin/i }));

    expect(screen.getByRole('button', { name: 'Next comic page' })).toBeDefined();
    const panelImage = container.querySelector('img[src*="/variants/minimal/panel-0.png"]');
    expect(panelImage).not.toBeNull();
  });
});

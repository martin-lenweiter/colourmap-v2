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
    expect(screen.getByText('Struggle & Letting Go')).toBeDefined();
    expect(screen.getByText('Carl Jung & The Inner Map')).toBeDefined();
    expect(screen.getByText('Paulo Freire & Collective Hope')).toBeDefined();
    expect(screen.getByText('Thich Nhat Hanh & Peace in Action')).toBeDefined();
    expect(screen.getByRole('button', { name: /Living Atlas/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Progress Roads/i })).toBeDefined();
    expect(screen.queryByRole('button', { name: 'atlas' })).toBeNull();
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

  it('opens the Carl Jung comic book', () => {
    const onClose = vi.fn();
    render(<LearningHub onClose={onClose} />);

    const jungProgram = screen.getByText('Carl Jung & The Inner Map').closest('button');
    expect(jungProgram).not.toBeNull();
    fireEvent.click(jungProgram as HTMLButtonElement);

    fireEvent.click(screen.getByRole('button', { name: /Begin/i }));

    expect(screen.getByRole('button', { name: 'Next comic page' })).toBeDefined();
    expect(screen.getByText('The inner world is real material')).toBeDefined();
    expect(screen.getByText(/Dreams, symbols, moods/i)).toBeDefined();
    expect(screen.getByRole('img', { name: /Carl Jung comic page 1/i })).toBeDefined();
  });

  it('opens the Paulo Freire layered comic program', () => {
    const onClose = vi.fn();
    render(<LearningHub onClose={onClose} />);

    const freireProgram = screen.getByText('Paulo Freire & Collective Hope').closest('button');
    expect(freireProgram).not.toBeNull();
    fireEvent.click(freireProgram as HTMLButtonElement);

    expect(screen.getByText('Paulo Freire & Collective Hope')).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: /Begin/i }));

    expect(screen.getByRole('button', { name: 'Next comic page' })).toBeDefined();
    expect(screen.getByRole('img', { name: /Paulo Freire symbolic comic panel 1/i })).toBeDefined();
    expect(screen.getByText('The world is made, so it can be remade')).toBeDefined();
    expect(screen.getByText(/society is not a machine/i)).toBeDefined();
  });

  it('opens the Thich Nhat Hanh landscape comic program', () => {
    const onClose = vi.fn();
    render(<LearningHub onClose={onClose} />);

    const thichProgram = screen.getByText('Thich Nhat Hanh & Peace in Action').closest('button');
    expect(thichProgram).not.toBeNull();
    fireEvent.click(thichProgram as HTMLButtonElement);

    fireEvent.click(screen.getByRole('button', { name: /Begin/i }));

    expect(screen.getByRole('button', { name: 'Next comic page' })).toBeDefined();
    expect(
      screen.getByRole('img', { name: /Thich Nhat Hanh landscape comic panel 1/i }),
    ).toBeDefined();
    expect(screen.getByText('The bell of now')).toBeDefined();
    expect(screen.getByText(/peace begins by returning/i)).toBeDefined();
  });
});

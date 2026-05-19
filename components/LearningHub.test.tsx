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
    expect(screen.getByText('Gandhi & The Power of Small Things')).toBeDefined();
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
    fireEvent.click(screen.getByRole('button', { name: 'Begin Emotional Intelligence' }));

    expect(screen.getByRole('button', { name: 'Next comic page' })).toBeDefined();
    const panelImage = container.querySelector('img[src*="/variants/minimal/panel-0.png"]');
    expect(panelImage).not.toBeNull();
  });

  it('opens the Carl Jung comic book', () => {
    const onClose = vi.fn();
    const { container } = render(<LearningHub onClose={onClose} />);

    const jungProgram = screen.getByText('Carl Jung & The Inner Map').closest('button');
    expect(jungProgram).not.toBeNull();
    fireEvent.click(jungProgram as HTMLButtonElement);

    fireEvent.click(screen.getByRole('button', { name: /Begin Carl Jung & The Inner Map/i }));

    expect(screen.getByRole('button', { name: 'Next comic page' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Part 1 1-6' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Part 2 7-13' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Part 3 14-20' })).toBeDefined();
    expect(screen.getByText('The inner world is real material')).toBeDefined();
    expect(screen.getByText(/Dreams, symbols, moods/i)).toBeDefined();
    expect(screen.getByRole('img', { name: /Carl Jung comic page 1/i })).toBeDefined();
    expect(screen.getByRole('button', { name: 'more' })).toBeDefined();

    fireEvent.click(screen.getByRole('button', { name: 'more' }));
    expect(screen.getByRole('button', { name: 'less' })).toBeDefined();

    fireEvent.click(screen.getByRole('button', { name: 'Part 3 14-20' }));
    const laterImage = screen.getByRole('img', { name: /Carl Jung comic page 14/i });
    expect(laterImage.getAttribute('src')).toBe('/comics/carl-jung/generated/panel-13.png');

    fireEvent.click(screen.getByRole('button', { name: 'Empty bubbles' }));
    const variantImage = screen.getByRole('img', { name: /Carl Jung comic page 14/i });
    expect(variantImage.getAttribute('src')).toBe(
      '/comics/carl-jung/variants/blank-bubbles/panel-13.jpg',
    );
    expect(
      container.querySelector('img[src*="/comics/carl-jung/generated/panel-13.png"]'),
    ).toBeNull();
  });

  it('opens the Paulo Freire layered comic program', () => {
    const onClose = vi.fn();
    render(<LearningHub onClose={onClose} />);

    const freireProgram = screen.getByText('Paulo Freire & Collective Hope').closest('button');
    expect(freireProgram).not.toBeNull();
    fireEvent.click(freireProgram as HTMLButtonElement);

    expect(screen.getByText('Paulo Freire & Collective Hope')).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: 'Begin Paulo Freire & Collective Hope' }));

    expect(screen.getByRole('button', { name: 'Next comic page' })).toBeDefined();
    const freireImage = screen.getByRole('img', {
      name: /Paulo Freire & Collective Hope comic page 1/i,
    });
    expect(freireImage.getAttribute('src')).toBe('/comics/paulo-freire/generated/panel-0.png');
    expect(screen.getByText('The world is made, so it can be remade')).toBeDefined();
    expect(screen.getByText(/society is not a machine/i)).toBeDefined();
    expect(screen.getByRole('button', { name: 'more' })).toBeDefined();
  });

  it('opens the Thich Nhat Hanh landscape comic program', () => {
    const onClose = vi.fn();
    render(<LearningHub onClose={onClose} />);

    const thichProgram = screen.getByText('Thich Nhat Hanh & Peace in Action').closest('button');
    expect(thichProgram).not.toBeNull();
    fireEvent.click(thichProgram as HTMLButtonElement);

    fireEvent.click(
      screen.getByRole('button', { name: 'Begin Thich Nhat Hanh & Peace in Action' }),
    );

    expect(screen.getByRole('button', { name: 'Next comic page' })).toBeDefined();
    const thichImage = screen.getByRole('img', {
      name: /Thich Nhat Hanh & Peace in Action comic page 1/i,
    });
    expect(thichImage.getAttribute('src')).toBe('/comics/thich-nhat-hanh/generated/panel-0.png');
    expect(screen.getByText('The bell of now')).toBeDefined();
    expect(screen.getByText(/peace begins by returning/i)).toBeDefined();
    expect(screen.getByRole('button', { name: 'more' })).toBeDefined();
  });

  it('opens the Gandhi layered comic program', () => {
    const onClose = vi.fn();
    render(<LearningHub onClose={onClose} />);

    const gandhiProgram = screen.getByText('Gandhi & The Power of Small Things').closest('button');
    expect(gandhiProgram).not.toBeNull();
    fireEvent.click(gandhiProgram as HTMLButtonElement);

    fireEvent.click(
      screen.getByRole('button', { name: 'Begin Gandhi & The Power of Small Things' }),
    );

    expect(screen.getByRole('button', { name: 'Next comic page' })).toBeDefined();
    const gandhiImage = screen.getByRole('img', {
      name: /Gandhi & The Power of Small Things comic page 1/i,
    });
    expect(gandhiImage.getAttribute('src')).toBe('/comics/gandhi/generated/panel-0.png');
    expect(screen.getByText('A life begins unfinished')).toBeDefined();
    expect(screen.getByText(/shy, uncertain, ambitious/i)).toBeDefined();
  });
});

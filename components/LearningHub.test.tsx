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

  it('renders education worlds and opens the comic reader with image style choices', async () => {
    localStorage.setItem('colourmap:mood-word', 'anxious');
    const onClose = vi.fn();
    const { container } = render(<LearningHub onClose={onClose} />);

    expect(await screen.findByText("You're here. That already matters.")).toBeDefined();
    expect(screen.getByText('Knowledge worlds')).toBeDefined();
    expect(screen.queryByText(/Life is not fixed/i)).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Education' }));
    expect(screen.getByText(/Life is not fixed/i)).toBeDefined();
    expect(screen.getByText(/participate in transforming the world/i)).toBeDefined();
    expect(screen.getByText('Struggle & Letting Go')).toBeDefined();
    expect(screen.getByText('Carl Jung & The Inner Map')).toBeDefined();
    expect(screen.getByText('Paulo Freire & Collective Hope')).toBeDefined();
    expect(screen.getByText('Thich Nhat Hanh & Peace in Action')).toBeDefined();
    expect(screen.getByText('Gandhi & The Power of Small Things')).toBeDefined();
    expect(screen.getByText('Clear & Allen: Organisation As Freedom')).toBeDefined();
    expect(screen.getByText('Entertainment')).toBeDefined();
    expect(screen.getByText('Pineapple Planet')).toBeDefined();
    expect(screen.getByText('Colourmap Vision Comic')).toBeDefined();
    expect(screen.getByRole('button', { name: /Living Atlas/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Progress Roads/i })).toBeDefined();
    expect(screen.queryByRole('button', { name: 'atlas' })).toBeNull();
    expect(screen.getByText('start here')).toBeDefined();
    expect(
      container.querySelector('img[src="/comics/room-to-breathe/panel-2.png"]'),
    ).not.toBeNull();
    expect(
      container.querySelector('img[src="/comics/emotional-intelligence/panel-5.png"]'),
    ).not.toBeNull();

    const hubText = container.textContent ?? '';
    expect(hubText.indexOf('Carl Jung & The Inner Map')).toBeLessThan(
      hubText.indexOf('Gandhi & The Power of Small Things'),
    );
    expect(hubText.indexOf('Gandhi & The Power of Small Things')).toBeLessThan(
      hubText.indexOf('Clear & Allen: Organisation As Freedom'),
    );
    expect(hubText.indexOf('Knowledge worlds')).toBeGreaterThan(
      hubText.lastIndexOf('Intelligence'),
    );
    expect(hubText.indexOf('Pineapple Planet')).toBeLessThan(hubText.indexOf('Personality Map'));
    expect(hubText.indexOf('Colourmap Vision Comic')).toBeLessThan(
      hubText.indexOf('Personality Map'),
    );

    expect(screen.queryByRole('button', { name: 'images' })).toBeNull();
    expect(screen.getByText('image paths')).toBeDefined();

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
  }, 30000);

  it('opens the Colourmap Vision Comic from the entertainment lane', () => {
    render(<LearningHub onClose={vi.fn()} />);

    const visionComic = screen.getByText('Colourmap Vision Comic').closest('button');
    expect(visionComic).not.toBeNull();
    fireEvent.click(visionComic as HTMLButtonElement);

    fireEvent.click(screen.getByRole('button', { name: /Begin Colourmap Vision Comic/i }));
    expect(screen.getByText('A living map, not a pile')).toBeDefined();
    expect(screen.getByText(/It is a living map of knowledge/i)).toBeDefined();
    expect(screen.getByRole('button', { name: 'Next' })).toBeDefined();
  });

  it('opens the Carl Jung comic book', () => {
    const onClose = vi.fn();
    const { container } = render(<LearningHub onClose={onClose} />);

    const jungProgram = screen.getByText('Carl Jung & The Inner Map').closest('button');
    expect(jungProgram).not.toBeNull();
    fireEvent.click(jungProgram as HTMLButtonElement);

    fireEvent.click(screen.getByRole('button', { name: /Begin Carl Jung & The Inner Map/i }));

    expect(screen.getByRole('button', { name: 'Reveal comic text' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Part 1 1-6' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Part 2 7-13' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Part 3 14-20' })).toBeDefined();
    expect(screen.queryByText('The inner world is real material')).toBeNull();
    const firstImage = screen.getByRole('img', { name: /Carl Jung comic page 1/i });
    expect(firstImage.getAttribute('src')).toBe(
      '/comics/carl-jung/variants/no-bubbles/panel-0.jpg',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Reveal comic text' }));
    expect(screen.getByText('The inner world is real material')).toBeDefined();
    expect(screen.getByText(/Dreams, symbols, moods/i)).toBeDefined();

    fireEvent.click(screen.getByRole('button', { name: 'Show second comic image' }));
    const cleanImage = screen.getByRole('img', { name: /Carl Jung comic page 1/i });
    expect(cleanImage.getAttribute('src')).toBe('/comics/carl-jung/generated/panel-0.png');

    fireEvent.click(screen.getByRole('button', { name: 'Reveal deeper comic text' }));
    expect(screen.getByText(/They are clues from a deeper field/i)).toBeDefined();
    expect(screen.queryByText('The inner world is real material')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Part 3 14-20' }));
    const laterImage = screen.getByRole('img', { name: /Carl Jung comic page 14/i });
    expect(laterImage.getAttribute('src')).toBe(
      '/comics/carl-jung/variants/no-bubbles/panel-13.jpg',
    );
    expect(
      container.querySelector('img[src*="/comics/carl-jung/generated/panel-13.png"]'),
    ).toBeNull();
  });

  it('adds reflection questions at the end of each Carl Jung part', () => {
    render(<LearningHub onClose={vi.fn()} />);

    const jungProgram = screen.getByText('Carl Jung & The Inner Map').closest('button');
    expect(jungProgram).not.toBeNull();
    fireEvent.click(jungProgram as HTMLButtonElement);
    fireEvent.click(screen.getByRole('button', { name: /Begin Carl Jung & The Inner Map/i }));

    fireEvent.click(screen.getByRole('button', { name: 'Open page 6' }));
    fireEvent.click(screen.getByRole('button', { name: 'Reveal comic text' }));
    fireEvent.click(screen.getByRole('button', { name: 'Show second comic image' }));
    fireEvent.click(screen.getByRole('button', { name: 'Reveal deeper comic text' }));

    expect(screen.getByText('End of Part 1')).toBeDefined();
    expect(screen.getByText(/What inner signal keeps returning/i)).toBeDefined();
    expect(screen.getByText(/hidden part of you may be asking/i)).toBeDefined();
    expect(screen.queryByText('The collective unconscious')).toBeNull();
  });

  it('opens the Paulo Freire layered comic program', () => {
    const onClose = vi.fn();
    render(<LearningHub onClose={onClose} />);

    const freireProgram = screen.getByText('Paulo Freire & Collective Hope').closest('button');
    expect(freireProgram).not.toBeNull();
    fireEvent.click(freireProgram as HTMLButtonElement);

    expect(screen.getByText('Paulo Freire & Collective Hope')).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: 'Begin Paulo Freire & Collective Hope' }));

    expect(screen.getByRole('button', { name: 'Reveal comic text' })).toBeDefined();
    const freireImage = screen.getByRole('img', {
      name: /Paulo Freire & Collective Hope comic page 1/i,
    });
    expect(freireImage.getAttribute('src')).toBe('/comics/paulo-freire/generated/panel-0.png');
    expect(screen.queryByText('The world is made, so it can be remade')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Reveal comic text' }));
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

    expect(screen.getByRole('button', { name: 'Reveal comic text' })).toBeDefined();
    const thichImage = screen.getByRole('img', {
      name: /Thich Nhat Hanh & Peace in Action comic page 1/i,
    });
    expect(thichImage.getAttribute('src')).toBe('/comics/thich-nhat-hanh/generated/panel-0.png');
    expect(screen.queryByText('The bell of now')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Reveal comic text' }));
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

    expect(screen.getByRole('button', { name: 'Reveal comic text' })).toBeDefined();
    const gandhiImage = screen.getByRole('img', {
      name: /Gandhi & The Power of Small Things comic page 1/i,
    });
    expect(gandhiImage.getAttribute('src')).toBe('/comics/gandhi/generated/panel-0.png');
    expect(screen.queryByText('A life begins unfinished')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Reveal comic text' }));
    expect(screen.getByText('A life begins unfinished')).toBeDefined();
    expect(screen.getByText(/shy, uncertain, ambitious/i)).toBeDefined();
  });

  it('opens the Clear and Allen organisation comic program', () => {
    render(<LearningHub onClose={vi.fn()} />);

    const clearAllenProgram = screen
      .getByText('Clear & Allen: Organisation As Freedom')
      .closest('button');
    expect(clearAllenProgram).not.toBeNull();
    fireEvent.click(clearAllenProgram as HTMLButtonElement);

    fireEvent.click(
      screen.getByRole('button', { name: 'Begin Clear & Allen: Organisation As Freedom' }),
    );

    expect(screen.getByRole('button', { name: 'Reveal comic text' })).toBeDefined();
    const clearAllenImage = screen.getByRole('img', {
      name: /Clear & Allen: Organisation As Freedom comic page 1/i,
    });
    expect(clearAllenImage.getAttribute('src')).toBe('/comics/clear-allen/generated/panel-0.png');
    expect(screen.queryByText('Part 1: James Clear')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Reveal comic text' }));
    expect(screen.getByText('Part 1: James Clear')).toBeDefined();
    expect(screen.getByText(/tiny repeated systems/i)).toBeDefined();
  });
});

// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import ProportionBuddy from './ProportionBuddy';

describe('ProportionBuddy', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it('opens with the sculpture project defaults and reusable ratios', () => {
    render(<ProportionBuddy />);

    expect(screen.getByRole('heading', { name: 'Proportion Buddy' })).toBeDefined();
    expect(screen.getByLabelText('total cm')).toHaveProperty('value', '84');
    expect(screen.getByLabelText('bottom arms centimeters')).toHaveProperty('value', '17');
    expect(screen.getByLabelText('elbow center centimeters')).toHaveProperty('value', '27');
    expect(screen.getByLabelText('shirt opening V centimeters')).toHaveProperty('value', '48');
    expect(screen.getByLabelText('head base centimeters')).toHaveProperty('value', '62');

    const ratios = screen.getByLabelText('Reusable proportion ratios');
    expect(within(ratios).getByText('head size')).toBeDefined();
    expect(within(ratios).getByText(/22\.0cm . 26\.2% . 1:3\.82/)).toBeDefined();
    expect(within(ratios).getByText('shirt opening')).toBeDefined();
    expect(within(ratios).getByText(/48\.0cm . 57\.1% . 1:1\.75/)).toBeDefined();
  });

  it('shows the sculpture landmark guide labels on the stage', () => {
    render(<ProportionBuddy />);

    expect(screen.getByLabelText('bottom arms 17cm')).toBeDefined();
    expect(screen.getByLabelText('elbow center 27cm')).toBeDefined();
    expect(screen.getByLabelText('shirt opening V 48cm')).toBeDefined();
    expect(screen.getByLabelText('bottom chin 60cm')).toBeDefined();
    expect(screen.getByLabelText('visible armpits 41cm')).toBeDefined();
    expect(screen.getByLabelText('arms crossing top 34cm')).toBeDefined();
    expect(screen.getByLabelText('arms crossing bottom 24cm')).toBeDefined();
    expect(screen.getByLabelText('head base 62cm')).toBeDefined();
    expect(screen.getByLabelText('Head guide band')).toBeDefined();
  });

  it('opens with three selectable reference images and AI suggestions', () => {
    render(<ProportionBuddy />);

    expect(screen.getByRole('button', { name: 'Image 1' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Image 2' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Image 3' })).toBeDefined();
    expect(screen.getByRole('img', { name: 'Image 2 sculpture reference' })).toBeDefined();

    fireEvent.click(screen.getByRole('button', { name: 'Image 3' }));
    expect(screen.getByRole('img', { name: 'Image 3 sculpture reference' })).toBeDefined();

    fireEvent.click(screen.getByRole('button', { name: 'AI suggestions' }));
    expect(screen.getByLabelText('AI proportion suggestions')).toBeDefined();
    expect(screen.getByText(/Keep bottom of arms locked near 17cm/)).toBeDefined();
  });

  it('can hide a default landmark and switch to triangle guides', () => {
    render(<ProportionBuddy />);

    fireEvent.click(screen.getByLabelText('Show shirt opening V'));
    expect(screen.queryByLabelText('shirt opening V 48cm')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Triangle guides' }));
    expect(screen.getByLabelText('Triangle proportion guides')).toBeDefined();
  });

  it('adds and saves custom landmarks for sculpture-specific reference points', () => {
    render(<ProportionBuddy />);

    fireEvent.change(screen.getByLabelText('New landmark name'), {
      target: { value: 'shirt split' },
    });
    fireEvent.change(screen.getByLabelText('New landmark centimeters'), {
      target: { value: '46' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Add landmark' }));

    expect(screen.getByLabelText('shirt split 46cm')).toBeDefined();
    expect(screen.getByLabelText('shirt split name')).toHaveProperty('value', 'shirt split');
    expect(localStorage.getItem('colourmap:proportion-buddy')).toContain('shirt split');
  });

  it('loads a saved reference image without overwriting it during hydration', async () => {
    localStorage.setItem(
      'colourmap:proportion-buddy',
      JSON.stringify({
        image: 'data:image/svg+xml;base64,PHN2Zy8+',
        totalHeight: 84,
        armsBottom: 17,
      }),
    );

    render(<ProportionBuddy />);

    const image = await screen.findByRole('img', { name: 'Image 1 sculpture reference' });
    expect(image.getAttribute('src')).toBe('data:image/svg+xml;base64,PHN2Zy8+');
    expect(localStorage.getItem('colourmap:proportion-buddy')).toContain(
      'data:image/svg+xml;base64,PHN2Zy8+',
    );
  });
});

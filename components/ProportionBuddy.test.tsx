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
    expect(screen.getByLabelText('top skull centimeters')).toHaveProperty('value', '82');
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

  it('opens with the picture clean until grid and proportion overlays are enabled', () => {
    render(<ProportionBuddy />);

    expect(screen.queryByLabelText('bottom arms 17cm')).toBeNull();
    expect(screen.queryByLabelText('Head guide band')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Grid' }));
    expect(within(screen.getByTestId('proportion-stage')).getAllByText('80cm')).toHaveLength(2);
    expect(within(screen.getByTestId('proportion-stage')).getAllByText('0cm')).toHaveLength(1);
    expect(screen.getByLabelText('Horizontal centimeter ruler')).toBeDefined();
    expect(
      screen.getByTestId('proportion-stage').querySelectorAll('[data-x-grid-line]'),
    ).toHaveLength(10);

    fireEvent.click(screen.getByRole('button', { name: 'Proportions' }));
    fireEvent.click(screen.getByRole('button', { name: 'Labels' }));

    expect(screen.getByLabelText('top skull 82cm')).toBeDefined();
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

  it('opens with selectable reference images and AI suggestions', () => {
    render(<ProportionBuddy />);

    expect(screen.getByRole('button', { name: 'Face' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Front' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Front 2' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Left' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Board' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Plinth' })).toBeDefined();
    expect(screen.getByRole('img', { name: 'Front sculpture reference' })).toBeDefined();
    expect(screen.getByLabelText('move up / down-4%')).toBeDefined();
    expect(screen.getByLabelText('size106%')).toBeDefined();
    expect(screen.getByLabelText('0 cm line0%')).toBeDefined();
    expect(screen.getByLabelText('height100%')).toBeDefined();
    expect(screen.getByRole('button', { name: 'Fix this' })).toBeDefined();

    fireEvent.click(screen.getByRole('button', { name: 'Left' }));
    expect(screen.getByRole('img', { name: 'Left sculpture reference' })).toBeDefined();

    fireEvent.click(screen.getByRole('button', { name: 'AI' }));
    expect(screen.getByLabelText('AI proportion suggestions')).toBeDefined();
    expect(screen.getByText(/Use bottom of arms near 17cm/)).toBeDefined();
  });

  it('moves and zooms the active image against the fixed grid', () => {
    render(<ProportionBuddy />);

    fireEvent.change(screen.getByLabelText('move up / down-4%'), { target: { value: '-120' } });
    fireEvent.change(screen.getByLabelText('size106%'), { target: { value: '180' } });
    fireEvent.change(screen.getByLabelText('0 cm line0%'), { target: { value: '42' } });
    fireEvent.change(screen.getByLabelText('height100%'), { target: { value: '180' } });

    const image = screen.getByRole('img', { name: 'Front sculpture reference' });
    expect(image.getAttribute('style')).toContain('-120%');
    expect(image.getAttribute('style')).toContain('width: 180%');
    expect(image.getAttribute('style')).toContain('height: auto');
    expect(screen.getByLabelText('0 cm line42%')).toBeDefined();
    expect(screen.getByLabelText('height180%')).toBeDefined();
  });

  it('locks placement controls for the active image when fixed', () => {
    render(<ProportionBuddy />);

    fireEvent.change(screen.getByLabelText('height100%'), { target: { value: '180' } });
    fireEvent.change(screen.getByLabelText('0 cm line0%'), { target: { value: '42' } });
    fireEvent.click(screen.getByRole('button', { name: 'Fix this' }));

    expect(screen.getByRole('button', { name: 'Unfix' })).toBeDefined();
    expect(screen.getByLabelText('move up / down-4%')).toHaveProperty('disabled', true);
    expect(screen.getByLabelText('size106%')).toHaveProperty('disabled', true);
    expect(screen.getByLabelText('0 cm line42%')).toHaveProperty('disabled', true);
    expect(screen.getByLabelText('height180%')).toHaveProperty('disabled', true);
    expect(localStorage.getItem('colourmap:proportion-buddy')).toContain('"fixed":true');
    expect(localStorage.getItem('colourmap:proportion-buddy')).toContain('"gridHeight":180');
    expect(localStorage.getItem('colourmap:proportion-buddy')).toContain('"baseOffset":42');

    fireEvent.click(screen.getByRole('button', { name: 'Unfix' }));
    expect(screen.getByLabelText('size106%')).toHaveProperty('disabled', false);
  });

  it('can hide a default landmark and switch to triangle guides', () => {
    render(<ProportionBuddy />);

    fireEvent.click(screen.getByRole('button', { name: 'Proportions' }));
    fireEvent.click(screen.getByRole('button', { name: 'Labels' }));
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

    fireEvent.click(screen.getByRole('button', { name: 'Proportions' }));
    fireEvent.click(screen.getByRole('button', { name: 'Labels' }));
    expect(screen.getByLabelText('shirt split 46cm')).toBeDefined();
    expect(screen.getByLabelText('shirt split name')).toHaveProperty('value', 'shirt split');
    expect(localStorage.getItem('colourmap:proportion-buddy')).toContain('shirt split');
  });

  it('resets stale saved placement so the project grid defaults take effect', async () => {
    localStorage.setItem(
      'colourmap:proportion-buddy',
      JSON.stringify({
        image: 'data:image/svg+xml;base64,PHN2Zy8+',
        totalHeight: 84,
        armsBottom: 17,
      }),
    );

    render(<ProportionBuddy />);

    const image = await screen.findByRole('img', { name: 'Front sculpture reference' });
    expect(image.getAttribute('src')).toBe('/proportion-buddy/prop-2.png');
    expect(screen.getByLabelText('top skull centimeters')).toHaveProperty('value', '82');
  });

  it('loads a current-version saved reference image without overwriting it during hydration', async () => {
    localStorage.setItem(
      'colourmap:proportion-buddy',
      JSON.stringify({
        version: 5,
        activeReferenceId: 'image-1',
        references: [
          {
            id: 'image-1',
            name: 'Face',
            image: 'data:image/svg+xml;base64,PHN2Zy8+',
            offsetX: 0,
            offsetY: -7,
            zoom: 108,
            stretchY: 108,
            topCrop: 0,
            bottomCrop: 100,
            baseOffset: 0,
            gridHeight: 100,
            fixed: false,
          },
        ],
      }),
    );

    render(<ProportionBuddy />);

    const image = await screen.findByRole('img', { name: 'Face sculpture reference' });
    expect(image.getAttribute('src')).toBe('data:image/svg+xml;base64,PHN2Zy8+');
  });
});

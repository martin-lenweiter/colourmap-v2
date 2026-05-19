import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import BillyInfiniteComic from './BillyInfiniteComic';

describe('BillyInfiniteComic', () => {
  afterEach(() => {
    cleanup();
  });

  it('reveals text over the first Billy panel and advances to the next panel', () => {
    render(<BillyInfiniteComic />);

    expect(screen.getByText('Billy & The Quest For Juice')).toBeDefined();
    expect(screen.getByAltText('Billy Leaves The Sofa Zone comic panel')).toBeDefined();
    expect(screen.queryByText('Billy Leaves The Sofa Zone')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Reveal Billy comic text' }));
    expect(screen.getByText('Billy Leaves The Sofa Zone')).toBeDefined();
    expect(screen.getByText(/Billy had a home/i)).toBeDefined();

    fireEvent.click(screen.getByRole('button', { name: 'Next Billy comic beat' }));
    expect(screen.getByText(/The cup kept feeling important/i)).toBeDefined();

    fireEvent.click(screen.getByText('next'));
    expect(screen.getByAltText('The Arrows Disagree comic panel')).toBeDefined();
  });
});

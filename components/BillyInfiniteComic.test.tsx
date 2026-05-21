import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import BillyInfiniteComic from './BillyInfiniteComic';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe('BillyInfiniteComic', () => {
  afterEach(() => {
    cleanup();
  });

  it('uses right and left image zones to reveal, advance, and go back', () => {
    render(<BillyInfiniteComic />);

    expect(screen.getAllByText('Pineapple Planet').length).toBeGreaterThan(0);
    expect(screen.getAllByRole('button', { name: 'Education' }).length).toBeGreaterThan(0);
    expect(screen.getByAltText('Pineapple Planet intro')).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: 'Begin the quest' }));
    expect(screen.getByAltText('Billy Leaves The Sofa Zone comic panel')).toBeDefined();
    expect(screen.queryByText('Billy Leaves The Sofa Zone')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Reveal Billy comic text' }));
    expect(screen.getByText('Billy Leaves The Sofa Zone')).toBeDefined();
    expect(screen.getByText(/Billy had a home/i)).toBeDefined();
    expect(screen.getByText(/The cup kept feeling important/i)).toBeDefined();

    fireEvent.click(screen.getByRole('button', { name: 'Next Billy comic beat' }));
    expect(screen.getByAltText('The Arrows Disagree comic panel')).toBeDefined();
    expect(screen.getByText('Page 2')).toBeDefined();

    fireEvent.click(screen.getByRole('button', { name: 'Previous Billy comic panel' }));
    expect(screen.getByAltText('Billy Leaves The Sofa Zone comic panel')).toBeDefined();
    expect(screen.queryByText('Billy Leaves The Sofa Zone')).toBeNull();
    expect(screen.getByText('Page 1')).toBeDefined();
  });
});

// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import EducationPage from './page';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe('EducationPage', () => {
  afterEach(() => {
    cleanup();
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('renders the comic education hub', () => {
    render(<EducationPage />);

    expect(screen.getByText('Knowledge worlds')).toBeDefined();
    expect(screen.getByText('Carl Jung & The Inner Map')).toBeDefined();
    expect(screen.getByText('Paulo Freire & Collective Hope')).toBeDefined();
    expect(screen.getByText('Thich Nhat Hanh & Peace in Action')).toBeDefined();
  });
});

// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import FirstRunOnboarding from './FirstRunOnboarding';

describe('FirstRunOnboarding', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  it('renders nothing when the user is already onboarded', () => {
    localStorage.setItem('colourmap:onboarded', 'true');
    const { container } = render(<FirstRunOnboarding />);
    expect(container.firstChild).toBeNull();
  });

  it('shows step 1 on first load', () => {
    render(<FirstRunOnboarding />);
    expect(screen.getByRole('dialog')).toBeDefined();
    expect(screen.getByRole('heading', { name: 'Welcome' })).toBeDefined();
  });

  it('advances to the next step when Next is clicked', () => {
    render(<FirstRunOnboarding />);
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByRole('heading', { name: 'The rhythm' })).toBeDefined();
  });

  it('shows Start my map on the final step', () => {
    render(<FirstRunOnboarding />);
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByRole('button', { name: /start my map/i })).toBeDefined();
  });

  it('closes and marks onboarded when Start my map is tapped', () => {
    render(<FirstRunOnboarding />);
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    fireEvent.click(screen.getByRole('button', { name: /start my map/i }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(localStorage.getItem('colourmap:onboarded')).toBe('true');
  });

  it('closes and marks onboarded when Skip is tapped', () => {
    render(<FirstRunOnboarding />);
    fireEvent.click(screen.getByRole('button', { name: 'skip' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(localStorage.getItem('colourmap:onboarded')).toBe('true');
  });

  it('closes and marks onboarded when × is tapped at any step', () => {
    render(<FirstRunOnboarding />);
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    fireEvent.click(screen.getByRole('button', { name: /skip welcome/i }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(localStorage.getItem('colourmap:onboarded')).toBe('true');
  });
});

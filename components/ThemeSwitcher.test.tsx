// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import ThemeSwitcher from './ThemeSwitcher';

const { usePathname } = vi.hoisted(() => ({
  usePathname: vi.fn(() => '/'),
}));

vi.mock('next/navigation', () => ({
  usePathname,
}));

describe('ThemeSwitcher', () => {
  beforeEach(() => {
    document.documentElement.className = '';
    document.documentElement.style.cssText = '';
    usePathname.mockReturnValue('/');
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders the Design toggle button', () => {
    render(<ThemeSwitcher />);

    expect(screen.getByLabelText('Design settings')).toBeDefined();
  });

  it('defaults new users to Paper with Beige preset 2 titles', () => {
    render(<ThemeSwitcher />);

    expect(localStorage.setItem).toHaveBeenCalledWith('colourmap-theme', 'paper');
    expect(localStorage.setItem).toHaveBeenCalledWith('colourmap-palette', 'light-brown');
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'colourmap-titles-custom-v2',
      JSON.stringify({ 'light-brown': { l1: 'b5', l2: 'b6', l3: 'b6' } }),
    );
    expect(document.documentElement.style.getPropertyValue('--header-bg')).toBe(
      'rgba(168,112,64,0.92)',
    );
  });

  it('shows color theme options when opened', async () => {
    const user = userEvent.setup();
    render(<ThemeSwitcher />);

    await user.click(screen.getByLabelText('Design settings'));

    expect(screen.getByText('Paper')).toBeDefined();
    expect(screen.getByText('Golden')).toBeDefined();
    expect(screen.getByText('Night')).toBeDefined();
  });

  it('switches to Golden theme on click', async () => {
    const user = userEvent.setup();
    render(<ThemeSwitcher />);

    await user.click(screen.getByLabelText('Design settings'));
    await user.click(screen.getByText('Golden'));

    expect(document.documentElement.classList.contains('golden')).toBe(true);
    expect(localStorage.setItem).toHaveBeenCalledWith('colourmap-theme', 'golden');
  });

  it('switches to Night theme on click', async () => {
    const user = userEvent.setup();
    render(<ThemeSwitcher />);

    await user.click(screen.getByLabelText('Design settings'));
    await user.click(screen.getByText('Night'));

    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.setItem).toHaveBeenCalledWith('colourmap-theme', 'night');
  });

  it('removes previous theme class when switching', async () => {
    const user = userEvent.setup();
    render(<ThemeSwitcher />);

    // Apply Night theme
    await user.click(screen.getByLabelText('Design settings'));
    await user.click(screen.getByText('Night'));
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    // Menu may close after click, reopen and switch to Golden
    if (!screen.queryByText('Golden')) {
      await user.click(screen.getByLabelText('Design settings'));
    }
    await user.click(screen.getByText('Golden'));
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(document.documentElement.classList.contains('golden')).toBe(true);
  });

  it('loads saved theme from localStorage', () => {
    (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue('night');
    render(<ThemeSwitcher />);

    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('shows the three additional night variants', async () => {
    const user = userEvent.setup();
    render(<ThemeSwitcher />);

    await user.click(screen.getByLabelText('Design settings'));

    expect(screen.getByText('Night Brown')).toBeDefined();
    expect(screen.getByText('Night Blue')).toBeDefined();
    expect(screen.getByText('Night Purple')).toBeDefined();
  });

  it('applies both dark and night-blue classes when Night Blue is selected', async () => {
    const user = userEvent.setup();
    render(<ThemeSwitcher />);

    await user.click(screen.getByLabelText('Design settings'));
    await user.click(screen.getByText('Night Blue'));

    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.classList.contains('night-blue')).toBe(true);
    expect(localStorage.setItem).toHaveBeenCalledWith('colourmap-theme', 'night-blue');
  });

  it('removes all night-variant classes when switching back to Paper', async () => {
    const user = userEvent.setup();
    render(<ThemeSwitcher />);

    await user.click(screen.getByLabelText('Design settings'));
    await user.click(screen.getByText('Night Purple'));
    expect(document.documentElement.classList.contains('night-purple')).toBe(true);

    if (!screen.queryByText('Paper')) {
      await user.click(screen.getByLabelText('Design settings'));
    }
    await user.click(screen.getByText('Paper'));
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(document.documentElement.classList.contains('night-purple')).toBe(false);
    expect(document.documentElement.classList.contains('night-blue')).toBe(false);
    expect(document.documentElement.classList.contains('night-brown')).toBe(false);
  });

  it('returns Paper and Golden to a light Beige title palette after a night mode', async () => {
    const user = userEvent.setup();
    render(<ThemeSwitcher />);

    await user.click(screen.getByLabelText('Design settings'));
    await user.click(screen.getByText('Night Blue'));
    expect(localStorage.setItem).toHaveBeenCalledWith('colourmap-palette', 'navy');

    if (!screen.queryByText('Golden')) {
      await user.click(screen.getByLabelText('Design settings'));
    }
    await user.click(screen.getByText('Golden'));

    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(document.documentElement.classList.contains('golden')).toBe(true);
    expect(localStorage.setItem).toHaveBeenCalledWith('colourmap-palette', 'light-brown');
    expect(document.documentElement.style.getPropertyValue('--header-bg')).toBe(
      'rgba(168,112,64,0.92)',
    );
  });

  it('shows Titles tab when clicked', async () => {
    const user = userEvent.setup();
    render(<ThemeSwitcher />);

    await user.click(screen.getByLabelText('Design settings'));
    await user.click(screen.getByText('Titles'));

    expect(screen.getByText('Beige')).toBeDefined();
    expect(screen.getByText('Brown')).toBeDefined();
    expect(screen.queryByText('Full header')).toBeNull();
  });

  it('automatically applies Night Brown inside Build Lab', () => {
    usePathname.mockReturnValue('/build-lab');

    render(<ThemeSwitcher />);

    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.classList.contains('night-brown')).toBe(true);
    expect(localStorage.setItem).toHaveBeenCalledWith('colourmap-theme', 'night-brown');
    expect(localStorage.setItem).toHaveBeenCalledWith('colourmap-palette', 'brown');
  });

  it('keeps separate dark ink variables for light-surface pills on Paper', () => {
    (localStorage.getItem as ReturnType<typeof vi.fn>).mockImplementation((key: string) => {
      if (key === 'colourmap-theme') return 'paper';
      if (key === 'colourmap-palette') return 'light-brown';
      return null;
    });

    render(<ThemeSwitcher />);

    expect(document.documentElement.style.getPropertyValue('--light-surface-text')).toContain(
      '30,16,8',
    );
    expect(document.documentElement.style.getPropertyValue('--light-surface-muted')).toContain(
      '30,16,8',
    );
    expect(document.documentElement.style.getPropertyValue('--light-pill-text')).toContain(
      '30,16,8',
    );
    expect(document.documentElement.style.getPropertyValue('--light-pill-muted')).toContain(
      '30,16,8',
    );
  });

  it('always applies the full header background to navigation', () => {
    render(<ThemeSwitcher />);

    expect(document.documentElement.style.getPropertyValue('--nav-bg')).toBe('var(--header-bg)');
  });
});

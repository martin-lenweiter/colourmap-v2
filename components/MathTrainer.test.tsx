import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import MathTrainer from './MathTrainer';

const mathProgram = {
  key: 'math-trainer',
  domain: 'Math Trainer',
  color: '#6B9B4E',
  segments: [{ title: 't', body: 'b' }],
};

describe('MathTrainer', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it('walks home → operation → level → tips → practice and accepts a correct answer', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    render(<MathTrainer program={mathProgram} onClose={vi.fn()} />);

    expect(screen.getByRole('heading', { name: 'Math Trainer' })).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: /Addition/i }));

    expect(screen.getByText('Seven levels +')).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: 'Open level 1: Single digits' }));

    expect(screen.getByText('Tips and tricks')).toBeDefined();
    expect(screen.getByText(/Memorise doubles/)).toBeDefined();
    expect(screen.getByText('Worked examples')).toBeDefined();

    fireEvent.click(screen.getByRole('button', { name: /Start practice/i }));
    expect(screen.getByText(/Question 1\/10/)).toBeDefined();

    const input = screen.getByLabelText('Answer') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '4' } });
    fireEvent.click(screen.getByRole('button', { name: 'Check' }));
    expect(screen.getByText('Correct.')).toBeDefined();

    vi.restoreAllMocks();
  });

  it('flags a wrong answer and shows the expected value', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    render(<MathTrainer program={mathProgram} onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /Subtraction/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Open level 5: Going below zero' }));
    fireEvent.click(screen.getByRole('button', { name: /Start practice/i }));

    const input = screen.getByLabelText('Answer') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '999' } });
    fireEvent.click(screen.getByRole('button', { name: 'Check' }));
    expect(screen.getByText(/Not quite/)).toBeDefined();
    vi.restoreAllMocks();
  });

  it('toggles the timer and persists the choice to localStorage', () => {
    render(<MathTrainer program={mathProgram} onClose={vi.fn()} />);
    const toggle = screen.getByRole('button', { name: /Timer: off/i });
    fireEvent.click(toggle);
    expect(screen.getByRole('button', { name: /Timer: on/i })).toBeDefined();
    expect(localStorage.getItem('colourmap:math-trainer:timer')).toBe('on');
  });
});

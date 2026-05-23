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
    expect(screen.getAllByText(/Memorise doubles/).length).toBeGreaterThan(0);
    expect(screen.getAllByText('Worked examples').length).toBeGreaterThan(0);

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

  it('toggles sound and persists the choice', () => {
    render(<MathTrainer program={mathProgram} onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /Sound: on/i }));
    expect(screen.getByRole('button', { name: /Sound: off/i })).toBeDefined();
    expect(localStorage.getItem('colourmap:math-trainer:sound')).toBe('off');
  });

  it('switches the session length and persists it', () => {
    render(<MathTrainer program={mathProgram} onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Session of 5 questions' }));
    expect(localStorage.getItem('colourmap:math-trainer:session-length')).toBe('5');
  });

  it('opens the algebra track and renders L1 tips', () => {
    render(<MathTrainer program={mathProgram} onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /Algebra/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Open level 1: Find x: x + n = result' }));
    expect(screen.getAllByText(/undo the operation/).length).toBeGreaterThan(0);
  });

  it('opens the fractions track and renders the simplify level', () => {
    render(<MathTrainer program={mathProgram} onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /Fractions/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Open level 1: Simplify fractions' }));
    expect(screen.getAllByText(/greatest common factor/).length).toBeGreaterThan(0);
  });

  it('launches the 60s sprint from the tips screen', () => {
    vi.useFakeTimers();
    render(<MathTrainer program={mathProgram} onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /Addition/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Open level 1: Single digits' }));
    fireEvent.click(screen.getByRole('button', { name: /60s sprint/i }));
    expect(screen.getByText(/Addition sprint/)).toBeDefined();
    expect(screen.getByText(/⏱ 60s/)).toBeDefined();
    vi.useRealTimers();
  });

  it('records a weak spot when an answer is wrong', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    render(<MathTrainer program={mathProgram} onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /Addition/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Open level 1: Single digits' }));
    fireEvent.click(screen.getByRole('button', { name: /Start practice/i }));

    const input = screen.getByLabelText('Answer') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '999' } });
    fireEvent.click(screen.getByRole('button', { name: 'Check' }));

    const stored = JSON.parse(localStorage.getItem('colourmap:math-trainer:weak-spots') ?? '{}');
    expect(stored['add-1']?.failures).toBe(1);
    vi.restoreAllMocks();
  });
});

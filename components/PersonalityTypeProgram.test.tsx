import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import PersonalityTypeProgram from './PersonalityTypeProgram';

describe('PersonalityTypeProgram', () => {
  afterEach(() => {
    cleanup();
  });

  it('runs the Colourmap story lens test through to a result', () => {
    render(<PersonalityTypeProgram onClose={vi.fn()} onBack={vi.fn()} />);

    expect(screen.getByText('Personality Map')).toBeDefined();
    expect(screen.getByText('Story Lens test')).toBeDefined();

    for (let i = 0; i < 12; i++) {
      fireEvent.click(screen.getByRole('button', { name: 'yes, often' }));
    }

    expect(screen.getByText('Your current style')).toBeDefined();
    expect(screen.getByText(/Your story, seen through your lens/i)).toBeDefined();
    expect(screen.getByText('Next scene')).toBeDefined();
  });

  it('lets unclear answers be marked as confused and revisited later', () => {
    render(<PersonalityTypeProgram onClose={vi.fn()} onBack={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'what does this mean?' }));
    expect(screen.getByText(/stress opens your imagination/i)).toBeDefined();

    fireEvent.click(screen.getByRole('button', { name: 'confused / not sure' }));
    for (let i = 0; i < 11; i++) {
      fireEvent.click(screen.getByRole('button', { name: 'sometimes' }));
    }

    expect(screen.getByText(/Soft spots/i)).toBeDefined();
    expect(screen.getByText(/1 question need a second look/i)).toBeDefined();
  });

  it('supports deeper Colourmap levels beyond the quick dive', () => {
    render(<PersonalityTypeProgram onClose={vi.fn()} onBack={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Level 2' }));
    expect(screen.getByText(/item 1 of 24/i)).toBeDefined();

    fireEvent.click(screen.getByRole('button', { name: 'Level 3' }));
    expect(screen.getByText(/item 1 of 36/i)).toBeDefined();
  });

  it('runs the free TIPI Big Five glimpse', () => {
    render(<PersonalityTypeProgram onClose={vi.fn()} onBack={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'TIPI Big Five' }));
    expect(screen.getByText(/TIPI \/ public-use quick glimpse/i)).toBeDefined();

    for (let i = 0; i < 10; i++) {
      fireEvent.click(screen.getByRole('button', { name: /7\. strongly agree/i }));
    }

    expect(screen.getByText('TIPI Big Five glimpse')).toBeDefined();
    expect(screen.getByText('Extraversion')).toBeDefined();
    expect(screen.getByText('Openness')).toBeDefined();
    expect(screen.getByText(/Ten-Item Personality Inventory/i)).toBeDefined();
  });

  it('runs the abstract Image Lens test through square symbolic prompts', () => {
    render(<PersonalityTypeProgram onClose={vi.fn()} onBack={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Image Lens' }));
    expect(screen.getByText(/Block 1 \/ Inner Field/i)).toBeDefined();
    expect(screen.getByText('The Open Gate')).toBeDefined();

    for (let i = 0; i < 15; i++) {
      fireEvent.click(screen.getByRole('button', { name: 'I move toward it' }));
    }

    expect(screen.getByText('Image Lens result')).toBeDefined();
    expect(screen.getAllByText(/Vision/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/What to learn from this image pattern/i)).toBeDefined();
  });
});

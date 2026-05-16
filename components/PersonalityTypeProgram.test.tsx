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
});

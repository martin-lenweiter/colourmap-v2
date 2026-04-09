// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import BoxDesignToggle from './BoxDesignToggle';

describe('BoxDesignToggle', () => {
  it('renders the design button', () => {
    render(<BoxDesignToggle storageKey="test-key" value="handwritten" onChange={() => {}} />);
    expect(screen.getByText('design')).toBeDefined();
  });
});

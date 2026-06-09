// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import GeopoliticsGraph from './GeopoliticsGraph';

describe('GeopoliticsGraph', () => {
  afterEach(() => cleanup());

  it('renders every authored page as a graph node', () => {
    render(<GeopoliticsGraph />);
    expect(screen.getByTestId('geopolitics-graph')).toBeDefined();
    expect(screen.getByTestId('graph-node-hormuz-geography')).toBeDefined();
    expect(screen.getByTestId('graph-node-epic-fury')).toBeDefined();
    expect(screen.getByTestId('graph-node-cma-cgm-ai')).toBeDefined();
  });

  it('first tap highlights, second tap opens the page', () => {
    const onOpenPage = vi.fn();
    render(<GeopoliticsGraph onOpenPage={onOpenPage} />);

    const node = screen.getByTestId('graph-node-epic-fury');
    fireEvent.click(node);
    expect(onOpenPage).not.toHaveBeenCalled();

    fireEvent.click(node);
    expect(onOpenPage).toHaveBeenCalledWith('epic-fury');
  });
});

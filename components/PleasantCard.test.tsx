// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import PleasantCard from './PleasantCard';

describe('PleasantCard', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders children inside a section', () => {
    render(
      <PleasantCard>
        <p>hello</p>
      </PleasantCard>,
    );
    expect(screen.getByText('hello')).toBeDefined();
  });

  it('renders a title and subtitle when provided', () => {
    render(
      <PleasantCard title="Calming Sounds" subtitle="what's playing">
        <div>body</div>
      </PleasantCard>,
    );
    expect(screen.getByRole('heading', { name: 'Calming Sounds' })).toBeDefined();
    expect(screen.getByText("what's playing")).toBeDefined();
  });

  it('omits the header entirely when no title', () => {
    render(
      <PleasantCard>
        <div>body</div>
      </PleasantCard>,
    );
    expect(screen.queryByRole('heading')).toBeNull();
  });

  it('applies the accent color to the title', () => {
    render(<PleasantCard title="Circles" accent="#7AAA58" />);
    const heading = screen.getByRole('heading', { name: 'Circles' });
    expect(heading.getAttribute('style')).toContain('color: rgb(122, 170, 88)');
  });

  it('passes className through to the root element', () => {
    const { container } = render(<PleasantCard className="my-extra-class">child</PleasantCard>);
    const root = container.firstChild as HTMLElement;
    expect(root.className).toContain('my-extra-class');
  });
});

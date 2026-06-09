import { describe, expect, it } from 'vitest';

import { findPage, firstPageOf, GEOPOLITICS_CATEGORIES, locatePage } from './geopolitics-content';

describe('geopolitics-content', () => {
  it('exposes Hormuz Crisis and Shipping Industry as V1 categories', () => {
    const slugs = GEOPOLITICS_CATEGORIES.map((c) => c.slug);
    expect(slugs).toContain('hormuz-crisis');
    expect(slugs).toContain('shipping-industry');
  });

  it('finds the seed Hormuz page by slug', () => {
    const page = findPage('hormuz-geography');
    expect(page).not.toBeNull();
    expect(page?.title).toMatch(/21-mile pinch/i);
    expect(page?.confidence).toBe('HIGH');
  });

  it('returns null for an unknown slug', () => {
    expect(findPage('not-a-real-slug')).toBeNull();
  });

  it('locates a page with its prev/next neighbours inside the chapter', () => {
    const located = locatePage('iran-leverage');
    expect(located).not.toBeNull();
    expect(located?.prev?.slug).toBe('hormuz-oil-share');
    expect(located?.next?.slug).toBe('hormuz-vs-redsea');
    expect(located?.pageIndex).toBe(2);
    expect(located?.totalInChapter).toBeGreaterThanOrEqual(5);
  });

  it('returns the first page of a program', () => {
    const first = firstPageOf('hormuz-briefing');
    expect(first?.slug).toBe('hormuz-geography');
  });

  it('each page declares at least one source above LOW confidence', () => {
    for (const category of GEOPOLITICS_CATEGORIES) {
      for (const program of category.programs) {
        for (const chapter of program.chapters) {
          for (const page of chapter.pages) {
            if (page.confidence !== 'LOW') {
              expect(page.sources.length).toBeGreaterThan(0);
            }
          }
        }
      }
    }
  });
});

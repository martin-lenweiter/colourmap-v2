import { describe, expect, it } from 'vitest';

import { CHOKEPOINTS, MAP_VIEWBOX, MOVEMENTS, REGIONS } from './geopolitics-map';

describe('geopolitics-map', () => {
  it('has every region drawn in viewBox bounds', () => {
    expect(REGIONS.length).toBeGreaterThanOrEqual(5);
    for (const region of REGIONS) {
      expect(region.d.startsWith('M')).toBe(true);
    }
  });

  it('places chokepoints inside the viewBox and binds them to a page', () => {
    expect(CHOKEPOINTS.length).toBeGreaterThanOrEqual(3);
    for (const c of CHOKEPOINTS) {
      expect(c.x).toBeGreaterThan(0);
      expect(c.x).toBeLessThan(MAP_VIEWBOX.width);
      expect(c.y).toBeGreaterThan(0);
      expect(c.y).toBeLessThan(MAP_VIEWBOX.height);
      expect(c.pageSlug.length).toBeGreaterThan(0);
    }
  });

  it('movements declare a layer and link back to a page', () => {
    expect(MOVEMENTS.length).toBeGreaterThanOrEqual(5);
    for (const m of MOVEMENTS) {
      expect(['military', 'commercial', 'energy']).toContain(m.layer);
      expect(m.pageSlug.length).toBeGreaterThan(0);
      expect(m.weekIso).toMatch(/^\d{4}-W\d{2}$/);
    }
  });
});

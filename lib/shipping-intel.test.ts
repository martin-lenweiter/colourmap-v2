import { describe, expect, it } from 'vitest';

import { SHIPPING_INTEL_V1 } from './shipping-intel';

describe('shipping-intel', () => {
  it('exposes a current-dated snapshot with six tiles', () => {
    expect(SHIPPING_INTEL_V1.asOf).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(SHIPPING_INTEL_V1.chokepoints.chokepoints.length).toBeGreaterThanOrEqual(4);
    expect(SHIPPING_INTEL_V1.warRisk.vlccPremiumPercent).toBeGreaterThan(0);
    expect(SHIPPING_INTEL_V1.freightRates.rates.length).toBeGreaterThanOrEqual(2);
    expect(SHIPPING_INTEL_V1.incidents.last48h).toBe(SHIPPING_INTEL_V1.incidents.recent.length);
    expect(SHIPPING_INTEL_V1.cmaCgmWatch.metrics.length).toBeGreaterThanOrEqual(3);
    expect(SHIPPING_INTEL_V1.whatChanged.bullets.length).toBeGreaterThanOrEqual(1);
  });

  it('every tile labels its updatedness honestly', () => {
    const tiles = [
      SHIPPING_INTEL_V1.chokepoints,
      SHIPPING_INTEL_V1.warRisk,
      SHIPPING_INTEL_V1.freightRates,
      SHIPPING_INTEL_V1.incidents,
      SHIPPING_INTEL_V1.cmaCgmWatch,
      SHIPPING_INTEL_V1.whatChanged,
    ];
    for (const tile of tiles) {
      expect(['EDITORIAL', 'LIVE', 'STALE']).toContain(tile.updatedness);
      expect(tile.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(tile.pageSlug.length).toBeGreaterThan(0);
    }
  });
});

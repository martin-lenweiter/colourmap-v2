import { describe, expect, it } from 'vitest';

import { JOURNEYS, PAL } from './GeometryField';

/**
 * The Reconnect Festival (Gstaad) projection programs: long-form journeys
 * that loop seamlessly. These tests lock the two contracts that matter for a
 * live set — each program runs ~20 minutes, and every stage points at a real
 * palette (the renderer resolves colour via PAL[stage.preset]; a name that
 * isn't a PAL key silently falls back to the warm "Calm Field" palette).
 */
const FESTIVAL_IDS = [12, 13, 14] as const;

function journeyById(id: number) {
  const j = JOURNEYS.find((entry) => entry.id === id);
  if (!j) throw new Error(`journey ${id} missing`);
  return j;
}

function totalDuration(id: number): number {
  return journeyById(id).stages.reduce((sum, stage) => sum + stage.duration, 0);
}

describe('GeometryField journeys', () => {
  it('keeps journey ids aligned with their array index (JOURNEYS[id - 1] lookup)', () => {
    // The playback engine resolves the active journey via JOURNEYS[id - 1],
    // so a gap or out-of-order id would play the wrong program.
    JOURNEYS.forEach((journey, index) => {
      expect(journey.id).toBe(index + 1);
    });
  });

  it('ships the three 20-minute festival programs', () => {
    const names = FESTIVAL_IDS.map((id) => journeyById(id).name);
    expect(names).toEqual(['Cathedral of Light', 'Cosmos Drift', 'Desert Temple']);
  });

  it('runs each festival program for ~20 minutes', () => {
    for (const id of FESTIVAL_IDS) {
      const seconds = totalDuration(id);
      // 19–21 minutes — long enough to immerse, tunable without breaking the test.
      expect(seconds).toBeGreaterThanOrEqual(19 * 60);
      expect(seconds).toBeLessThanOrEqual(21 * 60);
    }
  });

  it('points every festival stage at a real palette (no silent fallback)', () => {
    for (const id of FESTIVAL_IDS) {
      for (const stage of journeyById(id).stages) {
        expect(PAL[stage.preset], `${journeyById(id).name} → ${stage.name}`).toBeDefined();
      }
    }
  });

  it('gives each festival program enough acts to breathe and morph', () => {
    for (const id of FESTIVAL_IDS) {
      expect(journeyById(id).stages.length).toBeGreaterThanOrEqual(8);
    }
  });
});

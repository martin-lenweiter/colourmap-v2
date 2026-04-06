import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getLatestScans, insertLifeScan, insertReflection } = vi.hoisted(() => ({
  getLatestScans: vi.fn(),
  insertLifeScan: vi.fn(),
  insertReflection: vi.fn(),
}));

const { getDb } = vi.hoisted(() => ({
  getDb: vi.fn(() => 'db-instance'),
}));

vi.mock('@/lib/db/client', () => ({ getDb }));
vi.mock('@/lib/db/queries/life-scans', () => ({
  getLatestScans,
  insertLifeScan,
  insertReflection,
}));

import {
  LifeScanValidationError,
  listLatestLifeScans,
  normalizeSubmitLifeScanInput,
  submitLifeScan,
} from './life-scans';

describe('life scan service', () => {
  beforeEach(() => {
    getDb.mockClear();
    getLatestScans.mockReset();
    insertLifeScan.mockReset();
    insertReflection.mockReset();
  });

  it('normalizes a valid submission', () => {
    expect(
      normalizeSubmitLifeScanInput({
        doors: [{ door: 'Feeling', sliders: { calm: 70 } }, { nope: true }],
        reflections: [
          { question: 'What helps?', answer: '  Breath  ' },
          { question: 'skip', answer: '   ' },
        ],
        scanGroup: ' group-1 ',
      }),
    ).toEqual({
      doors: [{ door: 'Feeling', sliders: { calm: 70 } }],
      reflections: [{ question: 'What helps?', answer: 'Breath' }],
      scanGroup: 'group-1',
    });
  });

  it('rejects missing doors', () => {
    expect(() => normalizeSubmitLifeScanInput({ scanGroup: 'g' })).toThrow(
      new LifeScanValidationError('doors array is required'),
    );
  });

  it('rejects invalid submission bodies', () => {
    expect(() => normalizeSubmitLifeScanInput(null)).toThrow(
      new LifeScanValidationError('Invalid body'),
    );
  });

  it('rejects missing scan group', () => {
    expect(() =>
      normalizeSubmitLifeScanInput({ doors: [{ door: 'Feeling', sliders: {} }] }),
    ).toThrow(new LifeScanValidationError('scanGroup is required'));
  });

  it('filters invalid rows while normalizing', () => {
    expect(
      normalizeSubmitLifeScanInput({
        doors: [{ door: 'Feeling', sliders: { calm: 70 } }, 'bad'],
        reflections: [
          { question: 'Q', answer: 1 },
          { question: 'Q2', answer: 'yes' },
        ],
        scanGroup: 'group-1',
      }),
    ).toEqual({
      doors: [{ door: 'Feeling', sliders: { calm: 70 } }],
      reflections: [{ question: 'Q2', answer: 'yes' }],
      scanGroup: 'group-1',
    });
  });

  it('lists latest scans', async () => {
    const scans = [{ id: 'scan-1' }];
    getLatestScans.mockResolvedValue(scans);

    await expect(listLatestLifeScans('user-1')).resolves.toEqual(scans);
    expect(getLatestScans).toHaveBeenCalledWith('db-instance', 'user-1');
  });

  it('submits scans and trimmed reflections', async () => {
    insertLifeScan.mockResolvedValueOnce({ id: 'scan-1' }).mockResolvedValueOnce({ id: 'scan-2' });
    insertReflection.mockResolvedValue({ id: 'reflection-1' });

    const result = await submitLifeScan('user-1', {
      doors: [
        { door: 'Feeling', sliders: { calm: 70 } },
        { door: 'Doing', sliders: { focus: 55 } },
      ],
      reflections: [{ question: 'What helps?', answer: 'Breath' }],
      scanGroup: 'group-1',
    });

    expect(insertLifeScan).toHaveBeenNthCalledWith(1, 'db-instance', {
      userId: 'user-1',
      door: 'Feeling',
      sliders: { calm: 70 },
    });
    expect(insertReflection).toHaveBeenCalledWith('db-instance', {
      userId: 'user-1',
      scanGroup: 'group-1',
      question: 'What helps?',
      answer: 'Breath',
    });
    expect(result).toEqual({ scans: [{ id: 'scan-1' }, { id: 'scan-2' }], scanGroup: 'group-1' });
  });
});

import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getRecentCheckIns } = vi.hoisted(() => ({
  getRecentCheckIns: vi.fn(),
}));

const { getMissions } = vi.hoisted(() => ({
  getMissions: vi.fn(),
}));

const orderBy = vi.fn();
const where = vi.fn(() => ({ orderBy }));
const from = vi.fn(() => ({ where }));
const select = vi.fn(() => ({ from }));

const { getDb } = vi.hoisted(() => ({
  getDb: vi.fn(() => ({ select })),
}));

vi.mock('@/lib/db/client', () => ({ getDb }));
vi.mock('@/lib/db/queries/check-ins', () => ({ getRecentCheckIns }));
vi.mock('@/lib/db/queries/missions', () => ({ getMissions }));
vi.mock('@/lib/emotional-vocabulary', () => ({
  getEmotionalWord: vi.fn((value: number) => `Word-${value}`),
}));

import {
  buildCheckInAnalysisPrompt,
  buildCheckInInsightPrompt,
  buildDayMapInsightPrompt,
  buildJourneyReflectionPrompt,
  normalizeCheckInInsightInput,
  normalizeDayMapInsightInput,
  normalizeJourneyReflectionInput,
  ReflectionValidationError,
} from './reflections';

describe('reflections service', () => {
  beforeEach(() => {
    getDb.mockClear();
    getRecentCheckIns.mockReset();
    getMissions.mockReset();
    select.mockClear();
    from.mockClear();
    where.mockClear();
    orderBy.mockReset();
  });

  it('normalizes reflection inputs', () => {
    expect(normalizeCheckInInsightInput({ checkInId: 'check-1' })).toEqual({
      checkInId: 'check-1',
    });
    expect(
      normalizeDayMapInsightInput({
        dayMapEntries: [{ time: '09:00', activity: 'Code', energy: 7, category: 'Focus' }],
      }),
    ).toEqual({
      dayMapEntries: [
        { time: '09:00', activity: 'Code', energy: 7, category: 'Focus', tag: undefined },
      ],
    });
    expect(normalizeJourneyReflectionInput({ prompt: 'Where am I?', tone: 'warrior' })).toEqual({
      prompt: 'Where am I?',
      tone: 'warrior',
    });
  });

  it('rejects invalid reflection input bodies', () => {
    expect(() => normalizeCheckInInsightInput(null)).toThrow(
      new ReflectionValidationError('Invalid body'),
    );
    expect(() => normalizeDayMapInsightInput(null)).toThrow(
      new ReflectionValidationError('Invalid body'),
    );
    expect(() => normalizeJourneyReflectionInput(null)).toThrow(
      new ReflectionValidationError('Invalid body'),
    );
  });

  it('filters invalid day-map entries', () => {
    expect(
      normalizeDayMapInsightInput({
        dayMapEntries: [{ time: '09:00', activity: 'Code', energy: 7 }, { time: 'bad' }],
      }),
    ).toEqual({
      dayMapEntries: [
        { time: '09:00', activity: 'Code', energy: 7, category: undefined, tag: undefined },
      ],
    });
    expect(normalizeDayMapInsightInput({ dayMapEntries: null })).toEqual({ dayMapEntries: [] });
    expect(normalizeJourneyReflectionInput({})).toEqual({ prompt: '', tone: 'cowboy' });
  });

  it('builds a check-in analysis prompt', async () => {
    getRecentCheckIns.mockResolvedValue([
      {
        id: 'check-1',
        sliderValue: 72,
        note: 'steady',
        tags: ['Work'],
        missionId: 'mission-1',
        facing: {
          fear: { label: 'Fear', answers: ['Missing the deadline', 'Ask for support'] },
        },
        pulses: { body: 75 },
        challenge: 'Scope is still blurry',
        flow: 'Momentum is picking up',
        feelingCompass: { attitude: 25, presence: 50 },
        feelingStage: 4,
        feelingSupport: ['Confidence'],
        createdAt: new Date('2026-04-06T09:00:00Z'),
      },
    ]);
    getMissions.mockResolvedValue([
      { id: 'mission-1', title: 'Ship', blocking: 'Scope', nextStep: 'Draft', completed: false },
    ]);

    const prompt = await buildCheckInAnalysisPrompt('user-1');

    expect(prompt).toContain('Word-72 (72/100)');
    expect(prompt).toContain('FACING: Fear: Missing the deadline / Ask for support');
    expect(prompt).toContain('Feeling compass: attitude 25%, presence 50%');
    expect(prompt).toContain('Challenge: "Scope is still blurry"');
    expect(prompt).toContain('Mission: "Ship"');
    expect(prompt).toContain('Active missions');
  });

  it('rejects analysis without check-ins', async () => {
    getRecentCheckIns.mockResolvedValue([]);
    getMissions.mockResolvedValue([]);

    await expect(buildCheckInAnalysisPrompt('user-1')).rejects.toThrow(
      new ReflectionValidationError('No check-ins to analyze'),
    );
  });

  it('builds an analysis prompt without active missions', async () => {
    getRecentCheckIns.mockResolvedValue([
      {
        id: 'check-1',
        sliderValue: 40,
        note: null,
        tags: null,
        missionId: null,
        createdAt: new Date('2026-04-06T09:00:00Z'),
      },
    ]);
    getMissions.mockResolvedValue([{ id: 'mission-1', title: 'Done', completed: true }]);

    const prompt = await buildCheckInAnalysisPrompt('user-1');

    expect(prompt).toContain('No active missions right now.');
    expect(prompt).not.toContain('Mission:');
  });

  it('builds a check-in insight prompt with life scan context', async () => {
    getRecentCheckIns.mockResolvedValue([
      {
        id: 'check-1',
        sliderValue: 72,
        note: 'steady',
        missionId: 'mission-1',
        facing: {
          intention: { label: 'Intention', answers: ['Finish the pitch'] },
        },
        challenge: 'I keep second-guessing the outline',
        flow: 'The opening paragraph feels strong',
        feelingCompass: { attitude: 50 },
        feelingStage: 5,
        feelingSupport: ['Gratitude'],
        createdAt: new Date(),
      },
      {
        id: 'check-2',
        sliderValue: 61,
        note: null,
        missionId: null,
        facing: null,
        challenge: null,
        flow: null,
        feelingCompass: null,
        feelingStage: null,
        feelingSupport: null,
        createdAt: new Date(),
      },
    ]);
    getMissions.mockResolvedValue([{ id: 'mission-1', title: 'Ship', blocking: 'Scope' }]);
    orderBy.mockResolvedValue([
      { key: 'block_fears_list', value: 'failure|||delay' },
      { key: 'flow_strengths_list', value: 'focus' },
    ]);

    const prompt = await buildCheckInInsightPrompt('user-1', { checkInId: 'check-1' });

    expect(prompt).toContain('Just checked in: Word-72 (72/100)');
    expect(prompt).toContain('FACING: Intention: Finish the pitch');
    expect(prompt).toContain('Challenge: "I keep second-guessing the outline"');
    expect(prompt).toContain('Flow: "The opening paragraph feels strong"');
    expect(prompt).toContain('Working on: "Ship"');
    expect(prompt).toContain('Self-identified fears: failure, delay');
  });

  it('rejects a check-in insight when no check-ins exist', async () => {
    getRecentCheckIns.mockResolvedValue([]);
    getMissions.mockResolvedValue([]);
    orderBy.mockResolvedValue([]);

    await expect(buildCheckInInsightPrompt('user-1', { checkInId: null })).rejects.toThrow(
      new ReflectionValidationError('No check-in found'),
    );
  });

  it('builds a day-map insight prompt and rejects empty data', async () => {
    getRecentCheckIns.mockResolvedValue([
      {
        id: 'check-1',
        sliderValue: 72,
        note: 'steady',
        createdAt: new Date(),
      },
    ]);

    const prompt = await buildDayMapInsightPrompt('user-1', {
      dayMapEntries: [
        { time: '09:00', activity: 'Code', energy: 8, category: 'Focus', tag: 'good' },
      ],
    });

    expect(prompt).toContain('09:00 Code (Focus) [works]');

    getRecentCheckIns.mockResolvedValue([]);
    await expect(buildDayMapInsightPrompt('user-1', { dayMapEntries: [] })).rejects.toThrow(
      new ReflectionValidationError('Not enough data'),
    );
  });

  it('builds a day-map prompt from check-ins alone', async () => {
    getRecentCheckIns.mockResolvedValue([
      {
        id: 'check-1',
        sliderValue: 72,
        note: null,
        createdAt: new Date(),
      },
    ]);

    const prompt = await buildDayMapInsightPrompt('user-1', { dayMapEntries: [] });

    expect(prompt).toContain('No entries yet.');
    expect(prompt).toContain('Word-72');
  });

  it('builds a journey reflection prompt with tone fallback', async () => {
    getRecentCheckIns.mockResolvedValue([
      { id: 'check-1', sliderValue: 72, note: 'steady', createdAt: new Date() },
    ]);
    orderBy.mockResolvedValue([
      { key: 'vision_where', value: 'Zurich' },
      { key: 'flow_strengths_list', value: 'focus|||warmth' },
    ]);

    const result = await buildJourneyReflectionPrompt('user-1', {
      prompt: 'Who am I becoming?',
      tone: 'unknown',
    });

    expect(result.prompt).toContain('Who am I becoming?');
    expect(result.prompt).toContain('Their vision: Zurich');
    expect(result.tonePrompt).toContain('wise cowboy');
  });

  it('builds a journey reflection prompt with a known tone and sparse context', async () => {
    getRecentCheckIns.mockResolvedValue([
      { id: 'check-1', sliderValue: 72, note: null, createdAt: new Date() },
    ]);
    orderBy.mockResolvedValue([]);

    const result = await buildJourneyReflectionPrompt('user-1', {
      prompt: '',
      tone: 'practical',
    });

    expect(result.tonePrompt).toContain('Speak practically');
    expect(result.prompt).toContain('Recent emotional states');
  });
});

import { beforeEach, describe, expect, it, vi } from 'vitest';

const { deleteMission, getMissions, insertMission, updateMission } = vi.hoisted(() => ({
  deleteMission: vi.fn(),
  getMissions: vi.fn(),
  insertMission: vi.fn(),
  updateMission: vi.fn(),
}));

const { getDb } = vi.hoisted(() => ({
  getDb: vi.fn(() => 'db-instance'),
}));

vi.mock('@/lib/db/queries/missions', () => ({
  deleteMission,
  getMissions,
  insertMission,
  updateMission,
}));
vi.mock('@/lib/db/client', () => ({ getDb }));

import {
  createMission,
  listMissions,
  MissionValidationError,
  normalizeCreateMissionInput,
  normalizeMissionUpdateInput,
  removeMission,
  updateMissionFields,
} from './missions';

describe('mission input normalization', () => {
  it('parses a create payload', () => {
    expect(normalizeCreateMissionInput({ title: 'Ship' })).toEqual({ title: 'Ship' });
  });

  it('rejects missing mission title', () => {
    expect(() => normalizeCreateMissionInput({})).toThrow(
      new MissionValidationError('title is required'),
    );
  });

  it('rejects non-string mission title', () => {
    expect(() => normalizeCreateMissionInput({ title: 1 })).toThrow(
      new MissionValidationError('title must be a string'),
    );
  });

  it('filters mission update fields', () => {
    expect(
      normalizeMissionUpdateInput({
        completed: true,
        description: 'Focus',
        blocking: null,
        nextStep: null,
        title: '  Launch  ',
      }),
    ).toEqual({
      completed: true,
      description: 'Focus',
      blocking: null,
      nextStep: null,
      title: '  Launch  ',
    });
  });

  it('rejects empty mission updates', () => {
    expect(() => normalizeMissionUpdateInput({ title: '   ' })).toThrow(
      new MissionValidationError('No valid fields to update'),
    );
  });

  it('rejects non-object mission updates', () => {
    expect(() => normalizeMissionUpdateInput(null)).toThrow(
      new MissionValidationError('Invalid body'),
    );
  });
});

describe('missions service', () => {
  beforeEach(() => {
    deleteMission.mockReset();
    getDb.mockClear();
    getMissions.mockReset();
    insertMission.mockReset();
    updateMission.mockReset();
  });

  it('creates a mission with trimmed title', async () => {
    const mission = { id: 'mission-1', title: 'Launch', userId: 'user-1' };
    insertMission.mockResolvedValue(mission);

    const result = await createMission('user-1', '  Launch  ');

    expect(getDb).toHaveBeenCalledTimes(1);
    expect(insertMission).toHaveBeenCalledWith('db-instance', {
      userId: 'user-1',
      title: 'Launch',
    });
    expect(result).toEqual(mission);
  });

  it('rejects an empty mission title', async () => {
    await expect(createMission('user-1', '   ')).rejects.toThrow(MissionValidationError);
    expect(insertMission).not.toHaveBeenCalled();
  });

  it('truncates long mission titles', async () => {
    insertMission.mockResolvedValue({ id: 'mission-1', title: 'a'.repeat(200), userId: 'user-1' });

    await createMission('user-1', ` ${'a'.repeat(220)} `);

    expect(insertMission).toHaveBeenCalledWith('db-instance', {
      userId: 'user-1',
      title: 'a'.repeat(200),
    });
  });

  it('lists missions for the current user', async () => {
    const missions = [{ id: 'mission-1', title: 'Launch', userId: 'user-1' }];
    getMissions.mockResolvedValue(missions);

    await expect(listMissions('user-1')).resolves.toEqual(missions);
    expect(getMissions).toHaveBeenCalledWith('db-instance', 'user-1');
  });

  it('updates only provided mission fields and trims text values', async () => {
    updateMission.mockResolvedValue({ id: 'mission-1' });

    await updateMissionFields('user-1', 'mission-1', {
      title: '  Updated title  ',
      description: '  Clarity first  ',
      blocking: '   ',
    });

    expect(updateMission).toHaveBeenCalledWith('db-instance', 'user-1', 'mission-1', {
      title: 'Updated title',
      description: 'Clarity first',
      blocking: null,
    });
  });

  it('preserves omitted fields when updating a mission', async () => {
    updateMission.mockResolvedValue({ id: 'mission-1' });

    await updateMissionFields('user-1', 'mission-1', {
      completed: true,
      nextStep: null,
    });

    expect(updateMission).toHaveBeenCalledWith('db-instance', 'user-1', 'mission-1', {
      completed: true,
      nextStep: null,
    });
    expect(updateMission.mock.calls[0]?.[3]).not.toHaveProperty('description');
    expect(updateMission.mock.calls[0]?.[3]).not.toHaveProperty('blocking');
    expect(updateMission.mock.calls[0]?.[3]).not.toHaveProperty('title');
  });

  it('truncates long mission update fields', async () => {
    updateMission.mockResolvedValue({ id: 'mission-1' });

    await updateMissionFields('user-1', 'mission-1', {
      title: ` ${'t'.repeat(220)} `,
      description: 'x'.repeat(2500),
    });

    expect(updateMission).toHaveBeenCalledWith('db-instance', 'user-1', 'mission-1', {
      title: 't'.repeat(200),
      description: 'x'.repeat(2000),
    });
  });

  it('removes a mission for the current user', async () => {
    deleteMission.mockResolvedValue(true);

    await expect(removeMission('user-1', 'mission-1')).resolves.toBe(true);
    expect(deleteMission).toHaveBeenCalledWith('db-instance', 'user-1', 'mission-1');
  });
});

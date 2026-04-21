import { getDb } from '@/lib/db/client';
import {
  type Circle,
  type CircleMember,
  type CircleMission,
  type CircleNote,
  type CircleSession,
  deleteCircleMission,
  endCircleSession,
  getActiveSession,
  getCircleByCode,
  getCircleById,
  getCircleMembers,
  getCircleMissions,
  getCircleNotes,
  getCirclesByUser,
  insertCircle,
  insertCircleMember,
  insertCircleMission,
  insertCircleNote,
  insertCircleSession,
  updateCircleMission,
  updateMemberPulse,
} from '@/lib/db/queries/circles';

const MAX_TEXT_LENGTH = 500;
const MAX_NAME_LENGTH = 100;

const CIRCLE_COLORS = ['#D4805A', '#6890B0', '#7AAA58', '#9B6BA0', '#C4A060', '#5A8AAA'];

export class CircleValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CircleValidationError';
  }
}

function genCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

async function requireMembership(userId: string, circleId: string): Promise<CircleMember[]> {
  const db = getDb();
  const members = await getCircleMembers(db, circleId);
  const isMember = members.some((m) => m.userId === userId);
  if (!isMember) {
    throw new CircleValidationError('Not a member of this circle');
  }
  return members;
}

export async function createCircle(
  userId: string,
  name: string,
  userName: string,
): Promise<{ circle: Circle; member: CircleMember }> {
  const trimmedName = name.trim();
  if (!trimmedName) {
    throw new CircleValidationError('Circle name is required');
  }
  const trimmedUserName = userName.trim();
  if (!trimmedUserName) {
    throw new CircleValidationError('Your name is required');
  }

  const db = getDb();
  const code = genCode();
  const color = CIRCLE_COLORS[Math.floor(Math.random() * CIRCLE_COLORS.length)];

  const circle = await insertCircle(db, {
    name: trimmedName.slice(0, MAX_NAME_LENGTH),
    code,
    color,
    createdBy: userId,
  });

  const member = await insertCircleMember(db, {
    circleId: circle.id,
    userId,
    name: trimmedUserName.slice(0, MAX_NAME_LENGTH),
    color: CIRCLE_COLORS[0],
  });

  return { circle, member };
}

export async function joinCircle(
  userId: string,
  code: string,
  userName: string,
): Promise<{ circle: Circle; member: CircleMember }> {
  const trimmedCode = code.trim().toUpperCase();
  if (!trimmedCode) {
    throw new CircleValidationError('Code is required');
  }
  const trimmedUserName = userName.trim();
  if (!trimmedUserName) {
    throw new CircleValidationError('Your name is required');
  }

  const db = getDb();
  const circle = await getCircleByCode(db, trimmedCode);
  if (!circle) {
    throw new CircleValidationError('Circle not found');
  }

  const members = await getCircleMembers(db, circle.id);
  const existing = members.find((m) => m.userId === userId);
  if (existing) {
    return { circle, member: existing };
  }

  const memberColor = CIRCLE_COLORS[members.length % CIRCLE_COLORS.length];
  const member = await insertCircleMember(db, {
    circleId: circle.id,
    userId,
    name: trimmedUserName.slice(0, MAX_NAME_LENGTH),
    color: memberColor,
  });

  return { circle, member };
}

export type CircleWithMembers = Circle & { members: CircleMember[] };

export async function listUserCircles(userId: string): Promise<CircleWithMembers[]> {
  const db = getDb();
  const userCircles = await getCirclesByUser(db, userId);

  const result: CircleWithMembers[] = [];
  for (const circle of userCircles) {
    const members = await getCircleMembers(db, circle.id);
    result.push({ ...circle, members });
  }
  return result;
}

export type CircleDetail = Circle & {
  members: CircleMember[];
  missions: CircleMission[];
  notes: CircleNote[];
  activeSession: CircleSession | null;
};

export async function getCircleDetail(userId: string, circleId: string): Promise<CircleDetail> {
  const db = getDb();
  const circle = await getCircleById(db, circleId);
  if (!circle) {
    throw new CircleValidationError('Circle not found');
  }

  const members = await getCircleMembers(db, circleId);
  const isMember = members.some((m) => m.userId === userId);
  if (!isMember) {
    throw new CircleValidationError('Not a member of this circle');
  }

  const missions = await getCircleMissions(db, circleId);
  const notes = await getCircleNotes(db, circleId);
  const activeSession = await getActiveSession(db, circleId);

  return { ...circle, members, missions, notes, activeSession };
}

export async function addMission(
  userId: string,
  circleId: string,
  text: string,
  dueDate?: string | null,
): Promise<CircleMission> {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new CircleValidationError('Mission text is required');
  }
  await requireMembership(userId, circleId);

  const db = getDb();
  return insertCircleMission(db, {
    circleId,
    text: trimmed.slice(0, MAX_TEXT_LENGTH),
    createdBy: userId,
    dueDate: dueDate ?? null,
  });
}

export async function updateMission(
  userId: string,
  circleId: string,
  missionId: string,
  data: { done?: boolean; claimedBy?: string | null; text?: string; dueDate?: string | null },
): Promise<CircleMission | null> {
  await requireMembership(userId, circleId);
  const db = getDb();
  return updateCircleMission(db, missionId, data);
}

export async function removeMission(
  userId: string,
  circleId: string,
  missionId: string,
): Promise<boolean> {
  await requireMembership(userId, circleId);
  const db = getDb();
  return deleteCircleMission(db, missionId);
}

export async function addNote(
  userId: string,
  circleId: string,
  text: string,
  authorName: string,
  sessionId?: string | null,
): Promise<CircleNote> {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new CircleValidationError('Note text is required');
  }
  await requireMembership(userId, circleId);

  const db = getDb();
  return insertCircleNote(db, {
    circleId,
    authorId: userId,
    authorName: authorName.trim().slice(0, MAX_NAME_LENGTH),
    text: trimmed.slice(0, MAX_TEXT_LENGTH),
    sessionId: sessionId ?? null,
  });
}

export async function updatePulse(
  userId: string,
  circleId: string,
  pulse: string,
  pulseColor: string,
): Promise<CircleMember | null> {
  await requireMembership(userId, circleId);
  const db = getDb();
  return updateMemberPulse(db, circleId, userId, pulse, pulseColor);
}

export async function startSession(userId: string, circleId: string): Promise<CircleSession> {
  await requireMembership(userId, circleId);
  const db = getDb();

  const existing = await getActiveSession(db, circleId);
  if (existing) {
    return existing;
  }

  return insertCircleSession(db, { circleId, startedBy: userId });
}

export async function endSession(
  userId: string,
  circleId: string,
  sessionId: string,
  summary?: string | null,
): Promise<CircleSession | null> {
  await requireMembership(userId, circleId);
  const db = getDb();
  return endCircleSession(db, sessionId, summary);
}

import { getDb } from '@/lib/db/client';
import {
  type Circle,
  type CircleDecision,
  type CircleDecisionVote,
  type CircleMember,
  type CircleMission,
  type CircleNote,
  type CircleSession,
  deleteCircleDecision,
  deleteCircleMission,
  endCircleSession,
  getActiveSession,
  getCircleByCode,
  getCircleById,
  getCircleDecisions,
  getCircleMembers,
  getCircleMissions,
  getCircleNotes,
  getCirclesByUser,
  getVotesForDecisions,
  insertCircle,
  insertCircleDecision,
  insertCircleMember,
  insertCircleMission,
  insertCircleNote,
  insertCircleSession,
  updateCircleDecision,
  updateCircleMission,
  updateMemberPulse,
  upsertDecisionVote,
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

export async function listCircleMissions(circleId: string): Promise<CircleMission[]> {
  return getCircleMissions(getDb(), circleId);
}

export async function listCircleNotes(circleId: string, limit?: number): Promise<CircleNote[]> {
  return getCircleNotes(getDb(), circleId, limit);
}

export async function getActiveCircleSession(circleId: string): Promise<CircleSession | null> {
  return getActiveSession(getDb(), circleId);
}

// ─── Decisions ───

const VOTE_VALUES = ['yes', 'no', 'unsure'] as const;
type VoteValue = (typeof VOTE_VALUES)[number];

export interface DecisionWithVotes extends CircleDecision {
  votes: CircleDecisionVote[];
}

export async function listCircleDecisions(circleId: string): Promise<DecisionWithVotes[]> {
  const db = getDb();
  const decisions = await getCircleDecisions(db, circleId);
  if (decisions.length === 0) return [];
  const allVotes = await getVotesForDecisions(
    db,
    decisions.map((d) => d.id),
  );
  return decisions.map((d) => ({
    ...d,
    votes: allVotes.filter((v) => v.decisionId === d.id),
  }));
}

export async function proposeDecision(
  userId: string,
  circleId: string,
  title: string,
  description?: string,
): Promise<CircleDecision> {
  const trimmedTitle = title.trim();
  if (!trimmedTitle) {
    throw new CircleValidationError('Decision title is required');
  }
  await requireMembership(userId, circleId);
  const db = getDb();
  return insertCircleDecision(db, {
    circleId,
    title: trimmedTitle.slice(0, MAX_NAME_LENGTH),
    description: description?.trim().slice(0, MAX_TEXT_LENGTH) || null,
    createdBy: userId,
  });
}

export async function castDecisionVote(
  userId: string,
  circleId: string,
  decisionId: string,
  value: VoteValue,
  memberName: string,
): Promise<CircleDecisionVote> {
  if (!VOTE_VALUES.includes(value)) {
    throw new CircleValidationError('Vote value must be yes, no, or unsure');
  }
  await requireMembership(userId, circleId);
  const db = getDb();
  return upsertDecisionVote(db, {
    decisionId,
    memberId: userId,
    memberName: memberName.trim().slice(0, MAX_NAME_LENGTH),
    value,
  });
}

export async function finalizeDecision(
  userId: string,
  circleId: string,
  decisionId: string,
  decision: 'yes' | 'no',
): Promise<CircleDecision | null> {
  if (decision !== 'yes' && decision !== 'no') {
    throw new CircleValidationError('Decision must be yes or no');
  }
  await requireMembership(userId, circleId);
  const db = getDb();
  return updateCircleDecision(db, decisionId, {
    status: 'decided',
    decision,
    decidedAt: new Date(),
  });
}

export async function archiveDecision(
  userId: string,
  circleId: string,
  decisionId: string,
): Promise<CircleDecision | null> {
  await requireMembership(userId, circleId);
  const db = getDb();
  return updateCircleDecision(db, decisionId, { status: 'archived' });
}

export async function removeDecision(
  userId: string,
  circleId: string,
  decisionId: string,
): Promise<boolean> {
  await requireMembership(userId, circleId);
  const db = getDb();
  return deleteCircleDecision(db, decisionId);
}

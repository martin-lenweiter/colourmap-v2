import { and, desc, eq, type InferSelectModel, isNull } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

import type * as schema from '@/lib/db/schema';
import {
  circleDecisions,
  circleDecisionVotes,
  circleMembers,
  circleMissions,
  circleNotes,
  circleSessions,
  circles,
} from '@/lib/db/schema';

export type Circle = InferSelectModel<typeof circles>;
export type CircleMember = InferSelectModel<typeof circleMembers>;
export type CircleMission = InferSelectModel<typeof circleMissions>;
export type CircleNote = InferSelectModel<typeof circleNotes>;
export type CircleSession = InferSelectModel<typeof circleSessions>;
export type CircleDecision = InferSelectModel<typeof circleDecisions>;
export type CircleDecisionVote = InferSelectModel<typeof circleDecisionVotes>;

type Db = PostgresJsDatabase<typeof schema>;

export async function insertCircle(
  db: Db,
  data: { name: string; code: string; color: string; createdBy: string },
): Promise<Circle> {
  const [row] = await db.insert(circles).values(data).returning();
  return row;
}

export async function getCirclesByUser(db: Db, userId: string): Promise<Circle[]> {
  const memberRows = await db
    .select({ circleId: circleMembers.circleId })
    .from(circleMembers)
    .where(eq(circleMembers.userId, userId));

  if (memberRows.length === 0) return [];

  const circleIds = memberRows.map((r) => r.circleId);
  const allCircles = await db.select().from(circles).orderBy(desc(circles.createdAt));

  return allCircles.filter((c) => circleIds.includes(c.id));
}

export async function getCircleByCode(db: Db, code: string): Promise<Circle | null> {
  const [row] = await db.select().from(circles).where(eq(circles.code, code)).limit(1);
  return row ?? null;
}

export async function getCircleById(db: Db, circleId: string): Promise<Circle | null> {
  const [row] = await db.select().from(circles).where(eq(circles.id, circleId)).limit(1);
  return row ?? null;
}

export async function insertCircleMember(
  db: Db,
  data: { circleId: string; userId: string; name: string; color: string },
): Promise<CircleMember> {
  const [row] = await db.insert(circleMembers).values(data).returning();
  return row;
}

export async function getCircleMembers(db: Db, circleId: string): Promise<CircleMember[]> {
  return db
    .select()
    .from(circleMembers)
    .where(eq(circleMembers.circleId, circleId))
    .orderBy(circleMembers.joinedAt);
}

export async function updateMemberPulse(
  db: Db,
  circleId: string,
  userId: string,
  pulse: string,
  pulseColor: string,
): Promise<CircleMember | null> {
  const [row] = await db
    .update(circleMembers)
    .set({ pulse, pulseColor })
    .where(and(eq(circleMembers.circleId, circleId), eq(circleMembers.userId, userId)))
    .returning();
  return row ?? null;
}

export async function insertCircleMission(
  db: Db,
  data: { circleId: string; text: string; createdBy: string; dueDate?: string | null },
): Promise<CircleMission> {
  const [row] = await db.insert(circleMissions).values(data).returning();
  return row;
}

export async function getCircleMissions(db: Db, circleId: string): Promise<CircleMission[]> {
  return db
    .select()
    .from(circleMissions)
    .where(eq(circleMissions.circleId, circleId))
    .orderBy(desc(circleMissions.createdAt));
}

export async function updateCircleMission(
  db: Db,
  missionId: string,
  data: { done?: boolean; claimedBy?: string | null; text?: string; dueDate?: string | null },
): Promise<CircleMission | null> {
  const [row] = await db
    .update(circleMissions)
    .set(data)
    .where(eq(circleMissions.id, missionId))
    .returning();
  return row ?? null;
}

export async function deleteCircleMission(db: Db, missionId: string): Promise<boolean> {
  const result = await db
    .delete(circleMissions)
    .where(eq(circleMissions.id, missionId))
    .returning();
  return result.length > 0;
}

export async function insertCircleNote(
  db: Db,
  data: {
    circleId: string;
    authorId: string;
    authorName: string;
    text: string;
    sessionId?: string | null;
  },
): Promise<CircleNote> {
  const [row] = await db.insert(circleNotes).values(data).returning();
  return row;
}

export async function getCircleNotes(db: Db, circleId: string, limit = 50): Promise<CircleNote[]> {
  return db
    .select()
    .from(circleNotes)
    .where(eq(circleNotes.circleId, circleId))
    .orderBy(desc(circleNotes.createdAt))
    .limit(limit);
}

export async function insertCircleSession(
  db: Db,
  data: { circleId: string; startedBy: string },
): Promise<CircleSession> {
  const [row] = await db.insert(circleSessions).values(data).returning();
  return row;
}

export async function endCircleSession(
  db: Db,
  sessionId: string,
  summary?: string | null,
): Promise<CircleSession | null> {
  const [row] = await db
    .update(circleSessions)
    .set({ endedAt: new Date(), summary: summary ?? null })
    .where(eq(circleSessions.id, sessionId))
    .returning();
  return row ?? null;
}

export async function getActiveSession(db: Db, circleId: string): Promise<CircleSession | null> {
  const [row] = await db
    .select()
    .from(circleSessions)
    .where(and(eq(circleSessions.circleId, circleId), isNull(circleSessions.endedAt)))
    .orderBy(desc(circleSessions.startedAt))
    .limit(1);
  return row ?? null;
}

// ─── Decisions ───

export async function insertCircleDecision(
  db: Db,
  data: { circleId: string; title: string; description?: string | null; createdBy: string },
): Promise<CircleDecision> {
  const [row] = await db.insert(circleDecisions).values(data).returning();
  return row;
}

export async function getCircleDecisions(db: Db, circleId: string): Promise<CircleDecision[]> {
  return db
    .select()
    .from(circleDecisions)
    .where(eq(circleDecisions.circleId, circleId))
    .orderBy(desc(circleDecisions.createdAt));
}

export async function updateCircleDecision(
  db: Db,
  decisionId: string,
  data: {
    status?: 'proposed' | 'decided' | 'archived';
    decision?: 'yes' | 'no' | null;
    decidedAt?: Date | null;
    title?: string;
    description?: string | null;
  },
): Promise<CircleDecision | null> {
  const [row] = await db
    .update(circleDecisions)
    .set(data)
    .where(eq(circleDecisions.id, decisionId))
    .returning();
  return row ?? null;
}

export async function deleteCircleDecision(db: Db, decisionId: string): Promise<boolean> {
  await db.delete(circleDecisionVotes).where(eq(circleDecisionVotes.decisionId, decisionId));
  const result = await db
    .delete(circleDecisions)
    .where(eq(circleDecisions.id, decisionId))
    .returning();
  return result.length > 0;
}

export async function getDecisionVotes(db: Db, decisionId: string): Promise<CircleDecisionVote[]> {
  return db
    .select()
    .from(circleDecisionVotes)
    .where(eq(circleDecisionVotes.decisionId, decisionId))
    .orderBy(desc(circleDecisionVotes.createdAt));
}

export async function getVotesForDecisions(
  db: Db,
  decisionIds: string[],
): Promise<CircleDecisionVote[]> {
  if (decisionIds.length === 0) return [];
  const rows = await db.select().from(circleDecisionVotes);
  return rows.filter((r) => decisionIds.includes(r.decisionId));
}

/**
 * Cast or replace a member's vote on a decision. Each member has at
 * most one vote per decision — we delete any prior vote first.
 */
export async function upsertDecisionVote(
  db: Db,
  data: {
    decisionId: string;
    memberId: string;
    memberName: string;
    value: 'yes' | 'no' | 'unsure';
  },
): Promise<CircleDecisionVote> {
  await db
    .delete(circleDecisionVotes)
    .where(
      and(
        eq(circleDecisionVotes.decisionId, data.decisionId),
        eq(circleDecisionVotes.memberId, data.memberId),
      ),
    );
  const [row] = await db.insert(circleDecisionVotes).values(data).returning();
  return row;
}

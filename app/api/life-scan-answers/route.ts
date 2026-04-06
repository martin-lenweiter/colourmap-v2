import { and, desc, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { jsonError, parseJsonBody, withAuthenticatedUser } from '@/lib/api/route-helpers';
import { getDb } from '@/lib/db/client';
import { lifeScanAnswers } from '@/lib/db/schema';

export async function GET() {
  return withAuthenticatedUser(async (user) => {
    const db = getDb();
    const rows = await db
      .select()
      .from(lifeScanAnswers)
      .where(eq(lifeScanAnswers.userId, user.id))
      .orderBy(desc(lifeScanAnswers.updatedAt));

    const seen = new Set<string>();
    const answers: Record<string, string> = {};
    for (const row of rows) {
      if (!seen.has(row.key)) {
        seen.add(row.key);
        answers[row.key] = row.value;
      }
    }

    return NextResponse.json({ answers });
  });
}

export async function POST(request: Request) {
  return withAuthenticatedUser(async (user) => {
    const bodyResult = await parseJsonBody(request);
    if (!bodyResult.ok) {
      return bodyResult.response;
    }

    const body = bodyResult.value;

    if (typeof body !== 'object' || body === null || !('answers' in body)) {
      return jsonError('answers object is required', 400);
    }

    const { answers } = body as { answers: Record<string, string> };

    if (typeof answers !== 'object' || answers === null) {
      return jsonError('answers must be an object', 400);
    }

    const db = getDb();
    const now = new Date();

    for (const [key, value] of Object.entries(answers)) {
      if (typeof value !== 'string') continue;

      const existing = await db
        .select({ id: lifeScanAnswers.id })
        .from(lifeScanAnswers)
        .where(and(eq(lifeScanAnswers.userId, user.id), eq(lifeScanAnswers.key, key)))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(lifeScanAnswers)
          .set({ value, updatedAt: now })
          .where(eq(lifeScanAnswers.id, existing[0].id));
      } else {
        await db.insert(lifeScanAnswers).values({
          userId: user.id,
          key,
          value,
          updatedAt: now,
        });
      }
    }

    return NextResponse.json({ ok: true });
  });
}

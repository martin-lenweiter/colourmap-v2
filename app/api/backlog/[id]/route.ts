import { and, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { jsonError, parseJsonBody, withAuthenticatedUser } from '@/lib/api/route-helpers';
import { getDb } from '@/lib/db/client';
import { deleteBacklogItem, toggleBacklogItem } from '@/lib/db/queries/backlog';
import { backlog } from '@/lib/db/schema';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAuthenticatedUser(async (user) => {
    const { id } = await params;

    const bodyResult = await parseJsonBody(request);
    if (!bodyResult.ok) {
      return bodyResult.response;
    }

    const body = bodyResult.value;

    if (typeof body !== 'object' || body === null) {
      return jsonError('Invalid body', 400);
    }

    const { done, notes } = body as { done?: unknown; notes?: unknown };

    if (typeof notes === 'string' || notes === null) {
      const db = getDb();
      const [updated] = await db
        .update(backlog)
        .set({ notes: notes as string | null })
        .where(and(eq(backlog.id, id), eq(backlog.userId, user.id)))
        .returning();
      if (!updated) return jsonError('Not found', 404);
      if (done === undefined) return NextResponse.json(updated);
    }

    if (typeof done === 'boolean') {
      const item = await toggleBacklogItem(getDb(), user.id, id, done);
      if (!item) return jsonError('Not found', 404);
      return NextResponse.json(item);
    }

    return jsonError('No valid fields', 400);
  });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAuthenticatedUser(async (user) => {
    const { id } = await params;
    const deleted = await deleteBacklogItem(getDb(), user.id, id);

    if (!deleted) {
      return jsonError('Not found', 404);
    }

    return NextResponse.json({ ok: true });
  });
}

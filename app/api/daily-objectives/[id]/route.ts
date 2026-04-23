import { NextResponse } from 'next/server';
import { jsonError, parseJsonBody, withAuthenticatedUser } from '@/lib/api/route-helpers';
import { getDb } from '@/lib/db/client';
import { deleteDailyObjective, updateDailyObjective } from '@/lib/db/queries/daily-objectives';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAuthenticatedUser(async (user) => {
    const { id } = await params;
    const bodyResult = await parseJsonBody(request);
    if (!bodyResult.ok) return bodyResult.response;

    const updates = bodyResult.value as Partial<{
      text: string;
      done: boolean;
      list: string;
      notes: string;
      position: number;
    }>;
    const updated = await updateDailyObjective(getDb(), user.id, id, updates);
    if (!updated) return jsonError('Not found', 404);
    return NextResponse.json(updated);
  });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAuthenticatedUser(async (user) => {
    const { id } = await params;
    await deleteDailyObjective(getDb(), user.id, id);
    return new NextResponse(null, { status: 204 });
  });
}

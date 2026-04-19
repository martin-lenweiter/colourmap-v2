import { NextResponse } from 'next/server';
import { jsonError, parseJsonBody, withAuthenticatedUser } from '@/lib/api/route-helpers';
import { getDb } from '@/lib/db/client';
import { deleteAgendaBlock, updateAgendaBlock } from '@/lib/db/queries/agenda-blocks';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAuthenticatedUser(async (user) => {
    const { id } = await params;
    const bodyResult = await parseJsonBody(request);
    if (!bodyResult.ok) return bodyResult.response;

    const updates = bodyResult.value as Partial<{
      text: string;
      date: string;
      startHour: number;
      duration: number;
      color: string;
      kind: string;
    }>;
    const updated = await updateAgendaBlock(getDb(), user.id, id, updates);
    if (!updated) return jsonError('Not found', 404);
    return NextResponse.json(updated);
  });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAuthenticatedUser(async (user) => {
    const { id } = await params;
    await deleteAgendaBlock(getDb(), user.id, id);
    return new NextResponse(null, { status: 204 });
  });
}

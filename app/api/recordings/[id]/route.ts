import { NextResponse } from 'next/server';

import { jsonError, parseJsonBody, withAuthenticatedUser } from '@/lib/api/route-helpers';
import { deleteRecording, updateRecording } from '@/lib/services/recordings';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAuthenticatedUser(async (user) => {
    const { id } = await params;
    const bodyResult = await parseJsonBody(request);
    if (!bodyResult.ok) return bodyResult.response;

    const body = bodyResult.value as Record<string, unknown>;
    const update: Record<string, unknown> = {};
    if (typeof body.title === 'string' && body.title.trim()) update.title = body.title.trim();
    if (typeof body.category === 'string') update.category = body.category;
    if ('songId' in body) update.songId = typeof body.songId === 'string' ? body.songId : null;
    if ('notes' in body)
      update.notes = typeof body.notes === 'string' && body.notes.trim() ? body.notes.trim() : null;
    if (typeof body.durationSecs === 'number') update.durationSecs = body.durationSecs;

    if (Object.keys(update).length === 0) return jsonError('No valid fields', 400);

    const row = await updateRecording(user.id, id, update);
    if (!row) return jsonError('Not found', 404);
    return NextResponse.json(row);
  });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAuthenticatedUser(async (user) => {
    const { id } = await params;
    const row = await deleteRecording(user.id, id);
    if (!row) return jsonError('Not found', 404);
    return NextResponse.json({ deleted: id });
  });
}

import { NextResponse } from 'next/server';

import { jsonError, parseJsonBody, withAuthenticatedUser } from '@/lib/api/route-helpers';
import {
  markDesignerObservationDone,
  removeDesignerObservation,
} from '@/lib/services/designer-observations';

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAuthenticatedUser(async (user) => {
    const { id } = await params;
    const removed = await removeDesignerObservation(user.id, id);
    if (!removed) return jsonError('not found', 404);
    return NextResponse.json({ ok: true });
  });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAuthenticatedUser(async (user) => {
    const { id } = await params;
    const bodyResult = await parseJsonBody(request);
    if (!bodyResult.ok) return bodyResult.response;
    const { done } = bodyResult.value as { done?: boolean };
    if (typeof done !== 'boolean') return jsonError('done must be a boolean', 400);
    const updated = await markDesignerObservationDone(user.id, id, done);
    if (!updated) return jsonError('not found', 404);
    return NextResponse.json(updated);
  });
}

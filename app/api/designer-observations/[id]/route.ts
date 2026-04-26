import { NextResponse } from 'next/server';

import { jsonError, withAuthenticatedUser } from '@/lib/api/route-helpers';
import { removeDesignerObservation } from '@/lib/services/designer-observations';

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAuthenticatedUser(async (user) => {
    const { id } = await params;
    const removed = await removeDesignerObservation(user.id, id);
    if (!removed) return jsonError('not found', 404);
    return NextResponse.json({ ok: true });
  });
}

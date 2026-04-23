import { NextResponse } from 'next/server';
import { jsonError, parseJsonBody, withAuthenticatedUser } from '@/lib/api/route-helpers';
import { getDb } from '@/lib/db/client';
import { deleteLifeCategory, updateLifeCategory } from '@/lib/db/queries/life-categories';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAuthenticatedUser(async (user) => {
    const { id } = await params;
    const bodyResult = await parseJsonBody(request);
    if (!bodyResult.ok) return bodyResult.response;

    const updates = bodyResult.value as Partial<{
      name: string;
      color: string;
      compass: string | null;
      state: string | null;
      position: number;
    }>;
    const updated = await updateLifeCategory(getDb(), user.id, id, updates);
    if (!updated) return jsonError('Not found', 404);
    return NextResponse.json(updated);
  });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAuthenticatedUser(async (user) => {
    const { id } = await params;
    await deleteLifeCategory(getDb(), user.id, id);
    return new NextResponse(null, { status: 204 });
  });
}

import { NextResponse } from 'next/server';
import { withAuthenticatedUser } from '@/lib/api/route-helpers';
import { getDb } from '@/lib/db/client';
import { deleteOuting } from '@/lib/db/queries/outings';

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAuthenticatedUser(async (user) => {
    const { id } = await params;
    await deleteOuting(getDb(), user.id, id);
    return new NextResponse(null, { status: 204 });
  });
}

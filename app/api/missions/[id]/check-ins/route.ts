import { NextResponse } from 'next/server';

import { withAuthenticatedUser } from '@/lib/api/route-helpers';
import { listMissionCheckIns } from '@/lib/services/check-ins';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAuthenticatedUser(async (user) => {
    const { id } = await params;
    const checkIns = await listMissionCheckIns(user.id, id);
    return NextResponse.json(checkIns);
  });
}

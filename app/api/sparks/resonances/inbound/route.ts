import { NextResponse } from 'next/server';

import { withAuthenticatedUser } from '@/lib/api/route-helpers';
import { getInboundResonances } from '@/lib/db/queries/sparks';

// GET /api/sparks/resonances/inbound
// Returns resonances on sparks owned by the current user —
// so they can see who wants to join and respond.
export async function GET() {
  return withAuthenticatedUser(async (user) => {
    const resonances = await getInboundResonances(user.id);
    return NextResponse.json(resonances);
  });
}

import { NextResponse } from 'next/server';

import { withAuthenticatedUser } from '@/lib/api/route-helpers';
import { getResonancesByUser } from '@/lib/db/queries/sparks';

// GET /api/sparks/resonances/mine
// Returns all resonances the current user has made (so the UI can
// show which sparks they've already resonated with).
export async function GET() {
  return withAuthenticatedUser(async (user) => {
    const resonances = await getResonancesByUser(user.id);
    return NextResponse.json(resonances);
  });
}

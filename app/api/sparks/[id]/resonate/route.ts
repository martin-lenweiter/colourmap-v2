import { NextResponse } from 'next/server';

import { jsonError, parseJsonBody, withAuthenticatedUser } from '@/lib/api/route-helpers';
import {
  type ResonanceStatus,
  resonateWithSpark,
  respondToResonance,
  SparkValidationError,
} from '@/lib/services/sparks';

// POST /api/sparks/[id]/resonate
// Body: { type: 'resonate' | 'join_request' }
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAuthenticatedUser(async (user) => {
    const { id } = await params;
    const bodyResult = await parseJsonBody(request);
    if (!bodyResult.ok) return bodyResult.response;

    const body = bodyResult.value as { type?: 'resonate' | 'join_request' };
    const type = body.type === 'join_request' ? 'join_request' : 'resonate';

    try {
      const resonance = await resonateWithSpark(id, user.id, type);
      return NextResponse.json(resonance, { status: 201 });
    } catch (err) {
      if (err instanceof SparkValidationError) return jsonError(err.message, 400);
      throw err;
    }
  });
}

// PATCH /api/sparks/[id]/resonate
// Body: { userId: string, status: 'accepted' | 'ignored' }
// Called by the spark owner to respond to a join request.
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAuthenticatedUser(async (user) => {
    const { id } = await params;
    const bodyResult = await parseJsonBody(request);
    if (!bodyResult.ok) return bodyResult.response;

    const body = bodyResult.value as { userId?: string; status?: ResonanceStatus };
    if (!body.userId) return jsonError('userId required', 400);
    if (body.status !== 'accepted' && body.status !== 'ignored') {
      return jsonError('status must be accepted or ignored', 400);
    }

    try {
      await respondToResonance(id, user.id, body.userId, body.status);
      return NextResponse.json({ ok: true });
    } catch (err) {
      if (err instanceof SparkValidationError) return jsonError(err.message, 400);
      throw err;
    }
  });
}

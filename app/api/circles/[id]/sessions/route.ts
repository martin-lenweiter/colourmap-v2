import { NextResponse } from 'next/server';

import { jsonError, parseJsonBody, withAuthenticatedUser } from '@/lib/api/route-helpers';
import { getDb } from '@/lib/db/client';
import { getActiveSession } from '@/lib/db/queries/circles';
import { CircleValidationError, endSession, startSession } from '@/lib/services/circles';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAuthenticatedUser(async (_user) => {
    const { id } = await params;
    const session = await getActiveSession(getDb(), id);
    return NextResponse.json(session);
  });
}

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAuthenticatedUser(async (user) => {
    const { id } = await params;

    try {
      const session = await startSession(user.id, id);
      return NextResponse.json(session, { status: 201 });
    } catch (error) {
      if (error instanceof CircleValidationError) {
        return jsonError(error.message, 400);
      }
      throw error;
    }
  });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAuthenticatedUser(async (user) => {
    const { id } = await params;

    const bodyResult = await parseJsonBody(request);
    if (!bodyResult.ok) {
      return bodyResult.response;
    }

    const body = bodyResult.value as { sessionId?: string; summary?: string };
    if (!body.sessionId || typeof body.sessionId !== 'string') {
      return jsonError('sessionId is required', 400);
    }

    try {
      const session = await endSession(user.id, id, body.sessionId, body.summary);
      if (!session) {
        return jsonError('Session not found', 404);
      }
      return NextResponse.json(session);
    } catch (error) {
      if (error instanceof CircleValidationError) {
        return jsonError(error.message, 400);
      }
      throw error;
    }
  });
}

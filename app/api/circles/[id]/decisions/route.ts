import { NextResponse } from 'next/server';

import { jsonError, parseJsonBody, withAuthenticatedUser } from '@/lib/api/route-helpers';
import {
  CircleValidationError,
  listCircleDecisions,
  proposeDecision,
} from '@/lib/services/circles';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAuthenticatedUser(async (user) => {
    const { id } = await params;
    try {
      const decisions = await listCircleDecisions(user.id, id);
      return NextResponse.json(decisions);
    } catch (error) {
      if (error instanceof CircleValidationError) {
        return jsonError(error.message, 400);
      }
      throw error;
    }
  });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAuthenticatedUser(async (user) => {
    const { id } = await params;

    const bodyResult = await parseJsonBody(request);
    if (!bodyResult.ok) {
      return bodyResult.response;
    }

    const body = bodyResult.value as { title?: string; description?: string };
    if (!body.title || typeof body.title !== 'string') {
      return jsonError('title is required', 400);
    }

    try {
      const decision = await proposeDecision(user.id, id, body.title, body.description);
      return NextResponse.json({ ...decision, votes: [] }, { status: 201 });
    } catch (error) {
      if (error instanceof CircleValidationError) {
        return jsonError(error.message, 400);
      }
      throw error;
    }
  });
}

import { NextResponse } from 'next/server';

import { jsonError, parseJsonBody, withAuthenticatedUser } from '@/lib/api/route-helpers';
import {
  archiveDecision,
  CircleValidationError,
  finalizeDecision,
  removeDecision,
} from '@/lib/services/circles';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; decisionId: string }> },
) {
  return withAuthenticatedUser(async (user) => {
    const { id, decisionId } = await params;

    const bodyResult = await parseJsonBody(request);
    if (!bodyResult.ok) {
      return bodyResult.response;
    }

    const body = bodyResult.value as {
      action?: 'decide' | 'archive';
      decision?: 'yes' | 'no';
    };

    try {
      if (body.action === 'archive') {
        const updated = await archiveDecision(user.id, id, decisionId);
        if (!updated) return jsonError('decision not found', 404);
        return NextResponse.json(updated);
      }

      if (body.action === 'decide') {
        if (body.decision !== 'yes' && body.decision !== 'no') {
          return jsonError('decision must be yes or no', 400);
        }
        const updated = await finalizeDecision(user.id, id, decisionId, body.decision);
        if (!updated) return jsonError('decision not found', 404);
        return NextResponse.json(updated);
      }

      return jsonError('action must be decide or archive', 400);
    } catch (error) {
      if (error instanceof CircleValidationError) {
        return jsonError(error.message, 400);
      }
      throw error;
    }
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; decisionId: string }> },
) {
  return withAuthenticatedUser(async (user) => {
    const { id, decisionId } = await params;
    try {
      const removed = await removeDecision(user.id, id, decisionId);
      if (!removed) return jsonError('decision not found', 404);
      return NextResponse.json({ ok: true });
    } catch (error) {
      if (error instanceof CircleValidationError) {
        return jsonError(error.message, 400);
      }
      throw error;
    }
  });
}

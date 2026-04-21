import { NextResponse } from 'next/server';

import { jsonError, parseJsonBody, withAuthenticatedUser } from '@/lib/api/route-helpers';
import { CircleValidationError, removeMission, updateMission } from '@/lib/services/circles';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; missionId: string }> },
) {
  return withAuthenticatedUser(async (user) => {
    const { id, missionId } = await params;

    const bodyResult = await parseJsonBody(request);
    if (!bodyResult.ok) {
      return bodyResult.response;
    }

    const body = bodyResult.value as {
      done?: boolean;
      claimedBy?: string | null;
      text?: string;
      dueDate?: string | null;
    };

    try {
      const mission = await updateMission(user.id, id, missionId, body);
      if (!mission) {
        return jsonError('Not found', 404);
      }
      return NextResponse.json(mission);
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
  { params }: { params: Promise<{ id: string; missionId: string }> },
) {
  return withAuthenticatedUser(async (user) => {
    const { id, missionId } = await params;

    try {
      const deleted = await removeMission(user.id, id, missionId);
      if (!deleted) {
        return jsonError('Not found', 404);
      }
      return NextResponse.json({ ok: true });
    } catch (error) {
      if (error instanceof CircleValidationError) {
        return jsonError(error.message, 400);
      }
      throw error;
    }
  });
}

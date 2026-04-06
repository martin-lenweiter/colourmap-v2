import { NextResponse } from 'next/server';

import { jsonError, parseJsonBody, withAuthenticatedUser } from '@/lib/api/route-helpers';
import {
  MissionValidationError,
  normalizeMissionUpdateInput,
  removeMission,
  updateMissionFields,
} from '@/lib/services/missions';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAuthenticatedUser(async (user) => {
    const { id } = await params;

    const bodyResult = await parseJsonBody(request);
    if (!bodyResult.ok) {
      return bodyResult.response;
    }

    try {
      const mission = await updateMissionFields(
        user.id,
        id,
        normalizeMissionUpdateInput(bodyResult.value),
      );
      if (!mission) {
        return jsonError('Not found', 404);
      }

      return NextResponse.json(mission);
    } catch (error) {
      if (error instanceof MissionValidationError) {
        return jsonError(error.message, 400);
      }

      throw error;
    }
  });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAuthenticatedUser(async (user) => {
    const { id } = await params;
    const deleted = await removeMission(user.id, id);

    if (!deleted) {
      return jsonError('Not found', 404);
    }

    return NextResponse.json({ ok: true });
  });
}

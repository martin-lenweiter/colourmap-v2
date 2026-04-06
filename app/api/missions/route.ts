import { NextResponse } from 'next/server';

import { jsonError, parseJsonBody, withAuthenticatedUser } from '@/lib/api/route-helpers';
import {
  createMission,
  listMissions,
  MissionValidationError,
  normalizeCreateMissionInput,
} from '@/lib/services/missions';

export async function GET() {
  return withAuthenticatedUser(async (user) => {
    const missions = await listMissions(user.id);
    return NextResponse.json(missions);
  });
}

export async function POST(request: Request) {
  return withAuthenticatedUser(async (user) => {
    const bodyResult = await parseJsonBody(request);
    if (!bodyResult.ok) {
      return bodyResult.response;
    }

    try {
      const { title } = normalizeCreateMissionInput(bodyResult.value);
      const mission = await createMission(user.id, title);
      return NextResponse.json(mission, { status: 201 });
    } catch (error) {
      if (error instanceof MissionValidationError) {
        return jsonError(error.message, 400);
      }
      throw error;
    }
  });
}

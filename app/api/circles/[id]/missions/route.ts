import { NextResponse } from 'next/server';

import { jsonError, parseJsonBody, withAuthenticatedUser } from '@/lib/api/route-helpers';
import { addMission, CircleValidationError, listCircleMissions } from '@/lib/services/circles';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAuthenticatedUser(async (_user) => {
    const { id } = await params;
    const missions = await listCircleMissions(id);
    return NextResponse.json(missions);
  });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAuthenticatedUser(async (user) => {
    const { id } = await params;

    const bodyResult = await parseJsonBody(request);
    if (!bodyResult.ok) {
      return bodyResult.response;
    }

    const body = bodyResult.value as { text?: string; dueDate?: string };
    if (!body.text || typeof body.text !== 'string') {
      return jsonError('text is required', 400);
    }

    try {
      const mission = await addMission(user.id, id, body.text, body.dueDate);
      return NextResponse.json(mission, { status: 201 });
    } catch (error) {
      if (error instanceof CircleValidationError) {
        return jsonError(error.message, 400);
      }
      throw error;
    }
  });
}

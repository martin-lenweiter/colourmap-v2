import { NextResponse } from 'next/server';

import { jsonError, parseJsonBody, withAuthenticatedUser } from '@/lib/api/route-helpers';
import {
  createDesignerObservation,
  DesignerObservationValidationError,
  listDesignerObservations,
} from '@/lib/services/designer-observations';

export async function GET() {
  return withAuthenticatedUser(async (user) => {
    const observations = await listDesignerObservations(user.id);
    return NextResponse.json(observations);
  });
}

export async function POST(request: Request) {
  return withAuthenticatedUser(async (user) => {
    const bodyResult = await parseJsonBody(request);
    if (!bodyResult.ok) {
      return bodyResult.response;
    }

    const body = bodyResult.value as { text?: string; area?: string | null };
    if (!body.text || typeof body.text !== 'string') {
      return jsonError('text is required', 400);
    }

    try {
      const observation = await createDesignerObservation(user.id, body.text, body.area ?? null);
      return NextResponse.json(observation, { status: 201 });
    } catch (error) {
      if (error instanceof DesignerObservationValidationError) {
        return jsonError(error.message, 400);
      }
      throw error;
    }
  });
}

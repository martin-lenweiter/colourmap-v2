import { NextResponse } from 'next/server';

import { jsonError, parseJsonBody, withAuthenticatedUser } from '@/lib/api/route-helpers';
import { CircleValidationError, updatePulse } from '@/lib/services/circles';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAuthenticatedUser(async (user) => {
    const { id } = await params;

    const bodyResult = await parseJsonBody(request);
    if (!bodyResult.ok) {
      return bodyResult.response;
    }

    const body = bodyResult.value as { pulse?: string; pulseColor?: string };
    if (!body.pulse || typeof body.pulse !== 'string') {
      return jsonError('pulse is required', 400);
    }
    if (!body.pulseColor || typeof body.pulseColor !== 'string') {
      return jsonError('pulseColor is required', 400);
    }

    try {
      const member = await updatePulse(user.id, id, body.pulse, body.pulseColor);
      if (!member) {
        return jsonError('Not found', 404);
      }
      return NextResponse.json(member);
    } catch (error) {
      if (error instanceof CircleValidationError) {
        return jsonError(error.message, 400);
      }
      throw error;
    }
  });
}

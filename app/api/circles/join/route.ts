import { NextResponse } from 'next/server';

import { jsonError, parseJsonBody, withAuthenticatedUser } from '@/lib/api/route-helpers';
import { CircleValidationError, joinCircle } from '@/lib/services/circles';

export async function POST(request: Request) {
  return withAuthenticatedUser(async (user) => {
    const bodyResult = await parseJsonBody(request);
    if (!bodyResult.ok) {
      return bodyResult.response;
    }

    const body = bodyResult.value as { code?: string; userName?: string };
    if (!body.code || typeof body.code !== 'string') {
      return jsonError('code is required', 400);
    }
    if (!body.userName || typeof body.userName !== 'string') {
      return jsonError('userName is required', 400);
    }

    try {
      const result = await joinCircle(user.id, body.code, body.userName);
      return NextResponse.json(result, { status: 200 });
    } catch (error) {
      if (error instanceof CircleValidationError) {
        return jsonError(error.message, 400);
      }
      throw error;
    }
  });
}

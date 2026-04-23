import { NextResponse } from 'next/server';

import { jsonError, parseJsonBody, withAuthenticatedUser } from '@/lib/api/route-helpers';
import { CircleValidationError, createCircle, listUserCircles } from '@/lib/services/circles';

export async function GET() {
  return withAuthenticatedUser(async (user) => {
    const circles = await listUserCircles(user.id);
    return NextResponse.json(circles);
  });
}

export async function POST(request: Request) {
  return withAuthenticatedUser(async (user) => {
    const bodyResult = await parseJsonBody(request);
    if (!bodyResult.ok) {
      return bodyResult.response;
    }

    const body = bodyResult.value as { name?: string; userName?: string };
    if (!body.name || typeof body.name !== 'string') {
      return jsonError('name is required', 400);
    }
    if (!body.userName || typeof body.userName !== 'string') {
      return jsonError('userName is required', 400);
    }

    try {
      const result = await createCircle(user.id, body.name, body.userName);
      return NextResponse.json(result, { status: 201 });
    } catch (error) {
      if (error instanceof CircleValidationError) {
        return jsonError(error.message, 400);
      }
      throw error;
    }
  });
}

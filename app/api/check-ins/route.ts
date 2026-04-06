import { NextResponse } from 'next/server';

import { jsonError, parseJsonBody, withAuthenticatedUser } from '@/lib/api/route-helpers';
import {
  CheckInValidationError,
  createCheckIn,
  listRecentCheckIns,
  normalizeCreateCheckInInput,
} from '@/lib/services/check-ins';

export async function GET() {
  return withAuthenticatedUser(async (user) => {
    const checkIns = await listRecentCheckIns(user.id, 50);
    return NextResponse.json(checkIns);
  });
}

export async function POST(request: Request) {
  return withAuthenticatedUser(async (user) => {
    const bodyResult = await parseJsonBody(request);
    if (!bodyResult.ok) {
      return bodyResult.response;
    }

    try {
      const input = normalizeCreateCheckInInput(bodyResult.value);
      const checkIn = await createCheckIn(user.id, input);
      return NextResponse.json(checkIn, { status: 201 });
    } catch (error) {
      if (error instanceof CheckInValidationError) {
        return jsonError(error.message, 400);
      }
      throw error;
    }
  });
}

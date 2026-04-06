import { NextResponse } from 'next/server';

import { jsonError, parseJsonBody, withAuthenticatedUser } from '@/lib/api/route-helpers';
import {
  CheckInValidationError,
  deleteCheckIn,
  normalizeCheckInUpdateInput,
  updateCheckIn,
} from '@/lib/services/check-ins';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAuthenticatedUser(async (user) => {
    const { id } = await params;

    const bodyResult = await parseJsonBody(request);
    if (!bodyResult.ok) {
      return bodyResult.response;
    }

    let updated: Awaited<ReturnType<typeof updateCheckIn>>;
    try {
      updated = await updateCheckIn(user.id, id, normalizeCheckInUpdateInput(bodyResult.value));
    } catch (error) {
      if (error instanceof CheckInValidationError) {
        return jsonError(error.message, 400);
      }
      throw error;
    }

    if (!updated) {
      return jsonError('Not found', 404);
    }

    return NextResponse.json(updated);
  });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAuthenticatedUser(async (user) => {
    const { id } = await params;
    await deleteCheckIn(user.id, id);
    return NextResponse.json({ ok: true });
  });
}

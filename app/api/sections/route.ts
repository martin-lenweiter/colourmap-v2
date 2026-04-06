import { NextResponse } from 'next/server';

import { jsonError, parseJsonBody, withAuthenticatedUser } from '@/lib/api/route-helpers';
import {
  createSectionWithTrackers,
  listSectionsForToday,
  normalizeCreateSectionInput,
  SectionValidationError,
} from '@/lib/services/sections';

export async function GET() {
  return withAuthenticatedUser(async (user) => {
    const today = new Date().toISOString().split('T')[0];
    const result = await listSectionsForToday(user.id, today);
    return NextResponse.json(result);
  });
}

export async function POST(request: Request) {
  return withAuthenticatedUser(async (user) => {
    const bodyResult = await parseJsonBody(request);
    if (!bodyResult.ok) {
      return bodyResult.response;
    }

    try {
      const section = await createSectionWithTrackers(
        user.id,
        normalizeCreateSectionInput(bodyResult.value),
      );
      return NextResponse.json(section, { status: 201 });
    } catch (error) {
      if (error instanceof SectionValidationError) {
        return jsonError(error.message, 400);
      }

      throw error;
    }
  });
}

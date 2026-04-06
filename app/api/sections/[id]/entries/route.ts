import { NextResponse } from 'next/server';

import { jsonError, parseJsonBody, withAuthenticatedUser } from '@/lib/api/route-helpers';
import {
  normalizeSectionEntryInput,
  recordSectionEntry,
  SectionValidationError,
} from '@/lib/services/sections';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAuthenticatedUser(async (user) => {
    await params;

    const bodyResult = await parseJsonBody(request);
    if (!bodyResult.ok) {
      return bodyResult.response;
    }

    const today = new Date().toISOString().split('T')[0];
    try {
      const entry = await recordSectionEntry(
        user.id,
        today,
        normalizeSectionEntryInput(bodyResult.value),
      );
      return NextResponse.json(entry);
    } catch (error) {
      if (error instanceof SectionValidationError) {
        return jsonError(error.message, 400);
      }

      throw error;
    }
  });
}

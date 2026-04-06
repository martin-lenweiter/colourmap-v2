import { NextResponse } from 'next/server';

import { jsonError, parseJsonBody, withAuthenticatedUser } from '@/lib/api/route-helpers';
import {
  mutateSectionTracker,
  normalizeRenameSectionInput,
  normalizeSectionTrackerMutationInput,
  removeSection,
  renameSection,
  SectionValidationError,
} from '@/lib/services/sections';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAuthenticatedUser(async (user) => {
    const { id } = await params;
    const bodyResult = await parseJsonBody(request);
    if (!bodyResult.ok) {
      return bodyResult.response;
    }

    try {
      const { name } = normalizeRenameSectionInput(bodyResult.value);
      const section = await renameSection(user.id, id, name);
      if (!section) {
        return jsonError('Not found', 404);
      }

      return NextResponse.json(section);
    } catch (error) {
      if (error instanceof SectionValidationError) {
        return jsonError(error.message, 400);
      }

      throw error;
    }
  });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAuthenticatedUser(async () => {
    const { id } = await params;

    const bodyResult = await parseJsonBody(request);
    if (!bodyResult.ok) {
      return bodyResult.response;
    }

    try {
      const result = await mutateSectionTracker(
        id,
        normalizeSectionTrackerMutationInput(bodyResult.value),
      );
      if ('deleted' in result) {
        return NextResponse.json({ ok: result.deleted });
      }

      return NextResponse.json(result.tracker, { status: 201 });
    } catch (error) {
      if (error instanceof SectionValidationError) {
        return jsonError(error.message, 400);
      }

      throw error;
    }
  });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAuthenticatedUser(async (user) => {
    const { id } = await params;
    const deleted = await removeSection(user.id, id);

    if (!deleted) {
      return jsonError('Not found', 404);
    }

    return NextResponse.json({ ok: true });
  });
}

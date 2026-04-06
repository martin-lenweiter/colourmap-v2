import { NextResponse } from 'next/server';

import { jsonError, parseJsonBody, withAuthenticatedUser } from '@/lib/api/route-helpers';
import {
  deleteNotebookEntry,
  NotebookValidationError,
  normalizeUpdateNotebookEntryInput,
  updateNotebookEntry,
} from '@/lib/services/notebook';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAuthenticatedUser(async (user) => {
    const { id } = await params;
    const bodyResult = await parseJsonBody(request);
    if (!bodyResult.ok) {
      return bodyResult.response;
    }

    try {
      const updated = await updateNotebookEntry(
        user.id,
        id,
        normalizeUpdateNotebookEntryInput(bodyResult.value),
      );

      if (!updated) {
        return jsonError('Not found', 404);
      }

      return NextResponse.json(updated);
    } catch (error) {
      if (error instanceof NotebookValidationError) {
        return jsonError(error.message, 400);
      }

      throw error;
    }
  });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAuthenticatedUser(async (user) => {
    const { id } = await params;
    await deleteNotebookEntry(user.id, id);
    return NextResponse.json({ ok: true });
  });
}

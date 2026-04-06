import { NextResponse } from 'next/server';

import { jsonError, parseJsonBody, withAuthenticatedUser } from '@/lib/api/route-helpers';
import {
  createNotebookEntry,
  listNotebookEntries,
  NotebookValidationError,
  normalizeCreateNotebookEntryInput,
} from '@/lib/services/notebook';

export async function GET() {
  return withAuthenticatedUser(async (user) => {
    const entries = await listNotebookEntries(user.id);
    return NextResponse.json(entries);
  });
}

export async function POST(request: Request) {
  return withAuthenticatedUser(async (user) => {
    const bodyResult = await parseJsonBody(request);
    if (!bodyResult.ok) {
      return bodyResult.response;
    }

    try {
      const entry = await createNotebookEntry(
        user.id,
        normalizeCreateNotebookEntryInput(bodyResult.value),
      );
      return NextResponse.json(entry, { status: 201 });
    } catch (error) {
      if (error instanceof NotebookValidationError) {
        return jsonError(error.message, 400);
      }

      throw error;
    }
  });
}

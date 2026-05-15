import { NextResponse } from 'next/server';

import { jsonError, parseJsonBody, withAuthenticatedUser } from '@/lib/api/route-helpers';
import { addNote, CircleValidationError, listCircleNotes } from '@/lib/services/circles';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAuthenticatedUser(async (user) => {
    const { id } = await params;
    try {
      const notes = await listCircleNotes(user.id, id);
      return NextResponse.json(notes);
    } catch (error) {
      if (error instanceof CircleValidationError) {
        return jsonError(error.message, 400);
      }
      throw error;
    }
  });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAuthenticatedUser(async (user) => {
    const { id } = await params;

    const bodyResult = await parseJsonBody(request);
    if (!bodyResult.ok) {
      return bodyResult.response;
    }

    const body = bodyResult.value as {
      text?: string;
      authorName?: string;
      sessionId?: string;
    };
    if (!body.text || typeof body.text !== 'string') {
      return jsonError('text is required', 400);
    }
    if (!body.authorName || typeof body.authorName !== 'string') {
      return jsonError('authorName is required', 400);
    }

    try {
      const note = await addNote(user.id, id, body.text, body.authorName, body.sessionId);
      return NextResponse.json(note, { status: 201 });
    } catch (error) {
      if (error instanceof CircleValidationError) {
        return jsonError(error.message, 400);
      }
      throw error;
    }
  });
}

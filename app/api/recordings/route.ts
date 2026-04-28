import { NextResponse } from 'next/server';

import { jsonError, parseJsonBody, withAuthenticatedUser } from '@/lib/api/route-helpers';
import { createRecording, listRecordings } from '@/lib/services/recordings';

export async function GET() {
  return withAuthenticatedUser(async (user) => {
    const rows = await listRecordings(user.id);
    return NextResponse.json(rows);
  });
}

export async function POST(request: Request) {
  return withAuthenticatedUser(async (user) => {
    const bodyResult = await parseJsonBody(request);
    if (!bodyResult.ok) return bodyResult.response;

    const body = bodyResult.value as Record<string, unknown>;
    const { title, storagePath, publicUrl, durationSecs, songId, category, notes } = body;

    if (typeof title !== 'string' || !title.trim()) {
      return jsonError('title required', 400);
    }
    if (typeof storagePath !== 'string' || !storagePath) {
      return jsonError('storagePath required', 400);
    }
    if (typeof publicUrl !== 'string' || !publicUrl) {
      return jsonError('publicUrl required', 400);
    }

    const row = await createRecording(user.id, {
      title: title.trim(),
      storagePath,
      publicUrl,
      durationSecs: typeof durationSecs === 'number' ? durationSecs : null,
      songId: typeof songId === 'string' && songId ? songId : null,
      category: typeof category === 'string' && category ? category : 'solo',
      notes: typeof notes === 'string' && notes.trim() ? notes.trim() : null,
    });

    return NextResponse.json(row, { status: 201 });
  });
}

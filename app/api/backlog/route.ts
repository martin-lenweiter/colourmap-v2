import { NextResponse } from 'next/server';

import { jsonError, parseJsonBody, withAuthenticatedUser } from '@/lib/api/route-helpers';
import { getDb } from '@/lib/db/client';
import { getBacklogItems, insertBacklogItem } from '@/lib/db/queries/backlog';

export async function GET() {
  return withAuthenticatedUser(async (user) => {
    const items = await getBacklogItems(getDb(), user.id);
    return NextResponse.json(items);
  });
}

export async function POST(request: Request) {
  return withAuthenticatedUser(async (user) => {
    const bodyResult = await parseJsonBody(request);
    if (!bodyResult.ok) {
      return bodyResult.response;
    }

    const body = bodyResult.value;

    if (typeof body !== 'object' || body === null || !('title' in body)) {
      return jsonError('title is required', 400);
    }

    const { title } = body as { title: unknown };
    if (typeof title !== 'string' || title.trim().length === 0) {
      return jsonError('title must be a non-empty string', 400);
    }

    const item = await insertBacklogItem(getDb(), { userId: user.id, title: title.trim() });
    return NextResponse.json(item, { status: 201 });
  });
}

import { NextResponse } from 'next/server';

import { jsonError, parseJsonBody, withAuthenticatedUser } from '@/lib/api/route-helpers';
import { fetchMessages, postMessage } from '@/lib/services/chat';

// GET /api/chat/[conversationId]/channels/[channelId]/messages?limit=50&before=<iso>
export async function GET(
  request: Request,
  { params }: { params: Promise<{ channelId: string }> },
) {
  return withAuthenticatedUser(async (user) => {
    const { channelId } = await params;
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get('limit') ?? '50'), 100);
    const before = searchParams.get('before') ?? undefined;

    const msgs = await fetchMessages(channelId, user.id, limit, before);
    if (msgs === null) return jsonError('not found', 404);
    return NextResponse.json(msgs);
  });
}

// POST /api/chat/[conversationId]/channels/[channelId]/messages
// body: { text }
export async function POST(
  request: Request,
  { params }: { params: Promise<{ channelId: string }> },
) {
  return withAuthenticatedUser(async (user) => {
    const { channelId } = await params;
    const bodyResult = await parseJsonBody(request);
    if (!bodyResult.ok) return bodyResult.response;

    const { text } = bodyResult.value as { text?: string };
    if (!text?.trim()) return jsonError('text required', 400);

    try {
      const msg = await postMessage({ channelId, userId: user.id, text });
      return NextResponse.json(msg, { status: 201 });
    } catch (e) {
      const err = (e as Error).message;
      if (err === 'not_member') return jsonError('forbidden', 403);
      if (err === 'channel_not_found') return jsonError('not found', 404);
      return jsonError(err, 400);
    }
  });
}

import { NextResponse } from 'next/server';

import { jsonError, parseJsonBody, withAuthenticatedUser } from '@/lib/api/route-helpers';
import { addChannelToConversation } from '@/lib/services/chat';

// POST /api/chat/[conversationId]/channels — add a channel
// body: { name }
export async function POST(
  request: Request,
  { params }: { params: Promise<{ conversationId: string }> },
) {
  return withAuthenticatedUser(async (user) => {
    const { conversationId } = await params;
    const bodyResult = await parseJsonBody(request);
    if (!bodyResult.ok) return bodyResult.response;

    const { name } = bodyResult.value as { name?: string };
    if (!name?.trim()) return jsonError('name required', 400);

    try {
      const ch = await addChannelToConversation({ conversationId, name, userId: user.id });
      return NextResponse.json(ch, { status: 201 });
    } catch (e) {
      const msg = (e as Error).message;
      return jsonError(msg, msg === 'not_member' ? 403 : 400);
    }
  });
}

import { NextResponse } from 'next/server';

import { jsonError, withAuthenticatedUser } from '@/lib/api/route-helpers';
import { getConversationDetail } from '@/lib/services/chat';

// GET /api/chat/[conversationId] — detail + channels + members
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ conversationId: string }> },
) {
  return withAuthenticatedUser(async (user) => {
    const { conversationId } = await params;
    const conv = await getConversationDetail(conversationId, user.id);
    if (!conv) return jsonError('not found', 404);
    return NextResponse.json(conv);
  });
}

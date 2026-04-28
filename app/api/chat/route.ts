import { NextResponse } from 'next/server';

import { jsonError, parseJsonBody, withAuthenticatedUser } from '@/lib/api/route-helpers';
import { createNewConversation, listConversations } from '@/lib/services/chat';

// GET /api/chat — list my conversations
export async function GET() {
  return withAuthenticatedUser(async (user) => {
    const convs = await listConversations(user.id);
    return NextResponse.json(convs);
  });
}

// POST /api/chat — create a conversation
// body: { name?, entityType?, entityId?, memberIds[], firstChannelName? }
export async function POST(request: Request) {
  return withAuthenticatedUser(async (user) => {
    const bodyResult = await parseJsonBody(request);
    if (!bodyResult.ok) return bodyResult.response;

    const { name, entityType, entityId, memberIds, firstChannelName } = bodyResult.value as {
      name?: string;
      entityType?: string;
      entityId?: string;
      memberIds?: string[];
      firstChannelName?: string;
    };

    if (!Array.isArray(memberIds)) return jsonError('memberIds must be an array', 400);

    try {
      const conv = await createNewConversation({
        name: name ?? null,
        entityType: entityType ?? null,
        entityId: entityId ?? null,
        createdBy: user.id,
        memberIds,
        firstChannelName,
      });
      return NextResponse.json(conv, { status: 201 });
    } catch (e) {
      return jsonError((e as Error).message, 400);
    }
  });
}

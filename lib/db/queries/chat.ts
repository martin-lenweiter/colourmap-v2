import { and, asc, desc, eq, inArray, sql } from 'drizzle-orm';

import { getDb } from '@/lib/db/client';
import { channels, conversationMembers, conversations, messages } from '@/lib/db/schema';

export type ConversationRow = typeof conversations.$inferSelect;
export type ChannelRow = typeof channels.$inferSelect;
export type MessageRow = typeof messages.$inferSelect;

export async function getConversationsForUser(
  userId: string,
): Promise<(ConversationRow & { channels: ChannelRow[]; memberCount: number })[]> {
  const db = getDb();
  const memberships = await db
    .select({ conversationId: conversationMembers.conversationId })
    .from(conversationMembers)
    .where(eq(conversationMembers.userId, userId));

  if (memberships.length === 0) return [];

  const ids = memberships.map((m: { conversationId: string }) => m.conversationId);

  const convs = await db
    .select()
    .from(conversations)
    .where(inArray(conversations.id, ids))
    .orderBy(desc(conversations.createdAt));

  const chans = await db
    .select()
    .from(channels)
    .where(inArray(channels.conversationId, ids))
    .orderBy(asc(channels.position));

  const counts = await db
    .select({
      conversationId: conversationMembers.conversationId,
      count: sql<number>`count(*)::int`,
    })
    .from(conversationMembers)
    .where(inArray(conversationMembers.conversationId, ids))
    .groupBy(conversationMembers.conversationId);

  const countMap = Object.fromEntries(
    counts.map((c: { conversationId: string; count: number }) => [c.conversationId, c.count]),
  );
  const chanMap: Record<string, ChannelRow[]> = {};
  for (const ch of chans) {
    if (!chanMap[ch.conversationId]) chanMap[ch.conversationId] = [];
    chanMap[ch.conversationId].push(ch);
  }

  return convs.map((c: ConversationRow) => ({
    ...c,
    channels: chanMap[c.id] ?? [],
    memberCount: countMap[c.id] ?? 0,
  }));
}

export async function getConversation(id: string, userId: string) {
  const db = getDb();
  const [conv] = await db.select().from(conversations).where(eq(conversations.id, id)).limit(1);
  if (!conv) return null;

  const isMember = await db
    .select()
    .from(conversationMembers)
    .where(and(eq(conversationMembers.conversationId, id), eq(conversationMembers.userId, userId)))
    .limit(1);
  if (isMember.length === 0) return null;

  const chans = await db
    .select()
    .from(channels)
    .where(eq(channels.conversationId, id))
    .orderBy(asc(channels.position));

  const members = await db
    .select({ userId: conversationMembers.userId, joinedAt: conversationMembers.joinedAt })
    .from(conversationMembers)
    .where(eq(conversationMembers.conversationId, id));

  return { ...conv, channels: chans, members };
}

export async function createConversation(input: {
  name: string | null;
  entityType: string | null;
  entityId: string | null;
  createdBy: string;
  memberIds: string[];
  firstChannelName: string;
}) {
  const db = getDb();
  const [conv] = await db
    .insert(conversations)
    .values({
      name: input.name ?? undefined,
      entityType: (input.entityType as 'circle' | 'spark') ?? undefined,
      entityId: input.entityId ?? undefined,
      createdBy: input.createdBy,
    })
    .returning();

  const allMembers = Array.from(new Set([input.createdBy, ...input.memberIds]));
  await db
    .insert(conversationMembers)
    .values(allMembers.map((uid) => ({ conversationId: conv.id, userId: uid })));

  const [chan] = await db
    .insert(channels)
    .values({ conversationId: conv.id, name: input.firstChannelName, position: 0 })
    .returning();

  return { ...conv, channels: [chan] };
}

export async function addChannel(input: { conversationId: string; name: string; userId: string }) {
  const db = getDb();
  const isMember = await db
    .select()
    .from(conversationMembers)
    .where(
      and(
        eq(conversationMembers.conversationId, input.conversationId),
        eq(conversationMembers.userId, input.userId),
      ),
    )
    .limit(1);
  if (isMember.length === 0) throw new Error('not_member');

  const existing = await db
    .select({ position: channels.position })
    .from(channels)
    .where(eq(channels.conversationId, input.conversationId))
    .orderBy(desc(channels.position))
    .limit(1);

  const nextPos = existing.length > 0 ? existing[0].position + 1 : 1;

  const [ch] = await db
    .insert(channels)
    .values({ conversationId: input.conversationId, name: input.name, position: nextPos })
    .returning();

  return ch;
}

export async function getMessages(channelId: string, userId: string, limit = 50, before?: string) {
  const db = getDb();
  const chan = await db
    .select({ conversationId: channels.conversationId })
    .from(channels)
    .where(eq(channels.id, channelId))
    .limit(1);
  if (!chan.length) return null;

  const membership = await db
    .select()
    .from(conversationMembers)
    .where(
      and(
        eq(conversationMembers.conversationId, chan[0].conversationId),
        eq(conversationMembers.userId, userId),
      ),
    )
    .limit(1);
  if (!membership.length) return null;

  const rows = before
    ? await db
        .select()
        .from(messages)
        .where(
          and(
            eq(messages.channelId, channelId),
            sql`${messages.createdAt} < ${before}::timestamptz`,
          ),
        )
        .orderBy(desc(messages.createdAt))
        .limit(limit)
    : await db
        .select()
        .from(messages)
        .where(eq(messages.channelId, channelId))
        .orderBy(desc(messages.createdAt))
        .limit(limit);

  return rows.reverse();
}

export async function sendMessage(input: { channelId: string; userId: string; text: string }) {
  const db = getDb();
  const chan = await db
    .select({ conversationId: channels.conversationId })
    .from(channels)
    .where(eq(channels.id, input.channelId))
    .limit(1);
  if (!chan.length) throw new Error('channel_not_found');

  const membership = await db
    .select()
    .from(conversationMembers)
    .where(
      and(
        eq(conversationMembers.conversationId, chan[0].conversationId),
        eq(conversationMembers.userId, input.userId),
      ),
    )
    .limit(1);
  if (!membership.length) throw new Error('not_member');

  const [msg] = await db
    .insert(messages)
    .values({ channelId: input.channelId, userId: input.userId, text: input.text })
    .returning();

  return msg;
}

import {
  addChannel,
  createConversation,
  getConversation,
  getConversationsForUser,
  getMessages,
  sendMessage,
} from '@/lib/db/queries/chat';

export type { ChannelRow, ConversationRow, MessageRow } from '@/lib/db/queries/chat';

export async function listConversations(userId: string) {
  return getConversationsForUser(userId);
}

export async function getConversationDetail(id: string, userId: string) {
  return getConversation(id, userId);
}

export async function createNewConversation(input: {
  name: string | null;
  entityType: string | null;
  entityId: string | null;
  createdBy: string;
  memberIds: string[];
  firstChannelName?: string;
}) {
  if (!input.createdBy) throw new Error('created_by required');
  return createConversation({
    ...input,
    firstChannelName: input.firstChannelName ?? 'general',
  });
}

export async function addChannelToConversation(input: {
  conversationId: string;
  name: string;
  userId: string;
}) {
  const trimmed = input.name.trim().toLowerCase().replace(/\s+/g, '-');
  if (!trimmed) throw new Error('channel name required');
  return addChannel({ ...input, name: trimmed });
}

export async function fetchMessages(
  channelId: string,
  userId: string,
  limit = 50,
  before?: string,
) {
  return getMessages(channelId, userId, limit, before);
}

export async function postMessage(input: { channelId: string; userId: string; text: string }) {
  const trimmed = input.text.trim();
  if (!trimmed) throw new Error('message text required');
  if (trimmed.length > 2000) throw new Error('message too long');
  return sendMessage({ ...input, text: trimmed });
}

import { describe, expect, it, vi } from 'vitest';

import * as queries from '@/lib/db/queries/chat';
import {
  addChannelToConversation,
  createNewConversation,
  fetchMessages,
  getConversationDetail,
  listConversations,
  postMessage,
} from './chat';

vi.mock('@/lib/db/queries/chat');

const q = vi.mocked(queries);

describe('chat service', () => {
  describe('createNewConversation', () => {
    it('creates with default general channel when no firstChannelName given', async () => {
      q.createConversation.mockResolvedValue({
        id: 'conv-1',
        name: 'Weekend',
        entityType: null,
        entityId: null,
        createdBy: 'user-1',
        createdAt: new Date(),
        channels: [
          {
            id: 'ch-1',
            conversationId: 'conv-1',
            name: 'general',
            position: 0,
            createdAt: new Date(),
          },
        ],
      });

      const result = await createNewConversation({
        name: 'Weekend',
        entityType: null,
        entityId: null,
        createdBy: 'user-1',
        memberIds: ['user-2'],
      });

      expect(q.createConversation).toHaveBeenCalledWith(
        expect.objectContaining({ firstChannelName: 'general' }),
      );
      expect(result.channels[0].name).toBe('general');
    });

    it('throws when createdBy is empty', async () => {
      await expect(
        createNewConversation({
          name: 'test',
          entityType: null,
          entityId: null,
          createdBy: '',
          memberIds: [],
        }),
      ).rejects.toThrow('created_by required');
    });
  });

  describe('addChannelToConversation', () => {
    it('normalises channel name to lowercase kebab-case', async () => {
      q.addChannel.mockResolvedValue({
        id: 'ch-2',
        conversationId: 'conv-1',
        name: 'band-ideas',
        position: 1,
        createdAt: new Date(),
      });

      await addChannelToConversation({
        conversationId: 'conv-1',
        name: 'Band Ideas',
        userId: 'user-1',
      });

      expect(q.addChannel).toHaveBeenCalledWith(expect.objectContaining({ name: 'band-ideas' }));
    });

    it('throws when name is empty', async () => {
      await expect(
        addChannelToConversation({ conversationId: 'conv-1', name: '   ', userId: 'user-1' }),
      ).rejects.toThrow('channel name required');
    });
  });

  describe('postMessage', () => {
    it('trims whitespace before saving', async () => {
      q.sendMessage.mockResolvedValue({
        id: 'msg-1',
        channelId: 'ch-1',
        userId: 'user-1',
        text: 'hello',
        createdAt: new Date(),
      });

      await postMessage({ channelId: 'ch-1', userId: 'user-1', text: '  hello  ' });

      expect(q.sendMessage).toHaveBeenCalledWith(expect.objectContaining({ text: 'hello' }));
    });

    it('throws when text is empty after trim', async () => {
      await expect(
        postMessage({ channelId: 'ch-1', userId: 'user-1', text: '   ' }),
      ).rejects.toThrow('message text required');
    });

    it('throws when text exceeds 2000 chars', async () => {
      await expect(
        postMessage({ channelId: 'ch-1', userId: 'user-1', text: 'a'.repeat(2001) }),
      ).rejects.toThrow('message too long');
    });
  });

  describe('getConversationDetail', () => {
    it('delegates to query layer', async () => {
      q.getConversation.mockResolvedValue(null);
      const result = await getConversationDetail('conv-1', 'user-1');
      expect(q.getConversation).toHaveBeenCalledWith('conv-1', 'user-1');
      expect(result).toBeNull();
    });
  });

  describe('listConversations', () => {
    it('delegates to query layer', async () => {
      q.getConversationsForUser.mockResolvedValue([]);
      const result = await listConversations('user-1');
      expect(q.getConversationsForUser).toHaveBeenCalledWith('user-1');
      expect(result).toEqual([]);
    });
  });

  describe('fetchMessages', () => {
    it('delegates to query layer with defaults', async () => {
      q.getMessages.mockResolvedValue([]);
      await fetchMessages('ch-1', 'user-1');
      expect(q.getMessages).toHaveBeenCalledWith('ch-1', 'user-1', 50, undefined);
    });
  });
});

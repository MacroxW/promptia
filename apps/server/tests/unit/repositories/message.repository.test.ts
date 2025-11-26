import { describe, it, expect, beforeEach, vi } from 'vitest';
import { messageRepository } from '@/repositories/message.repository';
import { getCollection } from '@promptia/database';
import { MessageGenerator, SessionGenerator } from '../../helpers/generators';

vi.mock('@promptia/database');

describe('MessageRepository', () => {
  const mockCollection = {
    findOne: vi.fn(),
    find: vi.fn(),
    insertOne: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getCollection).mockResolvedValue(mockCollection as any);
  });

  describe('create', () => {
    it('should create a user message', async () => {
      const session = SessionGenerator.generate();
      const messageData = {
        sessionId: session.id,
        role: 'user' as const,
        content: 'Hello, how are you?',
      };

      const mockInsertResult = { insertedId: 'new-message-id' };
      const mockDoc = {
        _id: { toHexString: () => 'new-message-id' },
        sessionId: { toHexString: () => session.id },
        role: messageData.role,
        content: messageData.content,
        createdAt: new Date(),
      };

      mockCollection.insertOne.mockResolvedValue(mockInsertResult);
      mockCollection.findOne.mockResolvedValue(mockDoc);

      const result = await messageRepository.create(messageData);

      expect(mockCollection.insertOne).toHaveBeenCalled();
      expect(result.content).toBe(messageData.content);
      expect(result.role).toBe('user');
    });

    it('should create an agent message', async () => {
      const session = SessionGenerator.generate();
      const messageData = {
        sessionId: session.id,
        role: 'agent' as const,
        content: 'I am doing well, thank you!',
      };

      const mockInsertResult = { insertedId: 'new-message-id' };
      const mockDoc = {
        _id: { toHexString: () => 'new-message-id' },
        sessionId: { toHexString: () => session.id },
        role: messageData.role,
        content: messageData.content,
        createdAt: new Date(),
      };

      mockCollection.insertOne.mockResolvedValue(mockInsertResult);
      mockCollection.findOne.mockResolvedValue(mockDoc);

      const result = await messageRepository.create(messageData);

      expect(result.role).toBe('agent');
    });
  });

  describe('listBySession', () => {
    it('should list all messages for a session', async () => {
      const session = SessionGenerator.generate();
      const messages = MessageGenerator.generateConversation(3, session.id);

      const mockDocs = messages.map(m => ({
        _id: { toHexString: () => m.id },
        sessionId: { toHexString: () => session.id },
        role: m.role,
        content: m.content,
        createdAt: m.createdAt,
      }));

      const mockCursor = {
        sort: vi.fn().mockReturnThis(),
        toArray: vi.fn().mockResolvedValue(mockDocs),
      };

      mockCollection.find.mockReturnValue(mockCursor);

      const result = await messageRepository.listBySession(session.id);

      expect(mockCollection.find).toHaveBeenCalled();
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return empty array if no messages', async () => {
      const session = SessionGenerator.generate();

      const mockCursor = {
        sort: vi.fn().mockReturnThis(),
        toArray: vi.fn().mockResolvedValue([]),
      };

      mockCollection.find.mockReturnValue(mockCursor);

      const result = await messageRepository.listBySession(session.id);

      expect(result).toEqual([]);
    });

    it('should limit messages when limit option provided', async () => {
      const session = SessionGenerator.generate();
      const messages = MessageGenerator.generateConversation(5, session.id);

      const mockDocs = messages.slice(0, 3).map(m => ({
        _id: { toHexString: () => m.id },
        sessionId: { toHexString: () => session.id },
        role: m.role,
        content: m.content,
        createdAt: m.createdAt,
      }));

      const mockCursor = {
        sort: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        toArray: vi.fn().mockResolvedValue(mockDocs),
      };

      mockCollection.find.mockReturnValue(mockCursor);

      const result = await messageRepository.listBySession(session.id, { limit: 3 });

      expect(mockCursor.limit).toHaveBeenCalledWith(3);
      expect(result).toHaveLength(3);
    });
  });
});

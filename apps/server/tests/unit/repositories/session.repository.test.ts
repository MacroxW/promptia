import { describe, it, expect, beforeEach, vi } from 'vitest';
import { sessionRepository } from '@/repositories/session.repository';
import { getCollection } from '@promptia/database';
import { SessionGenerator, UserGenerator } from '../../helpers/generators';

vi.mock('@promptia/database');

describe('SessionRepository', () => {
  const mockCollection = {
    findOne: vi.fn(),
    find: vi.fn(),
    insertOne: vi.fn(),
    updateOne: vi.fn(),
    findOneAndUpdate: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getCollection).mockResolvedValue(mockCollection as any);
  });

  describe('create', () => {
    it('should create a new session', async () => {
      const user = UserGenerator.generate();
      const sessionData = {
        title: 'Test Session',
        userId: user.id,
      };

      const mockInsertResult = { insertedId: 'new-session-id' };
      const mockDoc = {
        _id: { toHexString: () => 'new-session-id' },
        title: sessionData.title,
        userId: { toHexString: () => user.id },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCollection.insertOne.mockResolvedValue(mockInsertResult);
      mockCollection.findOne.mockResolvedValue(mockDoc);

      const result = await sessionRepository.create(sessionData);

      expect(mockCollection.insertOne).toHaveBeenCalled();
      expect(result.title).toBe(sessionData.title);
      expect(result.userId).toBe(user.id);
    });
  });

  describe('listByUser', () => {
    it('should list all sessions for a user', async () => {
      const user = UserGenerator.generate();
      const sessions = SessionGenerator.generateMany(3, { userId: user.id });

      const mockDocs = sessions.map(s => ({
        _id: { toHexString: () => s.id },
        title: s.title,
        userId: { toHexString: () => user.id },
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
      }));

      const mockCursor = {
        sort: vi.fn().mockReturnThis(),
        toArray: vi.fn().mockResolvedValue(mockDocs),
      };

      mockCollection.find.mockReturnValue(mockCursor);

      const result = await sessionRepository.listByUser(user.id);

      expect(mockCollection.find).toHaveBeenCalled();
      expect(result).toHaveLength(3);
    });
  });

  describe('findById', () => {
    it('should find session by id', async () => {
      const session = SessionGenerator.generate();
      const mockDoc = {
        _id: { toHexString: () => session.id },
        title: session.title,
        userId: { toHexString: () => session.userId },
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      };

      mockCollection.findOne.mockResolvedValue(mockDoc);

      const result = await sessionRepository.findById(session.id);

      expect(result).toBeTruthy();
      expect(result?.id).toBe(session.id);
    });

    it('should return null if session not found', async () => {
      const validObjectId = '507f1f77bcf86cd799439011';
      mockCollection.findOne.mockResolvedValue(null);

      const result = await sessionRepository.findById(validObjectId);

      expect(result).toBeNull();
    });
  });

  describe('updateTitle', () => {
    it('should update session title', async () => {
      const session = SessionGenerator.generate();
      const newTitle = 'Updated Title';

      const mockDoc = {
        _id: { toHexString: () => session.id },
        title: newTitle,
        userId: { toHexString: () => session.userId },
        createdAt: session.createdAt,
        updatedAt: new Date(),
      };

      mockCollection.findOneAndUpdate.mockResolvedValue(mockDoc);

      const result = await sessionRepository.updateTitle(session.id, newTitle);

      expect(mockCollection.findOneAndUpdate).toHaveBeenCalled();
      expect(result?.title).toBe(newTitle);
    });
  });

  describe('updateTimestamp', () => {
    it('should update session timestamp', async () => {
      const session = SessionGenerator.generate();

      await sessionRepository.updateTimestamp(session.id);

      expect(mockCollection.updateOne).toHaveBeenCalled();
    });
  });
});

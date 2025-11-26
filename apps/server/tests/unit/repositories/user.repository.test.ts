import { describe, it, expect, beforeEach, vi } from 'vitest';
import { userRepository } from '@/repositories/user.repository';
import { getCollection } from '@promptia/database';
import { UserGenerator } from '../../helpers/generators';

vi.mock('@promptia/database');

describe('UserRepository', () => {
  const mockCollection = {
    findOne: vi.fn(),
    insertOne: vi.fn(),
    deleteOne: vi.fn(),
    createIndex: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getCollection).mockResolvedValue(mockCollection as any);
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      const user = UserGenerator.generateWithPassword();
      const mockDoc = {
        _id: { toHexString: () => user.id },
        email: user.email,
        name: user.name,
        password: user.password,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      mockCollection.findOne.mockResolvedValue(mockDoc);

      const result = await userRepository.findByEmail(user.email);

      expect(mockCollection.findOne).toHaveBeenCalledWith({ email: user.email });
      expect(result).toMatchObject({
        email: user.email,
        name: user.name,
      });
    });

    it('should return null if user not found', async () => {
      mockCollection.findOne.mockResolvedValue(null);

      const result = await userRepository.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const userData = {
        email: 'new@example.com',
        password: 'hashedpassword',
        name: 'New User',
      };

      const mockInsertResult = { insertedId: 'new-id' };
      const mockDoc = {
        _id: { toHexString: () => 'new-id' },
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCollection.insertOne.mockResolvedValue(mockInsertResult);
      mockCollection.findOne.mockResolvedValue(mockDoc);

      const result = await userRepository.create(userData);

      expect(mockCollection.insertOne).toHaveBeenCalled();
      expect(result.email).toBe(userData.email);
      expect(result.name).toBe(userData.name);
    });

    it('should create user with null name if not provided', async () => {
      const userData = {
        email: 'new@example.com',
        password: 'hashedpassword',
      };

      const mockInsertResult = { insertedId: 'new-id' };
      const mockDoc = {
        _id: { toHexString: () => 'new-id' },
        ...userData,
        name: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCollection.insertOne.mockResolvedValue(mockInsertResult);
      mockCollection.findOne.mockResolvedValue(mockDoc);

      const result = await userRepository.create(userData);

      expect(result.name).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete user by email', async () => {
      const email = 'delete@example.com';

      await userRepository.delete(email);

      expect(mockCollection.deleteOne).toHaveBeenCalledWith({ email });
    });
  });
});

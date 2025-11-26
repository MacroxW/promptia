import { describe, it, expect, beforeEach, vi } from 'vitest';
import { sessionService } from '@/services/session.service';
import { sessionRepository } from '@/repositories/session.repository';
import { messageRepository } from '@/repositories/message.repository';
import { AppError } from '@/middleware/error-handler';
import { UserGenerator, SessionGenerator, MessageGenerator } from '../../helpers/generators';

vi.mock('@/repositories/session.repository');
vi.mock('@/repositories/message.repository');

describe('SessionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new session', async () => {
      const user = UserGenerator.generate();
      const input = { title: 'Test Session' };
      const expectedSession = SessionGenerator.generate({
        userId: user.id,
        title: 'Test Session',
      });

      vi.mocked(sessionRepository.create).mockResolvedValue(expectedSession);

      const result = await sessionService.create(user.id, input);

      expect(sessionRepository.create).toHaveBeenCalledWith({
        userId: user.id,
        title: 'Test Session',
      });
      expect(result).toEqual(expectedSession);
    });

    it('should sanitize title', async () => {
      const user = UserGenerator.generate();
      const input = { title: '  Test Session  ' };
      const expectedSession = SessionGenerator.generate();

      vi.mocked(sessionRepository.create).mockResolvedValue(expectedSession);

      await sessionService.create(user.id, input);

      expect(sessionRepository.create).toHaveBeenCalledWith({
        userId: user.id,
        title: 'Test Session',
      });
    });
  });

  describe('listByUser', () => {
    it('should list all user sessions', async () => {
      const user = UserGenerator.generate();
      const sessions = SessionGenerator.generateMany(3, { userId: user.id });

      vi.mocked(sessionRepository.listByUser).mockResolvedValue(sessions);

      const result = await sessionService.listByUser(user.id);

      expect(sessionRepository.listByUser).toHaveBeenCalledWith(user.id);
      expect(result).toEqual(sessions);
      expect(result).toHaveLength(3);
    });

    it('should return empty array if no sessions', async () => {
      const user = UserGenerator.generate();

      vi.mocked(sessionRepository.listByUser).mockResolvedValue([]);

      const result = await sessionService.listByUser(user.id);

      expect(result).toEqual([]);
    });
  });

  describe('getDetail', () => {
    it('should get session with messages', async () => {
      const user = UserGenerator.generate();
      const session = SessionGenerator.generate({ userId: user.id });
      const messages = MessageGenerator.generateConversation(3, session.id);

      vi.mocked(sessionRepository.findById).mockResolvedValue(session);
      vi.mocked(messageRepository.listBySession).mockResolvedValue(messages);

      const result = await sessionService.getDetail(user.id, session.id);

      expect(sessionRepository.findById).toHaveBeenCalledWith(session.id);
      expect(messageRepository.listBySession).toHaveBeenCalledWith(session.id);
      expect(result).toEqual({ ...session, messages });
    });

    it('should throw error if session not found', async () => {
      const user = UserGenerator.generate();
      const sessionId = 'nonexistent-id';

      vi.mocked(sessionRepository.findById).mockResolvedValue(null);

      await expect(sessionService.getDetail(user.id, sessionId)).rejects.toThrow(AppError);
      await expect(sessionService.getDetail(user.id, sessionId)).rejects.toThrow('Sesión no encontrada');
    });

    it('should throw error if user not authorized', async () => {
      const user = UserGenerator.generate();
      const otherUser = UserGenerator.generate();
      const session = SessionGenerator.generate({ userId: otherUser.id });

      vi.mocked(sessionRepository.findById).mockResolvedValue(session);

      await expect(sessionService.getDetail(user.id, session.id)).rejects.toThrow(AppError);
      await expect(sessionService.getDetail(user.id, session.id)).rejects.toThrow('No autorizado');
    });
  });

  describe('update', () => {
    it('should update session title', async () => {
      const user = UserGenerator.generate();
      const session = SessionGenerator.generate({ userId: user.id });
      const updatedSession = { ...session, title: 'Updated Title' };

      vi.mocked(sessionRepository.findById).mockResolvedValue(session);
      vi.mocked(sessionRepository.updateTitle).mockResolvedValue(updatedSession);

      const result = await sessionService.update(user.id, session.id, { title: 'Updated Title' });

      expect(sessionRepository.updateTitle).toHaveBeenCalledWith(session.id, 'Updated Title');
      expect(result.title).toBe('Updated Title');
    });

    it('should throw error if session not found', async () => {
      const user = UserGenerator.generate();
      const sessionId = 'nonexistent-id';

      vi.mocked(sessionRepository.findById).mockResolvedValue(null);

      await expect(sessionService.update(user.id, sessionId, { title: 'New Title' })).rejects.toThrow(AppError);
    });

    it('should throw error if user not authorized', async () => {
      const user = UserGenerator.generate();
      const otherUser = UserGenerator.generate();
      const session = SessionGenerator.generate({ userId: otherUser.id });

      vi.mocked(sessionRepository.findById).mockResolvedValue(session);

      await expect(sessionService.update(user.id, session.id, { title: 'New Title' })).rejects.toThrow(AppError);
    });

    it('should return session unchanged if no title provided', async () => {
      const user = UserGenerator.generate();
      const session = SessionGenerator.generate({ userId: user.id });

      vi.mocked(sessionRepository.findById).mockResolvedValue(session);

      const result = await sessionService.update(user.id, session.id, {});

      expect(sessionRepository.updateTitle).not.toHaveBeenCalled();
      expect(result).toEqual(session);
    });
  });

  describe('generateTitle', () => {
    it('should generate title from messages', async () => {
      const session = SessionGenerator.generate();
      const messages = MessageGenerator.generateConversation(2, session.id);

      const result = await sessionService.generateTitle(session.id, messages);

      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
      expect(result.length).toBeLessThanOrEqual(50);
    });

    it('should return default title on error', async () => {
      const session = SessionGenerator.generate();
      const messages: any[] = [];

      const result = await sessionService.generateTitle(session.id, messages);

      expect(result).toBe('Nueva conversación');
    });
  });
});

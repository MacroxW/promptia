import { describe, it, expect, beforeEach, vi } from 'vitest';
import { sessionController } from '@/controllers/session.controller';
import { sessionService } from '@/services/session.service';
import { SessionGenerator, UserGenerator } from '../../helpers/generators';

vi.mock('@/services/session.service');

describe('SessionController', () => {
  let mockReq: any;
  let mockRes: any;
  let mockNext: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockReq = {
      user: UserGenerator.generate(),
      body: {},
      params: {},
    };
    
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    
    mockNext = vi.fn();
  });

  describe('listSessions', () => {
    it('should list all user sessions', async () => {
      const sessions = SessionGenerator.generateMany(3, { userId: mockReq.user.id });
      vi.mocked(sessionService.listByUser).mockResolvedValue(sessions);

      await sessionController.listSessions(mockReq, mockRes, mockNext);

      expect(sessionService.listByUser).toHaveBeenCalledWith(mockReq.user.id);
      expect(mockRes.json).toHaveBeenCalledWith({ sessions });
    });

    it('should return 401 if user not authenticated', async () => {
      mockReq.user = undefined;

      await sessionController.listSessions(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(sessionService.listByUser).not.toHaveBeenCalled();
    });
  });

  describe('createSession', () => {
    it('should create a new session', async () => {
      const sessionData = { title: 'New Session' };
      const createdSession = SessionGenerator.generate({ userId: mockReq.user.id });
      
      mockReq.body = sessionData;
      vi.mocked(sessionService.create).mockResolvedValue(createdSession);

      await sessionController.createSession(mockReq, mockRes, mockNext);

      expect(sessionService.create).toHaveBeenCalledWith(mockReq.user.id, sessionData);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(createdSession);
    });

    it('should return 401 if user not authenticated', async () => {
      mockReq.user = undefined;

      await sessionController.createSession(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(sessionService.create).not.toHaveBeenCalled();
    });
  });

  describe('getSession', () => {
    it('should get session detail', async () => {
      const session = SessionGenerator.generateWithMessages(5, { userId: mockReq.user.id });
      mockReq.params.id = session.id;
      
      vi.mocked(sessionService.getDetail).mockResolvedValue(session as any);

      await sessionController.getSession(mockReq, mockRes, mockNext);

      expect(sessionService.getDetail).toHaveBeenCalledWith(mockReq.user.id, session.id);
      expect(mockRes.json).toHaveBeenCalledWith(session);
    });

    it('should return 401 if user not authenticated', async () => {
      mockReq.user = undefined;
      mockReq.params.id = 'session-id';

      await sessionController.getSession(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(sessionService.getDetail).not.toHaveBeenCalled();
    });
  });

  describe('updateSession', () => {
    it('should update session', async () => {
      const session = SessionGenerator.generate({ userId: mockReq.user.id });
      const updateData = { title: 'Updated Title' };
      
      mockReq.params.id = session.id;
      mockReq.body = updateData;
      
      const updatedSession = { ...session, title: updateData.title };
      vi.mocked(sessionService.update).mockResolvedValue(updatedSession);

      await sessionController.updateSession(mockReq, mockRes, mockNext);

      expect(sessionService.update).toHaveBeenCalledWith(mockReq.user.id, session.id, updateData);
      expect(mockRes.json).toHaveBeenCalledWith(updatedSession);
    });

    it('should return 401 if user not authenticated', async () => {
      mockReq.user = undefined;
      mockReq.params.id = 'session-id';

      await sessionController.updateSession(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(sessionService.update).not.toHaveBeenCalled();
    });
  });
});

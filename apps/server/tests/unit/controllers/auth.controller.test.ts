import { describe, it, expect, beforeEach, vi } from 'vitest';
import { authController } from '@/controllers/auth.controller';
import { authService } from '@/services/auth.service';
import { AuthGenerator, UserGenerator } from '../../helpers/generators';

vi.mock('@/services/auth.service');

describe('AuthController', () => {
  let mockReq: any;
  let mockRes: any;
  let mockNext: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockReq = {
      body: {},
    };
    
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    
    mockNext = vi.fn();
  });

  describe('register', () => {
    it('should register a new user and return 201', async () => {
      const registerData = AuthGenerator.generateRegisterData();
      const loginResponse = AuthGenerator.generateLoginResponse();
      
      mockReq.body = registerData;
      vi.mocked(authService.register).mockResolvedValue(loginResponse);

      await authController.register(mockReq, mockRes, mockNext);

      expect(authService.register).toHaveBeenCalledWith(registerData);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(loginResponse);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call next with error on validation failure', async () => {
      mockReq.body = { email: 'invalid' }; // Missing required fields

      await authController.register(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should call next with error on service failure', async () => {
      const registerData = AuthGenerator.generateRegisterData();
      const error = new Error('Service error');
      
      mockReq.body = registerData;
      vi.mocked(authService.register).mockRejectedValue(error);

      await authController.register(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('login', () => {
    it('should login user and return 200', async () => {
      const loginData = AuthGenerator.generateLoginCredentials();
      const loginResponse = AuthGenerator.generateLoginResponse();
      
      mockReq.body = loginData;
      vi.mocked(authService.login).mockResolvedValue(loginResponse);

      await authController.login(mockReq, mockRes, mockNext);

      expect(authService.login).toHaveBeenCalledWith(loginData);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(loginResponse);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call next with error on validation failure', async () => {
      mockReq.body = { email: 'test@example.com' }; // Missing password

      await authController.login(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should call next with error on service failure', async () => {
      const loginData = AuthGenerator.generateLoginCredentials();
      const error = new Error('Invalid credentials');
      
      mockReq.body = loginData;
      vi.mocked(authService.login).mockRejectedValue(error);

      await authController.login(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});

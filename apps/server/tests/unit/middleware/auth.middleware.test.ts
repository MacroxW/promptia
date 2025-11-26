import { describe, it, expect, beforeEach, vi } from 'vitest';
import { authenticate } from '@/middleware/auth.middleware';
import jwt from 'jsonwebtoken';
import { UserGenerator } from '../../helpers/generators';

vi.mock('jsonwebtoken');

describe('AuthMiddleware', () => {
  let mockReq: any;
  let mockRes: any;
  let mockNext: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockReq = {
      headers: {},
    };
    
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    
    mockNext = vi.fn();
  });

  it('should authenticate valid token', () => {
    const user = UserGenerator.generate();
    const token = 'valid-token';
    const decoded = { sub: user.id, email: user.email };

    mockReq.headers.authorization = `Bearer ${token}`;
    vi.mocked(jwt.verify).mockReturnValue(decoded as any);

    authenticate(mockReq, mockRes, mockNext);

    expect(jwt.verify).toHaveBeenCalledWith(token, expect.any(String));
    expect(mockReq.user).toEqual({ id: user.id, email: user.email });
    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
  });

  it('should reject request without authorization header', () => {
    authenticate(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockReq.user).toBeUndefined();
  });

  it('should reject request with invalid token format', () => {
    mockReq.headers.authorization = 'InvalidFormat token';

    authenticate(mockReq, mockRes, mockNext);

    expect(jwt.verify).not.toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalled();
  });

  it('should reject expired token', () => {
    const token = 'expired-token';
    mockReq.headers.authorization = `Bearer ${token}`;
    
    vi.mocked(jwt.verify).mockImplementation(() => {
      throw new Error('Token expired');
    });

    authenticate(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockReq.user).toBeUndefined();
  });

  it('should reject invalid token', () => {
    const token = 'invalid-token';
    mockReq.headers.authorization = `Bearer ${token}`;
    
    vi.mocked(jwt.verify).mockImplementation(() => {
      throw new Error('Invalid token');
    });

    authenticate(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockReq.user).toBeUndefined();
  });
});

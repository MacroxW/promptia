import { describe, it, expect, beforeEach, vi } from 'vitest';
import { authService } from '@/services/auth.service';
import { userRepository } from '@/repositories/user.repository';
import { AppError } from '@/middleware/error-handler';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { mockUser, mockUserWithPassword } from '../../helpers/mock-data';

// Mock dependencies
vi.mock('@/repositories/user.repository');
vi.mock('bcryptjs');
vi.mock('jsonwebtoken');

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerInput = {
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
      };

      vi.mocked(userRepository.findByEmail).mockResolvedValue(null);
      vi.mocked(bcrypt.hash).mockResolvedValue('hashedPassword' as never);
      vi.mocked(userRepository.create).mockResolvedValue(mockUserWithPassword);
      vi.mocked(jwt.sign).mockReturnValue('mock-token' as never);

      const result = await authService.register(registerInput);

      expect(userRepository.findByEmail).toHaveBeenCalledWith('newuser@example.com');
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(userRepository.create).toHaveBeenCalledWith({
        email: 'newuser@example.com',
        password: 'hashedPassword',
        name: 'New User',
      });
      expect(result).toHaveProperty('token', 'mock-token');
      expect(result).toHaveProperty('user');
      expect(result.user).not.toHaveProperty('password');
    });

    it('should throw error if email already exists', async () => {
      const registerInput = {
        email: 'existing@example.com',
        password: 'password123',
      };

      vi.mocked(userRepository.findByEmail).mockResolvedValue(mockUserWithPassword);

      await expect(authService.register(registerInput)).rejects.toThrow(AppError);
      await expect(authService.register(registerInput)).rejects.toThrow('El email ya está registrado');
    });

    it('should sanitize email before checking', async () => {
      const registerInput = {
        email: '  TEST@EXAMPLE.COM  ',
        password: 'password123',
      };

      vi.mocked(userRepository.findByEmail).mockResolvedValue(null);
      vi.mocked(bcrypt.hash).mockResolvedValue('hashedPassword' as never);
      vi.mocked(userRepository.create).mockResolvedValue(mockUserWithPassword);
      vi.mocked(jwt.sign).mockReturnValue('mock-token' as never);

      await authService.register(registerInput);

      expect(userRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
    });
  });

  describe('login', () => {
    it('should login user with valid credentials', async () => {
      const loginInput = {
        email: 'test@example.com',
        password: 'password123',
      };

      vi.mocked(userRepository.findByEmail).mockResolvedValue(mockUserWithPassword);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      vi.mocked(jwt.sign).mockReturnValue('mock-token' as never);

      const result = await authService.login(loginInput);

      expect(userRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', mockUserWithPassword.password);
      expect(result).toHaveProperty('token', 'mock-token');
      expect(result).toHaveProperty('user');
    });

    it('should throw error if user not found', async () => {
      const loginInput = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      vi.mocked(userRepository.findByEmail).mockResolvedValue(null);

      await expect(authService.login(loginInput)).rejects.toThrow(AppError);
      await expect(authService.login(loginInput)).rejects.toThrow('Credenciales inválidas');
    });

    it('should throw error if password is invalid', async () => {
      const loginInput = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      vi.mocked(userRepository.findByEmail).mockResolvedValue(mockUserWithPassword);
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      await expect(authService.login(loginInput)).rejects.toThrow(AppError);
      await expect(authService.login(loginInput)).rejects.toThrow('Credenciales inválidas');
    });

    it('should sanitize email before login', async () => {
      const loginInput = {
        email: '  TEST@EXAMPLE.COM  ',
        password: 'password123',
      };

      vi.mocked(userRepository.findByEmail).mockResolvedValue(mockUserWithPassword);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      vi.mocked(jwt.sign).mockReturnValue('mock-token' as never);

      await authService.login(loginInput);

      expect(userRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
    });
  });
});

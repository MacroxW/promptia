import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { AuthGenerator } from '../helpers/generators';
import { getTestApp, cleanupTestDatabase, closeTestConnections } from '../helpers/test-server';

describe('E2E: Authentication Flow', () => {
  const app = getTestApp();
  let registeredUserEmail: string;
  let registeredUserPassword: string;
  let authToken: string;

  beforeAll(async () => {
    await cleanupTestDatabase();
  });

  afterAll(async () => {
    // Don't cleanup - let the last test file do it
  });

  describe('POST /auth/register - User Registration', () => {
    it('should successfully register a new user with valid data', async () => {
      const registerData = AuthGenerator.generateRegisterData();
      registeredUserEmail = registerData.email;
      registeredUserPassword = registerData.password;

      const response = await request(app)
        .post('/auth/register')
        .send(registerData)
        .expect(201);

      expect(response.body).toHaveProperty('token');
      expect(response.body.token).toBeTypeOf('string');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toMatchObject({
        email: registerData.email,
        name: registerData.name,
      });
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('createdAt');
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should reject registration with duplicate email', async () => {
      const registerData = {
        email: registeredUserEmail,
        password: 'newpassword123',
        name: 'Another User',
      };

      await request(app)
        .post('/auth/register')
        .send(registerData)
        .expect(409);
    });

    it('should reject registration with invalid email format', async () => {
      const registerData = {
        email: 'invalid-email',
        password: 'password123',
        name: 'Test User',
      };

      await request(app)
        .post('/auth/register')
        .send(registerData)
        .expect(400);
    });

    it('should reject registration with missing required fields', async () => {
      const registerData = {
        email: 'test@example.com',
        // Missing password
      };

      await request(app)
        .post('/auth/register')
        .send(registerData as any)
        .expect(400);
    });

    it('should reject registration with weak password', async () => {
      const registerData = {
        email: 'test@example.com',
        password: '123', // Too short
        name: 'Test User',
      };

      await request(app)
        .post('/auth/register')
        .send(registerData)
        .expect(400);
    });
  });

  describe('POST /auth/login - User Login', () => {
    it('should successfully login with valid credentials', async () => {
      const loginData = {
        email: registeredUserEmail,
        password: registeredUserPassword,
      };

      const response = await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body.token).toBeTypeOf('string');
      authToken = response.body.token;
      
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(loginData.email);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should reject login with incorrect password', async () => {
      const loginData = {
        email: registeredUserEmail,
        password: 'wrongpassword',
      };

      await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(401);
    });

    it('should reject login with non-existent email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(401);
    });

    it('should reject login with invalid email format', async () => {
      const loginData = {
        email: 'invalid-email',
        password: 'password123',
      };

      await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(400);
    });

    it('should reject login with missing credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        // Missing password
      };

      await request(app)
        .post('/auth/login')
        .send(loginData as any)
        .expect(400);
    });
  });

  describe('Token Validation', () => {
    it('should accept requests with valid authentication token', async () => {
      await request(app)
        .get('/api/sessions')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });

    it('should reject requests without authentication token', async () => {
      await request(app)
        .get('/api/sessions')
        .expect(401);
    });

    it('should reject requests with invalid token format', async () => {
      await request(app)
        .get('/api/sessions')
        .set('Authorization', 'InvalidFormat token')
        .expect(401);
    });

    it('should reject requests with expired token', async () => {
      const expiredToken = 'expired.jwt.token';
      
      await request(app)
        .get('/api/sessions')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);
    });
  });
});

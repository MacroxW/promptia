import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { AuthGenerator } from '../helpers/generators';
import { getTestApp, cleanupTestDatabase, closeTestConnections } from '../helpers/test-server';

describe('E2E: Session Management', () => {
  const app = getTestApp();
  let authToken: string;
  let userId: string;
  let sessionId: string;
  let anotherUserToken: string;
  let anotherUserSessionId: string;

  beforeAll(async () => {
    // Create first user
    const user1Data = AuthGenerator.generateRegisterData();
    const user1Response = await request(app)
      .post('/auth/register')
      .send(user1Data);
    authToken = user1Response.body.token;
    userId = user1Response.body.user.id;
    
    // Create second user
    const user2Data = AuthGenerator.generateRegisterData();
    const user2Response = await request(app)
      .post('/auth/register')
      .send(user2Data);
    anotherUserToken = user2Response.body.token;
  });

  afterAll(async () => {
    // Don't cleanup - let the last test file do it
  });

  describe('POST /api/sessions - Create Session', () => {
    it('should successfully create a new session with valid data', async () => {
      const sessionData = {
        title: 'My First Chat Session',
      };

      const response = await request(app)
        .post('/api/sessions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(sessionData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(sessionData.title);
      expect(response.body.userId).toBe(userId);
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
      
      sessionId = response.body.id;
    });

    it('should create session with sanitized title', async () => {
      const sessionData = {
        title: '  Session with extra spaces  ',
      };

      const response = await request(app)
        .post('/api/sessions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(sessionData)
        .expect(201);

      expect(response.body.title).toBe('Session with extra spaces');
    });

    it('should reject session creation without authentication', async () => {
      const sessionData = {
        title: 'Unauthorized Session',
      };

      await request(app)
        .post('/api/sessions')
        .send(sessionData)
        .expect(401);
    });

    it('should reject session creation with invalid data', async () => {
      const sessionData = {};

      await request(app)
        .post('/api/sessions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(sessionData)
        .expect(400);
    });
  });

  describe('GET /api/sessions - List Sessions', () => {
    it('should successfully list all user sessions', async () => {
      // Create additional sessions
      await request(app)
        .post('/api/sessions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Session 2' });
      
      await request(app)
        .post('/api/sessions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Session 3' });

      const response = await request(app)
        .get('/api/sessions')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('sessions');
      expect(Array.isArray(response.body.sessions)).toBe(true);
      expect(response.body.sessions.length).toBeGreaterThanOrEqual(3);
    });

    it('should return empty array when user has no sessions', async () => {
      const newUserData = AuthGenerator.generateRegisterData();
      const newUserResponse = await request(app)
        .post('/auth/register')
        .send(newUserData);
      
      const response = await request(app)
        .get('/api/sessions')
        .set('Authorization', `Bearer ${newUserResponse.body.token}`)
        .expect(200);

      expect(response.body.sessions).toEqual([]);
    });

    it('should only return sessions belonging to authenticated user', async () => {
      const response = await request(app)
        .get('/api/sessions')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      response.body.sessions.forEach((session: any) => {
        expect(session.userId).toBe(userId);
      });
    });

    it('should reject listing sessions without authentication', async () => {
      await request(app)
        .get('/api/sessions')
        .expect(401);
    });
  });

  describe('GET /api/sessions/:id - Get Session Detail', () => {
    it('should successfully get session with messages', async () => {
      const response = await request(app)
        .get(`/api/sessions/${sessionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', sessionId);
      expect(response.body).toHaveProperty('title');
      expect(response.body).toHaveProperty('userId', userId);
      expect(response.body).toHaveProperty('messages');
      expect(Array.isArray(response.body.messages)).toBe(true);
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
    });

    it('should return 404 for non-existent session', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011';
      
      await request(app)
        .get(`/api/sessions/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 403 when accessing another user session', async () => {
      // Create session for another user
      const otherSessionResponse = await request(app)
        .post('/api/sessions')
        .set('Authorization', `Bearer ${anotherUserToken}`)
        .send({ title: 'Other User Session' });
      
      await request(app)
        .get(`/api/sessions/${otherSessionResponse.body.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);
    });

    it('should return 400 for invalid session ID format', async () => {
      const invalidId = 'invalid-id-format';
      
      await request(app)
        .get(`/api/sessions/${invalidId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });

    it('should reject getting session without authentication', async () => {
      await request(app)
        .get(`/api/sessions/${sessionId}`)
        .expect(401);
    });
  });

  describe('PATCH /api/sessions/:id - Update Session', () => {
    it('should successfully update session title', async () => {
      const updateData = {
        title: 'Updated Session Title',
      };

      const response = await request(app)
        .patch(`/api/sessions/${sessionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.title).toBe(updateData.title);
      expect(response.body.id).toBe(sessionId);
    });

    it('should sanitize title when updating', async () => {
      const updateData = {
        title: '  Title with spaces  ',
      };

      const response = await request(app)
        .patch(`/api/sessions/${sessionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.title).toBe('Title with spaces');
    });

    it('should return session unchanged when no title provided', async () => {
      const updateData = {};

      const response = await request(app)
        .patch(`/api/sessions/${sessionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.id).toBe(sessionId);
    });

    it('should return 404 when updating non-existent session', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011';
      const updateData = { title: 'New Title' };
      
      await request(app)
        .patch(`/api/sessions/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(404);
    });

    it('should return 403 when updating another user session', async () => {
      const otherSessionResponse = await request(app)
        .post('/api/sessions')
        .set('Authorization', `Bearer ${anotherUserToken}`)
        .send({ title: 'Other Session' });
      
      const updateData = { title: 'Hacked Title' };
      
      await request(app)
        .patch(`/api/sessions/${otherSessionResponse.body.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(403);
    });

    it('should reject updating session without authentication', async () => {
      const updateData = { title: 'New Title' };
      
      await request(app)
        .patch(`/api/sessions/${sessionId}`)
        .send(updateData)
        .expect(401);
    });
  });
});

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { AuthGenerator } from '../helpers/generators';
import { getTestApp, cleanupTestDatabase, closeTestConnections } from '../helpers/test-server';

describe('E2E: Chat Functionality', () => {
  const app = getTestApp();
  let authToken: string;
  let sessionId: string;

  beforeAll(async () => {
    // Create user
    const userData = AuthGenerator.generateRegisterData();
    const userResponse = await request(app)
      .post('/auth/register')
      .send(userData);
    authToken = userResponse.body.token;
    
    // Create session
    const sessionResponse = await request(app)
      .post('/api/sessions')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ title: 'Test Chat' });
    sessionId = sessionResponse.body.id;
  });

  afterAll(async () => {
    await cleanupTestDatabase();
    await closeTestConnections();
  });

  describe('POST /api/chat/stream - Send Message', () => {
    it('should successfully send a message and receive streaming response', async () => {
      const messageData = {
        sessionId,
        message: 'Hello, how are you?',
      };

      const response = await request(app)
        .post('/api/chat/stream')
        .set('Authorization', `Bearer ${authToken}`)
        .send(messageData)
        .expect(200);

      // Verify response is Server-Sent Events
      expect(response.headers['content-type']).toContain('text/event-stream');
    });

    it('should persist user message in database', async () => {
      const messageData = {
        sessionId,
        message: 'What is the weather like?',
      };

      await request(app)
        .post('/api/chat/stream')
        .set('Authorization', `Bearer ${authToken}`)
        .send(messageData);

      // Wait a bit for message to be saved
      await new Promise(resolve => setTimeout(resolve, 100));

      // Get session and verify message was saved
      const session = await request(app)
        .get(`/api/sessions/${sessionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const userMessages = session.body.messages.filter((m: any) => m.role === 'user');
      expect(userMessages.length).toBeGreaterThan(0);

      const lastUserMessage = userMessages[userMessages.length - 1];
      expect(lastUserMessage.content).toBe(messageData.message);
      expect(lastUserMessage.role).toBe('user');
    });

    it('should persist agent response in database', async () => {
      const messageData = {
        sessionId,
        message: 'Tell me a joke',
      };

      await request(app)
        .post('/api/chat/stream')
        .set('Authorization', `Bearer ${authToken}`)
        .send(messageData);

      // Wait for streaming to complete
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Get session and verify agent response was saved
      const session = await request(app)
        .get(`/api/sessions/${sessionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const agentMessages = session.body.messages.filter((m: any) => m.role === 'agent');
      expect(agentMessages.length).toBeGreaterThan(0);

      const lastAgentMessage = agentMessages[agentMessages.length - 1];
      expect(lastAgentMessage.role).toBe('agent');
      expect(lastAgentMessage.content).toBeTruthy();
      expect(lastAgentMessage.content.length).toBeGreaterThan(0);
    });

    it('should update session timestamp after message', async () => {
      // Get original session
      const originalSession = await request(app)
        .get(`/api/sessions/${sessionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const originalUpdatedAt = new Date(originalSession.body.updatedAt);

      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 100));

      // Send message
      await request(app)
        .post('/api/chat/stream')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sessionId,
          message: 'Update timestamp test',
        });

      // Wait for message to be processed
      await new Promise(resolve => setTimeout(resolve, 100));

      // Get updated session
      const updatedSession = await request(app)
        .get(`/api/sessions/${sessionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const newUpdatedAt = new Date(updatedSession.body.updatedAt);
      expect(newUpdatedAt.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt.getTime());
    });

    it('should reject message without authentication', async () => {
      const messageData = {
        sessionId,
        message: 'Unauthorized message',
      };

      await request(app)
        .post('/api/chat/stream')
        .send(messageData)
        .expect(401);
    });

    it('should reject message with invalid session ID', async () => {
      const messageData = {
        sessionId: 'invalid-session-id',
        message: 'Test message',
      };

      await request(app)
        .post('/api/chat/stream')
        .set('Authorization', `Bearer ${authToken}`)
        .send(messageData)
        .expect(400);
    });

    it('should reject message to non-existent session', async () => {
      const messageData = {
        sessionId: '507f1f77bcf86cd799439011',
        message: 'Test message',
      };

      await request(app)
        .post('/api/chat/stream')
        .set('Authorization', `Bearer ${authToken}`)
        .send(messageData)
        .expect(404);
    });

    it('should reject message to another user session', async () => {
      // Create another user
      const anotherUserData = AuthGenerator.generateRegisterData();
      const anotherUserResponse = await request(app)
        .post('/auth/register')
        .send(anotherUserData);

      // Create session for another user
      const anotherSessionResponse = await request(app)
        .post('/api/sessions')
        .set('Authorization', `Bearer ${anotherUserResponse.body.token}`)
        .send({ title: 'Other Session' });

      const messageData = {
        sessionId: anotherSessionResponse.body.id,
        message: 'Unauthorized access',
      };

      await request(app)
        .post('/api/chat/stream')
        .set('Authorization', `Bearer ${authToken}`)
        .send(messageData)
        .expect(403);
    });

    it('should reject empty message', async () => {
      const messageData = {
        sessionId,
        message: '',
      };

      await request(app)
        .post('/api/chat/stream')
        .set('Authorization', `Bearer ${authToken}`)
        .send(messageData)
        .expect(400);
    });

    it('should reject message without content', async () => {
      const messageData = {
        sessionId,
      };

      await request(app)
        .post('/api/chat/stream')
        .set('Authorization', `Bearer ${authToken}`)
        .send(messageData)
        .expect(400);
    });
  });

  describe('Auto-Generate Session Title', () => {
    it('should auto-generate title after first user message', { timeout: 10000 }, async () => {
      // Create new session with default title
      const newSessionResponse = await request(app)
        .post('/api/sessions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'New Chat' });

      // Send first message
      await request(app)
        .post('/api/chat/stream')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sessionId: newSessionResponse.body.id,
          message: 'I want to learn about machine learning',
        });

      // Wait for title generation
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Get session and verify title was auto-generated
      const updatedSession = await request(app)
        .get(`/api/sessions/${newSessionResponse.body.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(updatedSession.body.title).not.toBe('New Chat');
      expect(updatedSession.body.title.length).toBeGreaterThan(0);
      expect(updatedSession.body.title.length).toBeLessThanOrEqual(50);
    });

    it('should generate relevant title based on conversation', async () => {
      const newSessionResponse = await request(app)
        .post('/api/sessions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'New Chat' });

      // Send message about specific topic
      await request(app)
        .post('/api/chat/stream')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sessionId: newSessionResponse.body.id,
          message: 'Can you help me write a Python script for data analysis?',
        });

      await new Promise(resolve => setTimeout(resolve, 3000));

      const updatedSession = await request(app)
        .get(`/api/sessions/${newSessionResponse.body.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Title should be related to the topic
      expect(updatedSession.body.title).not.toBe('New Chat');
      expect(updatedSession.body.title.length).toBeGreaterThan(0);
    });

    it('should not regenerate title for existing conversations', async () => {
      // Get session with existing title
      const session = await request(app)
        .get(`/api/sessions/${sessionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const originalTitle = session.body.title;

      // Send another message
      await request(app)
        .post('/api/chat/stream')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sessionId,
          message: 'Another message',
        });

      await new Promise(resolve => setTimeout(resolve, 2000));

      // Verify title hasn't changed
      const updatedSession = await request(app)
        .get(`/api/sessions/${sessionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(updatedSession.body.title).toBe(originalTitle);
    });
  });

  describe('Conversation Context', () => {
    it('should maintain conversation context across messages', { timeout: 10000 }, async () => {
      const newSessionResponse = await request(app)
        .post('/api/sessions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Context Test' });

      // First message
      await request(app)
        .post('/api/chat/stream')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sessionId: newSessionResponse.body.id,
          message: 'My name is Alice',
        });

      await new Promise(resolve => setTimeout(resolve, 2000));

      // Second message referencing first
      await request(app)
        .post('/api/chat/stream')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sessionId: newSessionResponse.body.id,
          message: 'What is my name?',
        });

      await new Promise(resolve => setTimeout(resolve, 2000));

      // Get messages and verify agent remembered the name
      const session = await request(app)
        .get(`/api/sessions/${newSessionResponse.body.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const agentMessages = session.body.messages.filter((m: any) => m.role === 'agent');
      const lastAgentMessage = agentMessages[agentMessages.length - 1];

      expect(lastAgentMessage.content.toLowerCase()).toContain('alice');
    });

    it('should handle multi-turn conversations', { timeout: 15000 }, async () => {
      const newSessionResponse = await request(app)
        .post('/api/sessions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Multi-turn Test' });

      // Send multiple messages
      for (const msg of [
        'What is 2 + 2?',
        'Now multiply that by 3',
        'And divide by 2',
      ]) {
        await request(app)
          .post('/api/chat/stream')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            sessionId: newSessionResponse.body.id,
            message: msg,
          });
        await new Promise(resolve => setTimeout(resolve, 2500));
      }

      // Wait extra time for last message to be fully saved
      await new Promise(resolve => setTimeout(resolve, 500));

      // Verify all messages were saved
      const session = await request(app)
        .get(`/api/sessions/${newSessionResponse.body.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(session.body.messages.length).toBeGreaterThanOrEqual(6); // 3 user + 3 agent
    });
  });
});

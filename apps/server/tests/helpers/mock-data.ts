import type { User, Session, Message } from '@promptia/types';
import {
  UserGenerator,
  SessionGenerator,
  MessageGenerator,
  seedFaker,
} from './generators';

// Seed faker para datos consistentes en tests
seedFaker(12345);

// Datos mock estáticos generados con faker (para compatibilidad con tests existentes)
export const mockUser: User = UserGenerator.generate({
  id: '507f1f77bcf86cd799439011',
  email: 'test@example.com',
  name: 'Test User',
});

export const mockUserWithPassword = UserGenerator.generateWithPassword({
  id: '507f1f77bcf86cd799439011',
  email: 'test@example.com',
  name: 'Test User',
});

export const mockSession: Session = SessionGenerator.generate({
  id: '507f1f77bcf86cd799439012',
  title: 'Test Session',
  userId: mockUser.id,
});

export const mockMessage: Message = MessageGenerator.generateUserMessage({
  id: '507f1f77bcf86cd799439013',
  sessionId: mockSession.id,
  content: 'Hello, this is a test message',
});

export const mockMessages: Message[] = [
  mockMessage,
  MessageGenerator.generateAgentMessage({
    id: '507f1f77bcf86cd799439014',
    sessionId: mockSession.id,
    content: 'Hello! How can I help you today?',
  }),
];

// Factory functions usando generators
export const createMockUser = (overrides?: Partial<User>): User =>
  UserGenerator.generate(overrides);

export const createMockSession = (overrides?: Partial<Session>): Session =>
  SessionGenerator.generate(overrides);

export const createMockMessage = (overrides?: Partial<Message>): Message =>
  MessageGenerator.generate(overrides);

// Re-export generators para fácil acceso
export {
  UserGenerator,
  SessionGenerator,
  MessageGenerator,
  AuthGenerator,
  IdGenerator,
  DateGenerator,
  TestDataGenerator,
  seedFaker,
} from './generators';

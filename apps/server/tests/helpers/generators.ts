import { faker } from '@faker-js/faker';
import type { User, Session, Message, MessageRole } from '@promptia/types';

/**
 * Generator para crear usuarios de prueba
 */
export class UserGenerator {
  /**
   * Genera un usuario completo con datos aleatorios
   */
  static generate(overrides?: Partial<User>): User {
    return {
      id: faker.database.mongodbObjectId(),
      email: faker.internet.email().toLowerCase(),
      name: faker.person.fullName(),
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
      ...overrides,
    };
  }

  /**
   * Genera un usuario con contraseña hasheada
   */
  static generateWithPassword(overrides?: Partial<User & { password: string }>) {
    return {
      ...this.generate(overrides),
      password: faker.internet.password({ length: 60, prefix: '$2a$10$' }), // Simula bcrypt hash
      ...overrides,
    };
  }

  /**
   * Genera múltiples usuarios
   */
  static generateMany(count: number, overrides?: Partial<User>): User[] {
    return Array.from({ length: count }, () => this.generate(overrides));
  }

  /**
   * Genera un email válido
   */
  static generateEmail(): string {
    return faker.internet.email().toLowerCase();
  }

  /**
   * Genera un nombre completo
   */
  static generateName(): string {
    return faker.person.fullName();
  }
}

/**
 * Generator para crear sesiones de prueba
 */
export class SessionGenerator {
  /**
   * Genera una sesión completa con datos aleatorios
   */
  static generate(overrides?: Partial<Session>): Session {
    return {
      id: faker.database.mongodbObjectId(),
      title: faker.lorem.sentence({ min: 2, max: 5 }),
      userId: faker.database.mongodbObjectId(),
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
      messages: [],
      ...overrides,
    };
  }

  /**
   * Genera múltiples sesiones
   */
  static generateMany(count: number, overrides?: Partial<Session>): Session[] {
    return Array.from({ length: count }, () => this.generate(overrides));
  }

  /**
   * Genera una sesión con mensajes
   */
  static generateWithMessages(
    messageCount: number,
    overrides?: Partial<Session>
  ): Session {
    const session = this.generate(overrides);
    const messages = MessageGenerator.generateMany(messageCount, {
      sessionId: session.id,
    });
    return {
      ...session,
      messages,
    };
  }

  /**
   * Genera un título de sesión
   */
  static generateTitle(): string {
    return faker.lorem.sentence({ min: 2, max: 5 });
  }
}

/**
 * Generator para crear mensajes de prueba
 */
export class MessageGenerator {
  /**
   * Genera un mensaje completo con datos aleatorios
   */
  static generate(overrides?: Partial<Message>): Message {
    const roles: MessageRole[] = ['user', 'agent', 'system'];
    return {
      id: faker.database.mongodbObjectId(),
      sessionId: faker.database.mongodbObjectId(),
      role: faker.helpers.arrayElement(roles),
      content: faker.lorem.paragraph(),
      createdAt: faker.date.recent(),
      ...overrides,
    };
  }

  /**
   * Genera múltiples mensajes
   */
  static generateMany(count: number, overrides?: Partial<Message>): Message[] {
    return Array.from({ length: count }, () => this.generate(overrides));
  }

  /**
   * Genera un mensaje de usuario
   */
  static generateUserMessage(overrides?: Partial<Message>): Message {
    return this.generate({
      role: 'user',
      content: faker.lorem.sentence(),
      ...overrides,
    });
  }

  /**
   * Genera un mensaje del agente
   */
  static generateAgentMessage(overrides?: Partial<Message>): Message {
    return this.generate({
      role: 'agent',
      content: faker.lorem.paragraphs(2),
      ...overrides,
    });
  }

  /**
   * Genera una conversación (pares de mensajes usuario-agente)
   */
  static generateConversation(
    exchanges: number,
    sessionId?: string
  ): Message[] {
    const messages: Message[] = [];
    const sid = sessionId || faker.database.mongodbObjectId();

    for (let i = 0; i < exchanges; i++) {
      messages.push(
        this.generateUserMessage({
          sessionId: sid,
          createdAt: faker.date.recent({ days: 1 }),
        })
      );
      messages.push(
        this.generateAgentMessage({
          sessionId: sid,
          createdAt: faker.date.recent({ days: 1 }),
        })
      );
    }

    return messages.sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    );
  }

  /**
   * Genera contenido de mensaje
   */
  static generateContent(type: 'short' | 'medium' | 'long' = 'medium'): string {
    switch (type) {
      case 'short':
        return faker.lorem.sentence();
      case 'medium':
        return faker.lorem.paragraph();
      case 'long':
        return faker.lorem.paragraphs(3);
    }
  }
}

/**
 * Generator para datos de autenticación
 */
export class AuthGenerator {
  /**
   * Genera credenciales de login
   */
  static generateLoginCredentials() {
    return {
      email: faker.internet.email().toLowerCase(),
      password: faker.internet.password({ length: 12 }),
    };
  }

  /**
   * Genera datos de registro
   */
  static generateRegisterData() {
    return {
      email: faker.internet.email().toLowerCase(),
      password: faker.internet.password({ length: 12 }),
      name: faker.person.fullName(),
    };
  }

  /**
   * Genera un token JWT mock
   */
  static generateToken(): string {
    return faker.string.alphanumeric(128);
  }

  /**
   * Genera una respuesta de login completa
   */
  static generateLoginResponse() {
    const user = UserGenerator.generate();
    return {
      token: this.generateToken(),
      user,
    };
  }
}

/**
 * Generator para IDs de MongoDB
 */
export class IdGenerator {
  /**
   * Genera un ObjectId de MongoDB válido
   */
  static generate(): string {
    return faker.database.mongodbObjectId();
  }

  /**
   * Genera múltiples ObjectIds
   */
  static generateMany(count: number): string[] {
    return Array.from({ length: count }, () => this.generate());
  }
}

/**
 * Generator para fechas
 */
export class DateGenerator {
  /**
   * Genera una fecha pasada
   */
  static past(years: number = 1): Date {
    return faker.date.past({ years });
  }

  /**
   * Genera una fecha reciente
   */
  static recent(days: number = 7): Date {
    const now = new Date();
    const past = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    return faker.date.between({ from: past, to: now });
  }

  /**
   * Genera una fecha futura
   */
  static future(years: number = 1): Date {
    return faker.date.future({ years });
  }

  /**
   * Genera un rango de fechas
   */
  static range(start: Date, end: Date): Date {
    return faker.date.between({ from: start, to: end });
  }
}

/**
 * Utilidad para resetear el seed de faker (útil para tests determinísticos)
 */
export function seedFaker(seed: number = 12345) {
  faker.seed(seed);
}

/**
 * Utilidad para generar datos de prueba completos
 */
export class TestDataGenerator {
  /**
   * Genera un conjunto completo de datos de prueba
   */
  static generateFullDataset() {
    const users = UserGenerator.generateMany(5);
    const sessions = users.flatMap((user) =>
      SessionGenerator.generateMany(3, { userId: user.id })
    );
    const messages = sessions.flatMap((session) =>
      MessageGenerator.generateConversation(5, session.id)
    );

    return {
      users,
      sessions,
      messages,
    };
  }

  /**
   * Genera datos para un usuario específico con sus sesiones y mensajes
   */
  static generateUserWithData(sessionCount: number = 3, messagesPerSession: number = 10) {
    const user = UserGenerator.generate();
    const sessions = SessionGenerator.generateMany(sessionCount, {
      userId: user.id,
    });
    const sessionsWithMessages = sessions.map((session) => ({
      ...session,
      messages: MessageGenerator.generateConversation(messagesPerSession / 2, session.id),
    }));

    return {
      user,
      sessions: sessionsWithMessages,
    };
  }
}

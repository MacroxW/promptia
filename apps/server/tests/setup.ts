import { vi } from 'vitest';

// Global test setup
beforeAll(() => {
  // Setup code that runs before all tests
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-secret-key-for-testing-only';
  process.env.JWT_EXPIRES_IN = '1h';
  process.env.BCRYPT_SALT_ROUNDS = '10';
  process.env.GEMINI_API_KEY = 'test-gemini-api-key';
});

afterAll(() => {
  // Cleanup code that runs after all tests
});

// Global test utilities
global.console = {
  ...console,
  error: vi.fn(), // Mock console.error to avoid noise in tests
  warn: vi.fn(),
};

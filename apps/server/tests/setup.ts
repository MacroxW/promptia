import { vi } from 'vitest';
import { config } from 'dotenv';
import path from 'path';

// Load test environment variables from .env.test
config({ path: path.resolve(__dirname, '../.env.test') });

// Global test setup
beforeAll(() => {
  // Verify test environment is loaded
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('Tests must run with NODE_ENV=test');
  }
  
  if (process.env.MONGODB_DB !== 'promptia_test_db') {
    throw new Error('Tests must use promptia_test_db database');
  }
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

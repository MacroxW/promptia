import { Express } from 'express';
import { app } from '@/index';
import { getDatabase, disconnectMongo } from '@promptia/database';

/**
 * Get the existing Express app instance
 * Reuses the same app configuration from src/index.ts
 */
export function getTestApp(): Express {
  return app;
}

/**
 * Clean up test database
 * Removes all data from collections for clean test state
 */
export async function cleanupTestDatabase(): Promise<void> {
  const db = await getDatabase();
  const collections = await db.listCollections().toArray();
  
  for (const collection of collections) {
    await db.collection(collection.name).deleteMany({});
  }
}

/**
 * Close database connection
 * Should be called after all tests complete
 */
export async function closeTestConnections(): Promise<void> {
  await disconnectMongo();
}

import { ObjectId, type WithId } from 'mongodb'
import { getCollection } from '@repo/database'
import type { Session } from '@repo/types'

import { AppError } from '@/middleware/error-handler'

type SessionDocument = {
  _id?: ObjectId
  title: string
  userId: ObjectId
  createdAt: Date
  updatedAt: Date
}

export class SessionRepository {
  private mapSession(doc: WithId<SessionDocument>): Session {
    return {
      id: doc._id.toHexString(),
      title: doc.title,
      userId: doc.userId.toHexString(),
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      messages: []
    }
  }

  private toObjectId(id: string, label: string): ObjectId {
    try {
      return new ObjectId(id)
    } catch {
      throw new AppError(`${label} inválido`, 400)
    }
  }

  async create(data: {
    title: string
    userId: string
  }): Promise<Session> {
    const collection = await getCollection<SessionDocument>('sessions')
    const now = new Date()
    const doc: SessionDocument = {
      title: data.title,
      userId: this.toObjectId(data.userId, 'Usuario'),
      createdAt: now,
      updatedAt: now
    }

    const result = await collection.insertOne(doc)
    const insertedDoc = await collection.findOne({ _id: result.insertedId })
    
    if (!insertedDoc) {
      throw new AppError('Error al crear sesión', 500)
    }

    return this.mapSession(insertedDoc)
  }

  async listByUser(userId: string): Promise<Session[]> {
    const collection = await getCollection<SessionDocument>('sessions')
    const cursor = collection
      .find({ userId: this.toObjectId(userId, 'Usuario') })
      .sort({ updatedAt: -1 })
    const docs = await cursor.toArray()
    return docs.map(doc => this.mapSession(doc))
  }

  async findById(id: string): Promise<Session | null> {
    const collection = await getCollection<SessionDocument>('sessions')
    const doc = await collection.findOne({ _id: this.toObjectId(id, 'Sesión') })
    return doc ? this.mapSession(doc) : null
  }

  async updateTimestamp(id: string, date = new Date()): Promise<void> {
    const collection = await getCollection<SessionDocument>('sessions')
    await collection.updateOne(
      { _id: this.toObjectId(id, 'Sesión') },
      { $set: { updatedAt: date } }
    )
  }

  async updateTitle(id: string, title: string): Promise<Session | null> {
    const collection = await getCollection<SessionDocument>('sessions')
    const result = await collection.findOneAndUpdate(
      { _id: this.toObjectId(id, 'Sesión') },
      { $set: { title, updatedAt: new Date() } },
      { returnDocument: 'after' }
    )
    return result ? this.mapSession(result) : null
  }
}

export const sessionRepository = new SessionRepository()

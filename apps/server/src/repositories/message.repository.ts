import { ObjectId, type WithId } from 'mongodb'
import { getCollection } from '@repo/database'
import type { Message, MessageRole } from '@repo/types'

import { AppError } from '@/middleware/error-handler'

type MessageDocument = {
  _id?: ObjectId
  sessionId: ObjectId
  role: MessageRole
  content: string
  createdAt: Date
}

export class MessageRepository {
  private mapMessage(doc: WithId<MessageDocument>): Message {
    return {
      id: doc._id.toHexString(),
      role: doc.role,
      content: doc.content,
      sessionId: doc.sessionId.toHexString(),
      createdAt: doc.createdAt
    }
  }

  private toObjectId(id: string): ObjectId {
    try {
      return new ObjectId(id)
    } catch {
      throw new AppError('Identificador inválido', 400)
    }
  }

  async create(data: {
    sessionId: string
    role: MessageRole
    content: string
  }): Promise<Message> {
    const collection = await getCollection<MessageDocument>('messages')
    const now = new Date()
    const doc: MessageDocument = {
      sessionId: this.toObjectId(data.sessionId),
      role: data.role,
      content: data.content,
      createdAt: now
    }

    const result = await collection.insertOne(doc)
    const insertedDoc = await collection.findOne({ _id: result.insertedId })
    
    if (!insertedDoc) {
      throw new AppError('Error al crear mensaje', 500)
    }

    return this.mapMessage(insertedDoc)
  }

  async listBySession(
    sessionId: string,
    options?: { limit?: number }
  ): Promise<Message[]> {
    const collection = await getCollection<MessageDocument>('messages')
    const query = { sessionId: this.toObjectId(sessionId) }

    if (options?.limit) {
      const docs = await collection
        .find(query)
        .sort({ createdAt: -1 })
        .limit(options.limit)
        .toArray()

      return docs.reverse().map(doc => this.mapMessage(doc))
    }

    const docs = await collection.find(query).sort({ createdAt: 1 }).toArray()
    return docs.map(doc => this.mapMessage(doc))
  }
}

export const messageRepository = new MessageRepository()

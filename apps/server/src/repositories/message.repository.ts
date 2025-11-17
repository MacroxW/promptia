import { ObjectId, type WithId } from 'mongodb'
import { getCollection } from '@repo/database'
import type { Message, MessageRole } from '@repo/types'

import { AppError } from '@/middleware/error-handler'

type MessageDocument = {
  _id: ObjectId
  sessionId: ObjectId
  role: MessageRole
  content: string
  createdAt: Date
}

const mapMessage = (doc: WithId<MessageDocument>): Message => ({
  id: doc._id.toHexString(),
  role: doc.role,
  content: doc.content,
  sessionId: doc.sessionId.toHexString(),
  createdAt: doc.createdAt
})

const toObjectId = (id: string): ObjectId => {
  try {
    return new ObjectId(id)
  } catch {
    throw new AppError('Identificador inválido', 400)
  }
}

export async function createMessage(data: {
  sessionId: string
  role: MessageRole
  content: string
}): Promise<Message> {
  const collection = await getCollection<MessageDocument>('messages')
  const now = new Date()
  const doc = {
    sessionId: toObjectId(data.sessionId),
    role: data.role,
    content: data.content,
    createdAt: now
  }

  const result = await collection.insertOne(doc)

  return mapMessage({
    ...doc,
    _id: result.insertedId
  } as WithId<MessageDocument>)
}

export async function listMessagesBySession(
  sessionId: string,
  options?: { limit?: number }
) {
  const collection = await getCollection<MessageDocument>('messages')
  const query = { sessionId: toObjectId(sessionId) }

  if (options?.limit) {
    const docs = await collection
      .find(query)
      .sort({ createdAt: -1 })
      .limit(options.limit)
      .toArray()

    return docs.reverse().map(mapMessage)
  }

  const docs = await collection.find(query).sort({ createdAt: 1 }).toArray()
  return docs.map(mapMessage)
}

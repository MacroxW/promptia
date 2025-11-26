import { ObjectId, type WithId } from 'mongodb'
import { getCollection } from '@repo/database'
import type { Session } from '@repo/types'

import { AppError } from '@/middleware/error-handler'

type SessionDocument = {
  _id: ObjectId
  title: string
  userId: ObjectId
  createdAt: Date
  updatedAt: Date
}

const mapSession = (doc: WithId<SessionDocument>): Session => ({
  id: doc._id.toHexString(),
  title: doc.title,
  userId: doc.userId.toHexString(),
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
  messages: []
})

const toObjectId = (id: string, label: string): ObjectId => {
  try {
    return new ObjectId(id)
  } catch {
    throw new AppError(`${label} inválido`, 400)
  }
}

export async function createSession(data: {
  title: string
  userId: string
}): Promise<Session> {
  const collection = await getCollection<SessionDocument>('sessions')
  const now = new Date()
  const doc = {
    title: data.title,
    userId: toObjectId(data.userId, 'Usuario'),
    createdAt: now,
    updatedAt: now
  }

  const result = await collection.insertOne(doc)
  const insertedDoc = await collection.findOne({ _id: result.insertedId })
  
  if (!insertedDoc) {
    throw new AppError('Error al crear sesión', 500)
  }

  return mapSession(insertedDoc)
}

export async function listSessionsByUser(userId: string): Promise<Session[]> {
  const collection = await getCollection<SessionDocument>('sessions')
  const cursor = collection
    .find({ userId: toObjectId(userId, 'Usuario') })
    .sort({ updatedAt: -1 })
  const docs = await cursor.toArray()
  return docs.map(mapSession)
}

export async function findSessionById(id: string): Promise<Session | null> {
  const collection = await getCollection<SessionDocument>('sessions')
  const doc = await collection.findOne({ _id: toObjectId(id, 'Sesión') })
  return doc ? mapSession(doc) : null
}

export async function updateSessionTimestamp(id: string, date = new Date()): Promise<void> {
  const collection = await getCollection<SessionDocument>('sessions')
  await collection.updateOne(
    { _id: toObjectId(id, 'Sesión') },
    { $set: { updatedAt: date } }
  )
}

export async function updateSessionTitle(id: string, title: string): Promise<Session | null> {
  const collection = await getCollection<SessionDocument>('sessions')
  const result = await collection.findOneAndUpdate(
    { _id: toObjectId(id, 'Sesión') },
    { $set: { title, updatedAt: new Date() } },
    { returnDocument: 'after' }
  )
  return result ? mapSession(result) : null
}

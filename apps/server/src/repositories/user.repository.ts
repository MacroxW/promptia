import { ObjectId, WithId } from 'mongodb'
import { getCollection } from '@repo/database'
import type { User } from '@repo/types'

export type UserDocument = {
  _id: ObjectId
  email: string
  password: string
  name: string | null
  createdAt: Date
  updatedAt: Date
}

export type UserRecord = User & { password: string }

type UserInsert = Omit<UserDocument, '_id'>

let indexesEnsured = false

async function usersCollection() {
  const collection = await getCollection<UserDocument>('users')
  if (!indexesEnsured) {
    await collection.createIndex({ email: 1 }, { unique: true, name: 'users_email_unique' })
    indexesEnsured = true
  }
  return collection
}

const mapUser = (doc: WithId<UserDocument>): UserRecord => ({
  id: doc._id.toHexString(),
  email: doc.email,
  name: doc.name,
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
  password: doc.password
})

export async function findUserByEmail(email: string): Promise<UserRecord | null> {
  const collection = await usersCollection()
  const user = await collection.findOne({ email })
  return user ? mapUser(user) : null
}

export async function createUser(data: {
  email: string
  password: string
  name?: string | null
}): Promise<UserRecord> {
  const collection = await usersCollection()
  const now = new Date()
  const doc: UserInsert = {
    email: data.email,
    password: data.password,
    name: data.name ?? null,
    createdAt: now,
    updatedAt: now
  }

  const result = await collection.insertOne(doc)

  return mapUser({
    ...doc,
    _id: result.insertedId
  } as WithId<UserDocument>)
}

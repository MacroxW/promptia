import { ObjectId, WithId } from 'mongodb'
import { getCollection } from '@repo/database'
import type { User } from '@repo/types'

export type UserDocument = {
  _id?: ObjectId
  email: string
  password: string
  name: string | null
  createdAt: Date
  updatedAt: Date
}

export type UserRecord = User & { password: string }

export class UserRepository {
  private indexesEnsured = false

  private async getCollection() {
    const collection = await getCollection<UserDocument>('users')
    if (!this.indexesEnsured) {
      await collection.createIndex({ email: 1 }, { unique: true, name: 'users_email_unique' })
      this.indexesEnsured = true
    }
    return collection
  }

  private mapUser(doc: WithId<UserDocument>): UserRecord {
    return {
      id: doc._id.toHexString(),
      email: doc.email,
      name: doc.name,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      password: doc.password
    }
  }

  async findByEmail(email: string): Promise<UserRecord | null> {
    const collection = await this.getCollection()
    const user = await collection.findOne({ email })
    return user ? this.mapUser(user) : null
  }

  async create(data: {
    email: string
    password: string
    name?: string | null
  }): Promise<UserRecord> {
    const collection = await this.getCollection()
    const now = new Date()
    const doc: UserDocument = {
      email: data.email,
      password: data.password,
      name: data.name ?? null,
      createdAt: now,
      updatedAt: now
    }

    const result = await collection.insertOne(doc)
    const insertedDoc = await collection.findOne({ _id: result.insertedId })

    if (!insertedDoc) {
      throw new Error('Error al crear usuario')
    }

    return this.mapUser(insertedDoc)
  }

  async delete(email: string): Promise<void> {
    const collection = await this.getCollection()
    await collection.deleteOne({ email })
  }
}

export const userRepository = new UserRepository()

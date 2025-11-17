import { Message } from './message'

export interface Session {
  id: string
  title: string
  userId: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}

export interface SessionCreateInput {
  title: string
  userId: string
}

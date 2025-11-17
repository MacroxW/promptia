export type MessageRole = 'user' | 'agent' | 'system'

export interface Message {
  id: string
  role: MessageRole
  content: string
  sessionId: string
  createdAt: Date
}

export interface MessageCreateInput {
  role: MessageRole
  content: string
  sessionId: string
}

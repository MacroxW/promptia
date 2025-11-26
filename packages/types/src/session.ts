export interface Session {
  id: string
  title: string
  userId: string
  createdAt: Date
  updatedAt: Date
}

export interface SessionCreateInput {
  title: string
  userId: string
}

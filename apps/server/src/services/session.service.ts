import type { CreateSessionInput } from '@repo/schemas'
import type { Message, Session } from '@repo/types'
import { sanitizeString } from '@repo/utils'

import { AppError } from '@/middleware/error-handler'
import {
  createSession as createSessionRepo,
  findSessionById,
  listSessionsByUser
} from '@/repositories/session.repository'
import { listMessagesBySession } from '@/repositories/message.repository'

export type SessionDetail = Session & {
  messages: Message[]
}

export async function createSession(userId: string, input: CreateSessionInput): Promise<Session> {
  return createSessionRepo({
    userId,
    title: sanitizeString(input.title)
  })
}

export async function listUserSessions(userId: string): Promise<Session[]> {
  return listSessionsByUser(userId)
}

export async function getSessionDetail(
  userId: string,
  sessionId: string
): Promise<SessionDetail> {
  const session = await findSessionById(sessionId)
  if (!session) {
    throw new AppError('Sesión no encontrada', 404)
  }

  if (session.userId !== userId) {
    throw new AppError('No autorizado', 403)
  }

  const messages = await listMessagesBySession(sessionId)
  return { ...session, messages }
}

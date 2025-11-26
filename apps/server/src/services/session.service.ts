import type { CreateSessionInput, UpdateSessionInput } from '@promptia/schemas'
import type { Message, Session } from '@promptia/types'
import { sanitizeString } from '@promptia/utils'
import { GoogleGenerativeAI } from "@google/generative-ai"

import { AppError } from '@/middleware/error-handler'
import { sessionRepository } from '@/repositories/session.repository'
import { messageRepository } from '@/repositories/message.repository'

export type SessionDetail = Session & {
  messages: Message[]
}

export class SessionService {
  async create(userId: string, input: CreateSessionInput): Promise<Session> {
    return sessionRepository.create({
      userId,
      title: sanitizeString(input.title)
    })
  }

  async listByUser(userId: string): Promise<Session[]> {
    return sessionRepository.listByUser(userId)
  }

  async getDetail(userId: string, sessionId: string): Promise<SessionDetail> {
    const session = await sessionRepository.findById(sessionId)
    if (!session) {
      throw new AppError('Sesión no encontrada', 404)
    }

    if (session.userId !== userId) {
      throw new AppError('No autorizado', 403)
    }

    const messages = await messageRepository.listBySession(sessionId)
    return { ...session, messages }
  }

  async update(
    userId: string,
    sessionId: string,
    input: UpdateSessionInput
  ): Promise<Session> {
    const session = await sessionRepository.findById(sessionId)
    if (!session) {
      throw new AppError('Sesión no encontrada', 404)
    }

    if (session.userId !== userId) {
      throw new AppError('No autorizado', 403)
    }

    if (input.title) {
      const updatedSession = await sessionRepository.updateTitle(sessionId, sanitizeString(input.title))
      if (!updatedSession) {
        throw new AppError('Error al actualizar sesión', 500)
      }
      return updatedSession
    }

    return session
  }

  async generateTitle(sessionId: string, messages: Message[]): Promise<string> {
    try {
      const apiKey = process.env.GEMINI_API_KEY_2
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not defined")
      }

      const genAI = new GoogleGenerativeAI(apiKey)
      // Use gemini-1.5-flash instead of 2.0-flash-exp for better rate limits
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash-lite",
        generationConfig: {
          temperature: 0.3, // Lower temperature for more consistent titles
          maxOutputTokens: 20, // Short titles only
        }
      })

      const conversationContext = messages
        .slice(0, 4)
        .map(m => `${m.role === 'user' ? 'Usuario' : 'Asistente'}: ${m.content}`)
        .join('\n')

      const prompt = `Basándote en la siguiente conversación, genera un título corto y descriptivo (máximo 5 palabras) que resuma el tema principal. Solo responde con el título, sin comillas ni explicaciones adicionales.

Conversación:
${conversationContext}

Título:`

      const result = await model.generateContent(prompt)
      const response = await result.response
      let title = response.text().trim()

      title = title.replace(/^["']|["']$/g, '')

      if (title.length > 50) {
        title = title.substring(0, 47) + '...'
      }

      return title || 'Nueva conversación'
    } catch (error) {
      console.error('Error generating session title:', error)

      // If it's a rate limit error, return a default title
      if (error && typeof error === 'object' && 'status' in error && error.status === 429) {
        console.warn('Rate limit exceeded for title generation, using default title')
      }

      return 'Nueva conversación'
    }
  }
}

export const sessionService = new SessionService()

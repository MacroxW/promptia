import { GoogleGenerativeAI } from '@google/generative-ai'
import type { CreateMessageInput } from '@promptia/schemas'
import type { Message } from '@repo/types'
import { sanitizeString } from '@repo/utils'

import { LLM_SETTINGS } from '@/config/llm-settings'
import { env } from '@/config/env'
import { AppError } from '@/middleware/error-handler'
import { createMessage, listMessagesBySession } from '@/repositories/message.repository'
import { findSessionById, updateSessionTimestamp } from '@/repositories/session.repository'

type ChatResponse = {
  userMessage: Message
  agentMessage: Message
}

const genAI = new GoogleGenerativeAI(env.geminiApiKey)
const model = genAI.getGenerativeModel({
  model: LLM_SETTINGS.MODEL
})

const MAX_HISTORY_MESSAGES = 20

const toGenAiRole = (role: Message['role']): 'user' | 'model' => {
  if (role === 'agent') return 'model'
  return 'user'
}

export async function sendChatMessage(params: {
  sessionId: string
  userId: string
  payload: CreateMessageInput
}): Promise<ChatResponse> {
  const session = await findSessionById(params.sessionId)

  if (!session) {
    throw new AppError('Sesión no encontrada', 404)
  }

  if (session.userId !== params.userId) {
    throw new AppError('No autorizado', 403)
  }

  const userMessage = await createMessage({
    sessionId: params.sessionId,
    role: 'user',
    content: sanitizeString(params.payload.content)
  })

  await updateSessionTimestamp(params.sessionId, userMessage.createdAt)

  const history = await listMessagesBySession(params.sessionId, {
    limit: MAX_HISTORY_MESSAGES
  })

  const genAiContents = history.map((message) => ({
    role: toGenAiRole(message.role),
    parts: [{ text: message.content }]
  }))

  const result = await model.generateContent({
    contents: genAiContents,
    generationConfig: {
      maxOutputTokens: LLM_SETTINGS.MAX_TOKENS,
      temperature: LLM_SETTINGS.DEFAULT_TEMPERATURE
    }
  })

  const responseText = result.response.text()

  if (!responseText) {
    throw new AppError('El modelo no pudo generar una respuesta', 502)
  }

  const agentMessage = await createMessage({
    sessionId: params.sessionId,
    role: 'agent',
    content: responseText.trim()
  })

  await updateSessionTimestamp(params.sessionId, agentMessage.createdAt)

  return { userMessage, agentMessage }
}

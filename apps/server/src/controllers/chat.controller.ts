import type { NextFunction, Request, Response } from 'express'
import { createMessageSchema, type CreateMessageInput } from '@repo/schemas'

import { AppError } from '@/middleware/error-handler'
import { sendChatMessage } from '@/services/chat.service'

type ChatRequest = Request<{ sessionId: string }, unknown, CreateMessageInput>

export async function chatController(req: ChatRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      throw new AppError('No autorizado', 401)
    }
    const payload = createMessageSchema.parse(req.body)
    const result = await sendChatMessage({
      sessionId: req.params.sessionId,
      userId: req.user.id,
      payload
    })
    return res.status(200).json(result)
  } catch (error) {
    return next(error)
  }
}

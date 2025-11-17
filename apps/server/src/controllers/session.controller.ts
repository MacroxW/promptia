import type { NextFunction, Request, Response } from 'express'
import { createSessionSchema } from '@repo/schemas'
import type { Session } from '@repo/types'

import {
  createSession,
  getSessionDetail,
  listUserSessions,
  type SessionDetail
} from '@/services/session.service'
import { AppError } from '@/middleware/error-handler'

type SessionListResponse = {
  sessions: Session[]
}

export async function listSessionsController(
  req: Request,
  res: Response<SessionListResponse>,
  next: NextFunction
) {
  try {
    if (!req.user) {
      return next(new AppError('No autorizado', 401))
    }
    const sessions = await listUserSessions(req.user.id)
    return res.json({ sessions })
  } catch (error) {
    return next(error)
  }
}

export async function createSessionController(
  req: Request,
  res: Response<Session>,
  next: NextFunction
) {
  try {
    if (!req.user) {
      return next(new AppError('No autorizado', 401))
    }
    const payload = createSessionSchema.parse(req.body)
    const session = await createSession(req.user.id, payload)
    return res.status(201).json(session)
  } catch (error) {
    return next(error)
  }
}

export async function getSessionController(
  req: Request<{ id: string }>,
  res: Response<SessionDetail>,
  next: NextFunction
) {
  try {
    if (!req.user) {
      return next(new AppError('No autorizado', 401))
    }
    const session = await getSessionDetail(req.user.id, req.params.id)
    return res.json(session)
  } catch (error) {
    return next(error)
  }
}

import type { NextFunction, Request, Response } from 'express'
import { createSessionSchema, updateSessionSchema } from '@promptia/schemas'
import type { Session } from '@promptia/types'

import {
  sessionService,
  type SessionDetail
} from '@/services/session.service'
import { AppError } from '@/middleware/error-handler'

type SessionListResponse = {
  sessions: Session[]
}

export class SessionController {
  async listSessions(
    req: Request,
    res: Response<SessionListResponse>,
    next: NextFunction
  ) {
    try {
      if (!req.user) {
        return next(new AppError('No autorizado', 401))
      }
      const sessions = await sessionService.listByUser(req.user.id)
      return res.json({ sessions })
    } catch (error) {
      return next(error)
    }
  }

  async createSession(
    req: Request,
    res: Response<Session>,
    next: NextFunction
  ) {
    try {
      if (!req.user) {
        return next(new AppError('No autorizado', 401))
      }
      const payload = createSessionSchema.parse(req.body)
      const session = await sessionService.create(req.user.id, payload)
      return res.status(201).json(session)
    } catch (error) {
      return next(error)
    }
  }

  async getSession(
    req: Request<{ id: string }>,
    res: Response<SessionDetail>,
    next: NextFunction
  ) {
    try {
      if (!req.user) {
        return next(new AppError('No autorizado', 401))
      }
      const session = await sessionService.getDetail(req.user.id, req.params.id)
      return res.json(session)
    } catch (error) {
      return next(error)
    }
  }

  async updateSession(
    req: Request<{ id: string }>,
    res: Response<Session>,
    next: NextFunction
  ) {
    try {
      if (!req.user) {
        return next(new AppError('No autorizado', 401))
      }
      const payload = updateSessionSchema.parse(req.body)
      const session = await sessionService.update(req.user.id, req.params.id, payload)
      return res.json(session)
    } catch (error) {
      return next(error)
    }
  }
}

export const sessionController = new SessionController()

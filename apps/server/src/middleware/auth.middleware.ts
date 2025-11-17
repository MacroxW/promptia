import type { NextFunction, Request, Response } from 'express'
import jwt, { type JwtPayload } from 'jsonwebtoken'

import { env } from '@/config/env'
import { AppError } from '@/middleware/error-handler'

type TokenPayload = JwtPayload & {
  sub: string
  email?: string
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('No autorizado', 401))
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, env.jwtSecret) as TokenPayload
    if (!decoded.sub) {
      throw new AppError('Token inválido', 401)
    }

    req.user = {
      id: decoded.sub,
      email: decoded.email ?? 'unknown'
    }

    return next()
  } catch (error) {
    return next(new AppError('Token inválido', 401))
  }
}

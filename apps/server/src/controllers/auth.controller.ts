import type { Request, Response, NextFunction } from 'express'
import { loginSchema, registerSchema, type LoginInput, type RegisterInput } from '@promptia/schemas'
import type { LoginResponse } from '@repo/types'

import { loginUser, registerUser } from '@/services/auth.service'

type AuthRequest<TBody> = Request<Record<string, never>, LoginResponse, TBody>

export async function registerController(
  req: AuthRequest<RegisterInput>,
  res: Response<LoginResponse>,
  next: NextFunction
) {
  try {
    const payload = registerSchema.parse(req.body)
    const result = await registerUser(payload)
    return res.status(201).json(result)
  } catch (error) {
    return next(error)
  }
}

export async function loginController(
  req: AuthRequest<LoginInput>,
  res: Response<LoginResponse>,
  next: NextFunction
) {
  try {
    const payload = loginSchema.parse(req.body)
    const result = await loginUser(payload)
    return res.status(200).json(result)
  } catch (error) {
    return next(error)
  }
}

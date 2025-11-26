import type { Request, Response, NextFunction } from 'express'
import { loginSchema, registerSchema } from '@promptia/schemas'
import type { LoginResponse } from '@repo/types'

import { authService } from '@/services/auth.service'

export class AuthController {
  async register(
    req: Request,
    res: Response<LoginResponse>,
    next: NextFunction
  ) {
    try {
      const payload = registerSchema.parse(req.body)
      const result = await authService.register(payload)
      return res.status(201).json(result)
    } catch (error) {
      return next(error)
    }
  }

  async login(
    req: Request,
    res: Response<LoginResponse>,
    next: NextFunction
  ) {
    try {
      const payload = loginSchema.parse(req.body)
      const result = await authService.login(payload)
      return res.status(200).json(result)
    } catch (error) {
      return next(error)
    }
  }
}

export const authController = new AuthController()

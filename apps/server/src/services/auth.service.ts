import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import type { LoginInput, RegisterInput } from '@promptia/schemas'
import type { LoginResponse } from '@promptia/types'
import { sanitizeEmail } from '@promptia/utils'

import { env } from '@/config/env'
import { AppError } from '@/middleware/error-handler'
import { userRepository, type UserRecord } from '@/repositories/user.repository'

export class AuthService {
  private buildAuthResponse(user: UserRecord): LoginResponse {
    return {
      token: jwt.sign(
        { sub: user.id, email: user.email },
        env.jwtSecret,
        { expiresIn: env.jwtExpiresIn }
      ),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    }
  }

  async register(input: RegisterInput): Promise<LoginResponse> {
    const email = sanitizeEmail(input.email)
    const existingUser = await userRepository.findByEmail(email)

    if (existingUser) {
      throw new AppError('El email ya está registrado', 409)
    }

    const hashedPassword = await bcrypt.hash(input.password, env.bcryptSaltRounds)
    const user = await userRepository.create({
      email,
      password: hashedPassword,
      name: input.name ?? null
    })

    return this.buildAuthResponse(user)
  }

  async login(input: LoginInput): Promise<LoginResponse> {
    const email = sanitizeEmail(input.email)
    const user = await userRepository.findByEmail(email)

    if (!user) {
      throw new AppError('Credenciales inválidas', 401)
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.password)

    if (!isPasswordValid) {
      throw new AppError('Credenciales inválidas', 401)
    }

    return this.buildAuthResponse(user)
  }
}

export const authService = new AuthService()

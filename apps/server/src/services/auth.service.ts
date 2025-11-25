import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import type { LoginInput, RegisterInput } from '@promptia/schemas'
import type { LoginResponse } from '@repo/types'
import { sanitizeEmail } from '@repo/utils'

import { env } from '@/config/env'
import { AppError } from '@/middleware/error-handler'
import { createUser, findUserByEmail, type UserRecord } from '@/repositories/user.repository'

const buildAuthResponse = (user: UserRecord): LoginResponse => ({
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
})

export async function registerUser(input: RegisterInput): Promise<LoginResponse> {
  const email = sanitizeEmail(input.email)
  const existingUser = await findUserByEmail(email)

  if (existingUser) {
    throw new AppError('El email ya está registrado', 409)
  }

  const hashedPassword = await bcrypt.hash(input.password, env.bcryptSaltRounds)
  const user = await createUser({
    email,
    password: hashedPassword,
    name: input.name ?? null
  })

  return buildAuthResponse(user)
}

export async function loginUser(input: LoginInput): Promise<LoginResponse> {
  const email = sanitizeEmail(input.email)
  const user = await findUserByEmail(email)

  if (!user) {
    throw new AppError('Credenciales inválidas', 401)
  }

  const isPasswordValid = await bcrypt.compare(input.password, user.password)

  if (!isPasswordValid) {
    throw new AppError('Credenciales inválidas', 401)
  }

  return buildAuthResponse(user)
}

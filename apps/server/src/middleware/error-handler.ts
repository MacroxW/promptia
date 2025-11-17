import type { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'

type ErrorResponse = {
  message: string
  errors?: unknown
}

export class AppError extends Error {
  public statusCode: number
  public details?: Record<string, unknown>

  constructor(message: string, statusCode = 500, details?: Record<string, unknown>) {
    super(message)
    this.statusCode = statusCode
    this.details = details
    Error.captureStackTrace?.(this, this.constructor)
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response<ErrorResponse>,
  _next: NextFunction
) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: 'Datos inválidos',
      errors: err.flatten()
    })
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message,
      ...(err.details ? { errors: err.details } : {})
    })
  }

  console.error('[server] Unexpected error', err)
  return res.status(500).json({
    message: 'Error interno del servidor'
  })
}

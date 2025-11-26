import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string()
    .email('Email inválido')
    .max(255, 'El email es demasiado largo'),
  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(100, 'La contraseña es demasiado larga')
})

export const registerSchema = z.object({
  email: z
    .string()
    .email('Email inválido')
    .max(255, 'El email es demasiado largo'),
  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(100, 'La contraseña es demasiado larga'),
  name: z
    .string()
    .min(1, 'El nombre no puede estar vacío')
    .max(100, 'El nombre es demasiado largo')
    .optional()
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>

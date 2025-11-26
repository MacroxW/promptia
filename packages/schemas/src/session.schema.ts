import { z } from 'zod'

export const createSessionSchema = z.object({
  title: z
    .string()
    .min(1, 'El título es requerido')
    .max(100, 'El título es demasiado largo (máximo 100 caracteres)')
})

export const updateSessionSchema = z.object({
  title: z
    .string()
    .min(1, 'El título es requerido')
    .max(100, 'El título es demasiado largo (máximo 100 caracteres)')
    .optional()
})

export type CreateSessionInput = z.infer<typeof createSessionSchema>
export type UpdateSessionInput = z.infer<typeof updateSessionSchema>

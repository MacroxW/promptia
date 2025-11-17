import { z } from 'zod'

export const createSessionSchema = z.object({
  title: z.string().min(1, 'El título es requerido')
})

export const updateSessionSchema = z.object({
  title: z.string().min(1, 'El título es requerido').optional()
})

export type CreateSessionInput = z.infer<typeof createSessionSchema>
export type UpdateSessionInput = z.infer<typeof updateSessionSchema>

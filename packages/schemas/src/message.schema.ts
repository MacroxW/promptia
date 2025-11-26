import { z } from 'zod'

export const messageRoleSchema = z.enum(['user', 'agent', 'system'])

export const createMessageSchema = z.object({
  content: z
    .string()
    .min(1, 'El mensaje no puede estar vacío')
    .max(10000, 'El mensaje es demasiado largo (máximo 10000 caracteres)'),
  role: messageRoleSchema.optional().default('user'),
  sessionId: z.string().min(1, 'El sessionId es requerido')
})

export type CreateMessageInput = z.infer<typeof createMessageSchema>

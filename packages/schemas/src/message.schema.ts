import { z } from 'zod'

export const messageRoleSchema = z.enum(['user', 'agent', 'system'])

export const createMessageSchema = z.object({
  content: z.string().min(1, 'El mensaje no puede estar vacío'),
  role: messageRoleSchema.optional().default('user')
})

export type CreateMessageInput = z.infer<typeof createMessageSchema>

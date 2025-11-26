import { z } from 'zod'

export const sendMessageSchema = z.object({
  message: z
    .string()
    .min(1, 'El mensaje no puede estar vacío')
    .max(10000, 'El mensaje es demasiado largo (máximo 10000 caracteres)'),
  sessionId: z.string().min(1, 'El sessionId es requerido')
})

export const streamMessageSchema = z.object({
  message: z
    .string()
    .min(1, 'El mensaje no puede estar vacío')
    .max(10000, 'El mensaje es demasiado largo (máximo 10000 caracteres)'),
  sessionId: z.string().min(1, 'El sessionId es requerido'),
  systemPrompt: z
    .string()
    .max(2000, 'El system prompt es demasiado largo (máximo 2000 caracteres)')
    .optional(),
  temperature: z
    .number()
    .min(0, 'La temperatura debe ser al menos 0')
    .max(2, 'La temperatura debe ser como máximo 2')
    .optional()
})

export type SendMessageInput = z.infer<typeof sendMessageSchema>
export type StreamMessageInput = z.infer<typeof streamMessageSchema>

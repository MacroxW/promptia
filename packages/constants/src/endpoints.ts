export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000'

export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout'
  },
  SESSIONS: {
    LIST: '/sessions',
    GET: (id: string) => `/sessions/${id}`,
    CREATE: '/sessions',
    UPDATE: (id: string) => `/sessions/${id}`,
    DELETE: (id: string) => `/sessions/${id}`
  },
  CHAT: {
    STREAM: (sessionId: string) => `/chat/${sessionId}`
  }
} as const

export type RequestUser = {
  id: string
  email: string
}

declare global {
  namespace Express {
    interface Request {
      user?: RequestUser
    }
  }
}

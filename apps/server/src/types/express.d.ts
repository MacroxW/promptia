export type RequestUser = {
  id: string
  email: string
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: RequestUser
  }
}

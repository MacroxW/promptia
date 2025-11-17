export interface User {
  id: string
  email: string
  name: string | null
  createdAt: Date
  updatedAt: Date
}

export interface UserCreateInput {
  email: string
  password: string
  name?: string
}

export interface LoginResponse {
  token: string
  user: Omit<User, 'password'>
}

export type User = {
  userId: string
  name: string
  role: 'admin' | 'user'
  avatar?: string
  password?: string // MD5 加密后的
}

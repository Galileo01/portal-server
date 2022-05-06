export type User = {
  userId: string
  name: string
  avatar?: string
  password?: string // MD5 加密后的
}

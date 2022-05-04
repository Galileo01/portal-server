import jwt from 'jsonwebtoken'

import { TOKEN_SECRET } from '@/config'

export const signTokenByUserId = (userId: string) =>
  jwt.sign(
    {
      userId,
    },
    TOKEN_SECRET,
    { expiresIn: '7d' }
  )

export const verifyToken = (token: string) => jwt.verify(token, TOKEN_SECRET)

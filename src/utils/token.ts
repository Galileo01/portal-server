import jwt from 'jsonwebtoken'

import { TOKEN_SECRET } from '@/config'
import { UserInCtxState } from '@/typings/koa/context'
import logger from './logger'

export const signTokenByUserId = (userId: string) =>
  jwt.sign(
    {
      userId,
    },
    TOKEN_SECRET,
    { expiresIn: '7 days' }
  )

export const verifyToken = (token: string) => jwt.verify(token, TOKEN_SECRET)

export const verifyTokenFromAuthorization = (authorization: string) => {
  try {
    const { userId } = verifyToken(authorization.slice(7)) as UserInCtxState
    return userId
  } catch (err) {
    logger.error('verifyTokenFromAuthorization', err)
    return undefined
  }
}

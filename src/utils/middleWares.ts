import Koa from 'koa'

import logger from './logger'

// 请求日志 中间件
export const requestLoggerMid = async (ctx: Koa.Context, next: Koa.Next) => {
  const { url, header, method, state } = ctx
  const { origin } = header
  const before = new Date().getTime()
  logger.info(
    'start handle request',
    `USER_ID: ${state.user?.userId} METHOD:${method} URL:${url} STATUS:${ctx.response.status} ORIGIN:${origin}`
  )
  await next()
  const after = new Date().getTime()
  logger.info('end handle request', `COST_TIME:${after - before}ms`)
}

// 错误处理  中间件
export const errMid = async (ctx: Koa.Context, next: Koa.Next) => {
  try {
    await next() // 等待 业务路由处理  若抛出错误
  } catch (err) {
    const { status } = err as { status?: number } // koa-jwt token 验证错误 对象存在status=401
    logger.error(
      `ERROR : ${JSON.stringify(err, Object.getOwnPropertyNames(err))}`
    )
    ctx.response.status = status || 500 // 状态码强制设置为 500
    ctx.body = {
      success: 0,
      data: `${err}`,
    }
  }
}

import Koa from 'koa'
import logger from './logger'

// 请求日志 中间件
export const requestLoggerMid = async (ctx: Koa.Context, next: Koa.Next) => {
  const { url, header, method } = ctx
  const { origin } = header
  const before = new Date().getTime()
  await next()
  const after = new Date().getTime()
  logger.info(
    `${method} URL:${url} STATUS:${ctx.response.status} ORIGIN:${origin} TIME:${
      after - before
    }ms`
  )
}

// 错误处理  中间件
export const errMid = async (ctx: Koa.Context, next: Koa.Next) => {
  try {
    await next() // 等待 业务路由处理  若抛出错误
  } catch (err) {
    logger.error(`ERROR : ${err}`)
    ctx.response.status = 500 // 状态码强制设置为 500
    ctx.body = {
      success: 0,
      errCode: 500,
      data: `${err}`,
    }
  }
}

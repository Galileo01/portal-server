/* eslint-disable new-cap */
import 'module-alias/register'
import koa from 'koa'
import bodyParser from 'koa-bodyparser'
import koaJwt from 'koa-jwt'

import { requestLoggerMid, errMid } from './utils/middleWares'
import { TOKEN_SECRET, JWT_IGNORE_PATH } from './config'

import router from './router'

const app = new koa()

// 转换 解析 post 参数 并注入 ctx.request.body
app.use(bodyParser())

// 添加错误处理中间件
app.use(errMid)

// 添加 日志 中间件
app.use(requestLoggerMid)

// 添加 token 验证 中间件
app.use(
  koaJwt({ secret: TOKEN_SECRET }).unless({
    path: JWT_IGNORE_PATH,
  })
)

// 添加业务 路由
app.use(router.routes()).use(router.allowedMethods())

app.listen(5000, () => {
  console.log('server is running at 5000')
})

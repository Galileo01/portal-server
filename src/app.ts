/* eslint-disable new-cap */

import koa from 'koa'
import bodyParser from 'koa-bodyparser'
import koaJwt from 'koa-jwt'
import koaStatic from 'koa-static'

import './moduleAlias' // 引入路径别名 模块
import { requestLoggerMid, errMid } from './utils/middleWares'
import { TOKEN_SECRET, JWT_IGNORE_PATH } from './config'

import router from './router'

const app = new koa()

// 添加 日志 中间件
app.use(requestLoggerMid)

// 添加错误处理中间件
app.use(errMid)

// 转换 解析 post 参数 并注入 ctx.request.body
app.use(bodyParser())

// 静态资源服务 ，token 验证之前不进行验证
app.use(koaStatic('public'))

// 添加 token 验证 中间件
app.use(
  koaJwt({ secret: TOKEN_SECRET }).unless({
    path: JWT_IGNORE_PATH,
  })
)

// 添加业务 路由
app.use(router.routes()).use(router.allowedMethods())

app.listen(5000, () => {
  console.log('server start running at 5000')
})

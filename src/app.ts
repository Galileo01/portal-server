/* eslint-disable new-cap */
import koa from 'koa'

const app = new koa()

app.use(async (ctx) => {
  ctx.body = 'hello world'
})

app.listen(5000, () => {
  console.log('server is running at 5000')
})

export default app

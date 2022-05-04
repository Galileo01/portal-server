import Router from '@koa/router'

const router = new Router({
  prefix: '/test',
})

router.get('/ping', async (ctx) => {
  const { params } = ctx.query

  ctx.body = {
    test: params,
    timeStamp: new Date().getTime(),
  }
})

export default router

import Router from '@koa/router'

const router = new Router({
  prefix: '/test',
})

router.get('/ping', async (ctx) => {
  ctx.body = {
    success: 1,
    data: {
      test: ctx.query,
      timeStamp: new Date().getTime(),
    },
  }
})

export default router

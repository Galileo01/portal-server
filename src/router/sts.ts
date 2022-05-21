import Router from '@koa/router'

import getCredential from '@/utils/sts'

const router = new Router({
  prefix: '/sts',
})

router.get('/getCredential', async (ctx) => {
  const credential = await getCredential()

  ctx.body = {
    success: credential ? 1 : 0,
    data: credential,
  }
})

export default router

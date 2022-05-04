import Router from '@koa/router'

import getCredential from '@/utils/sts'
import logger from '@/utils/logger'

const router = new Router({
  prefix: '/sts',
})

router.get('/getCredential', async (ctx) => {
  const credential = await getCredential()
  logger.debug(credential)

  ctx.body = {
    success: credential ? 1 : 0,
    data: credential,
  }
})

export default router

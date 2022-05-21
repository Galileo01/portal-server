import Router from '@koa/router'

import knex from '@/utils/kenx'
import { FontFamily } from '@/typings/database'

const router = new Router({
  prefix: '/font',
})

// add  暂时 不写

router.get('/getList', async (ctx) => {
  const fontList = await knex.select().from<FontFamily>('font').orderBy('name')

  ctx.body = {
    success: fontList.length > 0 ? 1 : 0,
    data: fontList,
  }
})

export default router

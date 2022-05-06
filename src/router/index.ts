import Router from '@koa/router'

import test from './test'
import user from './user'
import resource from './resource'
import sts from './sts'
import code from './code'

const router = new Router()

router.use(
  test.routes(),
  user.routes(),
  resource.routes(),
  sts.routes(),
  code.routes()
)

export default router

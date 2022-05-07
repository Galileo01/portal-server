import Router from '@koa/router'

import test from './test'
import user from './user'
import resource from './resource'
import sts from './sts'
import code from './code'
import font from './font'

const router = new Router()

router.use(
  test.routes(),
  user.routes(),
  resource.routes(),
  sts.routes(),
  code.routes(),
  font.routes()
)

export default router

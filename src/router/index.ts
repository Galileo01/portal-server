import Router from '@koa/router'

import test from './test'
import user from './user'
import resource from './resource'

const router = new Router()

router.use(test.routes(), user.routes(), resource.routes())

export default router

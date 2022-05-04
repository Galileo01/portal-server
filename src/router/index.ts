import Router from '@koa/router'

import test from './test'
import user from './user'
import resource from './resource'
import sts from './sts'

const router = new Router()

router.use(test.routes(), user.routes(), resource.routes(), sts.routes())

export default router

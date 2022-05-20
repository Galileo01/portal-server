import Router from '@koa/router'

import { Resource, ResourceList } from '@/typings/database'
import {
  GetByIdQuery,
  GetResourceListQuery,
  OperateResourceData,
  DeleteByIdData,
} from '@/typings/request/resource'
import { UserInCtxState } from '@/typings/common/koa-context'
import knex from '@/utils/kenx'
import { verifyTokenFromAuthorization } from '@/utils/token'
import logger from '@/utils/logger'
import { isNumber } from '@/utils/assert'

const router = new Router({
  prefix: '/resource',
})

router.get('/getById', async (ctx) => {
  const { resourceId, resourceType = 'page' } = ctx.query as GetByIdQuery
  const resources = await knex
    .select()
    .from<Resource>(resourceType)
    .where({ resourceId })

  ctx.body = {
    success: resources.length,
    data: resources[0],
  }
})

// 获取 自己可以获取的 资源列表
/**
 * 1. 已登录 获取 自己创建的资源 + 共享的资源(只有模板能共享)
 * 2. 未登录
 */

const pageBaseColumns = [
  'resourceId',
  'lastModified',
  'title',
  'ownerId',
  'thumbnailUrl',
]
const templateBaseColumns = [...pageBaseColumns, 'type', 'private']

router.get('/getList', async (ctx) => {
  const {
    resourceType = 'page',
    offset,
    limit,
    filter = 'all',
    titleLike,
    order = 'lastModified',
  } = ctx.query as GetResourceListQuery

  const existCountQuery = isNumber(offset) && isNumber(limit) // 存在分页条件

  // 是否包含 用户自己创建的
  const includesOwn =
    resourceType === 'page' || filter === 'all' || filter === 'private'

  const userId =
    ctx.header?.authorization &&
    verifyTokenFromAuthorization(ctx.header?.authorization)

  logger.debug('ctx.query ,tokenUserId', ctx.query, userId)

  let allResourceList: ResourceList = []

  // 由于 路由在jwt 的 忽略列表 中，需要手动解析 该用户的token
  if (includesOwn && userId) {
    const condition = { ownerId: userId }

    const neededColumns =
      resourceType === 'page' ? pageBaseColumns : templateBaseColumns
    const userResourceList = await knex
      .select(...neededColumns)
      .from<Resource>(resourceType)
      .where(condition)
    allResourceList.push(...userResourceList)
    logger.debug('userResourceList', userResourceList.length)
  }

  // 若是 获取 模板 则需要 再获取 获取共享的 模板
  if (resourceType === 'template') {
    let condition: Record<string, unknown> | null = null

    if (filter === 'all') {
      condition = { private: 0 }
    } else if (filter === 'public') {
      condition = { private: 0 }
    } else if (filter === 'platform') {
      condition = { type: 'platform' }
    }

    if (condition) {
      const baseBuilder = knex.from<Resource>('template').where(condition)

      // titleLike 存在添加模糊查询
      if (titleLike) {
        baseBuilder.whereLike('title', `%${titleLike}%`)
      }

      const templates = await baseBuilder.select(...templateBaseColumns)

      allResourceList.push(...templates)
      logger.debug('filter templates', templates.length)
    }
  }

  // 统一 过滤重复
  allResourceList = allResourceList.reduce((preList, curItem) => {
    const include = preList.find(
      (item) => item.resourceId === curItem.resourceId
    )
    return include ? preList : preList.concat(curItem)
  }, [] as ResourceList)

  // 统一排序
  allResourceList.sort((pre, cur) => (pre[order] < cur[order] ? -1 : 1))

  const responseResourceList = existCountQuery
    ? allResourceList.slice(offset, offset + limit + 1)
    : allResourceList

  ctx.body = {
    success: 1,
    data: {
      resourceList: responseResourceList,
      hasMore: allResourceList.length > responseResourceList.length ? 1 : 0,
    },
  }
})

// 发布 + 更新
router.post('/operate', async (ctx) => {
  let success = 0
  let data: unknown = {}

  const { operateType, resourceData } = ctx.request.body as OperateResourceData
  const { resourceType, resourceId, ...otherColumns } = resourceData

  //  发布
  if (operateType === 'publish') {
    const { userId } = ctx.state.user as UserInCtxState
    await knex
      .insert({ ...otherColumns, resourceId, ownerId: userId })
      .into(resourceType)
    success = 1
  }
  // 编辑
  else {
    const affectedRow = await knex(resourceType)
      .update(otherColumns)
      .where({ resourceId })
    success = affectedRow
    if (affectedRow === 0) {
      data = 'resourceId 错误'
    }
  }

  ctx.body = {
    success,
    data,
  }
})

// 删除
router.post('/deleteById', async (ctx) => {
  const { resourceId, resourceType = 'page' } = ctx.request
    .body as DeleteByIdData

  const { userId } = ctx.state.user as UserInCtxState

  const affectedRow = await knex(resourceType).del().where({
    resourceId,
    ownerId: userId, // 只能删除当前用户自己的
  })

  ctx.body = {
    success: affectedRow,
    data: affectedRow === 0 ? 'resourceId 错误' : undefined,
  }
})

export default router

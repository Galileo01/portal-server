import Router from '@koa/router'

import { Resource, ResourceList } from '@/typings/common/resource'
import {
  GetByIdQuery,
  GetResourceListQuery,
  PublishResourceData,
  DeleteByIdData,
} from '@/typings/request/resource'
import { UserInCtxState } from '@/typings/koa/context'
import knex from '@/utils/kenx'
import { verifyToken } from '@/utils/token'
import logger from '@/utils/logger'

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
    data: {
      resources: resources[0],
    },
  }
})

// 获取 自己可以获取的 资源列表
/**
 * 1. 已登录 获取 自己创建的资源 + 共享的资源(只有模板能共享)
 * 2. 未登录
 */

const pageBaseColumns = ['resourceId', 'title', 'ownerId', 'thumbnailUrl']
const templateBaseCOlumns = [...pageBaseColumns, 'type', 'private']

router.get('/getList', async (ctx) => {
  const { resourceType = 'page' } = ctx.query as GetResourceListQuery

  const resourceList: ResourceList = []

  // 由于 路由在jwt 的 忽略列表 中，需要手动解析 该用户的token
  if (ctx.header?.authorization) {
    try {
      const { userId } = verifyToken(
        ctx.header?.authorization?.slice(7) || ''
      ) as {
        userId: string
      }
      const condition = { ownerId: userId }
      const neededColumns =
        resourceType === 'page' ? pageBaseColumns : templateBaseCOlumns
      const userResourceList = await knex
        .select(...neededColumns)
        .from<Resource>(resourceType)
        .where(condition)
        .orderBy('lastModified', 'desc') // 按照时间戳降序排列
      resourceList.push(...userResourceList)
    } catch (err) {
      logger.error(`ERROR : ${err}`)
    }
  }

  // 若是 获取 模板 则需要 再获取 获取共享的 模板
  if (resourceType === 'template') {
    const condition = { private: 0 }
    const templates = await knex
      .select(...templateBaseCOlumns)
      .from<Resource>('template')
      .where(condition)
      .orderBy('lastModified', 'desc') // 按照时间戳降序排列
    resourceList.push(...templates)
  }

  ctx.body = {
    success: 0,
    data: {
      resourceList,
    },
  }
})

// 发布 + 更新
router.post('/publish', async (ctx) => {
  let success = 0
  let data: Record<string, unknown> = {}

  const { operateType, resourceData } = ctx.request.body as PublishResourceData
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
      data = {
        message: 'resourceId 错误',
      }
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
  const affectedRow = await knex(resourceType).del().where({
    resourceId,
  })

  ctx.body = {
    success: affectedRow,
    data: {
      message: affectedRow === 0 ? 'resourceId 错误' : undefined,
    },
  }
})

export default router

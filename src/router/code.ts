import Router from '@koa/router'
import fs from 'fs-extra'
import child_process from 'child_process'

import { IS_DEV } from '@/constant/env'
import { Resource } from '@/typings/database'
import { CodeOutputData } from '@/typings/request/code'
import knex from '@/utils/kenx'
import logger from '@/utils/logger'

const router = new Router({
  prefix: '/code',
})

const basePath = 'public/output_code'
const tempResourceDataJsonPath = `${basePath}/temp-resource-data.json`
const outputCodeScriptPath = 'src/script/output-code.mjs'

// 出码能力
// FIXME: 添加新页面 的处理逻辑，改为POST方法，接受配置字符串
// TODO:设置 自动任务 自动删除zip文件
router.post('/output', async (ctx) => {
  const {
    pageId,
    type = 'src_code',
    pageConfig,
  } = ctx.request.body as CodeOutputData

  let resourceData = pageConfig

  // 如果 pageConfig 字段为空则从数据库查询
  if (!resourceData) {
    const pages = await knex
      .select()
      .from<Resource>('page')
      .where({ resourceId: pageId })

    if (pages.length === 0) {
      ctx.body = {
        success: 0,
        data: 'pageId dont`t existed',
      }
      return
    }
    resourceData = JSON.stringify(pages[0])
  }

  const before = new Date().getTime()

  // 保证 目录存在 ,不存在则创建
  await fs.ensureDir(basePath)

  // 写入 json配置 文件
  fs.writeFileSync(tempResourceDataJsonPath, resourceData)

  const cmd = `${outputCodeScriptPath} --pageId ${pageId} --type ${type} --env ${
    IS_DEV ? 'dev' : 'prod'
  }`

  logger.debug('outputCodeScript cmd', cmd)

  // 同步执行 打包脚本 NOTE: 等待 打包真正完成 在返回数据
  await child_process.execSync(cmd)

  const after = new Date().getTime()
  const costTime = after - before
  ctx.body = {
    success: 1,
    data: {
      zipName: `${pageId}.zip`,
      costTime,
    },
  }

  logger.debug('output costTime', costTime)
})

export default router

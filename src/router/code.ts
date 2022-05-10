import Router from '@koa/router'
import fs from 'fs-extra'
import child_process from 'child_process'

import { IS_DEV } from '@/constant/env'
import { Resource } from '@/typings/database'
import { CodeOutputQuery } from '@/typings/request/code'
import knex from '@/utils/kenx'
import logger from '@/utils/logger'

const router = new Router({
  prefix: '/code',
})

const basePath = 'public/output_code'
const tempResourceDataJsonPath = `${basePath}/temp-resource-data.json`
const outputCodeScriptPath = 'src/script/output-code.mjs'

// 出码能力
router.get('/output', async (ctx) => {
  const { pageId, type = 'src_code' } = ctx.query as CodeOutputQuery
  const before = new Date().getTime()
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

  // 保证 目录存在 ,不存在则创建
  await fs.ensureDir(basePath)

  // 写入 json配置 文件
  await fs.writeJSON(tempResourceDataJsonPath, pages[0])

  const cmd = `${outputCodeScriptPath} --pageId ${pageId} --type ${type} --env ${
    IS_DEV ? 'prod' : 'prod'
  }`
  logger.debug('outputCodeScript cmd', cmd)

  // 同步执行 打包脚本 NOTE: 等待 打包真正完成 在返回数据
  await child_process.execSync(cmd)

  const after = new Date().getTime()
  ctx.body = {
    success: 1,
    data: {
      zipPath: `/output_code/${pageId}.zip`,
      costTime: after - before,
    },
  }
})

// 前端 监听zip 下载进度 下载完成 通知server 删除压缩包
router.post('/download_finish', async (ctx) => {
  const { pageId } = ctx.request.body as { pageId: string }
  // 删除 对应的 压缩包
  await fs.remove(`${basePath}/${pageId}.zip`)

  ctx.body = {
    success: 1,
  }
})

export default router

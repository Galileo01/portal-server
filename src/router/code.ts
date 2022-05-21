import Router from '@koa/router'
import fs from 'fs-extra'
import child_process from 'child_process'

import { IS_DEV } from '@/constant/env'
import { Resource, FontFamily } from '@/typings/database'
import { CodeOutputData, NeededPageConfig } from '@/typings/request/code'
import knex from '@/utils/kenx'
import logger from '@/utils/logger'
import { safeJsonParse } from '@/utils'

const router = new Router({
  prefix: '/code',
})

const basePath = 'public/output_code'
const tempConfigDataJsonPath = `${basePath}/temp-config-data.json`
const outputCodeScriptPath = 'src/script/output-code.mjs'

// 出码能力
router.post('/output', async (ctx) => {
  const {
    pageId,
    type = 'src_code',
    pageConfig,
  } = ctx.request.body as CodeOutputData

  const before = new Date().getTime()

  let configData

  // 如果 pageConfig 字段为空则从数据库查询
  if (pageConfig) {
    configData = safeJsonParse<NeededPageConfig>(pageConfig)
  } else {
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
    configData = safeJsonParse<NeededPageConfig>(pages[0].config)
  }
  const { fontConfig } = configData?.globalConfig || {}

  // 替换 字体配置为直接可恢复的 格式
  if (fontConfig) {
    // 获取全量的字体列表
    const fontList = await knex
      .select()
      .from<FontFamily>('font')
      .orderBy('name')

    const usedFontName = fontConfig.usedFont?.map((item) => item[1]) || []
    const usedFont = fontList.filter(
      (font) => font.src && usedFontName.includes(font.name)
    )
    // 替换 globalFont
    // @ts-ignore
    // eslint-disable-next-line prefer-destructuring
    configData?.globalConfig?.fontConfig.globalFont = fontConfig.globalFont[1]
    // 替换 usedFont
    // @ts-ignore
    configData?.globalConfig?.fontConfig?.usedFont = usedFont
  }

  // 保证 目录存在 ,不存在则创建
  await fs.ensureDir(basePath)

  // 写入 json配置 文件
  fs.writeJsonSync(tempConfigDataJsonPath, configData)

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

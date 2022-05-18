import schedule from 'node-schedule'
import child_process from 'child_process'

import logger from './utils/logger'

// 定义规则
const rule = new schedule.RecurrenceRule()

// 每天 0 点执行 压缩包清空
rule.hour = 0
rule.minute = 0
rule.second = 0

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const job = schedule.scheduleJob(rule, () => {
  const path = 'public/output_code/*'
  child_process.exec(`rm ${path}`)
  logger.info('schedule', 'run rm cmd ')
})

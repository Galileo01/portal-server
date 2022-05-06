import log4js from 'log4js'

import { IS_DEV } from '../constant'

const logFile = IS_DEV ? './logs_dev/server.log' : './logs/server.log'

log4js.configure({
  appenders: {
    out: { type: 'stdout' }, // 设置是否在控制台打印日志
    info: { type: 'file', filename: logFile },
  },
  categories: {
    default: { appenders: ['out', 'info'], level: 'debug' }, // 去掉'out'。控制台不打印日志
  },
})

const logger = log4js.getLogger()

export default logger

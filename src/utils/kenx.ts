import knex from 'knex'

import MYSQL_CONFIG from '@/config/mysql'
import { IS_DEV } from '@/constant'

import logger from './logger'

logger.info('connect mysql server , host: ', MYSQL_CONFIG.host)

export default knex({
  client: 'mysql',
  connection: MYSQL_CONFIG,
  debug: IS_DEV,
  pool: {
    // @ts-ignore
    afterCreate: (connect, done) => {
      done(null, connect)
      logger.info('aquires a new connection')
    },
  },
  log: {
    warn(message) {
      logger.warn(message)
    },
    error(message) {
      logger.error(message)
    },
    deprecate(message) {
      logger.info(message)
    },
    debug(message) {
      logger.debug(message)
    },
  },
})

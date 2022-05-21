import { nanoid } from 'nanoid'

import { NANO_ID_LENGTH } from '@/constant'

import logger from './logger'

export const getUniqueId = (preFix?: string) => {
  const id = nanoid(NANO_ID_LENGTH)
  return preFix ? `${preFix}_${id}` : id
}

export const safeJsonParse = <T = unknown>(str: string, defaultValue?: T) => {
  try {
    return JSON.parse(str) as T
  } catch (err) {
    logger.error('safeJsonParse failed err:', err)
    return defaultValue
  }
}

import { nanoid } from 'nanoid'

import { NANO_ID_LENGTH } from '@/constant'

export const getUniqueId = (preFix?: string) => {
  const id = nanoid(NANO_ID_LENGTH)
  return preFix ? `${preFix}_${id}` : id
}

export default getUniqueId

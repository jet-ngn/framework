import { nanoid } from 'nanoid'

export function createID ({ prefix, postfix } = {}) {
  return `${prefix ? `${prefix}_` : ''}${nanoid()}${postfix ? `_${postfix}` : ''}`
}
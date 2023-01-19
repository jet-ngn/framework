import { nanoid } from 'nanoid'

export function createId ({ prefix, postfix } = {}) {
  return `${prefix ? `${prefix}_` : ''}${nanoid()}${postfix ? `_${postfix}` : ''}`
}
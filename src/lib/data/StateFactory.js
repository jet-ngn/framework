import { registerState } from './DataRegistry'

export default class StateFactory {
  constructor (data, config) {
    return registerState(...arguments)
  }
}
import { registerState } from './DataRegistry'

export default class State {
  constructor (data, config = null) {
    return registerState(...arguments)
  }
}
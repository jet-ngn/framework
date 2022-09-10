import { createID } from './utilities/IDUtils'

export default class IdentifiedClass {
  #id

  constructor (prefix = null) {
    this.#id = createID({ prefix })
  }

  get id () {
    return this.#id
  }
}
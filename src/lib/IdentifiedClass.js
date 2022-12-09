import { createId } from '../utilities/IDUtils'

export default class IdentifiedClass {
  #id

  constructor (prefix = null) {
    this.#id = createId({ prefix })
  }

  get id () {
    return this.#id
  }
}
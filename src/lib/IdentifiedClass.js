import Utilities from './Utilities'

export default class IdentifiedClass {
  #id

  constructor (prefix = null) {
    this.#id = Utilities.createId({ prefix })
  }

  get id () {
    return this.#id
  }
}
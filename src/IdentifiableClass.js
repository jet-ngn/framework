let id = 0

export default class IdentifiableClass {
  #id

  constructor (prefix) {
    this.#id = `${prefix}_${id++}`
  }

  get id () {
    return this.#id
  }
}
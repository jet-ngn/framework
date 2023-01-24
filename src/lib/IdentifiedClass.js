export default class IdentifiedClass {
  #id

  constructor (prefix = null) {
    this.#id = `${prefix}_${crypto.randomUUID()}`
  }

  get id () {
    return this.#id
  }
}
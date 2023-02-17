export default class Template {
  #strings
  #interpolations

  constructor (strings, interpolations) {
    this.#strings = [...strings]
    this.#interpolations = [...interpolations]
  }

  get interpolations () {
    return this.#interpolations
  }

  get strings () {
    return this.#strings
  }
}
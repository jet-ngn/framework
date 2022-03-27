export default class Template {
  #type
  #strings
  #interpolations

  constructor ({ type, strings, interpolations }) {
    this.#type = type
    this.#strings = strings
    this.#interpolations = interpolations
  }

  get interpolations () {
    return this.#interpolations
  }

  get strings () {
    return this.#strings
  }

  get type () {
    return this.#type
  }
}
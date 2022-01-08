export default class Tag {
  #type
  #strings
  #interpolations

  constructor ({ type, strings, interpolations }) {
    this.#type = type
    this.#strings = strings
    this.#interpolations = interpolations
  }

  parse () {
    console.log('PARSE')
  }

  get type () {
    return this.#type
  }

  get strings () {
    return [...this.#strings]
  }

  get interpolations () {
    return [...this.#interpolations]
  }
}

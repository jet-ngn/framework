export default class Tag {
  #type
  #strings
  #interpolations

  constructor ({ type, strings, interpolations }) {
    this.#type = type
    this.#strings = strings
    this.#interpolations = interpolations
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

  // append (tag) {
  //   return new Tag({
  //     type: this.type,
  //     strings: [...this.strings, ...tag.strings],
  //     interpolations: [...this.interpolations, ...tag.interpolations]
  //   })
  // }
}

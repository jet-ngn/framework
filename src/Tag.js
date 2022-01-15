export default class Tag {
  #type
  #template
  #interpolations

  constructor ({ type, template, interpolations }) {
    this.#type = type
    this.#template = template
    this.#interpolations = interpolations
  }

  get type () {
    return this.#type
  }

  get template () {
    return [...this.#template]
  }

  get interpolations () {
    return [...this.#interpolations]
  }
}

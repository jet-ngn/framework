function tag (type, strings, ...interpolations) {
  return new Tag({ type, strings, interpolations })
}

export function css () {
  return tag('css', ...arguments)
}

export function html () {
  return tag('html', ...arguments)
}

export function markdown () {
  return tag('markdown', ...arguments)
}

export function svg () {
  return tag('svg', ...arguments)
}

export class Tag {
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
}
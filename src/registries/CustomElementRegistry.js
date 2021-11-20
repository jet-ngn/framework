class CustomElementRegistry {
  #elements = {}

  get elements () {
    return this.#elements
  }

  add (tag, definition) {
    if (this.has(tag)) {
      throw new Error(`Custom Element "${tag}" has already been defined`)
    }

    this.#elements[tag] = definition
  }

  get (tag) {
    return this.#elements[tag]
  }

  has (tag) {
    return this.#elements.hasOwnProperty(tag)
  }
}

export default new CustomElementRegistry()
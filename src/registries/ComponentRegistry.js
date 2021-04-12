class ComponentRegistry {
  #components = {}

  get components () {
    return this.#components
  }

  add (tag, definition) {
    if (this.has(tag)) {
      throw new Error(`Component "${tag}" has already been defined`)
    }

    this.#components[tag] = definition
  }

  get (tag) {
    return this.#components[tag]
  }

  has (tag) {
    return this.#components.hasOwnProperty(tag)
  }
}

export default new ComponentRegistry()
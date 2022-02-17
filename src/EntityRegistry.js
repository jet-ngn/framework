class EntityRegistry {
  #entities = {}

  get entities () {
    return this.#entities
  }

  add (entity) {
    this.#entities[entity.name] = entity
  }
}

export default new EntityRegistry
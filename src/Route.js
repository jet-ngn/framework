export default class Route {
  #parent
  #path
  #view
  #middleware

  constructor (path, config, parent) {
    this.#path = path
    this.#parent = parent ?? null
    this.#view = config.view ?? config
  }

  get middleware () {
    return this.#middleware
  }

  get parent () {
    return this.#parent
  }

  get path () {
    return this.#path
  }

  get view () {
    return this.#view
  }
}
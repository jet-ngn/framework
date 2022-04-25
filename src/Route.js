export default class Route {
  #path
  #config
  #middleware

  constructor (path, config) {
    this.#path = path
    this.#config = config.config ?? config
    this.#middleware = config.middleware ?? null
  }

  get config () {
    return this.#config
  }

  get middleware () {
    return this.#middleware
  }

  get path () {
    return this.#path
  }
}
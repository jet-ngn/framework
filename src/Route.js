export default class Route {
  #hash
  #path
  #props
  #query
  #viewConfig

  constructor (path, config, props) {
    this.#path = path
    this.#props = props ?? {}
    this.#viewConfig = config.view ?? config
  }

  get hash () {
    return this.#hash
  }

  get path () {
    return this.#path
  }

  get props () {
    return this.#props
  }

  get query () {
    return this.#query
  }

  get viewConfig () {
    return this.#viewConfig
  }
}
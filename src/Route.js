export default class Route {
  #parent
  #hash
  #path
  #props
  #query
  #viewConfig

  constructor (parent, path, config, props) {
    this.#parent = parent
    this.#path = path
    this.#props = props ?? {}
    this.#viewConfig = config.view ?? config
  }

  get hash () {
    return this.#hash
  }

  get parent () {
    return this.#parent
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

  get root () {
    return this.#parent.root
  }

  get viewConfig () {
    return this.#viewConfig
  }
}
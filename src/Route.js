import { parseSearch } from './utilities/RouteUtils'

export default class Route {
  #hash
  #path
  #query
  #config

  constructor (url, config) {
    this.#config = config ?? null
    this.#hash = url.hash ?? null
    this.#path = url.pathname ?? null
    this.#query = parseSearch(url.search)

  }

  get config () {
    return this.#config
  }

  get hash () {
    return this.#hash
  }

  get path () {
    return this.#path
  }

  get query () {
    return this.#query
  }
}
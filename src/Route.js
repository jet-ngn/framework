import { parseSearch } from './utilities/RouteUtils'

export default class Route {
  #hash
  #path
  #props
  #query

  constructor ({ url, props }) {
    this.#hash = url.hash ?? null
    this.#path = url.pathname ?? null
    this.#props = props
    this.#query = parseSearch(url.search)
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
}
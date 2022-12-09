export default class Route {
  #hash
  #path
  #vars
  #query

  constructor ({ url, vars }) {
    this.#hash = url.hash ?? null
    this.#path = url.pathname ?? null
    this.#vars = vars
    this.#query = parseSearch(url.search)
  }

  get hash () {
    return this.#hash
  }

  get path () {
    return this.#path
  }

  get vars () {
    return this.#vars
  }

  get query () {
    return this.#query
  }
}

function parseSearch (search) {
  return search
}
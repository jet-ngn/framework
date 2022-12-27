import { getRouteSlugs } from './utilities'

export default class Route {
  #hash
  #parent
  #path
  #vars
  #query

  constructor (parent = null, { url, vars }) {
    this.#hash = url.hash ?? null
    this.#parent = parent?.route ?? null
    this.#path = url.pathname ?? null
    this.#vars = vars
    this.#query = parseSearch(url.search)
  }

  get fullPath () {
    return `${this.#parent?.fullPath ?? ''}${this.#path}`
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

  matches (path) {
    const ref = getRouteSlugs(this.fullPath)
    const slugs = getRouteSlugs(path)
    return slugs.length === ref.length && slugs.every((entry, i) => slugs[i] === entry)
  }
}

function parseSearch (search) {
  return search
}
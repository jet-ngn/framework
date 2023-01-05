import { Path } from '../../env'
import { getRouteSlugs, getScore } from './Router'

export default class Route {
  #slugs
  #url
  #value
  #view

  constructor (path, view) {
    this.#url = new URL(path.trim(), Path.base.toString())
    this.#view = view
    this.#slugs = getRouteSlugs(this.#url.pathname)
    this.#value = getScore(this.#slugs)
  }

  get path () {
    return this.#url.pathname
  }

  get slugs () {
    return this.#slugs
  }

  get value () {
    return this.#value
  }

  get view () {
    return this.#view
  }
}
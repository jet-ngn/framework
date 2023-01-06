import { Path } from '../../env'
import { getRouteSlugs, getScore } from './RouteManager'

export default class Route {
  #slugs
  #url
  #value
  #config

  constructor (path, config) {
    this.#config = config
    this.#url = new URL(path.trim(), Path.base.toString())
    this.#slugs = getRouteSlugs(this.#url.pathname)
    this.#value = getScore(this.#slugs)
  }

  get config () {
    return this.#config
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
}
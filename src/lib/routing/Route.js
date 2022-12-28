import { getRouteSlugs } from './utilities'
import { PATH } from '../../env'

export default class Route {
  #base
  #hash
  #path
  #parent
  #vars
  #query

  constructor (parent = null, { url, vars }) {
    this.#base = url.base
    this.#hash = url.hash ?? null
    this.#parent = parent?.route
    this.#path = url.pathname ?? null
    this.#vars = vars
    this.#query = parseSearch(url.search)
  }

  get hash () {
    return this.#hash
  }

  get path () {
    const parent = this.#parent?.path ?? ''
    return `${parent === '/' ? '' : parent}${this.#path ?? ''}`
  }

  get vars () {
    return this.#vars
  }

  get query () {
    return this.#query
  }

  matches (path) {
    const ref = getRouteSlugs(this.path)
    const slugs = getRouteSlugs(path)
    return slugs.length === ref.length && slugs.every((entry, i) => slugs[i] === entry)
  }

  update () {
    const ref = getRouteSlugs(this.path)
    const slugs = getRouteSlugs(PATH.current)

    for (let [index, slug] of ref.entries()) {
      if (slug.startsWith(':')) {
        this.#vars[slug.substring(1)] = slugs[index]
      }
    }
  }
}

function parseSearch (search) {
  return search
}
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

// export default class Route extends View {
//   #hash
//   #path
//   #parent
//   #vars
//   #query

//   constructor (path, config) {
//     this.#base = url.base ?? null
//     this.#hash = url.hash ?? null
//     this.#parent = parent?.route
//     this.#path = url.pathname ?? null
//     this.#vars = vars ?? {}
//     this.#query = parseSearch(url.search)
//   }

//   get hash () {
//     return this.#hash
//   }

//   get absolutePath () {
//     const parent = this.#parent?.path ?? ''
//     return `${parent === '/' ? '' : parent}${this.#path ?? ''}`
//   }

//   get relativePath () {
//     return this.#path
//   }

//   get vars () {
//     return this.#vars
//   }

//   get query () {
//     return this.#query
//   }

//   matches (path) {
//     const ref = getRouteSlugs(this.path)
//     const slugs = getRouteSlugs(path)
//     return slugs.length === ref.length && slugs.every((entry, i) => slugs[i] === entry)
//   }

//   update () {
//     const ref = getRouteSlugs(this.path)
//     const slugs = getRouteSlugs(PATH.current)

//     for (let [index, slug] of ref.entries()) {
//       if (slug.startsWith(':')) {
//         this.#vars[slug.substring(1)] = slugs[index]
//       }
//     }
//   }
// }

// function parseSearch (search) {
//   return search
// }
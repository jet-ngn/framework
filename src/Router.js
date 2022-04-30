import JetClass from './JetClass.js'
import Route from './Route'

function combinePaths (...paths) {
  const chunks = paths.map(removeSlashes).filter(Boolean)
  return `/${chunks.join('/')}`
}

function getSlugs (path) {
  return removeSlashes(path).split('/').filter(Boolean)
}

function removeSlashes (path) {
  return path.replace(/^\/+|\/+$/g, '')
}

export default class Router extends JetClass {
  #baseURL
  #view
  #root
  #routes = {}
  // TODO: Use this property to keep track of which route is currently active
  // This way, if it changes, the views attached to this route can be unmounted
  // before the new ones are mounted
  #current = null

  constructor (view, root, routes, baseURL) {
    super()
    this.#baseURL = baseURL ?? ''
    this.#view = view
    this.#root = root ?? view.root
    this.#processRoutes(routes, this.#routes)
  }

  get view () {
    return this.#view
  }

  get root () {
    return this.#root
  }

  get routes () {
    return this.#routes
  }

  add (config) {
    this.#routes = { ...this.#routes, ...config }
  }

  get (name) {
    return this.#routes[name]
  }

  match (path) {
    const pathSlugs = getSlugs(combinePaths(path.trim()))
    let remaining = []

    if (pathSlugs.length === 0) {
      return { route: this.#routes['/'], remaining }
    }

    const output = { route: null, remaining }
    let bestScore = 0

    Object.keys(this.#routes).forEach(route => {
      const routeSlugs = getSlugs(route)
      let scores = new Array(routeSlugs.length).fill(0)
      let neededScore = routeSlugs.reduce((result, slug) => result += slug.startsWith(':') ? 1 : 2, 0)

      // ENHANCEMENT: This may reduce calculations when there are a lot of routes
      // if (neededScore < bestScore) {
      //   return
      // }
      
      pathSlugs.forEach((pathSlug, i) => {
        const routeSlug = routeSlugs[i]

        if (scores.length >= i + 1) {
          scores[i] = pathSlug === routeSlug ? 2 : routeSlug?.startsWith(':') ? 1 : 0
        }
      })

      let remainingSlugs = pathSlugs.slice(routeSlugs.length)

      const finalScore = scores.reduce((result, score) => result += score, 0) - remainingSlugs.length

      if (finalScore === neededScore && finalScore > bestScore) {
        bestScore = finalScore
        output.route = this.#routes[route]
        remaining = remainingSlugs
      }
    })

    return output
  }

  #processRoutes (routes = {}, parent) {
    Object.keys(routes).forEach(path => this.#processRoute(path, routes[path], parent))
  }

  #processRoute (path, config, parent) {
    const number = parseInt(path)
    const route = new Route(isNaN(parseInt(number)) ? combinePaths(this.#baseURL.pathname, path) : number, config, parent)
    parent[route.path] = route

    const { routes } = config
    this.#processRoutes(routes, route)
  }
}
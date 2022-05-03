import JetClass from './JetClass.js'
import RouterRegistry from './RouterRegistry.js'
import Route from './Route'

export default class Router extends JetClass {
  #baseURL
  #view
  // #root
  #routes = {}
  // TODO: Use this property to keep track of which route is currently active
  // This way, if it changes, the views attached to this route can be unmounted
  // before the new ones are mounted
  current = null

  constructor (view, routes, baseURL) {
    super()
    this.#baseURL = baseURL ?? ''
    this.#view = view
    // this.#root = view.root
    this.#processRoutes(routes, this.#routes)
  }

  get view () {
    return this.#view
  }

  // get root () {
  //   return this.#root
  // }

  get routes () {
    return this.#routes
  }

  add (config) {
    this.#routes = { ...this.#routes, ...config }
  }

  get (name) {
    const config = this.#routes[name]
    return config ? new Route(this.#view, name, config) : null
  }

  match (path) {
    const pathSlugs = RouterRegistry.getSlugs(RouterRegistry.combinePaths(path.trim()))

    if (pathSlugs.length === 0) {
      return { route: this.get('/'), remaining: '' }
    }

    let output = { route: null, remaining: '' }
    let bestScore = 0

    Object.keys(this.#routes).forEach(route => {
      const routeSlugs = RouterRegistry.getSlugs(route)
      const scores = new Array(routeSlugs.length).fill(0)
      const neededScore = routeSlugs.reduce((result, slug) => result += slug.startsWith(':') ? 1 : 2, 0)
      const props = {}

      if (neededScore < bestScore) {
        return
      }
      
      pathSlugs.forEach((pathSlug, i) => {
        const routeSlug = routeSlugs[i]

        if (scores.length >= i + 1) {
          if (routeSlug?.startsWith(':')) {
            scores[i] = 1
            props[routeSlug.substring(1)] = pathSlug
          } else {
            scores[i] = pathSlug === routeSlug ? 2 : 0
          }
        }
      })

      const finalScore = scores.reduce((result, score) => result += score, 0)
      
      if (finalScore === neededScore && finalScore > bestScore) {
        bestScore = finalScore
        output.route = new Route(this.#view, route, this.#routes[route], props)
        let remainingSlugs = pathSlugs.slice(routeSlugs.length)
        output.remaining = remainingSlugs.length === 0 ? '' : `/${remainingSlugs.join('/')}`
      }
    })

    return output
  }

  #processRoutes (routes = {}, parent) {
    Object.keys(routes).forEach(path => this.#processRoute(path, routes[path], parent))
  }

  #processRoute (path, config, parent) {
    const number = parseInt(path)
    parent[path === 'default' ? path : isNaN(number) ? RouterRegistry.combinePaths(this.#baseURL.pathname, path) : number] = config

    // const { routes } = config
    // this.#processRoutes(routes, route)
  }
}
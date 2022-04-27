import Route from './Route'
import DefaultRoutes from './lib/routes.js'

export default class RouteManager {
  #base
  #routes = {}

  constructor (routes, base) {
    this.#base = base ?? ''
    Object.keys(routes ?? {}).forEach(path => this.#processRoute(path, routes[path]))
  }

  get baseURL () {
    return this.#base.toString()
  }

  get length () {
    return Object.keys(this.#routes).length
  }

  add (config) {
    this.#routes = { ...this.#routes, ...config }
  }

  get (name) {
    return this.#routes[name]
  }

  match (path) {
    path = this.#combinePaths(path)
    const route = this.#routes[path]
    return route?.config ?? this.#dynamicMatch(path)
  }

  #combinePaths (...paths) {
    const chunks = paths.map(this.#removeSlashes).filter(Boolean)
    return `/${chunks.join('/')}`
  }

  #dynamicMatch (path) {
    const slugs = this.#getSlugs(path)
    
    const match = Object.keys(this.#routes).reduce((result, route) => {
      const routeSlugs = this.#getSlugs(route)

      if (slugs.length === routeSlugs.length) {
        result = routeSlugs.every((slug, index) => slug === slugs[index] || slug.startsWith(':')) ? this.#routes[route] : result
      }
      
      return result
    }, null)

    return match?.config ?? this.get(404) ?? DefaultRoutes[404]
  }

  #getSlugs (path) {
    return this.#removeSlashes(path).split('/').filter(Boolean)
  }

  #processRoute (path, config) {
    const route = new Route(this.#combinePaths(this.#base.pathname, path), config)
    this.#routes[route.path] = route

    const { routes } = config
    Object.keys(routes ?? {}).forEach(child => this.#processRoute(this.#combinePaths(path, child), routes[child]))
  }

  #removeSlashes (path) {
    return path.replace(/^\/+|\/+$/g, '')
  }
}
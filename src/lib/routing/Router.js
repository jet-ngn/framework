import Route from './Route'

export default class Router {
  #element
  #routes

  constructor ({ element, routes }) {
    this.#element = element

    this.#routes = Object.keys(routes).map(route => new Route(route, routes[route])).sort((a,b) => {
      const slugs = {
        a: getRouteSlugs(a.path),
        b: getRouteSlugs(b.path)
      }
      
      if (slugs.a.length > slugs.b.length) {
        return -1
      }

      return 1
    })
  }

  get element () {
    return this.#element
  }

  getViewConfig (path, stats) {
    const slugs = getRouteSlugs(stats.remaining ?? '')
    let match = null

    if (slugs.length === 0) {
      match = this.#routes.find(({ path }) => path === '/') ?? null
    } else {
      for (const route of this.#routes) {
        if (route.matches(slugs)) {
          match = route          
          break
        }
      }
    }

    if (match) {
      stats.matched = match.path
      const remaining = (stats.remaining ?? '').replace(stats.matched, '')
      stats.remaining = remaining === '' ? null : remaining
    }

    return match?.viewConfig ?? null
  }
}

export function getRouteSlugs (path) {
  return path?.trim().split('/').filter(Boolean) ?? []
}

export function getScore (slugs) {
  return slugs.reduce((score, slug) => score += slug.startsWith(':') ? 1 : 2, 0)
}
import View from '../rendering/View'
import Route from './Route'

export default class Router {
  #routes

  constructor ({ parentView, element, routes }) {
    this.#routes = Object.keys(routes)
      .map(route => new Route(route, new View({ parent: parentView, element, config: routes[route] })))
      .sort((a,b) => {
        if (a.slugs.length === b.slugs.length) {
          return a.value > b.value ? -1 : a.value === b.value ? 0 : 1
        }

        return a.slugs.length > b.slugs.length ? -1 : 1
      })
  }

  getView (path) {
    return this.#getMatchingRoute(path)?.view ?? null
  }

  #getMatchingRoute (path) {
    const slugs = getRouteSlugs(path.remaining ?? '')

    if (slugs.length === 0) {
      path.matched = '/'
      path.remaining = null
      return this.#routes.find(({ path }) => path === '/') ?? null
    }

    for (const route of this.#routes.filter(({ path }) => path !== '/')) {
      if (route.matches(slugs, path)) {
        return route
      }
    }
  }
}

export function getRouteSlugs (path) {
  return path?.trim().split('/').filter(Boolean) ?? []
}

export function getScore (slugs) {
  return slugs.reduce((score, slug) => score += slug.startsWith(':') ? 1 : 2, 0)
}
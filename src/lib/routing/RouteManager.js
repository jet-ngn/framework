import { PATH } from '../../env'

export default class RouteManager {
  #routes

  constructor (routes = {}) {
    this.#routes = parseRoutes(routes)
  }

  get routes () {
    return this.#routes
  }

  get matched () {
    const minimum = PATH.remaining.length

    if (minimum === 0) {
      const defaultRoute = this.#routes['/'] ?? null
      
      return defaultRoute ? {
        ...defaultRoute,
        vars: {}
      } : null
    }

    let match = null
    let current = 0
    const routes = Object.values(this.#routes).filter(({ value }) => value >= minimum)

    for (let route of routes) {
      const { slugs, value } = route
      const scores = new Array(slugs.length).fill(0)
      const vars = {}

      if (value < current) {
        continue
      }

      for (let [i, slug] of PATH.remaining.entries()) {
        const routeSlug = slugs[i]
        
        if (!routeSlug) {
          break
        }

        if (routeSlug.startsWith(':')) {
          scores[i] = 1
          vars[routeSlug.substring(1)] = slug
        } else {
          scores[i] = routeSlug === slug ? 2 : 0
        }
      }
      
      const finalScore = getScore(scores)

      if (finalScore === value && finalScore > current) {
        current = finalScore

        match = {
          ...route,
          vars
        }
      }
    }

    PATH.remaining = PATH.remaining.slice(match?.slugs.length ?? 0)
    return match
  }
}

function getScore (slugs) {
  return slugs.reduce((total, slug) => {
    return total + (
      typeof slug === 'number'
        ? slug
        : slug.startsWith(':')
          ? 1 
          : 2
    )
  }, 0)
}

function parseRoutes (routes) {
  return Object.keys(routes).reduce((result, route) => {
    route = route.trim()
    const url = new URL(route, PATH.base)
    const slugs = url.pathname.split('/').filter(Boolean)

    return {
      ...(result ?? {}),
      [route]: {
        url,
        slugs,
        value: getScore(slugs),
        config: routes[route]
      }
    }
  }, {})
}